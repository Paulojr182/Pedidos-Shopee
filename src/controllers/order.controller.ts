import type { CreateOrderDTO, IOrderUseCase } from "../usecases/order.usecase";
import type { GetAllOrdersFilter } from "../repositories/order.repository";
import type { Request, Response } from "express";

export class OrderController {
	private orderUseCase: IOrderUseCase;

	constructor(orderUseCase: IOrderUseCase) {
		this.orderUseCase = orderUseCase;
	}

	async createOrder(req: Request, res: Response) {
		const orderData: CreateOrderDTO = req.body;
		const createdOrder = await this.orderUseCase.createOrder(orderData);
		res.status(201).json({ message: "Order created", data: createdOrder, statusCode: 201 });
		return;
	}

	async getAllOrders(req: Request, res: Response) {
		const { orderNumber, clientName, status, page, pageSize } = req.query as GetAllOrdersFilter;
		const { orders, total, nextPage, previousPage } = await this.orderUseCase.getAllOrders({ orderNumber, clientName, status, page, pageSize });
		res.status(200).json({ message: "Orders retrieved", data: { orders }, total, nextPage, previousPage, statusCode: 200 });
		return;
	}

	async getOrder(req: Request, res: Response) {
		const { orderId } = req.params as { orderId: string };
		const order = await this.orderUseCase.getOrder(orderId);
		res.status(200).json({ message: "Order details", data: order, statusCode: 200 });
		return;
	}

	async updateOrder(req: Request, res: Response) {
		const { orderId } = req.params as { orderId: string };
		const updatedData: Partial<CreateOrderDTO> = req.body;
		const updatedOrder = await this.orderUseCase.updateOrder(orderId, updatedData);
		res.status(200).json({ message: "Order updated", data: updatedOrder, statusCode: 200 });
		return;
	}

	async deleteOrder(req: Request, res: Response) {
		const { orderId } = req.params as { orderId: string };
		const deletedOrder = await this.orderUseCase.deleteOrder(orderId);
		res.status(200).json({ message: "Order deleted", data: deletedOrder, statusCode: 200 });
		return;
	}

	async importOrders(req: Request, res: Response) {
		const file = req.file;
		const importedOrders = await this.orderUseCase.createManyOrders(file);
		res.status(201).json({ message: "Orders imported", data: importedOrders, statusCode: 201 });
		return;
	}
}
