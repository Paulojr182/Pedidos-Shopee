const allowList = process.env.CORS_ALLOW_LIST ? process.env.CORS_ALLOW_LIST.split(",").map((o) => o.trim()) : [];

const env = process.env.NODE_ENV ?? "development";

export const corsOptions = {
	origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
		// Allow no origin (Postman, server-to-server)
		if (!origin) {
			return callback(null, true);
		}

		// Development: allow all
		if (env === "development") {
			return callback(null, true);
		}

		// Production: valida allow list
		if (allowList.includes(origin)) {
			return callback(null, true);
		}

		// Not allowed
		return callback(null, false);
	},

	credentials: true,
	methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
	allowedHeaders: ["Content-Type", "Authorization"],
};
