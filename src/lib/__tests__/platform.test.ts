import { getEmailService, getPlatform } from '../platform'

describe('getEmailService', () => {
  it('detects Gmail addresses', () => {
    expect(getEmailService('test@gmail.com')).toBe('gmail')
  })

  it('detects Outlook addresses', () => {
    expect(getEmailService('test@outlook.com')).toBe('outlook')
    expect(getEmailService('test@hotmail.com')).toBe('outlook')
    expect(getEmailService('test@live.com')).toBe('outlook')
  })

  it('detects ProtonMail addresses', () => {
    expect(getEmailService('test@protonmail.com')).toBe('proton')
    expect(getEmailService('test@pm.me')).toBe('proton')
  })

  it('defaults to Gmail for unknown email providers', () => {
    expect(getEmailService('test@example.com')).toBe('gmail')
  })
})

describe('getPlatform', () => {
  const mockUserAgent = (userAgent: string) => {
    Object.defineProperty(window.navigator, 'userAgent', {
      value: userAgent,
      configurable: true
    })
  }

  it('detects Apple devices', () => {
    mockUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)')
    expect(getPlatform()).toBe('apple')

    mockUserAgent('Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)')
    expect(getPlatform()).toBe('apple')

    mockUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)')
    expect(getPlatform()).toBe('apple')
  })

  it('detects Android devices', () => {
    mockUserAgent('Mozilla/5.0 (Linux; Android 10; SM-G960U)')
    expect(getPlatform()).toBe('android')
  })

  it('defaults to desktop for other platforms', () => {
    mockUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)')
    expect(getPlatform()).toBe('desktop')
  })
}) 