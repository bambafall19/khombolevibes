// src/app/admin/medias/page.tsx
'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Pencil, PlusCircle, Trash2, Loader2, ArrowLeft, ImageIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { getAdminMedia } from '@/lib/data';
import { addMedia, updateMedia, deleteMedia } from '@/lib/actions';
import type { Media } from '@/types';

const mediaSchema = z.object({
  title: z.string().min(3, { message: 'Le titre doit contenir au moins 3 caractères.' }),
  url1: z.string().url({ message: "L'URL 1 est requise et doit être une URL valide." }),
  url2: z.string().url({ message: "Veuillez entrer une URL valide." }).optional().or(z.literal('')),
  url3: z.string().url({ message: "Veuillez entrer une URL valide." }).optional().or(z.literal('')),
});

type MediaFormData = z.infer<typeof mediaSchema>;

function MediaForm({ media, onSave, onOpenChange, children, isOpen }: { media?: Media | null, onSave: () => void, onOpenChange: (open: boolean) => void, children: ReactNode, isOpen: boolean }) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<MediaFormData>({
    resolver: zodResolver(mediaSchema),
    defaultValues: {
      title: media?.title || '',
      url1: media?.imageUrls?.[0] || '',
      url2: media?.imageUrls?.[1] || '',
      url3: media?.imageUrls?.[2] || '',
    }
  });
  
  const { register, handleSubmit, formState: { errors }, reset } = form;

  useEffect(() => {
    if (isOpen) {
      reset({
        title: media?.title || '',
        url1: media?.imageUrls?.[0] || '',
        url2: media?.imageUrls?.[1] || '',
        url3: media?.imageUrls?.[2] || '',
      });
    }
  }, [isOpen, media, reset]);

  async function onSubmit(values: MediaFormData) {
    setIsSubmitting(true);
    try {
        const imageUrls = [values.url1, values.url2, values.url3].filter(Boolean) as string[];

        const dataToSave = {
            title: values.title,
            thumbnailUrl: values.url1,
            imageUrls: imageUrls,
        };

      if (media) {
        await updateMedia(media.id, dataToSave);
        toast({ title: 'Média modifié', description: `Le média "${values.title}" a été mis à jour.` });
      } else {
        await addMedia(dataToSave as Omit<Media, 'id' | 'createdAt' | 'type' | 'url' | 'thumbnailHint'>);
        toast({ title: 'Média ajouté', description: `Le média "${values.title}" a été créé.` });
      }
      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save media:", error);
      toast({ variant: 'destructive', title: 'Erreur', description: 'Une erreur est survenue lors de la sauvegarde.' });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{media ? 'Modifier le média' : 'Ajouter un média'}</DialogTitle>
          <DialogDescription>
            {media ? 'Modifiez les détails du média.' : 'Ajoutez une nouvelle photo à la galerie.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Titre</Label>
            <Input id="title" {...register('title')} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="url1">URL de l'image 1 (Miniature)</Label>
            <Input id="url1" {...register('url1')} placeholder="https://..." />
            {errors.url1 && <p className="text-sm text-destructive">{errors.url1.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="url2">URL de l'image 2 (Optionnel)</Label>
            <Input id="url2" {...register('url2')} placeholder="https://..." />
            {errors.url2 && <p className="text-sm text-destructive">{errors.url2.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="url3">URL de l'image 3 (Optionnel)</Label>
            <Input id="url3" {...register('url3')} placeholder="https://..." />
            {errors.url3 && <p className="text-sm text-destructive">{errors.url3.message}</p>}
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
  );
}

export default function ManageMediaPage() {
  const [mediaItems, setMediaItems] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const fetchedMedia = await getAdminMedia(true);
      setMediaItems(fetchedMedia);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch media:", err);
      setError("Impossible de charger les médias.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddClick = () => {
    setSelectedMedia(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (media: Media) => {
    setSelectedMedia(media);
    setIsFormOpen(true);
  };

  const handleDelete = async (media: Media) => {
    try {
      await deleteMedia(media.id);
      toast({ title: 'Média supprimé', description: `Le média "${media.title}" a été supprimé.` });
      fetchData();
    } catch (error) {
      console.error("Failed to delete media:", error);
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de supprimer le média.' });
    }
  };

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
          <h1 className="font-headline text-4xl font-bold text-primary">Gérer les Médias</h1>
          <p className="mt-2 text-muted-foreground">Ajoutez ou supprimez des photos de votre galerie.</p>
        </div>
        <MediaForm
          onSave={fetchData}
          onOpenChange={setIsFormOpen}
          isOpen={isFormOpen && !selectedMedia}
          media={null}
        >
          <Button onClick={handleAddClick}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Ajouter un média
          </Button>
        </MediaForm>
      </header>

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="ml-4 text-muted-foreground">Chargement des médias...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-destructive bg-destructive/10 rounded-md">
          <p className="font-bold">Erreur de chargement</p>
          <p className="text-sm">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {mediaItems.map((item) => (
            <Card key={item.id} className="group overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-video">
                  <Image
                    src={item.thumbnailUrl}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full">
                    <ImageIcon className="h-4 w-4" />
                  </div>
                </div>
              </CardContent>
              <CardHeader className="p-4">
                <CardTitle className="text-base truncate">{item.title}</CardTitle>
                 <CardDescription>{item.imageUrls?.length || 0} image(s)</CardDescription>
              </CardHeader>
              <CardFooter className="p-4 pt-0 flex justify-end gap-2">
                <MediaForm
                  onSave={fetchData}
                  onOpenChange={(open) => { if (!open) setSelectedMedia(null); setIsFormOpen(open); }}
                  isOpen={isFormOpen && selectedMedia?.id === item.id}
                  media={item}
                >
                  <Button variant="ghost" size="icon" onClick={() => handleEditClick(item)}>
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Modifier</span>
                  </Button>
                </MediaForm>
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
                        Cette action est irréversible. Le média "{item.title}" sera définitivement supprimé.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(item)}>Supprimer</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
