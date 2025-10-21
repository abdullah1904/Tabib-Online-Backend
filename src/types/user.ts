export interface IUser {
    fullName: string;
    imageURL: string | null;
    age: number;
    gender: number;
    email: string;
    address: string;
    phoneNumber: string;
    emergencyContactNumber: string;
    emergencyContactName: string;
    bloodType: string;
    height: number;
    weight: number;
    allergies: string;
    currentMedications: string;
    familyMedicalHistory: string;
    pastMedicalHistory: string;
    verificationDocumentType: number;
    verificationDocumentNumber: string;
    verificationDocumentURL: string;
    password: string;
    treatmentConsent: boolean;
    healthInfoDisclosureConsent: boolean;
    privacyPolicyConsent: boolean;
    status: number;
    verifiedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
