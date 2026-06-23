import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const form   = await request.formData();
    const secret = form.get('secret');
    const file   = form.get('file');

    if (secret !== process.env.VERCEL_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

    const blob = await put('shop-latest.png', file, {
      access: 'private',
      addRandomSuffix: false,
    });

    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
