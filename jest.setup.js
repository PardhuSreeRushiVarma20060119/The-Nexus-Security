// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    }
  },
  usePathname() {
    return ''
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
}))

// Mock socket.io
jest.mock('socket.io-client', () => ({
  io: jest.fn(),
}))

// Mock environment variables
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000'
process.env.NEXTAUTH_SECRET = 'test-secret'
process.env.NEXTAUTH_URL = 'http://localhost:3000' 