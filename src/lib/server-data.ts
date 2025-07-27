// src/lib/server-data.ts
'use server';

import { getArticles, getNavetanePageData, getNavetaneStatsPageData, getPublicSponsors } from './data';

// This action runs on the server and can safely access the database.
export async function getHomePageData() {
  const [articles, {navetaneData}, statsData, sponsorsData] = await Promise.all([
    getArticles(),
    getNavetanePageData(),
    getNavetaneStatsPageData(),
    getPublicSponsors(),
  ]);

  return {
    articles,
    navetaneData,
    statsData,
    sponsors: sponsorsData.sponsors,
  };
}
