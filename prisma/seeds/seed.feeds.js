"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// World news feeds
const WORLD = [
    { title: 'BBC News', sourceUrl: 'https://feeds.bbci.co.uk/news/rss.xml', category: 'world' },
    { title: 'CNN World', sourceUrl: 'https://rss.cnn.com/rss/edition_world.rss', category: 'world' },
    { title: 'Reuters Top News', sourceUrl: 'https://feeds.reuters.com/reuters/topNews', category: 'world' },
    { title: 'The Guardian World', sourceUrl: 'https://www.theguardian.com/world/rss', category: 'world' },
    { title: 'New York Times Home', sourceUrl: 'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml', category: 'world' },
];
// Technology news feeds
const TECH = [
    { title: 'Hacker News', sourceUrl: 'https://news.ycombinator.com/rss', category: 'tech' },
    { title: 'TechCrunch', sourceUrl: 'https://techcrunch.com/feed/', category: 'tech' },
    { title: 'Smashing Magazine', sourceUrl: 'https://www.smashingmagazine.com/feed/', category: 'tech' },
    { title: 'Ars Technical', sourceUrl: 'http://feeds.arstechnica.com/arstechnica/index', category: 'tech' },
    { title: 'Dev.to (Home)', sourceUrl: 'https://dev.to/feed/', category: 'tech' },
];
const UA = [
    { title: 'Укрінформ (Останні новини)', sourceUrl: 'https://www.ukrinform.ua/rss/block-lastnews', category: 'ua' },
    { title: 'ЛІГА.net (усі новини)', sourceUrl: 'https://www.liga.net/news/all/rss.xml', category: 'ua' },
    { title: 'Економічна правда', sourceUrl: 'https://www.epravda.com.ua/rss/', category: 'ua' },
    { title: 'НВ (усі новини)', sourceUrl: 'https://nv.ua/rss/all.xml', category: 'ua' },
    { title: 'ТСН', sourceUrl: 'https://tsn.ua/rss/full.rss', category: 'ua' },
];
// Sports news feeds
const SPORTS = [
    { title: 'BBC Sport', sourceUrl: 'http://feeds.bbci.co.uk/sport/rss.xml?edition=uk', category: 'sports' },
    { title: 'ESPN Top Headlines', sourceUrl: 'https://www.espn.com/espn/rss/news', category: 'sports' },
    { title: 'Sky Sports Top Stories', sourceUrl: 'https://www.skysports.com/rss/12040', category: 'sports' },
];
// Extract domain name from URL
function getSourceDomain(url) {
    try {
        return new URL(url).host.replace(/^www\./, '');
    }
    catch {
        return '';
    }
}
async function main() {
    // Clear existing feeds from database
    await prisma.feed.deleteMany({});
    // Combine all feed categories into one array
    const allFeeds = [...WORLD, ...TECH, ...UA, ...SPORTS];
    // Prepare data for Prisma model
    const feedRows = allFeeds.map((feed) => ({
        title: feed.title,
        sourceUrl: feed.sourceUrl,
        sourceDomain: getSourceDomain(feed.sourceUrl),
        category: feed.category,
        description: null,
        link: null,
        language: null,
        imageUrl: null,
        isActive: true,
        items: [], // Empty array for Json field according to model
    }));
    // Insert all feeds into database
    await prisma.feed.createMany({
        data: feedRows,
    });
    console.log(`Successfully seeded ${feedRows.length} feeds`);
}
// Run the seeding process
main()
    .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
