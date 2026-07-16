import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VSite - 视频分享',
  description: '视频分享平台',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
