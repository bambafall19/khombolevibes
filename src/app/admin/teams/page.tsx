// src/app/admin/teams/page.tsx
'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { getTeams } from '@/lib/data';
import { addTeam, updateTeam, deleteTeam, publishTeams } from '@/lib/actions';
import type { Team } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, PlusCircle, Trash2, Loader2, ArrowLeft, UploadCloud } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import Link from 'next/link';
import Image from 'next/image';

const teamSchema = z.object({
  name: z.string().min(2, { message: 'Le nom doit contenir au moins 2 caractères.' }),
  logoUrl: z.string().url({ message: "Veuillez entrer une URL d'image valide." }),
});

type TeamFormData = z.infer<typeof teamSchema>;

function TeamForm({ team, onSave, onOpenChange, children }: { team?: Team | null, onSave: () => void, onOpenChange: (open: boolean) => void, children: ReactNode }) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: team?.name || '',
      logoUrl: team?.logoUrl || '',
    }
  });
  
  const { register, handleSubmit, formState: { errors } } = form;

  useEffect(() => {
    form.reset({
      name: team?.name || '',
      logoUrl: team?.logoUrl || '',
    });
  }, [team, form]);

  async function onSubmit(values: TeamFormData) {
    setIsSubmitting(true);
    try {
      if (team) {
        await updateTeam(team.id, values);
        toast({ title: 'Équipe modifiée', description: `L'équipe "${values.name}" a été mise à jour.` });
      } else {
        await addTeam(values);
        toast({ title: 'Équipe ajoutée', description: `L'équipe "${values.name}" a été créée.` });
      }
      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save team:", error);
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
          <DialogTitle>{team ? "Modifier l'équipe" : "Ajouter une équipe"}</DialogTitle>
          <DialogDescription>
            {team ? "Modifiez les détails de l'équipe." : 'Créez une nouvelle équipe.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nom</Label>
            <Input id="name" {...register('name')} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
           <div className="grid gap-2">
            <Label htmlFor="logoUrl">URL du logo</Label>
            <Input id="logoUrl" {...register('logoUrl')} placeholder="https://..." />
            {errors.logoUrl && <p className="text-sm text-destructive">{errors.logoUrl.message}</p>}
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

export default function ManageTeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const { toast } = useToast();

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const fetchedTeams = await getTeams();
      setTeams(fetchedTeams);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch teams:", err);
      setError("Impossible de charger les équipes. Vérifiez les permissions Firestore.");
      if (err instanceof Error) {
          console.error(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleAddClick = () => {
    setSelectedTeam(null);
    setIsFormOpen(true);
  }

  const handleEditClick = (team: Team) => {
    setSelectedTeam(team);
    setIsFormOpen(true);
  }

  const handleDelete = async (team: Team) => {
    try {
      await deleteTeam(team.id);
      toast({ title: 'Équipe supprimée', description: `L'équipe "${team.name}" a été supprimée avec succès.` });
      fetchTeams();
    } catch (error) {
      console.error("Failed to delete team:", error);
      toast({ variant: 'destructive', title: 'Erreur', description: "Impossible de supprimer l'équipe." });
    }
  }

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await publishTeams();
      toast({ title: "Publication réussie", description: "Les données des équipes ont été publiées sur le site." });
    } catch (error) {
      console.error("Failed to publish teams:", error);
      toast({ variant: "destructive", title: "Erreur de publication", description: "Impossible de publier les équipes." });
    } finally {
      setIsPublishing(false);
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
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
            <h1 className="font-headline text-4xl font-bold text-primary">Gérer les Équipes</h1>
            <p className="mt-2 text-muted-foreground">
                Ajoutez, modifiez ou supprimez les équipes.
            </p>
        </div>
        <div className="flex gap-2">
            <TeamForm onSave={fetchTeams} onOpenChange={setIsFormOpen} team={null}>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Ajouter une équipe
                </Button>
            </TeamForm>
             <Button onClick={handlePublish} disabled={isPublishing}>
                {isPublishing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                {isPublishing ? "Publication..." : "Publier"}
            </Button>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Équipes</CardTitle>
          <CardDescription>
            Voici toutes les équipes enregistrées. Cliquez sur "Publier" pour rendre les modifications visibles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
             <div className="flex items-center justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary"/>
                <p className="ml-4 text-muted-foreground">Chargement des équipes...</p>
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
                    <TableHead>Logo</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teams.map((team) => (
                    <TableRow key={team.id}>
                      <TableCell>
                        <Image src={team.logoUrl} alt={`Logo ${team.name}`} width={40} height={40} className="rounded-full object-cover" />
                      </TableCell>
                      <TableCell className="font-medium">{team.name}</TableCell>
                      <TableCell className="text-right">
                        <TeamForm onSave={fetchTeams} onOpenChange={(open) => {
                            if (!open) setSelectedTeam(null);
                            setIsFormOpen(open);
                        }} team={team}>
                            <Button variant="ghost" size="icon" onClick={() => handleEditClick(team)}>
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Modifier</span>
                            </Button>
                        </TeamForm>

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
                                Cette action est irréversible. L'équipe "{team.name}" sera définitivement supprimée.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(team)}>Supprimer</AlertDialogAction>
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
