import "@fontsource-variable/libre-franklin/wght.css";
import "@fontsource-variable/libre-franklin/wght-italic.css";
import "./globals.css";

export const metadata = {
  title: "Revela | The advisor intelligence layer for CPA firms",
  description:
    "Revela categorizes client bank transactions with confidence scores, routes them for CPA sign-off, writes them back to QuickBooks Online or Desktop, and surfaces tax and growth opportunities from the clean books.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
