import { Schema, model } from "mongoose";
import type { Document } from "mongoose";

export interface OrderItem {
	color: string;
	type: string;
	nameToPrint?: string;
	quantity: number;
}

export type OrderStatus = "pendente" | "a_fazer" | "projeto_feito" | "pronto";

export interface OrderDocument extends Document {
	clientName: string;
	createdAt: Date;
	id: string;
	items: OrderItem[];
	orderNumber: string;
	status: OrderStatus;
}

const OrderItemSchema = new Schema<OrderItem>(
	{
		color: { type: String, required: true },
		type: { type: String, required: true },
		nameToPrint: String,
		quantity: { type: Number, required: true },
	},
	{ _id: false },
);

const OrderSchema = new Schema<OrderDocument>(
	{
		clientName: { type: String, required: true },
		createdAt: { type: Date, default: () => new Date(), required: true },
		id: { type: String, required: true, unique: true },
		items: { type: [OrderItemSchema], required: true },
		orderNumber: { type: String, required: true, unique: true },
		status: {
			type: String,
			enum: ["pendente", "a_fazer", "projeto_feito", "pronto"],
			default: "pendente",
			required: true,
		},
	},
	{
		versionKey: false,
	},
);

const OrderModel = model<OrderDocument>("PEDIDOS", OrderSchema);

export default OrderModel;
