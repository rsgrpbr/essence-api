import {
  FacebookAdsApi,
  ServerEvent,
  EventRequest,
  UserData,
  CustomData,
} from 'facebook-nodejs-business-sdk'

// Initialize Facebook Ads API with access token
if (process.env.META_ACCESS_TOKEN) {
  FacebookAdsApi.init(process.env.META_ACCESS_TOKEN)
  console.log('[Meta CAPI] Facebook Ads API initialized')
} else {
  console.warn('[Meta CAPI] META_ACCESS_TOKEN not found in environment variables')
}

export interface PurchaseEventData {
  email: string
  phone?: string
  firstName?: string
  lastName?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string // default 'BR'
  fbp?: string
  fbc?: string
  ipAddress?: string
  userAgent?: string
  amount: number
  currency: string
  transactionId: string
  creative?: string
  campaign?: string
}

export async function sendPurchaseToMeta(
  data: PurchaseEventData
): Promise<{ success: boolean; response?: any; error?: string }> {
  try {
    console.log('[Meta CAPI] Starting purchase event send for transaction:', data.transactionId)

    // Validate required fields
    if (!data.email) {
      throw new Error('Email is required')
    }
    if (!data.amount) {
      throw new Error('Amount is required')
    }
    if (!data.currency) {
      throw new Error('Currency is required')
    }
    if (!data.transactionId) {
      throw new Error('Transaction ID is required')
    }
    if (!process.env.META_ACCESS_TOKEN) {
      throw new Error('META_ACCESS_TOKEN environment variable is not set')
    }
    if (!process.env.META_PIXEL_ID) {
      throw new Error('META_PIXEL_ID environment variable is not set')
    }

    // Create UserData with all user information
    const userData = new UserData()
      .setEmail(data.email)
      .setPhone(data.phone || null)
      .setFirstName(data.firstName || null)
      .setLastName(data.lastName || null)
      .setCity(data.city || null)
      .setState(data.state || null)
      .setZipCode(data.zipCode || null)
      .setCountryCode((data.country || 'BR').toUpperCase())
      .setFbp(data.fbp || null)
      .setFbc(data.fbc || null)
      .setClientIpAddress(data.ipAddress || null)
      .setClientUserAgent(data.userAgent || null)

    console.log('[Meta CAPI] UserData created:', {
      email: data.email,
      phone: data.phone ? '***' : null,
      country: data.country || 'BR',
      hasFbp: !!data.fbp,
      hasFbc: !!data.fbc,
    })

    // Create CustomData with purchase information
    const customData = new CustomData()
      .setValue(data.amount)
      .setCurrency(data.currency.toUpperCase())
      .setContentIds(['essence_premium'])
      .setContentName(data.creative || 'essence_premium')
      .setContentCategory(data.campaign || 'premium')

    console.log('[Meta CAPI] CustomData created:', {
      amount: data.amount,
      currency: data.currency,
      contentIds: ['essence_premium'],
      contentName: data.creative || 'essence_premium',
      contentCategory: data.campaign || 'premium',
    })

    // Create ServerEvent with event details
    const serverEvent = new ServerEvent()
      .setEventName('Purchase')
      .setEventTime(Math.floor(Date.now() / 1000))
      .setActionSource('website')
      .setEventId(data.transactionId)
      .setEventSourceUrl(process.env.NEXT_PUBLIC_APP_URL || null)
      .setUserData(userData)
      .setCustomData(customData)

    console.log('[Meta CAPI] ServerEvent created:', {
      eventName: 'Purchase',
      eventId: data.transactionId,
      actionSource: 'website',
      eventSourceUrl: process.env.NEXT_PUBLIC_APP_URL || null,
    })

    // Create EventRequest and send the event
    const pixelId = process.env.META_PIXEL_ID
    const eventRequest = new EventRequest(process.env.META_ACCESS_TOKEN!, pixelId).setEvents([
      serverEvent,
    ])

    console.log('[Meta CAPI] Sending event to Meta Pixel:', pixelId)
    const response = await eventRequest.execute()

    console.log('[Meta CAPI] Event sent successfully:', {
      transactionId: data.transactionId,
      response: response,
    })

    return {
      success: true,
      response: response,
    }
  } catch (error: any) {
    console.error('[Meta CAPI] Error sending purchase event:', {
      transactionId: data.transactionId,
      error: error.message || error,
      stack: error.stack,
    })

    return {
      success: false,
      error: error.message || 'Unknown error occurred',
    }
  }
}
