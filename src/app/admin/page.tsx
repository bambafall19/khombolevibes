// src/app/admin/page.tsx
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Newspaper, LayoutGrid, Loader2, ArrowRight, Pencil, Dribbble, Users, ImageIcon, BarChart3, Handshake, GitBranch, Vote } from 'lucide-react';
import Link from 'next/link';
import { getArticles, getCategories, getAdminNavetanePoules, getTeams, getAdminMedia, getSponsors, getPolls } from '@/lib/data';
import type { Article, Category, NavetanePoule, Team, Media, Sponsor, Poll } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [navetanePoules, setNavetanePoules] = useState<NavetanePoule[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [media, setMedia] = useState<Media[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      async function fetchData() {
        setDataLoading(true);
        try {
          const [fetchedArticles, fetchedCategories, fetchedNavetanePoules, fetchedTeams, fetchedMedia, fetchedSponsors, fetchedPolls] = await Promise.all([
            getArticles(),
            getCategories(),
            getAdminNavetanePoules(),
            getTeams(),
            getAdminMedia(true),
            getSponsors(),
            getPolls(),
          ]);
          setArticles(fetchedArticles);
          setCategories(fetchedCategories);
          setNavetanePoules(fetchedNavetanePoules);
          setTeams(fetchedTeams);
          setMedia(fetchedMedia);
          setSponsors(fetchedSponsors);
          setPolls(fetchedPolls);
        } catch (error) {
          console.error("Failed to fetch dashboard data:", error);
        } finally {
          setDataLoading(false);
        }
      }
      fetchData();
    }
  }, [user]);

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const recentArticles = articles.slice(0, 5);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 fade-in">
      <header className="flex justify-between items-center mb-8">
        <h1 className="font-headline text-4xl font-bold text-primary">Tableau de bord</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
        <Card className="hover:bg-muted/50 transition-colors h-full flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Newspaper className="h-5 w-5 text-muted-foreground" />
              <span>Gérer les Articles</span>
            </CardTitle>
            <CardDescription>Ajouter, modifier ou supprimer des articles.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="text-3xl font-bold">{dataLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : `${articles.length} articles`}</div>
          </CardContent>
          <CardContent>
             <Button asChild>
                <Link href="/admin/articles">
                  Voir tout <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="hover:bg-muted/50 transition-colors h-full flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutGrid className="h-5 w-5 text-muted-foreground" />
              <span>Gérer les Catégories</span>
            </CardTitle>
             <CardDescription>Modifier les menus de navigation du site.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
             <div className="text-3xl font-bold">{dataLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : `${categories.length} catégories`}</div>
          </CardContent>
          <CardContent>
            <Button asChild>
                <Link href="/admin/categories">
                    Voir tout <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
          </CardContent>
        </Card>
         <Card className="hover:bg-muted/50 transition-colors h-full flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Vote className="h-5 w-5 text-muted-foreground" />
                    <span>Gérer les Sondages</span>
                </CardTitle>
                <CardDescription>Ajouter un sondage interactif à un article.</CardDescription>
            </CardHeader>
             <CardContent className="flex-grow">
                 <div className="text-3xl font-bold">{dataLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : `${polls.length} sondages`}</div>
            </CardContent>
            <CardContent>
                <Button asChild>
                    <Link href="/admin/sondages">
                        Gérer <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </CardContent>
        </Card>
        <Card className="hover:bg-muted/50 transition-colors h-full flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
              <span>Gérer les Médias</span>
            </CardTitle>
             <CardDescription>Gérer les photos et vidéos de la galerie.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
             <div className="text-3xl font-bold">{dataLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : `${media.length} médias`}</div>
          </CardContent>
          <CardContent>
            <Button asChild>
                <Link href="/admin/medias">
                    Gérer <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="hover:bg-muted/50 transition-colors h-full flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dribbble className="h-5 w-5 text-muted-foreground" />
              <span>Gérer les Navétanes</span>
            </CardTitle>
             <CardDescription>Gérer les poules, équipes et matchs de la saison.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
             <div className="text-3xl font-bold">{dataLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : `${navetanePoules.length} poules`}</div>
          </CardContent>
          <CardContent>
            <Button asChild>
                <Link href="/admin/navetane">
                    Gérer <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="hover:bg-muted/50 transition-colors h-full flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <span>Gérer les Équipes</span>
                </CardTitle>
                <CardDescription>Ajouter, modifier ou supprimer des équipes.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
                <div className="text-3xl font-bold">{dataLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : `${teams.length} équipes`}</div>
            </CardContent>
            <CardContent>
                <Button asChild>
                    <Link href="/admin/teams">
                        Gérer <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </CardContent>
        </Card>
        <Card className="hover:bg-muted/50 transition-colors h-full flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-muted-foreground" />
                    <span>Gérer les Statistiques</span>
                </CardTitle>
                <CardDescription>Gérer le palmarès et les classements Navétane.</CardDescription>
            </CardHeader>
             <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground">Modifier les classements du Ballon d'Or, Golden Boy, et plus.</p>
            </CardContent>
            <CardContent>
                <Button asChild>
                    <Link href="/admin/statistiques">
                        Gérer <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </CardContent>
        </Card>
        <Card className="hover:bg-muted/50 transition-colors h-full flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <GitBranch className="h-5 w-5 text-muted-foreground" />
                    <span>Phases Finales</span>
                </CardTitle>
                <CardDescription>Gérer les tableaux finaux (quarts, demis, finale).</CardDescription>
            </CardHeader>
             <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground">Définir les matchs et scores des phases finales.</p>
            </CardContent>
            <CardContent>
                <Button asChild>
                    <Link href="/admin/phases-finales">
                        Gérer <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </CardContent>
        </Card>
        <Card className="hover:bg-muted/50 transition-colors h-full flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Handshake className="h-5 w-5 text-muted-foreground" />
                    <span>Gérer les Sponsors</span>
                </CardTitle>
                <CardDescription>Gérer les partenaires et leurs logos.</CardDescription>
            </CardHeader>
             <CardContent className="flex-grow">
                 <div className="text-3xl font-bold">{dataLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : `${sponsors.length} sponsors`}</div>
            </CardContent>
            <CardContent>
                <Button asChild>
                    <Link href="/admin/sponsors">
                        Gérer <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Articles Récents</CardTitle>
          <CardDescription>Les 5 derniers articles publiés sur le site.</CardDescription>
        </CardHeader>
        <CardContent>
          {dataLoading ? (
             <div className="flex items-center justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary"/>
                <p className="ml-4 text-muted-foreground">Chargement des articles...</p>
            </div>
          ) : recentArticles.length > 0 ? (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Titre</TableHead>
                        <TableHead>Catégorie</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {recentArticles.map((article) => (
                        <TableRow key={article.id}>
                            <TableCell className="font-medium">{article.title}</TableCell>
                            <TableCell><Badge variant="outline">{article.category.name}</Badge></TableCell>
                            <TableCell>{format(new Date(article.publishedAt), 'd MMM yyyy', { locale: fr })}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" asChild>
                                    <Link href={`/admin/articles`}>
                                        <Pencil className="h-4 w-4" />
                                        <span className="sr-only">Modifier</span>
                                    </Link>
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-8">Aucun article trouvé.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
