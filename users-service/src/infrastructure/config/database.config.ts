import { TypeOrmModuleOptions } from "@nestjs/typeorm"
import "dotenv/config"

const dirName = process.env.NODE_ENV === "production" ? "dist" : "src"
const fileExtension = process.env.NODE_ENV === "production" ? "js" : "ts"

export const databaseConfig: TypeOrmModuleOptions = {
    type: "postgres",
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT!),
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    entities: [`${dirName}/infrastructure/db/entities/*.entity.${fileExtension}`],
    migrations: [`${dirName}/infrastructure/db/migrations/*.${fileExtension}`],
    migrationsRun: process.env.DATABASE_MIGRATIONS_RUN === "true",
    retryAttempts: 0,
} as const
