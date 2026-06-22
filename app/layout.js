import './globals.css';
export const metadata = {
  title: 'Retrac Item Shop',
  description: "Today's Fortnite Item Shop via Retrac",
};
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
