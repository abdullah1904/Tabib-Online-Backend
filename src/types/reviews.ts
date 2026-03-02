export interface IReview {
    id: number;
    doctorId: number;
    userId: number;
    rating: number;
    comment: string;
    createdAt: Date;
    updatedAt: Date;
}