// src/lib/data.ts
import { collection, getDocs, doc, getDoc, query, where, orderBy, addDoc, updateDoc, deleteDoc, serverTimestamp, Timestamp, setDoc, writeBatch, runTransaction } from 'firebase/firestore';
import { db } from './firebase';
import type { Article, Category, Media, NavetanePoule, NavetaneCoupeMatch, Team, NavetanePreliminaryMatch, Comment, NavetanePublicView, NavetaneStats, PlayerRank, Match, TeamData, Sponsor, SponsorPublicView, NavetaneStatsPublicView, CompetitionFinals, FinalsBracket, BracketMatch, Poll, PollOption } from '@/types';
import { nanoid } from 'nanoid';


let categoriesCache: Category[] | null = null;
let teamsCache: Team[] | null = null;
let mediaCache: Media[] | null = null;

const defaultSponsorPublicView: SponsorPublicView = {
    sponsors: [],
};

const defaultStats: NavetaneStats = {
    ballonDor: [],
    goldenBoy: [],
    topScorersChampionnat: [],
    topScorersCoupe: [],
    lastResults: [],
    upcomingMatches: [],
};

const defaultNavetanePublicView: NavetanePublicView = {
    poules: [],
    coupeMatches: [],
    preliminaryMatch: null,
};

const createDefaultBracket = (): FinalsBracket => ({
    quarters: [],
    semis: [],
    final: [],
});

const defaultCompetitionFinals: CompetitionFinals = {
    championnat: createDefaultBracket(),
    coupe: createDefaultBracket(),
};


// --- Category Management ---
export async function getCategories(): Promise<Category[]> {
  if (categoriesCache) {
    return categoriesCache;
  }
  try {
    const categoriesCollection = collection(db, 'categories');
    const q = query(categoriesCollection, orderBy('order', 'asc'));
    const categorySnapshot = await getDocs(q);
    
    if (categorySnapshot.empty) {
        console.log("Firestore 'categories' collection is empty. Please add categories in the admin panel.");
        return [];
    }
    
    const categoryList = categorySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
    categoriesCache = categoryList;
    return categoryList;
  } catch (error) {
    console.error("Error fetching categories from Firestore: ", error);
    // On error, return an empty array to avoid breaking the UI
    return [];
  }
}

export async function addCategory(category: Omit<Category, 'id'>) {
    categoriesCache = null; // Invalidate cache
    const docRef = await addDoc(collection(db, 'categories'), category);
    return docRef;
}

export async function updateCategory(id: string, category: Partial<Category>) {
    categoriesCache = null; // Invalidate cache
    const categoryRef = doc(db, 'categories', id);
    await updateDoc(categoryRef, category);
}

export async function deleteCategory(id: string) {
    categoriesCache = null; // Invalidate cache
    const categoryRef = doc(db, 'categories', id);
    await deleteDoc(categoryRef);
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
   const categories = await getCategories();
   return categories.find(c => c.slug === slug);
}


// --- Article Management ---
const generateExcerpt = (content: string, maxLength = 150): string => {
    if (!content) return '';
    const plainText = content.replace(/<[^>]+>/g, '');
    if (plainText.length <= maxLength) return plainText;
    const trimmed = plainText.substring(0, maxLength);
    return trimmed.substring(0, trimmed.lastIndexOf(' ')) + '...';
};

export async function getArticles(categorySlug?: string): Promise<Article[]> {
  try {
    const articlesCollection = collection(db, 'articles');
    let q;
    if (categorySlug && categorySlug !== 'accueil') {
      const category = await getCategoryBySlug(categorySlug);
      if (!category) return [];
      q = query(articlesCollection, where('category.id', '==', category.id));
    } else {
      q = query(articlesCollection, orderBy('publishedAt', 'desc'));
    }

    const articleSnapshot = await getDocs(q);
    if (articleSnapshot.empty) {
      return [];
    }

    const allCategories = await getCategories();

    let articles = articleSnapshot.docs.map(doc => {
      const data = doc.data();
      // Ensure category data is consistent
      const articleCategory = allCategories.find(c => c.id === data.category?.id) || data.category;
      return {
        id: doc.id,
        ...data,
        category: articleCategory,
        publishedAt: (data.publishedAt as Timestamp).toDate().toISOString(),
      } as Article;
    });
    
    // Sort featured articles to the top, then by date client-side
    articles.sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });

    return articles;
  } catch (error) {
    console.error("Error fetching articles from Firestore: ", error);
    if (error instanceof Error && error.message.includes("query requires an index")) {
        console.error("Firestore composite index missing. Please create it in the Firebase console.");
    }
    return [];
  }
}

