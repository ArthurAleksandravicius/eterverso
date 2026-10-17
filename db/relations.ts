import { relations } from "drizzle-orm/relations";
import { users, threads, categories, posts, personagens, comments, wikiPosts } from "./schema";

// Relações entre as tabelas

export const threadsRelations = relations(threads, ({ one, many }) => ({
	user: one(users, {
		fields: [threads.authorId],
		references: [users.id]
	}),
	category: one(categories, {
		fields: [threads.categoryId],
		references: [categories.id]
	}),
	posts: many(posts),
}));

export const usersRelations = relations(users, ({ many }) => ({
	threads: many(threads),
	posts: many(posts),
	personagens: many(personagens),
	comments: many(comments),
	wikiPosts: many(wikiPosts),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
	threads: many(threads),
}));

export const postsRelations = relations(posts, ({ one }) => ({
	user: one(users, {
		fields: [posts.authorId],
		references: [users.id]
	}),
	thread: one(threads, {
		fields: [posts.threadId],
		references: [threads.id]
	}),
}));

export const personagensRelations = relations(personagens, ({ one, many }) => ({
	user: one(users, {
		fields: [personagens.authorId],
		references: [users.id]
	}),
	comments: many(comments),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
	user: one(users, {
		fields: [comments.authorId],
		references: [users.id]
	}),
	personagen: one(personagens, {
		fields: [comments.personagemId],
		references: [personagens.id]
	}),
}));

export const wikiPostsRelations = relations(wikiPosts, ({ one }) => ({
	user: one(users, {
		fields: [wikiPosts.authorId],
		references: [users.id]
	}),
}));