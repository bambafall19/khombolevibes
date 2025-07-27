import { WifiOff } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hors Connexion',
};

export default function OfflinePage() {
  return (
    <div className="container mx-auto flex h-full flex-col items-center justify-center text-center">
        <WifiOff className="h-24 w-24 text-muted-foreground" />
        <h1 className="mt-8 text-4xl font-bold">Vous êtes hors ligne</h1>
        <p className="mt-4 text-lg text-muted-foreground">
            Il semble que vous n'ayez pas de connexion internet.
        </p>
        <p className="text-muted-foreground">
            Les pages que vous avez déjà visitées devraient être accessibles.
        </p>
    </div>
  );
}
