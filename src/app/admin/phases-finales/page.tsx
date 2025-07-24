// src/app/admin/phases-finales/page.tsx
'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, Save, UploadCloud, PlusCircle, Trash2 } from 'lucide-react';
import { getAdminFinalsData, getTeams, updateAdminFinalsData, publishFinalsData } from '@/lib/data';
import type { CompetitionFinals, FinalsBracket, Team, BracketMatch } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { nanoid } from 'nanoid';


const MatchEditor = ({
  match,
  teams,
  onUpdate,
  onDelete
}: {
  match: BracketMatch,
  teams: Team[],
  onUpdate: (matchId: string, field: keyof BracketMatch, value: any) => void,
  onDelete: (matchId: string) => void
}) => {
  return (
    <div className="border rounded-lg p-4 space-y-3 relative">
        <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-7 w-7 text-destructive" onClick={() => onDelete(match.id)}>
            <Trash2 className="w-4 h-4" />
        </Button>
        <div className="space-y-2">
            <Label>Équipe A</Label>
            <Select
                value={match.teamAId || ''}
                onValueChange={(val) => onUpdate(match.id, 'teamAId', val)}
            >
                <SelectTrigger><SelectValue placeholder="À déterminer" /></SelectTrigger>
                <SelectContent>{teams.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
            </Select>
            <Label>Équipe B</Label>
            <Select
                value={match.teamBId || ''}
                onValueChange={(val) => onUpdate(match.id, 'teamBId', val)}
            >
                <SelectTrigger><SelectValue placeholder="À déterminer" /></SelectTrigger>
                <SelectContent>{teams.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
            </Select>
        </div>
        <div className="flex gap-2">
            <Input type="number" placeholder="Score A" value={match.scoreA ?? ''} onChange={(e) => onUpdate(match.id, 'scoreA', e.target.value ? parseInt(e.target.value) : undefined)} />
            <Input type="number" placeholder="Score B" value={match.scoreB ?? ''} onChange={(e) => onUpdate(match.id, 'scoreB', e.target.value ? parseInt(e.target.value) : undefined)} />
        </div>
        <Input type="text" placeholder="Date (ex: 25/08)" value={match.date ?? ''} onChange={(e) => onUpdate(match.id, 'date', e.target.value)} />
    </div>
  )
}

const BracketStageEditor = ({ 
    title,
    matches,
    teams,
    onUpdate,
    onAdd,
    onDelete
}: { 
    title: string,
    matches: BracketMatch[],
    teams: Team[],
    onUpdate: (matchId: string, field: keyof BracketMatch, value: any) => void,
    onAdd: () => void,
    onDelete: (matchId: string) => void
}) => {
    const safeMatches = Array.isArray(matches) ? matches : [];
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">{title}</h3>
                <Button variant="outline" size="sm" onClick={onAdd}><PlusCircle className="mr-2 h-4 w-4"/>Ajouter Match</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {safeMatches.map((match) => (
                    <MatchEditor key={match.id} match={match} teams={teams} onUpdate={onUpdate} onDelete={onDelete} />
                ))}
                {safeMatches.length === 0 && <p className="text-muted-foreground text-center col-span-full py-4">Aucun match pour cette phase.</p>}
            </div>
        </div>
    );
};


const BracketEditor = ({
    bracket,
    teams,
    onUpdate,
    competition
}: {
    bracket: FinalsBracket,
    teams: Team[],
    onUpdate: (competition: 'championnat' | 'coupe', stage: 'quarters' | 'semis' | 'final', updatedMatches: BracketMatch[]) => void,
    competition: 'championnat' | 'coupe'
}) => {

    const handleUpdate = (stage: 'quarters' | 'semis' | 'final', matchId: string, field: keyof BracketMatch, value: any) => {
        const updatedMatches = bracket[stage].map(m => 
            m.id === matchId ? { ...m, [field]: value } : m
        );
        onUpdate(competition, stage, updatedMatches);
    };
    
    const handleAdd = (stage: 'quarters' | 'semis' | 'final') => {
        const newMatch: BracketMatch = { id: nanoid(8), status: 'pending' };
        const updatedMatches = [...bracket[stage], newMatch];
        onUpdate(competition, stage, updatedMatches);
    };

    const handleDelete = (stage: 'quarters' | 'semis' | 'final', matchId: string) => {
        const updatedMatches = bracket[stage].filter(m => m.id !== matchId);
        onUpdate(competition, stage, updatedMatches);
    };

    return (
        <div className="space-y-6">
            <BracketStageEditor
                title="Quarts de Finale"
                matches={bracket.quarters}
                teams={teams}
                onAdd={() => handleAdd('quarters')}
                onDelete={(id) => handleDelete('quarters', id)}
                onUpdate={(id, field, value) => handleUpdate('quarters', id, field, value)}
            />
            <Separator />
            <BracketStageEditor
                title="Demi-Finales"
                matches={bracket.semis}
                teams={teams}
                onAdd={() => handleAdd('semis')}
                onDelete={(id) => handleDelete('semis', id)}
                onUpdate={(id, field, value) => handleUpdate('semis', id, field, value)}
            />
             <Separator />
            <BracketStageEditor
                title="Finale"
                matches={bracket.final}
                teams={teams}
                onAdd={() => handleAdd('final')}
                onDelete={(id) => handleDelete('final', id)}
                onUpdate={(id, field, value) => handleUpdate('final', id, field, value)}
            />
        </div>
    );
};


export default function ManageFinalsPage() {
  const [data, setData] = useState<CompetitionFinals | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, startPublishTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchData() {
        setLoading(true);
        try {
            const [finals, teamsData] = await Promise.all([getAdminFinalsData(), getTeams()]);
            setData(finals);
            setTeams(teamsData);
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de charger les données des phases finales.' });
        } finally {
            setLoading(false);
        }
    }
    fetchData();
  }, [toast]);

  const handleBracketUpdate = (competition: 'championnat' | 'coupe', stage: 'quarters' | 'semis' | 'final', updatedMatches: BracketMatch[]) => {
      setData(prev => {
          if (!prev) return null;
          const newData = JSON.parse(JSON.stringify(prev));
          newData[competition][stage] = updatedMatches;
          return newData;
      });
  };

  const handleSave = async () => {
    if (!data) return;
    setIsSaving(true);
    try {
        await updateAdminFinalsData(data);
        toast({ title: 'Données enregistrées', description: 'Les modifications ont été sauvegardées.' });
    } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: 'Erreur', description: 'La sauvegarde a échoué.' });
    } finally {
        setIsSaving(false);
    }
  };

  const handlePublish = () => {
    startPublishTransition(async () => {
        try {
            await publishFinalsData();
            toast({ title: "Publication réussie", description: "Les phases finales sont visibles sur le site public." });
        } catch (error) {
            console.error(error);
            toast({ variant: "destructive", title: "Erreur de publication", description: "Impossible de publier les données." });
        }
    });
  };

  if (loading || !data) {
    return (
        <div className="flex justify-center items-center h-screen">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Button variant="outline" asChild className="mb-6">
        <Link href="/admin"><ArrowLeft className="mr-2 h-4 w-4" />Retour au tableau de bord</Link>
      </Button>
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="font-headline text-4xl font-bold text-primary">Gérer les Phases Finales</h1>
          <p className="mt-2 text-muted-foreground">Définissez les tableaux pour le championnat et la coupe.</p>
        </div>
        <div className="flex gap-2">
            <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Enregistrer
            </Button>
            <Button onClick={handlePublish} disabled={isPublishing}>
                {isPublishing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                Publier
            </Button>
        </div>
      </header>

      <Tabs defaultValue="championnat">
        <TabsList className="grid w-full grid-cols-2 max-w-lg mx-auto mb-8">
            <TabsTrigger value="championnat">Championnat</TabsTrigger>
            <TabsTrigger value="coupe">Coupe du Maire</TabsTrigger>
        </TabsList>
        <TabsContent value="championnat">
            <Card>
                <CardHeader>
                    <CardTitle>Phases Finales - Championnat</CardTitle>
                    <CardDescription>Gérez les matchs, des quarts de finale jusqu'à la consécration du champion.</CardDescription>
                </CardHeader>
                <CardContent>
                    <BracketEditor bracket={data.championnat} teams={teams} onUpdate={handleBracketUpdate} competition="championnat" />
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="coupe">
             <Card>
                <CardHeader>
                    <CardTitle>Phases Finales - Coupe du Maire</CardTitle>
                    <CardDescription>Gérez le parcours des équipes dans la prestigieuse Coupe du Maire.</CardDescription>
                </CardHeader>
                <CardContent>
                    <BracketEditor bracket={data.coupe} teams={teams} onUpdate={handleBracketUpdate} competition="coupe" />
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>

    </div>
  );
}
