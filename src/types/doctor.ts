export interface IDoctor {
    fullName: string;
    imageURL: string | null;
    age: number;
    gender: number;
    email: string;
    address: string;
    phoneNumber: string;
    pmdcRedgNo: string;
    pmdcRedgDate: Date;
    medicalDegree: number;
    postGraduateDegree: number;
    specialization: number;
    yearsOfExperience: number;
    pmdcLicenseDocumentURL: string;
    verificationDocumentType: number;
    verificationDocumentNumber: string;
    verificationDocumentURL: string;
    password: string;
    authenticInformationConsent: boolean;
    licenseVerificationConsent: boolean;
    termsAgreementConsent: boolean;
    dataUsageConsentConsent: boolean;
    status: number;
    verifiedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}