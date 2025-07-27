// src/app/admin/articles/page.tsx
'use client';

import { useEffect, useState, type ReactNode, useMemo } from 'react';
import { getArticles, getCategories } from '@/lib/data';
import { addArticle, updateArticle, deleteArticle } from '@/lib/actions';
import type { Article, Category } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, PlusCircle, Trash2, Loader2, ArrowLeft, Star, Vote } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import Link from 'next/link';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

const articleSchema = z.object({
  title: z.string().min(5, { message: 'Le titre doit contenir au moins 5 caractères.' }),
  slug: z.string(), // slug is generated automatically
  content: z.string().min(20, { message: "Le contenu doit contenir au moins 20 caractères." }),
  author: z.string().min(2, { message: "Le nom de l'auteur est requis."}),
  imageUrl: z.string().url({ message: "Veuillez entrer une URL d'image valide." }),
  imageHint: z.string().optional(),
  imageUrl2: z.string().url({ message: "Veuillez entrer une URL d'image valide." }).optional().or(z.literal('')),
  imageHint2: z.string().optional(),
  categoryId: z.string({ required_error: 'Veuillez sélectionner une catégorie.' }),
  isFeatured: z.boolean().default(false).optional(),
});

type ArticleFormData = z.infer<typeof articleSchema>;

