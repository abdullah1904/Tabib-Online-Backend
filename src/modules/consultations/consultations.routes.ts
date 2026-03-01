import { Router } from "express";
import { ConsultationsController } from "./consultations.controller";

const consultationsRouter = Router();
const consultationsController = new ConsultationsController();


consultationsRouter.get("/", consultationsController.listController);
consultationsRouter.post("/", consultationsController.createController);
consultationsRouter.put("/:id", consultationsController.updateController);
consultationsRouter.delete("/:id", consultationsController.removeController);

export default consultationsRouter;