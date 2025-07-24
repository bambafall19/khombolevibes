
import { getArticles } from '@/lib/data';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, User } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Portraits',
  description: 'Découvrez les talents et les personnalités qui font la richesse de Khombole.',
};

export default async function PortraitsPage() {
  const portraitArticles = await getArticles('portraits');

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 fade-in">
      <header className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">Portraits de Khombole</h1>
        <p className="mt-4 text-lg max-w-2xl mx-auto text-muted-foreground">
          Les visages, les histoires et les talents qui façonnent notre communauté.
        </p>
      </header>
      
      {portraitArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {portraitArticles.map((article) => (
            <Link key={article.id} href={`/articles/${article.slug}`} className="group">
              <Card className="h-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
                <CardContent className="p-0 flex flex-col sm:flex-row">
                  <div className="relative w-full sm:w-1/3 h-48 sm:h-auto shrink-0">
                    <Image
                      src={article.imageUrl}
                      alt={article.title}
                      data-ai-hint={article.imageHint}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
                    />
                  </div>
                  <div className="p-6 flex flex-col justify-between">
                    <div>
                      <h3 className="font-headline text-2xl font-bold leading-tight group-hover:text-primary transition-colors">
                        {article.title}
                      </h3>
                      <p className="mt-3 text-muted-foreground line-clamp-3">{article.excerpt}</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-border/50">
                        <span className="font-semibold text-primary text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                          Découvrir le portrait <ArrowRight className="w-4 h-4" />
                        </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-xl text-muted-foreground">Aucun portrait publié pour le moment.</p>
        </div>
      )}
    </div>
  );
}
