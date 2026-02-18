-- CreateTable
CREATE TABLE "Verifications" (
    "otp" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "type" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Verifications_pkey" PRIMARY KEY ("otp")
);

-- AddForeignKey
ALTER TABLE "Verifications" ADD CONSTRAINT "Verifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
