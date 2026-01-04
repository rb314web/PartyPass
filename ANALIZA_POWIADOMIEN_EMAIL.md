# 📧 Analiza Wprowadzenia Systemu Powiadomień Email z EmailJS

## 📊 Status Obecny

### ✅ Co już jest zaimplementowane:

1. **EmailJS zainstalowany** - `@emailjs/browser` v4.4.1
2. **EmailService** - podstawowy serwis w `src/services/emailService.ts`
3. **Funkcjonalności już działające:**
   - ✅ Formularz kontaktowy (ContactSection)
   - ✅ Zaproszenia do wydarzeń (sendInvitationEmail)
   - ✅ Wysyłka zbiorczych zaproszeń (sendBulkInvitationEmails)
   - ✅ Inicjalizacja w App.tsx

### ⚠️ Co wymaga rozszerzenia:

1. **Powiadomienia o akcjach gości** - gdy ktoś potwierdzi/odrzuci zaproszenie
2. **Przypomnienia o wydarzeniach** - automatyczne przed datą wydarzenia
3. **Podsumowania** - dzienne/tygodniowe dla organizatora
4. **Aktualizacje wydarzeń** - gdy wydarzenie zostanie zmienione
5. **Integracja z NotificationSettings** - respektowanie preferencji użytkownika

---

## 🎯 Typy Powiadomień do Implementacji

### 1. **Powiadomienia RSVP** (Wysoki priorytet)

**Kiedy:** Gdy gość odpowie na zaproszenie

**Odbiorcy:** Organizator wydarzenia

**Typy:**
- ✅ Gość potwierdził obecność
- ❌ Gość odrzucił zaproszenie
- ❓ Gość jest niezdecydowany
- ➕ Gość dodał osobę towarzyszącą

**Template EmailJS:**
```
Temat: {{guest_name}} odpowiedział na zaproszenie - {{event_title}}

Cześć {{organizer_name}}!

{{guest_name}} ({{guest_email}}) właśnie {{response_text}} zaproszenie 
na wydarzenie "{{event_title}}".

Status: {{status_badge}}
Data wydarzenia: {{event_date}}
{{#if plusOne}}Osoba towarzysząca: {{plusOne_details}}{{/if}}
{{#if dietary}}Preferencje: {{dietary_restrictions}}{{/if}}
{{#if notes}}Notatki: {{notes}}{{/if}}

📊 Aktualna statystyka:
- Potwierdzeni: {{accepted_count}}/{{total_guests}}
- Oczekujący: {{pending_count}}
- Odrzucili: {{declined_count}}

Zobacz szczegóły:
{{event_url}}

---
PartyPass - Twój asystent wydarzeń
```

**Zmienne:**
- `guest_name`, `guest_email`
- `organizer_name`
- `event_title`, `event_date`, `event_url`
- `response_text` ("potwierdził", "odrzucił", "jest niezdecydowany")
- `status_badge` (✅/❌/❓)
- Statystyki: `accepted_count`, `pending_count`, `declined_count`, `total_guests`

---

### 2. **Przypomnienia o Wydarzeniach** (Wysoki priorytet)

**Kiedy:** 
- 7 dni przed wydarzeniem
- 3 dni przed wydarzeniem
- 1 dzień przed wydarzeniem
- 2 godziny przed wydarzeniem

**Odbiorcy:** Organizator + Goście potwierdzeni

**Template dla organizatora:**
```
Temat: Przypomnienie: {{event_title}} za {{days_until}}

Cześć {{organizer_name}}!

Twoje wydarzenie "{{event_title}}" odbędzie się {{time_description}}.

📅 Data: {{event_date}}
📍 Miejsce: {{event_location}}
👥 Goście: {{accepted_count}}/{{total_guests}} potwierdzonych

Statystyka RSVP:
✅ Potwierdzeni: {{accepted_count}}
⏳ Oczekujący: {{pending_count}}
❌ Odmówili: {{declined_count}}

{{#if pending_count > 0}}
⚠️ Masz jeszcze {{pending_count}} gości bez odpowiedzi.
{{/if}}

Przejdź do wydarzenia:
{{event_url}}

---
PartyPass
```

