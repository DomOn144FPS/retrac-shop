import { NextResponse } from 'next/server';
import { writeFile, readFile } from 'fs/promises';
import path from 'path';

// Store shop data in a JSON file in /tmp (persists during the Vercel function's lifetime)
// For proper persistence we write to a known path and read it back
const DATA_FILE = '/tmp/shop-data.json';

export async function POST(request) {
  const secret = request.headers.get('x-secret');
  if (!secret || secret !== process.env.VERCEL_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { imageUrl, dateStr, resetTs } = await request.json();
    if (!imageUrl) return NextResponse.json({ error: 'Missing imageUrl' }, { status: 400 });

    const data = JSON.stringify({ imageUrl, dateStr, resetTs, updatedAt: Date.now() });
    await writeFile(DATA_FILE, data, 'utf8');

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('update-shop error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(request) {
  // Also allow GET to read current shop data (used by the page)
  try {
    const raw = await readFile(DATA_FILE, 'utf8');
    return NextResponse.json(JSON.parse(raw));
  } catch {
    return NextResponse.json({ imageUrl: null, dateStr: null, resetTs: null });
  }
}
