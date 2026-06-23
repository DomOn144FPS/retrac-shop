export const metadata = { title: 'Retrac Shop', description: 'Daily Fortnite Item Shop' };
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: '#000', overflow: 'hidden' }}>{children}</body>
    </html>
  );
}
