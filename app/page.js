'use client';
import { useEffect, useState, useRef } from 'react';

export default function Home() {
  const [imageUrl, setImageUrl] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [status, setStatus] = useState('');
  const fileRef = useRef();
  const clicks = useRef(0);
  const timer = useRef(null);

  useEffect(() => {
    fetch('/api/get-shop')
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
    if (password === 'retrac123') {
      setAuthed(true); setShowLogin(false); setPassword('');
    } else {
      setPassword(''); alert('Wrong password');
    }
  }

  async function uploadImage(file) {
    if (!file || !file.type.startsWith('image/')) return;
    setStatus('Uploading…');
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('secret', 'retrac123');
      const res  = await fetch('/api/upload', { method: 'POST', body: form });
      const data = await res.json();
      if (data.url) { setImageUrl(data.url); setStatus(''); }
      else setStatus('Upload failed: ' + (data.error || 'unknown'));
    } catch (err) {
      setStatus('Upload failed: ' + err.message);
    }
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: '#000', cursor: authed ? 'copy' : 'default' }}
      onDragOver={e => { e.preventDefault(); }}
      onDrop={e => { e.preventDefault(); if (authed) uploadImage(e.dataTransfer.files[0]); }}
      onClick={() => { if (authed) fileRef.current?.click(); }}
    >
      {imageUrl
        ? <img src={imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
        : <div style={{ width: '100%', height: '100%', background: '#000' }} />
      }

      {status && (
        <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.8)', border: '1px solid #333', borderRadius: '8px', padding: '8px 16px', color: '#fff', fontSize: '14px', fontFamily: 'sans-serif' }}>
          {status}
        </div>
      )}

      {authed && !status && (
        <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,255,136,0.15)', border: '1px solid #00ff88', borderRadius: '8px', padding: '5px 12px', color: '#00ff88', fontSize: '12px', fontFamily: 'sans-serif', pointerEvents: 'none' }}>
          Click or drag to upload
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => uploadImage(e.target.files[0])} />

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
