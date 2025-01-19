'use client'

import Link from 'next/link'
import Image from 'next/image'

export function Logo() {
  return (
    <Link href="/" className="block mb-12 sm:mb-10 md:mb-8">
      <Image
        src="/images/GOUDA_Logo.webp"
        alt="Gouda & Company"
        width={300}
        height={300}
        className="w-[200px] sm:w-[250px] md:w-[300px] mx-auto"
        priority
        quality={85}
        loading="eager"
      />
    </Link>
  )
} 