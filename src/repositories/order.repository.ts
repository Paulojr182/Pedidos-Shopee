import crypto from "node:crypto";
import OrderModel from "../models/order.model";
import type { OrderDocument, OrderStatus } from "../models/order.model";

export interface IOrderRepository {
	create(orderData: Partial<OrderDocument>): Promise<Order>;
	findAll(filter: GetAllOrdersFilter): Promise<{ orders: Order[]; total: number }>;
	findById(orderId: string): Promise<Order | null>;
	countByStatus(status: Partial<OrderStatus>): Promise<number>;
	update(orderId: string, updatedOrder: Partial<OrderDocument>): Promise<Order | null>;
	delete(orderId: string): Promise<boolean>;
	createManyOrders(ordersData: Partial<OrderDocument>[]): Promise<{ orders: Order[]; failed: Partial<OrderDocument>[] }>;
}

export interface GetAllOrdersFilter {
	orderNumber?: string;
	clientName?: string;
	status?: OrderStatus;
	page?: number;
	pageSize?: number;
	search?: string;
	shipmentExpiresOnBefore?: string;
}

type Query = {
	orderNumber?: string;
	clientName?: string;
	status?: string | { $ne: string };
	page?: number;
	pageSize?: number;
	$or?: { [key: string]: RegExp }[];
	shippingDeadline?: { $lt: Date };
};

export interface Order {
	id: string;
	clientName: string;
	createdAt: Date;
	items: OrderDocument["items"];
	orderNumber: string;
	status: OrderStatus;
	orderCreatedAt: Date;
	shippingDeadline: Date;
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
		const orders = await OrderModel.find({ ...query })
			.skip(skip)
			.limit(pageSize)
			.exec();
		return { orders: orders.map(this.mapToDTO), total };
	}

	async findById(orderId: string): Promise<Order | null> {
		const order = await OrderModel.findOne({ id: orderId }).exec();
		return order ? this.mapToDTO(order) : null;
	}

	async countByStatus(status: Partial<OrderStatus>): Promise<number> {
		const count = await OrderModel.countDocuments({ status }).exec();
		return count;
	}

	async update(orderId: string, updatedOrder: Partial<OrderDocument>): Promise<Order | null> {
		const updated = await OrderModel.findOneAndUpdate({ id: orderId }, updatedOrder, { new: true }).exec();
		return updated ? this.mapToDTO(updated) : null;
	}

	async delete(orderId: string): Promise<boolean> {
		const res = await OrderModel.findOneAndDelete({ id: orderId }).exec();
		return !!res;
	}

	async createManyOrders(ordersData: Partial<OrderDocument>[]): Promise<{ orders: Order[]; failed: Partial<OrderDocument>[] }> {
		const ordersWithIds = ordersData.map((orderData) => ({
			...orderData,
			id: this.generateId(),
		}));
		try {
			const createdOrders = await OrderModel.insertMany(ordersWithIds, { ordered: false });
			const inserted = createdOrders.map((doc) => this.mapToDTO(doc as OrderDocument));
			return { orders: inserted, failed: [] };
		} catch (err) {
			// biome-ignore lint/suspicious/noExplicitAny: <Will be fixed later>
			const e: any = err;
			// biome-ignore lint/suspicious/noExplicitAny: <Will be fixed later>
			const writeErrors: any[] = e.writeErrors || [];
			// biome-ignore lint/suspicious/noExplicitAny: <Will be fixed later>
			const insertedDocs: any[] = e.insertedDocs || [];

			const failedDetails = writeErrors.map((w) => ({
				index: w.index,
				code: w.code,
				message: w.errmsg,
				doc: w.op, // documento que falhou
			}));

			const failedDocs = failedDetails.map((f) => ordersWithIds[f.index]);

			return { orders: insertedDocs, failed: failedDocs };
		}
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

		if (filter.search) {
			const searchRegex = new RegExp(filter.search, "i");
			query.$or = [{ orderNumber: searchRegex }, { clientName: searchRegex }, { items: { $elemMatch: { nameToPrint: searchRegex } } }] as {
				[key: string]: RegExp;
			}[];
		}

		if (filter.shipmentExpiresOnBefore) {
			const expiredAt = new Date(filter.shipmentExpiresOnBefore);
			if (!Number.isNaN(expiredAt.getTime())) {
				// Filter by shippingDeadline: less than the specified date and greater than or equal to 24 hours before
				query.shippingDeadline = {
					$lt: expiredAt,
				};
				query.status = { $ne: "enviado" };
			}
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
			orderCreatedAt: doc.orderCreatedAt,
			shippingDeadline: doc.shippingDeadline,
		} as OrderDocument;
	}
}