**Template dla gości:**
```
Temat: Przypomnienie: {{event_title}} za {{days_until}}

Cześć {{guest_name}}!

Przypominamy o wydarzeniu "{{event_title}}", na które potwierdziłeś obecność.

📅 {{event_date}}
📍 {{event_location}}
{{#if dresscode}}👔 Dress code: {{dresscode}}{{/if}}

{{#if additional_info}}
ℹ️ Dodatkowe informacje:
{{additional_info}}
{{/if}}

Do zobaczenia!

---
{{organizer_name}}
```

---

### 3. **Aktualizacje Wydarzeń** (Średni priorytet)

**Kiedy:** Gdy organizator zmieni szczegóły wydarzenia

**Odbiorcy:** Wszyscy potwierdzeni goście

**Template:**
```
Temat: Zmiana w wydarzeniu: {{event_title}}

Cześć {{guest_name}}!

Organizator wprowadził zmiany w wydarzeniu "{{event_title}}":

{{changes_list}}

Aktualne informacje:
📅 Data: {{event_date}}
📍 Miejsce: {{event_location}}
{{#if dresscode}}👔 Dress code: {{dresscode}}{{/if}}

{{#if description}}
Opis:
{{description}}
{{/if}}

Jeśli to wpływa na Twoją obecność, możesz zmienić odpowiedź:
{{rsvp_url}}

---
{{organizer_name}}
```

---

### 4. **Podsumowania Okresowe** (Niski priorytet)

**Kiedy:** Zgodnie z ustawieniami (dzienny/tygodniowy)

**Odbiorcy:** Organizator

**Template dzienny:**
```
Temat: Podsumowanie dnia - PartyPass

Cześć {{user_name}}!

📊 Twoje wydarzenia dzisiaj ({{date}}):

{{#each upcoming_events}}
🎉 {{this.title}}
   Data: {{this.date}}
   Status: {{this.accepted}}/{{this.total}} gości
{{/each}}

{{#if new_responses}}
📬 Nowe odpowiedzi: {{new_responses_count}}
{{#each new_responses}}
  {{this.status_icon}} {{this.guest_name}} - {{this.event_title}}
{{/each}}
{{/if}}

{{#if analytics}}
📈 Statystyki:
- Całkowita liczba gości: {{total_guests}}
- Wskaźnik odpowiedzi: {{response_rate}}%
- Aktywne wydarzenia: {{active_events}}
{{/if}}

Zobacz szczegóły:
{{dashboard_url}}

---
PartyPass
```

---

## 🏗️ Architektura Implementacji

### Warstwa 1: EmailService (Istniejąca + Rozszerzenie)

**Lokalizacja:** `src/services/emailService.ts`

**Nowe metody do dodania:**

```typescript
export class EmailService {
  // Istniejące (już zaimplementowane):
  // - init()
  // - sendInvitationEmail()
  // - sendBulkInvitationEmails()
  // - sendContactForm()
  // - isConfigured()
  // - getConfigurationStatus()

  // NOWE METODY DO DODANIA:

  /**
   * Wysyła powiadomienie o odpowiedzi RSVP do organizatora
   */
  static async sendRSVPNotification(
    organizerEmail: string,
    organizerName: string,
    guestName: string,
    guestEmail: string,
    event: Event,
    response: RSVPResponse,
    currentStats: {
      accepted: number;
      pending: number;
      declined: number;
      total: number;
    }
  ): Promise<void> { }

  /**
   * Wysyła przypomnienie o wydarzeniu
   */
  static async sendEventReminder(
    recipient: {
      email: string;
      name: string;
      isOrganizer: boolean;
    },
    event: Event,
    daysUntil: number,
    organizerStats?: {
      accepted: number;
      pending: number;
      declined: number;
      total: number;
    }
  ): Promise<void> { }

  /**
   * Wysyła powiadomienie o aktualizacji wydarzenia
   */
  static async sendEventUpdateNotification(
    guests: Array<{ email: string; name: string }>,
    event: Event,
    changes: string[],
    organizerName: string
  ): Promise<void> { }

  /**
   * Wysyła dzienny digest
   */
  static async sendDailyDigest(
    userEmail: string,
    userName: string,
    data: {
      upcomingEvents: Array<{
        title: string;
        date: Date;
        accepted: number;
        total: number;
      }>;
      newResponses: Array<{
        guestName: string;
        eventTitle: string;
        status: string;
      }>;
      analytics?: {
        totalGuests: number;
        responseRate: number;
        activeEvents: number;
      };
    }
  ): Promise<void> { }

  /**
   * Wysyła tygodniowy digest
   */
  static async sendWeeklyDigest(
    userEmail: string,
    userName: string,
    data: {
      weekSummary: string;
      upcomingEvents: any[];
      completedEvents: any[];
      analytics: any;
    }
  ): Promise<void> { }
}
```

