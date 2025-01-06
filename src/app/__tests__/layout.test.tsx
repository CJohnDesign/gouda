import React from 'react'
import { render } from '@testing-library/react'
import RootLayout, { metadata } from '../layout'

// Mock the Inter font
jest.mock('next/font/google', () => ({
  Inter: () => ({
    className: 'mock-inter-class',
    subsets: ['latin'],
  }),
}))

// Mock the UserProfileProvider
jest.mock('@/contexts/UserProfileContext', () => ({
  UserProfileProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="user-profile-provider">{children}</div>
  ),
}))

// Mock the ThemeProvider
jest.mock('@/components/theme-provider', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="theme-provider" data-theme-props="class,light,true">{children}</div>
  ),
}))

describe('RootLayout', () => {
  it('renders layout with correct structure', () => {
    const { getByTestId, getByText } = render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    )

    // Check if providers are rendered
    expect(getByTestId('theme-provider')).toBeInTheDocument()
    expect(getByTestId('user-profile-provider')).toBeInTheDocument()

    // Check if children are rendered
    expect(getByText('Test Content')).toBeInTheDocument()
  })

  it('renders theme provider with correct props', () => {
    const { getByTestId } = render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    )

    const themeProvider = getByTestId('theme-provider')
    expect(themeProvider.getAttribute('data-theme-props')).toBe('class,light,true')
  })

  it('renders metadata correctly', () => {
    expect(metadata).toEqual({
      title: 'Gouda',
      description: 'Gouda - Your Music Community',
    })
  })
}) 