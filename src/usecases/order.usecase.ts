import { BadRequestError, NotFoundError } from "../errors";

import type { GetAllOrdersFilter, IOrderRepository } from "../repositories/order.repository";
import type { OrderItem, OrderStatus } from "../models/order.model";

export interface IOrderUseCase {
	createOrder(orderData: CreateOrderDTO): Promise<OrderResponseDTO>;
	getAllOrders(filter: GetAllOrdersFilter): Promise<PaginatedOrderResponseDTO>;
	getOrder(orderId: string): Promise<OrderResponseDTO>;
	updateOrder(orderId: string, updatedData: Partial<CreateOrderDTO>): Promise<OrderResponseDTO>;
	deleteOrder(orderId: string): Promise<boolean>;
}

export interface CreateOrderDTO {
	clientName: string;
	items: OrderItem[];
	orderNumber: string;
	status: OrderStatus;
}

export interface OrderResponseDTO {
	id: string;
	clientName: string;
	createdAt: Date;
	items: OrderItem[];
	orderNumber: string;
	status: OrderStatus;
}

export interface PaginatedOrderResponseDTO {
	orders: OrderResponseDTO[];
	total: number;
	nextPage: boolean;
	previousPage: boolean;
}

export class OrderUseCase implements IOrderUseCase {
	private orderRepository: IOrderRepository;

	constructor(orderRepository: IOrderRepository) {
		this.orderRepository = orderRepository;
	}

	async createOrder(orderData: CreateOrderDTO): Promise<OrderResponseDTO> {
		this.validateOrderData(orderData);
		const createdOrder = await this.orderRepository.create(orderData);
		return createdOrder;
	}

	async getAllOrders(filter: GetAllOrdersFilter): Promise<PaginatedOrderResponseDTO> {
		this.validatePaginationParams(filter.page, filter.pageSize);
		const { orders, total } = await this.orderRepository.findAll(filter);
		const nextPage = filter.page && filter.pageSize ? filter.page * filter.pageSize < total : false;
		const previousPage = filter.page !== undefined && filter.page > 1;
		return { orders, total, nextPage, previousPage };
	}

	async getOrder(orderId: string): Promise<OrderResponseDTO> {
		const order = await this.orderRepository.findById(orderId);
		if (!order) {
			throw new NotFoundError(`Order with id ${orderId} not found`);
		}
		return order;
	}

	async updateOrder(orderId: string, updatedData: Partial<CreateOrderDTO>) {
		this.validateUpdateData(updatedData);
		const updatedOrder = await this.orderRepository.update(orderId, updatedData);
		if (!updatedOrder) {
			throw new NotFoundError(`Order with id ${orderId} not found`);
		}
		return updatedOrder;
	}

	async deleteOrder(orderId: string) {
		const deletedOrder = await this.orderRepository.delete(orderId);
		if (!deletedOrder) {
			throw new NotFoundError(`Order with id ${orderId} not found`);
		}
		return deletedOrder;
	}

	private validateOrderData(orderData: CreateOrderDTO) {
		if (!orderData.clientName || orderData.clientName.trim() === "") {
			throw new BadRequestError("Client name is required");
		}
		if (!orderData.items || orderData.items.length === 0) {
			throw new BadRequestError("At least one order item is required");
		}
		if (orderData.items && orderData.items.length >= 1) {
			for (const item of orderData.items) {
				if (!item.color || item.color.trim() === "") {
					throw new BadRequestError("Item color is required");
				}
				if (!item.type || item.type.trim() === "") {
					throw new BadRequestError("Item type is required");
				}
				if (item.quantity === undefined || item.quantity <= 0) {
					throw new BadRequestError("Item quantity must be a positive number");
				}
			}
		}
		if (!orderData.orderNumber || orderData.orderNumber.trim() === "") {
			throw new BadRequestError("Order number is required");
		}
		if (!orderData.status) {
			throw new BadRequestError("Order status is required");
		}
	}

	private validatePaginationParams(page?: number, pageSize?: number) {
		if (page !== undefined && (Number.isNaN(page) || page <= 0)) {
			throw new BadRequestError("Page must be a positive number");
		}
		if (pageSize !== undefined && (Number.isNaN(pageSize) || pageSize <= 0)) {
			throw new BadRequestError("Page size must be a positive number");
		}
	}

	private validateUpdateData(updatedData: Partial<CreateOrderDTO>) {
		if (updatedData.clientName !== undefined && updatedData.clientName.trim() === "") {
			throw new BadRequestError("Client name cannot be empty");
		}
		if (updatedData.items !== undefined && updatedData.items.length === 0) {
			throw new BadRequestError("At least one order item is required");
		}
		if (updatedData.items && updatedData.items.length >= 1) {
			for (const item of updatedData.items) {
				if (!item.color || item.color.trim() === "") {
					throw new BadRequestError("Item color is required");
				}
				if (!item.type || item.type.trim() === "") {
					throw new BadRequestError("Item type is required");
				}
				if (item.quantity === undefined || item.quantity <= 0) {
					throw new BadRequestError("Item quantity must be a positive number");
				}
				if (item.nameToPrint !== undefined && item.nameToPrint.trim() === "") {
					throw new BadRequestError("Item name to print cannot be empty");
				}
			}
		}
		if (updatedData.orderNumber !== undefined && updatedData.orderNumber.trim() === "") {
			throw new BadRequestError("Order number cannot be empty");
		}
		if (updatedData.status !== undefined && !["pendente", "a_fazer", "projeto_feito", "pronto"].includes(updatedData.status)) {
			throw new BadRequestError("Invalid order status, must be one of: pendente, a_fazer, projeto_feito, pronto");
		}
	}
}
