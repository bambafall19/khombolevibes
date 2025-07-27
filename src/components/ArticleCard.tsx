
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Article } from '@/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';

type ArticleCardProps = {
  article: Article;
  isPriority?: boolean;
};

const ArticleCard = ({ article, isPriority = false }: ArticleCardProps) => {
  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out group fade-in">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full overflow-hidden">
          <Link href={`/articles/${article.slug}`}>
            <Image
              src={article.imageUrl}
              alt={`Image for ${article.title}`}
              data-ai-hint={article.imageHint}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
              priority={isPriority}
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-4">
        <div className="flex justify-between items-center mb-2">
            <Badge variant="secondary">{article.category.name}</Badge>
            <time dateTime={article.publishedAt} className="text-xs text-muted-foreground">
                {format(new Date(article.publishedAt), 'd MMM yyyy', { locale: fr })}
            </time>
        </div>
        <Link href={`/articles/${article.slug}`}>
          <h3 className="font-headline text-lg font-bold leading-snug line-clamp-3 hover:text-primary transition-colors">
            {article.title}
          </h3>
        </Link>
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{article.excerpt}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Link href={`/articles/${article.slug}`} className="font-semibold text-primary text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
          Lire la suite <ArrowRight className="w-4 h-4" />
        </Link>
      </CardFooter>
    </Card>
  );
};

export default ArticleCard;
