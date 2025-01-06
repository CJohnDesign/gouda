import { render, screen, fireEvent } from '@testing-library/react'
import { ProfileMenu } from '../profile-menu'
import { useRouter } from 'next/navigation'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock Firebase auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: { email: 'test@example.com', displayName: 'Test User' },
    onAuthStateChanged: jest.fn((callback) => {
      callback({ email: 'test@example.com', displayName: 'Test User' })
      return jest.fn()
    }),
    signOut: jest.fn(),
  })),
}))

// Mock Firebase app
jest.mock('@/firebase/firebase', () => ({
  app: {
    name: '[DEFAULT]',
    options: {},
  },
}))

// Mock UserProfile context
jest.mock('@/contexts/UserProfileContext', () => ({
  useUserProfile: () => ({
    profile: {
      name: 'Test User',
      email: 'test@example.com',
      subscriptionStatus: 'Active',
    },
    loading: false,
  }),
}))

describe('ProfileMenu', () => {
  const mockRouter = {
    push: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
  })

  it('renders the profile menu', () => {
    render(<ProfileMenu />)
    expect(screen.getByText('Test User')).toBeInTheDocument()
  })

  it('shows menu items when clicked', () => {
    render(<ProfileMenu />)
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByText('Profile')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByText('Subscription')).toBeInTheDocument()
    expect(screen.getByText('Sign out')).toBeInTheDocument()
  })

  it('navigates to profile page', () => {
    render(<ProfileMenu />)
    fireEvent.click(screen.getByRole('button'))
    fireEvent.click(screen.getByText('Profile'))
    expect(mockRouter.push).toHaveBeenCalledWith('/account/profile')
  })

  it('navigates to settings page', () => {
    render(<ProfileMenu />)
    fireEvent.click(screen.getByRole('button'))
    fireEvent.click(screen.getByText('Settings'))
    expect(mockRouter.push).toHaveBeenCalledWith('/account/settings')
  })

  it('navigates to subscription page', () => {
    render(<ProfileMenu />)
    fireEvent.click(screen.getByRole('button'))
    fireEvent.click(screen.getByText('Subscription'))
    expect(mockRouter.push).toHaveBeenCalledWith('/account/subscription')
  })
}) 