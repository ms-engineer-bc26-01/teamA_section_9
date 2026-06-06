import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SkinMate",
  description: "肌とコスメの記録から最適なスキンケアを提案するアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
