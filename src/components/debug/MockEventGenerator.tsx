// components/debug/MockEventGenerator.tsx
import React, { useState } from 'react';
import { Zap, AlertCircle, CheckCircle, Users, Trash2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { EventService } from '../../services/firebase/eventService';
import { GuestService } from '../../services/firebase/guestService';
import { ContactService } from '../../services/firebase/contactService';
import { Event } from '../../types';
import { doc, updateDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { COLLECTIONS } from '../../types/firebase';
import './MockEventGenerator.scss';

const MockEventGenerator: React.FC = () => {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [createdCount, setCreatedCount] = useState(0);
  const [createdGuestCount, setCreatedGuestCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [eventCount, setEventCount] = useState(25);
  const [guestCount, setGuestCount] = useState(5);
  const [addGuests, setAddGuests] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isChangingPlan, setIsChangingPlan] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'pro' | 'enterprise'>(user?.planType || 'starter');

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
    { lat: 40.7829, lng: -73.9654 },
    { lat: 37.7694, lng: -122.4862 },
    { lat: 41.8837, lng: -87.6233 },
    { lat: 34.1360, lng: -118.3530 },
    { lat: 40.7580, lng: -73.9855 },
    { lat: 33.8121, lng: -117.9190 },
    { lat: 36.1699, lng: -115.1398 },
    { lat: 25.7907, lng: -80.1300 },
    { lat: 33.9850, lng: -118.4695 },
    { lat: 40.7061, lng: -74.0087 },
    { lat: 40.6892, lng: -74.0445 },
    { lat: 34.1028, lng: -118.3287 },
    { lat: 47.6205, lng: -122.3493 },
    { lat: 48.8584, lng: 2.2945 },
    { lat: 51.5007, lng: -0.1246 },
    { lat: 41.8902, lng: 12.4922 },
    { lat: 41.4036, lng: 2.1744 },
    { lat: 27.1751, lng: 78.0421 },
    { lat: 40.4764, lng: 103.9437 },
    { lat: 43.0896, lng: -79.0849 },
    { lat: 43.8791, lng: -103.2456 },
    { lat: 36.0544, lng: -112.1401 },
    { lat: 44.4280, lng: -110.5885 },
    { lat: 37.8267, lng: -122.4230 },
    { lat: 37.8087, lng: -122.4098 },
  ];

  const generateMockEvents = (): Partial<Event>[] => {
    const events: Partial<Event>[] = [];
    const now = new Date();

    for (let i = 0; i < eventCount; i++) {
      let daysOffset;
      if (i < Math.ceil(eventCount * 0.2)) {
        daysOffset = -Math.floor(Math.random() * 90) - 1;
      } else if (i < Math.ceil(eventCount * 0.4)) {
        daysOffset = Math.floor(Math.random() * 7);
      } else {
        daysOffset = Math.floor(Math.random() * 180) + 7;
      }

      const eventDate = new Date(now);
      eventDate.setDate(eventDate.getDate() + daysOffset);
      eventDate.setHours(Math.floor(Math.random() * 20) + 4, 0, 0, 0);

      const status = eventDate < now ? 'completed' : 'active';
      const maxGuests = guestCount + Math.floor(Math.random() * 10);
      const actualGuestCount = Math.floor(maxGuests * (0.5 + Math.random() * 0.5));
      const acceptedCount = Math.floor(actualGuestCount * (0.6 + Math.random() * 0.3));
      const pendingCount = Math.floor((actualGuestCount - acceptedCount) * 0.5);
      const declinedCount = actualGuestCount - acceptedCount - pendingCount;

      const coords = coordinates[i % coordinates.length];
      const titleIndex = i % eventTitles.length;

      events.push({
        title: eventTitles[titleIndex],
        description: descriptions[Math.floor(Math.random() * descriptions.length)],
        date: eventDate,
        location: locations[i % locations.length],
        latitude: coords.lat,
        longitude: coords.lng,
        maxGuests,
        status: status as any,
        createdAt: new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        tags: ['event', 'celebration', 'party'],
        isPrivate: Math.random() > 0.7,
        requireRSVP: true,
        allowPlusOne: Math.random() > 0.4,
        sendReminders: true,
        guestCount: actualGuestCount,
        acceptedCount,
        pendingCount,
        declinedCount,
        maybeCount: Math.floor((actualGuestCount - acceptedCount - declinedCount) * 0.3),
        dresscode: ['Casual', 'Smart Casual', 'Formal', 'Cocktail'][
          Math.floor(Math.random() * 4)
        ],
        additionalInfo: 'For more details, contact the organizer.',
      });
    }

    return events;
  };

  const firstNames = [
    'John', 'Jane', 'Michael', 'Emily', 'David', 'Sarah', 'Robert', 'Jessica',
    'James', 'Amanda', 'William', 'Anna', 'Richard', 'Emma', 'Joseph', 'Sophia',
    'Thomas', 'Olivia', 'Charles', 'Ava', 'Christopher', 'Isabella', 'Daniel',
    'Mia', 'Matthew', 'Charlotte', 'Mark', 'Amelia', 'Donald', 'Harper',
  ];

  const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
    'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
    'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
    'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  ];

  const generateMockGuests = (eventId: string) => {
    const guests = [];
    
    for (let i = 0; i < guestCount; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      
      guests.push({
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
        phone: `+48${String(Math.floor(Math.random() * 900000000) + 100000000)}`,
        dietaryRestrictions: ['', 'Vegan', 'Vegetarian', 'Gluten-free'][
          Math.floor(Math.random() * 4)
        ] || '',
        notes: ['', 'Bringing a plus one', 'Vegetarian diet', ''][
          Math.floor(Math.random() * 3)
        ] || '',
        plusOne: Math.random() > 0.7,
      });
    }
    
    return guests;
  };

  const handleGenerateMockEvents = async () => {
    if (!user?.id) {
      setError('User not authenticated');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSuccess(false);
    setCreatedCount(0);
    setCreatedGuestCount(0);

    try {
      const mockEvents = generateMockEvents();
      let eventCount = 0;
      let totalGuestCount = 0;

      for (const eventData of mockEvents) {
        try {
          const createdEvent = await EventService.createEvent(user.id, eventData as any);
          eventCount++;
          setCreatedCount(eventCount);

          // Add guests to the event if enabled
          if (addGuests && createdEvent?.id) {
            const mockGuests = generateMockGuests(createdEvent.id);
            
            for (const guestData of mockGuests) {
              try {
                // createGuest auto-creates a matching contact (guest === contact)
                await GuestService.createGuest(user.id, createdEvent.id, guestData);
                totalGuestCount++;
                setCreatedGuestCount(totalGuestCount);
              } catch (guestErr) {
                console.error('Error creating guest:', guestErr);
              }
            }
          }
        } catch (err) {
          console.error('Error creating event:', err);
        }
      }

      setSuccess(true);
    } catch (err) {
      setError(`Failed to generate events: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteAllTestData = async () => {
    if (!user?.id) {
      setError('User not authenticated');
      return;
    }

    setIsDeleting(true);
    setError(null);
    setSuccess(false);

    try {
      let deletedEvents = 0;
      let deletedGuests = 0;
      let deletedContacts = 0;

      // Get ALL user events first
      const allEventsResult = await EventService.getUserEvents(user.id, {}, 1000);
      console.log('Found events to delete:', allEventsResult.events.length);
      
      // Delete guests for each event
      for (const event of allEventsResult.events) {
        try {
          const guestQuery = query(
            collection(db, 'guests'),
            where('eventId', '==', event.id)
          );
          
          const guestDocs = await getDocs(guestQuery);
          for (const guestDoc of guestDocs.docs) {
            try {
              await deleteDoc(guestDoc.ref);
              deletedGuests++;
              console.log(`Deleted guest: ${guestDoc.id}`);
            } catch (err) {
              console.error('Error deleting guest:', err);
            }
          }
        } catch (err) {
          console.warn('Could not delete guests for event:', err);
        }
      }

      // Delete all events
      for (const event of allEventsResult.events) {
        try {
          await EventService.deleteEvent(event.id);
          deletedEvents++;
          console.log(`Deleted event: ${event.id}`);
        } catch (err) {
          console.error('Error deleting event:', err);
        }
      }

      // Delete ALL user contacts
      try {
        const contactResult = await ContactService.getUserContacts(
          user.id,
          {},
          1000
        );
        
        for (const contact of contactResult.contacts) {
          try {
            await ContactService.deleteContact(contact.id);
            deletedContacts++;
          } catch (err) {
            console.error('Error deleting contact:', err);
          }
        }
      } catch (err) {
        console.warn('Could not delete contacts:', err);
      }

      setSuccess(true);
      setShowDeleteConfirm(false);
      setError(`✅ Deleted: ${deletedEvents} events, ${deletedGuests} guests, ${deletedContacts} contacts`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error('Delete error:', errorMsg);
      setError(`Failed to delete test data: ${errorMsg}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleChangePlan = async (newPlan: 'starter' | 'pro' | 'enterprise') => {
    if (!user?.id) {
      setError('User not authenticated');
      return;
    }

    setIsChangingPlan(true);
    setError(null);

    try {
      const userRef = doc(db, COLLECTIONS.USERS, user.id);
      await updateDoc(userRef, {
        planType: newPlan,
      });

      setSelectedPlan(newPlan);
      setSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error('Plan change error:', errorMsg);
      setError(`Failed to change plan: ${errorMsg}`);
    } finally {
      setIsChangingPlan(false);
    }
  };

  return (
    <div className="mock-event-generator">
      <div className="mock-event-generator__card">
        <div className="mock-event-generator__header">
          <div className="mock-event-generator__title-wrapper">
            <Zap size={24} className="mock-event-generator__icon" />
            <h2>Test Data Generator</h2>
          </div>
          <p className="mock-event-generator__subtitle">
            Create realistic test events with guests and contacts. Delete all test data at once. Switch between pricing plans.
          </p>
        </div>

        <div className="mock-event-generator__content">
          {error && (
            <div className="mock-event-generator__alert mock-event-generator__alert--error">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {success && !isDeleting && (
            <div className="mock-event-generator__alert mock-event-generator__alert--success">
              <CheckCircle size={20} />
              <span>
                Successfully created {createdCount} events
                {addGuests && createdGuestCount > 0 && ` with ${createdGuestCount} guests & contacts!`}
              </span>
            </div>
          )}

          {isGenerating && (
            <div className="mock-event-generator__progress">
              <div className="mock-event-generator__progress-item">
                <p>Creating events: {createdCount}/{eventCount}</p>
                <div className="mock-event-generator__progress-bar">
                  <div
                    className="mock-event-generator__progress-fill"
                    style={{ width: `${(createdCount / eventCount) * 100}%` }}
                  />
                </div>
              </div>
              {addGuests && (
                <div className="mock-event-generator__progress-item">
                  <p>Creating guests (+ contacts auto-synced): {createdGuestCount}/{eventCount * guestCount}</p>
                  <div className="mock-event-generator__progress-bar">
                    <div
                      className="mock-event-generator__progress-fill"
                      style={{ width: `${(createdGuestCount / (eventCount * guestCount)) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {isDeleting && (
            <div className="mock-event-generator__progress">
              <p>Deleting test data...</p>
              <div className="mock-event-generator__progress-bar">
                <div
                  className="mock-event-generator__progress-fill"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          )}

          {showDeleteConfirm && (
            <div className="mock-event-generator__confirm-modal">
              <div className="mock-event-generator__confirm-content">
                <h3>⚠️ Delete All Test Data?</h3>
                <p>This will permanently delete all test events, guests, and contacts.</p>
                <p className="mock-event-generator__confirm-warning">This action cannot be undone.</p>
                <div className="mock-event-generator__confirm-buttons">
                  <button
                    className="mock-event-generator__confirm-btn mock-event-generator__confirm-btn--cancel"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>
                  <button
                    className="mock-event-generator__confirm-btn mock-event-generator__confirm-btn--delete"
                    onClick={handleDeleteAllTestData}
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete All'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {!isGenerating && !isDeleting && !showDeleteConfirm && (
            <div className="mock-event-generator__config">
              <div className="mock-event-generator__config-group">
                <label htmlFor="event-count" className="mock-event-generator__label">
                  📅 Number of Events
                </label>
                <input
                  id="event-count"
                  type="number"
                  min="1"
                  max="100"
                  value={eventCount}
                  onChange={(e) => setEventCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="mock-event-generator__input"
                  disabled={isGenerating}
                />
              </div>

              <div className="mock-event-generator__config-group">
                <label htmlFor="guest-count" className="mock-event-generator__label">
                  <Users size={16} />
                  Guests per Event
                </label>
                <input
                  id="guest-count"
                  type="number"
                  min="1"
                  max="100"
                  value={guestCount}
                  onChange={(e) => setGuestCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="mock-event-generator__input"
                  disabled={isGenerating}
                />
              </div>

              <div className="mock-event-generator__checkbox-group">
                <label className="mock-event-generator__checkbox">
                  <input
                    type="checkbox"
                    checked={addGuests}
                    onChange={(e) => setAddGuests(e.target.checked)}
                    disabled={isGenerating}
                  />
                  <span>Create mock guests & auto-generate contacts</span>
                </label>
              </div>

              {/* Plan Selector */}
              <div className="mock-event-generator__plan-selector">
                <label className="mock-event-generator__label">📦 Test Pricing Plans</label>
                <div className="mock-event-generator__plan-buttons">
                  <button
                    className={`mock-event-generator__plan-btn ${selectedPlan === 'starter' ? 'mock-event-generator__plan-btn--active' : ''}`}
                    onClick={() => handleChangePlan('starter')}
                    disabled={isChangingPlan}
                  >
                    Starter
                  </button>
                  <button
                    className={`mock-event-generator__plan-btn ${selectedPlan === 'pro' ? 'mock-event-generator__plan-btn--active' : ''}`}
                    onClick={() => handleChangePlan('pro')}
                    disabled={isChangingPlan}
                  >
                    Pro
                  </button>
                  <button
                    className={`mock-event-generator__plan-btn ${selectedPlan === 'enterprise' ? 'mock-event-generator__plan-btn--active' : ''}`}
                    onClick={() => handleChangePlan('enterprise')}
                    disabled={isChangingPlan}
                  >
                    Enterprise
                  </button>
                </div>
              </div>

              <div className="mock-event-generator__description">
                <p><strong>This will create:</strong></p>
                <ul>
                  <li>✅ {eventCount} test event{eventCount !== 1 ? 's' : ''}</li>
                  {addGuests && (
                    <>
                      <li>✅ {guestCount} guest{guestCount !== 1 ? 's' : ''} per event ({eventCount * guestCount} total)</li>
                      <li>✅ {eventCount * guestCount} contact{eventCount * guestCount !== 1 ? 's' : ''} auto-synced from guests</li>
                    </>
                  )}
                  <li>✅ Realistic names, emails, and phone numbers</li>
                  <li>✅ Random dietary restrictions</li>
                  <li>✅ Some with plus-ones</li>
                  <li>✅ Various event dates (past, upcoming, far future)</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="mock-event-generator__buttons">
          <button
            className="mock-event-generator__button"
            onClick={handleGenerateMockEvents}
            disabled={isGenerating || isDeleting || !user?.id}
          >
            {isGenerating
              ? `Creating test data...`
              : `⚡ Generate Test Data`}
          </button>
          
          <button
            className="mock-event-generator__button mock-event-generator__button--delete"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isGenerating || isDeleting || !user?.id}
          >
            <Trash2 size={16} />
            Delete All Test Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default MockEventGenerator;
