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
import { Form } from '@/components/ui/form';


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
  teamA: z.string().min(1, "Le nom de l'équipe A est requis.").optional().or(z.literal('')),
  teamB: z.string().min(1, "Le nom de l'équipe B est requis.").optional().or(z.literal('')),
  winnerPlaysAgainst: z.string().min(1, "L'adversaire du vainqueur est requis.").optional().or(z.literal('')),
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


function PouleForm({ open, onOpenChange, onSave, poule }: { open: boolean, onOpenChange: (open: boolean) => void, onSave: () => void, poule?: NavetanePoule | null }) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<PouleFormData>({
    resolver: zodResolver(pouleSchema),
    defaultValues: { name: '' },
  });

  useEffect(() => {
    if (open) {
      form.reset({ name: poule?.name || '' });
    }
  }, [open, poule, form]);

  const handleSubmit = async (values: PouleFormData) => {
    setIsSubmitting(true);
    try {
      if (poule) {
        await updateNavetanePoule(poule.id, values);
        toast({ title: "Poule modifiée" });
      } else {
        await addNavetanePoule(values);
        toast({ title: "Poule ajoutée" });
      }
      onSave();
      onOpenChange(false);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de sauvegarder la poule.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{poule ? 'Modifier la poule' : 'Ajouter une poule'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Nom de la poule</Label>
            <Input id="name" {...form.register('name')} />
            {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
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

function TeamForm({ open, onOpenChange, onSave, poule, team, teams }: { open: boolean, onOpenChange: (open: boolean) => void, onSave: () => void, poule?: NavetanePoule | null, team?: NavetaneTeam | null, teams: Team[] }) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const form = useForm<TeamFormData>({
        resolver: zodResolver(teamSchema),
        defaultValues: { teamId: '', pts: 0, j: 0, g: 0, n: 0, p: 0, db: '0' },
    });

    useEffect(() => {
        if (open) {
            form.reset({
                teamId: team?.id || '',
                pts: team?.pts || 0,
                j: team?.j || 0,
                g: team?.g || 0,
                n: team?.n || 0,
                p: team?.p || 0,
                db: team?.db || '0',
            });
        }
    }, [open, team, form]);

    const handleTeamSubmit = async (values: TeamFormData) => {
        if (!poule) return;
        setIsSubmitting(true);

        const selectedTeamData = teams.find(t => t.id === values.teamId);
        if (!selectedTeamData) {
            toast({ variant: 'destructive', title: 'Erreur', description: "L'équipe sélectionnée est introuvable." });
            setIsSubmitting(false);
            return;
        }

        const teamToSave: NavetaneTeam = { ...values, id: selectedTeamData.id, team: selectedTeamData.name, logoUrl: selectedTeamData.logoUrl };
        const existingTeams = poule.teams || [];
        
        let updatedTeams: NavetaneTeam[];
        if (team) { // Editing existing team
            updatedTeams = existingTeams.map(t => t.id === team.id ? teamToSave : t);
        } else { // Adding new team
            if (existingTeams.some(t => t.id === teamToSave.id)) {
                toast({ variant: 'destructive', title: 'Erreur', description: 'Cette équipe est déjà dans la poule.' });
                setIsSubmitting(false);
                return;
            }
            updatedTeams = [...existingTeams, teamToSave];
        }

        try {
            await updateNavetanePoule(poule.id, { teams: updatedTeams });
            toast({ title: team ? "Équipe modifiée" : "Équipe ajoutée" });
            onSave();
            onOpenChange(false);
        } catch(error) {
             toast({ variant: 'destructive', title: 'Erreur', description: "Impossible de sauvegarder l'équipe." });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                 <DialogHeader>
                    <DialogTitle>{team ? `Modifier ${team.team}` : `Ajouter une équipe à ${poule?.name}`}</DialogTitle>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(handleTeamSubmit)} className="space-y-4">
                     <div className="grid gap-2">
                        <Label htmlFor="teamId">Équipe</Label>
                        <Controller
                        control={form.control}
                        name="teamId"
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value} disabled={!!team}>
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionner une équipe" />
                            </SelectTrigger>
                            <SelectContent>
                                {teams.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                            </SelectContent>
                            </Select>
                        )}
                        />
                        {form.formState.errors.teamId && <p className="text-destructive text-sm">{form.formState.errors.teamId.message}</p>}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <div><Label>Pts</Label><Input type="number" {...form.register('pts')} /></div>
                        <div><Label>J</Label><Input type="number" {...form.register('j')} /></div>
                        <div><Label>G</Label><Input type="number" {...form.register('g')} /></div>
                        <div><Label>N</Label><Input type="number" {...form.register('n')} /></div>
                        <div><Label>P</Label><Input type="number" {...form.register('p')} /></div>
                        <div><Label>DB</Label><Input {...form.register('db')} /></div>
                    </div>
                     <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
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

  // Dialog state management
  const [pouleForm, setPouleForm] = useState<{ open: boolean; data?: NavetanePoule | null }>({ open: false });
  const [teamForm, setTeamForm] = useState<{ open: boolean; poule?: NavetanePoule | null; team?: NavetaneTeam | null }>({ open: false });
  const [coupeMatchForm, setCoupeMatchForm] = useState<{ open: boolean; data?: NavetaneCoupeMatch | null }>({ open: false });
  const [preliminaryMatchForm, setPreliminaryMatchForm] = useState<{ open: boolean; data?: NavetanePreliminaryMatch | null }>({ open: false });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fetchedPoules, fetchedCoupeMatches, fetchedTeams, fetchedPreliminaryMatch] = await Promise.all([
        getAdminNavetanePoules(),
        getAdminNavetaneCoupeMatches(),
        getTeams(),
        getAdminPreliminaryMatch(),
      ]);
      setPoules(fetchedPoules.sort((a, b) => a.name.localeCompare(b.name)));
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

  const handleDeletePoule = async (pouleId: string) => {
    await deleteNavetanePoule(pouleId);
    toast({ title: "Poule supprimée" });
    fetchData();
  };

  const handleDeleteTeam = async (poule: NavetanePoule, teamId: string) => {
    const updatedTeams = (poule.teams || []).filter(t => t.id !== teamId);
    await updateNavetanePoule(poule.id, { teams: updatedTeams });
    toast({ title: "Équipe supprimée" });
    fetchData();
  };

  const handleCoupeMatchSubmit = async (values: CoupeMatchFormData) => {
    const { data: match } = coupeMatchForm;
    try {
        if (match) {
            await updateNavetaneCoupeMatch(match.id, values);
            toast({ title: "Match modifié" });
        } else {
            await addNavetaneCoupeMatch(values);
            toast({ title: "Match ajouté" });
        }
        fetchData();
        setCoupeMatchForm({ open: false });
    } catch(e) {
        toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de sauvegarder le match.' });
    }
  };

  const handleDeleteCoupeMatch = async (matchId: string) => {
    await deleteNavetaneCoupeMatch(matchId);
    toast({ title: "Match supprimé" });
    fetchData();
  };
  
   const handlePreliminaryMatchSubmit = async (values: PreliminaryMatchFormData) => {
    try {
        await updatePreliminaryMatch(values);
        toast({ title: "Match préliminaire mis à jour" });
        fetchData();
        setPreliminaryMatchForm({ open: false });
    } catch(e) {
        toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de sauvegarder le match préliminaire.' });
    }
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
                <Button size="sm" onClick={() => setPouleForm({ open: true, data: null })}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Ajouter une poule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {poules.map((poule) => (
                  <div key={poule.id} className="border p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold text-lg">{poule.name}</h3>
                      <div>
                        <Button variant="ghost" size="icon" onClick={() => setPouleForm({ open: true, data: poule })}><Pencil className="h-4 w-4" /></Button>
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
                               <Button variant="ghost" size="icon" onClick={() => setTeamForm({ open: true, poule, team })}><Pencil className="h-4 w-4" /></Button>
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
                     <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => setTeamForm({ open: true, poule, team: null })}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Ajouter une équipe
                      </Button>
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
                        <Button variant="outline" size="sm" onClick={() => setPreliminaryMatchForm({ open: true, data: preliminaryMatch })}><Pencil className="mr-2 h-4 w-4" /> Modifier</Button>
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
                        <Button size="sm" onClick={() => setCoupeMatchForm({ open: true, data: null })}>
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Ajouter un match
                        </Button>
                    </div>
                     <div className="space-y-2">
                        {coupeMatches.map((match) => (
                           <div key={match.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                            <p className="font-medium flex items-center">{match.teamA} <span className="mx-2 text-primary font-bold">vs</span> {match.teamB}</p>
                             <div>
                                <Button variant="ghost" size="icon" onClick={() => setCoupeMatchForm({ open: true, data: match })}><Pencil className="h-4 w-4" /></Button>
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

      {/* --- Dialogs --- */}
      <PouleForm
        open={pouleForm.open}
        onOpenChange={(open) => setPouleForm({ open })}
        onSave={fetchData}
        poule={pouleForm.data}
      />
      <TeamForm
        open={teamForm.open}
        onOpenChange={(open) => setTeamForm({ open })}
        onSave={fetchData}
        poule={teamForm.poule}
        team={teamForm.team}
        teams={teams}
      />

       <Dialog open={preliminaryMatchForm.open} onOpenChange={(open) => setPreliminaryMatchForm({ open })}>
          <DialogContent>
            <DialogHeader><DialogTitle>Modifier le Match Préliminaire</DialogTitle></DialogHeader>
             <Form {...useForm<PreliminaryMatchFormData>({ resolver: zodResolver(preliminaryMatchSchema), defaultValues: { teamA: preliminaryMatch?.teamA || '', teamB: preliminaryMatch?.teamB || '', winnerPlaysAgainst: preliminaryMatch?.winnerPlaysAgainst || '' } })}>
                <form onSubmit={useForm<PreliminaryMatchFormData>().handleSubmit(handlePreliminaryMatchSubmit)} className="space-y-4">
                  <Controller control={useForm<PreliminaryMatchFormData>().control} name="teamA" render={({ field }) => ( <div><Label>Équipe A</Label>{teamSelect(field, "Équipe A")}</div> )} />
                  <Controller control={useForm<PreliminaryMatchFormData>().control} name="teamB" render={({ field }) => ( <div><Label>Équipe B</Label>{teamSelect(field, "Équipe B")}</div> )} />
                  <Controller control={useForm<PreliminaryMatchFormData>().control} name="winnerPlaysAgainst" render={({ field }) => ( <div><Label>Le Vainqueur Joue Contre</Label>{teamSelect(field, "Adversaire")}</div> )} />
                  <DialogFooter><Button type="submit">Sauvegarder</Button></DialogFooter>
                </form>
             </Form>
          </DialogContent>
      </Dialog>
      
      <Dialog open={coupeMatchForm.open} onOpenChange={(open) => setCoupeMatchForm({ open })}>
          <DialogContent>
            <DialogHeader><DialogTitle>{coupeMatchForm.data ? 'Modifier le match' : 'Ajouter un match'}</DialogTitle></DialogHeader>
            <Form {...useForm<CoupeMatchFormData>({ resolver: zodResolver(coupeMatchSchema), defaultValues: { teamA: coupeMatchForm.data?.teamA || '', teamB: coupeMatchForm.data?.teamB || '' } })}>
                <form onSubmit={useForm<CoupeMatchFormData>().handleSubmit(handleCoupeMatchSubmit)} className="space-y-4">
                  <Controller control={useForm<CoupeMatchFormData>().control} name="teamA" render={({ field }) => ( <div><Label>Équipe A</Label>{teamSelect(field, "Équipe A")}</div> )} />
                  <Controller control={useForm<CoupeMatchFormData>().control} name="teamB" render={({ field }) => ( <div><Label>Équipe B</Label>{teamSelect(field, "Équipe B")}</div> )} />
                  <DialogFooter><Button type="submit">Sauvegarder</Button></DialogFooter>
                </form>
            </Form>
          </DialogContent>
      </Dialog>

    </div>
  );
}
