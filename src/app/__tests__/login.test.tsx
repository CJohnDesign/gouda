import { render, screen, fireEvent } from '@testing-library/react'
import LoginPage from '../login/page'
import { getPlatform, getEmailService } from '@/lib/platform'

// Mock the platform detection
jest.mock('@/lib/platform', () => ({
  getPlatform: jest.fn().mockReturnValue('desktop'),
  getEmailService: jest.fn().mockReturnValue('gmail')
}))

// Mock Firebase auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: null,
    onAuthStateChanged: jest.fn(),
  })),
  sendSignInLinkToEmail: jest.fn(),
  isSignInWithEmailLink: jest.fn(),
  signInWithEmailLink: jest.fn(),
}))

// Mock Firebase
jest.mock('@/firebase/firebase', () => ({
  app: {
    name: '[DEFAULT]',
    options: {},
  },
  analytics: null,
  db: {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(),
        set: jest.fn(),
        update: jest.fn(),
      })),
    })),
  },
}))

// Mock UserProfile context
jest.mock('@/contexts/UserProfileContext', () => ({
  useUserProfile: () => ({ profile: null, loading: false }),
}))

describe('LoginPage Email Links', () => {
  beforeEach(() => {
    // Reset mocks
    (getPlatform as jest.Mock).mockReset()
    (getEmailService as jest.Mock).mockReset()
  })

  it('shows desktop email links on desktop devices', () => {
    (getPlatform as jest.Mock).mockReturnValue('desktop')
    (getEmailService as jest.Mock).mockReturnValue('gmail')
    render(<LoginPage />)
    
    // Submit form to show email links
    const emailInput = screen.getByPlaceholderText('Enter your email')
    fireEvent.change(emailInput, { target: { value: 'test@gmail.com' } })
    fireEvent.submit(screen.getByRole('form'))

    // Check desktop links are visible
    expect(screen.getByText('Gmail')).toBeInTheDocument()
    expect(screen.getByText('Outlook')).toBeInTheDocument()
    expect(screen.getByText('ProtonMail')).toBeInTheDocument()
  })

  it('shows mobile email links on mobile devices', () => {
    (getPlatform as jest.Mock).mockReturnValue('apple')
    (getEmailService as jest.Mock).mockReturnValue('gmail')
    render(<LoginPage />)
    
    // Submit form to show email links
    const emailInput = screen.getByPlaceholderText('Enter your email')
    fireEvent.change(emailInput, { target: { value: 'test@gmail.com' } })
    fireEvent.submit(screen.getByRole('form'))

    // Check mobile links are visible
    expect(screen.getByText('Apple Mail')).toBeInTheDocument()
    expect(screen.getByText('Gmail App')).toBeInTheDocument()
    expect(screen.getByText('Android Mail')).toBeInTheDocument()
  })

  it('highlights the correct button based on email service', () => {
    (getPlatform as jest.Mock).mockReturnValue('desktop')
    (getEmailService as jest.Mock).mockReturnValue('gmail')
    render(<LoginPage />)
    
    // Enter Gmail address
    const emailInput = screen.getByPlaceholderText('Enter your email')
    fireEvent.change(emailInput, { target: { value: 'test@gmail.com' } })
    fireEvent.submit(screen.getByRole('form'))

    // Check Gmail button is highlighted
    const gmailButton = screen.getByText('Gmail').closest('button')
    expect(gmailButton).toHaveAttribute('data-state', 'default')
    
    // Other buttons should not be highlighted
    const outlookButton = screen.getByText('Outlook').closest('button')
    expect(outlookButton).toHaveAttribute('data-state', 'outline')
  })

  it('highlights platform-specific buttons on mobile', () => {
    (getPlatform as jest.Mock).mockReturnValue('apple')
    (getEmailService as jest.Mock).mockReturnValue('gmail')
    render(<LoginPage />)
    
    // Submit form to show email links
    const emailInput = screen.getByPlaceholderText('Enter your email')
    fireEvent.change(emailInput, { target: { value: 'test@gmail.com' } })
    fireEvent.submit(screen.getByRole('form'))

    // Check Apple Mail button is highlighted
    const appleButton = screen.getByText('Apple Mail').closest('button')
    expect(appleButton).toHaveAttribute('data-state', 'default')
    
    // Other buttons should not be highlighted
    const gmailButton = screen.getByText('Gmail App').closest('button')
    expect(gmailButton).toHaveAttribute('data-state', 'outline')
  })
}) 