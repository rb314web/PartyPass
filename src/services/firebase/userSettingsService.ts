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
    guestResponses?: boolean;
    systemUpdates?: boolean;
    marketing?: boolean;
  };
  sms: {
    enabled: boolean;
    urgentOnly: boolean;
    eventReminders: boolean;
    guestResponses?: boolean;
    emergencyOnly?: boolean;
  };
  push: {
    enabled: boolean;
    eventReminders: boolean;
    rsvpUpdates: boolean;
    browserNotifications: boolean;
    guestResponses?: boolean;
    appUpdates?: boolean;
    marketing?: boolean;
  };
  digest: {
    frequency: 'never' | 'daily' | 'weekly' | 'monthly';
    time: string;
    includeAnalytics: boolean;
    includeUpcoming: boolean;
  };
}

export type AccentColorId =
  | 'blue'
  | 'purple'
  | 'green'
  | 'orange'
  | 'red'
  | 'teal'
  | 'slate'
  | 'custom';

export interface UserAppearanceSettings {
  accentColor: AccentColorId;
  customColor: string;
  language: 'pl' | 'en' | 'de' | 'fr';
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  timeFormat: '12h' | '24h';
  currency: 'PLN' | 'EUR' | 'USD' | 'GBP';
  compactMode: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
}

export class UserSettingsService {
  private static readonly COLLECTION = 'userSettings';

  private static getDefaultNotificationSettings(): UserNotificationSettings {
    return {
      email: {
        enabled: true,
        eventReminders: true,
        rsvpUpdates: true,
        eventUpdates: true,
        weeklyDigest: false,
        guestResponses: true,
        systemUpdates: true,
        marketing: false,
      },
      sms: {
        enabled: false,
        urgentOnly: true,
        eventReminders: false,
        guestResponses: false,
        emergencyOnly: true,
      },
      push: {
        enabled: true,
        eventReminders: true,
        rsvpUpdates: true,
        browserNotifications: true,
        guestResponses: true,
        appUpdates: true,
        marketing: false,
      },
      digest: {
        frequency: 'never',
        time: '09:00',
        includeAnalytics: true,
        includeUpcoming: true,
      },
    };
  }

  static getDefaultAppearanceSettings(): UserAppearanceSettings {
    const accentColor =
      (localStorage.getItem('accentColor') as AccentColorId | null) || 'blue';

    return {
      accentColor,
      customColor: localStorage.getItem('customAccentColor') || '#5b7fd4',
      language: 'pl',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
      currency: 'PLN',
      compactMode: false,
      reducedMotion: false,
      highContrast: false,
    };
  }

  private static mergeNotificationSettings(
    saved?: Partial<UserNotificationSettings> | null
  ): UserNotificationSettings {
    const defaults = this.getDefaultNotificationSettings();
    if (!saved) return defaults;

    return {
      email: { ...defaults.email, ...saved.email },
      sms: { ...defaults.sms, ...saved.sms },
      push: { ...defaults.push, ...saved.push },
      digest: { ...defaults.digest, ...saved.digest },
    };
  }

  private static mergeAppearanceSettings(
    saved?: Partial<UserAppearanceSettings> | null
  ): UserAppearanceSettings {
    const defaults = this.getDefaultAppearanceSettings();
    if (!saved) return defaults;
    return { ...defaults, ...saved };
  }

  /**
   * Pobiera ustawienia powiadomień użytkownika
   */
  static async getUserSettings(
    userId: string
  ): Promise<UserNotificationSettings> {
    try {
      const docRef = doc(db, this.COLLECTION, userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return this.mergeNotificationSettings(
          data.notifications as Partial<UserNotificationSettings> | undefined
        );
      }

      return this.getDefaultNotificationSettings();
    } catch (error) {
      console.error('Error fetching user settings:', error);
      throw error;
    }
  }

  /**
   * Pobiera ustawienia wyglądu użytkownika
   */
  static async getAppearanceSettings(
    userId: string
  ): Promise<UserAppearanceSettings> {
    try {
      const docRef = doc(db, this.COLLECTION, userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return this.mergeAppearanceSettings(
          data.appearance as Partial<UserAppearanceSettings> | undefined
        );
      }

      return this.getDefaultAppearanceSettings();
    } catch (error) {
      console.error('Error fetching appearance settings:', error);
      throw error;
    }
  }

  /**
   * Zapisuje ustawienia powiadomień użytkownika
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
    } catch (error) {
      console.error('Error saving user settings:', error);
      throw error;
    }
  }

  /**
   * Zapisuje ustawienia wyglądu użytkownika
   */
  static async saveAppearanceSettings(
    userId: string,
    settings: UserAppearanceSettings
  ): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, userId);
      await setDoc(
        docRef,
        {
          userId,
          appearance: settings,
          updatedAt: Timestamp.now(),
        },
        { merge: true }
      );

      localStorage.setItem('accentColor', settings.accentColor);
      if (settings.accentColor === 'custom') {
        localStorage.setItem('customAccentColor', settings.customColor);
      } else {
        localStorage.removeItem('customAccentColor');
      }
    } catch (error) {
      console.error('Error saving appearance settings:', error);
      throw error;
    }
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
      return settings.email.enabled && settings.email[type];
    } catch (error) {
      console.error('Error checking email notifications:', error);
      return false;
    }
  }
}

export default UserSettingsService;
