import React from 'react'
import { render, screen } from '@testing-library/react'
import { Navbar } from '../Navbar'

// Mock ProfileMenu component
jest.mock('../profile-menu', () => ({
  ProfileMenu: () => <div data-testid="profile-menu">Profile Menu</div>,
}))

describe('Navbar', () => {
  it('renders navigation links', () => {
    render(<Navbar />)

    // Test desktop links
    const desktopLinks = screen.getAllByRole('link').filter(link => !link.classList.contains('md:hidden'))
    expect(desktopLinks[0]).toHaveAttribute('href', '/songbook')
    expect(desktopLinks[1]).toHaveAttribute('href', '/playlists')
    expect(desktopLinks[2]).toHaveAttribute('href', 'https://chatgpt.com/g/g-papOU9639-harmonyquill')
  })

  it('renders external link attributes correctly', () => {
    render(<Navbar />)

    const harmonyQuillLinks = screen.getAllByRole('link').filter(link => 
      link.getAttribute('href')?.includes('harmonyquill')
    )
    harmonyQuillLinks.forEach(link => {
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })

  it('renders icons for all links', () => {
    render(<Navbar />)

    // Get desktop links
    const desktopLinks = screen.getAllByRole('link').filter(link => !link.classList.contains('md:hidden'))

    // Check for Book icon
    expect(desktopLinks[0]).toContainHTML('lucide-book')
    
    // Check for ListMusic icon
    expect(desktopLinks[1]).toContainHTML('lucide-list-music')
    
    // Check for Sparkles and ExternalLink icons
    expect(desktopLinks[2]).toContainHTML('lucide-sparkles')
    expect(desktopLinks[2]).toContainHTML('lucide-external-link')
  })

  it('renders responsive links correctly', () => {
    render(<Navbar />)

    // Desktop links (visible on md and larger screens)
    const desktopLinks = screen.getAllByRole('link').filter(link => !link.classList.contains('md:hidden'))
    desktopLinks.forEach(link => {
      expect(link).toHaveClass('hidden md:flex')
    })

    // Mobile links (visible on smaller screens)
    const mobileLinks = screen.getAllByRole('link').filter(link => link.classList.contains('md:hidden'))
    expect(mobileLinks).toHaveLength(3)
    mobileLinks.forEach(link => {
      expect(link).toHaveClass('md:hidden')
    })
  })

  it('renders profile menu', () => {
    render(<Navbar />)
    expect(screen.getByTestId('profile-menu')).toBeInTheDocument()
  })

  it('applies correct styling to the navbar', () => {
    render(<Navbar />)
    const navbar = screen.getByRole('navigation')
    expect(navbar).toHaveClass('h-16', 'bg-background', 'border-b', 'border-primary/30')
  })

  it('applies correct styling to the container', () => {
    render(<Navbar />)
    const container = screen.getByRole('navigation').firstChild as HTMLElement
    expect(container).toHaveClass('h-full', 'max-w-6xl', 'mx-auto', 'px-4', 'flex', 'items-center', 'justify-between')
  })

  it('renders screen reader text for mobile links', () => {
    render(<Navbar />)
    
    const mobileLinks = screen.getAllByRole('link').filter(link => link.classList.contains('md:hidden'))
    mobileLinks.forEach(link => {
      expect(link.querySelector('.sr-only')).toBeInTheDocument()
    })
  })
}) 