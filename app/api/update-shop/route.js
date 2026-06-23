import { NextResponse } from 'next/server';
import { writeFile, readFile } from 'fs/promises';

const DATA_FILE = '/tmp/shop-data.json';

export async function POST(request) {
  const secret = request.headers.get('x-secret');
  if (!secret || secret !== process.env.VERCEL_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { imageUrl, dateStr, resetTs } = await request.json();
    if (!imageUrl) return NextResponse.json({ error: 'Missing imageUrl' }, { status: 400 });
    await writeFile(DATA_FILE, JSON.stringify({ imageUrl, dateStr, resetTs, updatedAt: Date.now() }), 'utf8');
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const raw = await readFile(DATA_FILE, 'utf8');
    return NextResponse.json(JSON.parse(raw));
  } catch {
    return NextResponse.json({ imageUrl: null });
  }
}
