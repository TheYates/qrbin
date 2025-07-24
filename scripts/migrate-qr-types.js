require("dotenv").config({ path: ".env.local" });
const { neon } = require("@neondatabase/serverless");

// This script adds the new columns for QR code types
// Run this once to migrate your existing database

async function migrate() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL environment variable is not set");
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    console.log("Starting migration...");

    // Add new columns to the links table
    await sql`
      ALTER TABLE links 
      ADD COLUMN IF NOT EXISTS qr_type VARCHAR(50),
      ADD COLUMN IF NOT EXISTS qr_content TEXT
    `;

    console.log("✅ Added qr_type and qr_content columns to links table");

    // Update existing records to have qr_type = 'url' and qr_content = original_url
    const result = await sql`
      UPDATE links 
      SET qr_type = 'url', qr_content = original_url 
      WHERE qr_type IS NULL AND original_url IS NOT NULL AND original_url != ''
    `;

    console.log(`✅ Updated ${result.length} existing records with URL type`);

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

// Run the migration
migrate();
