-- CreateTable
CREATE TABLE "pool" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" TIMESTAMP(3),
    "creatorToken" VARCHAR(300) NOT NULL,
    "question" VARCHAR(3000) NOT NULL,
    "options" TEXT[],

    CONSTRAINT "pool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vote" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "voterToken" VARCHAR(300) NOT NULL,
    "option" INTEGER NOT NULL,
    "poolId" TEXT NOT NULL,

    CONSTRAINT "vote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pool_creatorToken_idx" ON "pool"("creatorToken");

-- CreateIndex
CREATE INDEX "vote_voterToken_idx" ON "vote"("voterToken");

-- CreateIndex
CREATE INDEX "vote_poolId_idx" ON "vote"("poolId");

-- CreateIndex
CREATE UNIQUE INDEX "vote_voterToken_poolId_key" ON "vote"("voterToken", "poolId");

-- AddForeignKey
ALTER TABLE "vote" ADD CONSTRAINT "vote_poolId_fkey" FOREIGN KEY ("poolId") REFERENCES "pool"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
