import { Router } from "express";
import { OrderController } from "../controllers/order.controller";
import { OrderUseCase } from "../usecases/order.usecase";
import { OrderRepository } from "../repositories/order.repository";

const orderRepository = new OrderRepository();
const orderUseCase = new OrderUseCase(orderRepository);
const orderController = new OrderController(orderUseCase);

const orderRouter = Router();

orderRouter.post("/", orderController.createOrder.bind(orderController));
orderRouter.get("/", orderController.getAllOrders.bind(orderController));
orderRouter.get("/:orderId", orderController.getOrder.bind(orderController));
orderRouter.put("/:orderId", orderController.updateOrder.bind(orderController));
orderRouter.delete("/:orderId", orderController.deleteOrder.bind(orderController));

export default orderRouter;
