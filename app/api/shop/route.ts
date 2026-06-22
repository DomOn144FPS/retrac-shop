import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export async function GET() {
  try {
    const shop = await kv.get<{
      imageUrl: string;
      shopDate: string;
      resetTimestamp: number;
      postedAt: string;
    }>('latest_shop');

    if (!shop) {
      return NextResponse.json({ error: 'No shop posted yet' }, { status: 404 });
    }

    return NextResponse.json(shop);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch shop data' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  // Secured with a shared secret between the bot and the website
  const auth = req.headers.get('x-api-key');
  if (auth !== process.env.SHOP_API_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { imageUrl, shopDate, resetTimestamp } = body;

  if (!imageUrl || !shopDate || !resetTimestamp) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  await kv.set('latest_shop', {
    imageUrl,
    shopDate,
    resetTimestamp,
    postedAt: new Date().toISOString(),
  });

  return NextResponse.json({ success: true });
}
