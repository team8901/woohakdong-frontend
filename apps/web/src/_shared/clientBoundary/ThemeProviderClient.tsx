'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

export const ThemeProviderClient = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      enableColorScheme>
      {children}
    </NextThemesProvider>
  );
};
