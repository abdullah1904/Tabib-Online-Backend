import { IAdmin } from "./admin";

declare global {
  namespace Express {
    interface Request {
      admin: IAdmin & {
        id: number;
      }
    }
  }
}