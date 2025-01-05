import { Inter } from 'next/font/google'
import './globals.css'
import { UserProfileProvider } from '@/contexts/UserProfileContext'
import { ThemeProvider } from '@/components/theme-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Gouda',
  description: 'Gouda - Your Music Community',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
        >
          <UserProfileProvider>
            {children}
          </UserProfileProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
