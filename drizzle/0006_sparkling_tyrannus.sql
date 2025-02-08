ALTER TABLE "verification_code" DROP CONSTRAINT "verification_code_pkey";
ALTER TABLE "verification_code" DROP CONSTRAINT "verification_code_value_unique";--> statement-breakpoint
ALTER TABLE "verification_code" ADD PRIMARY KEY ("value");