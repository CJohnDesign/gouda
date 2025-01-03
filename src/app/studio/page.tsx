'use client'

import { useRouter } from 'next/navigation'
import { Montserrat } from 'next/font/google'
import { Navbar } from '@/components/ui/Navbar'
import { Corners } from '@/components/ui/borders'
import { useUserProfile } from '@/contexts/UserProfileContext'
import { useEffect } from 'react'

const montserrat = Montserrat({ subsets: ['latin'] })

export default function StudioPage() {
  const { profile, loading } = useUserProfile();
  const router = useRouter();

  useEffect(() => {
    // Check subscription status after loading
    if (!loading && (!profile || profile.subscriptionStatus === 'Unpaid')) {
      router.push('/account/subscription');
    }
  }, [loading, profile, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-[#262223]">Loading...</div>
      </div>
    );
  }

  // Don't render content until we're sure about subscription status
  if (!profile || profile.subscriptionStatus === 'Unpaid') {
    return null;
  }

  return (
    <>
      <Navbar />
      <main className={montserrat.className}>
        <div className="min-h-screen bg-[#f1e0b4] pt-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="relative">
              <Corners />
              <div className="p-8">
                <h1 className="text-2xl font-semibold text-[#262223] mb-4">Studio</h1>
                <p className="text-[#262223]/60">Welcome to your creative space.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
} 