---

### Warstwa 2: NotificationTriggers (Nowy serwis)

**Lokalizacja:** `src/services/notificationTriggers.ts` (NOWY PLIK)

**Odpowiedzialność:** Nasłuchuje zdarzeń i wyzwala powiadomienia email

```typescript
export class NotificationTriggers {
  /**
   * Wyzwala powiadomienie gdy gość odpowie na RSVP
   */
  static async onGuestResponse(
    guestId: string,
    eventId: string,
    response: RSVPResponse
  ): Promise<void> {
    // 1. Pobierz dane gościa, wydarzenia i organizatora
    // 2. Sprawdź preferencje powiadomień organizatora
    // 3. Jeśli organizator ma włączone powiadomienia email.rsvpUpdates
    // 4. Wyślij email przez EmailService.sendRSVPNotification()
  }

  /**
   * Ustawia przypomnienia dla wydarzenia
   */
  static async scheduleEventReminders(
    event: Event
  ): Promise<void> {
    // 1. Oblicz daty przypomnieńś (7d, 3d, 1d, 2h przed)
    // 2. Sprawdź preferencje organizatora
    // 3. Zaplanuj przypomnienia (może przez Firebase Cloud Scheduler)
  }

  /**
   * Wyzwala powiadomienie o aktualizacji wydarzenia
   */
  static async onEventUpdate(
    eventId: string,
    changes: string[]
  ): Promise<void> {
    // 1. Pobierz listę potwierdzonych gości
    // 2. Sprawdź czy organizator ma włączone email.eventUpdates
    // 3. Wyślij powiadomienia do gości
  }

  /**
   * Wysyła dzienny digest
   */
  static async sendScheduledDailyDigest(
    userId: string
  ): Promise<void> {
    // 1. Sprawdź preferencje użytkownika (digest.frequency === 'daily')
    // 2. Pobierz dane dla digestu
    // 3. Wyślij email
  }
}
```

---

### Warstwa 3: Integracja z NotificationSettings

**Lokalizacja:** `src/components/dashboard/Settings/NotificationSettings/NotificationSettings.tsx`

**Status:** ✅ UI już istnieje, trzeba podpiąć backend

**Struktura ustawień powiadomień (już istniejąca):**

```typescript
interface NotificationSettingsState {
  email: {
    enabled: boolean;
    eventReminders: boolean;
    rsvpUpdates: boolean;
    eventUpdates: boolean;
    weeklyDigest: boolean;
  };
  sms: {
    enabled: boolean;
    urgentOnly: boolean;
    eventReminders: boolean;
  };
  push: {
    enabled: boolean;
    eventReminders: boolean;
    rsvpUpdates: boolean;
    browserNotifications: boolean;
  };
  digest: {
    frequency: 'never' | 'daily' | 'weekly';
    time: string;
    includeAnalytics: boolean;
    includeUpcoming: boolean;
  };
}
```

**Akcje potrzebne:**
- Zapisać ustawienia do Firestore (kolekcja `userSettings`)
- Dodać serwis do odczytu/zapisu ustawień
- Sprawdzać ustawienia przed wysłaniem każdego emaila

---

## 🚀 Plan Implementacji

### Faza 1: Rozszerzenie EmailService (1-2h)

**Priorytet:** WYSOKI

**Kroki:**
1. Dodać nowe metody do EmailService
2. Stworzyć szablony EmailJS dla każdego typu powiadomienia
3. Przetestować wysyłkę

**Pliki do edycji:**
- `src/services/emailService.ts`

**Nowe szablony EmailJS potrzebne:**
- `template_rsvp_notification` - powiadomienie o odpowiedzi RSVP
- `template_event_reminder_organizer` - przypomnienie dla organizatora
- `template_event_reminder_guest` - przypomnienie dla gościa
- `template_event_update` - aktualizacja wydarzenia
- `template_daily_digest` - dzienny digest
- `template_weekly_digest` - tygodniowy digest

---

### Faza 2: NotificationTriggers Service (2-3h)

