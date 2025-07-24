// src/app/admin/statistiques/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, Save, Trash2, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getPublicNavetaneStatsData, updateAndPublishNavetaneStat, getTeams } from '@/lib/data';
import type { NavetaneStats, PlayerRank, Match, Team } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const defaultStats: NavetaneStats = {
    ballonDor: [],
    goldenBoy: [],
    topScorersChampionnat: [],
    topScorersCoupe: [],
    lastResults: [],
    upcomingMatches: [],
};

type StatKey = keyof NavetaneStats;

function PlayerRankingEditor({ title, description, ranks, setRanks, teams }: { title: string, description: string, ranks: PlayerRank[], setRanks: (ranks: PlayerRank[]) => void, teams: Team[] }) {
    const handleAdd = () => {
        const newRank = { rank: ranks.length + 1, name: '', teamId: '', points: 0 };
        setRanks([...ranks, newRank]);
    };

    const handleRemove = (index: number) => {
        setRanks(ranks.filter((_, i) => i !== index).map((r, i) => ({ ...r, rank: i + 1 })));
    };

    const handleChange = (index: number, field: keyof PlayerRank, value: string | number) => {
        const newRanks = [...ranks];
        (newRanks[index] as any)[field] = value;
        
        if (field === 'teamId') {
             const selectedTeam = teams.find(t => t.id === value);
             if(selectedTeam) {
                (newRanks[index] as any)['teamName'] = selectedTeam.name;
             }
        }
        
        setRanks(newRanks);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {ranks.map((rank, index) => (
                        <div key={index} className="flex gap-2 items-end p-2 border rounded-md">
                            <div className="font-bold p-2">{rank.rank}</div>
                            <div className="flex-1 space-y-1">
                                <Label>Joueur</Label>
                                <Input value={rank.name} onChange={(e) => handleChange(index, 'name', e.target.value)} />
                            </div>
                            <div className="flex-1 space-y-1">
                                <Label>Équipe</Label>
                                <Select value={rank.teamId} onValueChange={(value) => handleChange(index, 'teamId', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionner une équipe" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {teams.map(team => <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="w-24 space-y-1">
                                <Label>Points/Buts</Label>
                                <Input type="number" value={rank.points} onChange={(e) => handleChange(index, 'points', parseInt(e.target.value) || 0)} />
                            </div>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleRemove(index)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                    ))}
                    <Button variant="outline" onClick={handleAdd} className="w-full"><PlusCircle className="mr-2" /> Ajouter un joueur</Button>
                </div>
            </CardContent>
        </Card>
    );
}

function MatchEditor({ title, matches, setMatches, isUpcoming, teams }: { title: string, matches: Match[], setMatches: (matches: Match[]) => void, isUpcoming?: boolean, teams: Team[] }) {
    const handleAdd = () => {
        const newMatch: Match = { teamA: '', teamB: '', scoreA: 0, scoreB: 0, date: '', stadium: '', time1: '', time2: '', poule: '' };
        setMatches([...matches, newMatch]);
    };

    const handleRemove = (index: number) => {
        setMatches(matches.filter((_, i) => i !== index));
    };

    const handleChange = (index: number, field: keyof Match, value: string | number) => {
        const newMatches = [...matches];
        (newMatches[index] as any)[field] = value;
        setMatches(newMatches);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {matches.map((match, index) => (
                        <div key={index} className="flex flex-col gap-4 p-4 border rounded-md relative">
                            <Button variant="ghost" size="icon" className="text-destructive absolute top-2 right-2" onClick={() => handleRemove(index)}><Trash2 className="w-4 h-4" /></Button>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                                <div className="space-y-1">
                                    <Label>Équipe A</Label>
                                    <Select value={match.teamA || ''} onValueChange={(value) => handleChange(index, 'teamA', value)}>
                                        <SelectTrigger><SelectValue placeholder="Sélectionner Équipe A" /></SelectTrigger>
                                        <SelectContent>{teams.map(team => <SelectItem key={team.id} value={team.name}>{team.name}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                 <div className="space-y-1">
                                    <Label>Équipe B</Label>
                                    <Select value={match.teamB || ''} onValueChange={(value) => handleChange(index, 'teamB', value)}>
                                        <SelectTrigger><SelectValue placeholder="Sélectionner Équipe B" /></SelectTrigger>
                                        <SelectContent>{teams.map(team => <SelectItem key={team.id} value={team.name}>{team.name}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                            </div>
                            
                            {isUpcoming ? (
                                <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 items-end">
                                    <div className="space-y-1">
                                        <Label>Date</Label>
                                        <Input value={match.date || ''} onChange={(e) => handleChange(index, 'date', e.target.value)} placeholder="ex: Samedi 15 juil." />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Poule / Compétition</Label>
                                        <Input value={match.poule || ''} onChange={(e) => handleChange(index, 'poule', e.target.value)} placeholder="ex: Poule A, Coupe du Maire" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>1ère heure</Label>
                                        <Input value={match.time1 || ''} onChange={(e) => handleChange(index, 'time1', e.target.value)} placeholder="ex: 15:00" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>2ème heure</Label>
                                        <Input value={match.time2 || ''} onChange={(e) => handleChange(index, 'time2', e.target.value)} placeholder="ex: 17:00" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label>Lieu du stade</Label>
                                    <Input value={match.stadium || ''} onChange={(e) => handleChange(index, 'stadium', e.target.value)} placeholder="ex: Stade Municipal" />
                                </div>
                                </>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                     <div className="space-y-1">
                                        <Label>Score A</Label>
                                        <Input type="number" value={match.scoreA || 0} onChange={(e) => handleChange(index, 'scoreA', parseInt(e.target.value) || 0)} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Score B</Label>
                                        <Input type="number" value={match.scoreB || 0} onChange={(e) => handleChange(index, 'scoreB', parseInt(e.target.value) || 0)} />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    <Button variant="outline" onClick={handleAdd} className="w-full"><PlusCircle className="mr-2" /> Ajouter un match</Button>
                </div>
            </CardContent>
        </Card>
    );
}


export default function ManageStatisticsPage() {
  const [statsData, setStatsData] = useState<NavetaneStats>(defaultStats);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        try {
          const [data, fetchedTeams] = await Promise.all([
            getPublicNavetaneStatsData(),
            getTeams()
          ]);
          setStatsData(data || defaultStats);
          setTeams(fetchedTeams);
        } catch (error) {
          console.error("Failed to fetch stats:", error);
          toast({ variant: "destructive", title: "Erreur", description: "Impossible de charger les statistiques." });
        } finally {
          setLoading(false);
        }
    }
    fetchData();
  }, [toast]);

  const updateStats = (key: StatKey, data: any) => {
    setStatsData(prev => ({ ...prev, [key]: data }));
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateAndPublishNavetaneStat(statsData);
      toast({ title: "Données sauvegardées", description: "Les statistiques ont été mises à jour et publiées." });
    } catch(error) {
        console.error('Failed to save and publish stats:', error);
        toast({ variant: 'destructive', title: 'Erreur de sauvegarde', description: 'Une erreur est survenue lors de la publication.'});
    } finally {
        setIsSaving(false);
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
          <h1 className="font-headline text-4xl font-bold text-primary">Gérer les Statistiques Navétane</h1>
          <p className="mt-2 text-muted-foreground">Modifiez les données qui seront affichées sur la page publique.</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving || loading} className="w-full sm:w-auto">
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Sauvegarder et Publier
        </Button>
      </header>

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="ml-4">Chargement des données...</p>
        </div>
      ) : (
        <div className="space-y-8">
          <PlayerRankingEditor title="Ballon d'Or" description="Classement des meilleurs joueurs de la compétition." ranks={statsData.ballonDor} setRanks={(r) => updateStats('ballonDor', r)} teams={teams} />
          <PlayerRankingEditor title="Golden Boy (U20)" description="Classement des meilleurs jeunes talents (moins de 20 ans)." ranks={statsData.goldenBoy} setRanks={(r) => updateStats('goldenBoy', r)} teams={teams} />
          <PlayerRankingEditor title="Meilleurs Buteurs (Championnat)" description="Classement des buteurs du championnat." ranks={statsData.topScorersChampionnat} setRanks={(r) => updateStats('topScorersChampionnat', r)} teams={teams} />
          <PlayerRankingEditor title="Meilleurs Buteurs (Coupe)" description="Classement des buteurs de la coupe du maire." ranks={statsData.topScorersCoupe} setRanks={(r) => updateStats('topScorersCoupe', r)} teams={teams} />
          <MatchEditor title="Derniers Résultats" matches={statsData.lastResults} setMatches={(m) => updateStats('lastResults', m)} teams={teams} />
          <MatchEditor title="Matchs à Venir" matches={statsData.upcomingMatches} setMatches={(m) => updateStats('upcomingMatches', m)} isUpcoming teams={teams} />
        </div>
      )}
    </div>
  );
}
