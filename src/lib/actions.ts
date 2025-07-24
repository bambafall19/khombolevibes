
// src/lib/actions.ts
'use server';

import {
  getArticles,
  getNavetanePageData,
  getNavetaneStatsPageData,
  getPublicSponsors,
} from './data';
import type { Poll, Comment } from '@/types';
import { db } from './firebase';
import { doc, runTransaction, getDoc, collection, query, where, getDocs, Timestamp, orderBy } from 'firebase/firestore';


// This action runs on the server and can safely access the database.
export async function getHomePageData() {
  const [articles, navetaneData, statsData, sponsorsData] = await Promise.all([
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


export async function voteOnPoll(pollId: string, optionId: string): Promise<Poll> {
  if (!pollId || !optionId) {
    throw new Error('Poll ID and Option ID are required.');
  }
  const pollRef = doc(db, "polls", pollId);

  try {
    const updatedPoll = await runTransaction(db, async (transaction) => {
      const pollDoc = await transaction.get(pollRef);
      if (!pollDoc.exists()) {
        throw new Error("Sondage introuvable.");
      }

      const currentPollData = pollDoc.data();
      
      const newOptions = currentPollData.options.map((option: any) => {
        if (option.id === optionId) {
          return { ...option, votes: option.votes + 1 };
        }
        return option;
      });

      const newTotalVotes = currentPollData.totalVotes + 1;

      transaction.update(pollRef, {
        options: newOptions,
        totalVotes: newTotalVotes,
      });
      
      return {
          id: pollId,
          ...currentPollData,
          options: newOptions,
          totalVotes: newTotalVotes,
      } as Poll;
    });
    
    return updatedPoll;

  } catch (e) {
    console.error("Transaction de vote échouée: ", e);
    throw new Error("Impossible d'enregistrer le vote.");
  }
}
