import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "双岛2035 · 海南 × 新加坡",
  description: "看见连接，改变选择，观察未来。海南与新加坡六页联动决策风洞。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
