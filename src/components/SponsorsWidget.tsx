// src/components/SponsorsWidget.tsx
'use client'

import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Handshake } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import Autoplay from "embla-carousel-autoplay"
import type { Sponsor } from '@/types';
import { Skeleton } from './ui/skeleton';
import Link from 'next/link';

export default function SponsorsWidget({ sponsors, loading }: { sponsors: Sponsor[], loading: boolean }) {
  if (loading) {
    return <Skeleton className="h-48 w-full" />
  }

  const renderSponsor = (sponsor: Sponsor) => (
    <div className="relative h-20 w-full">
      <Image
        src={sponsor.logoUrl}
        alt={sponsor.name}
        fill
        sizes="50vw"
        className="object-contain"
        title={sponsor.name}
      />
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Handshake className="w-6 h-6 text-primary" />
          <CardTitle className="font-headline text-xl">Nos Partenaires</CardTitle>
        </div>
        <CardDescription>Ils soutiennent l'information locale.</CardDescription>
      </CardHeader>
      <CardContent>
        {sponsors && sponsors.length > 0 ? (
          <Carousel
            opts={{
              align: "start",
              loop: true,
              slidesToScroll: 1,
            }}
            plugins={[
              Autoplay({
                delay: 2000,
                stopOnInteraction: false,
              }),
            ]}
            className="w-full"
          >
            <CarouselContent className="-ml-2">
              {sponsors.map((sponsor) => (
                <CarouselItem key={sponsor.id} className="basis-1/2 pl-2">
                    {sponsor.websiteUrl ? (
                         <Link href={sponsor.websiteUrl} target="_blank" rel="noopener noreferrer" aria-label={`Visiter le site de ${sponsor.name}`}>
                            {renderSponsor(sponsor)}
                        </Link>
                    ) : (
                        renderSponsor(sponsor)
                    )}
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Aucun sponsor publié. Allez dans l'admin pour en ajouter et les publier.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
