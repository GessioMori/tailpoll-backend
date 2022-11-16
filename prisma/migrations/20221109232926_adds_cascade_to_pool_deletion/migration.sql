-- DropForeignKey
ALTER TABLE "vote" DROP CONSTRAINT "vote_pollId_fkey";

-- AddForeignKey
ALTER TABLE "vote" ADD CONSTRAINT "vote_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "poll"("id") ON DELETE CASCADE ON UPDATE CASCADE;
