import mongoose from "mongoose";

export async function connectDB() {
	const uri = process.env.MONGODB_URI;

	if (!uri) {
		throw new Error("MONGODB_URI is not defined in environment variables");
	}
	await mongoose.connect(uri, {
		dbName: "Pamar3D",
	});
	console.log("Connected to MongoDB");
}

export async function disconnectDB() {
	await mongoose.disconnect();
	console.log("Disconnected from MongoDB");
}
