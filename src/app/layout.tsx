import type { Metadata } from 'next';
import './globals.css';
import ToastProvider from '@/components/ToastProvider';

export const metadata: Metadata = {
  title: 'ELNIX POWERZONE | Wholesale & Retail - Battery, Electricals, Plumbing & Sanitary',
  description: 'Elnix Powerzone supplies high quality electrical, battery, plumbing and sanitary products for homes, buildings and businesses across Kerala.',
  keywords: 'Elnix Powerzone, electrical wholesale, batteries, plumbing, sanitary, Chottanikkara, Eruvely, Ernakulam, Kerala, Exide, Polycab, Jaquar',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen flex flex-col bg-white text-slate-900 antialiased font-sans">
        <ToastProvider />
        {children}
      </body>
    </html>
  );
}

