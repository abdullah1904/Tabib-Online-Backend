-- CreateTable
CREATE TABLE "PMDCVerificationApplication" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "PMDCRedgNo" TEXT NOT NULL,
    "PMDCRedgDate" TIMESTAMP(3) NOT NULL,
    "PMDCLicenseDocumentURL" TEXT NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 0,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" INTEGER NOT NULL,
    "results" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PMDCVerificationApplication_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PMDCVerificationApplication" ADD CONSTRAINT "PMDCVerificationApplication_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
