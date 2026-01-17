import { Router } from "express";
import orderRouter from "./order.routes";

const router = Router();

router.get("/ping", (_req, res) => res.json({ pong: true }));
router.use("/orders", orderRouter);

export default router;
