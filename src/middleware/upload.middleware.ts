import path from "node:path";
import { existsSync, mkdirSync } from "node:fs";
import multer from "multer";
import { BadRequestError } from "../errors";

const tempDir = path.resolve(process.cwd(), "temp");
if (!existsSync(tempDir)) {
	mkdirSync(tempDir, { recursive: true });
}

const storage = multer.diskStorage({
	destination: (_req, _file, cb) => cb(null, tempDir),
	filename: (_req, file, cb) => {
		const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
		const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-()_ ]/g, "_");
		cb(null, `${unique}-${safeName}`);
	},
});

// biome-ignore lint/suspicious/noExplicitAny: <will be fixed later>
function fileFilter(_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) {
	const allowed = [".xlsx", ".xls"];
	const ext = path.extname(file.originalname).toLowerCase();
	if (allowed.includes(ext)) return cb(null, true);
	return cb(new BadRequestError("Somente arquivos .xlsx ou .xls são permitidos"));
}

export const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });
