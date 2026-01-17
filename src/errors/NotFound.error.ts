import { DefaultError } from "./default.error";

export class NotFoundError extends DefaultError {
	constructor(message: string) {
		super(message, 404, "NotFoundError");
	}
}
