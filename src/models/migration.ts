import mongoose from "mongoose";
import OrderModel from "./order.model";
import dotenv from "dotenv";
dotenv.config({ quiet: true });

const DAYS = 5;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

async function runMigration() {
	try {
		await mongoose.connect(process.env.MONGODB_URI!, { dbName: "Pamar3D" });

		const orders = await OrderModel.find({}).select("_id createdAt");

		console.log(`🔎 ${orders.length} pedidos encontrados`);

		const ops = [];

		for (const order of orders) {
			if (!order.createdAt) continue;

			ops.push({
				updateOne: {
					filter: { _id: order._id },
					update: {
						$set: {
							orderCreatedAt: order.createdAt,
							shippingDeadline: new Date(order.createdAt.getTime() + DAYS * DAY_IN_MS),
						},
					},
				},
			});
		}

		if (ops.length > 0) {
			await OrderModel.bulkWrite(ops);
		}

		console.log("✅ Migração finalizada com sucesso");
		process.exit(0);
	} catch (error) {
		console.error("❌ Erro na migração:", error);
		process.exit(1);
	}
}

runMigration();
