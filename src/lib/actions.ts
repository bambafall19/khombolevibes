// src/lib/actions.ts
'use server';

import { collection, getDocs, doc, getDoc, query, where, orderBy, addDoc, updateDoc, deleteDoc, serverTimestamp, Timestamp, setDoc, writeBatch, runTransaction } from 'firebase/firestore';
import { revalidateTag } from 'next/cache';
import { db } from './firebase';
import { getCategories, getTeams, getSponsors, getAdminNavetanePoules, getAdminNavetaneCoupeMatches, getAdminPreliminaryMatch, getAdminFinalsData, generateExcerpt, getArticles, getNavetanePageData, getNavetaneStatsPageData, getPublicSponsors } from './data';
import type { Article, Category, Media, NavetanePoule, NavetaneCoupeMatch, Team, NavetanePreliminaryMatch, Comment, NavetanePublicView, NavetaneStats, PlayerRank, Match, TeamData, Sponsor, SponsorPublicView, NavetaneStatsPublicView, CompetitionFinals, FinalsBracket, BracketMatch, Poll, PollOption, NavetaneTeam } from '@/types';
import { nanoid } from 'nanoid';

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

    // Revalidate the path of the article associated with the poll
    revalidateTag('articles');
    
    return updatedPoll;

  } catch (e) {
    console.error("Transaction de vote échouée: ", e);
    throw new Error("Impossible d'enregistrer le vote.");
  }
}

// --- Category Management Actions ---
export async function addCategory(category: Omit<Category, 'id'>) {
    const docRef = await addDoc(collection(db, 'categories'), category);
    revalidateTag('categories');
    return docRef;
}

export async function updateCategory(id: string, category: Partial<Category>) {
    const categoryRef = doc(db, 'categories', id);
    await updateDoc(categoryRef, category);
    revalidateTag('categories');
}

export async function deleteCategory(id: string) {
    const categoryRef = doc(db, 'categories', id);
    await deleteDoc(categoryRef);
    revalidateTag('categories');
}

// --- Article Management Actions ---
export async function addArticle(articleData: Omit<Article, 'id' | 'publishedAt' | 'category' | 'excerpt' | 'pollId'> & { categoryId: string }) {
    const categories = await getCategories();
    const category = categories.find(c => c.id === articleData.categoryId);
    if (!category) throw new Error("Category not found");

    const newArticleData: Omit<Article, 'id' | 'publishedAt'> = {
        ...articleData,
        slug: articleData.slug || articleData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
        category: { id: category.id, name: category.name, slug: category.slug, order: category.order },
        excerpt: generateExcerpt(articleData.content),
    };
    
    const dataToSave = {
        ...newArticleData,
        publishedAt: serverTimestamp(),
    };

    const articleDocRef = await addDoc(collection(db, 'articles'), dataToSave);
    revalidateTag('articles');
    return { id: articleDocRef.id };
}

export async function updateArticle(id: string, articleData: Partial<Omit<Article, 'id' | 'category' | 'excerpt' | 'publishedAt' | 'pollId'> & { categoryId: string }>) {
    const articleRef = doc(db, 'articles', id);
    let updatedData: any = { ...articleData };
    
    if (articleData.categoryId) {
        const categories = await getCategories();
        const category = categories.find(c => c.id === articleData.categoryId);
        if (!category) throw new Error("Category not found");
        updatedData.category = { id: category.id, name: category.name, slug: category.slug, order: category.order };
    }
    delete updatedData.categoryId;
    
    if (articleData.content) {
        updatedData.excerpt = generateExcerpt(articleData.content);
    }
    
    // Explicitly handle empty optional image URL
    if ('imageUrl2' in articleData && articleData.imageUrl2 === '') {
        updatedData.imageUrl2 = null;
    }

    await updateDoc(articleRef, updatedData);
    revalidateTag('articles');
}

export async function deleteArticle(id: string) {
    const batch = writeBatch(db);
    const articleRef = doc(db, 'articles', id);
    
    const articleSnap = await getDoc(articleRef);
    const articleData = articleSnap.data();

    if (articleData?.pollId) {
        const pollRef = doc(db, 'polls', articleData.pollId);
        batch.delete(pollRef);
    }
    
    batch.delete(articleRef);
    await batch.commit();
    revalidateTag('articles');
}

