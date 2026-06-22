'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface ShopData {
  imageUrl: string;
  shopDate: string;
  resetTimestamp: number;
  postedAt: string;
}

function useCountdown(targetUnix: number) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    function calc() {
      const diff = targetUnix * 1000 - Date.now();
      if (diff <= 0) { setTimeLeft('Shop has reset!'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    }
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [targetUnix]);

  return timeLeft;
}

export default function Home() {
  const [shop, setShop] = useState<ShopData | null>(null);
  const [loading, setLoading] = useState(true);
  const countdown = useCountdown(shop?.resetTimestamp ?? 0);

  useEffect(() => {
    fetch('/api/shop')
      .then(r => r.json())
      .then(data => { setShop(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <main className="page">
      <header className="header">
        <div className="logo-row">
          <span className="logo-icon">⚡</span>
          <span className="logo-text">Retrac<span className="logo-accent">Shop</span></span>
        </div>
        <p className="tagline">Daily Fortnite Item Shop</p>
      </header>

      <section className="shop-card">
        {loading ? (
          <div className="skeleton-wrap">
            <div className="skeleton" />
          </div>
        ) : shop ? (
          <>
            <div className="shop-meta">
              <h2 className="shop-title">Retrac Item Shop — {shop.shopDate}</h2>
              <div className="reset-badge">
                <span className="reset-dot" />
                Resets in <strong>{countdown}</strong>
              </div>
            </div>
            <div className="image-wrap">
              <img src={shop.imageUrl} alt={`Item Shop ${shop.shopDate}`} className="shop-image" />
            </div>
          </>
        ) : (
          <div className="empty-state">
            <p>No shop has been posted yet. Check back after 8 PM EST!</p>
          </div>
        )}
      </section>

      <footer className="footer">
        <p>Retrac Shop • Resets daily at 8 PM EST</p>
      </footer>

      <style jsx global>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg:        #0a0a0f;
          --surface:   #111118;
          --border:    #1e1e2e;
          --accent:    #00ff88;
          --accent2:   #7b61ff;
          --text:      #e8e8f0;
          --muted:     #6b6b8a;
          --radius:    16px;
        }

        body {
          background: var(--bg);
          color: var(--text);
          font-family: 'Inter', system-ui, sans-serif;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .page {
          width: 100%;
          max-width: 900px;
          padding: 2rem 1.25rem 4rem;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        /* Header */
        .header { text-align: center; padding-top: 1rem; }

        .logo-row {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 2.2rem;
          font-weight: 800;
          letter-spacing: -1px;
        }
        .logo-icon { font-size: 2rem; }
        .logo-accent { color: var(--accent); }
        .tagline { color: var(--muted); font-size: 0.95rem; margin-top: 0.35rem; letter-spacing: 0.08em; text-transform: uppercase; }

        /* Card */
        .shop-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          overflow: hidden;
        }

        .shop-meta {
          padding: 1.25rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
          border-bottom: 1px solid var(--border);
        }

        .shop-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text);
        }

        .reset-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(0,255,136,0.08);
          border: 1px solid rgba(0,255,136,0.2);
          border-radius: 999px;
          padding: 0.3rem 0.85rem;
          font-size: 0.85rem;
          color: var(--accent);
          white-space: nowrap;
        }

        .reset-dot {
          width: 7px;
          height: 7px;
          background: var(--accent);
          border-radius: 50%;
          animation: pulse 1.5s infinite;
          flex-shrink: 0;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .image-wrap { width: 100%; }
        .shop-image { width: 100%; height: auto; display: block; }

        /* Skeleton */
        .skeleton-wrap { padding: 2rem; }
        .skeleton {
          height: 480px;
          border-radius: 10px;
          background: linear-gradient(90deg, var(--border) 25%, #1a1a2a 50%, var(--border) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* Empty */
        .empty-state {
          padding: 4rem 2rem;
          text-align: center;
          color: var(--muted);
          font-size: 1rem;
        }

        /* Footer */
        .footer {
          text-align: center;
          color: var(--muted);
          font-size: 0.8rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border);
          margin-top: 1rem;
        }

        @media (max-width: 600px) {
          .shop-meta { flex-direction: column; align-items: flex-start; }
          .logo-row { font-size: 1.8rem; }
        }
      `}</style>
    </main>
  );
}