export async function searchArticles(searchQuery: string): Promise<Article[]> {
  try {
    const articlesCollection = collection(db, 'articles');
    // Firestore doesn't support case-insensitive or partial text search natively.
    // A common workaround is to store keywords in lowercase.
    // For this app, we'll fetch all and filter server-side. This is not scalable for large datasets.
    // For a real app, use a dedicated search service like Algolia or Typesense.
    const articleSnapshot = await getDocs(query(articlesCollection, orderBy('publishedAt', 'desc')));
    
    if (articleSnapshot.empty) {
      return [];
    }
    
    const allCategories = await getCategories();
    const normalizedQuery = searchQuery.toLowerCase();

    const articles = articleSnapshot.docs
      .map(doc => {
        const data = doc.data();
        const articleCategory = allCategories.find(c => c.id === data.category?.id) || data.category;
        return {
          id: doc.id,
          ...data,
          category: articleCategory,
          publishedAt: (data.publishedAt as Timestamp).toDate().toISOString(),
        } as Article;
      })
      .filter(article => 
        article.title.toLowerCase().includes(normalizedQuery)
      );

    return articles;
  } catch (error) {
    console.error("Error searching articles in Firestore: ", error);
    return [];
  }
}


export async function getArticleBySlug(slug: string): Promise<Article | undefined> {
  const articlesCollection = collection(db, 'articles');
  const q = query(articlesCollection, where('slug', '==', slug));
  const articleSnapshot = await getDocs(q);

  if (articleSnapshot.empty) {
    return undefined;
  }

  const allCategories = await getCategories();
  const doc = articleSnapshot.docs[0];
  const data = doc.data();
  
  const articleCategory = allCategories.find(c => c.id === data.category?.id) || data.category;

  return {
    id: doc.id,
    ...data,
    category: articleCategory,
    publishedAt: (data.publishedAt as Timestamp).toDate().toISOString(),
  } as Article;
}


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
    
    if (articleData.imageUrl2 === '') {
        updatedData.imageUrl2 = null;
    }

    await updateDoc(articleRef, updatedData);
}


export async function deleteArticle(id: string) {
    const batch = writeBatch(db);
    const articleRef = doc(db, 'articles', id);
    
    const articleSnap = await getDoc(articleRef);
    const articleData = articleSnap.data();

    // If the article has a pollId, find and delete the poll
    if (articleData?.pollId) {
        const pollRef = doc(db, 'polls', articleData.pollId);
        batch.delete(pollRef);
    }
    
    batch.delete(articleRef);
    await batch.commit();
}


// --- Poll Management ---
const pollsCollection = collection(db, 'polls');

export async function getPolls(): Promise<Poll[]> {
    const snapshot = await getDocs(query(pollsCollection, orderBy('question')));
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Poll));
}

export async function addPoll(pollData: Omit<Poll, 'id' | 'options' | 'totalVotes'> & { options: { text: string }[] }) {
    const batch = writeBatch(db);
    
    // Create the new poll document
    const pollDocRef = doc(pollsCollection);
    const newPoll: Omit<Poll, 'id'> = {
        articleId: pollData.articleId,
        question: pollData.question,
        options: pollData.options.map(opt => ({ id: nanoid(10), text: opt.text, votes: 0 })),
        totalVotes: 0,
    };
    batch.set(pollDocRef, newPoll);

    // Update the linked article with this poll's ID
    const articleRef = doc(db, 'articles', pollData.articleId);
    batch.update(articleRef, { pollId: pollDocRef.id });
    
    await batch.commit();
    return pollDocRef;
}

