/**
 * Coupon Validation Service
 * Handles coupon validation and application to payments
 */

export interface CouponValidationResponse {
  valid: boolean
  coupon?: {
    id: string
    code: string
    name: string
    percent_off?: number
    amount_off?: number
    duration: string
    discount: number
    type: "percentage" | "fixed"
  }
  discountedAmount?: number
  savings?: number
  error?: string
}

export interface ApplyCouponResponse {
  success: boolean
  error?: string
}

/**
 * Validates a coupon code and calculates the discount
 */
export async function validateCoupon(code: string, amount: number, userId: string): Promise<CouponValidationResponse> {
  const trimmedCode = code.toUpperCase().trim()

  if (!trimmedCode) {
    return {
      valid: false,
      error: "Código de cupom não pode estar vazio",
    }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[v0] Missing Supabase environment variables")
    return {
      valid: false,
      error: "Configuração do servidor incompleta",
    }
  }

  const url = `${supabaseUrl}/functions/v1/validate-coupon`
  const timeout = 10000
  const maxRetries = 1

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[v0] Validating coupon ${trimmedCode} (attempt ${attempt + 1})`)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          code: trimmedCode,
          amount,
          userId,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error(`[v0] Coupon validation failed: ${response.status}`, errorData)

        if (response.status >= 400 && response.status < 500) {
          return {
            valid: false,
            error: errorData.error || "Cupom inválido ou expirado",
          }
        }

        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 1000))
          continue
        }

        return {
          valid: false,
          error: "Erro ao validar cupom. Tente novamente.",
        }
      }

      const data: CouponValidationResponse = await response.json()
      console.log(`[v0] Coupon validation successful:`, data)
      return data
    } catch (error: any) {
      console.error(`[v0] Coupon validation error:`, error)

      if (error.name === "AbortError") {
        if (attempt < maxRetries) {
          continue
        }
        return {
          valid: false,
          error: "Tempo limite excedido. Tente novamente.",
        }
      }

      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        continue
      }

      return {
        valid: false,
        error: "Erro de conexão. Verifique sua internet.",
      }
    }
  }

  return {
    valid: false,
    error: "Erro ao validar cupom. Tente novamente.",
  }
}

/**
 * Applies a validated coupon to a Stripe payment intent
 */
export async function applyCouponToPayment(paymentIntentId: string, couponCode: string): Promise<ApplyCouponResponse> {
  const trimmedCode = couponCode.toUpperCase().trim()

  if (!trimmedCode || !paymentIntentId) {
    return {
      success: false,
      error: "Dados inválidos",
    }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      success: false,
      error: "Configuração do servidor incompleta",
    }
  }

  const url = `${supabaseUrl}/functions/v1/apply-coupon-to-payment`

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        paymentIntentId,
        couponCode: trimmedCode,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.error || "Erro ao aplicar cupom",
      }
    }

    return { success: true }
  } catch (error: any) {
    if (error.name === "AbortError") {
      return {
        success: false,
        error: "Tempo limite excedido. Tente novamente.",
      }
    }

    return {
      success: false,
      error: "Erro de conexão. Verifique sua internet.",
    }
  }
}
