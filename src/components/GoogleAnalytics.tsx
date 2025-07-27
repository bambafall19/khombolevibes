
'use client'

import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

const pageview = (url: string, gaId?: string) => {
  if (typeof window.gtag !== 'undefined' && gaId) {
    window.gtag('config', gaId, {
      page_path: url,
    })
  }
}

declare global {
    interface Window {
        gtag: (...args: any[]) => void;
    }
}

export default function GoogleAnalytics({ gaId }: { gaId?: string }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (pathname) {
      const url = pathname + searchParams.toString()
      pageview(url, gaId)
    }
  }, [pathname, searchParams, gaId])

  if (!gaId) {
    console.warn("Google Analytics ID is missing. Add NEXT_PUBLIC_GA_ID to your environment variables.");
    return null;
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}');
          `,
        }}
      />
    </>
  )
}