export async function updatePoll(id: string, pollData: Omit<Poll, 'id' | 'options' | 'totalVotes'> & { options: { text: string }[] }) {
     const batch = writeBatch(db);
     const pollRef = doc(db, 'polls', id);

     // Get existing poll to preserve vote counts if options are the same
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
     
    // Calculate total votes from preserved options
    const totalVotes = updatedPoll.options.reduce((sum, opt) => sum + opt.votes, 0);

    batch.update(pollRef, { ...updatedPoll, totalVotes });
     
    // If articleId has changed, update old and new articles
    if (existingPoll && existingPoll.articleId !== pollData.articleId) {
        const oldArticleRef = doc(db, 'articles', existingPoll.articleId);
        batch.update(oldArticleRef, { pollId: null });

        const newArticleRef = doc(db, 'articles', pollData.articleId);
        batch.update(newArticleRef, { pollId: id });
    }
     
    await batch.commit();
}

export async function deletePoll(id: string) {
    const batch = writeBatch(db);
    const pollRef = doc(db, 'polls', id);
    
    const pollSnap = await getDoc(pollRef);
    const pollData = pollSnap.data();

    // Unlink from article if it's linked
    if (pollData?.articleId) {
        const articleRef = doc(db, 'articles', pollData.articleId);
        batch.update(articleRef, { pollId: null });
    }

    batch.delete(pollRef);
    await batch.commit();
}


// --- Media Management ---
const mediaCollection = collection(db, 'media');

// Admin-only function to fetch media with cache invalidation
export async function getAdminMedia(forceRefresh: boolean = false): Promise<Media[]> {
    if (mediaCache && !forceRefresh) {
        return mediaCache;
    }
    try {
        const snapshot = await getDocs(query(mediaCollection, orderBy('createdAt', 'desc')));
        if (snapshot.empty) {
            mediaCache = [];
            return [];
        }
        const mediaList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString()
        } as Media));
        mediaCache = mediaList;
        return mediaList;
    } catch (error) {
        console.error("Error fetching admin media from Firestore: ", error);
        return [];
    }
}

// Public-facing function to fetch media. Uses the same collection but has different security implications.
export async function getPublicMedia(): Promise<Media[]> {
     try {
        const snapshot = await getDocs(query(mediaCollection, orderBy('createdAt', 'desc')));
        if (snapshot.empty) {
            return [];
        }
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString()
        } as Media));
    } catch (error) {
        console.error("Error fetching public media from Firestore: ", error);
        return [];
    }
}

export async function addMedia(media: Omit<Media, 'id' | 'createdAt'>) {
    mediaCache = null;
    const dataToSave = {
        ...media,
        createdAt: serverTimestamp()
    };
    return await addDoc(mediaCollection, dataToSave);
}

export async function updateMedia(id: string, media: Partial<Omit<Media, 'id' | 'createdAt'>>) {
    mediaCache = null;
    const mediaRef = doc(db, 'media', id);
    return await updateDoc(mediaRef, media);
}

export async function deleteMedia(id: string) {
    mediaCache = null;
    const mediaRef = doc(db, 'media', id);
    return await deleteDoc(mediaRef);
}


// --- Navetane Management (Firestore) ---
const navetanePoulesCollection = collection(db, 'navetane_poules');
const navetaneCoupeCollection = collection(db, 'navetane_coupe_matches');

// Admin-only functions
export async function getAdminNavetanePoules(): Promise<NavetanePoule[]> {
    try {
        const snapshot = await getDocs(query(navetanePoulesCollection, orderBy('name')));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NavetanePoule));
    } catch(e) {
        console.error("Error fetching navetane poules:", e);
        return [];
    }
}

export async function addNavetanePoule(poule: Omit<NavetanePoule, 'id' | 'teams'>) {
    const res = await addDoc(navetanePoulesCollection, { ...poule, teams: [] });
    return res;
}

export async function updateNavetanePoule(id: string, poule: Partial<NavetanePoule>) {
    const pouleRef = doc(db, 'navetane_poules', id);
    const res = await updateDoc(pouleRef, poule);
    return res;
}

export async function deleteNavetanePoule(id: string) {
    const pouleRef = doc(db, 'navetane_poules', id);
    const res = await deleteDoc(pouleRef);
    return res;
}

