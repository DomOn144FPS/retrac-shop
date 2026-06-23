'use client';
import { useEffect, useState } from 'react';

function nextReset() {
  const now = new Date();
  const nyDate = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now);
  const nyParts = {};
  for (const p of nyDate) nyParts[p.type] = p.value;
  const nyH  = parseInt(new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', hour12: false }).format(now));
  const utcH = parseInt(new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', hour: 'numeric', hour12: false }).format(now));
  let off = utcH - nyH; if (off < 0) off += 24;
  const rh = (20 + off) % 24;
  const da = (20 + off) >= 24 ? 1 : 0;
  const resetUTC = new Date(Date.UTC(parseInt(nyParts.year), parseInt(nyParts.month)-1, parseInt(nyParts.day)+da, rh, 0, 0));
  return resetUTC > now ? resetUTC : new Date(resetUTC.getTime() + 86400000);
}

export default function Home() {
  const [shopData, setShopData] = useState({ imageUrl: null, dateStr: null });

  useEffect(() => {
    fetch('/api/update-shop')
      .then(r => r.json())
      .then(d => setShopData(d))
      .catch(() => {});
  }, []);

  const reset     = nextReset();
  const dateLabel = shopData.dateStr || new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(reset);
  const resetStr = reset.toLocaleDateString('en-US', {
    timeZone: 'America/New_York', weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true, timeZoneName: 'short',
  });

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 16px 80px' }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <span style={{ background: 'linear-gradient(135deg, #00ff88, #00cfff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '13px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Retrac</span>
          <span style={{ width: '1px', height: '14px', background: '#1f1f3a' }} />
          <span style={{ fontSize: '13px', color: '#6b6b9a', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Item Shop</span>
        </div>
        <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, background: 'linear-gradient(135deg, #fff 30%, #00ff88 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '16px' }}>
          {dateLabel}
        </h1>
        <p style={{ fontSize: '14px', color: '#6b6b9a', background: '#13132a', border: '1px solid #1f1f3a', borderRadius: '999px', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px' }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#00ff88', boxShadow: '0 0 8px #00ff88', display: 'inline-block' }} />
          Resets <strong style={{ color: '#e8e8ff' }}>&nbsp;{resetStr}</strong>
        </p>
      </header>

      <div style={{ width: '100%', maxWidth: '760px', background: '#13132a', border: '1px solid #1f1f3a', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 0 24px rgba(0,255,136,0.2), 0 40px 80px rgba(0,0,0,0.6)' }}>
        {shopData.imageUrl ? (
          <img src={shopData.imageUrl} alt={`Retrac Item Shop for ${dateLabel}`} style={{ width: '100%', height: 'auto', display: 'block' }} />
        ) : (
          <div style={{ height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px', color: '#6b6b9a' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/>
              <path d="m21 15-5-5L5 21"/>
            </svg>
            <p style={{ fontSize: '15px' }}>No shop image posted yet</p>
            <p style={{ fontSize: '13px' }}>Check back after 8 PM EST</p>
          </div>
        )}
      </div>

      <footer style={{ marginTop: '48px', textAlign: 'center', color: '#6b6b9a', fontSize: '13px' }}>
        <p>Updated daily by the Retrac Discord bot · <span style={{ color: '#00ff88' }}>Retrac Shop</span></p>
      </footer>
    </main>
  );
}
