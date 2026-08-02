// Populates the database with a handful of demo users and listings.
// Run with: npm run seed
require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');
const FoodListing = require('../models/FoodListing');
const Claim = require('../models/Claim');
const Rating = require('../models/Rating');

const BASE = { lat: 28.6139, lng: 77.209 }; // Delhi, used as a sample center point

const jitter = () => (Math.random() - 0.5) * 0.05;

async function seed() {
  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    FoodListing.deleteMany({}),
    Claim.deleteMany({}),
    Rating.deleteMany({}),
  ]);

  const donors = await User.create([
    {
      name: 'Meera Kapoor',
      email: 'meera@greentable.example',
      password: 'password123',
      role: 'donor',
      organization: 'Green Table Bistro',
      verified: true,
      location: { type: 'Point', coordinates: [BASE.lng + jitter(), BASE.lat + jitter()], label: 'Connaught Place' },
    },
    {
      name: 'Arjun Sethi',
      email: 'arjun@dailybread.example',
      password: 'password123',
      role: 'donor',
      organization: 'Daily Bread Bakery',
      verified: false,
      location: { type: 'Point', coordinates: [BASE.lng + jitter(), BASE.lat + jitter()], label: 'Karol Bagh' },
    },
  ]);

  const receivers = await User.create([
    {
      name: 'Fatima Noor',
      email: 'fatima@hopeshelter.example',
      password: 'password123',
      role: 'receiver',
      organization: 'Hope Shelter Home',
      verified: true,
      location: { type: 'Point', coordinates: [BASE.lng + jitter(), BASE.lat + jitter()], label: 'Paharganj' },
    },
    {
      name: 'Ravi Kumar',
      email: 'ravi@example.com',
      password: 'password123',
      role: 'receiver',
      location: { type: 'Point', coordinates: [BASE.lng + jitter(), BASE.lat + jitter()], label: 'Rajouri Garden' },
    },
  ]);

  const inHours = (h) => new Date(Date.now() + h * 60 * 60 * 1000);

  await FoodListing.create([
    {
      donor: donors[0]._id,
      title: 'Vegetable biryani, 15 servings',
      description: 'Large catering order left over from an event tonight. Still warm, packed in trays.',
      category: 'cooked',
      quantity: '15 servings',
      expiresAt: inHours(3),
      location: { type: 'Point', coordinates: [BASE.lng + jitter(), BASE.lat + jitter()], label: 'Connaught Place' },
    },
    {
      donor: donors[1]._id,
      title: 'Assorted bread and pastries',
      description: "End of day bakery surplus - sourdough loaves, croissants, and a tray of muffins.",
      category: 'bakery',
      quantity: '8 kg',
      expiresAt: inHours(10),
      location: { type: 'Point', coordinates: [BASE.lng + jitter(), BASE.lat + jitter()], label: 'Karol Bagh' },
    },
    {
      donor: donors[0]._id,
      title: 'Fresh produce crates',
      description: 'Overstock from this morning delivery - tomatoes, spinach, and carrots.',
      category: 'produce',
      quantity: '3 crates',
      expiresAt: inHours(20),
      location: { type: 'Point', coordinates: [BASE.lng + jitter(), BASE.lat + jitter()], label: 'Connaught Place' },
    },
  ]);

  console.log('[seed] created', donors.length, 'donors,', receivers.length, 'receivers, 3 listings');
  console.log('[seed] all demo passwords: password123');
  process.exit(0);
}

seed().catch((err) => {
  console.error('[seed] failed:', err);
  process.exit(1);
});
