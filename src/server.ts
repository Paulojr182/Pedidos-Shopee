import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { connectDB } from "./db";
import routes from "./routes";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3000;

async function start() {
	await connectDB();

	app.use("/api", routes);

	app.get("/", (_req, res) => res.json({ ok: true, message: "Server running" }));

	app.listen(port, () => {
		console.log(`Server listening on ${port}`);
	});
}

start().catch((err) => {
	console.error("Failed to start server", err);
	process.exit(1);
});
