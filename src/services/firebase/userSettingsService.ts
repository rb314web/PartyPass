// services/firebase/userSettingsService.ts
import { db } from '../../config/firebase';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';

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
  static async getUserSettings(
    userId: string
  ): Promise<UserNotificationSettings | null> {
    try {
      const docRef = doc(db, this.COLLECTION, userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return data.notifications as UserNotificationSettings;
      }

      // Zwróć domyślne ustawienia
      return this.getDefaultSettings();
    } catch (error) {
      console.error('Error fetching user settings:', error);
      return this.getDefaultSettings();
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
      await setDoc(
        docRef,
        {
          userId,
          notifications: settings,
          updatedAt: Timestamp.now(),
        },
        { merge: true }
      );

      console.log('✅ User notification settings saved');
    } catch (error) {
      console.error('Error saving user settings:', error);
      throw error;
    }
  }

  /**
   * Domyślne ustawienia powiadomień
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

  /**
   * Sprawdza czy użytkownik ma włączone powiadomienia email
   */
  static async hasEmailNotificationsEnabled(
    userId: string,
    type: 'eventReminders' | 'rsvpUpdates' | 'eventUpdates' | 'weeklyDigest'
  ): Promise<boolean> {
    try {
      const settings = await this.getUserSettings(userId);
      if (!settings) return false;

      return settings.email.enabled && settings.email[type];
    } catch (error) {
      console.error('Error checking email notifications:', error);
      return false;
    }
  }
}

export default UserSettingsService;

