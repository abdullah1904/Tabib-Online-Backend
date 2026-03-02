export interface IUser {
  fullName: string;
  age: number;
  gender: number;
  email: string;
  address: string;
  phoneNumber: string;
  role: number;
  status: number;
  balance: number;
  imageURL: string;
}

export interface IProfessionalInfo {
  specialization: number;
  yearsOfExperience: number;
  PMDCVerifiedAt: Date | null;
  prefix: number
}