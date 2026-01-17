import { CorsError } from "../errors";

const allowList = process.env.CORS_ALLOW_LIST
	? process.env.CORS_ALLOW_LIST.split(",").map((origin) => origin.trim())
	: ["http://localhost:3000", "http://localhost:5173"];

const env = process.env.NODE_ENV || "development";

export const corsOptions = {
	// If environment === development, allow all origins otherwise use allowList
	origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
		if (env === "development") {
			callback(null, true);
		} else {
			if (origin && allowList.indexOf(origin) !== -1) {
				callback(null, true);
			} else {
				callback(new CorsError("Not allowed by CORS"));
			}
		}
	},
	methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
	allowedHeaders: ["Content-Type", "Authorization"],
};
