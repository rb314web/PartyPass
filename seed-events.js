// seed-events.js - Script to generate 25 mock events for testing
const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

// Check if service account exists, if not use environment variable
let serviceAccount;
try {
  serviceAccount = require(serviceAccountPath);
} catch (error) {
  console.log('Service account file not found, using environment configuration');
  admin.initializeApp();
}

if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

// Mock event data
const eventTitles = [
  'Birthday Party 🎂',
  'Wedding Celebration 💍',
  'Corporate Team Building',
  'Garden Party 🌸',
  'Cocktail Night 🍹',
  'Music Festival 🎵',
  'Art Exhibition 🎨',
  'Charity Gala ✨',
  'BBQ Gathering 🔥',
  'Dinner Party 🍽️',
  'Pool Party 🏊',
  'Halloween Party 🎃',
  'New Year\'s Eve 🎆',
  'Graduation Celebration',
  'Product Launch 🚀',
  'Tech Conference 💻',
  'Networking Event 🤝',
  'Wine Tasting 🍷',
  'Game Night 🎮',
  'Karaoke Night 🎤',
  'Picnic Day 🧺',
  'Festival 🎪',
  'Workshop 📚',
  'Meetup 👥',
  'Grand Opening 🎉',
];

const locations = [
  'Central Park, New York',
  'Golden Gate Park, San Francisco',
  'Millennium Park, Chicago',
  'Universal Studios, Los Angeles',
  'Times Square, New York',
  'Disneyland, Anaheim',
  'Las Vegas Strip, Nevada',
  'Miami Beach, Florida',
  'Venice Beach, California',
  'Brooklyn Bridge, New York',
  'Statue of Liberty, New York',
  'Hollywood Walk of Fame, Los Angeles',
  'Space Needle, Seattle',
  'Eiffel Tower, Paris',
  'Big Ben, London',
  'Colosseum, Rome',
  'Sagrada Familia, Barcelona',
  'Taj Mahal, India',
  'Great Wall, China',
  'Niagara Falls, Canada',
  'Mount Rushmore, South Dakota',
  'Grand Canyon, Arizona',
  'Yellowstone, Wyoming',
  'Alcatraz Island, California',
  'Pier 39, San Francisco',
];

const descriptions = [
  'Join us for an unforgettable evening of celebration and fun!',
  'You\'re invited to celebrate this special occasion with us.',
  'Come and enjoy great company, food, and entertainment.',
  'Looking forward to seeing you there! RSVP required.',
  'We can\'t wait to celebrate with you and all our guests.',
  'This is going to be an amazing event you don\'t want to miss!',
  'Save the date and bring your friends and family.',
  'Get ready for the party of the year!',
  'You and your guests are cordially invited to join us.',
  'Come celebrate life, love, and laughter with us!',
];

const coordinates = [
  { lat: 40.7829, lng: -73.9654 }, // Central Park
  { lat: 37.7694, lng: -122.4862 }, // Golden Gate Park
  { lat: 41.8837, lng: -87.6233 }, // Millennium Park
  { lat: 34.1360, lng: -118.3530 }, // Universal Studios
  { lat: 40.7580, lng: -73.9855 }, // Times Square
  { lat: 33.8121, lng: -117.9190 }, // Disneyland
  { lat: 36.1699, lng: -115.1398 }, // Vegas Strip
  { lat: 25.7907, lng: -80.1300 }, // Miami Beach
  { lat: 33.9850, lng: -118.4695 }, // Venice Beach
  { lat: 40.7061, lng: -74.0087 }, // Brooklyn Bridge
  { lat: 40.6892, lng: -74.0445 }, // Statue of Liberty
  { lat: 34.1028, lng: -118.3287 }, // Hollywood Walk
  { lat: 47.6205, lng: -122.3493 }, // Space Needle
  { lat: 48.8584, lng: 2.2945 }, // Eiffel Tower
  { lat: 51.5007, lng: -0.1246 }, // Big Ben
  { lat: 41.8902, lng: 12.4922 }, // Colosseum
  { lat: 41.4036, lng: 2.1744 }, // Sagrada Familia
  { lat: 27.1751, lng: 78.0421 }, // Taj Mahal
  { lat: 40.4764, lng: 103.9437 }, // Great Wall
  { lat: 43.0896, lng: -79.0849 }, // Niagara Falls
  { lat: 43.8791, lng: -103.2456 }, // Mount Rushmore
  { lat: 36.0544, lng: -112.1401 }, // Grand Canyon
  { lat: 44.4280, lng: -110.5885 }, // Yellowstone
  { lat: 37.8267, lng: -122.4230 }, // Alcatraz
  { lat: 37.8087, lng: -122.4098 }, // Pier 39
];

