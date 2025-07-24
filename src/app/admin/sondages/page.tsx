// src/app/admin/sondages/page.tsx
'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, PlusCircle, Pencil, Trash2, Vote, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getPolls, addPoll, updatePoll, deletePoll, getArticles } from '@/lib/data';
import type { Poll, Article, PollOption } from '@/types';

// Schema for validation
const pollOptionSchema = z.object({
  text: z.string().min(1, "Le texte de l'option est requis."),
});

const pollSchema = z.object({
  question: z.string().min(5, 'La question doit contenir au moins 5 caractères.'),
  articleId: z.string().min(1, "Veuillez lier ce sondage à un article."),
  options: z.array(pollOptionSchema).min(2, 'Le sondage doit avoir au moins 2 options.'),
});
type PollFormData = z.infer<typeof pollSchema>;

function PollForm({
  poll,
  articles,
  onSave,
  onOpenChange,
  isOpen,
  children
}: {
  poll?: Poll | null;
  articles: Article[];
  onSave: () => void;
  onOpenChange: (open: boolean) => void;
  isOpen: boolean;
  children: ReactNode;
}) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<PollFormData>({
    resolver: zodResolver(pollSchema),
    defaultValues: {
      question: '',
      articleId: '',
      options: [{ text: '' }, { text: '' }],
    },
  });
  
  const { register, control, handleSubmit, reset, formState: { errors } } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "options",
  });

  useEffect(() => {
    if (isOpen) {
      if (poll) {
        reset({
          question: poll.question,
          articleId: poll.articleId,
          options: poll.options.map(opt => ({ text: opt.text })),
        });
      } else {
        reset({ question: '', articleId: '', options: [{ text: '' }, { text: '' }] });
      }
    }
  }, [isOpen, poll, reset]);

  async function onSubmit(values: PollFormData) {
    setIsSubmitting(true);
    try {
      if (poll) {
        await updatePoll(poll.id, values);
        toast({ title: 'Sondage modifié' });
      } else {
        await addPoll(values);
        toast({ title: 'Sondage ajouté' });
      }
      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save poll:', error);
      toast({ variant: 'destructive', title: 'Erreur', description: 'Une erreur est survenue.' });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{poll ? 'Modifier le sondage' : 'Ajouter un sondage'}</DialogTitle>
          <DialogDescription>
            {poll ? 'Modifiez les détails du sondage.' : 'Créez un nouveau sondage et liez-le à un article.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="question">Question du sondage</Label>
            <Input id="question" {...register('question')} />
            {errors.question && <p className="text-destructive text-sm">{errors.question.message}</p>}
          </div>
          <div>
            <Label htmlFor="articleId">Article lié</Label>
            <Controller
              name="articleId"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un article" />
                  </SelectTrigger>
                  <SelectContent>
                    {articles.map((article) => (
                      <SelectItem key={article.id} value={article.id}>
                        {article.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.articleId && <p className="text-destructive text-sm">{errors.articleId.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Options de réponse</Label>
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <Input {...register(`options.${index}.text`)} placeholder={`Option ${index + 1}`} />
                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length <= 2}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {errors.options && <p className="text-destructive text-sm">{errors.options.message}</p>}
            <Button type="button" variant="outline" size="sm" onClick={() => append({ text: '' })}>
              <PlusCircle className="mr-2 h-4 w-4" /> Ajouter une option
            </Button>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sauvegarder
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function ManagePollsPage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [fetchedPolls, fetchedArticles] = await Promise.all([
        getPolls(),
        getArticles(),
      ]);
      setPolls(fetchedPolls);
      setArticles(fetchedArticles.sort((a,b) => b.publishedAt.localeCompare(a.publishedAt)));
      setError(null);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Impossible de charger les données.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddClick = () => {
    setSelectedPoll(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (poll: Poll) => {
    setSelectedPoll(poll);
    setIsFormOpen(true);
  };

  const handleDelete = async (poll: Poll) => {
    try {
      await deletePoll(poll.id);
      toast({ title: 'Sondage supprimé' });
      fetchData();
    } catch (error) {
      console.error("Failed to delete poll:", error);
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de supprimer le sondage.' });
    }
  };

  const getArticleTitle = (articleId: string) => {
    return articles.find(a => a.id === articleId)?.title || 'Article introuvable';
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Button variant="outline" asChild className="mb-6">
        <Link href="/admin"><ArrowLeft className="mr-2 h-4 w-4" />Retour au tableau de bord</Link>
      </Button>
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-headline text-4xl font-bold text-primary">Gérer les Sondages</h1>
          <p className="mt-2 text-muted-foreground">Ajoutez, modifiez ou supprimez les sondages.</p>
        </div>
        <PollForm onSave={fetchData} onOpenChange={setIsFormOpen} isOpen={isFormOpen && !selectedPoll} articles={articles}>
          <Button onClick={handleAddClick}>
            <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un sondage
          </Button>
        </PollForm>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Liste des Sondages</CardTitle>
          <CardDescription>Voici tous les sondages actifs sur le site.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="ml-4 text-muted-foreground">Chargement des sondages...</p>
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
                    <TableHead>Question</TableHead>
                    <TableHead>Article Lié</TableHead>
                    <TableHead className="text-center">Votes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {polls.map((poll) => (
                    <TableRow key={poll.id}>
                      <TableCell className="font-medium">{poll.question}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{getArticleTitle(poll.articleId)}</Badge>
                      </TableCell>
                      <TableCell className="text-center">{poll.totalVotes}</TableCell>
                      <TableCell className="text-right">
                        <PollForm
                          onSave={fetchData}
                          onOpenChange={(open) => { if (!open) setSelectedPoll(null); setIsFormOpen(open); }}
                          isOpen={isFormOpen && selectedPoll?.id === poll.id}
                          poll={poll}
                          articles={articles}
                        >
                          <Button variant="ghost" size="icon" onClick={() => handleEditClick(poll)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </PollForm>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                              <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(poll)}>Supprimer</AlertDialogAction>
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
