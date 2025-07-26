// src/app/navetane/page.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Shield, Award, Forward, GitBranch } from 'lucide-react';
import type { Metadata } from 'next';
import { cn } from '@/lib/utils';
import { getNavetanePageData } from '@/lib/data';
import type { NavetanePoule, BracketMatch, FinalsBracket, TeamData } from '@/types';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Navétane',
  description: 'Suivez les classements du championnat et les résultats de la Coupe du Maire de la saison Navétane à Khombole.',
};

export const revalidate = 60; // Revalidate every 60 seconds

const StandingTable = ({poule}: {poule: NavetanePoule}) => {
    // Qualification logic: 3 for Poule A & B, 2 for Poule C
    const qualifiedTeamsCount = (poule.name === 'Poule A' || poule.name === 'Poule B') ? 3 : 2;

    return (
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
                <CardTitle className="font-headline text-2xl">{poule.name}</CardTitle>
            </CardHeader>
            <CardContent>
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
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {(poule.teams || []).sort((a,b) => b.pts - a.pts).map((row, index) => {
                            const isQualified = index < qualifiedTeamsCount;
                            return (
                                <TableRow key={row.id} className={cn(isQualified && "bg-primary/10")}>
                                    <TableCell className={cn("font-semibold flex items-center gap-2", isQualified && "text-primary")}>
                                        {row.logoUrl && <Image src={row.logoUrl} alt={`Logo ${row.team}`} width={24} height={24} className="rounded-full object-cover" />}
                                        <span>{row.team}</span>
                                    </TableCell>
                                    <TableCell className={cn("font-bold text-center", isQualified && "text-primary")}>{row.pts}</TableCell>
                                    <TableCell className="text-center">{row.j}</TableCell>
                                    <TableCell className="text-center">{row.g}</TableCell>
                                    <TableCell className="text-center">{row.n}</TableCell>
                                    <TableCell className="text-center">{row.p}</TableCell>
                                    <TableCell className="text-center">{row.db}</TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

const MatchTeamDisplay = ({ teamData }: { teamData?: TeamData }) => {
    if (!teamData || !teamData.name) return <div className="font-bold w-full text-muted-foreground">À définir</div>;
    return (
        <div className="flex items-center gap-2 font-bold w-full">
            {teamData.logoUrl && <Image src={teamData.logoUrl} alt={`Logo ${teamData.name}`} width={24} height={24} className="rounded-full object-cover" />}
            <span className="truncate" title={teamData.name}>{teamData.name}</span>
        </div>
    );
}

const BracketMatchDisplay = ({ match, title }: { match: BracketMatch, title: string }) => {
    return (
        <Card className="p-3">
            <CardDescription className="text-center mb-2 font-semibold uppercase text-xs">{title}</CardDescription>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        {match.teamALogoUrl && <Image src={match.teamALogoUrl} alt={match.teamAName || ''} width={16} height={16} className="rounded-full"/>}
                        <span>{match.teamAName || 'À déterminer'}</span>
                    </div>
                    <span className="font-bold">{match.scoreA ?? '-'}</span>
                </div>
                 <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        {match.teamBLogoUrl && <Image src={match.teamBLogoUrl} alt={match.teamBName || ''} width={16} height={16} className="rounded-full"/>}
                        <span>{match.teamBName || 'À déterminer'}</span>
                    </div>
                    <span className="font-bold">{match.scoreB ?? '-'}</span>
                </div>
                <div className="text-center text-muted-foreground text-xs pt-1">{match.date || 'Date à venir'}</div>
            </div>
        </Card>
    )
};

const BracketColumn = ({ children, title }: { children: React.ReactNode, title: string }) => (
    <div className="flex flex-col items-center gap-4 flex-1">
        <h4 className="font-headline text-lg">{title}</h4>
        <div className="space-y-4 w-full max-w-xs">{children}</div>
    </div>
);

const FinalsBracketDisplay = ({ bracket, title, description }: { bracket: FinalsBracket, title: string, description: string }) => (
    <Card className="w-full">
        <CardHeader>
            <div className="flex items-center gap-3">
                <GitBranch className="h-6 w-6 text-primary"/>
                <CardTitle className="font-headline text-2xl">{title}</CardTitle>
            </div>
            <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col lg:flex-row justify-between gap-8 p-6 overflow-x-auto">
            {bracket.quarters.length > 0 && 
                <BracketColumn title="Quarts de Finale">
                    {bracket.quarters.map((match, i) => <BracketMatchDisplay key={match.id} match={match} title={`Quart ${i+1}`} />)}
                </BracketColumn>
            }
             {bracket.semis.length > 0 && 
                <BracketColumn title="Demi-Finales">
                    {bracket.semis.map((match, i) => <BracketMatchDisplay key={match.id} match={match} title={`Demi-Finale ${i+1}`} />)}
                </BracketColumn>
            }
             {bracket.final.length > 0 &&
                <BracketColumn title="Finale">
                    {bracket.final.map((match, i) => <BracketMatchDisplay key={match.id} match={match} title={`Finale ${i+1}`} />)}
                </BracketColumn>
             }
             {bracket.quarters.length === 0 && bracket.semis.length === 0 && bracket.final.length === 0 &&
                <p className="text-muted-foreground text-center w-full py-8">Les matchs des phases finales seront bientôt disponibles.</p>
             }
        </CardContent>
    </Card>
)

export default async function NavetanePage() {
  const { navetaneData, finalsData } = await getNavetanePageData();
  const { poules, coupeMatches, preliminaryMatch } = navetaneData;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 fade-in">
      <header className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">Navétane Saison 2025</h1>
        <p className="mt-4 text-lg max-w-2xl mx-auto text-muted-foreground">
          Toute l'actualité des compétitions de quartier de Khombole.
        </p>
      </header>

      <Tabs defaultValue="championnat" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto h-auto">
          <TabsTrigger value="championnat" className="py-2.5 text-base">
            <Trophy className="w-5 h-5 mr-2" /> Poules
          </TabsTrigger>
          <TabsTrigger value="coupe-du-maire" className="py-2.5 text-base">
            <Shield className="w-5 h-5 mr-2" /> Coupe du Maire
          </TabsTrigger>
           <TabsTrigger value="phases-finales" className="py-2.5 text-base">
            <GitBranch className="w-5 h-5 mr-2" /> Phases Finales
          </TabsTrigger>
        </TabsList>

        <TabsContent value="championnat" className="mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {poules && poules.length > 0 ? (
                  poules.map((poule) => <StandingTable key={poule.id} poule={poule} />)
                ) : (
                  <p className="text-center col-span-full py-16 text-muted-foreground">Les classements du championnat seront bientôt disponibles.</p>
                )}
            </div>
        </TabsContent>

        <TabsContent value="coupe-du-maire" className="mt-8">
            <Card className="max-w-4xl mx-auto shadow-xl">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit mb-4">
                        <Award className="w-8 h-8" />
                    </div>
                    <CardTitle className="font-headline text-3xl">Tirage de la Coupe du Maire</CardTitle>
                    <CardDescription>Affiches du tournoi.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 p-6">
                    {preliminaryMatch && preliminaryMatch.teamAData?.name ? (
                       <div className="md:col-span-2 flex flex-col md:flex-row items-center justify-center gap-4 p-4 bg-muted/30 rounded-lg border-2 border-dashed">
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
                    ) : null}

                    {coupeMatches && coupeMatches.length > 0 ? coupeMatches.map((match) => (
                        <div key={match.id} className="flex items-center justify-center p-4 bg-muted/50 rounded-lg border transition-all hover:bg-muted/80 hover:shadow-md">
                            <div className="w-2/5 text-right">
                                <MatchTeamDisplay teamData={match.teamAData} />
                            </div>
                            <span className="mx-4 text-primary font-bold text-lg">VS</span>
                            <div className="w-2/5 text-left">
                                <MatchTeamDisplay teamData={match.teamBData} />
                            </div>
                        </div>
                    )) : (
                       (!preliminaryMatch || !preliminaryMatch.teamAData?.name) && <p className="text-center col-span-full py-16 text-muted-foreground">Les matchs de la coupe seront bientôt disponibles.</p>
                    )}
                </CardContent>
            </Card>
        </TabsContent>
        
        <TabsContent value="phases-finales" className="mt-8 space-y-8">
            <FinalsBracketDisplay
                bracket={finalsData.championnat}
                title="Phases Finales - Championnat"
                description="Suivez l'avancement du tournoi, des quarts de finale jusqu'à la consécration du champion."
            />
            <FinalsBracketDisplay
                bracket={finalsData.coupe}
                title="Phases Finales - Coupe du Maire"
                description="Le parcours des équipes dans la prestigieuse Coupe du Maire."
            />
        </TabsContent>
      </Tabs>
    </div>
  );
}
