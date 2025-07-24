// src/lib/mock-data.ts
import type { Article, Category, Media, NavetanePoule, NavetaneCoupeMatch } from '@/types';

// These category objects are now just for defining the shape of the category on mock articles.
// The single source of truth for categories is Firestore.
const actualiteCategory = { id: '2', name: 'Actualité', slug: 'actualite', order: 2 };
const sportCategory = { id: '3', name: 'Sport', slug: 'sport', order: 3 };
const navetaneCategory = { id: '4', name: 'Navétane', slug: 'navetane', order: 4 };
const societeCultureCategory = { id: '5', name: 'Société & Culture', slug: 'societe-culture', order: 5 };


export const mockArticles: Article[] = [
    {
        id: '1',
        slug: 'tournoi-navetane-ouverture',
        title: 'Le grand tournoi de Navétane de Khombole démarre ce week-end',
        excerpt: 'La saison des Navétanes est officiellement lancée ! Découvrez les affiches de la première journée et les favoris de la compétition.',
        content: 'La fièvre du football de quartier s\'empare à nouveau de Khombole avec le coup d\'envoi de la saison des Navétanes. Ce week-end, les pelouses (souvent sablonneuses) vibreront au rythme des premières confrontations. L\'ASC Jamm, championne en titre, remet sa couronne en jeu face à une concurrence plus affûtée que jamais.\n\nParmi les rencontres à ne pas manquer, le derby entre l\'ASC Weli et l\'ASC Espoir promet déjà des étincelles. Les organisateurs espèrent une saison placée sous le signe du fair-play et du spectacle, pour le plus grand plaisir des milliers de supporters attendus.',
        imageUrl: 'https://placehold.co/600x400.png',
        imageHint: 'soccer match',
        category: sportCategory,
        author: 'Pape Diouf',
        publishedAt: '2024-07-20T10:00:00Z',
        isFeatured: true,
    },
    {
        id: '2',
        slug: 'nouveau-marche-central',
        title: 'Le nouveau marché central de Khombole ouvre ses portes',
        excerpt: 'Après des mois de travaux, le marché central modernisé a été inauguré ce matin, offrant un meilleur cadre aux commerçants et aux clients.',
        content: 'C\'est un jour historique pour Khombole. Le nouveau marché central, un projet attendu depuis des années, a officiellement ouvert ses portes ce lundi. Plus spacieux, mieux organisé et doté d\'infrastructures modernes, ce nouvel espace vise à redynamiser le commerce local.\n\nLes commerçants, relogés dans des cantines flambant neuves, ne cachaient pas leur satisfaction. "C\'est le jour et la nuit. Nous allons pouvoir travailler dans de bien meilleures conditions", a confié l\'un d\'eux. La Mairie a souligné que ce projet s\'inscrit dans un plan plus large de modernisation de la ville.',
        imageUrl: 'https://placehold.co/600x400.png',
        imageHint: 'market stall',
        category: actualiteCategory,
        author: 'Awa Gueye',
        publishedAt: '2024-07-21T12:30:00Z',
        isFeatured: true,
    },
    {
        id: '3',
        slug: 'journees-culturelles-khombole',
        title: 'Les journées culturelles de Khombole célèbrent le patrimoine local',
        excerpt: 'Musique, danse, et artisanat sont au programme de cette semaine dédiée à la richesse culturelle de la ville.',
        content: 'Khombole vibre au rythme de ses journées culturelles annuelles. Depuis mercredi, la place publique s\'est transformée en une scène à ciel ouvert où se succèdent artistes locaux et troupes traditionnelles. L\'événement, qui met en lumière la diversité du patrimoine local, attire un public nombreux.\n\nUn espace d\'exposition permet également de découvrir le savoir-faire des artisans de la région, de la poterie à la vannerie. "C\'est une occasion unique de montrer notre travail et de le transmettre aux plus jeunes", explique une artisane. Les festivités se poursuivront jusqu\'à dimanche avec un grand concert de clôture.',
        imageUrl: 'https://placehold.co/600x400.png',
        imageHint: 'cultural festival',
        category: societeCultureCategory,
        author: 'Fatou Ndiaye',
        publishedAt: '2024-07-19T15:00:00Z',
        isFeatured: false,
    },
    {
        id: '4',
        slug: 'resultats-coupe-du-maire',
        title: 'Coupe du Maire : Les résultats des huitièmes de finale',
        excerpt: 'La Coupe du Maire a livré ses premiers verdicts avec des surprises et des confirmations lors des huitièmes de finale.',
        content: 'Le premier tour de la Coupe du Maire de Navétane a tenu toutes ses promesses, avec des matchs disputés et quelques résultats inattendus. Le petit poucet, l\'ASC Bokk-Jom, a créé la sensation en éliminant l\'ASC Guelewar, un des favoris. Dans les autres rencontres, la logique a été plus ou moins respectée, avec les qualifications de l\'ASC And-Jef et de l\'ASC Xam-Xam.\n\nLe tirage au sort des quarts de finale aura lieu ce vendredi et s\'annonce déjà passionnant. La compétition est plus ouverte que jamais, et chaque équipe peut rêver de soulever le trophée.',
        imageUrl: 'https://placehold.co/600x400.png',
        imageHint: 'trophy celebration',
        category: navetaneCategory,
        author: 'Moussa Sarr',
        publishedAt: '2024-07-18T22:00:00Z',
        isFeatured: false,
    },
    {
        id: '5',
        slug: 'campagne-reboisement-environnement',
        title: 'Une campagne de reboisement pour un Khombole plus vert',
        excerpt: 'Des centaines de jeunes se sont mobilisés ce week-end pour planter des arbres dans plusieurs quartiers de la ville.',
        content: 'Face aux défis environnementaux, la jeunesse de Khombole a répondu présent. À l\'initiative de l\'association "Khombole Vert", une vaste campagne de reboisement a été organisée samedi. Des milliers d\'arbres ont été plantés le long des principales artères et dans les espaces publics.\n\n"Chaque arbre planté est une promesse pour l\'avenir. Nous voulons créer un cadre de vie plus agréable et lutter à notre échelle contre le changement climatique", a déclaré le président de l\'association. Cette initiative a été saluée par les autorités locales qui ont promis un accompagnement pour l\'entretien des jeunes plants.',
        imageUrl: 'https://placehold.co/600x400.png',
        imageHint: 'planting trees',
        category: actualiteCategory,
        author: 'Daouda Faye',
        publishedAt: '2024-07-22T09:00:00Z',
        isFeatured: false,
    }
];

