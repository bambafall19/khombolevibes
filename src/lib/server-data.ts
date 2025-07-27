// src/lib/server-data.ts
'use server';

import { getArticles, getNavetanePageData, getNavetaneStatsPageData, getPublicSponsors } from './data';
import type { NavetanePublicView, SponsorPublicView, NavetaneStatsPublicView } from '@/types';

// This function converts Firebase Timestamps within an object to ISO strings
const convertTimestamps = (obj: any): any => {
  if (!obj) return obj;
  if (typeof obj.toDate === 'function') { // Check if it's a Firestore Timestamp
    return obj.toDate().toISOString();
  }
  if (Array.isArray(obj)) {
    return obj.map(convertTimestamps);
  }
  if (typeof obj === 'object') {
    const newObj: { [key: string]: any } = {};
    for (const key in obj) {
      newObj[key] = convertTimestamps(obj[key]);
    }
    return newObj;
  }
  return obj;
};


// This action runs on the server and can safely access the database.
export async function getHomePageData() {
  const [articles, {navetaneData}, statsData, sponsorsData] = await Promise.all([
    getArticles(),
    getNavetanePageData(),
    getNavetaneStatsPageData(),
    getPublicSponsors(),
  ]);

  // Ensure all data passed to the client is serializable
  const serializableNavData: NavetanePublicView = JSON.parse(JSON.stringify(navetaneData));
  const serializableStatsData: NavetaneStatsPublicView = JSON.parse(JSON.stringify(statsData));
  const serializableSponsors: SponsorPublicView = JSON.parse(JSON.stringify(sponsorsData));

  return {
    articles,
    navetaneData: serializableNavData,
    statsData: serializableStatsData,
    sponsors: serializableSponsors.sponsors,
  };
}