import type { Metadata } from 'next';
import './globals.css';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ToasterProvider } from '@/components/providers/ToasterProvider';

export const metadata: Metadata = {
  title: 'ZigZag - Jeu multijoueur',
  description: 'Matchmaking, parties privées et séquence ZigZag.',
  keywords: ['jeu', 'multijoueur', 'zigzag', 'dessin', 'collaboratif'],
  authors: [{ name: 'ZigZag Team' }],
  icons: {
    icon: '/assets/logo.png',
    shortcut: '/assets/logo.png',
    apple: '/assets/logo.png',
  },
  openGraph: {
    title: 'ZigZag - Jeu multijoueur',
    description: 'Matchmaking, parties privées et séquence ZigZag.',
    type: 'website',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ZigZag - Jeu multijoueur',
    description: 'Matchmaking, parties privées et séquence ZigZag.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <ErrorBoundary>
          <ToasterProvider />
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}

