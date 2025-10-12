export interface IUser {
    fullName: string;
    age: number;
    gender: number;
    email: string;
    address: string;
    phoneNumber: string;
    emergencyContactNumber: string;
    emergencyContactName: string;
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
