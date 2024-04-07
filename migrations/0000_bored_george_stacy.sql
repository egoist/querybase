CREATE TABLE `connection` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` integer NOT NULL,
	`nickname` text NOT NULL,
	`type` text NOT NULL,
	`host` text,
	`port` text,
	`user` text,
	`config` text,
	`password` text,
	`database` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `query` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` integer NOT NULL,
	`connectionId` text NOT NULL,
	`title` text NOT NULL,
	`query` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `query_connectionId_idx` ON `query` (`connectionId`);