export async function getAdminNavetaneCoupeMatches(): Promise<NavetaneCoupeMatch[]> {
    try {
        const snapshot = await getDocs(query(navetaneCoupeCollection));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NavetaneCoupeMatch));
    } catch(e) {
        console.error("Error fetching navetane coupe matches:", e);
        return [];
    }
}

export async function addNavetaneCoupeMatch(match: Omit<NavetaneCoupeMatch, 'id' | 'teamAData' | 'teamBData'>) {
    const dataToSave = { ...match };
    const res = await addDoc(navetaneCoupeCollection, dataToSave);
    return res;
}

export async function updateNavetaneCoupeMatch(id: string, match: Partial<Omit<NavetaneCoupeMatch, 'id' | 'teamAData' | 'teamBData'>>) {
    const matchRef = doc(db, 'navetane_coupe_matches', id);
    const dataToUpdate: any = { ...match };
    
    const res = await updateDoc(matchRef, dataToUpdate);
    return res;
}

export async function deleteNavetaneCoupeMatch(id: string) {
    const matchRef = doc(db, 'navetane_coupe_matches', id);
    const res = await deleteDoc(matchRef);
    return res;
}


// --- Preliminary Match Management ---
const PRELIMINARY_MATCH_DOC_ID = 'main_prelim';

export async function getAdminPreliminaryMatch(): Promise<NavetanePreliminaryMatch | null> {
    try {
        const docRef = doc(db, 'navetane_preliminary_match', PRELIMINARY_MATCH_DOC_ID);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data() as NavetanePreliminaryMatch;
        }
        return null;
    } catch (e) {
        console.error("Error fetching preliminary match:", e);
        return null;
    }
}

export async function updatePreliminaryMatch(data: Omit<NavetanePreliminaryMatch, 'teamAData' | 'teamBData' | 'winnerPlaysAgainstData'>) {
    const docRef = doc(db, 'navetane_preliminary_match', PRELIMINARY_MATCH_DOC_ID);
    const dataToSave = { ...data };
    const res = await setDoc(docRef, dataToSave, { merge: true });
    return res;
}


// --- Team Management (Firestore) ---
const teamsCollection = collection(db, 'teams');

export async function getTeams(): Promise<Team[]> {
    if (teamsCache) {
        return teamsCache;
    }
    try {
        const snapshot = await getDocs(query(teamsCollection, orderBy('name')));
        const teams = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team));
        teamsCache = teams;
        return teams;
    } catch (e) {
        console.error("Error fetching teams:", e);
        return [];
    }
}

export async function addTeam(team: Omit<Team, 'id'>) {
    teamsCache = null;
    return await addDoc(teamsCollection, team);
}

export async function updateTeam(id: string, team: Partial<Team>) {
    teamsCache = null;
    const teamRef = doc(db, 'teams', id);
    return await updateDoc(teamRef, team);
}

export async function deleteTeam(id: string) {
    teamsCache = null;
    const teamRef = doc(db, 'teams', id);
    return await deleteDoc(teamRef);
}


// --- Comments Management ---
export async function addComment(commentData: { articleId: string; name: string; content: string }): Promise<Comment> {
  const newComment = {
    ...commentData,
    createdAt: serverTimestamp(),
  };
  const docRef = await addDoc(collection(db, 'comments'), newComment);
  
  return {
    ...commentData,
    id: docRef.id,
    createdAt: new Date().toISOString()
  };
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


// --- PUBLIC VIEW DATA ---
const navetanePublicViewDoc = doc(db, 'navetane_public_views', 'live');

/**
 * Fetches all admin data and publishes it to the public-facing document.
 * This function should only be callable by an admin.
 */
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

        await setDoc(navetanePublicViewDoc, publicData);
    } catch(e) {
        console.error("Failed to publish navetane data", e);
        throw e;
    }
}

/**
 * Fetches the published, public-safe Navetane data.
 */
