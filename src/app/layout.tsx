import type { Metadata, Viewport } from 'next';
import { Inter, IBM_Plex_Sans_Arabic } from 'next/font/google';
import './globals.css';
import { LangProvider } from '@/lib/i18n/context';
import { ThemeProvider } from '@/lib/theme/context';
import { SessionProvider } from '@/lib/session/context';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const plexAr = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-ar',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Taameem · تعميم',
  description: 'From a regulatory announcement to approved change and proof, inside your own institution.',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F7F6F1' },
    { media: '(prefers-color-scheme: dark)', color: '#091422' },
  ],
};

/**
 * Applied before first paint so the saved theme and language never flash.
 */
const boot = `(function(){try{
  // ?theme=dark&lang=ar makes any state shareable as a link, and screenshottable
  var q=new URLSearchParams(location.search);
  if(q.get('theme'))localStorage.setItem('tm.theme',q.get('theme'));
  if(q.get('lang'))localStorage.setItem('tm.lang',q.get('lang'));
  var t=localStorage.getItem('tm.theme')||'system';
  var dark=t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark',dark);
  var l=localStorage.getItem('tm.lang')||'en';
  document.documentElement.lang=l;
  document.documentElement.dir=l==='ar'?'rtl':'ltr';
}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning className={`${inter.variable} ${plexAr.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
      </head>
      <body>
        <ThemeProvider>
          <LangProvider>
            <SessionProvider>{children}</SessionProvider>
          </LangProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
