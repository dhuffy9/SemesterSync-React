import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
	out: "./drizzle",
	dialect: "mysql",
	schema: "./src/db/schemas/**/*.ts",
	dbCredentials: {
		url: process.env.DATABASE_URL as string,
	},
});
