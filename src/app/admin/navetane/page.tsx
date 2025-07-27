// src/app/admin/navetane/page.tsx
'use client';

import { useEffect, useState, type ReactNode, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, PlusCircle, Pencil, Trash2, Forward, UploadCloud } from 'lucide-react';
import { getAdminNavetanePoules, getAdminNavetaneCoupeMatches, getTeams, getAdminPreliminaryMatch } from '@/lib/data';
import { addNavetanePoule, updateNavetanePoule, deleteNavetanePoule, addNavetaneCoupeMatch, updateNavetaneCoupeMatch, deleteNavetaneCoupeMatch, updatePreliminaryMatch, publishNavetanePageData } from '@/lib/actions';
import type { NavetanePoule, NavetaneCoupeMatch, NavetaneTeam, Team, NavetanePreliminaryMatch } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';


// Schemas for validation
const pouleSchema = z.object({
  name: z.string().min(1, "Le nom de la poule est requis."),
});
type PouleFormData = z.infer<typeof pouleSchema>;

const coupeMatchSchema = z.object({
    teamA: z.string().min(1, "Le nom de l'équipe A est requis."),
    teamB: z.string().min(1, "Le nom de l'équipe B est requis."),
});
type CoupeMatchFormData = z.infer<typeof coupeMatchSchema>;

const preliminaryMatchSchema = z.object({
  teamA: z.string().min(1, "Le nom de l'équipe A est requis."),
  teamB: z.string().min(1, "Le nom de l'équipe B est requis."),
  winnerPlaysAgainst: z.string().min(1, "L'adversaire du vainqueur est requis."),
});
type PreliminaryMatchFormData = z.infer<typeof preliminaryMatchSchema>;

const teamSchema = z.object({
  teamId: z.string().min(1, "Veuillez sélectionner une équipe."),
  pts: z.coerce.number().int().default(0),
  j: z.coerce.number().int().default(0),
  g: z.coerce.number().int().default(0),
  n: z.coerce.number().int().default(0),
  p: z.coerce.number().int().default(0),
  db: z.string().default('0'),
});
type TeamFormData = z.infer<typeof teamSchema>;