export const mockNavetanePoules: NavetanePoule[] = [
    {
        id: 'poule-a',
        name: 'Poule A',
        teams: [
            { id: 't1', team: 'ASC And-Jef', pts: 12, j: 5, g: 4, n: 0, p: 1, db: '+8' },
            { id: 't2', team: 'ASC Sental', pts: 10, j: 5, g: 3, n: 1, p: 1, db: '+5' },
            { id: 't3', team: 'ASC Guelewar', pts: 7, j: 5, g: 2, n: 1, p: 2, db: '0' },
            { id: 't4', team: 'ASC Deggo', pts: 4, j: 5, g: 1, n: 1, p: 3, db: '-4' },
            { id: 't5', team: 'ASC Mbolo', pts: 1, j: 5, g: 0, n: 1, p: 4, db: '-9' },
            { id: 't6', team: 'ASC Avenir', pts: 1, j: 5, g: 0, n: 1, p: 4, db: '-9' }
        ]
    },
    {
        id: 'poule-b',
        name: 'Poule B',
        teams: [
            { id: 't7', team: 'ASC Jamm', pts: 13, j: 5, g: 4, n: 1, p: 0, db: '+10' },
            { id: 't8', team: 'ASC Espoir', pts: 11, j: 5, g: 3, n: 2, p: 0, db: '+6' },
            { id: 't9', team: 'ASC Weli', pts: 6, j: 5, g: 2, n: 0, p: 3, db: '-2' },
            { id: 't10', team: 'ASC Jaappo', pts: 4, j: 5, g: 1, n: 1, p: 3, db: '-5' },
            { id: 't11', team: 'ASC Bokk-Jom', pts: 1, j: 5, g: 0, n: 1, p: 4, db: '-9' },
            { id: 't12', team: 'ASC Rail', pts: 1, j: 5, g: 0, n: 1, p: 4, db: '-9' }
        ]
    },
    {
        id: 'poule-c',
        name: 'Poule C',
        teams: [
            { id: 't13', team: 'ASC Xam-Xam', pts: 15, j: 5, g: 5, n: 0, p: 0, db: '+12' },
            { id: 't14', team: 'ASC Penc', pts: 9, j: 5, g: 3, n: 0, p: 2, db: '+3' },
            { id: 't15', team: 'ASC Etoile', pts: 7, j: 5, g: 2, n: 1, p: 2, db: '0' },
            { id: 't16', team: 'ASC Dioubo', pts: 4, j: 5, g: 1, n: 1, p: 3, db: '-6' },
            { id: 't17', team: 'ASC Niani', pts: 0, j: 5, g: 0, n: 5, db: '-9' },
        ]
    }
];

export const mockNavetaneCoupeMatches: NavetaneCoupeMatch[] = [
    { id: 'cm1', teamA: 'ASC And-Jef', teamB: 'ASC Bokk-Jom' },
    { id: 'cm2', teamA: 'ASC Jamm', teamB: 'ASC Deggo' },
    { id: 'cm3', teamA: 'ASC Xam-Xam', teamB: 'ASC Mbolo' },
    { id: 'cm4', teamA: 'ASC Sental', teamB: 'ASC Jaappo' },
    { id: 'cm5', teamA: 'ASC Guelewar', teamB: 'ASC Rail' },
    { id: 'cm6', teamA: 'ASC Espoir', teamB: 'ASC Etoile' },
    { id: 'cm7', teamA: 'ASC Penc', teamB: 'ASC Weli' },
    { id: 'cm8', teamA: 'ASC Niani', teamB: 'ASC Dioubo' }
];