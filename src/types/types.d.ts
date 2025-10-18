import { IAdmin } from "./admin";
import { IDoctor } from "./doctor";
import { IUser } from "./user";

declare global {
  namespace Express {
    interface Request {
      admin: IAdmin & {
        id: number;
      },
      user: IUser & {
        id: number;
      },
      doctor: IDoctor & {
        id: number;
      }
    }
  }
}