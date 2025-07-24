
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

export async function getPollForArticle(articleId: string): Promise<Poll | null> {
    const pollsCollection = collection(db, 'polls');
    const q = query(pollsCollection, where('articleId', '==', articleId));
    
    try {
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return null;
        }
        const pollDoc = snapshot.docs[0];
        return { id: pollDoc.id, ...pollDoc.data() } as Poll;

    } catch (error) {
        console.error("Error fetching poll for article:", error);
        // This can happen if the required index is not created in Firestore.
        // Return null to allow the page to render without a poll.
        return null;
    }
}


export async function getCommentsForArticle(articleId: string): Promise<Comment[]> {
    const commentsCollection = collection(db, 'comments');
    const q = query(
      commentsCollection,
      where('articleId', '==', articleId),
    );

    try {
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          return [];
        }
        
        const comments = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
          } as Comment;
        });

        // Sort comments manually after fetching to avoid complex Firestore indexes
        comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        return comments;

    } catch (error) {
        console.error("Error fetching comments:", error);
        return [];
    }
}
