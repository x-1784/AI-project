import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

/* 自托管变量字体，避免运行时依赖 Google Fonts（国内网络环境不可靠） */
const spaceGrotesk = localFont({
  src: "../../public/fonts/space-grotesk-variable.woff2",
  variable: "--font-space-grotesk",
  weight: "300 700",
  display: "swap",
});

const inter = localFont({
  src: "../../public/fonts/inter-variable.woff2",
  variable: "--font-inter",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NEBULA AI — AI 创作宇宙",
  description:
    "把一句话交给 NEBULA，从最初的念头，到可以交付的成稿。",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="zh-CN"
      className={`${spaceGrotesk.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
