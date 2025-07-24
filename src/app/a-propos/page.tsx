import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Target, Eye } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'À propos de nous',
  description: 'Découvrez la mission, la vision et l\'équipe derrière KhomboleVibes, votre source d\'information locale.',
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 fade-in">
      <header className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">À propos de KhomboleVibes</h1>
        <p className="mt-4 text-lg max-w-3xl mx-auto text-muted-foreground">
          Votre fenêtre sur l'actualité, la culture et la vie de Khombole.
        </p>
      </header>

      <div className="grid md:grid-cols-3 gap-8 text-center mb-16">
        <Card>
          <CardHeader>
            <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit">
              <Target className="w-8 h-8" />
            </div>
            <CardTitle className="font-headline mt-4">Notre Mission</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Fournir une information locale fiable, pertinente et accessible à tous les habitants de Khombole, pour renforcer le lien social et la participation citoyenne.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit">
              <Eye className="w-8 h-8" />
            </div>
            <CardTitle className="font-headline mt-4">Notre Vision</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Devenir la plateforme de référence qui reflète la vitalité et la diversité de Khombole, en célébrant ses réussites et en stimulant le dialogue sur ses défis.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit">
              <Users className="w-8 h-8" />
            </div>
            <CardTitle className="font-headline mt-4">Notre Équipe</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Une équipe de développeurs et de passionnés, unis par l'amour de notre ville et l'envie de montrer ce qui s'y passe.</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-card p-8 rounded-lg shadow-md">
        <h2 className="font-headline text-3xl font-bold mb-6">Notre Histoire</h2>
        <div className="space-y-4 text-muted-foreground">
          <p>KhomboleVibes est né d'une passion commune : mettre en lumière notre ville, Khombole. Notre objectif est simple : promouvoir notre commune, ses talents, ses initiatives, et surtout, faire vibrer la communauté au rythme des compétitions de football Navétane qui nous sont si chères.</p>
          <p>Lancé en 2025, notre projet se veut être un média moderne, indépendant et participatif. Nous croyons que valoriser ce qui nous rassemble, comme le sport et la culture locale, est le meilleur moyen de renforcer notre communauté. Chaque article, chaque score, chaque portrait est une célébration de l'esprit de Khombole.</p>
          <p>Nous sommes fiers de nos racines et tournés vers l'avenir, en utilisant les nouvelles technologies pour vous offrir la meilleure couverture des événements qui animent notre ville. Merci de faire partie de cette aventure avec nous.</p>
        </div>
      </div>
    </div>
  );
}
