export const metadata = { title: 'Retrac Shop' };
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <style>{`* { margin: 0; padding: 0; box-sizing: border-box; } html, body { width: 100%; height: 100%; background: #000; overflow: hidden; }`}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