**Priorytet:** WYSOKI

**Kroki:**
1. Stworzyć nowy plik `src/services/notificationTriggers.ts`
2. Zaimplementować triggery dla każdego typu powiadomienia
3. Dodać sprawdzanie preferencji użytkownika

**Pliki do stworzenia:**
- `src/services/notificationTriggers.ts`

**Integracja:**
- Podpiąć w `RSVPService.processRSVPResponse()` 
- Podpiąć w `EventService.updateEvent()`
- Podpiąć w `EventService.createEvent()`

---

### Faza 3: UserSettings Service (1-2h)

**Priorytet:** ŚREDNI

**Kroki:**
1. Stworzyć serwis do zarządzania ustawieniami użytkownika
2. Dodać metodę zapisu do Firestore
3. Dodać metodę odczytu ustawień
4. Podpiąć do NotificationSettings komponentu

**Pliki do stworzenia:**
- `src/services/firebase/userSettingsService.ts`

**Pliki do edycji:**
- `src/components/dashboard/Settings/NotificationSettings/NotificationSettings.tsx`

**Struktura Firestore:**
```javascript
// Kolekcja: userSettings
{
  userId: string,
  notifications: {
    email: { ... },
    sms: { ... },
    push: { ... },
    digest: { ... }
  },
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

### Faza 4: Zaplanowane Przypomnienia (3-4h)

**Priorytet:** ŚREDNI

**Opcja A: Firebase Cloud Functions + Cloud Scheduler**
- Funkcja cron uruchamiana codziennie
- Sprawdza nadchodzące wydarzenia
- Wysyła przypomnienia zgodnie z harmonogramem

**Opcja B: Client-side scheduling**
- Sprawdzanie przy załadowaniu dashboard
- Wysyłka jeśli nadszedł czas

**Rekomendacja:** Opcja A (bardziej niezawodna)

**Pliki potrzebne:**
- `functions/src/scheduledNotifications.ts` (nowy)
- Konfiguracja Cloud Scheduler w Firebase

---

### Faza 5: Testy i Optymalizacja (1-2h)

**Kroki:**
1. Dodać przyciski testowe w NotificationSettings (już są w UI!)
2. Zaimplementować akcje testowe
3. Przetestować każdy typ powiadomienia
4. Dodać rate limiting
5. Dodać obsługę błędów i retry logic

---

## 📝 Zmienne Środowiskowe

### Obecne (już w użyciu):
```env
REACT_APP_EMAILJS_SERVICE_ID=service_xxxxx
REACT_APP_EMAILJS_TEMPLATE_ID=template_xxxxx
REACT_APP_EMAILJS_CONTACT_TEMPLATE_ID=template_xxxxx
REACT_APP_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxx
```

### Nowe do dodania:
```env
# Template IDs dla różnych typów powiadomień
REACT_APP_EMAILJS_RSVP_TEMPLATE_ID=template_xxxxx
REACT_APP_EMAILJS_REMINDER_ORG_TEMPLATE_ID=template_xxxxx
REACT_APP_EMAILJS_REMINDER_GUEST_TEMPLATE_ID=template_xxxxx
REACT_APP_EMAILJS_UPDATE_TEMPLATE_ID=template_xxxxx
REACT_APP_EMAILJS_DIGEST_DAILY_TEMPLATE_ID=template_xxxxx
REACT_APP_EMAILJS_DIGEST_WEEKLY_TEMPLATE_ID=template_xxxxx
```

---

## 🔐 Bezpieczeństwo i Limity

### EmailJS Limity (Free Plan):
- **200 emaili/miesiąc**
- **2 email services**
- **2 email templates**

### Rekomendacje:
1. **Upgrade do płatnego planu** jeśli będziesz wysyłać więcej niż 200 emaili/miesiąc
2. **Rate limiting** - maksymalnie X emaili na godzinę na użytkownika
3. **Batch sending** - grupuj powiadomienia (np. 1 email z wieloma aktualizacjami)
4. **Respektuj preferencje** - nie wysyłaj jeśli użytkownik wyłączył
5. **Unsubscribe link** - dodaj link do wyłączenia powiadomień

---

## 🎯 Priorytetyzacja

### Must Have (MVP):
1. ✅ **Powiadomienia RSVP** - organizator dowiaduje się o odpowiedziach
2. ✅ **Przypomnienia 1 dzień przed** - dla organizatora i gości
3. ✅ **Zapisywanie ustawień** - respektowanie preferencji

### Nice to Have:
4. **Przypomnienia wieloetapowe** (7d, 3d, 1d, 2h)
5. **Aktualizacje wydarzeń** - gdy coś się zmieni
6. **Dzienny/tygodniowy digest**

### Future:
7. **SMS notifications** (wymaga integracji z Twilio)
8. **Push notifications** (wymaga Firebase Cloud Messaging)
9. **Personalizacja treści** emaili
10. **A/B testing** subject lines

---

## 💻 Kod do Implementacji

### 1. Rozszerzenie EmailService

**Dodaj do `src/services/emailService.ts`:**

```typescript
// Nowe template IDs
private static readonly RSVP_NOTIFICATION_TEMPLATE_ID =
  process.env.REACT_APP_EMAILJS_RSVP_TEMPLATE_ID || '';
