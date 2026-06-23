import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';

const DATA_FILE = '/tmp/shop-data.json';

export async function GET() {
  try {
    const raw  = await readFile(DATA_FILE, 'utf8');
    const data = JSON.parse(raw);
    if (data.imageUrl) {
      return NextResponse.redirect(data.imageUrl);
    }
  } catch {}
  return NextResponse.json({ error: 'No shop image yet' }, { status: 404 });
}
