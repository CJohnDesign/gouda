import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import SettingsPage from '../page'
import { signOut } from 'firebase/auth'
import { useRouter } from 'next/navigation'

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  signOut: jest.fn(),
}))

// Mock Next Router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock ThemeToggle component
jest.mock('@/components/theme-toggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle">Theme Toggle</div>,
}))

describe('SettingsPage', () => {
  const mockPush = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
    ;(signOut as jest.Mock).mockResolvedValue(undefined)
  })

  it('renders settings page with all elements', () => {
    render(<SettingsPage />)

    // Check headings and descriptions
    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByText('Manage your account settings and preferences.')).toBeInTheDocument()
    
    // Check theme section
    expect(screen.getByText('Theme')).toBeInTheDocument()
    expect(screen.getByText('Switch between light and dark mode.')).toBeInTheDocument()
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument()

    // Check sign out section
    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument()
    expect(screen.getByText('Sign out of your account.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign Out' })).toBeInTheDocument()
  })

  it('handles successful logout', async () => {
    render(<SettingsPage />)

    const signOutButton = screen.getByRole('button', { name: 'Sign Out' })
    await act(async () => {
      fireEvent.click(signOutButton)
    })

    expect(signOut).toHaveBeenCalled()
    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('handles logout error', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    const error = new Error('Failed to sign out')
    ;(signOut as jest.Mock).mockRejectedValueOnce(error)

    render(<SettingsPage />)

    const signOutButton = screen.getByRole('button', { name: 'Sign Out' })
    await act(async () => {
      fireEvent.click(signOutButton)
    })

    expect(signOut).toHaveBeenCalled()
    expect(mockPush).not.toHaveBeenCalled()
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error signing out:', error)

    consoleErrorSpy.mockRestore()
  })
}) 