private static readonly REMINDER_ORGANIZER_TEMPLATE_ID =
  process.env.REACT_APP_EMAILJS_REMINDER_ORG_TEMPLATE_ID || '';
private static readonly REMINDER_GUEST_TEMPLATE_ID =
  process.env.REACT_APP_EMAILJS_REMINDER_GUEST_TEMPLATE_ID || '';

/**
 * Wysyła powiadomienie o odpowiedzi RSVP
 */
static async sendRSVPNotification(
  organizerEmail: string,
  organizerName: string,
  guestData: {
    name: string;
    email: string;
    response: 'accepted' | 'declined' | 'maybe';
    plusOne?: string;
    dietary?: string;
    notes?: string;
  },
  event: Event,
  stats: {
    accepted: number;
    pending: number;
    declined: number;
    total: number;
  }
): Promise<void> {
  if (!this.RSVP_NOTIFICATION_TEMPLATE_ID) {
    console.warn('RSVP notification template not configured');
    return;
  }

  const responseText = {
    accepted: 'potwierdził',
    declined: 'odrzucił',
    maybe: 'jest niezdecydowany na'
  }[guestData.response];

  const statusBadge = {
    accepted: '✅ Potwierdził',
    declined: '❌ Odrzucił',
    maybe: '❓ Niezdecydowany'
  }[guestData.response];

  const templateParams = {
    to_email: organizerEmail,
    organizer_name: organizerName,
    guest_name: guestData.name,
    guest_email: guestData.email,
    event_title: event.title,
    event_date: new Date(event.date).toLocaleDateString('pl-PL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    event_url: `${window.location.origin}/dashboard/events/${event.id}`,
    response_text: responseText,
    status_badge: statusBadge,
    plusOne: guestData.plusOne || '',
    dietary_restrictions: guestData.dietary || '',
    notes: guestData.notes || '',
    accepted_count: stats.accepted,
    pending_count: stats.pending,
    declined_count: stats.declined,
    total_guests: stats.total,
  };

  await emailjs.send(
    this.SERVICE_ID,
    this.RSVP_NOTIFICATION_TEMPLATE_ID,
    templateParams,
    this.PUBLIC_KEY
  );
}
```

---

### 2. NotificationTriggers Service

**Utwórz `src/services/notificationTriggers.ts`:**

```typescript
import { EmailService } from './emailService';
import { Event, RSVPResponse } from '../types';
import { EventService } from './firebase/eventService';
import { GuestService } from './firebase/guestService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export class NotificationTriggers {
  /**
   * Sprawdza czy użytkownik ma włączone powiadomienia email
   */
  private static async getUserEmailSettings(userId: string): Promise<any> {
    try {
      const settingsDoc = await getDoc(doc(db, 'userSettings', userId));
      if (settingsDoc.exists()) {
        const settings = settingsDoc.data();
        return settings.notifications?.email || null;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user settings:', error);
      return null;
    }
  }

  /**
   * Wyzwala powiadomienie email o odpowiedzi RSVP
   */
  static async onGuestResponse(
    eventId: string,
    guestId: string,
    response: RSVPResponse
  ): Promise<void> {
    try {
      // 1. Pobierz dane wydarzenia
      const event = await EventService.getEvent(eventId);
      if (!event) return;

      // 2. Pobierz ustawienia organizatora
      const emailSettings = await this.getUserEmailSettings(event.userId);
      if (!emailSettings?.enabled || !emailSettings?.rsvpUpdates) {
        console.log('Email notifications disabled for user:', event.userId);
        return;
      }

      // 3. Pobierz dane gościa
      const guest = await GuestService.getGuest(guestId);
      if (!guest) return;

      // 4. Pobierz dane organizatora (z Firebase Auth lub users collection)
      const organizerDoc = await getDoc(doc(db, 'users', event.userId));
      const organizerData = organizerDoc.exists() ? organizerDoc.data() : null;
      const organizerEmail = organizerData?.email || '';
      const organizerName = organizerData?.displayName || 'Organizator';

      // 5. Pobierz statystyki gości
      const allGuests = await GuestService.getEventGuests(eventId);
      const stats = {
        accepted: allGuests.filter(g => g.status === 'accepted').length,
        pending: allGuests.filter(g => g.status === 'pending').length,
        declined: allGuests.filter(g => g.status === 'declined').length,
        total: allGuests.length,
      };

      // 6. Wyślij powiadomienie
      await EmailService.sendRSVPNotification(
        organizerEmail,
        organizerName,
        {
          name: `${guest.firstName} ${guest.lastName}`,
          email: guest.email,
          response: response.status,
          plusOne: response.plusOneDetails,
          dietary: response.dietaryRestrictions,
          notes: response.notes,
        },
        event,
        stats
      );

      console.log('✅ RSVP notification sent to organizer');
    } catch (error) {
      console.error('Error sending RSVP notification:', error);
      // Don't throw - notification is not critical
    }
  }
}
```

---

### 3. Integracja z RSVPService

**Edytuj `src/services/firebase/rsvpService.ts`:**

W metodzie `processRSVPResponse()` dodaj na końcu (po stworzeniu activity):

```typescript
// Wyślij powiadomienie email do organizatora
try {
  const { NotificationTriggers } = await import('../notificationTriggers');
  await NotificationTriggers.onGuestResponse(
    rsvpToken.eventId,
    guestId,
    response
  );
} catch (notificationError) {
  console.warn('Failed to send RSVP notification email:', notificationError);
  // Don't fail the whole operation if email fails
}
```

---

### 4. UserSettings Service

**Utwórz `src/services/firebase/userSettingsService.ts`:**

```typescript
import { db } from '../../config/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export interface UserNotificationSettings {
  email: {
    enabled: boolean;
    eventReminders: boolean;
    rsvpUpdates: boolean;
    eventUpdates: boolean;
    weeklyDigest: boolean;
  };
  sms: {
    enabled: boolean;
    urgentOnly: boolean;
    eventReminders: boolean;
  };
  push: {
    enabled: boolean;
    eventReminders: boolean;
    rsvpUpdates: boolean;
    browserNotifications: boolean;
  };
  digest: {
    frequency: 'never' | 'daily' | 'weekly';
    time: string;
    includeAnalytics: boolean;
    includeUpcoming: boolean;
  };
}

