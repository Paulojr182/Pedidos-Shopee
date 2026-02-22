import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import { connectDB, disconnectDB } from "./db";
import routes from "./routes";
import { errorHandlerMiddleware } from "./middleware/errorHandler.middleware";
import { corsOptions } from "./libs/cors.lib";

dotenv.config({
	quiet: true,
});

const app = express();
app.use(cors(corsOptions));
app.options("", cors(corsOptions));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT || 3000;

async function start() {
	await connectDB();
	app.use("/api", routes);
	app.get("/", (_req, res) =>
		res.json({
			ok: true,
			message: "Server running",
			environment: process.env.NODE_ENV,
			timestamp: new Date().toISOString(),
			uptime: process.uptime(),
			memory: {
				used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
				total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`,
			},
			version: "1.0.0",
		}),
	);
	// Error handling middleware
	app.use(errorHandlerMiddleware);
	app.listen(port, () => {
		console.log(`Server listening on ${port}`);
	});
}

start().catch(async (err) => {
	await disconnectDB();
	console.dir(err);
	console.error("Failed to start server", err);
	process.exit(1);
});
