import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { AuthProvider } from '@/components/providers/auth-provider';
import { Toaster } from '@/components/ui/sonner';
import { APP_NAME, APP_TAGLINE } from '@/lib/constants';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} — ${APP_TAGLINE}`,
    template: `%s | ${APP_NAME}`,
  },
  description:
    'Icetropez.Vest is a modern investment platform offering managed investment plans with transparent daily and maturity-based earnings.',
  keywords: [
    'investment',
    'investing',
    'wealth management',
    'portfolio',
    'financial growth',
    'South Africa',
  ],
  authors: [{ name: APP_NAME }],
  openGraph: {
    type: 'website',
    locale: 'en_ZA',
    title: `${APP_NAME} — ${APP_TAGLINE}`,
    description:
      'Smart investing, steady growth. Managed investment plans with transparent earnings.',
    siteName: APP_NAME,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${APP_NAME} — ${APP_TAGLINE}`,
    description:
      'Smart investing, steady growth. Managed investment plans with transparent earnings.',
  },
  robots: { index: true, follow: true },
  alternates: { canonical: '/' },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: APP_NAME,
  description: APP_TAGLINE,
  url: 'https://icetropez.vest',
  email: 'support@icetropez.vest',
  telephone: '+27 11 555 0100',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Sandton',
    addressRegion: 'Johannesburg',
    addressCountry: 'ZA',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster richColors position="top-right" />
          </AuthProvider>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
