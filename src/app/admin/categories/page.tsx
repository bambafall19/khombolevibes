// src/app/admin/categories/page.tsx
'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { getCategories, addCategory, updateCategory, deleteCategory } from '@/lib/data';
import type { Category } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, PlusCircle, Trash2, Loader2, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import Link from 'next/link';


const categorySchema = z.object({
  name: z.string().min(2, { message: 'Le nom doit contenir au moins 2 caractères.' }),
  slug: z.string().min(2, { message: 'Le slug doit contenir au moins 2 caractères.' }).regex(/^[a-z0-9-]+$/, { message: 'Le slug ne peut contenir que des lettres minuscules, des chiffres et des tirets.' }),
  order: z.coerce.number().int().min(0, { message: 'L\'ordre doit être un nombre positif.' }),
});

type CategoryFormData = z.infer<typeof categorySchema>;

function CategoryForm({ category, onSave, onOpenChange, children }: { category?: Category | null, onSave: () => void, onOpenChange: (open: boolean) => void, children: ReactNode }) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || '',
      slug: category?.slug || '',
      order: category?.order || 0,
    }
  });
  
  const { register, handleSubmit, formState: { errors }, setValue } = form;

  useEffect(() => {
    form.reset({
      name: category?.name || '',
      slug: category?.slug || '',
      order: category?.order || 0,
    });
  }, [category, form]);
  
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setValue('name', name);
    if (!form.formState.dirtyFields.slug) {
      const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      setValue('slug', slug, { shouldValidate: true });
    }
  }

  async function onSubmit(values: CategoryFormData) {
    setIsSubmitting(true);
    try {
      if (category) {
        await updateCategory(category.id, values);
        toast({ title: 'Catégorie modifiée', description: `La catégorie "${values.name}" a été mise à jour.` });
      } else {
        await addCategory(values);
        toast({ title: 'Catégorie ajoutée', description: `La catégorie "${values.name}" a été créée.` });
      }
      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save category:", error);
      toast({ variant: 'destructive', title: 'Erreur', description: 'Une erreur est survenue lors de la sauvegarde.' });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{category ? 'Modifier la catégorie' : 'Ajouter une catégorie'}</DialogTitle>
          <DialogDescription>
            {category ? 'Modifiez les détails de la catégorie.' : 'Créez une nouvelle catégorie pour la navigation.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nom</Label>
            <Input id="name" {...register('name')} onChange={handleNameChange} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
           <div className="grid gap-2">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" {...register('slug')} />
            {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
          </div>
           <div className="grid gap-2">
            <Label htmlFor="order">Ordre</Label>
            <Input id="order" type="number" {...register('order')} />
            {errors.order && <p className="text-sm text-destructive">{errors.order.message}</p>}
          </div>
           <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isSubmitting ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function ManageCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const { toast } = useToast();

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const fetchedCategories = await getCategories();
      setCategories(fetchedCategories);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      setError("Impossible de charger les catégories. Vérifiez les permissions Firestore.");
      if (err instanceof Error) {
          console.error(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddClick = () => {
    setSelectedCategory(null);
    setIsFormOpen(true);
  }

  const handleEditClick = (category: Category) => {
    setSelectedCategory(category);
    setIsFormOpen(true);
  }

  const handleDelete = async (categoryId: string) => {
    try {
      await deleteCategory(categoryId);
      toast({ title: 'Catégorie supprimée', description: 'La catégorie a été supprimée avec succès.' });
      fetchCategories();
    } catch (error) {
      console.error("Failed to delete category:", error);
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de supprimer la catégorie.' });
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
            <h1 className="font-headline text-4xl font-bold text-primary">Gérer les Catégories</h1>
            <p className="mt-2 text-muted-foreground">
                Ajoutez, modifiez ou supprimez les catégories de navigation de votre site.
            </p>
        </div>
        <CategoryForm onSave={fetchCategories} onOpenChange={setIsFormOpen} category={selectedCategory}>
           <Button onClick={handleAddClick}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Ajouter une catégorie
            </Button>
        </CategoryForm>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Catégories</CardTitle>
          <CardDescription>
            Voici toutes les catégories actuellement utilisées pour la navigation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
             <div className="flex items-center justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary"/>
                <p className="ml-4 text-muted-foreground">Chargement des catégories...</p>
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
                    <TableHead className="w-1/3">Nom</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead className="text-center">Ordre</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">/{category.slug}</Badge>
                      </TableCell>
                      <TableCell className="text-center">{category.order}</TableCell>
                      <TableCell className="text-right">
                        <CategoryForm onSave={fetchCategories} onOpenChange={setIsFormOpen} category={category}>
                            <Button variant="ghost" size="icon" onClick={() => handleEditClick(category)}>
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Modifier</span>
                            </Button>
                        </CategoryForm>

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
                                Cette action est irréversible. La catégorie "{category.name}" sera définitivement supprimée.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(category.id)}>Supprimer</AlertDialogAction>
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
