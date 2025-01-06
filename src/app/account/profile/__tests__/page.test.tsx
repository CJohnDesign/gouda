import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import ProfilePage from '../page'

// Mock the toast component
jest.mock('@/components/ui/toast', () => ({
  ...jest.requireActual('@/components/ui/toast'),
  Toast: ({ children, onOpenChange }: { children: React.ReactNode, onOpenChange: (open: boolean) => void }) => (
    <div data-testid="toast" onClick={() => onOpenChange(false)}>
      {children}
    </div>
  ),
  ToastProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  ToastViewport: () => <div data-testid="toast-viewport" />,
}))

// Mock the UserProfileContext
jest.mock('@/contexts/UserProfileContext', () => ({
  useUserProfile: jest.fn(),
  UserProfileProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

// Mock useSearchParams
jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'),
  useSearchParams: () => new URLSearchParams(''),
}))

// Get the mocked useUserProfile function
const mockUseUserProfile = jest.requireMock('@/contexts/UserProfileContext').useUserProfile

describe('ProfilePage', () => {
  const mockUser = {
    email: 'test@example.com',
    getIdToken: jest.fn().mockResolvedValue('mock-token'),
  }

  const mockProfile = {
    firstName: 'John',
    lastName: 'Doe',
    telegramUsername: 'johndoe',
    phoneNumber: '1234567890',
    location: 'New York',
    bio: 'Test bio',
    subscriptionStatus: 'Active',
  }

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()
    mockFetch.mockReset()

    // Setup default mock implementation
    mockUseUserProfile.mockReturnValue({
      user: mockUser,
      profile: mockProfile,
      loading: false,
      refreshProfile: jest.fn(),
    })
  })

  it('renders loading state initially', () => {
    mockUseUserProfile.mockReturnValue({
      user: null,
      profile: null,
      loading: true,
      refreshProfile: jest.fn(),
    })

    render(<ProfilePage />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('renders profile form with user data', () => {
    render(<ProfilePage />)

    expect(screen.getByText('Profile')).toBeInTheDocument()
    expect(screen.getByDisplayValue('John')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Doe')).toBeInTheDocument()
    expect(screen.getByDisplayValue('johndoe')).toBeInTheDocument()
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument()
    expect(screen.getByDisplayValue('1234567890')).toBeInTheDocument()
    expect(screen.getByDisplayValue('New York')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test bio')).toBeInTheDocument()
  })

  it('handles input changes for all fields', () => {
    render(<ProfilePage />)

    // Test each input field
    const fields = {
      firstName: 'Jane',
      lastName: 'Smith',
      telegramUsername: 'janesmith',
      phoneNumber: '9876543210',
      location: 'Los Angeles',
      bio: 'Updated bio'
    }

    for (const [field, value] of Object.entries(fields)) {
      const input = screen.getByDisplayValue(mockProfile[field as keyof typeof mockProfile])
      fireEvent.change(input, { target: { value } })
      expect(input).toHaveValue(value)
    }
  })

  it('handles form submission successfully', async () => {
    const mockRefreshProfile = jest.fn()
    mockUseUserProfile.mockReturnValue({
      user: mockUser,
      profile: mockProfile,
      loading: false,
      refreshProfile: mockRefreshProfile,
    })

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    })

    render(<ProfilePage />)

    const saveButton = screen.getByText('Save Changes')
    await act(async () => {
      fireEvent.click(saveButton)
    })

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/user-profile', {
        method: 'PATCH',
        headers: {
          'Authorization': 'Bearer mock-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockProfile),
      })
      expect(mockRefreshProfile).toHaveBeenCalled()
    })

    expect(screen.getByText('Success')).toBeInTheDocument()
    expect(screen.getByText('Your profile has been updated.')).toBeInTheDocument()
  })

  it('handles form submission with network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    render(<ProfilePage />)

    const saveButton = screen.getByText('Save Changes')
    await act(async () => {
      fireEvent.click(saveButton)
    })

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument()
      expect(screen.getByText('Network error')).toBeInTheDocument()
    })
  })

  it('handles form submission with invalid response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      statusText: 'Bad Request',
      json: async () => ({ error: { message: 'Invalid data' } }),
    })

    render(<ProfilePage />)

    const saveButton = screen.getByText('Save Changes')
    await act(async () => {
      fireEvent.click(saveButton)
    })

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument()
      expect(screen.getByText('Invalid data')).toBeInTheDocument()
    })
  })

  it('handles form submission with non-JSON error response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      statusText: 'Server Error',
      json: async () => { throw new Error('Invalid JSON') },
    })

    render(<ProfilePage />)

    const saveButton = screen.getByText('Save Changes')
    await act(async () => {
      fireEvent.click(saveButton)
    })

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument()
      expect(screen.getByText('Server Error')).toBeInTheDocument()
    })
  })

  it('shows welcome message when subscription is active', () => {
    jest.spyOn(URLSearchParams.prototype, 'get').mockReturnValue('active')

    render(<ProfilePage />)
    
    expect(screen.getByText('Welcome to the community!')).toBeInTheDocument()
    expect(screen.getByText(/Take a moment to complete your profile/)).toBeInTheDocument()
  })

  it('shows telegram info message for active subscription without username', () => {
    mockUseUserProfile.mockReturnValue({
      user: mockUser,
      profile: { ...mockProfile, telegramUsername: '', subscriptionStatus: 'Active' },
      loading: false,
      refreshProfile: jest.fn(),
    })

    render(<ProfilePage />)
    
    expect(screen.getByText(/You're in! Add your Telegram handle/)).toBeInTheDocument()
  })

  it('shows subscription prompt for unpaid users', () => {
    mockUseUserProfile.mockReturnValue({
      user: mockUser,
      profile: { ...mockProfile, subscriptionStatus: 'Unpaid' },
      loading: false,
      refreshProfile: jest.fn(),
    })

    render(<ProfilePage />)
    
    expect(screen.getByText(/You're almost there!/)).toBeInTheDocument()
    expect(screen.getByText('Subscribe')).toHaveAttribute('href', '/account/subscription')
  })

  it('returns null when user is not authenticated', () => {
    mockUseUserProfile.mockReturnValue({
      user: null,
      profile: null,
      loading: false,
      refreshProfile: jest.fn(),
    })

    const { container } = render(<ProfilePage />)
    expect(container.firstChild).toBeNull()
  })

  it('returns null when profile is not loaded', () => {
    mockUseUserProfile.mockReturnValue({
      user: mockUser,
      profile: null,
      loading: false,
      refreshProfile: jest.fn(),
    })

    const { container } = render(<ProfilePage />)
    expect(container.firstChild).toBeNull()
  })

  it('handles toast dismissal', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    })

    render(<ProfilePage />)

    const saveButton = screen.getByText('Save Changes')
    await act(async () => {
      fireEvent.click(saveButton)
    })

    const toast = screen.getByTestId('toast')
    expect(toast).toBeInTheDocument()

    // Simulate toast being closed
    await act(async () => {
      fireEvent.click(toast)
    })

    await waitFor(() => {
      expect(screen.queryByTestId('toast')).not.toBeInTheDocument()
    })
  })

  it('disables email input field', () => {
    render(<ProfilePage />)
    
    const emailInput = screen.getByDisplayValue('test@example.com')
    expect(emailInput).toBeDisabled()
    expect(emailInput).toHaveClass('cursor-not-allowed')
  })
}) 