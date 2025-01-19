'use client'

import Link from 'next/link'
import Image from 'next/image'

export function Logo() {
  return (
    <Link href="/" className="block mb-8">
      <Image
        src="/images/GOUDA_Logo.webp"
        alt="Gouda & Company"
        width={300}
        height={300}
        className="mx-auto"
        priority
        quality={85}
        loading="eager"
      />
    </Link>
  )
} 