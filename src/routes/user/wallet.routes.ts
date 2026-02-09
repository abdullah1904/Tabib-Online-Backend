import { Router } from "express";
import { CreateWalletTopUp, DeleteWalletPendingTopUp, ListWalletTopUps } from "../../controllers/user/wallet.controller";

const userWalletRouter = Router();

userWalletRouter.post("/top-ups", CreateWalletTopUp);
userWalletRouter.get("/top-ups", ListWalletTopUps);
userWalletRouter.delete("/top-ups/:sessionId", DeleteWalletPendingTopUp);

export default userWalletRouter;