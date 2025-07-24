// src/components/PollWidget.tsx
'use client';

import { useState, useEffect, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';
import { voteOnPoll } from '@/lib/actions';
import type { Poll, PollOption } from '@/types';
import { Vote, Loader2, BarChartHorizontal } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

export default function PollWidget({ initialPoll }: { initialPoll: Poll }) {
  const [poll, setPoll] = useState<Poll>(initialPoll);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    // Each poll is now prefixed with its ID to avoid conflicts
    const votedPolls = JSON.parse(localStorage.getItem('votedPolls') || '[]');
    if (votedPolls.includes(poll.id)) {
      setHasVoted(true);
    }
  }, [poll.id]);
  
  const handleVote = () => {
    if (!selectedOption) {
      toast({
        variant: 'destructive',
        title: 'Aucune option sélectionnée',
        description: 'Veuillez choisir une option avant de voter.',
      });
      return;
    }

    startTransition(async () => {
      try {
        const updatedPoll = await voteOnPoll(poll.id, selectedOption);
        setPoll(updatedPoll);
        setHasVoted(true);
        const votedPolls = JSON.parse(localStorage.getItem('votedPolls') || '[]');
        localStorage.setItem('votedPolls', JSON.stringify([...votedPolls, poll.id]));
        toast({ title: 'Vote enregistré !', description: 'Merci pour votre participation.' });
      } catch (error) {
        toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de voter' });
      }
    });
  };

  const PollResults = ({ options, totalVotes }: { options: PollOption[], totalVotes: number }) => (
    <div className="space-y-3">
        {options.sort((a,b) => b.votes - a.votes).map(option => {
            const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
            return (
                <div key={option.id} className="text-sm">
                    <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">{option.text}</span>
                        <span className="text-muted-foreground">{option.votes} ({Math.round(percentage)}%)</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                        <div className="bg-primary h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                    </div>
                </div>
            )
        })}
        <p className="text-xs text-muted-foreground text-right pt-2">Total de {totalVotes} votes</p>
    </div>
  );

  return (
    <Card className="shadow-lg border-primary/20 bg-accent">
      <CardHeader>
        <div className="flex items-center gap-3">
            <Vote className="w-6 h-6 text-primary"/>
            <CardTitle className="font-headline text-2xl">Sondage</CardTitle>
        </div>
        <CardDescription>{poll.question}</CardDescription>
      </CardHeader>
      <CardContent>
        {hasVoted ? (
            <PollResults options={poll.options} totalVotes={poll.totalVotes} />
        ) : (
            <div className="space-y-4">
                <RadioGroup onValueChange={setSelectedOption} value={selectedOption || ''}>
                    {poll.options.map(option => (
                        <div key={option.id} className="flex items-center space-x-2">
                            <RadioGroupItem value={option.id} id={`option-${option.id}`} />
                            <Label htmlFor={`option-${option.id}`} className="flex-1 cursor-pointer">{option.text}</Label>
                        </div>
                    ))}
                </RadioGroup>
                <Button onClick={handleVote} disabled={isPending} className="w-full">
                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BarChartHorizontal className="mr-2 h-4 w-4"/>}
                    {isPending ? 'Vote en cours...' : 'Voter'}
                </Button>
            </div>
        )}
      </CardContent>
    </Card>
  );
}

PollWidget.Skeleton = function PollWidgetSkeleton() {
    return (
        <Card>
            <CardHeader>
                 <div className="flex items-center gap-3">
                    <Vote className="w-6 h-6 text-muted-foreground"/>
                    <Skeleton className="h-7 w-32" />
                </div>
                <Skeleton className="h-5 w-full mt-2" />
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-4/5" />
                </div>
                 <div className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-3/5" />
                </div>
                 <div className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-4/5" />
                </div>
                <Skeleton className="h-10 w-full" />
            </CardContent>
        </Card>
    )
}
