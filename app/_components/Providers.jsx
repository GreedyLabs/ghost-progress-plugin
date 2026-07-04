'use client';
import { ThemeProvider } from 'next-themes';

export default function Providers({ children }) {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem storageKey="gprog-theme">
      {children}
    </ThemeProvider>
  );
}
