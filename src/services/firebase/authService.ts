// services/firebase/authService.ts
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  deleteUser,
  onAuthStateChanged,
  sendEmailVerification,
  reauthenticateWithCredential,
  EmailAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { auth, db, storage } from '../../config/firebase';
import { FirebaseUser as AppUser, COLLECTIONS } from '../../types/firebase';
import { User } from '../../types';

export interface AuthError {
  code: string;
  message: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  planType: 'starter' | 'pro' | 'enterprise';
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  avatar?: File;
}

export class AuthService {
  // Register new user
  static async register(userData: RegisterData): Promise<User> {
    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );

      const firebaseUser = userCredential.user;

      // Create user profile in Firestore
      const userProfile: Omit<AppUser, 'uid'> = {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        planType: userData.planType,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        isEmailVerified: false,
        lastLoginAt: Timestamp.now(),
        preferences: {
          notifications: {
            email: true,
            push: true,
            sms: false,
          },
          theme: 'light',
          language: 'pl',
        },
      };

      await setDoc(doc(db, COLLECTIONS.USERS, firebaseUser.uid), userProfile);

      // Send email verification
      await sendEmailVerification(firebaseUser);

      // Return user data
      return this.convertFirebaseUserToUser(firebaseUser.uid, userProfile);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Login user
  static async login(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      // Get user profile from Firestore
      const userDoc = await getDoc(
        doc(db, COLLECTIONS.USERS, firebaseUser.uid)
      );

      if (!userDoc.exists()) {
        throw new Error('Profil użytkownika nie został znaleziony');
      }

      const userData = userDoc.data() as Omit<AppUser, 'uid'>;

      // Update last login
      await updateDoc(doc(db, COLLECTIONS.USERS, firebaseUser.uid), {
        lastLoginAt: Timestamp.now(),
      });

      return this.convertFirebaseUserToUser(firebaseUser.uid, userData);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Login with Google
  static async loginWithGoogle(): Promise<User> {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      // Get or create user profile in Firestore
      const userDoc = await getDoc(
        doc(db, COLLECTIONS.USERS, firebaseUser.uid)
      );
      let userData: Omit<AppUser, 'uid'>;
      if (!userDoc.exists()) {
        // Create new profile
        userData = {
          email: firebaseUser.email || '',
          firstName: firebaseUser.displayName?.split(' ')[0] || '',
          lastName:
            firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
          planType: 'starter',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          isEmailVerified: firebaseUser.emailVerified,
          lastLoginAt: Timestamp.now(),
          preferences: {
            notifications: { email: true, push: true, sms: false },
            theme: 'light',
            language: 'pl',
          },
          avatar: firebaseUser.photoURL || '',
        };
        await setDoc(doc(db, COLLECTIONS.USERS, firebaseUser.uid), userData);
      } else {
        userData = userDoc.data() as Omit<AppUser, 'uid'>;
        await updateDoc(doc(db, COLLECTIONS.USERS, firebaseUser.uid), {
          lastLoginAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
      }
      return this.convertFirebaseUserToUser(firebaseUser.uid, userData);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Logout user
  static async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Get current user
  static async getCurrentUser(): Promise<User | null> {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return null;

      const userDoc = await getDoc(
        doc(db, COLLECTIONS.USERS, firebaseUser.uid)
      );

      if (!userDoc.exists()) {
        return null;
      }

      const userData = userDoc.data() as Omit<AppUser, 'uid'>;
      return this.convertFirebaseUserToUser(firebaseUser.uid, userData);
    } catch (error: any) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Update user profile
  static async updateProfile(
    userId: string,
    data: UpdateProfileData
  ): Promise<User> {
    try {
      const updateData: Partial<AppUser> = {
        updatedAt: Timestamp.now(),
      };

      if (data.firstName) updateData.firstName = data.firstName;
      if (data.lastName) updateData.lastName = data.lastName;
      if (data.phoneNumber) updateData.phoneNumber = data.phoneNumber;

      // Handle avatar upload
      if (data.avatar) {
        const avatarRef = ref(
          storage,
          `avatars/${userId}/${Date.now()}_${data.avatar.name}`
        );
        await uploadBytes(avatarRef, data.avatar);
        const avatarUrl = await getDownloadURL(avatarRef);
        updateData.avatar = avatarUrl;
      }

      await updateDoc(doc(db, COLLECTIONS.USERS, userId), updateData);

      // Update Firebase Auth profile
      const firebaseUser = auth.currentUser;
      if (firebaseUser) {
        const authUpdateData: any = {};
        if (data.firstName || data.lastName) {
          authUpdateData.displayName =
            `${data.firstName || ''} ${data.lastName || ''}`.trim();
        }
        if (Object.keys(authUpdateData).length > 0) {
          await updateProfile(firebaseUser, authUpdateData);
        }
      }

      // Get updated user data
      const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId));
      const userData = userDoc.data() as Omit<AppUser, 'uid'>;

      return this.convertFirebaseUserToUser(userId, userData);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Change password
  static async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser || !firebaseUser.email) {
        throw new Error('Użytkownik nie jest zalogowany');
      }

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(
        firebaseUser.email,
        currentPassword
      );
      await reauthenticateWithCredential(firebaseUser, credential);

      // Update password
      await updatePassword(firebaseUser, newPassword);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Reset password
  static async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Delete account
  static async deleteAccount(password: string): Promise<void> {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser || !firebaseUser.email) {
        throw new Error('Użytkownik nie jest zalogowany');
      }

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(
        firebaseUser.email,
        password
      );
      await reauthenticateWithCredential(firebaseUser, credential);

      // Delete all user-related data from Firestore
      await this.deleteUserData(firebaseUser.uid);

      // Delete user from Firebase Auth
      await deleteUser(firebaseUser);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Delete all user data from Firestore
  private static async deleteUserData(userId: string): Promise<void> {
    try {
      // Import additional Firestore functions
      const { getDocs, query, where, collection } = await import(
        'firebase/firestore'
      );

      // Delete user document
      await deleteDoc(doc(db, COLLECTIONS.USERS, userId));

      // Get all user's events
      const eventsQuery = query(
        collection(db, COLLECTIONS.EVENTS),
        where('userId', '==', userId)
      );
      const eventsSnapshot = await getDocs(eventsQuery);

      // Delete each event and its guests
      for (const eventDoc of eventsSnapshot.docs) {
        const eventId = eventDoc.id;

        // Delete event's guests
        const guestsQuery = query(
          collection(db, COLLECTIONS.GUESTS),
          where('eventId', '==', eventId)
        );
        const guestsSnapshot = await getDocs(guestsQuery);

        for (const guestDoc of guestsSnapshot.docs) {
          await deleteDoc(doc(db, COLLECTIONS.GUESTS, guestDoc.id));
        }

        // Delete the event
        await deleteDoc(doc(db, COLLECTIONS.EVENTS, eventId));
      }

      // Delete user's activities
      const activitiesQuery = query(
        collection(db, COLLECTIONS.ACTIVITIES),
        where('userId', '==', userId)
      );
      const activitiesSnapshot = await getDocs(activitiesQuery);

      for (const activityDoc of activitiesSnapshot.docs) {
        await deleteDoc(doc(db, COLLECTIONS.ACTIVITIES, activityDoc.id));
      }

      // Delete user's notifications
      const notificationsQuery = query(
        collection(db, COLLECTIONS.NOTIFICATIONS),
        where('userId', '==', userId)
      );
      const notificationsSnapshot = await getDocs(notificationsQuery);

      for (const notificationDoc of notificationsSnapshot.docs) {
        await deleteDoc(doc(db, COLLECTIONS.NOTIFICATIONS, notificationDoc.id));
      }

      // Delete user's analytics
      const analyticsQuery = query(
        collection(db, COLLECTIONS.ANALYTICS),
        where('userId', '==', userId)
      );
      const analyticsSnapshot = await getDocs(analyticsQuery);

      for (const analyticsDoc of analyticsSnapshot.docs) {
        await deleteDoc(doc(db, COLLECTIONS.ANALYTICS, analyticsDoc.id));
      }

      // Delete user's avatar from storage if exists
      try {
        const avatarRef = ref(storage, `avatars/${userId}`);
        await deleteObject(avatarRef);
      } catch (error) {
        // Avatar might not exist, ignore error
        console.log('No avatar to delete or error deleting avatar:', error);
      }
    } catch (error) {
      console.error('Error deleting user data:', error);
      throw error;
    }
  }

  // Auth state listener
  static onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, async firebaseUser => {
      if (firebaseUser) {
        try {
          const user = await this.getCurrentUser();
          callback(user);
        } catch (error) {
          console.error('Error getting user data:', error);
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  }

  // Convert Firebase user to app user
  private static convertFirebaseUserToUser(
    uid: string,
    firebaseUser: Omit<AppUser, 'uid'>
  ): User {
    return {
      id: uid,
      email: firebaseUser.email,
      firstName: firebaseUser.firstName,
      lastName: firebaseUser.lastName,
      planType: firebaseUser.planType,
      createdAt: firebaseUser.createdAt.toDate(),
      avatar: firebaseUser.avatar,
    };
  }

  // Handle Firebase auth errors
  private static handleAuthError(error: any): AuthError {
    let message = 'Wystąpił nieoczekiwany błąd';

    switch (error.code) {
      case 'auth/user-not-found':
        message = 'Użytkownik z tym adresem email nie istnieje';
        break;
      case 'auth/wrong-password':
        message = 'Nieprawidłowe hasło';
        break;
      case 'auth/email-already-in-use':
        message = 'Użytkownik z tym adresem email już istnieje';
        break;
      case 'auth/weak-password':
        message = 'Hasło jest zbyt słabe';
        break;
      case 'auth/invalid-email':
        message = 'Nieprawidłowy adres email';
        break;
      case 'auth/too-many-requests':
        message = 'Zbyt wiele prób logowania. Spróbuj ponownie później';
        break;
      case 'auth/network-request-failed':
        message = 'Błąd połączenia z siecią';
        break;
      default:
        message = error.message || message;
    }

    return {
      code: error.code || 'unknown',
      message,
    };
  }
}
