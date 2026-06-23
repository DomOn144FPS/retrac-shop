import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request) {
  const secret = request.headers.get('x-secret');
  if (!secret || secret !== process.env.VERCEL_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { imageBase64, dateStr, resetTs } = await request.json();
    if (!imageBase64) return NextResponse.json({ error: 'Missing image' }, { status: 400 });

    // Convert base64 to buffer
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Upload to Vercel Blob
    const blob = await put('shop-latest.png', buffer, {
      access: 'public',
      contentType: 'image/png',
      addRandomSuffix: false,
    });

    return NextResponse.json({ ok: true, url: blob.url });
  } catch (err) {
    console.error('update-shop error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  // Return the known blob URL (it's always the same since addRandomSuffix: false)
  try {
    const storeId = process.env.BLOB_READ_WRITE_TOKEN?.match(/vercel_blob_rw_([^_]+)/)?.[1]?.toLowerCase();
    if (storeId) {
      const url = `https://${storeId}.public.blob.vercel-storage.com/shop-latest.png`;
      return NextResponse.json({ imageUrl: url });
    }
  } catch {}
  return NextResponse.json({ imageUrl: null });
}
