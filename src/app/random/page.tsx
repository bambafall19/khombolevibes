
// src/app/random/page.tsx
import { getArticles } from '@/lib/data';
import { redirect } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default async function RandomArticlePage() {
  const articles = await getArticles();
  
  if (articles.length === 0) {
    // Handle case with no articles, redirect to home
    redirect('/');
  }
  
  const randomIndex = Math.floor(Math.random() * articles.length);
  const randomArticle = articles[randomIndex];
  
  if (randomArticle?.slug) {
    redirect(`/articles/${randomArticle.slug}`);
  } else {
    // Fallback if something goes wrong
    redirect('/');
  }
}