// --- Poll Management Actions ---
export async function addPoll(pollData: Omit<Poll, 'id' | 'options' | 'totalVotes'> & { options: { text: string }[] }) {
    const batch = writeBatch(db);
    
    const pollDocRef = doc(collection(db, 'polls'));
    const newPoll: Omit<Poll, 'id'> = {
        articleId: pollData.articleId,
        question: pollData.question,
        options: pollData.options.map(opt => ({ id: nanoid(10), text: opt.text, votes: 0 })),
        totalVotes: 0,
    };
    batch.set(pollDocRef, newPoll);

    const articleRef = doc(db, 'articles', pollData.articleId);
    batch.update(articleRef, { pollId: pollDocRef.id });
    
    await batch.commit();
    revalidateTag('articles');
    return pollDocRef;
}

export async function updatePoll(id: string, pollData: Omit<Poll, 'id' | 'options' | 'totalVotes'> & { options: { text: string }[] }) {
     const batch = writeBatch(db);
     const pollRef = doc(db, 'polls', id);

    const existingPollSnap = await getDoc(pollRef);
    const existingPoll = existingPollSnap.data();
    const existingOptionsMap = new Map(existingPoll?.options.map((opt: PollOption) => [opt.text, opt]));

     const updatedPoll = {
        articleId: pollData.articleId,
        question: pollData.question,
        options: pollData.options.map(opt => {
            const existing = existingOptionsMap.get(opt.text);
            return { 
                id: existing?.id || nanoid(10), 
                text: opt.text, 
                votes: existing?.votes || 0 
            };
        }),
     };
     
    const totalVotes = updatedPoll.options.reduce((sum, opt) => sum + opt.votes, 0);

    batch.update(pollRef, { ...updatedPoll, totalVotes });
     
    if (existingPoll && existingPoll.articleId !== pollData.articleId) {
        const oldArticleRef = doc(db, 'articles', existingPoll.articleId);
        batch.update(oldArticleRef, { pollId: null });

        const newArticleRef = doc(db, 'articles', pollData.articleId);
        batch.update(newArticleRef, { pollId: id });
    }
     
    await batch.commit();
    revalidateTag('articles');
}

export async function deletePoll(id: string) {
    const batch = writeBatch(db);
    const pollRef = doc(db, 'polls', id);
    
    const pollSnap = await getDoc(pollRef);
    const pollData = pollSnap.data();

    if (pollData?.articleId) {
        const articleRef = doc(db, 'articles', pollData.articleId);
        batch.update(articleRef, { pollId: null });
    }

    batch.delete(pollRef);
    await batch.commit();
    revalidateTag('articles');
}

// --- Media Management Actions ---
export async function addMedia(media: Omit<Media, 'id' | 'createdAt'>) {
    const dataToSave = { ...media, createdAt: serverTimestamp() };
    const res = await addDoc(collection(db, 'media'), dataToSave);
    revalidateTag('media');
    return res;
}

export async function updateMedia(id: string, media: Partial<Omit<Media, 'id' | 'createdAt'>>) {
    const mediaRef = doc(db, 'media', id);
    const res = await updateDoc(mediaRef, media);
    revalidateTag('media');
    return res;
}

export async function deleteMedia(id: string) {
    const mediaRef = doc(db, 'media', id);
    const res = await deleteDoc(mediaRef);
    revalidateTag('media');
    return res;
}


// --- Comment Management Actions ---
export async function addComment(commentData: { articleId: string; name: string; content: string }): Promise<Comment> {
  const newComment = { ...commentData, createdAt: serverTimestamp() };
  const docRef = await addDoc(collection(db, 'comments'), newComment);
  
  revalidateTag('comments');

  return { ...commentData, id: docRef.id, createdAt: new Date().toISOString() };
}

// --- Team Management Actions ---
export async function addTeam(team: Omit<Team, 'id'>) {
    return await addDoc(collection(db, 'teams'), team);
}

export async function updateTeam(id: string, team: Partial<Team>) {
    const teamRef = doc(db, 'teams', id);
    return await updateDoc(teamRef, team);
}

export async function deleteTeam(id: string) {
    const teamRef = doc(db, 'teams', id);
    return await deleteDoc(teamRef);
}

// --- Sponsor Management Actions ---
export async function addSponsor(sponsor: Omit<Sponsor, 'id' | 'createdAt'>) {
    const dataToSave = { ...sponsor, createdAt: serverTimestamp() };
    return await addDoc(collection(db, 'sponsors'), dataToSave);
}

