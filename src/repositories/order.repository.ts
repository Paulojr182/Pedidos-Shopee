import crypto from "node:crypto";
import OrderModel from "../models/order.model";
import type { OrderDocument, OrderStatus } from "../models/order.model";

export interface IOrderRepository {
	create(orderData: Partial<OrderDocument>): Promise<Order>;
	findAll(filter: GetAllOrdersFilter): Promise<{ orders: Order[]; total: number }>;
	findById(orderId: string): Promise<Order | null>;
	update(orderId: string, updatedOrder: Partial<OrderDocument>): Promise<Order | null>;
	delete(orderId: string): Promise<boolean>;
}

export interface GetAllOrdersFilter {
	orderNumber?: string;
	clientName?: string;
	status?: OrderStatus;
	page?: number;
	pageSize?: number;
}

type Query = {
	orderNumber?: string;
	clientName?: string;
	status?: string;
	page?: number;
	pageSize?: number;
};

export interface Order {
	id: string;
	clientName: string;
	createdAt: Date;
	items: OrderDocument["items"];
	orderNumber: string;
	status: OrderStatus;
}

export class OrderRepository implements IOrderRepository {
	async create(orderData: Partial<OrderDocument>): Promise<Order> {
		orderData.id = this.generateId();
		const created = await OrderModel.create(orderData);
		return this.mapToDTO(created);
	}

	async findAll(filter: GetAllOrdersFilter): Promise<{ orders: Order[]; total: number }> {
		const query: Query = this.buildQuery(filter);

		const page = filter.page && filter.page > 0 ? filter.page : 1;
		const pageSize = filter.pageSize && filter.pageSize > 0 ? filter.pageSize : 10;
		const skip = (page - 1) * pageSize;
		const total = await OrderModel.countDocuments(query).exec();
		const orders = await OrderModel.find(query).skip(skip).limit(pageSize).exec();
		return { orders: orders.map(this.mapToDTO), total };
	}

	async findById(orderId: string): Promise<Order | null> {
		const order = await OrderModel.findOne({ id: orderId }).exec();
		return order ? this.mapToDTO(order) : null;
	}

	async update(orderId: string, updatedOrder: Partial<OrderDocument>): Promise<Order | null> {
		const updated = await OrderModel.findOneAndUpdate({ id: orderId }, updatedOrder, { new: true }).exec();
		return updated ? this.mapToDTO(updated) : null;
	}

	async delete(orderId: string): Promise<boolean> {
		const res = await OrderModel.findOneAndDelete({ id: orderId }).exec();
		return !!res;
	}

	private generateId(): string {
		return crypto.randomUUID();
	}

	private buildQuery(filter: GetAllOrdersFilter): Query {
		const query: Query = {};

		if (filter.orderNumber) {
			query.orderNumber = filter.orderNumber;
		}
		if (filter.clientName) {
			query.clientName = filter.clientName;
		}
		if (filter.status) {
			query.status = filter.status;
		}

		return query;
	}

	private mapToDTO(doc: OrderDocument): Order {
		return {
			id: doc.id,
			clientName: doc.clientName,
			createdAt: doc.createdAt,
			items: doc.items,
			orderNumber: doc.orderNumber,
			status: doc.status,
		} as OrderDocument;
	}
}