export async function getNavetanePageData(): Promise<{ navetaneData: NavetanePublicView; finalsData: CompetitionFinals }> {
    try {
        const [navetaneDocSnap, finalsDocSnap] = await Promise.all([
            getDoc(navetanePublicViewDoc),
            getDoc(doc(db, 'finals_public_view', 'live'))
        ]);
        
        let navetaneData: NavetanePublicView;
        if (navetaneDocSnap.exists()) {
            const data = navetaneDocSnap.data();
            navetaneData = {
                poules: data.poules || [],
                coupeMatches: data.coupeMatches || [],
                preliminaryMatch: data.preliminaryMatch || null,
                lastPublished: data.lastPublished instanceof Timestamp 
                    ? data.lastPublished.toDate().toISOString() 
                    : undefined,
            };
        } else {
            navetaneData = defaultNavetanePublicView;
        }
            
        const finalsData = finalsDocSnap.exists()
            ? { ...defaultCompetitionFinals, ...finalsDocSnap.data() as CompetitionFinals }
            : defaultCompetitionFinals;

        return { navetaneData, finalsData };
    } catch (error) {
        console.error('Error fetching public Navetane page data:', error);
        return {
            navetaneData: defaultNavetanePublicView,
            finalsData: defaultCompetitionFinals,
        };
    }
}



// --- Navetane Stats Management ---
const navetaneStatsAdminDoc = doc(db, 'navetane_stats', 'admin_data');
const navetaneStatsPublicViewDoc = doc(db, 'navetane_stats', 'public_view');

export async function getPublicNavetaneStatsData(): Promise<NavetaneStats> {
    try {
        const docSnap = await getDoc(navetaneStatsAdminDoc);
        if (docSnap.exists()) {
            const data = docSnap.data() as NavetaneStats;
            // Ensure all fields are arrays, even if they are missing from Firestore
            return {
                ballonDor: data.ballonDor || [],
                goldenBoy: data.goldenBoy || [],
                topScorersChampionnat: data.topScorersChampionnat || [],
                topScorersCoupe: data.topScorersCoupe || [],
                lastResults: data.lastResults || [],
                upcomingMatches: data.upcomingMatches || [],
            };
        }
        return defaultStats;
    } catch (error) {
        console.error("Error fetching Navetane stats for admin:", error);
        return defaultStats;
    }
}

export async function getNavetaneStatsPageData(): Promise<NavetaneStatsPublicView> {
    try {
        const [statsDocSnap, navetaneViewDocSnap] = await Promise.all([
            getDoc(navetaneStatsPublicViewDoc),
            getDoc(navetanePublicViewDoc)
        ]);

        let stats: NavetaneStats = defaultStats;
        if (statsDocSnap.exists()) {
            const data = statsDocSnap.data() as NavetaneStats;
            stats = {
                ballonDor: data.ballonDor || [],
                goldenBoy: data.goldenBoy || [],
                topScorersChampionnat: data.topScorersChampionnat || [],
                topScorersCoupe: data.topScorersCoupe || [],
                lastResults: data.lastResults || [],
                upcomingMatches: data.upcomingMatches || [],
            };
        }

        let preliminaryMatch: NavetanePreliminaryMatch | null = null;
        if (navetaneViewDocSnap.exists()) {
            preliminaryMatch = navetaneViewDocSnap.data()?.preliminaryMatch || null;
        }
        
        return {
            ...stats,
            preliminaryMatch,
        };

    } catch (error) {
        console.error("Error fetching public Navetane stats:", error);
        return {
            ...defaultStats,
            preliminaryMatch: null,
        };
    }
}

