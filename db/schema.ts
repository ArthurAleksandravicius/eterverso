import { pgTable, serial, varchar, text, index, foreignKey, integer, boolean, timestamp, unique, check, date, jsonb, uuid } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

// Estrutura das tabelas na database

export const categories = pgTable("categories", {
	id: uuid().primaryKey().notNull().defaultRandom(),

	name: varchar({ length: 100 }).notNull(),
	description: text().default(''),

	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow()
		.notNull()
		.$onUpdate(() => sql`CURRENT_TIMESTAMP`),
}, (table) => [
	unique("categories_name_key").on(table.name),
	index("idx_categories_name").using("btree", table.name.asc().nullsLast()),
]);

export const threads = pgTable("threads", {
	id: uuid().primaryKey().notNull().defaultRandom(),
	categoryId: uuid("category_id").notNull(),
	authorId: uuid("author_id").notNull(),

	title: varchar({ length: 200 }).notNull(),
	tag: varchar({ length: 20 }).default(''),
	pinned: boolean().default(false).notNull(),
	views: integer().default(0).notNull(),

	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow()
		.notNull()
		.$onUpdate(() => sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_threads_category_id").using("btree", table.categoryId.asc().nullsLast()),
	foreignKey({
		columns: [table.authorId],
		foreignColumns: [users.id],
		name: "threads_author_id_fkey"
	}),
	foreignKey({
		columns: [table.categoryId],
		foreignColumns: [categories.id],
		name: "threads_category_id_fkey"
	}).onDelete("cascade"),
]);

export const users = pgTable("users", {
	id: uuid().primaryKey().notNull().defaultRandom(),

	email: varchar({ length: 120 }).notNull(),
	username: varchar({ length: 50 }).notNull(),
	passwordHash: text("password_hash").default('').notNull(),

	avatar: text().default(''),
	title: varchar({ length: 100 }).default(''),
	bio: text().default(''),
	postsCount: integer("posts_count").default(0).notNull(),
	admTentativaUsada: boolean("adm_tentativa_usada").default(false).notNull(),
	role: varchar({ length: 20 }).default('member').notNull(),
	isStaff: boolean("is_staff").default(false).notNull(),

	joinDate: date("join_date").default(sql`CURRENT_DATE`).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow()
		.notNull()
		.$onUpdate(() => sql`CURRENT_TIMESTAMP`),
}, (table) => [
	unique("users_username_key").on(table.username),
	unique("users_email_key").on(table.email),
	check("users_role_check", sql`(role)::text = ANY ((ARRAY['member'::character varying, 'moderador'::character varying, 'admin'::character varying])::text[])`),
]);

export const posts = pgTable("posts", {
	id: uuid().primaryKey().notNull().defaultRandom(),
	threadId: uuid("thread_id").notNull(),
	authorId: uuid("author_id").notNull(),

	content: text().notNull(),
	edited: boolean().default(false).notNull(),

	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow()
		.notNull()
		.$onUpdate(() => sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_posts_thread_id").using("btree", table.threadId.asc().nullsLast()),
	foreignKey({
		columns: [table.authorId],
		foreignColumns: [users.id],
		name: "posts_author_id_fkey"
	}),
	foreignKey({
		columns: [table.threadId],
		foreignColumns: [threads.id],
		name: "posts_thread_id_fkey"
	}).onDelete("cascade"),
]);

export const personagens = pgTable("personagens", {
	id: uuid().primaryKey().notNull().defaultRandom(),
	authorId: uuid("author_id").notNull(),

	nome: varchar({ length: 100 }).notNull(),
	categoria: varchar({ length: 50 }).default(''),
	titulo: varchar({ length: 100 }).default(''),
	raca: varchar({ length: 80 }).default(''),
	faccao: varchar({ length: 120 }).default(''),
	status: varchar({ length: 80 }).default(''),
	imagem: text().default(''),
	descricao: text().default(""),
	stats: jsonb().default({}),
	skills: jsonb().default([]),
	mascaraTier: varchar("mascara_tier", { length: 60 }).default(''),

	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow()
		.notNull()
		.$onUpdate(() => sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_personagens_author_id").using("btree", table.authorId.asc().nullsLast()),
	foreignKey({
		columns: [table.authorId],
		foreignColumns: [users.id],
		name: "personagens_author_id_fkey"
	}),
]);

export const comments = pgTable("comments", {
	id: uuid().primaryKey().notNull().defaultRandom(),
	personagemId: uuid("personagem_id").notNull(),
	authorId: uuid("author_id").notNull(),

	content: text().notNull(),

	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow()
		.notNull()
		.$onUpdate(() => sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_comments_personagem_id").using("btree", table.personagemId.asc().nullsLast()),
	foreignKey({
		columns: [table.authorId],
		foreignColumns: [users.id],
		name: "comments_author_id_fkey"
	}),
	foreignKey({
		columns: [table.personagemId],
		foreignColumns: [personagens.id],
		name: "comments_personagem_id_fkey"
	}).onDelete("cascade"),
]);
