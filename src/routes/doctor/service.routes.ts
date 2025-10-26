import { Router } from "express";
import { CreateServiceDoctor, DeleteServiceDoctor, ListServicesDoctor } from "../../controllers/doctor/service.controller";

const doctorServiceRouter = Router();

doctorServiceRouter.post("/", CreateServiceDoctor);
doctorServiceRouter.get("/", ListServicesDoctor);
doctorServiceRouter.delete("/:id", DeleteServiceDoctor);

export default doctorServiceRouter;