import Image from 'next/image';
import { readdir } from 'fs/promises';
import path from 'path';

async function getShopImageUrl() {
  // When running locally the image lives in /public/images/
  // On Vercel, the bot should upload to an external store (see README).
  // We expose a /api/shop-image endpoint that can be swapped easily.
  return '/api/shop-image';
}

function nextReset() {
  const now = new Date();
  // Build today's 8 PM EST
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
  const parts = Object.fromEntries(fmt.formatToParts(now).map(p => [p.type, p.value]));
  const utcH  = parseInt(new Intl.DateTimeFormat('en-US', { timeZone: 'UTC',              hour: '2-digit', hour12: false }).format(now));
  const nyH   = parseInt(new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: '2-digit', hour12: false }).format(now));
  let diff = utcH - nyH; if (diff < 0) diff += 24;
  const offset = diff * 3600000;
  const base = new Date(`${parts.year}-${parts.month}-${parts.day}T20:00:00`);
  const resetUTC = new Date(base.getTime() - offset);
  const reset = resetUTC > now ? resetUTC : new Date(resetUTC.getTime() + 86400000);
  return reset;
}

function formatReset(date) {
  return date.toLocaleDateString('en-US', {
    timeZone: 'America/New_York',
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true, timeZoneName: 'short',
  });
}

function shopDateLabel(resetDate) {
  return resetDate.toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
}

export default async function Home() {
  const reset     = nextReset();
  const resetStr  = formatReset(reset);
  const dateLabel = shopDateLabel(reset);
  const imgUrl    = await getShopImageUrl();

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 16px 80px' }}>

      {/* Header */}
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <span style={{
            background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            fontSize: '13px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase',
          }}>Retrac</span>
          <span style={{ width: '1px', height: '14px', background: 'var(--border)' }} />
          <span style={{ fontSize: '13px', color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Item Shop</span>
        </div>
        <h1 style={{
          fontSize: 'clamp(1.8rem, 5vw, 3rem)',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
          background: 'linear-gradient(135deg, #fff 30%, var(--accent) 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          marginBottom: '16px',
        }}>
          {dateLabel}
        </h1>
        <p style={{
          fontSize: '14px',
          color: 'var(--muted)',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '999px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
        }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)', display: 'inline-block' }} />
          Resets&nbsp;<strong style={{ color: 'var(--text)' }}>{resetStr}</strong>
        </p>
      </header>

      {/* Shop image card */}
      <div style={{
        width: '100%', maxWidth: '760px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: 'var(--glow), 0 40px 80px rgba(0,0,0,0.6)',
      }}>
        <img
          src={imgUrl}
          alt={`Retrac Item Shop for ${dateLabel}`}
          style={{ width: '100%', height: 'auto', display: 'block' }}
          onError="this.style.display='none'; document.getElementById('no-image').style.display='flex';"
        />
        <div id="no-image" style={{
          display: 'none', height: '320px',
          alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px',
          color: 'var(--muted)',
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5"/>
            <path d="m21 15-5-5L5 21"/>
          </svg>
          <p style={{ fontSize: '15px' }}>No shop image posted yet</p>
          <p style={{ fontSize: '13px' }}>Check back after 8 PM EST</p>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ marginTop: '48px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
        <p>Updated daily by the Retrac Discord bot &nbsp;·&nbsp; <span style={{ color: 'var(--accent)' }}>Retrac Shop</span></p>
      </footer>

      <script dangerouslySetInnerHTML={{ __html: `
        const img = document.querySelector('main img');
        if (img) img.onerror = () => {
          img.style.display = 'none';
          const el = document.getElementById('no-image');
          if (el) el.style.display = 'flex';
        };
      `}} />
    </main>
  );
}
