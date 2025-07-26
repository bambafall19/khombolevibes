// src/app/statistiques/palmares/page.tsx
import { getNavetaneStatsPageData } from '@/lib/data';
import StatisticsClientPage from '@/components/StatisticsClientPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Palmarès Navétane',
  description: 'Découvrez les classements, les meilleurs buteurs, et les résultats des matchs de la saison Navétane à Khombole.',
};

export const revalidate = 60; // Revalidate every 60 seconds

export default async function NavetanePalmaresPage() {
    // Fetch data on the server, this is secure
    const stats = await getNavetaneStatsPageData();
    
    return (
        <StatisticsClientPage
            ballonDor={stats.ballonDor || []}
            goldenBoy={stats.goldenBoy || []}
            topScorersChampionnat={stats.topScorersChampionnat || []}
            topScorersCoupe={stats.topScorersCoupe || []}
            lastResults={stats.lastResults || []}
            upcomingMatches={stats.upcomingMatches || []}
            preliminaryMatch={stats.preliminaryMatch || null}
        />
    );
}
