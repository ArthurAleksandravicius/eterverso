import { config } from 'dotenv';
config({ path: '.env.local' });
import postgres from 'postgres';

async function main() {
    const sql = postgres(process.env.DATABASE_URL_DIRECT!);
    await sql`
        ALTER TABLE comments DROP CONSTRAINT comments_content_check;
    `;
    console.log("Constraint dropped!");
    process.exit(0);
}

main();
