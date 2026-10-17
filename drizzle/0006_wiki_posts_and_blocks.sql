CREATE TABLE IF NOT EXISTS "wiki_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"author_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
	"titulo" varchar(200) NOT NULL,
	"subtitulo" varchar(200) DEFAULT '',
	"categoria" varchar(80) DEFAULT 'Cena de RPG',
	"status" varchar(80) DEFAULT 'Em Andamento',
	"resumo" text DEFAULT '',
	"banner" text DEFAULT '',
	"descricao" text DEFAULT '',
	"theme" jsonb DEFAULT '{}'::jsonb,
	"infobox" jsonb DEFAULT '{}'::jsonb,
	"blocks" jsonb DEFAULT '[]'::jsonb,
	"turns" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_wiki_posts_author_id" ON "wiki_posts" USING btree ("author_id");
--> statement-breakpoint
ALTER TABLE "personagens" ADD COLUMN IF NOT EXISTS "blocks" jsonb DEFAULT '[]'::jsonb;
--> statement-breakpoint
ALTER TABLE "personagens" ADD COLUMN IF NOT EXISTS "theme" jsonb DEFAULT '{}'::jsonb;
