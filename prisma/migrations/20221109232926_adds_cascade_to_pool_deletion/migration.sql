-- DropForeignKey
ALTER TABLE "vote" DROP CONSTRAINT "vote_poolId_fkey";

-- AddForeignKey
ALTER TABLE "vote" ADD CONSTRAINT "vote_poolId_fkey" FOREIGN KEY ("poolId") REFERENCES "pool"("id") ON DELETE CASCADE ON UPDATE CASCADE;
