// src/app/sitemap.ts
import { MetadataRoute } from 'next';
import { getArticles, getCategories } from '@/lib/data';

const BASE_URL = 'https://khombolevibes.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticRoutes = [
    '',
    '/navetane',
    '/medias',
    '/portraits',
    '/statistiques',
    '/publicite',
    '/a-propos',
    '/contact',
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date().toISOString(),
  }));

  // Dynamic pages: Categories
  const categories = await getCategories();
  const categoryRoutes = categories
    .filter(c => c.slug !== 'accueil')
    .map((category) => ({
      url: `${BASE_URL}/${category.slug}`,
      lastModified: new Date().toISOString(),
    }));

  // Dynamic pages: Articles
  const articles = await getArticles();
  const articleRoutes = articles.map((article) => ({
    url: `${BASE_URL}/articles/${article.slug}`,
    lastModified: article.publishedAt,
  }));

  return [...staticRoutes, ...categoryRoutes, ...articleRoutes];
}
