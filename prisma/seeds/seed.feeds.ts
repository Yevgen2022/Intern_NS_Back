import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type SeedFeed = {
    title: string;
    sourceUrl: string;
    category: 'world' | 'tech' | 'ua' | 'sports';
};

const WORLD: SeedFeed[] = [
    { title: 'BBC News', sourceUrl: 'https://feeds.bbci.co.uk/news/rss.xml', category: 'world' },
    { title: 'CNN World', sourceUrl: 'https://rss.cnn.com/rss/edition_world.rss', category: 'world' },
    { title: 'Reuters Top News', sourceUrl: 'https://feeds.reuters.com/reuters/topNews', category: 'world' },
    { title: 'The Guardian World', sourceUrl: 'https://www.theguardian.com/world/rss', category: 'world' },
    { title: 'New York Times Home', sourceUrl: 'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml', category: 'world' },
];

const TECH: SeedFeed[] = [
    { title: 'Hacker News', sourceUrl: 'https://news.ycombinator.com/rss', category: 'tech' },
    { title: 'TechCrunch', sourceUrl: 'https://techcrunch.com/feed/', category: 'tech' },
    { title: 'Smashing Magazine', sourceUrl: 'https://www.smashingmagazine.com/feed/', category: 'tech' },
    { title: 'Ars Technical', sourceUrl: 'http://feeds.arstechnica.com/arstechnica/index', category: 'tech' },
    { title: 'Dev.to (Home)', sourceUrl: 'https://dev.to/feed/', category: 'tech' },
];

const UA: SeedFeed[] = [
    { title: 'Укрінформ (Останні новини)', sourceUrl: 'https://www.ukrinform.ua/rss/block-lastnews', category: 'ua' },
    { title: 'ЛІГА.net (усі новини)', sourceUrl: 'https://www.liga.net/news/all/rss.xml', category: 'ua' },
    { title: 'Економічна правда', sourceUrl: 'https://www.epravda.com.ua/rss/', category: 'ua' },
    { title: 'НВ (усі новини)', sourceUrl: 'https://nv.ua/rss/all.xml', category: 'ua' },
    { title: 'ТСН', sourceUrl: 'https://tsn.ua/rss/full.rss', category: 'ua' },
];

const SPORTS: SeedFeed[] = [
    { title: 'BBC Sport', sourceUrl: 'http://feeds.bbci.co.uk/sport/rss.xml?edition=uk', category: 'sports' },
    { title: 'ESPN Top Headlines', sourceUrl: 'https://www.espn.com/espn/rss/news', category: 'sports' },
    { title: 'Sky Sports Top Stories', sourceUrl: 'https://www.skysports.com/rss/12040', category: 'sports' },
];

function getSourceDomain(u: string): string {
    try {
        return new URL(u).host.replace(/^www\./, '');
    } catch {
        return '';
    }
}

async function main() {
    //Clearing the collection
    await prisma.feed.deleteMany({});

    const all: SeedFeed[] = [...WORLD, ...TECH, ...UA, ...SPORTS];

    // Filling out the Prisma model
    const rows = all.map((f) => ({
        title: f.title,
        sourceUrl: f.sourceUrl,
        sourceDomain: getSourceDomain(f.sourceUrl),
        category: f.category,
        description: null as string | null,
        link: null as string | null,
        language: null as string | null,
        imageUrl: null as string | null,
        isActive: true,
        items: [] ,         // за моделлю items: Json — кладемо порожній масив
    }));

    await prisma.feed.createMany({
        data: rows,
    });

    console.log(`Seeded feeds: ${rows.length}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
