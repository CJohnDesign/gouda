import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import SubscriptionPage from '../page'

// Mock the UserProfileContext
jest.mock('@/contexts/UserProfileContext', () => ({
  useUserProfile: jest.fn(),
}))

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

// Mock window.location
const mockLocation = {
  href: '',
  reload: jest.fn(),
}
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
})

// Get the mocked useUserProfile function
const mockUseUserProfile = jest.requireMock('@/contexts/UserProfileContext').useUserProfile

describe('SubscriptionPage', () => {
  const mockUser = {
    uid: 'test-uid',
    email: 'test@example.com',
    getIdToken: jest.fn().mockResolvedValue('mock-token'),
  }

  const mockActiveProfile = {
    subscriptionStatus: 'Active',
  }

  const mockUnpaidProfile = {
    subscriptionStatus: 'Unpaid',
  }

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()
    mockFetch.mockReset()
    mockLocation.href = ''
    mockLocation.reload = jest.fn()

    // Setup default mock implementation for unpaid user
    mockUseUserProfile.mockReturnValue({
      user: mockUser,
      profile: mockUnpaidProfile,
      loading: false,
      error: null,
    })
  })

  it('renders loading state initially', () => {
    mockUseUserProfile.mockReturnValue({
      user: null,
      profile: null,
      loading: true,
      error: null,
    })

    render(<SubscriptionPage />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('renders subscription page for unpaid user', () => {
    render(<SubscriptionPage />)

    expect(screen.getByText('Subscription')).toBeInTheDocument()
    expect(screen.getByText('Subscribe Now')).toBeInTheDocument()
    expect(screen.queryByText('Cancel Subscription')).not.toBeInTheDocument()
  })

  it('renders subscription page for active subscriber', () => {
    mockUseUserProfile.mockReturnValue({
      user: mockUser,
      profile: mockActiveProfile,
      loading: false,
      error: null,
    })

    render(<SubscriptionPage />)

    expect(screen.getByText('Manage Billing')).toBeInTheDocument()
    expect(screen.getByText('Cancel Subscription')).toBeInTheDocument()
  })

  it('handles subscription action for unpaid user', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ url: 'https://checkout.stripe.com/test' }),
    })

    render(<SubscriptionPage />)

    const subscribeButton = screen.getByText('Subscribe Now')
    await act(async () => {
      fireEvent.click(subscribeButton)
    })

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer mock-token',
          'Content-Type': 'application/json',
        },
      })
      expect(mockLocation.href).toBe('https://checkout.stripe.com/test')
    })
  })

  it('handles subscription action for active subscriber', async () => {
    mockUseUserProfile.mockReturnValue({
      user: mockUser,
      profile: mockActiveProfile,
      loading: false,
      error: null,
    })

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ url: 'https://billing.stripe.com/test' }),
    })

    render(<SubscriptionPage />)

    const manageButton = screen.getByText('Manage Billing')
    await act(async () => {
      fireEvent.click(manageButton)
    })

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/create-portal-session', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer mock-token',
          'Content-Type': 'application/json',
        },
      })
      expect(mockLocation.href).toBe('https://billing.stripe.com/test')
    })
  })

  it('handles subscription action errors', async () => {
    const errorMessage = 'Failed to create session'
    mockFetch.mockResolvedValueOnce({
      ok: false,
      statusText: errorMessage,
      json: async () => ({ error: { message: errorMessage } }),
    })

    render(<SubscriptionPage />)

    const subscribeButton = screen.getByText('Subscribe Now')
    await act(async () => {
      fireEvent.click(subscribeButton)
    })

    await waitFor(() => {
      expect(screen.getByText(`Request failed: ${errorMessage}`)).toBeInTheDocument()
    })
  })

  describe('Subscription Cancellation', () => {
    beforeEach(() => {
      mockUseUserProfile.mockReturnValue({
        user: mockUser,
        profile: mockActiveProfile,
        loading: false,
        error: null,
      })
    })

    it('opens cancellation dialog when cancel button is clicked', () => {
      render(<SubscriptionPage />)
      
      const cancelButton = screen.getByText('Cancel Subscription')
      fireEvent.click(cancelButton)
      
      expect(screen.getByText('Are you sure you want to cancel?')).toBeInTheDocument()
      expect(screen.getByText(/You'll lose access to all premium features/)).toBeInTheDocument()
      expect(screen.getByText('Yes, Cancel Subscription')).toBeInTheDocument()
      expect(screen.getByText('Go Back')).toBeInTheDocument()
    })

    it('closes cancellation dialog when clicking escape', () => {
      render(<SubscriptionPage />)
      
      // Open dialog
      const cancelButton = screen.getByText('Cancel Subscription')
      fireEvent.click(cancelButton)
      
      // Press escape
      fireEvent.keyDown(screen.getByRole('alertdialog'), { key: 'Escape' })
      
      // Dialog should be closed
      expect(screen.queryByText('Are you sure you want to cancel?')).not.toBeInTheDocument()
    })

    it('handles network errors during cancellation', async () => {
      const errorMessage = 'Network error'
      mockFetch.mockRejectedValueOnce(new Error(errorMessage))
      
      render(<SubscriptionPage />)
      
      // Open dialog and click confirm
      const cancelButton = screen.getByText('Cancel Subscription')
      fireEvent.click(cancelButton)
      
      const confirmButton = screen.getByText('Yes, Cancel Subscription')
      await act(async () => {
        fireEvent.click(confirmButton)
      })
      
      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument()
      })
    })

    it('handles invalid response during cancellation', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Invalid response',
        json: async () => ({ error: { message: 'Failed to cancel subscription' } }),
      })
      
      render(<SubscriptionPage />)
      
      // Open dialog and click confirm
      const cancelButton = screen.getByText('Cancel Subscription')
      fireEvent.click(cancelButton)
      
      const confirmButton = screen.getByText('Yes, Cancel Subscription')
      await act(async () => {
        fireEvent.click(confirmButton)
      })
      
      await waitFor(() => {
        expect(screen.getByText('Request failed: Invalid response')).toBeInTheDocument()
      })
    })

    it('refreshes the page after successful cancellation', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })
      
      render(<SubscriptionPage />)
      
      // Open dialog and click confirm
      const cancelButton = screen.getByText('Cancel Subscription')
      fireEvent.click(cancelButton)
      
      const confirmButton = screen.getByText('Yes, Cancel Subscription')
      await act(async () => {
        fireEvent.click(confirmButton)
      })
      
      await waitFor(() => {
        expect(mockLocation.reload).toHaveBeenCalledTimes(1)
      })
    })
  })

  it('displays profile errors', () => {
    const profileError = 'Failed to load profile'
    mockUseUserProfile.mockReturnValue({
      user: mockUser,
      profile: null,
      loading: false,
      error: profileError,
    })

    render(<SubscriptionPage />)
    expect(screen.getByText(profileError)).toBeInTheDocument()
  })
}) 