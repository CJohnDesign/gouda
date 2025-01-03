import { Inter } from 'next/font/google'
import './globals.css'
import { UserProfileProvider } from '@/contexts/UserProfileContext'

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
    <html lang="en">
      <body className={inter.className}>
        <UserProfileProvider>
          {children}
        </UserProfileProvider>
      </body>
    </html>
  )
}
