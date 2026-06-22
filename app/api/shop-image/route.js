import { NextResponse } from 'next/server';
import { readdir } from 'fs/promises';
import path from 'path';
import fs from 'fs';

// This route serves the latest shop image from /public/images/
// On Vercel (serverless) the filesystem is read-only at runtime.
// You have two options:
//   Option A – Upload the image to Vercel Blob / Cloudinary from the bot and store the URL in an env var SHOP_IMAGE_URL
//   Option B – Use a GitHub Action to commit the image and redeploy
//
// For now, if SHOP_IMAGE_URL is set we redirect to it; otherwise fall back to the static file.

export async function GET() {
  const externalUrl = process.env.SHOP_IMAGE_URL;
  if (externalUrl) {
    return NextResponse.redirect(externalUrl);
  }

  // Local dev: look for shop-latest.* in public/images
  const dir = path.join(process.cwd(), 'public', 'images');
  try {
    const files = await readdir(dir);
    const match = files.find(f => f.startsWith('shop-latest'));
    if (match) {
      return NextResponse.redirect(new URL(`/images/${match}`, 'http://localhost'));
    }
  } catch {}

  return NextResponse.json({ error: 'No shop image available' }, { status: 404 });
}
