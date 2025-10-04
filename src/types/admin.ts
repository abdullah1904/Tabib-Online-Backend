export interface IAdmin {
    fullName: string;
    email: string;
    phone: string;
    privilegeLevel: number;
    recoveryEmail: string | null;
    password: string;
    status: number;
    imageURL: string | null;
    createdAt: Date;
    updatedAt: Date;
}