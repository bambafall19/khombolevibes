// src/lib/data.ts
import { collection, getDocs, doc, getDoc, query, where, orderBy, addDoc, updateDoc, deleteDoc, serverTimestamp, Timestamp, setDoc, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import type { Article, Category, Media, NavetanePoule, NavetaneCoupeMatch, Team, NavetanePreliminaryMatch, Comment, NavetanePublicView, NavetaneStats, PlayerRank, Match, TeamData, Sponsor, SponsorPublicView, NavetaneStatsPublicView, CompetitionFinals, FinalsBracket, BracketMatch, Poll } from '@/types';

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
    return [];
  }
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


// --- Poll Management ---
const pollsCollection = collection(db, 'polls');

export async function getPolls(): Promise<Poll[]> {
    const snapshot = await getDocs(query(pollsCollection, orderBy('question')));
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Poll));
}


// --- Media Management ---
const mediaCollection = collection(db, 'media');

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
    } catch (error) {
        console.error("Error fetching admin media from Firestore: ", error);
        return [];
    }
}

export async function getPublicMedia(): Promise<Media[]> {
     try {
        const snapshot = await getDocs(query(mediaCollection, orderBy('createdAt', 'desc')));
        if (snapshot.empty) {
            return [];
        }
        return snapshot.docs.map(doc => {
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
    } catch (error) {
        console.error("Error fetching public media from Firestore: ", error);
        return [];
    }
}

// --- Navetane Management (Firestore) ---
const navetanePoulesCollection = collection(db, 'navetane_poules');
const navetaneCoupeCollection = collection(db, 'navetane_coupe_matches');

export async function getAdminNavetanePoules(): Promise<NavetanePoule[]> {
    try {
        const snapshot = await getDocs(query(navetanePoulesCollection, orderBy('name')));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NavetanePoule));
    } catch(e) {
        console.error("Error fetching navetane poules:", e);
        return [];
    }
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


// --- Comments Management ---
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
        return null;
    }
}


// --- PUBLIC VIEW DATA ---
const navetanePublicViewDoc = doc(db, 'navetane_public_views', 'live');

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
            const data = docSnap.data();
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
