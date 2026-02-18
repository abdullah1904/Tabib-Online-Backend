-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "verificationDocumentType" INTEGER NOT NULL,
    "verificationDocumentNumber" TEXT NOT NULL,
    "verificationDocumentURL" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" INTEGER NOT NULL,
    "prefix" TEXT NOT NULL,
    "suspendedTill" TIMESTAMP(3),
    "status" INTEGER NOT NULL DEFAULT 0,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicalRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emergencyContactName" TEXT NOT NULL,
    "emergencyContactNumber" TEXT NOT NULL,
    "bloodType" TEXT NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "allergies" TEXT NOT NULL,
    "currentMedications" TEXT NOT NULL,
    "familyMedicalHistory" TEXT NOT NULL,
    "pastMedicalHistory" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicalRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfessionalInfo" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "medicalDegree" INTEGER NOT NULL,
    "postGraduateDegree" INTEGER NOT NULL,
    "specialization" INTEGER NOT NULL,
    "yearsOfExperience" INTEGER NOT NULL,
    "PMDCRedgNo" TEXT NOT NULL,
    "PMDCRedgDate" TIMESTAMP(3) NOT NULL,
    "PMDCLicenseDocumentURL" TEXT NOT NULL,
    "PMDCVerficationStatus" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfessionalInfo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "MedicalRecord_userId_key" ON "MedicalRecord"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ProfessionalInfo_userId_key" ON "ProfessionalInfo"("userId");

-- AddForeignKey
ALTER TABLE "MedicalRecord" ADD CONSTRAINT "MedicalRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfessionalInfo" ADD CONSTRAINT "ProfessionalInfo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
