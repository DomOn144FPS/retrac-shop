import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const secret = request.headers.get('x-secret');
  if (!secret || secret !== process.env.VERCEL_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { imageBase64 } = await request.json();
    if (!imageBase64) return NextResponse.json({ error: 'Missing image' }, { status: 400 });

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer     = Buffer.from(base64Data, 'base64');

    const blob = await put('shop-latest.png', buffer, {
      access: 'private',
      contentType: 'image/png',
      addRandomSuffix: false,
    });

    return NextResponse.json({ ok: true, url: blob.url });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
