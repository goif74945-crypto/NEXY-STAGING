import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'NEXY Staging',
  description: 'Clean rebuild workspace for NEXY Pack 1 foundation.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'Inter, Arial, sans-serif', background: '#050816', color: '#f8fafc' }}>
        {children}
      </body>
    </html>
  );
}
