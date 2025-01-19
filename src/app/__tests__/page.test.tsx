import React from 'react'
import { render, screen } from '@testing-library/react'
import Image from 'next/image'
import HomePage from '../page'

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: function MockImage({ src, alt, ...props }: React.ComponentProps<typeof Image>) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src.toString()} alt={alt || ''} {...props} />;
  },
}))

// Mock useRouter
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

// Mock UserProfileContext
jest.mock('@/contexts/UserProfileContext', () => ({
  useUserProfile: () => ({
    user: null,
    profile: null,
    loading: false,
  }),
}))

describe('HomePage', () => {
  it('renders the home page', () => {
    render(<HomePage />)
    expect(screen.getByText('Learn To Jam!')).toBeInTheDocument()
    expect(screen.getByText(/weekly group lessons/i)).toBeInTheDocument()
    expect(screen.getByText('Join Now')).toBeInTheDocument()
    expect(screen.getByText('Login')).toBeInTheDocument()
  })
}) 