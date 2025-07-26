// src/app/page.tsx
import { getHomePageData } from '@/lib/actions';
import HomePageClient from '@/components/HomePageClient';

// Add this to revalidate the page every 60 seconds
export const revalidate = 60;

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
