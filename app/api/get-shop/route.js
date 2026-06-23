import { NextResponse } from 'next/server';
import { head } from '@vercel/blob';

export async function GET() {
  try {
    // Check if shop-latest.png exists in blob
    const blob = await head('shop-latest.png');
    return NextResponse.json({ imageUrl: blob.url });
  } catch {
    return NextResponse.json({ imageUrl: null });
  }
}