export class UserSettingsService {
  private static readonly COLLECTION = 'userSettings';

  /**
   * Pobiera ustawienia użytkownika
   */
  static async getUserSettings(userId: string): Promise<UserNotificationSettings | null> {
    try {
      const docRef = doc(db, this.COLLECTION, userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data().notifications as UserNotificationSettings;
      }
      
      // Zwróć domyślne ustawienia
      return this.getDefaultSettings();
    } catch (error) {
      console.error('Error fetching user settings:', error);
      return null;
    }
  }

  /**
   * Zapisuje ustawienia użytkownika
   */
  static async saveUserSettings(
    userId: string,
    settings: UserNotificationSettings
  ): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, userId);
      await setDoc(docRef, {
        userId,
        notifications: settings,
        updatedAt: new Date(),
      }, { merge: true });
    } catch (error) {
      console.error('Error saving user settings:', error);
      throw error;
    }
  }

  /**
   * Domyślne ustawienia
   */
  private static getDefaultSettings(): UserNotificationSettings {
    return {
      email: {
        enabled: true,
        eventReminders: true,
        rsvpUpdates: true,
        eventUpdates: true,
        weeklyDigest: false,
      },
      sms: {
        enabled: false,
        urgentOnly: true,
        eventReminders: false,
      },
      push: {
        enabled: true,
        eventReminders: true,
        rsvpUpdates: true,
        browserNotifications: true,
      },
      digest: {
        frequency: 'never',
        time: '09:00',
        includeAnalytics: true,
        includeUpcoming: true,
      },
    };
  }
}
```

---

## 📋 Checklist Implementacji

### Etap 1: Podstawy (MVP)
- [ ] Dodać metodę `sendRSVPNotification()` do EmailService
- [ ] Stworzyć template EmailJS dla powiadomień RSVP
- [ ] Stworzyć NotificationTriggers service
- [ ] Zintegrować z RSVPService.processRSVPResponse()
- [ ] Przetestować powiadomienia RSVP

### Etap 2: Ustawienia
- [ ] Stworzyć UserSettingsService
- [ ] Połączyć z NotificationSettings UI
- [ ] Dodać zapisywanie do Firestore
- [ ] Dodać sprawdzanie preferencji przed wysyłką

### Etap 3: Przypomnienia
- [ ] Dodać metodę `sendEventReminder()` do EmailService
- [ ] Stworzyć templates dla przypomnień
- [ ] Zaimplementować logikę planowania
- [ ] Wybrać podejście (Cloud Functions vs Client-side)

### Etap 4: Testy
- [ ] Zaimplementować przyciski testowe w NotificationSettings
- [ ] Przetestować każdy typ powiadomienia
- [ ] Sprawdzić działanie w obu trybach (light/dark)
- [ ] Dodać obsługę błędów

### Etap 5: Optymalizacja
- [ ] Dodać rate limiting
- [ ] Dodać kolejkowanie emaili
- [ ] Dodać retry logic
- [ ] Monitorowanie i logi

---

## 🎨 Przykładowe Szablony EmailJS

### Template: RSVP Notification (template_rsvp_notification)

**Subject:**
```
{{guest_name}} odpowiedział: {{status_badge}} - {{event_title}}
```

**Body (HTML):**
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #3b82f6, #8b7ab8); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; }
    .badge { display: inline-block; padding: 8px 16px; border-radius: 6px; font-weight: bold; margin: 10px 0; }
    .badge-accepted { background: #d1fae5; color: #065f46; }
    .badge-declined { background: #fee2e2; color: #991b1b; }
    .badge-maybe { background: #fef3c7; color: #92400e; }
    .stats { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
    .stat-row { display: flex; justify-content: space-between; margin: 8px 0; }
    .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 15px 0; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Nowa odpowiedź na zaproszenie!</h1>
    </div>
    <div class="content">
      <p>Cześć <strong>{{organizer_name}}</strong>!</p>
      
      <p><strong>{{guest_name}}</strong> ({{guest_email}}) właśnie <strong>{{response_text}}</strong> zaproszenie na wydarzenie:</p>
      
      <h2>{{event_title}}</h2>
      <span class="badge badge-{{response_status}}">{{status_badge}}</span>
      
      <p>📅 <strong>Data wydarzenia:</strong> {{event_date}}</p>
      
      {{#if plusOne}}
      <p>➕ <strong>Osoba towarzysząca:</strong> {{plusOne}}</p>
      {{/if}}
      
      {{#if dietary_restrictions}}
      <p>🍽️ <strong>Preferencje dietetyczne:</strong> {{dietary_restrictions}}</p>
      {{/if}}
      
      {{#if notes}}
      <p>📝 <strong>Notatki:</strong> {{notes}}</p>
      {{/if}}
      
      <div class="stats">
        <h3>📊 Aktualna statystyka gości:</h3>
        <div class="stat-row">
          <span>✅ Potwierdzeni:</span>
          <strong>{{accepted_count}}</strong>
        </div>
        <div class="stat-row">
          <span>⏳ Oczekujący:</span>
          <strong>{{pending_count}}</strong>
        </div>
        <div class="stat-row">
          <span>❌ Odmówili:</span>
          <strong>{{declined_count}}</strong>
        </div>
        <div class="stat-row">
          <span><strong>Razem:</strong></span>
          <strong>{{total_guests}}</strong>
        </div>
      </div>
      
      <a href="{{event_url}}" class="button">Zobacz szczegóły wydarzenia</a>
      
      <div class="footer">
        <p>PartyPass - Twój asystent wydarzeń</p>
        <p>To powiadomienie zostało wysłane automatycznie</p>
      </div>
    </div>
  </div>
</body>
</html>
```

