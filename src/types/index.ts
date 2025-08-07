

export type Category = {
  id: string;
  name: string;
  slug: string;
  order: number;
};

export type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  imageHint?: string;
  imageUrl2?: string | null;
  imageHint2?: string;
  imageUrl3?: string | null;
  imageHint3?: string;
  videoUrl?: string | null;
  category: Category; 
  author: string;
  publishedAt: string; // ISO string date
  isFeatured?: boolean;
  pollId?: string; // Link to a poll
};

export type PollOption = {
  id: string;
  text: string;
  votes: number;
};

export type Poll = {
  id: string;
  articleId: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
};

export type Media = {
  id: string;
  title: string;
  thumbnailUrl: string;
  thumbnailHint?: string;
  imageUrls: string[];
  createdAt: string; // ISO string date
};

export type MediaPublicView = {
    media: Media[];
    lastPublished?: string;
}

export type NavetaneTeam = {
    id: string; 
    team: string;
    logoUrl?: string;
    pts: number;
    mj: number;
    g: number;
    n: number;
    p: number;
    bp: number;
    bc: number;
    diff: number;
}

export type NavetanePoule = {
    id: string; // Firestore document ID
    name: string;
    teams: NavetaneTeam[];
}

export type TeamData = {
    name: string;
    logoUrl: string;
};

export type NavetaneCoupeMatch = {
    id: string; // Firestore document ID
    teamA: string;
    teamB: string;
    teamAData?: TeamData;
    teamBData?: TeamData;
}

export type NavetanePreliminaryMatch = {
    teamA: string;
    teamB: string;
    winnerPlaysAgainst: string;
    teamAData?: TeamData;
    teamBData?: TeamData;
    winnerPlaysAgainstData?: TeamData;
}

export type Team = {
  id: string;
  name: string;
  logoUrl: string;
};

export type TeamsPublicView = {
    teams: Team[];
    lastPublished?: string;
}

export type Comment = {
  id: string;
  articleId: string;
  name: string;
  content: string;
  createdAt: string; // ISO string date
};

export type NavetanePublicView = {
    poules: NavetanePoule[];
    coupeMatches: NavetaneCoupeMatch[];
    preliminaryMatch: NavetanePreliminaryMatch | null;
    lastPublished?: string; // ISO string date
}

export type PlayerRank = {
  rank: number;
  name: string;
  teamId: string;
  teamName?: string;
  teamLogoUrl?: string;
  points: number;
};

export type Match = {
  teamA: string;
  scoreA: number;
  teamB: string;
  scoreB: number;
  date: string;
  poule?: string;
  teamALogoUrl?: string;
  teamBLogoUrl?: string;
  stadium?: string;
  time1?: string;
  time2?: string;
};

export type NavetaneStats = {
  ballonDor: PlayerRank[];
  goldenBoy: PlayerRank[];
  topScorersChampionnat: PlayerRank[];
  topScorersCoupe: PlayerRank[];
  lastResults: Match[];
  upcomingMatches: Match[];
};

export type NavetaneStatsPublicView = NavetaneStats & {
  preliminaryMatch: NavetanePreliminaryMatch | null;
}

export type Sponsor = {
    id: string;
    name: string;
    logoUrl: string;
    websiteUrl?: string;
    createdAt: string; // ISO string date
}

export type SponsorPublicView = {
    sponsors: Sponsor[];
    lastPublished?: string;
}

// --- Finals Bracket Types ---
export type BracketMatch = {
    id: string; // e.g., 'qf1', 'sf1', 'final'
    teamAId?: string;
    teamBId?: string;
    teamAName?: string; // For display
    teamBName?: string; // For display
    teamALogoUrl?: string;
    teamBLogoUrl?: string;
    scoreA?: number;
    scoreB?: number;
    date?: string;
    status?: 'pending' | 'played';
}

export type FinalsBracket = {
    quarters: BracketMatch[];
    semis: BracketMatch[];
    final: BracketMatch[];
}

export type CompetitionFinals = {
    championnat: FinalsBracket;
    coupe: FinalsBracket;
}
