import { format, startOfDay, subDays, differenceInMinutes, eachDayOfInterval, isSameDay } from "date-fns";

import { db } from "@/lib/db";

// ── Shared Streaks ────────────────────────────────────────────────────────────
export function calculateStudyStreak(reviewDates: Date[]) {
  const reviewDays = new Set(reviewDates.map((date) => format(startOfDay(date), "yyyy-MM-dd")));

  let streak = 0;
  let cursor = startOfDay(new Date());

  while (reviewDays.has(format(cursor, "yyyy-MM-dd"))) {
    streak += 1;
    cursor = subDays(cursor, 1);
  }

  return streak;
}

export async function getDueCount() {
  return db.card.count({
    where: {
      nextReviewAt: {
        lte: new Date(),
      },
      status: {
        not: "NEW"
      }
    },
  });
}

// ── Types ─────────────────────────────────────────────────────────────────────
export type HeatmapData = {
  date: string;
  count: number;
};

export type RecentSession = {
  id: string;
  deckId: string;
  deckTitle: string;
  emoji: string;
  date: Date;
  cardsStudied: number;
  accuracy: number;
  durationMin: number;
};

// ── Complex Overviews calculations ───────────────────────────────────────────
export async function getDashboardData() {
  const [
    cardsDueToday, 
    totalMastered, 
    totalCards, 
    totalCardsStudiedOnce, 
    rawLogs, 
    decks
  ] = await Promise.all([
    getDueCount(),
    db.card.count({ where: { status: "MASTERED" } }),
    db.card.count(),
    db.card.count({ where: { status: { not: "NEW" } } }),
    db.reviewLog.findMany({
      orderBy: { reviewedAt: "desc" },
      include: {
        deck: {
          select: { title: true, emoji: true }
        }
      }
    }),
    db.deck.findMany({
      select: {
        id: true,
        title: true,
        emoji: true,
        cardCount: true,
        lastStudiedAt: true,
        createdAt: true,
        cards: {
          select: {
            status: true,
            nextReviewAt: true,
          },
        },
      },
    }),
  ]);

  // 1. Mastery Rate
  const masteryRate = totalCardsStudiedOnce === 0 
    ? 0 
    : Math.round((totalMastered / totalCardsStudiedOnce) * 100);

  // 2. Study Streak
  const reviewDates = rawLogs.map(l => l.reviewedAt);
  const studyStreak = calculateStudyStreak(reviewDates);

  // 3. Heatmap Data (Last 84 days - 12 weeks)
  const today = startOfDay(new Date());
  const startDate = subDays(today, 83);
  
  // Initialize grid with 0s
  const heatmapMap = new Map<string, number>();
  eachDayOfInterval({ start: startDate, end: today }).forEach(day => {
    heatmapMap.set(format(day, "yyyy-MM-dd"), 0);
  });

  // Populate from logs
  rawLogs.forEach(log => {
    const dayKey = format(startOfDay(log.reviewedAt), "yyyy-MM-dd");
    if (heatmapMap.has(dayKey)) {
      heatmapMap.set(dayKey, heatmapMap.get(dayKey)! + 1);
    }
  });

  const heatmap: HeatmapData[] = Array.from(heatmapMap.entries()).map(([date, count]) => ({
    date,
    count
  }));

  // 4. Session Grouping for Recent Activity
  // We determine a session boundary if consecutive logs differ by > 30 mins or refer to a different deck
  const sessions: RecentSession[] = [];
  
  if (rawLogs.length > 0) {
    let currentSession: RecentSession | null = null;
    let correctCount = 0;

    for (const log of rawLogs) {
      if (!currentSession) {
        currentSession = {
          id: log.id,
          deckId: log.deckId,
          deckTitle: log.deck.title,
          emoji: log.deck.emoji,
          date: log.reviewedAt,
          cardsStudied: 1,
          accuracy: 0,
          durationMin: 0
        };
        correctCount = parseInt(log.rating) >= 3 ? 1 : 0;
      } else {
        const timeDiffMin = Math.abs(differenceInMinutes(currentSession.date, log.reviewedAt));
        if (timeDiffMin > 30 || currentSession.deckId !== log.deckId || !isSameDay(currentSession.date, log.reviewedAt)) {
          // Close out old session
          currentSession.accuracy = Math.round((correctCount / currentSession.cardsStudied) * 100);
          sessions.push(currentSession);
          if (sessions.length >= 5) break; 

          // Start new
          currentSession = {
            id: log.id,
            deckId: log.deckId,
            deckTitle: log.deck.title,
            emoji: log.deck.emoji,
            date: log.reviewedAt, // Time of latest log in session (since logs are desc)
            cardsStudied: 1,
            accuracy: 0,
            durationMin: 0
          };
          correctCount = parseInt(log.rating) >= 3 ? 1 : 0;
        } else {
          // Accumulate inside current
          currentSession.cardsStudied++;
          if (parseInt(log.rating) >= 3) correctCount++;
          currentSession.durationMin = timeDiffMin; // expanding duration
        }
      }
    }
    
    // Push the final lagging session
    if (currentSession && sessions.length < 5) {
      currentSession.accuracy = Math.round((correctCount / currentSession.cardsStudied) * 100);
      sessions.push(currentSession);
    }
  }

  // Ensure minimum duration is naturally 1min if multiple cards were studied rapidly
  sessions.forEach(s => {
    if (s.cardsStudied > 1 && s.durationMin === 0) s.durationMin = 1;
  });

  // 5. Recent Decks mapping with segmented counts
  const deckModels = decks.map((deck) => {
    const counts = { new: 0, learning: 0, review: 0, mastered: 0 };
    deck.cards.forEach(c => {
      if (c.status === "NEW") counts.new++;
      else if (c.status === "LEARNING") counts.learning++;
      else if (c.status === "REVIEW") counts.review++;
      else if (c.status === "MASTERED") counts.mastered++;
    });

    const dueCount = deck.cards.filter(c => c.status !== "NEW" && new Date(c.nextReviewAt) <= today).length;

    return {
      id: deck.id,
      title: deck.title,
      emoji: deck.emoji,
      cardCount: deck.cardCount,
      counts,
      dueCount,
      lastTouchedAt: (deck.lastStudiedAt ?? deck.createdAt).toISOString()
    };
  });

  const recentDecks = [...deckModels]
    .sort((a, b) => new Date(b.lastTouchedAt).getTime() - new Date(a.lastTouchedAt).getTime())
    .slice(0, 6);

  return {
    totalCards,
    cardsDueToday,
    masteryRate,
    studyStreak,
    heatmap,
    sessions,
    decks: deckModels, // We need grouped info for the "Cards Due" view
    recentDecks,
  };
}
