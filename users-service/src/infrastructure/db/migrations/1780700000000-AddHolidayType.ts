import { type MigrationInterface, type QueryRunner } from "typeorm"

export class AddHolidayType1780700000000 implements MigrationInterface {
    name = "AddHolidayType1780700000000"

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TYPE "public"."holidays_type_enum" AS ENUM('required', 'optional')`,
        )
        await queryRunner.query(
            `ALTER TABLE "holidays" ADD "type" "public"."holidays_type_enum" NOT NULL DEFAULT 'required'`,
        )
        await queryRunner.query(
            `ALTER TABLE "holidays" ALTER COLUMN "type" DROP DEFAULT`,
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "holidays" DROP COLUMN "type"`)
        await queryRunner.query(`DROP TYPE "public"."holidays_type_enum"`)
    }
}
