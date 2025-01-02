import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Montserrat } from 'next/font/google'

const montserrat = Montserrat({ 
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
})

export default function Page() {
  return (
    <main className={`min-h-screen bg-[#f1e0b4] flex flex-col items-center justify-center px-4 ${montserrat.className}`}>
      <div className="w-full max-w-md mx-auto text-center flex flex-col justify-center flex-1">
        {/* Logo Section */}
        <div className="relative w-full aspect-square max-w-[300px] mx-auto mb-8">
          <Image
            src="/placeholder.svg"
            alt="Gouda & Company Logo"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          <div className="space-y-4">
            <p className="text-[18px] leading-[24px] font-regular text-[#262223] max-w-[390px] mx-auto">
              Gouda & Company is a music school focusing on rocking at jam sessions.<br/>
              <strong>All instruments welcome!</strong>
            </p>
          </div>

          {/* CTA Button */}
          <Button 
            className="w-full h-[48px] text-[21px] leading-[32px] font-bold bg-[#de9c0e] hover:bg-[#de9c0e]/90 text-black"
          >
            JOIN
          </Button>

          {/* Footer Info */}
          <div className="space-y-1 text-[#262223]">
            <p className="text-[14px] leading-[21px] font-medium">
              Group Lessons Every Monday Night <br/>
              in North Miami Beach + Telegram Community
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

