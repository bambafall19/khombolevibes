// src/components/PlayerRankingCard.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { PlayerRank } from '@/types';
import type { LucideIcon } from 'lucide-react';
import Image from 'next/image';

type PlayerRankingCardProps = {
  title?: string;
  description?: string;
  players: PlayerRank[];
  icon?: LucideIcon;
  unit: string;
};

export default function PlayerRankingCard({ title, description, players, icon: Icon, unit }: PlayerRankingCardProps) {
  const cardContent = (
    players.length > 0 ? (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>Joueur</TableHead>
            <TableHead>Équipe</TableHead>
            <TableHead className="text-right">{unit}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.map((player) => {
            const isTopRank = player.rank <= 3;
            return (
              <TableRow key={player.rank} className={cn(isTopRank && "bg-primary/5")}>
                <TableCell className={cn("font-bold", isTopRank && "text-primary")}>{player.rank}</TableCell>
                <TableCell className="font-medium">{player.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  <div className="flex items-center gap-2">
                    {player.teamLogoUrl && (
                      <Image 
                        src={player.teamLogoUrl}
                        alt={`Logo ${player.teamName}`}
                        width={20}
                        height={20}
                        className="rounded-full object-cover"
                      />
                    )}
                    <span>{player.teamName || player.teamId}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-bold">{player.points}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    ) : (
      <p className="text-sm text-muted-foreground text-center py-4">Aucune donnée pour le moment.</p>
    )
  );

  if (!title) {
      return <div className="p-0">{cardContent}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
            {Icon && <Icon className="w-6 h-6 text-primary" />}
            <CardTitle className="font-headline text-2xl">{title}</CardTitle>
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {cardContent}
      </CardContent>
    </Card>
  );
}
