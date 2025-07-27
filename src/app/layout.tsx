
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { cn } from '@/lib/utils';
import { AuthProvider } from '@/hooks/use-auth';
import { getCategories } from '@/lib/data';
import type { Metadata, Viewport } from 'next';
import { SidebarProvider } from '@/components/ui/sidebar';
import ClientToaster from '@/components/ClientToaster';
import BottomNavBar from '@/components/BottomNavBar';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Jost, Josefin_Sans } from 'next/font/google';
import GoogleAnalytics from '@/components/GoogleAnalytics';


const jost = Jost({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-jost',
});

const josefinSans = Josefin_Sans({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-josefin-sans',
});

export const metadata: Metadata = {
  title: {
    default: 'KhomboleVibes - L\'actualité de Khombole',
    template: '%s | KhomboleVibes',
  },
  description: 'La plateforme d’actualités locales pour la ville de Khombole au Sénégal. Restez informé sur l\'actualité, le sport, la culture et plus encore.',
  icons: {
    icon: 'https://i.imgur.com/QWcnbtr.jpeg',
    apple: 'https://i.imgur.com/QWcnbtr.jpeg',
  },
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = await getCategories();

  return (
    <html lang="fr" suppressHydrationWarning>
      <head />
      <body>
         <GoogleAnalytics />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <SidebarProvider>
              <div className="flex min-h-screen">
                <Sidebar categories={categories} />
                <div className="flex flex-col flex-1">
                  <Header categories={categories} />
                  <main className="flex-1 overflow-y-auto pb-20 md:pb-0">{children}</main>
                   <footer className="text-center p-4 text-xs text-muted-foreground border-t">
                    <p>© 2025 KhomboleVibes. Tous droits réservés.</p>
                    <p>Engineered by Mouhamadou BAMBA</p>
                  </footer>
                </div>
              </div>
              <BottomNavBar categories={categories} />
            </SidebarProvider>
          </AuthProvider>
          <ClientToaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
