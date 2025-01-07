// Declare gtag for TypeScript
declare global {
  interface Window {
    gtag: (command: string, ...args: unknown[]) => void
  }
}

// Types for analytics events
interface BaseEventParams {
  user_id?: string
  [key: string]: unknown
}

interface SubscriptionEventParams extends BaseEventParams {
  transaction_id?: string
  value?: number
  currency?: string
  items?: Array<{
    item_name: string
    item_category: string
    price: number
    quantity: number
  }>
}

// Analytics utility class
class Analytics {
  private isEnabled(): boolean {
    return typeof window !== 'undefined' && !!window.gtag
  }

  private track(eventName: string, params: BaseEventParams = {}): void {
    if (!this.isEnabled()) return

    window.gtag('event', eventName, {
      ...params,
      send_to: 'G-4XC08SH2XT'
    })
  }

  // User identification
  identify(userId: string, userProperties: Record<string, unknown> = {}): void {
    if (!this.isEnabled()) return

    window.gtag('set', 'user_properties', {
      user_id: userId,
      ...userProperties
    })

    window.gtag('config', 'G-4XC08SH2XT', {
      user_id: userId
    })
  }

  // Track page views
  trackPageView(path: string, params: BaseEventParams = {}): void {
    if (!this.isEnabled()) return

    window.gtag('config', 'G-4XC08SH2XT', {
      page_path: path,
      ...params
    })
  }

  // Track button clicks
  trackButtonClick(buttonId: string, params: BaseEventParams = {}): void {
    this.track('button_click', {
      button_id: buttonId,
      ...params
    })
  }

  // Track subscription events
  trackSubscription(
    action: 'start' | 'success' | 'cancel',
    params: SubscriptionEventParams = {}
  ): void {
    switch (action) {
      case 'start':
        this.track('begin_checkout', params)
        break
      case 'success':
        // Track conversion
        this.track('conversion', {
          event_category: 'subscription',
          event_label: 'new_subscription',
          ...params
        })
        // Track purchase
        this.track('purchase', params)
        break
      case 'cancel':
        this.track('subscription_canceled', {
          event_category: 'subscription',
          event_label: 'subscription_canceled',
          ...params
        })
        break
    }
  }

  // Track errors
  trackError(error: Error, location: string, params: BaseEventParams = {}): void {
    this.track('error', {
      error_description: error.message,
      error_type: error.name,
      error_location: location,
      ...params
    })
  }
}

// Export a singleton instance
const analytics = new Analytics()
export default analytics 