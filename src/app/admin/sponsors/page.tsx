// src/app/admin/sponsors/page.tsx
'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Trash2, Loader2, ArrowLeft, UploadCloud } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { getSponsors } from '@/lib/data';
import { addSponsor, deleteSponsor, publishSponsors } from '@/lib/actions';
import type { Sponsor } from '@/types';

const sponsorSchema = z.object({
  name: z.string().min(2, { message: 'Le nom doit contenir au moins 2 caractères.' }),
  logoUrl: z.string().url({ message: "Veuillez entrer une URL d'image valide." }),
  websiteUrl: z.string().url({ message: "Veuillez entrer une URL valide." }).optional().or(z.literal('')),
});

type SponsorFormData = z.infer<typeof sponsorSchema>;

function SponsorForm({ onSave, onOpenChange, children }: { onSave: () => void, onOpenChange: (open: boolean) => void, children: ReactNode }) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<SponsorFormData>({
    resolver: zodResolver(sponsorSchema),
    defaultValues: { name: '', logoUrl: '', websiteUrl: '' }
  });
  
  const { register, handleSubmit, formState: { errors } } = form;

  async function onSubmit(values: SponsorFormData) {
    setIsSubmitting(true);
    try {
      await addSponsor(values);
      toast({ title: 'Sponsor ajouté', description: `Le sponsor "${values.name}" a été créé.` });
      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save sponsor:", error);
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
          <DialogTitle>Ajouter un sponsor</DialogTitle>
          <DialogDescription>Entrez les informations du nouveau partenaire.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nom du sponsor</Label>
            <Input id="name" {...register('name')} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="logoUrl">URL du logo</Label>
            <Input id="logoUrl" {...register('logoUrl')} placeholder="https://..." />
            {errors.logoUrl && <p className="text-sm text-destructive">{errors.logoUrl.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="websiteUrl">URL du site (Optionnel)</Label>
            <Input id="websiteUrl" {...register('websiteUrl')} placeholder="https://..." />
            {errors.websiteUrl && <p className="text-sm text-destructive">{errors.websiteUrl.message}</p>}
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

export default function ManageSponsorsPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const fetchedSponsors = await getSponsors();
      setSponsors(fetchedSponsors);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch sponsors:", err);
      setError("Impossible de charger les sponsors.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (sponsor: Sponsor) => {
    try {
      await deleteSponsor(sponsor.id);
      toast({ title: 'Sponsor supprimé', description: `Le sponsor "${sponsor.name}" a été supprimé.` });
      fetchData();
    } catch (error) {
      console.error("Failed to delete sponsor:", error);
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de supprimer le sponsor.' });
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await publishSponsors();
      toast({ title: "Publication réussie", description: "La liste des sponsors a été mise à jour sur le site public." });
    } catch (error) {
      console.error("Failed to publish sponsors:", error);
      toast({ variant: "destructive", title: "Erreur de publication", description: "Impossible de publier les données." });
    } finally {
      setIsPublishing(false);
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
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="font-headline text-4xl font-bold text-primary">Gérer les Sponsors</h1>
          <p className="mt-2 text-muted-foreground">Ajoutez ou supprimez les logos de vos partenaires.</p>
        </div>
        <div className="flex gap-2">
            <SponsorForm onSave={fetchData} onOpenChange={setIsFormOpen}>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Ajouter un sponsor
                </Button>
            </SponsorForm>
            <Button onClick={handlePublish} disabled={isPublishing}>
                {isPublishing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                {isPublishing ? "Publication..." : "Publier"}
            </Button>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Sponsors</CardTitle>
          <CardDescription>
            Voici tous les sponsors qui seront affichés dans le carrousel. N'oubliez pas de publier après chaque modification.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="ml-4 text-muted-foreground">Chargement des sponsors...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-destructive bg-destructive/10 rounded-md">
              <p className="font-bold">Erreur de chargement</p>
              <p className="text-sm">{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {sponsors.map((item) => (
                <Card key={item.id} className="group overflow-hidden flex flex-col">
                  <CardContent className="p-4 flex-grow flex items-center justify-center">
                    <div className="relative aspect-video w-full">
                      <Image
                        src={item.logoUrl}
                        alt={item.name}
                        fill
                        className="object-contain"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                      />
                    </div>
                  </CardContent>
                  <CardHeader className="p-2 border-t">
                    <CardTitle className="text-sm text-center truncate">{item.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2 flex justify-center">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive w-full">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action est irréversible. Le sponsor "{item.name}" sera définitivement supprimé.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(item)}>Supprimer</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
