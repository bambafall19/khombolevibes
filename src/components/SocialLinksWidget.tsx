// src/components/SocialLinksWidget.tsx
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Share2 } from 'lucide-react';

const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <title>TikTok</title>
        <path fill="currentColor" d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-2.43.05-4.84-.95-6.43-2.8-1.59-1.87-2.32-4.2-2.31-6.53.01-2.34.72-4.66 2.31-6.52 1.59-1.86 3.99-2.79 6.42-2.81.02 1.48-.02 2.96-.01 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.73-.21.59-.25 1.28-.12 1.91.13.63.43 1.23.82 1.74.39.51.89.92 1.48 1.23.59.3 1.25.46 1.92.48a3.8 3.8 0 002.12-.49c.52-.3.93-.74 1.22-1.23.29-.49.46-.99.51-1.52.01-1.49.01-2.97 0-4.46z" />
    </svg>
)

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <title>Facebook</title>
    <path fill="currentColor" d="M22.675 0h-21.35C.59 0 0 .59 0 1.325v21.35C0 23.41.59 24 1.325 24H12.82v-9.29h-3.128v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.658-4.788 1.325 0 2.463.099 2.795.143v3.24h-1.918c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h5.713c.735 0 1.325-.59 1.325-1.325V1.325C24 .59 23.41 0 22.675 0z"/>
  </svg>
)

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <title>WhatsApp</title>
        <path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.204-1.634a11.86 11.86 0 005.785 1.47h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
)

const YouTubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <title>YouTube</title>
        <path fill="currentColor" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
)


export default function SocialLinksWidget() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Share2 className="w-6 h-6 text-primary" />
          <CardTitle className="font-headline text-xl">Suivez-nous</CardTitle>
        </div>
        <CardDescription>Restez connecté avec nous sur les réseaux sociaux.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-around">
            <Button variant="outline" size="icon" asChild>
                <a href="https://www.tiktok.com/@khombolevibes" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                    <TikTokIcon className="w-5 h-5" />
                </a>
            </Button>
            <Button variant="outline" size="icon" asChild>
                <a href="https://www.facebook.com/khaoussou.thiam" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                    <FacebookIcon className="w-5 h-5" />
                </a>
            </Button>
            <Button variant="outline" size="icon" asChild>
                <a href="https://wa.me/221776431760" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                    <WhatsAppIcon className="w-5 h-5" />
                </a>
            </Button>
            <Button variant="outline" size="icon" asChild>
                <a href="https://www.youtube.com/channel/UChiSKtKPaI0-aDUMli02e0w" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                    <YouTubeIcon className="w-5 h-5" />
                </a>
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
