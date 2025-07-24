// src/components/StatisticsClientPage.tsx
'use client';

import PlayerRankingCard from '@/components/PlayerRankingCard';
import MatchResultCard from '@/components/MatchResultCard';
import { Medal, Star, Trophy, Award, Forward } from 'lucide-react';
import type { NavetaneStatsPublicView } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import Image from 'next/image';
import type { TeamData } from '@/types';

type StatisticsClientPageProps = NavetaneStatsPublicView;

const MatchTeamDisplay = ({ teamData }: { teamData?: TeamData }) => {
    if (!teamData || !teamData.name) return <div className="font-bold w-full">À définir</div>;
    return (
        <div className="flex items-center gap-2 font-bold w-full">
            {teamData.logoUrl && <Image src={teamData.logoUrl} alt={`Logo ${teamData.name}`} width={24} height={24} className="rounded-full object-cover" />}
            <span className="truncate" title={teamData.name}>{teamData.name}</span>
        </div>
    );
}

export default function StatisticsClientPage({
    ballonDor,
    goldenBoy,
    topScorersChampionnat,
    topScorersCoupe,
    lastResults,
    upcomingMatches,
    preliminaryMatch
}: StatisticsClientPageProps) {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 fade-in">
      <header className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">Palmarès et Statistiques</h1>
        <p className="mt-4 text-lg max-w-2xl mx-auto text-muted-foreground">
          Suivez les performances individuelles et collectives de la saison Navétane.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
            <PlayerRankingCard 
                title="Ballon d'Or"
                players={ballonDor}
                icon={Medal}
                description="Classement des meilleurs joueurs de la compétition."
                unit="points"
            />
            <PlayerRankingCard 
                title="Golden Boy (U20)"
                players={goldenBoy}
                icon={Star}
                description="Classement des meilleurs jeunes talents (moins de 20 ans)."
                unit="points"
            />
            <Card>
                 <CardHeader>
                    <div className="flex items-center gap-3">
                        <Trophy className="w-6 h-6 text-primary" />
                        <CardTitle className="font-headline text-2xl">Meilleurs Buteurs</CardTitle>
                    </div>
                    <CardDescription>Basculez entre le Championnat et la Coupe du Maire pour voir les classements.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="championnat">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="championnat">Championnat</TabsTrigger>
                            <TabsTrigger value="coupe">Coupe du Maire</TabsTrigger>
                        </TabsList>
                        <TabsContent value="championnat" className="mt-4">
                           <PlayerRankingCard players={topScorersChampionnat} unit="buts" />
                        </TabsContent>
                         <TabsContent value="coupe" className="mt-4">
                           <PlayerRankingCard players={topScorersCoupe} unit="buts" />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
        
        <div className="space-y-8 lg:sticky lg:top-8">
            {preliminaryMatch && preliminaryMatch.teamAData && (
                 <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                        <Award className="w-5 h-5 text-primary" />
                        <CardTitle className="font-headline text-xl">Match Préliminaire</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center gap-4 p-4 bg-muted/30 rounded-lg border-2 border-dashed">
                            <div className="flex items-center justify-between p-3 bg-card rounded-md shadow-inner min-w-[280px]">
                                <MatchTeamDisplay teamData={preliminaryMatch.teamAData} />
                                <span className="mx-4 text-primary font-bold text-lg">VS</span>
                                <MatchTeamDisplay teamData={preliminaryMatch.teamBData} />
                            </div>
                            <Forward className="h-6 w-6 text-muted-foreground rotate-90 md:rotate-0" />
                            <div className="font-bold text-center flex items-center gap-2">
                                Vainqueur vs <MatchTeamDisplay teamData={preliminaryMatch.winnerPlaysAgainstData} />
                            </div>
                       </div>
                    </CardContent>
                </Card>
            )}

            <MatchResultCard 
                title="Derniers Résultats"
                matches={lastResults}
            />
            <MatchResultCard 
                title="Matchs à Venir"
                matches={upcomingMatches}
                isUpcoming
            />
        </div>
      </div>
    </div>
  );
}
