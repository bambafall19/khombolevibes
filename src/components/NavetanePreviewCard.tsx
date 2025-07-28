// src/components/NavetanePreviewCard.tsx

import type { NavetanePoule } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Dribbble, ArrowRight } from "lucide-react";
import Image from "next/image";
import { Button } from "./ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function NavetanePreviewCard({ poule }: { poule: NavetanePoule }) {
    if (!poule) return null;

    const topTeams = (poule.teams || []).sort((a,b) => b.pts - a.pts).slice(0, 4);

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <Dribbble className="w-6 h-6 text-primary"/>
                    <CardTitle className="font-headline text-2xl">Navétane</CardTitle>
                </div>
                <CardDescription>Classement de la {poule.name}</CardDescription>
            </CardHeader>
            <CardContent>
                <ul className="space-y-3">
                    {topTeams.map((team, index) => (
                        <li key={team.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-3">
                                <span className={cn("font-bold w-6 text-center", index < 2 ? "text-primary" : "text-muted-foreground")}>{index + 1}</span>
                                {team.logoUrl && <Image src={team.logoUrl} alt={team.team} width={24} height={24} className="rounded-full object-cover"/>}
                                <span className="font-medium truncate">{team.team}</span>
                            </div>
                            <span className="font-bold">{team.pts} pts</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
            <CardFooter>
                <Button asChild variant="secondary" className="w-full">
                    <Link href="/navetane">
                        Voir tout le classement
                        <ArrowRight className="w-4 h-4 ml-2"/>
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    )
}
