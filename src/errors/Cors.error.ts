import { DefaultError } from "./default.error";

export class CorsError extends DefaultError {
	constructor(message = "CORS Error") {
		super(message, 403);
	}
}