---

## 🔄 Flow Powiadomień

### Scenariusz 1: Gość odpowiada na zaproszenie

```
1. Gość wypełnia formularz RSVP
   ↓
2. RSVPService.processRSVPResponse()
   ↓
3. Aktualizacja statusu w Firestore
   ↓
4. Utworzenie Activity
   ↓
5. NotificationTriggers.onGuestResponse()
   ↓
6. Sprawdzenie preferencji organizatora
   ↓
7. EmailService.sendRSVPNotification()
   ↓
8. Email wysłany przez EmailJS
```

### Scenariusz 2: Przypomnienie o wydarzeniu

```
1. Cloud Function uruchamiana codziennie (cron)
   ↓
2. Sprawdza wydarzenia w następnych 7 dniach
   ↓
3. Dla każdego wydarzenia:
   - Sprawdza preferencje organizatora
   - Sprawdza czy nie wysłano już przypomnienia
   ↓
4. EmailService.sendEventReminder()
   ↓
5. Email wysłany do organizatora i gości
```

---

## 💰 Oszacowanie Kosztów

### EmailJS Free Plan:
- ✅ 200 emaili/miesiąc GRATIS
- ✅ 2 email services
- ✅ 2 email templates (możesz stworzyć więcej na płatnym)

### Przykładowe zużycie dla małego użytkownika:
- 10 wydarzeń/miesiąc
- Po 20 gości każde
- Wszystkie odpowiadają = 200 powiadomień RSVP ✅ W limicie!

