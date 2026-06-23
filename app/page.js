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
  const clicks = useRef(0);
  const timer = useRef(null);

  useEffect(() => {
    fetch('/api/update-shop')
      .then(r => r.json())
      .then(d => { if (d.imageUrl) setImageUrl(d.imageUrl); })
      .catch(() => {});
  }, []);

  function handleCorner() {
    clicks.current += 1;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => { clicks.current = 0; }, 700);
    if (clicks.current >= 3) { clicks.current = 0; setShowLogin(true); }
  }

  function handleLogin(e) {
    e.preventDefault();
    if (password === 'retrac123') { setAuthed(true); setShowLogin(false); setPassword(''); }
    else { setPassword(''); alert('Wrong password'); }
  }

  async function uploadImage(file) {
    if (!file || !file.type.startsWith('image/')) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target.result;
      setImageUrl(base64);
      const now = new Date();
      const dateStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
      await fetch('/api/update-shop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-secret': 'retrac123' },
        body: JSON.stringify({ imageUrl: base64, dateStr, resetTs: 0 }),
      }).catch(() => {});
      setUploading(false);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: '#000', cursor: authed ? 'copy' : 'default' }}
      onDragOver={e => { e.preventDefault(); if (authed) setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); setDragging(false); if (authed) uploadImage(e.dataTransfer.files[0]); }}
      onClick={() => { if (authed) fileRef.current?.click(); }}
    >
      {imageUrl
        ? <img src={imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
        : <div style={{ width: '100%', height: '100%', background: '#000' }} />
      }

      {dragging && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,255,136,0.1)', border: '3px dashed #00ff88', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <span style={{ color: '#00ff88', fontSize: '22px', fontFamily: 'sans-serif', fontWeight: 700 }}>Drop image</span>
        </div>
      )}

      {uploading && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: '#fff', fontSize: '18px', fontFamily: 'sans-serif' }}>Uploading…</span>
        </div>
      )}

      {authed && !uploading && (
        <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,255,136,0.15)', border: '1px solid #00ff88', borderRadius: '8px', padding: '5px 12px', color: '#00ff88', fontSize: '12px', fontFamily: 'sans-serif', pointerEvents: 'none' }}>
          Click or drag to upload
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => uploadImage(e.target.files[0])} />

      {/* Secret triple-click zone: bottom-right corner */}
      <div onClick={e => { e.stopPropagation(); handleCorner(); }} style={{ position: 'absolute', bottom: 0, right: 0, width: 80, height: 80 }} />

      {showLogin && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }} onClick={() => setShowLogin(false)}>
          <form onSubmit={handleLogin} onClick={e => e.stopPropagation()} style={{ background: '#111', border: '1px solid #333', borderRadius: '16px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '260px' }}>
            <input autoFocus type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
              style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', padding: '12px', color: '#fff', fontSize: '16px', outline: 'none', fontFamily: 'sans-serif' }} />
            <button type="submit" style={{ background: '#00ff88', color: '#000', border: 'none', borderRadius: '8px', padding: '12px', fontWeight: 700, fontSize: '15px', cursor: 'pointer', fontFamily: 'sans-serif' }}>Unlock</button>
          </form>
        </div>
      )}
    </div>
  );
}
