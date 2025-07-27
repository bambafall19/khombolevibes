// src/lib/data.ts
import { collection, getDocs, doc, getDoc, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import type { Article, Category, Media, NavetanePoule, NavetaneCoupeMatch, Team, NavetanePreliminaryMatch, Comment, NavetanePublicView, NavetaneStats, FinalsBracket, CompetitionFinals, Poll, Sponsor, SponsorPublicView, MediaPublicView, NavetaneStatsPublicView } from '@/types';

let categoriesCache: Category[] | null = null;
let teamsCache: Team[] | null = null;
let mediaCache: Media[] | null = null;

const defaultSponsorPublicView: SponsorPublicView = {
    sponsors: [],
};

const defaultMediaPublicView: MediaPublicView = {
    media: [],
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
  const categoriesCollection = collection(db, 'categories');
  const q = query(categoriesCollection, orderBy('order', 'asc'));
  const categorySnapshot = await getDocs(q);
  const categoryList = categorySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
  categoriesCache = categoryList;
  return categoryList;
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
   const categories = await getCategories();
   return categories.find(c => c.slug === slug);
}


// --- Article Management ---
export const generateExcerpt = (content: string, maxLength = 150): string => {
    if (!content) return '';
    const plainText = content.replace(/<[^>]+>/g, '');
    if (plainText.length <= maxLength) return plainText;
    const trimmed = plainText.substring(0, maxLength);
    return trimmed.substring(0, trimmed.lastIndexOf(' ')) + '...';
};

export async function getArticles(categorySlug?: string): Promise<Article[]> {
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
  const allCategories = await getCategories();

  let articles = articleSnapshot.docs.map(doc => {
    const data = doc.data();
    const articleCategory = allCategories.find(c => c.id === data.category?.id) || data.category;
    return {
      id: doc.id,
      ...data,
      category: articleCategory,
      publishedAt: (data.publishedAt as Timestamp).toDate().toISOString(),
    } as Article;
  });
  
  articles.sort((a, b) => {
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  return articles;
}

export async function searchArticles(searchQuery: string): Promise<Article[]> {
  const articlesCollection = collection(db, 'articles');
  const articleSnapshot = await getDocs(query(articlesCollection, orderBy('publishedAt', 'desc')));
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


// --- Poll Management ---
const pollsCollection = collection(db, 'polls');

export async function getPolls(): Promise<Poll[]> {
  const snapshot = await getDocs(query(pollsCollection, orderBy('question')));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Poll));
}


// --- Media Management ---
const mediaCollection = collection(db, 'media');
const mediaPublicViewDoc = doc(db, 'media_public_view', 'live');

export async function getAdminMedia(forceRefresh: boolean = false): Promise<Media[]> {
    if (mediaCache && !forceRefresh) {
        return mediaCache;
    }
    const snapshot = await getDocs(query(mediaCollection, orderBy('createdAt', 'desc')));
    const mediaList = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            title: data.title || '',
            thumbnailUrl: data.thumbnailUrl || '',
            thumbnailHint: data.thumbnailHint || '',
            imageUrls: data.imageUrls || [],
            createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString()
        } as Media
    });
    mediaCache = mediaList;
    return mediaList;
}

export async function getPublicMedia(): Promise<Media[]> {
    try {
        const docSnap = await getDoc(mediaPublicViewDoc);
        if (docSnap.exists() && docSnap.data()?.media) {
            return docSnap.data().media as Media[];
        }
        // Fallback for build time: read directly from admin collection
        return await getAdminMedia(true);
    } catch (error) {
        console.warn("Could not fetch public media view, falling back to admin data. This is expected during build time.", error);
        return await getAdminMedia(true);
    }
}

// --- Navetane Management (Firestore) ---
const navetanePoulesCollection = collection(db, 'navetane_poules');
const navetaneCoupeCollection = collection(db, 'navetane_coupe_matches');

export async function getAdminNavetanePoules(): Promise<NavetanePoule[]> {
    const snapshot = await getDocs(query(navetanePoulesCollection, orderBy('name')));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NavetanePoule));
}

export async function getAdminNavetaneCoupeMatches(): Promise<NavetaneCoupeMatch[]> {
    const snapshot = await getDocs(query(navetaneCoupeCollection));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NavetaneCoupeMatch));
}


// --- Preliminary Match Management ---
const PRELIMINARY_MATCH_DOC_ID = 'main_prelim';

export async function getAdminPreliminaryMatch(): Promise<NavetanePreliminaryMatch | null> {
    const docRef = doc(db, 'navetane_preliminary_match', PRELIMINARY_MATCH_DOC_ID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data() as NavetanePreliminaryMatch;
    }
    return null;
}

// --- Team Management (Firestore) ---
const teamsCollection = collection(db, 'teams');

export async function getTeams(): Promise<Team[]> {
    if (teamsCache) {
        return teamsCache;
    }
    const snapshot = await getDocs(query(teamsCollection, orderBy('name')));
    const teams = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team));
    teamsCache = teams;
    return teams;
}