### Dla większego użytkownika (upgrade do Personal: $9/miesiąc):
- 1000 emaili/miesiąc
- 10 email services
- 10 email templates
- Custom domain support

---

## 🚨 Ważne Uwagi

### 1. Privacy i GDPR
- ✅ Użytkownicy muszą wyrazić zgodę na powiadomienia email
- ✅ Muszą mieć możliwość wyłączenia (już jest w UI)
- ✅ Dodaj link "Unsubscribe" w każdym emailu

### 2. Rate Limiting
- EmailJS ma limit 200/miesiąc (Free) lub 1000/miesiąc (Personal)
- Dodaj sprawdzanie przed wysyłką
- Grupuj powiadomienia gdy to możliwe

### 3. Error Handling
- Powiadomienia email nie powinny blokować głównych operacji
- Używaj try-catch i loguj błędy
- Dodaj fallback do in-app notifications

### 4. Testing
- Dodaj zmienną środowiskową `REACT_APP_EMAIL_TEST_MODE`
- W trybie testowym wysyłaj wszystkie emaile na jeden adres testowy
- Dodaj przyciski testowe w UI (już są!)

---

## 📚 Dokumenty Pomocnicze

- `IMPLEMENTACJA_EMAILJS.md` - szczegóły implementacji
- `QUICK_START_EMAILJS.md` - szybki start
- `GDZIE_ZNALEZC_EMAILJS_DANE.md` - jak znaleźć dane EmailJS
- `KONFIGURACJA_EMAILJS_KLIENT.md` - konfiguracja klienta

---

## ✅ Następne Kroki

### Krok 1: Przygotowanie (15 min)
1. Zaloguj się do EmailJS Dashboard
2. Przygotuj 2-3 nowe templates
3. Skopiuj template IDs

### Krok 2: Kod (2-3h)
1. Rozszerz EmailService o nowe metody
2. Stwórz NotificationTriggers service
3. Stwórz UserSettingsService
4. Zintegruj z RSVPService

### Krok 3: UI (1h)
1. Podepnij zapisywanie ustawień do Firestore
2. Zaimplementuj przyciski testowe
3. Dodaj feedback UI

### Krok 4: Testy (1h)
1. Test RSVP notifications
2. Test ustawień zapisywania/odczytu
3. Test przycisków testowych
4. Test w dark/light mode

---

## 🎯 Rekomendacja

**Zacznij od Fazy 1 + MVP:**

1. ✅ Powiadomienia RSVP (najważniejsze!)
2. ✅ UserSettings zapisywanie/odczyt
3. ✅ Przyciski testowe działające

To da największą wartość w najkrótszym czasie (4-5h pracy).

Pozostałe funkcje (przypomnienia, digesty) możesz dodać później jako enhancement.

---

**Gotowy do implementacji?** 🚀

Jeśli potrzebujesz pomocy z którymkolwiek krokiem, daj znać!

