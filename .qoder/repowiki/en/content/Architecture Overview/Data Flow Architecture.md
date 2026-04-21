# Data Flow Architecture

<cite>
**Referenced Files in This Document**
- [route.ts](file://src/app/api/upload/route.ts)
- [pdf.ts](file://src/lib/pdf.ts)
- [ai.ts](file://src/lib/ai.ts)
- [db.ts](file://src/lib/db.ts)
- [schema.prisma](file://prisma/schema.prisma)
- [route.ts](file://src/app/api/review/route.ts)
- [spaced-repetition.ts](file://src/lib/spaced-repetition.ts)
- [route.ts](file://src/app/api/stats/due-count/route.ts)
- [stats.ts](file://src/lib/stats.ts)
- [page.tsx](file://src/app/upload/page.tsx)
- [DropZone.tsx](file://src/components/upload/DropZone.tsx)
- [ProcessingUI.tsx](file://src/components/upload/ProcessingUI.tsx)
- [page.tsx](file://src/app/decks/[id]/study/page.tsx)
- [StudySessionShell.tsx](file://src/components/flashcard/StudySessionShell.tsx)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)

## Introduction
This document describes the end-to-end data flow architecture for the recall application. It covers the complete pipeline from PDF upload, text extraction, AI-powered flashcard generation, deduplication, and persistence to the database. It also documents the streaming architecture for large file processing, chunking strategies, memory management, AI integration with OpenAI-compatible APIs, prompt engineering patterns, spaced repetition scheduling, review queue management, statistics computation, progress tracking, and error handling with retries and fallbacks.

## Project Structure
The application follows a Next.js Pages Router structure with API routes under src/app/api and shared libraries under src/lib. The frontend upload and study pages orchestrate the user experience and communicate with backend APIs.

```mermaid
graph TB
subgraph "Frontend"
U["Upload Page<br/>src/app/upload/page.tsx"]
DZ["DropZone Component<br/>src/components/upload/DropZone.tsx"]
PU["ProcessingUI Component<br/>src/components/upload/ProcessingUI.tsx"]
SP["Study Page<br/>src/app/decks/[id]/study/page.tsx"]
SS["StudySessionShell<br/>src/components/flashcard/StudySessionShell.tsx"]
end
subgraph "Backend API"
APIU["Upload Route<br/>src/app/api/upload/route.ts"]
APIC["Review Route<br/>src/app/api/review/route.ts"]
APIS["Stats Routes<br/>src/app/api/stats/due-count/route.ts"]
end
subgraph "Libraries"
LPDF["PDF Parser<br/>src/lib/pdf.ts"]
LAI["AI Generation<br/>src/lib/ai.ts"]
LDB["Database Client<br/>src/lib/db.ts"]
LSR["Spaced Repetition<br/>src/lib/spaced-repetition.ts"]
LST["Statistics<br/>src/lib/stats.ts"]
end
subgraph "Database"
PRISMA["Prisma Schema<br/>prisma/schema.prisma"]
end
U --> APIU
DZ --> U
PU --> U
SP --> SS
SS --> APIC
APIU --> LPDF
APIU --> LAI
APIU --> LDB
APIC --> LDB
APIC --> LSR
APIS --> LDB
LST --> LDB
LDB --> PRISMA
```

**Diagram sources**
- [page.tsx:1-504](file://src/app/upload/page.tsx#L1-L504)
- [DropZone.tsx:1-100](file://src/components/upload/DropZone.tsx#L1-L100)
- [ProcessingUI.tsx:1-53](file://src/components/upload/ProcessingUI.tsx#L1-L53)
- [page.tsx:1-92](file://src/app/decks/[id]/study/page.tsx#L1-L92)
- [StudySessionShell.tsx:1-430](file://src/components/flashcard/StudySessionShell.tsx#L1-L430)
- [route.ts:1-298](file://src/app/api/upload/route.ts#L1-L298)
- [route.ts:1-76](file://src/app/api/review/route.ts#L1-L76)
- [route.ts:1-15](file://src/app/api/stats/due-count/route.ts#L1-L15)
- [pdf.ts:1-112](file://src/lib/pdf.ts#L1-L112)
- [ai.ts:1-233](file://src/lib/ai.ts#L1-L233)
- [db.ts:1-68](file://src/lib/db.ts#L1-L68)
- [spaced-repetition.ts:1-141](file://src/lib/spaced-repetition.ts#L1-L141)
- [stats.ts:1-222](file://src/lib/stats.ts#L1-L222)
- [schema.prisma:1-51](file://prisma/schema.prisma#L1-L51)

**Section sources**
- [route.ts:1-298](file://src/app/api/upload/route.ts#L1-L298)
- [pdf.ts:1-112](file://src/lib/pdf.ts#L1-L112)
- [ai.ts:1-233](file://src/lib/ai.ts#L1-L233)
- [db.ts:1-68](file://src/lib/db.ts#L1-L68)
- [schema.prisma:1-51](file://prisma/schema.prisma#L1-L51)
- [route.ts:1-76](file://src/app/api/review/route.ts#L1-L76)
- [spaced-repetition.ts:1-141](file://src/lib/spaced-repetition.ts#L1-L141)
- [route.ts:1-15](file://src/app/api/stats/due-count/route.ts#L1-L15)
- [stats.ts:1-222](file://src/lib/stats.ts#L1-L222)
- [page.tsx:1-504](file://src/app/upload/page.tsx#L1-L504)
- [page.tsx:1-92](file://src/app/decks/[id]/study/page.tsx#L1-L92)
- [StudySessionShell.tsx:1-430](file://src/components/flashcard/StudySessionShell.tsx#L1-L430)

## Core Components
- Upload pipeline: Streams progress updates, parses PDF, chunks text, generates flashcards via AI, deduplicates, and persists to the database.
- PDF parsing and chunking: Cleans text, removes page artifacts, splits into overlapping chunks optimized for AI context windows.
- AI integration: Uses OpenRouter-compatible API with fallback models and robust JSON extraction.
- Spaced repetition: Implements SM-2 scheduling, queue construction, and daily review updates.
- Statistics: Computes due counts, mastery rates, streaks, heatmap, and recent sessions.
- Frontend orchestration: Handles drag-and-drop, streaming progress, and interactive study sessions.

**Section sources**
- [route.ts:86-298](file://src/app/api/upload/route.ts#L86-L298)
- [pdf.ts:13-111](file://src/lib/pdf.ts#L13-L111)
- [ai.ts:76-232](file://src/lib/ai.ts#L76-L232)
- [spaced-repetition.ts:29-104](file://src/lib/spaced-repetition.ts#L29-L104)
- [stats.ts:20-221](file://src/lib/stats.ts#L20-L221)
- [page.tsx:84-177](file://src/app/upload/page.tsx#L84-L177)
- [StudySessionShell.tsx:68-125](file://src/components/flashcard/StudySessionShell.tsx#L68-L125)

## Architecture Overview
The system is a streaming-first pipeline with clear separation of concerns:
- Frontend uploads a PDF and streams progress events.
- Backend validates, parses, chunks, and streams AI generation progress.
- AI generation uses fallback models and robust JSON parsing.
- Cards are deduplicated and persisted in a single transaction.
- Review updates use SM-2 scheduling and maintain atomic transactions with review logs.
- Statistics are computed from the database with efficient queries.

```mermaid
sequenceDiagram
participant User as "User"
participant FE as "Upload Page<br/>page.tsx"
participant API as "Upload Route<br/>route.ts"
participant PDF as "PDF Parser<br/>pdf.ts"
participant CHUNK as "Chunker<br/>pdf.ts"
participant AI as "AI Generator<br/>ai.ts"
participant DB as "DB Client<br/>db.ts"
participant PRISMA as "Prisma Schema<br/>schema.prisma"
User->>FE : "Submit PDF + metadata"
FE->>API : "POST /api/upload (multipart/form-data)"
API->>API : "Validate + rate-limit"
API->>PDF : "parsePDF(buffer)"
PDF-->>API : "{text, pageCount}"
API->>CHUNK : "chunkText(text)"
CHUNK-->>API : "chunks[]"
loop For each chunk
API->>AI : "generateFlashcardsFromChunk(chunk)"
AI-->>API : "cards[] (JSON extracted)"
API->>API : "deduplicate across collected cards"
end
API->>DB : "db.deck.create(...cards)"
DB->>PRISMA : "Persist deck + cards"
PRISMA-->>DB : "OK"
DB-->>API : "Deck + Card IDs"
API-->>FE : "Streaming JSON updates (parsing/chunking/generating/saving/complete)"
```

**Diagram sources**
- [page.tsx:84-177](file://src/app/upload/page.tsx#L84-L177)
- [route.ts:86-298](file://src/app/api/upload/route.ts#L86-L298)
- [pdf.ts:13-111](file://src/lib/pdf.ts#L13-L111)
- [ai.ts:168-232](file://src/lib/ai.ts#L168-L232)
- [db.ts:1-68](file://src/lib/db.ts#L1-L68)
- [schema.prisma:10-51](file://prisma/schema.prisma#L10-L51)

## Detailed Component Analysis

### Upload Pipeline and Streaming
- Validates environment variables early, rejects unsupported files, enforces size limits, trims metadata, and opens a TransformStream for immediate streaming.
- Streams structured JSON updates for parsing, chunking, generation, saving, and completion.
- Parses PDF, cleans text, and splits into overlapping chunks to preserve context.
- Generates flashcards per chunk with progress callbacks and deduplicates across the batch.
- Persists deck and cards atomically and closes the stream.

```mermaid
flowchart TD
Start(["Upload Request"]) --> EnvCheck["Check DATABASE_URL and OPENROUTER_API_KEY"]
EnvCheck --> RateLimit["IP-based Rate Limit"]
RateLimit --> ParseFD["Parse multipart/form-data"]
ParseFD --> Validate["Validate file type, size, title"]
Validate --> ReadBuf["Read file to Buffer"]
ReadBuf --> OpenStream["Open TransformStream for streaming"]
OpenStream --> ParsePDF["parsePDF(buffer)"]
ParsePDF --> ChunkText["chunkText(text)"]
ChunkText --> LoopChunks{"For each chunk"}
LoopChunks --> GenChunk["generateFlashcardsFromChunk(chunk)"]
GenChunk --> Dedup["Deduplicate vs collected cards"]
Dedup --> LoopChunks
LoopChunks --> |Done| SaveDeck["db.deck.create(cards)"]
SaveDeck --> StreamDone["Send 'complete' update"]
StreamDone --> CloseStream["Close writer"]
CloseStream --> End(["Response Sent"])
```

**Diagram sources**
- [route.ts:86-298](file://src/app/api/upload/route.ts#L86-L298)
- [pdf.ts:13-111](file://src/lib/pdf.ts#L13-L111)
- [ai.ts:168-232](file://src/lib/ai.ts#L168-L232)
- [db.ts:1-68](file://src/lib/db.ts#L1-L68)

**Section sources**
- [route.ts:86-298](file://src/app/api/upload/route.ts#L86-L298)
- [pdf.ts:67-111](file://src/lib/pdf.ts#L67-L111)
- [ai.ts:168-232](file://src/lib/ai.ts#L168-L232)

### PDF Parsing and Chunking Strategy
- Removes page number artifacts and collapses excessive whitespace.
- Splits text into overlapping chunks at paragraph boundaries to maximize semantic coherence.
- Enforces minimum chunk size and applies overlap to preserve continuity.
- Hard-splits oversized paragraphs to fit within the target chunk size.

```mermaid
flowchart TD
A["Input text"] --> Clean["Remove page numbers and extra whitespace"]
Clean --> SplitPara["Split by paragraph boundaries"]
SplitPara --> Build["Accumulate into current chunk"]
Build --> SizeCheck{"Chunk length <= max?"}
SizeCheck --> |Yes| NextPara["Take next paragraph"]
SizeCheck --> |No| Flush["Flush current chunk if >= min"]
Flush --> Overlap["Start new chunk with tail overlap"]
Overlap --> HardSplit{"Still > max?"}
HardSplit --> |Yes| Slice["Slice max-sized segment"] --> Flush
HardSplit --> |No| UseCurrent["Use current as next base"]
NextPara --> Build
UseCurrent --> Build
Build --> LastFlush["Flush final chunk if >= min"]
```

**Diagram sources**
- [pdf.ts:67-111](file://src/lib/pdf.ts#L67-L111)

**Section sources**
- [pdf.ts:13-111](file://src/lib/pdf.ts#L13-L111)

### AI Integration and Prompt Engineering
- Initializes OpenRouter client lazily and throws a clear error if the API key is missing.
- Uses a comprehensive system prompt that defines categories, quality rules, and JSON output expectations.
- Iterates through fallback models and stops on first successful response.
- Extracts JSON from AI responses, tolerating fenced code blocks and partial matches.
- Retries failed chunks once with a short delay and continues with empty results if still failing.

```mermaid
sequenceDiagram
participant API as "Upload Route"
participant AI as "ai.ts"
participant OR as "OpenRouter API"
API->>AI : "generateFlashcardsFromChunk(chunk, title, subject, i, N)"
AI->>AI : "Prepare SYSTEM_PROMPT and userMessage"
AI->>OR : "chat.completions.create(model A)"
alt Model A fails
OR-->>AI : "error"
AI->>OR : "chat.completions.create(model B)"
end
OR-->>AI : "raw JSON"
AI->>AI : "Strip fences and parse JSON"
AI-->>API : "cards[]"
```

**Diagram sources**
- [ai.ts:76-153](file://src/lib/ai.ts#L76-L153)
- [ai.ts:168-232](file://src/lib/ai.ts#L168-L232)

**Section sources**
- [ai.ts:8-24](file://src/lib/ai.ts#L8-L24)
- [ai.ts:53-74](file://src/lib/ai.ts#L53-L74)
- [ai.ts:92-153](file://src/lib/ai.ts#L92-L153)
- [ai.ts:168-232](file://src/lib/ai.ts#L168-L232)

### Spaced Repetition and Review Queue Management
- Implements SM-2 with ease factor adjustments, interval progression, and status transitions.
- Builds a study queue prioritizing overdue cards and mixing newly added cards.
- Provides rating options mapped to numeric quality scores for SM-2 updates.
- Processes reviews via a dedicated API that updates card state and creates review logs atomically.

```mermaid
flowchart TD
QStart["Load cards for deck"] --> FilterDue["Filter overdue cards (nextReviewAt <= now)"]
FilterDue --> ShuffleDue["Shuffle overdue"]
QStart --> NewCards["Filter NEW cards"]
NewCards --> ShuffleNew["Shuffle NEW"]
ShuffleDue --> Merge["Merge: overdue + NEW"]
Merge --> Limit["Limit to 20"]
Limit --> Queue["Queue ready"]
Review["User rates card"] --> SM2["processReview(card, quality)"]
SM2 --> Update["Compute new easeFactor, interval, status"]
Update --> Txn["db.$transaction: update card + create reviewLog + update deck.lastStudiedAt"]
```

**Diagram sources**
- [spaced-repetition.ts:29-76](file://src/lib/spaced-repetition.ts#L29-L76)
- [spaced-repetition.ts:88-104](file://src/lib/spaced-repetition.ts#L88-L104)
- [route.ts:28-68](file://src/app/api/review/route.ts#L28-L68)
- [page.tsx:80-82](file://src/app/decks/[id]/study/page.tsx#L80-L82)

**Section sources**
- [spaced-repetition.ts:29-104](file://src/lib/spaced-repetition.ts#L29-L104)
- [route.ts:28-68](file://src/app/api/review/route.ts#L28-L68)
- [page.tsx:80-82](file://src/app/decks/[id]/study/page.tsx#L80-L82)

### Statistics Calculation Pipeline
- Computes due count, mastery rate, and study streak from review logs.
- Builds a heatmap of activity over the last 84 days.
- Groups recent sessions with accuracy and duration thresholds.
- Aggregates deck-level counts and due-by-date metrics.

```mermaid
flowchart TD
Fetch["Fetch counts + logs + decks"] --> Due["Count overdue (not NEW, <= now)"]
Fetch --> Mastered["Count MASTERED"]
Fetch --> Total["Count all cards"]
Fetch --> StudiedOnce["Count cards studied (status != NEW)"]
Fetch --> Logs["Fetch recent review logs"]
Fetch --> Decks["Fetch decks with cards"]
Due --> DueRes["cardsDueToday"]
Mastered --> Mastery["Mastery = round(mastered/studiedOnce)"]
Logs --> Streak["calculateStudyStreak(logs)"]
Logs --> Heatmap["Build 84-day grid from logs"]
Decks --> RecentDecks["Aggregate deck counts and due"]
```

**Diagram sources**
- [stats.ts:51-221](file://src/lib/stats.ts#L51-L221)
- [route.ts:7-14](file://src/app/api/stats/due-count/route.ts#L7-L14)

**Section sources**
- [stats.ts:20-221](file://src/lib/stats.ts#L20-L221)
- [route.ts:1-15](file://src/app/api/stats/due-count/route.ts#L1-L15)

### Frontend Orchestration and UX
- Upload page handles drag-and-drop, validation, and streaming JSON updates to drive progress bars and status messages.
- DropZone and ProcessingUI provide responsive feedback during ingestion and generation.
- Study page loads cards, converts them to the internal format, and constructs the queue using SM-2 logic.
- StudySessionShell manages flipping, rating, optimistic UI updates, and session completion.

```mermaid
sequenceDiagram
participant FE as "Upload Page"
participant API as "Upload Route"
participant UI as "ProcessingUI"
FE->>API : "fetch('/api/upload', { body : FormData })"
API-->>FE : "ReadableStream (JSON lines)"
loop Read stream
FE->>UI : "Update progress + status"
end
FE->>FE : "On 'complete' : navigate to study"
```

**Diagram sources**
- [page.tsx:84-177](file://src/app/upload/page.tsx#L84-L177)
- [ProcessingUI.tsx:12-27](file://src/components/upload/ProcessingUI.tsx#L12-L27)
- [route.ts:164-298](file://src/app/api/upload/route.ts#L164-L298)

**Section sources**
- [page.tsx:84-177](file://src/app/upload/page.tsx#L84-L177)
- [DropZone.tsx:21-99](file://src/components/upload/DropZone.tsx#L21-L99)
- [ProcessingUI.tsx:12-27](file://src/components/upload/ProcessingUI.tsx#L12-L27)
- [page.tsx:30-92](file://src/app/decks/[id]/study/page.tsx#L30-L92)
- [StudySessionShell.tsx:68-125](file://src/components/flashcard/StudySessionShell.tsx#L68-L125)

## Dependency Analysis
- API routes depend on shared libraries for PDF parsing, AI generation, database access, and scheduling/statistics.
- The database schema defines Deck, Card, and ReviewLog entities with relations and indexes implied by Prisma usage.
- Frontend pages depend on API routes and UI components for user interaction.

```mermaid
graph LR
UploadRoute["Upload Route"] --> PDF["PDF Parser"]
UploadRoute --> AI["AI Generator"]
UploadRoute --> DB["DB Client"]
ReviewRoute["Review Route"] --> DB
ReviewRoute --> SR["Spaced Repetition"]
StatsRoute["Stats Routes"] --> DB
StatsLib["Stats Library"] --> DB
DB --> Schema["Prisma Schema"]
```

**Diagram sources**
- [route.ts:1-10](file://src/app/api/upload/route.ts#L1-L10)
- [pdf.ts:1-11](file://src/lib/pdf.ts#L1-L11)
- [ai.ts:1-10](file://src/lib/ai.ts#L1-L10)
- [db.ts:1-10](file://src/lib/db.ts#L1-L10)
- [route.ts:1-5](file://src/app/api/review/route.ts#L1-L5)
- [spaced-repetition.ts:1-5](file://src/lib/spaced-repetition.ts#L1-L5)
- [route.ts:1-5](file://src/app/api/stats/due-count/route.ts#L1-L5)
- [stats.ts:1-5](file://src/lib/stats.ts#L1-L5)
- [schema.prisma:1-10](file://prisma/schema.prisma#L1-L10)

**Section sources**
- [route.ts:1-10](file://src/app/api/upload/route.ts#L1-L10)
- [pdf.ts:1-11](file://src/lib/pdf.ts#L1-L11)
- [ai.ts:1-10](file://src/lib/ai.ts#L1-L10)
- [db.ts:1-10](file://src/lib/db.ts#L1-L10)
- [route.ts:1-5](file://src/app/api/review/route.ts#L1-L5)
- [spaced-repetition.ts:1-5](file://src/lib/spaced-repetition.ts#L1-L5)
- [route.ts:1-5](file://src/app/api/stats/due-count/route.ts#L1-L5)
- [stats.ts:1-5](file://src/lib/stats.ts#L1-L5)
- [schema.prisma:1-10](file://prisma/schema.prisma#L1-L10)

## Performance Considerations
- Streaming: The upload route returns a streaming response immediately, preventing timeouts and enabling real-time progress.
- Chunking: Paragraph-aware splitting with overlap improves AI comprehension and reduces context loss.
- Memory: PDF parsing occurs in-memory; the pipeline reads the entire file buffer before streaming to avoid holding the request body open. Consider streaming parsers for extremely large files if needed.
- AI pacing: Delays between chunk requests mitigate free-tier rate limits.
- Database: Transactions consolidate writes; ensure indexes on nextReviewAt and status for efficient queue and stats queries.

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
- Environment errors: Early checks surface missing DATABASE_URL or OPENROUTER_API_KEY with actionable messages.
- AI errors: Public error messages distinguish rate limits, model unavailability, invalid keys, and service overloads.
- Database connectivity: Errors related to DATABASE_URL, Prisma codes, or authentication failures are detected and surfaced clearly.
- Upload validation: Rejects non-PDF files, enforces size limits, and validates required metadata.
- Retry and fallback: AI generation retries a failed chunk once and falls back to alternate models; deduplication prevents duplicates.
- Frontend resilience: Malformed JSON lines are skipped; the UI displays user-friendly errors and allows retry.

**Section sources**
- [route.ts:11-63](file://src/app/api/upload/route.ts#L11-L63)
- [route.ts:133-151](file://src/app/api/upload/route.ts#L133-L151)
- [ai.ts:92-153](file://src/lib/ai.ts#L92-L153)
- [ai.ts:194-209](file://src/lib/ai.ts#L194-L209)

## Conclusion
The recall application implements a robust, streaming-first ingestion pipeline that transforms PDFs into spaced-repetition flashcards. It leverages a clear separation of concerns across parsing, chunking, AI generation, deduplication, and persistence. The SM-2 scheduling and review queue ensure effective learning, while comprehensive statistics and progress tracking provide insights and motivation. The architecture balances reliability with performance, incorporating retries, fallbacks, and user-visible feedback throughout the pipeline.