export async function deleteSponsor(id: string) {
    const sponsorRef = doc(db, 'sponsors', id);
    return await deleteDoc(sponsorRef);
}

// --- Publish Actions ---
export async function publishSponsors(): Promise<void> {
    try {
        const sponsors = await getSponsors();
        const publicData: Omit<SponsorPublicView, 'lastPublished'> & { lastPublished: any } = {
            sponsors,
            lastPublished: serverTimestamp(),
        };
        await setDoc(doc(db, 'sponsors_public_view', 'live'), publicData);
        revalidateTag('sponsors');
    } catch (e) {
        console.error("Failed to publish sponsors data", e);
        throw e;
    }
}

export async function publishNavetanePageData(): Promise<void> {
    try {
        const [poules, coupeMatches, allTeams, preliminaryMatch] = await Promise.all([
            getAdminNavetanePoules(),
            getAdminNavetaneCoupeMatches(),
            getTeams(),
            getAdminPreliminaryMatch(),
        ]);

        const teamsMap = new Map(allTeams.map(t => [t.name, { name: t.name, logoUrl: t.logoUrl }]));
        
        const addTeamData = (teamName?: string): TeamData | undefined => {
            if (!teamName) return undefined;
            const team = teamsMap.get(teamName);
            return team ? { name: team.name, logoUrl: team.logoUrl } : { name: teamName, logoUrl: '' };
        };

        const enrichedCoupeMatches = (coupeMatches || []).map(match => ({
            ...match,
            teamAData: addTeamData(match.teamA),
            teamBData: addTeamData(match.teamB),
        }));

        let enrichedPreliminaryMatch: NavetanePreliminaryMatch | null = null;
        if (preliminaryMatch && preliminaryMatch.teamA && preliminaryMatch.teamB && preliminaryMatch.winnerPlaysAgainst) {
            enrichedPreliminaryMatch = {
                ...preliminaryMatch,
                teamAData: addTeamData(preliminaryMatch.teamA) || { name: preliminaryMatch.teamA, logoUrl: '' },
                teamBData: addTeamData(preliminaryMatch.teamB) || { name: preliminaryMatch.teamB, logoUrl: '' },
                winnerPlaysAgainstData: addTeamData(preliminaryMatch.winnerPlaysAgainst) || { name: preliminaryMatch.winnerPlaysAgainst, logoUrl: '' },
            };
        }
        
        const publicData: Omit<NavetanePublicView, 'lastPublished'> & { lastPublished: any } = {
            poules,
            coupeMatches: enrichedCoupeMatches,
            preliminaryMatch: enrichedPreliminaryMatch,
            lastPublished: serverTimestamp(),
        };

        await setDoc(doc(db, 'navetane_public_views', 'live'), publicData);
        revalidateTag('navetane');

    } catch(e) {
        console.error("Failed to publish navetane data", e);
        throw e;
    }
}

export async function updateAndPublishNavetaneStat(stats: NavetaneStats) {
    await setDoc(doc(db, 'navetane_stats', 'admin_data'), stats, { merge: true });

    const allTeams = await getTeams();
    const teamsMapById = new Map(allTeams.map(t => [t.id, { name: t.name, logoUrl: t.logoUrl }]));
    const teamsMapByName = new Map(allTeams.map(t => [t.name, { name: t.name, logoUrl: t.logoUrl }]));

    const processPlayerRanks = (ranks: PlayerRank[]): PlayerRank[] => {
        if (!ranks) return [];
        return ranks.map(player => {
            const teamInfo = teamsMapById.get(player.teamId);
            return { ...player, teamName: teamInfo?.name || player.teamId, teamLogoUrl: teamInfo?.logoUrl || '' };
        }).filter(p => p.name && p.teamId);
    };

    const processMatches = (matches: Match[]): Match[] => {
        if (!matches) return [];
        return matches.map(match => {
            const teamAInfo = teamsMapByName.get(match.teamA);
            const teamBInfo = teamsMapByName.get(match.teamB);
            return { ...match, teamALogoUrl: teamAInfo?.logoUrl || '', teamBLogoUrl: teamBInfo?.logoUrl || '' };
        }).filter(m => m.teamA && m.teamB);
    };

    const processedStats: NavetaneStats = {
        ballonDor: processPlayerRanks(stats.ballonDor || []),
        goldenBoy: processPlayerRanks(stats.goldenBoy || []),
        topScorersChampionnat: processPlayerRanks(stats.topScorersChampionnat || []),
        topScorersCoupe: processPlayerRanks(stats.topScorersCoupe || []),
        lastResults: processMatches(stats.lastResults || []),
        upcomingMatches: processMatches(stats.upcomingMatches || []),
    };
    
    await setDoc(doc(db, 'navetane_stats', 'public_view'), processedStats, { merge: true });
    revalidateTag('stats');
}

