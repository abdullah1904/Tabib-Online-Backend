import {defineConfig} from "drizzle-kit";
import "dotenv/config";

export default defineConfig({
    schema: "./src/models",
    out: "./drizzle/migrations",
    dialect: "postgresql",
    dbCredentials:{
        url: process.env.DATABASE_URL as string,
    },
    verbose: true,
    strict: true
});