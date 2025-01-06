import { render } from '@testing-library/react'
import { useRouter, usePathname } from 'next/navigation'
import { useUserProfile } from '@/contexts/UserProfileContext'
import { TestComponent } from './TestComponent'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
  useSearchParams: jest.fn(() => new URLSearchParams())
}))

// Mock UserProfile context
jest.mock('@/contexts/UserProfileContext', () => ({
  useUserProfile: jest.fn(),
}))

describe('Navigation', () => {
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(useUserProfile as jest.Mock).mockReturnValue({
      user: { uid: 'test-uid', email: 'test@example.com' },
      profile: null,
      loading: false,
    })
  })

  describe('Subscription Required Routes', () => {
    const protectedRoutes = ['/playlist/123', '/song/456']

    protectedRoutes.forEach(route => {
      it(`redirects to songbook when accessing ${route} without active subscription`, () => {
        ;(usePathname as jest.Mock).mockReturnValue(route)
        ;(useUserProfile as jest.Mock).mockReturnValue({
          user: { uid: 'test-uid', email: 'test@example.com' },
          profile: { subscriptionStatus: 'Unpaid' },
          loading: false,
        })

        render(<TestComponent />)
        expect(mockRouter.push).toHaveBeenCalledWith('/songbook')
      })

      it(`allows access to ${route} with active subscription`, () => {
        ;(usePathname as jest.Mock).mockReturnValue(route)
        ;(useUserProfile as jest.Mock).mockReturnValue({
          user: { uid: 'test-uid', email: 'test@example.com' },
          profile: { subscriptionStatus: 'Active' },
          loading: false,
        })

        render(<TestComponent />)
        expect(mockRouter.push).not.toHaveBeenCalled()
      })
    })
  })

  describe('Loading State', () => {
    it('does not redirect while loading', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/playlist/123')
      ;(useUserProfile as jest.Mock).mockReturnValue({
        user: { uid: 'test-uid', email: 'test@example.com' },
        profile: null,
        loading: true,
      })

      render(<TestComponent />)
      expect(mockRouter.push).not.toHaveBeenCalled()
    })
  })
}) 