function generateMockEvents(userId) {
  const events = [];
  const now = new Date();

  for (let i = 0; i < 25; i++) {
    // Distribute events across past (5), present (5), and future (15)
    let daysOffset;
    if (i < 5) {
      daysOffset = -Math.floor(Math.random() * 90) - 1; // Past events
    } else if (i < 10) {
      daysOffset = Math.floor(Math.random() * 7); // Current week
    } else {
      daysOffset = Math.floor(Math.random() * 180) + 7; // Future events
    }

    const eventDate = new Date(now);
    eventDate.setDate(eventDate.getDate() + daysOffset);
    eventDate.setHours(Math.floor(Math.random() * 20) + 4, 0, 0, 0);

    const status =
      eventDate < now ? 'completed' : Math.random() > 0.2 ? 'active' : 'draft';
    const maxGuests = Math.floor(Math.random() * 150) + 20;
    const guestCount = Math.floor(maxGuests * (0.5 + Math.random() * 0.5));
    const acceptedCount = Math.floor(guestCount * (0.6 + Math.random() * 0.3));
    const pendingCount = Math.floor((guestCount - acceptedCount) * 0.5);
    const declinedCount = guestCount - acceptedCount - pendingCount;

    const coords = coordinates[i % coordinates.length];

    const event = {
      userId,
      title: eventTitles[i],
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      date: new Date(eventDate),
      location: locations[i % locations.length],
      latitude: coords.lat,
      longitude: coords.lng,
      maxGuests,
      status,
      createdAt: new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
      tags: ['event', 'celebration', 'party'],
      isPrivate: Math.random() > 0.7,
      requireRSVP: true,
      allowPlusOne: Math.random() > 0.4,
      sendReminders: true,
      guestCount,
      acceptedCount,
      pendingCount,
      declinedCount,
      maybeCount: Math.floor((guestCount - acceptedCount - declinedCount) * 0.3),
      dresscode: ['Casual', 'Smart Casual', 'Formal', 'Cocktail'][
        Math.floor(Math.random() * 4)
      ],
      additionalInfo: 'For more details, contact the organizer.',
    };

    events.push(event);
  }

  return events;
}

async function seedEvents() {
  try {
    // Get current user from auth
    const auth = admin.auth();
    console.log('🔍 Fetching auth user...');

    // If you have a specific user UID, use it directly
    // For demo purposes, we'll create a test user or use an existing one
    const userId = process.argv[2] || 'demo-user-123';

    console.log(`\n📝 Generating 25 mock events for user: ${userId}\n`);

    const mockEvents = generateMockEvents(userId);

    const eventsCollection = db.collection('events');
    let createdCount = 0;

    for (const eventData of mockEvents) {
      try {
        const docRef = await eventsCollection.add({
          ...eventData,
          createdAt: admin.firestore.Timestamp.fromDate(eventData.createdAt),
          updatedAt: admin.firestore.Timestamp.fromDate(eventData.updatedAt),
          date: admin.firestore.Timestamp.fromDate(eventData.date),
        });

        createdCount++;
        console.log(
          `✅ Created event: "${eventData.title}" (ID: ${docRef.id})`
        );
      } catch (error) {
        console.error(`❌ Error creating event: ${error.message}`);
      }
    }

    console.log(`\n🎉 Successfully created ${createdCount}/25 events!\n`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding events:', error);
    process.exit(1);
  }
}

seedEvents();
