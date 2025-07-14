-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "parentUserId" TEXT;

-- AddForeignKey
ALTER TABLE "Users" ADD CONSTRAINT "Users_parentUserId_fkey" FOREIGN KEY ("parentUserId") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
