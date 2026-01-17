export class DefaultError extends Error {
	public readonly statusCode: number;
	public readonly isOperational: boolean;

	constructor(message = "Internal Error", statusCode = 500, name = "DefaultError", isOperational = true) {
		super(message);
		Object.setPrototypeOf(this, new.target.prototype);
		this.name = name;
		this.statusCode = statusCode;
		this.isOperational = isOperational;
		if (typeof Error.captureStackTrace === "function") {
			Error.captureStackTrace(this, this.constructor);
		}
	}

	toJSON() {
		return {
			name: this.name,
			message: this.message,
			statusCode: this.statusCode,
			stack: process.env.NODE_ENV === "production" ? undefined : this.stack,
		};
	}
}

export default DefaultError;
