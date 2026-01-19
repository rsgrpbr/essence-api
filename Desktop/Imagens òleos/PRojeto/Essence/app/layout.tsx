import type React from "react"
import type { Metadata } from "next"
import Script from "next/script"
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { GoogleAnalytics } from "@next/third-parties/google"
import { BottomNav } from "@/components/bottom-nav"
import { SubscriptionProvider } from "@/lib/contexts/subscription-context"
import { PendingTriggersModal } from "@/components/pending-triggers-modal"
import { NotificationModalWrapper } from "@/components/notification-modal-wrapper"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })
const _playfair = Playfair_Display({ subsets: ["latin"] })

// --- INÍCIO DA ALTERAÇÃO: METADATA PWA ---
export const metadata: Metadata = {
  title: "Essence App",
  description: "Descubra o óleo essencial perfeito para você",
  generator: "v0.app",

  // 1. Configuração do Web App Manifest
  manifest: "/pwa_manifest.json",

  // 2. Cor do Tema (mude para a cor principal do seu app)
  themeColor: "#faf9f7", // Sugestão de cor clara, ajuste conforme seu design

  // 3. Configurações Específicas para iOS
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Essence App", // Nome que aparecerá na tela inicial do iOS
  },

  // 4. Ícones PWA e iOS (ajustados para usar os nomes de arquivo que você criou)
  icons: {
    icon: "/icons/icon-192x192.png", // Ícone PWA padrão
    apple: "/icons/apple-touch-icon.png", // Ícone para iOS
  },
}
// --- FIM DA ALTERAÇÃO: METADATA PWA ---

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Facebook Domain Verification */}
        <meta name="facebook-domain-verification" content="gwn8uff0rp0xf7lzq7t5nncmnnybuo" />
        
        {/* Meta Pixel Code */}
        {process.env.NEXT_PUBLIC_META_PIXEL_ID && (
          <>
            <Script
              id="meta-pixel"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  !function(f,b,e,v,n,t,s)
                  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                  n.queue=[];t=b.createElement(e);t.async=!0;
                  t.src=v;s=b.getElementsByTagName(e)[0];
                  s.parentNode.insertBefore(t,s)}(window, document,'script',
                  'https://connect.facebook.net/en_US/fbevents.js');
                  fbq('init', '${process.env.NEXT_PUBLIC_META_PIXEL_ID}');
                  fbq('track', 'PageView');
                `,
              }}
            />
            <noscript>
              <img
                height="1"
                width="1"
                style={{ display: "none" }}
                src={`https://www.facebook.com/tr?id=${process.env.NEXT_PUBLIC_META_PIXEL_ID}&ev=PageView&noscript=1`}
                alt=""
              />
            </noscript>
          </>
        )}
        {/* End Meta Pixel Code */}
      </head>
      <body className={`font-sans antialiased`}>
        <SubscriptionProvider>
          <div className="pb-20">{children}</div>
          <BottomNav />
        </SubscriptionProvider>
        <Analytics />
        {process.env.NEXT_PUBLIC_GA_ID && <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />}

        {/* --- INÍCIO DA ALTERAÇÃO: SCRIPT DE REGISTRO DO SERVICE WORKER --- */}
        {/* Este script injeta o código JavaScript para registrar o sw.js */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                      console.log('Service Worker registrado com sucesso:', registration.scope);
                    })
                    .catch(error => {
                      console.log('Falha no registro do Service Worker:', error);
                    });
                });
              }
            `,
          }}
        />
        {/* --- FIM DA ALTERAÇÃO: SCRIPT DE REGISTRO DO SERVICE WORKER --- */}

        <PendingTriggersModal />

        {/* --- INÍCIO DA ALTERAÇÃO: USANDO WRAPPER CLIENT-SIDE PARA FETCH USER DATA --- */}
        <NotificationModalWrapper />
        {/* --- FIM DA ALTERAÇÃO: USANDO WRAPPER CLIENT-SIDE PARA FETCH USER DATA --- */}
      </body>
    </html>
  )
}
