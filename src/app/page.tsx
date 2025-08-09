// src/app/page.tsx
import { getHomePageData } from '@/lib/server-data';
import HomePageClient from '@/components/HomePageClient';

// This forces the page to be dynamically rendered, ensuring fresh data.
export const dynamic = 'force-dynamic';

export default async function Home() {
  // Fetch data on the server, securely
  const { articles, navetaneData, statsData, sponsors } = await getHomePageData();
  
  return (
    <HomePageClient
      articles={articles}
      navetaneData={navetaneData}
      statsData={statsData}
      sponsors={sponsors}
    />
  );
}