// --- Comments Management ---
export async function getCommentsForArticle(articleId: string): Promise<Comment[]> {
  const commentsCollection = collection(db, 'comments');
  const q = query(
    commentsCollection,
    where('articleId', '==', articleId),
  );
  const snapshot = await getDocs(q);
  
  const comments = snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
    } as Comment;
  });

  comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  return comments;
}

export async function getPollForArticle(articleId: string): Promise<Poll | null> {
    try {
      const pollsCollection = collection(db, 'polls');
      const q = query(pollsCollection, where('articleId', '==', articleId));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
          return null;
      }
      const pollDoc = snapshot.docs[0];
      return { id: pollDoc.id, ...pollDoc.data() } as Poll;

    } catch (error) {
        console.error(`Error fetching poll for article ${articleId}. Trying again.`, error);
         try {
            // Fallback for build time issues
            console.log("Retrying poll fetch for article:", articleId);
            const snapshot = await getDocs(query(pollsCollection, where('articleId', '==', articleId)));
            if (snapshot.empty) return null;
            const pollDoc = snapshot.docs[0];
            return { id: pollDoc.id, ...pollDoc.data() } as Poll;
        } catch (retryError) {
            console.error("Retry poll fetch failed:", retryError);
            return null;
        }
    }
}


// --- PUBLIC VIEW DATA ---
const navetanePublicViewDoc = doc(db, 'navetane_public_views', 'live');

export async function getNavetanePageData(): Promise<{ navetaneData: NavetanePublicView; finalsData: CompetitionFinals }> {
    const [navetaneDocSnap, finalsDocSnap] = await Promise.all([
        getDoc(navetanePublicViewDoc),
        getDoc(doc(db, 'finals_public_view', 'live'))
    ]);
    
    const navetaneData = navetaneDocSnap.exists()
        ? { ...defaultNavetanePublicView, ...navetaneDocSnap.data() } as NavetanePublicView
        : defaultNavetanePublicView;
        
    const finalsData = finalsDocSnap.exists()
        ? { ...defaultCompetitionFinals, ...finalsDocSnap.data() } as CompetitionFinals
        : defaultCompetitionFinals;

    return { navetaneData, finalsData };
}

// --- Navetane Stats Management ---
const navetaneStatsAdminDoc = doc(db, 'navetane_stats', 'admin_data');
const navetaneStatsPublicViewDoc = doc(db, 'navetane_stats', 'public_view');

export async function getPublicNavetaneStatsData(): Promise<NavetaneStats> {
    const docSnap = await getDoc(navetaneStatsAdminDoc);
    if (docSnap.exists()) {
        return { ...defaultStats, ...docSnap.data() } as NavetaneStats;
    }
    return defaultStats;
}

export async function getNavetaneStatsPageData(): Promise<NavetaneStatsPublicView> {
    let stats: NavetaneStats = defaultStats;
    try {
        const publicStatsSnap = await getDoc(navetaneStatsPublicViewDoc);
        if (publicStatsSnap.exists()) {
            stats = publicStatsSnap.data() as NavetaneStats;
        } else {
            const adminStatsSnap = await getDoc(navetaneStatsAdminDoc);
            if (adminStatsSnap.exists()) {
                stats = adminStatsSnap.data() as NavetaneStats;
            }
        }
    } catch(e) {
        console.warn("Could not fetch public stats, trying admin stats", e);
        const adminStatsSnap = await getDoc(navetaneStatsAdminDoc);
        if (adminStatsSnap.exists()) {
            stats = adminStatsSnap.data() as NavetaneStats;
        }
    }
    
    let preliminaryMatch: NavetanePreliminaryMatch | null = null;
    try {
        const navetaneViewDocSnap = await getDoc(navetanePublicViewDoc);
        preliminaryMatch = navetaneViewDocSnap.exists() ? (navetaneViewDocSnap.data().preliminaryMatch || null) : null;
    } catch (e) {
        console.warn("Could not fetch preliminary match for stats page", e);
    }
    
    return { ...stats, preliminaryMatch };
}

// --- Sponsor Management ---
const sponsorsCollection = collection(db, 'sponsors');
const sponsorsPublicViewDoc = doc(db, 'sponsors_public_view', 'live');

export async function getSponsors(): Promise<Sponsor[]> {
    const snapshot = await getDocs(query(sponsorsCollection, orderBy('createdAt', 'desc')));
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString()
    } as Sponsor));
}

export async function getPublicSponsors(): Promise<SponsorPublicView> {
    const docSnap = await getDoc(sponsorsPublicViewDoc);
    if (docSnap.exists()) {
        return docSnap.data() as SponsorPublicView;
    }
    return defaultSponsorPublicView;
}


// --- Finals Bracket Data ---
const finalsAdminDoc = doc(db, 'finals_admin_data', 'current');

export async function getAdminFinalsData(): Promise<CompetitionFinals> {
  try {
    const docSnap = await getDoc(finalsAdminDoc);
    if (docSnap.exists()) {
        const data = docSnap.data();
        const ensureArray = (arr: any) => (Array.isArray(arr) ? arr : []);
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
  } catch(error) {
    console.error('Error fetching admin finals data:', error);
    return defaultCompetitionFinals;
  }
}