export async function updateAndPublishNavetaneStat(stats: NavetaneStats) {
    // 1. Save the raw data to the admin document
    await setDoc(navetaneStatsAdminDoc, stats, { merge: true });

    // 2. Enrich the data for public view
    const allTeams = await getTeams();
    const teamsMapById = new Map(allTeams.map(t => [t.id, { name: t.name, logoUrl: t.logoUrl }]));
    const teamsMapByName = new Map(allTeams.map(t => [t.name, { name: t.name, logoUrl: t.logoUrl }]));

    const processPlayerRanks = (ranks: PlayerRank[]): PlayerRank[] => {
        if (!ranks) return [];
        return ranks.map(player => {
            const teamInfo = teamsMapById.get(player.teamId);
            return {
                ...player,
                teamName: teamInfo?.name || player.teamId,
                teamLogoUrl: teamInfo?.logoUrl || '',
            };
        }).filter(p => p.name && p.teamId); // Ensure player has a name and team
    };

    const processMatches = (matches: Match[]): Match[] => {
        if (!matches) return [];
        return matches.map(match => {
            const teamAInfo = teamsMapByName.get(match.teamA);
            const teamBInfo = teamsMapByName.get(match.teamB);
            return {
                ...match,
                teamALogoUrl: teamAInfo?.logoUrl || '',
                teamBLogoUrl: teamBInfo?.logoUrl || '',
            };
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
    
    // 3. Publish the enriched data to the public document
    await setDoc(navetaneStatsPublicViewDoc, processedStats, { merge: true });
}


// --- Sponsor Management ---
const sponsorsCollection = collection(db, 'sponsors');
const sponsorsPublicViewDoc = doc(db, 'sponsors_public_view', 'live');

export async function getSponsors(): Promise<Sponsor[]> {
    try {
        const snapshot = await getDocs(query(sponsorsCollection, orderBy('createdAt', 'desc')));
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString()
        } as Sponsor));
    } catch (e) {
        console.error("Error fetching sponsors:", e);
        return [];
    }
}

export async function addSponsor(sponsor: Omit<Sponsor, 'id' | 'createdAt'>) {
    const dataToSave = {
        ...sponsor,
        createdAt: serverTimestamp()
    };
    return await addDoc(sponsorsCollection, dataToSave);
}

export async function deleteSponsor(id: string) {
    const sponsorRef = doc(db, 'sponsors', id);
    return await deleteDoc(sponsorRef);
}

export async function publishSponsors(): Promise<void> {
    try {
        const sponsors = await getSponsors();
        const publicData: Omit<SponsorPublicView, 'lastPublished'> & { lastPublished: any } = {
            sponsors,
            lastPublished: serverTimestamp(),
        };
        await setDoc(sponsorsPublicViewDoc, publicData);
    } catch (e) {
        console.error("Failed to publish sponsors data", e);
        throw e;
    }
}

export async function getPublicSponsors(): Promise<SponsorPublicView> {
    try {
        const docSnap = await getDoc(sponsorsPublicViewDoc);
        if (docSnap.exists()) {
            return docSnap.data() as SponsorPublicView;
        }
        return defaultSponsorPublicView;
    } catch (error) {
        console.error('Error fetching public sponsors data:', error);
        return defaultSponsorPublicView;
    }
}


// --- Finals Bracket Data ---

const finalsAdminDoc = doc(db, 'finals_admin_data', 'current');
const finalsPublicViewDoc = doc(db, 'finals_public_view', 'live');

export async function getAdminFinalsData(): Promise<CompetitionFinals> {
    const docSnap = await getDoc(finalsAdminDoc);
    if (docSnap.exists()) {
        const data = docSnap.data();
        const ensureArray = (arr: any) => (Array.isArray(arr) ? arr : []);
        // Merge with defaults to ensure all structure is present
        return {
            championnat: {
                quarters: ensureArray(data.championnat?.quarters),
                semis: ensureArray(data.championnat?.semis),
                final: ensureArray(data.championnat?.final),
            },
            coupe: {
                quarters: ensureArray(data.coupe?.quarters),
                semis: ensureArray(data.coupe?.semis),
                final: ensureArray(data.coupe?.final),
            },
        };
    }
    return defaultCompetitionFinals;
}

export async function updateAdminFinalsData(data: CompetitionFinals): Promise<void> {
    await setDoc(finalsAdminDoc, data, { merge: true });
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
                return {
                    ...match,
                    teamAName: teamA?.name,
                    teamALogoUrl: teamA?.logoUrl,
                    teamBName: teamB?.name,
                    teamBLogoUrl: teamB?.logoUrl,
                };
            }).filter((m): m is BracketMatch => !!m);
        };
        
        return {
            quarters: enrichStage(bracket.quarters),
            semis: enrichStage(bracket.semis),
            final: enrichStage(bracket.final),
        };
    };

    const publicData: CompetitionFinals = {
        championnat: enrichBracket(adminData.championnat),
        coupe: enrichBracket(adminData.coupe),
    };

    await setDoc(finalsPublicViewDoc, publicData);
}
