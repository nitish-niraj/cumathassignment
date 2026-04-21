import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DAY_MS = 24 * 60 * 60 * 1000;
const daysFromNow = (days: number) => new Date(Date.now() + days * DAY_MS);
const daysAgo = (days: number) => new Date(Date.now() - days * DAY_MS);

async function main() {
  await prisma.reviewLog.deleteMany();
  await prisma.card.deleteMany();
  await prisma.deck.deleteMany();

  const quadratic = await prisma.deck.create({
    data: {
      title: "Quadratic Equations",
      description: "Core quadratic concepts, methods, and common pitfalls.",
      subject: "Mathematics",
      emoji: "📐",
      cardCount: 8,
      lastStudiedAt: daysAgo(1),
      cards: {
        create: [
          {
            front: "What is a quadratic equation?",
            back: "A quadratic equation is a polynomial equation of degree 2 in one variable, typically written as ax^2 + bx + c = 0 where a != 0.",
            difficulty: "EASY",
            status: "MASTERED",
            easeFactor: 2.85,
            interval: 14,
            repetitionCount: 8,
            nextReviewAt: daysFromNow(7),
            lastReviewedAt: daysAgo(1),
          },
          {
            front: "What is the standard form of a quadratic equation?",
            back: "Standard form is ax^2 + bx + c = 0, where a, b, and c are constants and a != 0.",
            difficulty: "EASY",
            status: "REVIEW",
            easeFactor: 2.5,
            interval: 3,
            repetitionCount: 4,
            nextReviewAt: daysFromNow(0),
            lastReviewedAt: daysAgo(3),
          },
          {
            front: "State the quadratic formula.",
            back: "For ax^2 + bx + c = 0, solutions are x = (-b +/- sqrt(b^2 - 4ac)) / (2a).",
            difficulty: "MEDIUM",
            status: "REVIEW",
            easeFactor: 2.45,
            interval: 2,
            repetitionCount: 3,
            nextReviewAt: daysFromNow(0),
            lastReviewedAt: daysAgo(2),
          },
          {
            front: "What does the discriminant tell you?",
            back: "For D = b^2 - 4ac: D > 0 gives two real roots, D = 0 gives one repeated real root, D < 0 gives two complex roots.",
            difficulty: "MEDIUM",
            status: "LEARNING",
            easeFactor: 2.3,
            interval: 1,
            repetitionCount: 2,
            nextReviewAt: daysFromNow(1),
            lastReviewedAt: daysAgo(1),
          },
          {
            front: "What are the main steps for completing the square?",
            back: "Make coefficient of x^2 equal 1, move constant term, add (b/2)^2 to both sides, factor perfect square trinomial, solve.",
            difficulty: "HARD",
            status: "LEARNING",
            easeFactor: 2.15,
            interval: 1,
            repetitionCount: 1,
            nextReviewAt: daysFromNow(2),
            lastReviewedAt: daysAgo(0),
          },
          {
            front: "What is vertex form and why is it useful?",
            back: "Vertex form is y = a(x - h)^2 + k. It directly reveals the vertex (h, k) and helps graph transformations quickly.",
            difficulty: "MEDIUM",
            status: "REVIEW",
            easeFactor: 2.55,
            interval: 4,
            repetitionCount: 5,
            nextReviewAt: daysFromNow(1),
            lastReviewedAt: daysAgo(4),
          },
          {
            front: "Give one real-world application of quadratic equations.",
            back: "Projectile motion problems, where height over time is modeled by a quadratic function, are a classic application.",
            difficulty: "HARD",
            status: "NEW",
            easeFactor: 2.5,
            interval: 0,
            repetitionCount: 0,
            nextReviewAt: daysFromNow(7),
          },
          {
            front: "What is a common mistake when solving quadratics?",
            back: "A frequent mistake is forgetting to set the equation equal to zero before factoring or using the quadratic formula.",
            difficulty: "MEDIUM",
            status: "MASTERED",
            easeFactor: 2.78,
            interval: 10,
            repetitionCount: 6,
            nextReviewAt: daysFromNow(6),
            lastReviewedAt: daysAgo(5),
          },
        ],
      },
    },
    include: { cards: true },
  });

  const revolution = await prisma.deck.create({
    data: {
      title: "French Revolution",
      description: "Events, people, and consequences from 1789 onward.",
      subject: "History",
      emoji: "📜",
      cardCount: 7,
      lastStudiedAt: daysAgo(3),
      cards: {
        create: [
          {
            front: "Name two major causes of the French Revolution.",
            back: "Financial crisis from war debt and social inequality under the Estates system were major causes.",
            difficulty: "MEDIUM",
            status: "MASTERED",
            easeFactor: 2.75,
            interval: 9,
            repetitionCount: 6,
            nextReviewAt: daysFromNow(5),
            lastReviewedAt: daysAgo(6),
          },
          {
            front: "Which key dates mark the Revolution's start and radical phase?",
            back: "1789 (Storming of the Bastille) marks the start; 1793-1794 marks the radical Jacobin phase and Reign of Terror.",
            difficulty: "HARD",
            status: "REVIEW",
            easeFactor: 2.35,
            interval: 2,
            repetitionCount: 3,
            nextReviewAt: daysFromNow(0),
            lastReviewedAt: daysAgo(2),
          },
          {
            front: "What was the Tennis Court Oath?",
            back: "In 1789, members of the Third Estate pledged not to disband until they created a constitution for France.",
            difficulty: "MEDIUM",
            status: "REVIEW",
            easeFactor: 2.42,
            interval: 3,
            repetitionCount: 4,
            nextReviewAt: daysFromNow(1),
            lastReviewedAt: daysAgo(3),
          },
          {
            front: "What was the Reign of Terror?",
            back: "A period (1793-1794) of mass executions and political repression led by the Committee of Public Safety.",
            difficulty: "HARD",
            status: "LEARNING",
            easeFactor: 2.18,
            interval: 1,
            repetitionCount: 1,
            nextReviewAt: daysFromNow(1),
            lastReviewedAt: daysAgo(1),
          },
          {
            front: "Identify two key figures of the Revolution.",
            back: "Maximilien Robespierre and Louis XVI are central figures, representing revolutionary leadership and monarchy respectively.",
            difficulty: "EASY",
            status: "MASTERED",
            easeFactor: 2.88,
            interval: 12,
            repetitionCount: 7,
            nextReviewAt: daysFromNow(9),
            lastReviewedAt: daysAgo(9),
          },
          {
            front: "Name one major outcome of the French Revolution.",
            back: "It ended absolute monarchy in France and spread ideas of citizenship, rights, and nationalism across Europe.",
            difficulty: "MEDIUM",
            status: "LEARNING",
            easeFactor: 2.22,
            interval: 1,
            repetitionCount: 2,
            nextReviewAt: daysFromNow(3),
            lastReviewedAt: daysAgo(0),
          },
          {
            front: "How did the French and American Revolutions differ?",
            back: "Both promoted liberty ideals, but the French Revolution became more socially radical and violent, with broader internal upheaval.",
            difficulty: "HARD",
            status: "NEW",
            easeFactor: 2.5,
            interval: 0,
            repetitionCount: 0,
            nextReviewAt: daysFromNow(7),
          },
        ],
      },
    },
    include: { cards: true },
  });

  const photosynthesis = await prisma.deck.create({
    data: {
      title: "Photosynthesis",
      description: "Biology fundamentals from reaction equation to adaptation strategies.",
      subject: "Science",
      emoji: "🔬",
      cardCount: 6,
      lastStudiedAt: daysAgo(0),
      cards: {
        create: [
          {
            front: "What is photosynthesis?",
            back: "Photosynthesis is the process by which plants convert light energy into chemical energy stored as glucose.",
            difficulty: "EASY",
            status: "MASTERED",
            easeFactor: 2.8,
            interval: 10,
            repetitionCount: 6,
            nextReviewAt: daysFromNow(8),
            lastReviewedAt: daysAgo(2),
          },
          {
            front: "Write the overall equation for photosynthesis.",
            back: "6CO2 + 6H2O + light -> C6H12O6 + 6O2.",
            difficulty: "MEDIUM",
            status: "REVIEW",
            easeFactor: 2.48,
            interval: 2,
            repetitionCount: 3,
            nextReviewAt: daysFromNow(0),
            lastReviewedAt: daysAgo(2),
          },
          {
            front: "Differentiate light reactions and Calvin cycle.",
            back: "Light reactions capture energy to produce ATP/NADPH in thylakoids; the Calvin cycle uses ATP/NADPH in the stroma to fix carbon.",
            difficulty: "HARD",
            status: "LEARNING",
            easeFactor: 2.2,
            interval: 1,
            repetitionCount: 1,
            nextReviewAt: daysFromNow(1),
            lastReviewedAt: daysAgo(1),
          },
          {
            front: "What chloroplast structures are involved in photosynthesis?",
            back: "Thylakoid membranes host light reactions, while the stroma hosts carbon fixation steps.",
            difficulty: "MEDIUM",
            status: "REVIEW",
            easeFactor: 2.4,
            interval: 3,
            repetitionCount: 3,
            nextReviewAt: daysFromNow(2),
            lastReviewedAt: daysAgo(3),
          },
          {
            front: "Which factors affect photosynthesis rate?",
            back: "Light intensity, CO2 concentration, temperature, and water availability are major limiting factors.",
            difficulty: "MEDIUM",
            status: "MASTERED",
            easeFactor: 2.7,
            interval: 8,
            repetitionCount: 5,
            nextReviewAt: daysFromNow(6),
            lastReviewedAt: daysAgo(4),
          },
          {
            front: "How do C3 and C4 plants differ?",
            back: "C4 plants spatially separate carbon fixation steps to reduce photorespiration, making them more efficient in hot, bright climates.",
            difficulty: "HARD",
            status: "NEW",
            easeFactor: 2.5,
            interval: 0,
            repetitionCount: 0,
            nextReviewAt: daysFromNow(7),
          },
        ],
      },
    },
    include: { cards: true },
  });

  const logs = [
    { deck: quadratic, card: quadratic.cards[1], rating: "good", days: 0 },
    { deck: photosynthesis, card: photosynthesis.cards[1], rating: "easy", days: 1 },
    { deck: revolution, card: revolution.cards[1], rating: "hard", days: 2 },
    { deck: quadratic, card: quadratic.cards[2], rating: "good", days: 3 },
    { deck: photosynthesis, card: photosynthesis.cards[2], rating: "again", days: 5 },
    { deck: revolution, card: revolution.cards[2], rating: "good", days: 6 },
    { deck: quadratic, card: quadratic.cards[3], rating: "hard", days: 8 },
    { deck: photosynthesis, card: photosynthesis.cards[3], rating: "good", days: 10 },
    { deck: revolution, card: revolution.cards[3], rating: "easy", days: 12 },
    { deck: quadratic, card: quadratic.cards[5], rating: "good", days: 15 },
    { deck: photosynthesis, card: photosynthesis.cards[4], rating: "easy", days: 18 },
    { deck: revolution, card: revolution.cards[4], rating: "good", days: 20 },
    { deck: quadratic, card: quadratic.cards[7], rating: "easy", days: 22 },
    { deck: revolution, card: revolution.cards[5], rating: "hard", days: 26 },
    { deck: photosynthesis, card: photosynthesis.cards[0], rating: "good", days: 29 },
  ];

  await prisma.reviewLog.createMany({
    data: logs.map((entry) => ({
      cardId: entry.card.id,
      deckId: entry.deck.id,
      rating: entry.rating,
      reviewedAt: daysAgo(entry.days),
    })),
  });

  const totalDecks = await prisma.deck.count();
  const totalCards = await prisma.card.count();
  const totalLogs = await prisma.reviewLog.count();

  console.log(`Seed complete: ${totalDecks} decks, ${totalCards} cards, ${totalLogs} review logs.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
