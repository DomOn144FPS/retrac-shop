'use client';
import { useEffect, useState, useRef } from 'react';

export default function Home() {
  const [imageUrl, setImageUrl] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();
  const clickCount = useRef(0);
  const clickTimer = useRef(null);

  useEffect(() => {
    fetch('/api/update-shop')
      .then(r => r.json())
      .then(d => { if (d.imageUrl) setImageUrl(d.imageUrl); })
      .catch(() => {});
  }, []);

  // Secret: triple-click bottom-right corner
  function handleCornerClick() {
    clickCount.current += 1;
    clearTimeout(clickTimer.current);
    clickTimer.current = setTimeout(() => { clickCount.current = 0; }, 600);
    if (clickCount.current >= 3) {
      clickCount.current = 0;
      setShowLogin(true);
    }
  }

  function handleLogin(e) {
    e.preventDefault();
    if (password === (process.env.NEXT_PUBLIC_UPLOAD_PASSWORD || 'retrac123')) {
      setAuthed(true);
      setShowLogin(false);
      setPassword('');
    } else {
      setPassword('');
      alert('Wrong password');
    }
  }

  async function uploadImage(file) {
    if (!file || !file.type.startsWith('image/')) return;
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target.result;
        // Store as data URL temporarily for display
        setImageUrl(base64);

        // Send to our API
        const secret = localStorage.getItem('retrac_secret') || 'retrac123';
        await fetch('/api/update-shop', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-secret': secret },
          body: JSON.stringify({ imageUrl: base64, dateStr: getTodayDate(), resetTs: getResetTs() }),
        });
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setUploading(false);
    }
  }

  function getTodayDate() {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  }

  function getResetTs() {
    const now = new Date();
    const nyH  = parseInt(new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', hour12: false }).format(now));
    const utcH = parseInt(new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', hour: 'numeric', hour12: false }).format(now));
    let off = utcH - nyH; if (off < 0) off += 24;
    const rh = (20 + off) % 24, da = (20 + off) >= 24 ? 1 : 0;
    const parts = {};
    for (const p of new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now)) parts[p.type] = p.value;
    const r = new Date(Date.UTC(parseInt(parts.year), parseInt(parts.month)-1, parseInt(parts.day)+da, rh, 0, 0));
    return Math.floor((r > now ? r : new Date(r.getTime()+86400000)).getTime()/1000);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    if (!authed) return;
    uploadImage(e.dataTransfer.files[0]);
  }

  return (
    <div
      style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden', background: '#000', position: 'relative', cursor: authed ? 'copy' : 'default' }}
      onDragOver={e => { e.preventDefault(); if (authed) setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => { if (authed) fileRef.current?.click(); }}
    >
      {/* Shop image — fills entire screen */}
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Retrac Item Shop"
          style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
        />
      ) : (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a' }}>
          <div style={{ width: '60px', height: '60px', border: '3px solid #1a1a1a', borderRadius: '12px', opacity: 0.3 }} />
        </div>
      )}

      {/* Drag overlay */}
      {dragging && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,255,136,0.15)', border: '3px dashed #00ff88', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <p style={{ color: '#00ff88', fontSize: '24px', fontWeight: 700, fontFamily: 'sans-serif' }}>Drop to upload</p>
        </div>
      )}

      {/* Uploading indicator */}
      {uploading && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#fff', fontSize: '18px', fontFamily: 'sans-serif' }}>Uploading…</p>
        </div>
      )}

      {/* Authed indicator */}
      {authed && !uploading && (
        <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(0,255,136,0.15)', border: '1px solid #00ff88', borderRadius: '8px', padding: '6px 14px', color: '#00ff88', fontSize: '12px', fontFamily: 'sans-serif', pointerEvents: 'none' }}>
          Click or drag to upload
        </div>
      )}

      {/* Hidden file input */}
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => uploadImage(e.target.files[0])} />

      {/* Secret corner trigger — invisible 60x60 zone bottom-right */}
      <div
        onClick={e => { e.stopPropagation(); handleCornerClick(); }}
        style={{ position: 'absolute', bottom: 0, right: 0, width: '60px', height: '60px', cursor: 'default' }}
      />

      {/* Login modal */}
      {showLogin && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }} onClick={() => setShowLogin(false)}>
          <form onSubmit={handleLogin} onClick={e => e.stopPropagation()} style={{ background: '#111', border: '1px solid #222', borderRadius: '16px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px', minWidth: '280px' }}>
            <input
              autoFocus
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', padding: '12px 16px', color: '#fff', fontSize: '16px', outline: 'none', fontFamily: 'sans-serif' }}
            />
            <button type="submit" style={{ background: '#00ff88', color: '#000', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'sans-serif' }}>
              Unlock
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
