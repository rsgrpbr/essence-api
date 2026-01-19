"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"

interface TrackingData {
  utm_source: string | null
  utm_campaign: string | null
  utm_content: string | null
  utm_medium: string | null
  fbclid: string | null
  _fbp: string | null
  _fbc: string | null
  ip: string | null
  userAgent: string | null
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null
  }
  return null
}

export function useTracking(): TrackingData | null {
  const searchParams = useSearchParams()
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null)

  useEffect(() => {
    const fetchTrackingData = async () => {
      try {
        // Get URL parameters
        const utm_source = searchParams.get("utm_source")
        const utm_campaign = searchParams.get("utm_campaign")
        const utm_content = searchParams.get("utm_content")
        const utm_medium = searchParams.get("utm_medium")
        const fbclid = searchParams.get("fbclid")

        // Get Meta Pixel cookies
        const _fbp = getCookie("_fbp")
        let _fbc = getCookie("_fbc")

        // If fbclid exists in URL but no _fbc cookie, create one
        if (fbclid && !_fbc) {
          _fbc = `fb.1.${Date.now()}.${fbclid}`
        }

        // Fetch user's IP address
        let ip: string | null = null
        try {
          const ipResponse = await fetch("https://api.ipify.org?format=json")
          if (ipResponse.ok) {
            const ipData = await ipResponse.json()
            ip = ipData.ip
          }
        } catch (error) {
          console.error("Failed to fetch IP address:", error)
        }

        // Get user agent
        const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : null

        const data: TrackingData = {
          utm_source,
          utm_campaign,
          utm_content,
          utm_medium,
          fbclid,
          _fbp,
          _fbc,
          ip,
          userAgent,
        }

        // Save to localStorage
        try {
          localStorage.setItem("tracking_data", JSON.stringify(data))
        } catch (error) {
          console.error("Failed to save tracking data to localStorage:", error)
        }

        // Log tracking data for debugging
        console.log("📊 [TRACKING] Tracking data captured:", data)

        setTrackingData(data)
      } catch (error) {
        console.error("Failed to fetch tracking data:", error)
      }
    }

    fetchTrackingData()
  }, [searchParams])

  return trackingData
}
