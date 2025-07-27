// src/components/HomePageClient.tsx
'use client';

import { useState, useMemo, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import type { Article, NavetanePoule, NavetaneStats, Sponsor, NavetanePublicView } from '@/types';
import ArticleCard from './ArticleCard';
import { Star } from 'lucide-react';
import Logo from './Logo';
import NavetanePreviewCard from './NavetanePreviewCard';
import MatchResultCard from './MatchResultCard';
import SponsorsWidget from './SponsorsWidget';
import PublicityCard from './PublicityCard';
import SocialLinksWidget from './SocialLinksWidget';
import { Button } from './ui/button';

type HomePageClientProps = {
  articles: Article[];
  navetaneData: NavetanePublicView;
  statsData: NavetaneStats | null;
  sponsors: Sponsor[];
};

function ArticleGridSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-4">
                    <Skeleton className="h-56 w-full" />
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-10 w-full" />
                </div>
            ))}
        </div>
    );
}

export default function HomePageClient({ articles, navetaneData, statsData, sponsors }: HomePageClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/recherche?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const featuredArticles = articles.filter(a => a.isFeatured);
  const regularArticles = articles.filter(a => !a.isFeatured);

  const pouleToPreview = useMemo(() => {
    const poules = navetaneData?.poules || [];
    return poules.find(p => p.name === 'Poule A') || poules[0];
  }, [navetaneData]);

  const loading = !articles; // Simple check if initial data is present

  return (
     <div className="bg-card p-4 sm:p-8 lg:p-12 h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12">
        <div className="flex-1 min-w-0">
             <header className="mb-12">
                 <div className="flex flex-col sm:flex-row items-center justify-center text-center sm:text-left gap-6">
                    <Logo className="w-48 h-auto" />
                    <div>
                        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">
                            Bienvenue sur KhomboleVibes
                        </h1>
                        <p className="mt-2 text-lg text-muted-foreground">
                            Votre fenêtre sur l'actualité, la culture et la vie de Khombole.
                        </p>
                    </div>
                </div>
                <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xl mx-auto mt-8">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                    <Input 
                    placeholder="Rechercher des articles..." 
                    className="pl-12 h-12 text-base rounded-full" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full h-9">Rechercher</Button>
                </form>
            </header>

            <Separator className="my-12" />
            
            {loading ? (
                <div className="space-y-12">
                    <ArticleGridSkeleton />
                    <ArticleGridSkeleton />
                </div>
            ) : (
                <>
                    {featuredArticles.length > 0 && (
                        <section aria-labelledby="featured-articles-title" className="mb-12">
                            <h2 id="featured-articles-title" className="flex items-center font-headline text-2xl font-bold mb-6">
                                <Star className="w-6 h-6 mr-3 text-primary" />
                                Articles phares
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8">
                            {featuredArticles.map((article, index) => (
                                <ArticleCard key={article.id} article={article} isPriority={index === 0} />
                            ))}
                            </div>
                        </section>
                    )}

                    <section aria-labelledby="latest-articles-title">
                        <h2 id="latest-articles-title" className="font-headline text-2xl font-bold mb-6">
                            Derniers articles
                        </h2>
                        {regularArticles.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                                {regularArticles.map((article) => (
                                    <ArticleCard key={article.id} article={article} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <p className="text-xl text-muted-foreground">Aucun article trouvé.</p>
                            </div>
                        )}
                    </section>
                </>
            )}
        </div>
        <aside className="w-full lg:w-80 xl:w-96 flex-shrink-0 lg:sticky top-8 h-fit space-y-8">
            <SocialLinksWidget />
            <PublicityCard />
            {loading ? (
                <>
                    <Skeleton className="h-96 w-full" />
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-64 w-full" />
                </>
            ) : (
                <>
                    {pouleToPreview && <NavetanePreviewCard poule={pouleToPreview} />}
                    {statsData && (
                        <>
                             <MatchResultCard 
                                title="Derniers Résultats"
                                matches={statsData.lastResults || []}
                            />
                            <MatchResultCard 
                                title="Matchs à Venir"
                                matches={statsData.upcomingMatches || []}
                                isUpcoming
                            />
                        </>
                    )}
                    <SponsorsWidget sponsors={sponsors} loading={loading} />
                </>
            )}
        </aside>
      </div>
    </div>
  );
}
