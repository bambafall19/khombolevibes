// src/components/MatchResultCard.tsx
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Match } from '@/types';
import { Calendar, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';

type MatchResultCardProps = {
  title: string;
  matches: Match[];
  isUpcoming?: boolean;
};

const TeamDisplay = ({ name, logoUrl }: { name: string, logoUrl?: string }) => (
    <div className="flex items-center gap-2">
        {logoUrl && <Image src={logoUrl} alt={`Logo ${name}`} width={20} height={20} className="rounded-full object-cover" />}
        <span className="font-semibold">{name || 'À définir'}</span>
    </div>
);

export default function MatchResultCard({ title, matches, isUpcoming = false }: MatchResultCardProps) {
  const Icon = isUpcoming ? Calendar : ShieldCheck;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-primary" />
          <CardTitle className="font-headline text-xl">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {matches.length > 0 ? (
          <ul className="space-y-4">
            {matches.map((match, index) => (
              <li key={index}>
                {isUpcoming ? (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                        <TeamDisplay name={match.teamA} logoUrl={match.teamALogoUrl} />
                        <span className="text-primary font-bold">VS</span>
                        <TeamDisplay name={match.teamB} logoUrl={match.teamBLogoUrl} />
                    </div>
                    {match.date && <div className="text-xs text-muted-foreground">{match.date}</div>}
                  </div>
                ) : (
                  <div className="flex justify-between items-center font-medium text-sm">
                    <TeamDisplay name={match.teamA} logoUrl={match.teamALogoUrl} />
                    <span className="font-bold text-lg bg-muted px-3 py-1 rounded-md">{match.scoreA} - {match.scoreB}</span>
                    <TeamDisplay name={match.teamB} logoUrl={match.teamBLogoUrl} />
                  </div>
                )}
                {index < matches.length - 1 && <Separator className="mt-4" />}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">Aucun match pour le moment.</p>
        )}
      </CardContent>
    </Card>
  );
}