export async function publishFinalsData(): Promise<void> {
    const adminData = await getAdminFinalsData();
    const teams = await getTeams();
    const teamsMap = new Map(teams.map(t => [t.id, t]));

    const enrichBracket = (bracket: FinalsBracket): FinalsBracket => {
        const enrichStage = (stage: BracketMatch[]): BracketMatch[] => {
            if (!Array.isArray(stage)) return [];
            return stage.map(match => {
                if (!match) return null;
                const teamA = match.teamAId ? teamsMap.get(match.teamAId) : undefined;
                const teamB = match.teamBId ? teamsMap.get(match.teamBId) : undefined;
                return { ...match, teamAName: teamA?.name, teamALogoUrl: teamA?.logoUrl, teamBName: teamB?.name, teamBLogoUrl: teamB?.logoUrl };
            }).filter((m): m is BracketMatch => !!m);
        };
        
        return { quarters: enrichStage(bracket.quarters), semis: enrichStage(bracket.semis), final: enrichStage(bracket.final) };
    };

    const publicData: CompetitionFinals = {
        championnat: enrichBracket(adminData.championnat),
        coupe: enrichBracket(adminData.coupe),
    };

    await setDoc(doc(db, 'finals_public_view', 'live'), publicData);
    revalidateTag('navetane');
}


// --- Navetane Admin Actions ---
export async function addNavetanePoule(poule: Omit<NavetanePoule, 'id' | 'teams'>) {
    return await addDoc(collection(db, 'navetane_poules'), { ...poule, teams: [] });
}

export async function updateNavetanePoule(id: string, pouleData: Partial<Omit<NavetanePoule, 'id'>>) {
    const pouleRef = doc(db, 'navetane_poules', id);

    const dataToUpdate: { [key: string]: any } = {};

    if (pouleData.name) {
        dataToUpdate.name = pouleData.name;
    }
    
    if (pouleData.teams) {
        dataToUpdate.teams = pouleData.teams.map(({ id, team, logoUrl, pts, j, g, n, p, db }) => ({
             id, team, logoUrl: logoUrl || '',
             pts: pts || 0, j: j || 0, g: g || 0,
             n: n || 0, p: p || 0, db: db || '0'
        }));
    }
    
    if (Object.keys(dataToUpdate).length === 0) {
        console.warn("Update called with no data to update for poule:", id);
        return;
    }

    return await updateDoc(pouleRef, dataToUpdate);
}

export async function deleteNavetanePoule(id: string) {
    return await deleteDoc(doc(db, 'navetane_poules', id));
}

export async function addNavetaneCoupeMatch(match: Omit<NavetaneCoupeMatch, 'id' | 'teamAData' | 'teamBData'>) {
    return await addDoc(collection(db, 'navetane_coupe_matches'), { ...match });
}

export async function updateNavetaneCoupeMatch(id: string, match: Partial<Omit<NavetaneCoupeMatch, 'id' | 'teamAData' | 'teamBData'>>) {
    return await updateDoc(doc(db, 'navetane_coupe_matches', id), { ...match });
}

export async function deleteNavetaneCoupeMatch(id: string) {
    return await deleteDoc(doc(db, 'navetane_coupe_matches', id));
}

export async function updatePreliminaryMatch(data: Partial<Omit<NavetanePreliminaryMatch, 'teamAData' | 'teamBData' | 'winnerPlaysAgainstData'>>) {
    return await setDoc(doc(db, 'navetane_preliminary_match', 'main_prelim'), data, { merge: true });
}

export async function updateAdminFinalsData(data: CompetitionFinals): Promise<void> {
    await setDoc(doc(db, 'finals_admin_data', 'current'), data, { merge: true });
}
