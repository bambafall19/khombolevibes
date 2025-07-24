// src/components/PublicityCard.tsx
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Megaphone, ArrowRight } from 'lucide-react';

export default function PublicityCard() {
  return (
    <Card className="bg-accent text-accent-foreground border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-3">
            <Megaphone className="w-6 h-6 text-primary" />
            <CardTitle className="font-headline text-xl text-primary">Publicité</CardTitle>
        </div>
        <CardDescription className="text-accent-foreground/80">
            Augmentez votre visibilité auprès de la communauté de Khombole.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm">
            Associez votre marque à une source d'information locale de confiance et touchez des milliers de lecteurs.
        </p>
        <Button asChild className="w-full">
            <a href="mailto:khombolevibes@gmail.com">
                Annoncer avec nous
                <ArrowRight className="ml-2 h-4 w-4" />
            </a>
        </Button>
      </CardContent>
    </Card>
  );
}
