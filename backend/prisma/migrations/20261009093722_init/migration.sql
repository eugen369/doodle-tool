-- CreateTable
CREATE TABLE "Poll" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "moderatorToken" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME
);

-- CreateTable
CREATE TABLE "PollSlot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pollId" TEXT NOT NULL,
    "startsAt" DATETIME NOT NULL,
    "endsAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PollSlot_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "Poll" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pollId" TEXT NOT NULL,
    "name" TEXT,
    "timezone" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserSession_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "Poll" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pollId" TEXT NOT NULL,
    "slotId" TEXT NOT NULL,
    "userSessionId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'no',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Vote_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "Poll" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Vote_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "PollSlot" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Vote_userSessionId_fkey" FOREIGN KEY ("userSessionId") REFERENCES "UserSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Poll_moderatorToken_key" ON "Poll"("moderatorToken");

-- CreateIndex
CREATE INDEX "Poll_moderatorToken_idx" ON "Poll"("moderatorToken");

-- CreateIndex
CREATE INDEX "Poll_createdAt_idx" ON "Poll"("createdAt");

-- CreateIndex
CREATE INDEX "PollSlot_pollId_idx" ON "PollSlot"("pollId");

-- CreateIndex
CREATE UNIQUE INDEX "PollSlot_pollId_startsAt_key" ON "PollSlot"("pollId", "startsAt");

-- CreateIndex
CREATE INDEX "UserSession_pollId_idx" ON "UserSession"("pollId");

-- CreateIndex
CREATE UNIQUE INDEX "UserSession_pollId_id_key" ON "UserSession"("pollId", "id");

-- CreateIndex
CREATE INDEX "Vote_pollId_idx" ON "Vote"("pollId");

-- CreateIndex
CREATE INDEX "Vote_slotId_idx" ON "Vote"("slotId");

-- CreateIndex
CREATE INDEX "Vote_userSessionId_idx" ON "Vote"("userSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Vote_slotId_userSessionId_key" ON "Vote"("slotId", "userSessionId");
