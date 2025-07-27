
import Image from 'next/image';
import { getPublicMedia } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { ImageIcon } from 'lucide-react';
import type { Metadata } from 'next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

export const metadata: Metadata = {
  title: 'Médias',
  description: 'Explorez Khombole à travers notre galerie de photos et vidéos.',
};

export default async function MediaPage() {
  const mediaItems = await getPublicMedia();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 fade-in">
      <header className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">Galerie Média</h1>
        <p className="mt-4 text-lg max-w-2xl mx-auto text-muted-foreground">
          Plongez au cœur de Khombole avec notre collection de photos.
        </p>
      </header>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {mediaItems.map((item) => (
          <Dialog key={item.id}>
            <DialogTrigger asChild>
              <Card className="overflow-hidden group shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer">
                <CardContent className="p-0">
                  <div className="relative aspect-video">
                    <Image
                      src={item.thumbnailUrl}
                      alt={item.title}
                      data-ai-hint={item.thumbnailHint}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <ImageIcon className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  <div className="p-4 bg-card">
                    <h3 className="font-semibold truncate">{item.title}</h3>
                    <p className="text-sm text-muted-foreground capitalize flex items-center gap-2 mt-1">
                      <ImageIcon className="w-4 h-4" />
                      {item.imageUrls.length} Photo(s)
                    </p>
                  </div>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="max-w-4xl p-0 border-0">
                <DialogHeader className="sr-only">
                    <DialogTitle>{item.title}</DialogTitle>
                </DialogHeader>
               <Carousel className="w-full" opts={{ loop: item.imageUrls.length > 1 }}>
                <CarouselContent>
                  {item.imageUrls.map((url, index) => (
                    <CarouselItem key={index}>
                      <div className="relative aspect-video">
                         <Image
                            src={url}
                            alt={`${item.title} - Image ${index + 1}`}
                            fill
                            sizes="100vw"
                            className="object-contain"
                          />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {item.imageUrls.length > 1 && (
                  <>
                    <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10" />
                    <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10" />
                  </>
                )}
              </Carousel>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  );
}
