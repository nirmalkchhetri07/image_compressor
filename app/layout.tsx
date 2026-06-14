import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Image Compressor - Fast & Smart Image Optimization',
  description: 'Compress, resize, and convert images in your browser. No uploads, no limits, 100% privacy-focused.',
  applicationName: 'AI Image Compressor',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'AI Image Compressor',
    description: 'Compress, resize, and convert images instantly in your browser',
    type: 'website',
    url: 'https://imagecompressor.app',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Image Compressor',
    description: 'Compress, resize, and convert images instantly in your browser',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#a78bfa',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