// --- Reusable Dialog Form Component ---
function FormDialog<T extends z.ZodType<any, any>>({
  isOpen,
  onOpenChange,
  schema,
  defaultValues,
  title,
  description,
  onSubmit,
  children,
  formFields,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  schema: T;
  defaultValues: z.infer<T>;
  title: string;
  description: string;
  onSubmit: (values: z.infer<T>) => Promise<void>;
  children: ReactNode;
  formFields: (form: ReturnType<typeof useForm<z.infer<T>>>) => ReactNode;
}) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  useEffect(() => {
    if (isOpen) {
      form.reset(defaultValues);
    }
  }, [isOpen, defaultValues, form]);

  const handleSubmit = async (values: z.infer<T>) => {
    setIsSubmitting(true);
    try {
      await onSubmit(values);
      onOpenChange(false);
    } catch (error) {
      console.error("Submission error:", error);
      toast({ variant: 'destructive', title: 'Erreur', description: "Une erreur est survenue." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {formFields(form)}
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


export default function ManageNavetanePage() {
  const [poules, setPoules] = useState<NavetanePoule[]>([]);
  const [coupeMatches, setCoupeMatches] = useState<NavetaneCoupeMatch[]>([]);
  const [preliminaryMatch, setPreliminaryMatch] = useState<NavetanePreliminaryMatch | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [isPublishing, startPublishTransition] = useTransition();

  // State for dialogs
  const [pouleDialogOpen, setPouleDialogOpen] = useState(false);
  const [selectedPoule, setSelectedPoule] = useState<NavetanePoule | null>(null);

  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<NavetaneTeam | null>(null);
  const [currentPouleForTeam, setCurrentPouleForTeam] = useState<NavetanePoule | null>(null);
  
  const [coupeDialogOpen, setCoupeDialogOpen] = useState(false);
  const [selectedCoupeMatch, setSelectedCoupeMatch] = useState<NavetaneCoupeMatch | null>(null);
  
  const [preliminaryDialogOpen, setPreliminaryDialogOpen] = useState(false);


  const fetchData = async () => {
    setLoading(true);
    try {
      const [fetchedPoules, fetchedCoupeMatches, fetchedTeams, fetchedPreliminaryMatch] = await Promise.all([
        getAdminNavetanePoules(),
        getAdminNavetaneCoupeMatches(),
        getTeams(),
        getAdminPreliminaryMatch(),
      ]);
      setPoules(fetchedPoules);
      setCoupeMatches(fetchedCoupeMatches);
      setTeams(fetchedTeams);
      setPreliminaryMatch(fetchedPreliminaryMatch);
    } catch (error) {
      console.error("Failed to fetch navetane data:", error);
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de charger les données." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  // --- Handlers for Poules ---
  const handlePouleSubmit = async (values: PouleFormData) => {
    if (selectedPoule) {
      await updateNavetanePoule(selectedPoule.id, values);
      toast({ title: "Poule modifiée" });
    } else {
      await addNavetanePoule(values);
      toast({ title: "Poule ajoutée" });
    }
    fetchData();
  };

  const handleDeletePoule = async (pouleId: string) => {
    await deleteNavetanePoule(pouleId);
    toast({ title: "Poule supprimée" });
    fetchData();
  };

  // --- Handlers for Teams ---
  const handleTeamSubmit = async (values: TeamFormData) => {
    if (!currentPouleForTeam) return;

    const selectedTeamData = teams.find(t => t.id === values.teamId);
    if (!selectedTeamData) {
        toast({ variant: 'destructive', title: 'Erreur', description: "L'équipe sélectionnée est introuvable." });
        return;
    }

    const teamToSave: NavetaneTeam = {
      ...values, 
      id: selectedTeamData.id, // Use the actual team ID
      team: selectedTeamData.name, // Use the canonical team name
      logoUrl: selectedTeamData.logoUrl, // Use the canonical team logo
    };

    let updatedTeams: NavetaneTeam[];
    const existingTeams = currentPouleForTeam.teams || [];

    if (selectedTeam) { // Editing existing team
      updatedTeams = existingTeams.map(t => 
        t.id === selectedTeam.id ? teamToSave : t
      );
    } else { // Adding new team
      if (existingTeams.some(t => t.id === teamToSave.id)) {
        toast({ variant: 'destructive', title: 'Erreur', description: 'Cette équipe est déjà dans la poule.' });
        return;
      }
      updatedTeams = [...existingTeams, teamToSave];
    }
    
    await updateNavetanePoule(currentPouleForTeam.id, { teams: updatedTeams });
    toast({ title: selectedTeam ? "Équipe modifiée" : "Équipe ajoutée" });
    fetchData();
  };

  const handleDeleteTeam = async (poule: NavetanePoule, teamId: string) => {
    const updatedTeams = (poule.teams || []).filter(t => t.id !== teamId);
    await updateNavetanePoule(poule.id, { teams: updatedTeams });
    toast({ title: "Équipe supprimée" });
    fetchData();
  };

  // --- Handlers for Coupe Matches ---
   const handlePreliminaryMatchSubmit = async (values: PreliminaryMatchFormData) => {
    await updatePreliminaryMatch(values);
    toast({ title: "Match préliminaire mis à jour" });
    fetchData();
  };

  const handleCoupeMatchSubmit = async (values: CoupeMatchFormData) => {
    if (selectedCoupeMatch) {
      await updateNavetaneCoupeMatch(selectedCoupeMatch.id, values);
      toast({ title: "Match modifié" });
    } else {
      await addNavetaneCoupeMatch(values);
      toast({ title: "Match ajouté" });
    }
    fetchData();
  };

  const handleDeleteCoupeMatch = async (matchId: string) => {
    await deleteNavetaneCoupeMatch(matchId);
    toast({ title: "Match supprimé" });
    fetchData();
  };

  const handlePublish = () => {
    startPublishTransition(async () => {
      try {
        await publishNavetanePageData();
        toast({ title: "Publication réussie", description: "Les données de la page Navétane ont été mises à jour." });
      } catch (error) {
        console.error("Failed to publish navetane data:", error);
        toast({ variant: "destructive", title: "Erreur de publication", description: "Impossible de publier les données." });
      }
    });
  };

  const teamFormFields = ({ control, register, formState: { errors }, watch }: ReturnType<typeof useForm<TeamFormData>>) => {
      const selectedTeamId = watch('teamId');
      const isTeamAlreadyInPoule = (currentPouleForTeam?.teams || []).some(t => t.id === selectedTeamId) && selectedTeam?.id !== selectedTeamId;
      
      return (
        <div className="space-y-2">
          <div className="grid gap-2">
            <Label htmlFor="teamId">Équipe</Label>
            <Controller
              control={control}
              name="teamId"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value} disabled={!!selectedTeam}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une équipe" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.teamId && <p className="text-destructive text-sm">{errors.teamId.message}</p>}
            {isTeamAlreadyInPoule && <p className="text-destructive text-sm">Cette équipe est déjà dans la poule.</p>}
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div><Label>Pts</Label><Input type="number" {...register('pts')} /></div>
            <div><Label>J</Label><Input type="number" {...register('j')} /></div>
            <div><Label>G</Label><Input type="number" {...register('g')} /></div>
            <div><Label>N</Label><Input type="number" {...register('n')} /></div>
            <div><Label>P</Label><Input type="number" {...register('p')} /></div>
            <div><Label>DB</Label><Input {...register('db')} /></div>
          </div>
        </div>
      );
  };

  const teamSelect = (field: any, placeholder: string) => (
    <Select onValueChange={field.onChange} value={field.value || ''}>
        <SelectTrigger><SelectValue placeholder={placeholder} /></SelectTrigger>
        <SelectContent>{teams.map(t => <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>)}</SelectContent>
    </Select>
  );

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
          <h1 className="font-headline text-4xl font-bold text-primary">Gérer les Navétanes</h1>
          <p className="mt-2 text-muted-foreground">Gérez les poules, les équipes et les matchs de la coupe.</p>
        </div>
         <Button onClick={handlePublish} disabled={isPublishing || loading}>
            {isPublishing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
            {isPublishing ? "Publication..." : "Publier les modifications"}
        </Button>
      </header>
      
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary"/>
          <p className="ml-4 text-muted-foreground">Chargement des données...</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Poules du Championnat</CardTitle>
                  <CardDescription>Gérez les équipes et leur classement dans chaque poule.</CardDescription>
                </div>
                <FormDialog
                  isOpen={pouleDialogOpen && !selectedPoule}
                  onOpenChange={setPouleDialogOpen}
                  schema={pouleSchema}
                  defaultValues={{ name: '' }}
                  title="Ajouter une poule"
                  description="Créez une nouvelle poule pour le championnat."
                  onSubmit={handlePouleSubmit}
                  formFields={({ register, formState: { errors } }) => (
                    <div>
                      <Label htmlFor="name">Nom de la poule</Label>
                      <Input id="name" {...register('name')} />
                      {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                    </div>
                  )}
                >
                  <Button size="sm" onClick={() => { setSelectedPoule(null); setPouleDialogOpen(true); }}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Ajouter une poule
                  </Button>
                </FormDialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {poules.map((poule) => (
                  <div key={poule.id} className="border p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold text-lg">{poule.name}</h3>
                      <div>
                        <FormDialog
                          isOpen={pouleDialogOpen && selectedPoule?.id === poule.id}
                          onOpenChange={setPouleDialogOpen}
                          schema={pouleSchema}
                          defaultValues={{ name: poule.name }}
                          title="Modifier la poule"
                          description="Changez le nom de la poule."
                          onSubmit={handlePouleSubmit}
                           formFields={({ register, formState: { errors } }) => (
                            <div>
                              <Label htmlFor="name">Nom de la poule</Label>
                              <Input id="name" {...register('name')} />
                              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                            </div>
                          )}
                        >
                           <Button variant="ghost" size="icon" onClick={() => { setSelectedPoule(poule); setPouleDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                        </FormDialog>
                        <AlertDialog>
                          <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Supprimer la poule "{poule.name}" ?</AlertDialogTitle><AlertDialogDescription>Cette action est irréversible et supprimera également toutes les équipes de cette poule.</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={() => handleDeletePoule(poule.id)}>Supprimer</AlertDialogAction></AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    <Table>
                       <TableHeader>
                        <TableRow>
                            <TableHead className="w-[40%]">Équipe</TableHead>
                            <TableHead className="text-center">Pts</TableHead>
                            <TableHead className="text-center">J</TableHead>
                            <TableHead className="text-center">G</TableHead>
                            <TableHead className="text-center">N</TableHead>
                            <TableHead className="text-center">P</TableHead>
                            <TableHead className="text-center">DB</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {poule.teams?.sort((a,b) => b.pts - a.pts).map((team) => (
                          <TableRow key={team.id}>
                            <TableCell className="flex items-center gap-2 font-medium">
                              {team.logoUrl && <Image src={team.logoUrl} alt={`Logo ${team.team}`} width={24} height={24} className="rounded-full object-cover" />}
                              <span>{team.team}</span>
                            </TableCell>
                            <TableCell className="text-center font-bold">{team.pts}</TableCell>
                            <TableCell className="text-center">{team.j}</TableCell>
                            <TableCell className="text-center">{team.g}</TableCell>
                            <TableCell className="text-center">{team.n}</TableCell>
                            <TableCell className="text-center">{team.p}</TableCell>
                            <TableCell className="text-center">{team.db}</TableCell>
                            <TableCell className="text-right">
                               <FormDialog
                                  isOpen={teamDialogOpen && selectedTeam?.id === team.id && currentPouleForTeam?.id === poule.id}
                                  onOpenChange={setTeamDialogOpen}
                                  schema={teamSchema}
                                  defaultValues={{...team, teamId: team.id}}
                                  title={`Modifier ${team.team}`}
                                  description={`Modifiez les détails de l'équipe dans ${poule.name}.`}
                                  onSubmit={handleTeamSubmit}
                                  formFields={teamFormFields}
                              >
                                  <Button variant="ghost" size="icon" onClick={() => { setCurrentPouleForTeam(poule); setSelectedTeam(team); setTeamDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                              </FormDialog>
                              <AlertDialog>
                                <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader><AlertDialogTitle>Supprimer l'équipe "{team.team}" ?</AlertDialogTitle><AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription></AlertDialogHeader>
                                    <AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteTeam(poule, team.id)}>Supprimer</AlertDialogAction></AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                     <FormDialog
                          isOpen={teamDialogOpen && !selectedTeam && currentPouleForTeam?.id === poule.id}
                          onOpenChange={setTeamDialogOpen}
                          schema={teamSchema}
                          defaultValues={{ teamId: '', pts: 0, j: 0, g: 0, n: 0, p: 0, db: '0' }}
                          title={`Ajouter une équipe à ${poule.name}`}
                          description="Remplissez les informations de la nouvelle équipe."
                          onSubmit={handleTeamSubmit}
                          formFields={teamFormFields}
                      >
                         <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => { setCurrentPouleForTeam(poule); setSelectedTeam(null); setTeamDialogOpen(true); }}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Ajouter une équipe
                          </Button>
                      </FormDialog>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
                <CardTitle>Matchs de la Coupe</CardTitle>
                <CardDescription>Gérez les affiches de la coupe, y compris le match préliminaire.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <div className='flex justify-between items-center'>
                        <h4 className="font-semibold text-lg">Match Préliminaire</h4>
                        <FormDialog
                            isOpen={preliminaryDialogOpen}
                            onOpenChange={setPreliminaryDialogOpen}
                            schema={preliminaryMatchSchema}
                            defaultValues={{ teamA: preliminaryMatch?.teamA || '', teamB: preliminaryMatch?.teamB || '', winnerPlaysAgainst: preliminaryMatch?.winnerPlaysAgainst || '' }}
                            title="Modifier le Match Préliminaire"
                            description="Définissez le match préliminaire et l'adversaire du vainqueur."
                            onSubmit={handlePreliminaryMatchSubmit}
                            formFields={({ control, formState: { errors } }) => (
                                <div className="space-y-4">
                                    <div>
                                        <Label>Équipe A (Préliminaire)</Label>
                                        <Controller control={control} name="teamA" render={({ field }) => teamSelect(field, "Équipe A")} />
                                        {errors.teamA && <p className="text-sm text-destructive">{typeof errors.teamA.message === 'string' ? errors.teamA.message : ''}</p>}
                                    </div>
                                    <div>
                                        <Label>Équipe B (Préliminaire)</Label>
                                        <Controller control={control} name="teamB" render={({ field }) => teamSelect(field, "Équipe B")} />
                                        {errors.teamB && <p className="text-sm text-destructive">{typeof errors.teamB.message === 'string' ? errors.teamB.message : ''}</p>}
                                    </div>
                                    <div>
                                        <Label>Le Vainqueur Joue Contre</Label>
                                        <Controller control={control} name="winnerPlaysAgainst" render={({ field }) => teamSelect(field, "Adversaire")} />
                                        {errors.winnerPlaysAgainst && <p className="text-sm text-destructive">{typeof errors.winnerPlaysAgainst.message === 'string' ? errors.winnerPlaysAgainst.message : ''}</p>}
                                    </div>
                                </div>
                            )}
                        >
                            <Button variant="outline" size="sm" onClick={() => setPreliminaryDialogOpen(true)}><Pencil className="mr-2 h-4 w-4" /> Modifier</Button>
                        </FormDialog>
                    </div>
                     {preliminaryMatch && preliminaryMatch.teamA && preliminaryMatch.teamB && preliminaryMatch.winnerPlaysAgainst ? (
                         <div className="flex items-center justify-center p-3 mt-2 bg-muted/50 rounded-lg border">
                             <p className="font-medium text-right">{preliminaryMatch.teamA} <span className="mx-2 text-primary font-bold">vs</span> {preliminaryMatch.teamB}</p>
                             <Forward className="h-5 w-5 mx-4 text-muted-foreground" />
                             <p className="font-medium text-left">Vainqueur vs <span className="font-bold text-primary">{preliminaryMatch.winnerPlaysAgainst}</span></p>
                         </div>
                     ) : (
                         <p className="text-muted-foreground text-center mt-2">Aucun match préliminaire défini.</p>
                     )}
                </div>

                <Separator />

                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-lg">Tour Principal</h4>
                         <FormDialog
                            isOpen={coupeDialogOpen && !selectedCoupeMatch}
                            onOpenChange={setCoupeDialogOpen}
                            schema={coupeMatchSchema}
                            defaultValues={{ teamA: '', teamB: '' }}
                            title="Ajouter un match"
                            description="Créez une nouvelle affiche pour le tour principal."
                            onSubmit={handleCoupeMatchSubmit}
                            formFields={({ control, formState: { errors } }) => (
                              <div className="space-y-4">
                                 <div>
                                  <Label>Équipe A</Label>
                                  <Controller control={control} name="teamA" render={({ field }) => teamSelect(field, "Sélectionner l'équipe A")} />
                                  {errors.teamA && <p className="text-sm text-destructive">{typeof errors.teamA.message === 'string' ? errors.teamA.message : ''}</p>}
                                </div>
                                <div>
                                  <Label>Équipe B</Label>
                                  <Controller control={control} name="teamB" render={({ field }) => teamSelect(field, "Sélectionner l'équipe B")} />
                                   {errors.teamB && <p className="text-sm text-destructive">{typeof errors.teamB.message === 'string' ? errors.teamB.message : ''}</p>}
                                </div>
                              </div>
                            )}
                          >
                            <Button size="sm" onClick={() => { setSelectedCoupeMatch(null); setCoupeDialogOpen(true)}}>
                              <PlusCircle className="mr-2 h-4 w-4" />
                              Ajouter un match
                            </Button>
                          </FormDialog>
                    </div>
                     <div className="space-y-2">
                        {coupeMatches.map((match) => (
                           <div key={match.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                            <p className="font-medium flex items-center">{match.teamA} <span className="mx-2 text-primary font-bold">vs</span> {match.teamB}</p>
                             <div>
                                <FormDialog isOpen={coupeDialogOpen && selectedCoupeMatch?.id === match.id} onOpenChange={setCoupeDialogOpen} schema={coupeMatchSchema} defaultValues={match} title="Modifier le match" description="Changez les équipes de l'affiche." onSubmit={handleCoupeMatchSubmit}
                                   formFields={({ control, formState: { errors } }) => (
                                      <div className="space-y-4">
                                        <div>
                                          <Label>Équipe A</Label>
                                           <Controller control={control} name="teamA" render={({ field }) => teamSelect(field, "Sélectionner l'équipe A")} />
                                          {errors.teamA && <p className="text-sm text-destructive">{typeof errors.teamA.message === 'string' ? errors.teamA.message : ''}</p>}
                                        </div>
                                        <div>
                                          <Label>Équipe B</Label>
                                           <Controller control={control} name="teamB" render={({ field }) => teamSelect(field, "Sélectionner l'équipe B")} />
                                          {errors.teamB && <p className="text-sm text-destructive">{typeof errors.teamB.message === 'string' ? errors.teamB.message : ''}</p>}
                                        </div>
                                      </div>
                                    )}
                                >
                                    <Button variant="ghost" size="icon" onClick={() => { setSelectedCoupeMatch(match); setCoupeDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                                </FormDialog>
                                 <AlertDialog>
                                  <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader><AlertDialogTitle>Supprimer ce match ?</AlertDialogTitle><AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription></AlertDialogHeader>
                                    <AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteCoupeMatch(match.id)}>Supprimer</AlertDialogAction></AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                          </div>
                        ))}
                      </div>
                </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
