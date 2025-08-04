import { getArticles, getCategoryBySlug, getCategories } from '@/lib/data';
import ArticleCard from '@/components/ArticleCard';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const revalidate = 60; // Revalidate every 60 seconds

type CategoryPageProps = {
  params: {
    category: string;
  };
};

export async function generateStaticParams() {
  const categories = await getCategories();
  // We exclude 'accueil' as it's the homepage, not a category page.
  return categories.filter(c => c.slug !== 'accueil').map((category) => ({
    category: category.slug,
  }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const categorySlug = params.category;
  const category = await getCategoryBySlug(categorySlug);
  if (!category) {
    return {
      title: 'Catégorie non trouvée',
    }
  }
  return {
    title: category.name,
    description: `Dernières actualités dans la catégorie ${category.name} sur KhomboleVibes.`,
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const categorySlug = params.category;
  const category = await getCategoryBySlug(categorySlug);
  
  if (!category) {
    notFound();
  }
  
  let articles = await getArticles(categorySlug);

  // Client-side sort as a fallback for missing Firestore index
  articles = articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 fade-in">
      <header className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">{category.name}</h1>
        <p className="mt-4 text-lg max-w-2xl mx-auto text-muted-foreground">
          Explorez les dernières actualités et reportages de la catégorie.
        </p>
      </header>
      
      {articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-xl text-muted-foreground">Aucun article trouvé dans cette catégorie pour le moment.</p>
        </div>
      )}
    </div>
  );
}
