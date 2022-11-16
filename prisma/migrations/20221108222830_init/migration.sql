-- CreateTable
CREATE TABLE "poll" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" TIMESTAMP(3),
    "creatorToken" VARCHAR(300) NOT NULL,
    "question" VARCHAR(3000) NOT NULL,
    "options" TEXT[],

    CONSTRAINT "poll_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vote" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "voterToken" VARCHAR(300) NOT NULL,
    "option" INTEGER NOT NULL,
    "pollId" TEXT NOT NULL,

    CONSTRAINT "vote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "poll_creatorToken_idx" ON "poll"("creatorToken");

-- CreateIndex
CREATE INDEX "vote_voterToken_idx" ON "vote"("voterToken");

-- CreateIndex
CREATE INDEX "vote_pollId_idx" ON "vote"("pollId");

-- CreateIndex
CREATE UNIQUE INDEX "vote_voterToken_pollId_key" ON "vote"("voterToken", "pollId");

-- AddForeignKey
ALTER TABLE "vote" ADD CONSTRAINT "vote_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "poll"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
