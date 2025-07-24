import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export interface Link {
  id: number;
  original_url: string;
  short_code: string;
  title?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  click_count: number;
  is_active: boolean;
  qr_type?: string;
  qr_content?: string;
}

export interface QRCode {
  id: number;
  link_id: number;
  foreground_color: string;
  background_color: string;
  size: number;
  error_correction_level: string;
  logo_url?: string;
  logo_size?: number;
  created_at: string;
  updated_at: string;
}

export async function createLink(
  originalUrl: string,
  title?: string,
  description?: string
) {
  const shortCode = generateShortCode();

  const [link] = await sql`
    INSERT INTO links (original_url, short_code, title, description)
    VALUES (${originalUrl}, ${shortCode}, ${title}, ${description})
    RETURNING *
  `;

  // Create default QR code configuration
  await sql`
    INSERT INTO qr_codes (link_id, foreground_color, background_color, size, error_correction_level)
    VALUES (${link.id}, '#000000', '#ffffff', 200, 'M')
  `;

  return link as Link;
}

export async function getLinks() {
  const links = await sql`
    SELECT l.*,
           q.foreground_color,
           q.background_color,
           q.size,
           q.error_correction_level,
           q.logo_url,
           q.logo_size
    FROM links l
    LEFT JOIN qr_codes q ON l.id = q.link_id
    ORDER BY l.created_at DESC
  `;
  return links as (Link & Partial<QRCode>)[];
}

export async function getLinkByShortCode(shortCode: string) {
  const [link] = await sql`
    SELECT * FROM links 
    WHERE short_code = ${shortCode}
  `;
  return link as Link | undefined;
}

export async function getLinkById(id: number) {
  const [link] = await sql`
    SELECT l.*, 
           q.foreground_color, 
           q.background_color, 
           q.size, 
           q.error_correction_level,
           q.logo_url,
           q.logo_size
    FROM links l
    LEFT JOIN qr_codes q ON l.id = q.link_id
    WHERE l.id = ${id}
  `;
  return link as (Link & Partial<QRCode>) | undefined;
}

export async function updateLinkUrl(id: number, originalUrl: string) {
  const [link] = await sql`
    UPDATE links 
    SET original_url = ${originalUrl}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING *
  `;
  return link as Link;
}

export async function updateQRCode(linkId: number, config: Partial<QRCode>) {
  const [qrCode] = await sql`
    UPDATE qr_codes 
    SET 
      foreground_color = COALESCE(${config.foreground_color}, foreground_color),
      background_color = COALESCE(${config.background_color}, background_color),
      size = COALESCE(${config.size}, size),
      error_correction_level = COALESCE(${config.error_correction_level}, error_correction_level),
      logo_url = ${config.logo_url},
      logo_size = ${config.logo_size},
      updated_at = CURRENT_TIMESTAMP
    WHERE link_id = ${linkId}
    RETURNING *
  `;
  return qrCode as QRCode;
}

export async function deleteLink(id: number) {
  // First delete related QR codes
  await sql`
    DELETE FROM qr_codes
    WHERE link_id = ${id}
  `;

  // Then delete the link itself
  await sql`
    DELETE FROM links 
    WHERE id = ${id}
  `;
}

export async function incrementClickCount(id: number) {
  await sql`
    UPDATE links 
    SET click_count = click_count + 1
    WHERE id = ${id}
  `;
}

function generateShortCode(): string {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function createQRCode(
  type: string,
  content: string,
  title?: string,
  description?: string
) {
  const shortCode = generateShortCode();

  // For non-URL QR codes, we'll store the content directly
  // For URL QR codes, we'll maintain the original_url field for compatibility
  const originalUrl = type === "url" ? content : "";

  const [link] = await sql`
    INSERT INTO links (original_url, short_code, title, description, qr_type, qr_content)
    VALUES (${originalUrl}, ${shortCode}, ${title}, ${description}, ${type}, ${content})
    RETURNING *
  `;

  // Create default QR code configuration
  await sql`
    INSERT INTO qr_codes (link_id, foreground_color, background_color, size, error_correction_level)
    VALUES (${link.id}, '#000000', '#ffffff', 200, 'M')
  `;

  return link as Link;
}

export async function getQRCodes() {
  const qrCodes = await sql`
    SELECT l.*,
           q.foreground_color,
           q.background_color,
           q.size,
           q.error_correction_level,
           q.logo_url,
           q.logo_size
    FROM links l
    LEFT JOIN qr_codes q ON l.id = q.link_id
    WHERE l.qr_type IS NOT NULL
    ORDER BY l.created_at DESC
  `;
  return qrCodes as (Link & Partial<QRCode>)[];
}
