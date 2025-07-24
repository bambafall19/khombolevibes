import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, BarChart2, Users, Target } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Publicité',
  description: 'Annoncez sur KhomboleVibes et touchez une audience locale engagée.',
};

const benefits = [
  {
    icon: Target,
    title: 'Audience Ciblée',
    description: 'Atteignez directement les habitants de Khombole et de ses environs, une audience engagée et intéressée par la vie locale.',
  },
  {
    icon: BarChart2,
    title: 'Visibilité Accrue',
    description: 'Associez votre marque à une source d\'information crédible et respectée, et augmentez votre notoriété locale.',
  },
  {
    icon: Users,
    title: 'Soutien à la Communauté',
    description: 'En annonçant chez nous, vous soutenez un média local indépendant et contribuez à la vitalité de l\'information à Khombole.',
  },
];

export default function AdvertisingPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 fade-in">
      <header className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">Faites votre Publicité sur KhomboleVibes</h1>
        <p className="mt-4 text-lg max-w-3xl mx-auto text-muted-foreground">
          Connectez-vous avec la communauté de Khombole. Annoncez avec nous pour toucher une audience locale et engagée.
        </p>
      </header>

      <section className="mb-16">
        <h2 className="font-headline text-3xl font-bold text-center mb-8">Pourquoi nous choisir ?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <Card key={index} className="text-center">
              <CardHeader>
                <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit">
                  <benefit.icon className="w-8 h-8" />
                </div>
                <CardTitle className="font-headline mt-4">{benefit.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-card p-8 md:p-12 rounded-lg shadow-md">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="font-headline text-3xl font-bold mb-4">Nos Offres Publicitaires</h2>
            <p className="text-muted-foreground mb-6">
              Nous proposons une gamme de solutions publicitaires flexibles pour répondre à vos besoins et à votre budget.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <span><strong>Bannières Publicitaires :</strong> Emplacements stratégiques sur notre site pour une visibilité maximale.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <span><strong>Articles Sponsorisés :</strong> Contenu éditorial de qualité pour présenter votre entreprise, vos produits ou vos services.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <span><strong>Partenariats sur les Réseaux Sociaux :</strong> Campagnes ciblées sur nos plateformes sociales pour engager notre communauté.</span>
              </li>
            </ul>
          </div>
          <div className="bg-primary/10 p-8 rounded-lg text-center">
            <h3 className="font-headline text-2xl font-bold">Prêt à commencer ?</h3>
            <p className="text-muted-foreground my-4">Contactez notre équipe pour discuter de vos objectifs et recevoir notre kit média complet.</p>
            <Button asChild size="lg">
              <Link href="/contact">
                Nous Contacter
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
