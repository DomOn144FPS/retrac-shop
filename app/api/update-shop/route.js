import { NextResponse } from 'next/server';
import { put } from '@vercel/kv';

export async function POST(request) {
  // Check secret to make sure only the bot can call this
  const secret = request.headers.get('x-secret');
  if (!secret || secret !== process.env.VERCEL_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { imageUrl, dateStr, resetTs } = await request.json();
    if (!imageUrl) return NextResponse.json({ error: 'Missing imageUrl' }, { status: 400 });

    // Store in Vercel KV (free key-value store)
    await put('shop:imageUrl', imageUrl);
    await put('shop:dateStr',  dateStr);
    await put('shop:resetTs',  String(resetTs));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('update-shop error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
