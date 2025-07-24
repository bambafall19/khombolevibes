// src/app/recherche/page.tsx
import { searchArticles } from '@/lib/data';
import ArticleCard from '@/components/ArticleCard';
import type { Metadata } from 'next';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

type SearchPageProps = {
  searchParams: {
    q?: string;
  };
};

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const query = searchParams.q || '';
  return {
    title: query ? `Résultats pour "${query}"` : 'Recherche',
    description: `Rechercher des articles sur KhomboleVibes.`,
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || '';
  const articles = query ? await searchArticles(query) : [];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 fade-in">
       <Button variant="outline" asChild className="mb-6">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à l'accueil
        </Link>
      </Button>

      <header className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">
          {query ? `Résultats pour "${query}"` : 'Rechercher un article'}
        </h1>
        <p className="mt-4 text-lg max-w-2xl mx-auto text-muted-foreground">
          {query ? `${articles.length} article(s) trouvé(s).` : 'Utilisez la barre de recherche sur la page d\'accueil.'}
        </p>
      </header>

      {query && articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : query ? (
        <div className="text-center py-16">
          <Search className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-xl text-muted-foreground">Aucun article ne correspond à votre recherche.</p>
          <p className="text-sm text-muted-foreground mt-2">Essayez avec d'autres mots-clés.</p>
        </div>
      ) : null}
    </div>
  );
}
