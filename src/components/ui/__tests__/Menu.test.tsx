import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Menu } from '../Menu'
import { getAuth, signOut, User, NextOrObserver } from 'firebase/auth'
import { useRouter } from 'next/navigation'

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signOut: jest.fn(),
}))

// Mock Next Router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: function MockImage({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />
  },
}))

describe('Menu', () => {
  const mockRouter = {
    push: jest.fn(),
  }
  const mockUnsubscribe = jest.fn()
  const mockAuth = {
    onAuthStateChanged: jest.fn((callback: NextOrObserver<User | null>) => {
      if (typeof callback === 'function') {
        callback(null)
      }
      return mockUnsubscribe
    }),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(getAuth as jest.Mock).mockReturnValue(mockAuth)
  })

  it('renders menu button', () => {
    render(<Menu />)
    expect(screen.getByLabelText('Open menu')).toBeInTheDocument()
  })

  it('toggles menu when button is clicked', () => {
    render(<Menu />)
    
    // Initially closed
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
    
    // Open menu
    fireEvent.click(screen.getByLabelText('Open menu'))
    expect(screen.getByRole('navigation')).toBeInTheDocument()
    
    // Close menu
    fireEvent.click(screen.getByLabelText('Close menu'))
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })

  describe('Unauthenticated user', () => {
    beforeEach(() => {
      mockAuth.onAuthStateChanged.mockImplementation((callback: NextOrObserver<User | null>) => {
        if (typeof callback === 'function') {
          callback(null)
        }
        return mockUnsubscribe
      })
    })

    it('shows login and home links', () => {
      render(<Menu />)
      fireEvent.click(screen.getByLabelText('Open menu'))

      expect(screen.getByText('Songbook')).toBeInTheDocument()
      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.getByText('Login')).toBeInTheDocument()
      expect(screen.queryByText('Sign Out')).not.toBeInTheDocument()
    })

    it('closes menu when clicking a link', () => {
      render(<Menu />)
      fireEvent.click(screen.getByLabelText('Open menu'))
      
      fireEvent.click(screen.getByText('Login'))
      expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
    })
  })

  describe('Authenticated user', () => {
    const mockUser = {
      uid: 'test-uid',
      email: 'test@example.com',
    } as User

    beforeEach(() => {
      mockAuth.onAuthStateChanged.mockImplementation((callback: NextOrObserver<User | null>) => {
        if (typeof callback === 'function') {
          callback(mockUser)
        }
        return mockUnsubscribe
      })
    })

    it('shows account and sign out links', () => {
      render(<Menu />)
      fireEvent.click(screen.getByLabelText('Open menu'))

      expect(screen.getByText('Songbook')).toBeInTheDocument()
      expect(screen.getByText('Account')).toBeInTheDocument()
      expect(screen.getByText('Sign Out')).toBeInTheDocument()
      expect(screen.queryByText('Login')).not.toBeInTheDocument()
    })

    it('handles sign out', async () => {
      ;(signOut as jest.Mock).mockResolvedValueOnce(undefined)
      
      render(<Menu />)
      fireEvent.click(screen.getByLabelText('Open menu'))
      
      fireEvent.click(screen.getByText('Sign Out'))
      
      await waitFor(() => {
        expect(signOut).toHaveBeenCalledWith(mockAuth)
        expect(mockRouter.push).toHaveBeenCalledWith('/')
      })
      
      expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
    })

    it('handles sign out error', async () => {
      const error = new Error('Sign out failed')
      ;(signOut as jest.Mock).mockRejectedValueOnce(error)
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      render(<Menu />)
      fireEvent.click(screen.getByLabelText('Open menu'))
      
      fireEvent.click(screen.getByText('Sign Out'))
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Error signing out:', error)
      })
      
      consoleSpy.mockRestore()
    })

    it('closes menu when clicking a link', () => {
      render(<Menu />)
      fireEvent.click(screen.getByLabelText('Open menu'))
      
      fireEvent.click(screen.getByText('Account'))
      expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
    })
  })

  it('cleans up auth listener on unmount', () => {
    const { unmount } = render(<Menu />)
    unmount()
    
    expect(mockUnsubscribe).toHaveBeenCalled()
  })
}) 