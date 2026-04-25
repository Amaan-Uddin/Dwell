CREATE SCHEMA "auth";
--> statement-breakpoint
CREATE TYPE "auth"."user_roles" AS ENUM('ADMIN', 'USER', 'GUEST');--> statement-breakpoint
CREATE TYPE "auth"."user_status" AS ENUM('ACTIVE', 'DELETED');--> statement-breakpoint
CREATE TABLE "auth"."user" (
	"id" uuid PRIMARY KEY NOT NULL,
	"firstName" varchar(30) NOT NULL,
	"lastName" varchar(30),
	"fullName" varchar(61) NOT NULL,
	"email" varchar(254) NOT NULL,
	"password" varchar(256),
	"externalAuthId" varchar,
	"status" "auth"."user_status" NOT NULL,
	"role" "auth"."user_roles" NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp NOT NULL,
	"deletedAt" timestamp
);
--> statement-breakpoint
CREATE UNIQUE INDEX "emailUniqueIndex" ON "auth"."user" USING btree (lower("email"));