function ArticleForm({ article, categories, onSave, onOpenChange, isOpen, children }: { article?: Article | null, categories: Category[], onSave: () => void, onOpenChange: (open: boolean) => void, isOpen: boolean, children: ReactNode }) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const availableCategories = useMemo(() => categories.filter(c => c.slug !== 'accueil'), [categories]);

  const form = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
        title: '',
        slug: '',
        content: '',
        author: '',
        imageUrl: '',
        imageHint: '',
        imageUrl2: '',
        imageHint2: '',
        categoryId: '',
        isFeatured: false,
    }
  });
  
  const { register, handleSubmit, formState: { errors }, setValue, control, reset } = form;

  useEffect(() => {
    if (isOpen) {
        if (article) {
            reset({
                title: article?.title || '',
                slug: article?.slug || '',
                content: article?.content || '',
                author: article?.author || '',
                imageUrl: article?.imageUrl || '',
                imageHint: article?.imageHint || '',
                imageUrl2: article?.imageUrl2 || '',
                imageHint2: article?.imageHint2 || '',
                categoryId: article?.category.id || (availableCategories.length > 0 ? availableCategories[0].id : ''),
                isFeatured: article?.isFeatured || false,
            });
        } else {
             reset({
                title: '', slug: '', content: '', author: '', imageUrl: '', imageHint: '', imageUrl2: '', imageHint2: '',
                categoryId: availableCategories.length > 0 ? availableCategories[0].id : '',
                isFeatured: false,
            });
        }
    }
  }, [isOpen, article, reset, availableCategories]);
  
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setValue('title', title);
    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    setValue('slug', slug, { shouldValidate: true });
  }

  async function onSubmit(values: ArticleFormData) {
    setIsSubmitting(true);
    
    try {
      if (article) {
        await updateArticle(article.id, values);
        toast({ title: 'Article modifié', description: `L'article "${values.title}" a été mis à jour.` });
      } else {
        await addArticle(values);
        toast({ title: 'Article ajouté', description: `L'article "${values.title}" a été créé.` });
        reset(); 
      }
      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save article:", error);
      toast({ variant: 'destructive', title: 'Erreur', description: 'Une erreur est survenue lors de la sauvegarde.' });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { onOpenChange(open); if (!open) form.clearErrors(); }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{article ? 'Modifier l\'article' : 'Ajouter un article'}</DialogTitle>
          <DialogDescription>
            Remplissez les informations ci-dessous pour {article ? 'modifier' : 'créer'} un article.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4 max-h-[80vh] overflow-y-auto pr-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Titre</Label>
            <Input id="title" {...register('title')} onChange={handleTitleChange} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="categoryId">Catégorie</Label>
            <Controller
              control={control}
              name="categoryId"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.categoryId && <p className="text-sm text-destructive">{errors.categoryId.message}</p>}
          </div>
           <div className="grid gap-2">
            <Label htmlFor="imageUrl">URL de l'image principale</Label>
            <Input id="imageUrl" {...register('imageUrl')} placeholder="https://..." />
            {errors.imageUrl && <p className="text-sm text-destructive">{errors.imageUrl.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="imageUrl2">URL de la deuxième image (optionnel)</Label>
            <Input id="imageUrl2" {...register('imageUrl2')} placeholder="https://..." />
            {errors.imageUrl2 && <p className="text-sm text-destructive">{errors.imageUrl2.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="content">Contenu de l'article</Label>
            <Textarea id="content" {...register('content')} className="min-h-[200px]" />
            {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
                <Label htmlFor="author">Auteur</Label>
                <Input id="author" {...register('author')} />
                {errors.author && <p className="text-sm text-destructive">{errors.author.message}</p>}
            </div>
            <div className="grid gap-2">
                <Label htmlFor="imageHint">Indice pour l'image principale</Label>
                <Input id="imageHint" {...register('imageHint')} placeholder="ex: soccer match" />
                {errors.imageHint && <p className="text-sm text-destructive">{errors.imageHint.message}</p>}
            </div>
             <div className="grid gap-2">
                <Label htmlFor="imageHint2">Indice pour la deuxième image</Label>
                <Input id="imageHint2" {...register('imageHint2')} placeholder="ex: crowd cheering" />
                {errors.imageHint2 && <p className="text-sm text-destructive">{errors.imageHint2.message}</p>}
            </div>
          </div>
           <Controller
                control={control}
                name="isFeatured"
                render={({ field }) => (
                    <div className="flex items-center space-x-2 rounded-lg border p-4">
                        <Switch
                            id="isFeatured"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                        />
                        <Label htmlFor="isFeatured" className="flex-grow">Mettre l'article à la une</Label>
                    </div>
                )}
            />

           <DialogFooter className="sticky bottom-0 bg-background pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isSubmitting ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function ManageArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [fetchedArticles, fetchedCategories] = await Promise.all([getArticles(), getCategories()]);
      const sortedArticles = fetchedArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
      setArticles(sortedArticles);
      setCategories(fetchedCategories);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Impossible de charger les données. Vérifiez les permissions.");
      if (err instanceof Error) {
          console.error(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddClick = () => {
    setSelectedArticle(null);
    setIsFormOpen(true);
  }

  const handleEditClick = (article: Article) => {
    setSelectedArticle(article);
    setIsFormOpen(true);
  }

  const handleDelete = async (articleId: string) => {
    try {
      await deleteArticle(articleId);
      toast({ title: 'Article supprimé', description: 'L\'article a été supprimé avec succès.' });
      fetchData();
    } catch (error) {
      console.error("Failed to delete article:", error);
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de supprimer l\'article.' });
    }
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Button variant="outline" asChild className="mb-6">
        <Link href="/admin">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour au tableau de bord
        </Link>
      </Button>
      <header className="flex justify-between items-center mb-8">
        <div>
            <h1 className="font-headline text-4xl font-bold text-primary">Gérer les Articles</h1>
            <p className="mt-2 text-muted-foreground">
                Ajoutez, modifiez ou supprimez les articles de votre site.
            </p>
        </div>
        <ArticleForm onSave={fetchData} onOpenChange={setIsFormOpen} isOpen={isFormOpen && !selectedArticle} article={null} categories={categories}>
           <Button onClick={handleAddClick}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Ajouter un article
            </Button>
        </ArticleForm>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Articles</CardTitle>
          <CardDescription>
            Voici tous les articles actuellement publiés sur le site.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
             <div className="flex items-center justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary"/>
                <p className="ml-4 text-muted-foreground">Chargement des articles...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-destructive bg-destructive/10 rounded-md">
                <p className="font-bold">Erreur de chargement</p>
                <p className="text-sm">{error}</p>
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Date de publication</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {articles.map((article) => (
                    <TableRow key={article.id} className={cn(article.isFeatured && "bg-primary/10")}>
                      <TableCell className="font-medium flex items-center gap-2">
                        {article.isFeatured && <Star className="h-4 w-4 text-primary" />}
                        {article.pollId && <Vote className="h-4 w-4 text-muted-foreground" />}
                        {article.title}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{article.category.name}</Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(article.publishedAt), 'd MMMM yyyy', { locale: fr })}
                      </TableCell>
                      <TableCell className="text-right">
                        <ArticleForm onSave={fetchData} onOpenChange={(open) => {
                            if (!open) setSelectedArticle(null);
                            setIsFormOpen(open);
                        }} isOpen={isFormOpen && selectedArticle?.id === article.id} article={article} categories={categories}>
                            <Button variant="ghost" size="icon" onClick={() => handleEditClick(article)}>
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Modifier</span>
                            </Button>
                        </ArticleForm>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Supprimer</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette action est irréversible. L'article "{article.title}" et son sondage associé seront définitivement supprimés.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(article.id)}>Supprimer</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
