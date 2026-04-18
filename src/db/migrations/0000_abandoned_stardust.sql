CREATE SCHEMA "auth";
--> statement-breakpoint
CREATE TABLE "auth"."user" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "auth"."user_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"firstName" varchar(30) NOT NULL,
	"lastName" varchar(30),
	"fullName" varchar(60) GENERATED ALWAYS AS ("auth"."user"."firstName" || ' ' || "auth"."user"."lastName") STORED NOT NULL,
	"email" varchar(254) NOT NULL,
	"password" varchar(256),
	"externalAuthId" varchar,
	"status" "auth"."user_status" NOT NULL,
	"role" "auth"."user_roles" NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp,
	"deletedAt" timestamp
);
--> statement-breakpoint
CREATE UNIQUE INDEX "emailUniqueIndex" ON "auth"."user" USING btree (lower("email"));