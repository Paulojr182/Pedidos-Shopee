import { BadRequestError, NotFoundError, CorsError } from "../errors";
import type { NextFunction, Request, Response } from "express";

export function errorHandlerMiddleware(err: Error, _: Request, res: Response, __: NextFunction): void {
	if (err instanceof BadRequestError || err instanceof NotFoundError || err instanceof CorsError) {
		console.warn(`[${err.name}]: ${err.message}`);
		res.status(err.statusCode).json(err.toJSON());
		return;
	}

	if (err.message.includes("E11000")) {
		console.warn(`[MongooseError]: ${err.message}`);
		const mongooseError = new BadRequestError("Duplicate key error");
		res.status(mongooseError.statusCode).json(mongooseError.toJSON());
		return;
	}

	console.error(`[UnknownError]: ${err.message}`);
	res.status(500).json({
		name: "InternalServerError",
		message: "An unexpected error occurred.",
		statusCode: 500,
		stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
	});
	return;
}
