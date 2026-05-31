import { db } from './index';
import { apis } from './schema';

const seedApis = [
  {
    slug: 'jsonplaceholder',
    name: 'JSONPlaceholder',
    description: 'Free fake REST API for testing and prototyping. Provides posts, comments, albums, photos, todos, and users.',
    category: 'Testing',
    freeTier: 'Completely free, no rate limits',
    requiresKey: false,
    docsUrl: 'https://jsonplaceholder.typicode.com/',
    baseUrl: 'https://jsonplaceholder.typicode.com',
    exampleEndpoint: '/posts',
    healthScore: 99,
    tags: ['testing', 'mock', 'rest', 'fake-data', 'free'],
  },
  {
    slug: 'open-meteo',
    name: 'Open-Meteo',
    description: 'Free weather API for non-commercial use. Provides hourly and daily weather forecasts worldwide.',
    category: 'Weather',
    freeTier: 'Free for non-commercial use, up to 10,000 requests/day',
    requiresKey: false,
    docsUrl: 'https://open-meteo.com/en/docs',
    baseUrl: 'https://api.open-meteo.com/v1',
    exampleEndpoint: '/forecast?latitude=52.52&longitude=13.41&current_weather=true',
    healthScore: 97,
    tags: ['weather', 'forecast', 'climate', 'free', 'no-key'],
  },
  {
    slug: 'nominatim',
    name: 'Nominatim (OpenStreetMap)',
    description: 'Free geocoding and reverse geocoding API powered by OpenStreetMap data.',
    category: 'Geolocation',
    freeTier: 'Free, max 1 request/second, must attribute OpenStreetMap',
    requiresKey: false,
    docsUrl: 'https://nominatim.org/release-docs/develop/api/Overview/',
    baseUrl: 'https://nominatim.openstreetmap.org',
    exampleEndpoint: '/search?q=Berlin&format=json',
    healthScore: 93,
    tags: ['geocoding', 'maps', 'location', 'openstreetmap', 'free'],
  },
  {
    slug: 'youtube-data-v3',
    name: 'YouTube Data API v3',
    description: 'Access YouTube data including videos, channels, playlists, comments, and search results.',
    category: 'Social Media',
    freeTier: '10,000 units/day free (search costs 100 units, list costs 1 unit)',
    requiresKey: true,
    docsUrl: 'https://developers.google.com/youtube/v3/docs',
    baseUrl: 'https://www.googleapis.com/youtube/v3',
    exampleEndpoint: '/videos?part=snippet&chart=mostPopular&key=YOUR_KEY',
    healthScore: 95,
    tags: ['video', 'youtube', 'google', 'social', 'streaming'],
  },
  {
    slug: 'unsplash',
    name: 'Unsplash',
    description: 'Access high-resolution photos from Unsplash. Search millions of professional photos.',
    category: 'Images',
    freeTier: '50 requests/hour on demo, production requires approval',
    requiresKey: true,
    docsUrl: 'https://unsplash.com/documentation',
    baseUrl: 'https://api.unsplash.com',
    exampleEndpoint: '/photos/random?client_id=YOUR_ACCESS_KEY',
    healthScore: 94,
    tags: ['images', 'photos', 'stock', 'media', 'creative'],
  },
  {
    slug: 'rest-countries',
    name: 'REST Countries',
    description: 'Get information about countries via a RESTful API. Includes population, area, currencies, languages, and more.',
    category: 'Geography',
    freeTier: 'Completely free, no rate limits',
    requiresKey: false,
    docsUrl: 'https://restcountries.com/',
    baseUrl: 'https://restcountries.com/v3.1',
    exampleEndpoint: '/all',
    healthScore: 90,
    tags: ['countries', 'geography', 'world', 'data', 'free'],
  },
  {
    slug: 'coingecko',
    name: 'CoinGecko',
    description: 'Cryptocurrency market data API. Get prices, market caps, trading volumes, and historical data for 10,000+ coins.',
    category: 'Finance',
    freeTier: '10–30 requests/minute on free tier',
    requiresKey: false,
    docsUrl: 'https://docs.coingecko.com/reference/introduction',
    baseUrl: 'https://api.coingecko.com/api/v3',
    exampleEndpoint: '/simple/price?ids=bitcoin&vs_currencies=usd',
    healthScore: 92,
    tags: ['crypto', 'finance', 'bitcoin', 'market-data', 'prices'],
  },
  {
    slug: 'github-rest',
    name: 'GitHub REST API',
    description: 'Access GitHub data: repositories, users, issues, pull requests, commits, and more.',
    category: 'Developer Tools',
    freeTier: '60 requests/hour unauthenticated, 5,000/hour with auth token',
    requiresKey: false,
    docsUrl: 'https://docs.github.com/en/rest',
    baseUrl: 'https://api.github.com',
    exampleEndpoint: '/repos/vercel/next.js',
    healthScore: 98,
    tags: ['github', 'git', 'repositories', 'developers', 'vcs'],
  },
];

async function seed() {
  console.log('🌱 Seeding database...');

  for (const api of seedApis) {
    await db
      .insert(apis)
      .values(api)
      .onConflictDoNothing();
    console.log(`  ✓ ${api.name}`);
  }

  console.log('✅ Seeding complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
