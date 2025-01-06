// Mock next/navigation before importing components
jest.mock('next/navigation', () => ({
  usePathname: jest.fn()
}))

import React from 'react'
import { render, screen } from '@testing-library/react'
import AccountLayout from '../layout'
import { usePathname } from 'next/navigation'

// Mock the Navbar component
jest.mock('@/components/ui/Navbar', () => ({
  Navbar: () => <div data-testid="navbar">Navbar</div>,
}))

describe('AccountLayout', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()
    // Set default pathname
    ;(usePathname as jest.Mock).mockReturnValue('/account/profile')
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('renders the layout with navigation and content', () => {
    render(
      <AccountLayout>
        <div>Test Content</div>
      </AccountLayout>
    )

    // Check if navbar is rendered
    expect(screen.getByTestId('navbar')).toBeInTheDocument()

    // Check if navigation links are rendered
    expect(screen.getByText('Profile')).toBeInTheDocument()
    expect(screen.getByText('Subscription')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()

    // Check if content is rendered
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('applies correct styles to active navigation item', () => {
    render(
      <AccountLayout>
        <div>Test Content</div>
      </AccountLayout>
    )

    // Get all navigation links
    const profileLink = screen.getByText('Profile').closest('a')
    const subscriptionLink = screen.getByText('Subscription').closest('a')
    const settingsLink = screen.getByText('Settings').closest('a')

    // Check if active link has primary background class
    expect(profileLink).toHaveClass('bg-primary')
    expect(subscriptionLink).not.toHaveClass('bg-primary')
    expect(settingsLink).not.toHaveClass('bg-primary')
  })

  it('updates active styles when pathname changes', () => {
    // Change pathname to subscription page
    (usePathname as jest.Mock).mockReturnValue('/account/subscription')

    render(
      <AccountLayout>
        <div>Test Content</div>
      </AccountLayout>
    )

    // Get all navigation links
    const profileLink = screen.getByText('Profile').closest('a')
    const subscriptionLink = screen.getByText('Subscription').closest('a')
    const settingsLink = screen.getByText('Settings').closest('a')

    // Check if subscription link is now active
    expect(profileLink).not.toHaveClass('bg-primary')
    expect(subscriptionLink).toHaveClass('bg-primary')
    expect(settingsLink).not.toHaveClass('bg-primary')
  })

  it('renders with correct link hrefs', () => {
    render(
      <AccountLayout>
        <div>Test Content</div>
      </AccountLayout>
    )

    // Check if links have correct href attributes
    expect(screen.getByText('Profile').closest('a')).toHaveAttribute('href', '/account/profile')
    expect(screen.getByText('Subscription').closest('a')).toHaveAttribute('href', '/account/subscription')
    expect(screen.getByText('Settings').closest('a')).toHaveAttribute('href', '/account/settings')
  })
}) 