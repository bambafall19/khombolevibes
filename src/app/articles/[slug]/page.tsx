

import React from 'react';
import { getArticleBySlug, getArticles, getPollForArticle, getCommentsForArticle } from '@/lib/data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';
import { User, Calendar, ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import CommentsSection from '@/components/CommentsSection';
import { Separator } from '@/components/ui/separator';
import PublicityCard from '@/components/PublicityCard';
import PollWidget from '@/components/PollWidget';

type ArticlePageProps = {
  params: {
    slug: string;
  };
};

export async function generateStaticParams() {
  const articles = await getArticles();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params: { slug } }: ArticlePageProps): Promise<Metadata> {
  const article = await getArticleBySlug(slug);
  if (!article) {
     return {
      title: 'Article non trouvé',
    }
  }
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
        title: article.title,
        description: article.excerpt,
        images: [
            {
                url: article.imageUrl,
                width: 1200,
                height: 630,
                alt: article.title,
            },
        ],
    },
  }
}

const RelatedArticle = ({ article }: { article: Awaited<ReturnType<typeof getArticles>>[0] }) => {
    return (
        <Link href={`/articles/${article.slug}`} className="flex items-start gap-4 group py-4">
            <div className="relative w-24 h-24 rounded-lg overflow-hidden shrink-0">
                <Image
                    src={article.imageUrl}
                    alt={article.title}
                    data-ai-hint={article.imageHint}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
            </div>
            <div>
                <h4 className="font-semibold text-sm leading-tight group-hover:underline">{article.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{article.category.name}</p>
            </div>
        </Link>
    )
}

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

function getYouTubeEmbedUrl(url: string): string | null {
    if (!url) return null;
    let videoId = null;
    // Regular YouTube watch URL
    const urlMatch = url.match(/^https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/);
    if (urlMatch) {
        videoId = urlMatch[1];
    } else {
        // Shortened youtu.be URL
        const shortUrlMatch = url.match(/^https?:\/\/youtu\.be\/([a-zA-Z0-9_-]{11})/);
        if (shortUrlMatch) {
            videoId = shortUrlMatch[1];
        }
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const slug = params.slug;
  const article = await getArticleBySlug(slug);
  
  if (!article) {
    notFound();
  }
  
  const [poll, comments, allArticles] = await Promise.all([
    article.pollId ? getPollForArticle(article.id) : null,
    getCommentsForArticle(article.id),
    getArticles()
  ]);

  const relatedArticles = allArticles
    .filter(a => a.id !== article.id && a.category.id === article.category.id)
    .slice(0, 5);
    
  const embedUrl = article.videoUrl ? getYouTubeEmbedUrl(article.videoUrl) : null;

  const AsideContent = () => (
    <div className="space-y-8 lg:sticky top-8">
        <div>
          <h3 className="font-semibold mb-4">Suivez-nous</h3>
          <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" asChild>
                <a href="https://www.tiktok.com/@khombolevibes" target="_blank" rel="noopener noreferrer">
                    <TikTokIcon className="w-4 h-4" />
                    <span className="sr-only">TikTok</span>
                </a>
              </Button>
              <Button variant="outline" size="icon" asChild>
                <a href="https://www.facebook.com/khaoussou.thiam" target="_blank" rel="noopener noreferrer">
                    <FacebookIcon className="w-4 h-4" />
                    <span className="sr-only">Facebook</span>
                </a>
              </Button>
               <Button variant="outline" size="icon" asChild>
                <a href="https://wa.me/221776431760" target="_blank" rel="noopener noreferrer">
                    <WhatsAppIcon className="w-4 h-4" />
                    <span className="sr-only">WhatsApp</span>
                </a>
              </Button>
              <Button variant="outline" size="icon" asChild>
                <a href="https://www.youtube.com/channel/UChiSKtKPaI0-aDUMli02e0w" target="_blank" rel="noopener noreferrer">
                    <YouTubeIcon className="w-4 h-4" />
                    <span className="sr-only">YouTube</span>
                </a>
              </Button>
          </div>
        </div>

        <PublicityCard />
        
        <CommentsSection articleId={article.id} initialComments={comments} />

        {relatedArticles.length > 0 && (
            <div>
                <h3 className="font-semibold mb-4">Articles similaires</h3>
                <div className="space-y-0">
                    {relatedArticles.map((relatedArticle, index) => (
                       <React.Fragment key={relatedArticle.id}>
                       <RelatedArticle article={relatedArticle} />
                       {index < relatedArticles.length - 1 && <Separator />}
                      </React.Fragment>
                    ))}
                </div>
            </div>
        )}
    </div>
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-12 items-start">
            <div className="lg:col-span-2">
                <header className="mb-8">
                    <Button variant="ghost" asChild className="mb-6 pl-0">
                        <Link href="/">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Retour à l'accueil
                        </Link>
                    </Button>
                    <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight">
                    {article.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{article.author}</span>
                    </div>
                    <span className="hidden sm:inline">&middot;</span>
                    <div className="flex items-center gap-2">
                        <span>{article.category.name}</span>
                    </div>
                    <span className="hidden sm:inline">&middot;</span>
                    <div className="flex items-center gap-2">
                        <time dateTime={article.publishedAt}>
                        {format(new Date(article.publishedAt), "d MMMM yyyy", { locale: fr })}
                        </time>
                    </div>
                    </div>
                </header>

                 {embedUrl && (
                    <div className="w-full aspect-video rounded-xl overflow-hidden mb-8 shadow-lg">
                        <iframe
                            className="w-full h-full"
                            src={embedUrl}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                        ></iframe>
                    </div>
                )}

                <div className="w-full rounded-xl overflow-hidden mb-8 shadow-lg">
                    <Image
                    src={article.imageUrl}
                    alt={`Image for ${article.title}`}
                    data-ai-hint={article.imageHint}
                    width={1200}
                    height={675}
                    className="object-contain w-full h-auto"
                    priority
                    />
                </div>

                {article.imageUrl2 && (
                    <div className="w-full rounded-xl overflow-hidden my-8 shadow-lg">
                        <Image
                        src={article.imageUrl2}
                        alt={`Image secondaire pour ${article.title}`}
                        data-ai-hint={article.imageHint2}
                        width={1200}
                        height={675}
                        className="object-contain w-full h-auto"
                        />
                    </div>
                )}
                
                {article.imageUrl3 && (
                    <div className="w-full rounded-xl overflow-hidden my-8 shadow-lg">
                        <Image
                        src={article.imageUrl3}
                        alt={`Image tertiaire pour ${article.title}`}
                        data-ai-hint={article.imageHint3}
                        width={1200}
                        height={675}
                        className="object-contain w-full h-auto"
                        />
                    </div>
                )}


                <article className="prose prose-lg max-w-none text-foreground prose-a:text-primary hover:prose-a:text-primary/80 prose-strong:font-semibold">
                    <div className="whitespace-pre-wrap">{article.content}</div>
                </article>

                {poll && (
                    <div className="mt-12">
                    <PollWidget initialPoll={poll} />
                    </div>
                )}
            </div>

            <aside className="lg:sticky top-8 space-y-8">
               <AsideContent />
            </aside>
        </div>
    </div>
  );
}
