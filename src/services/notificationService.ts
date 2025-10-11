// services/notificationService.ts
import { db } from '../config/firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { Activity } from '../types';

export interface Notification {
  id: string;
  userId: string;
  type: 'activity' | 'system' | 'reminder' | 'warning';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  read: boolean;
  timestamp: Date;
  actionUrl?: string;
  actionLabel?: string;
  activityId?: string; // Link to activity
  eventId?: string;
  contactId?: string;
  autoDelete?: boolean; // Auto-delete after reading
  expiresAt?: Date; // Auto-expire after date
}

export interface CreateNotificationData {
  userId: string;
  type: Notification['type'];
  priority: Notification['priority'];
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  activityId?: string;
  eventId?: string;
  contactId?: string;
  autoDelete?: boolean;
  expiresAt?: Date;
}

class NotificationService {
  private readonly collection = 'notifications';

  // Create notification from activity
  async createFromActivity(activity: Activity, userId: string): Promise<string> {
    const notificationData = this.activityToNotification(activity, userId);
    return this.create(notificationData);
  }

  // Create notification
  async create(data: CreateNotificationData): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.collection), {
        ...data,
        read: false,
        timestamp: serverTimestamp(),
        createdAt: serverTimestamp(),
        expiresAt: data.expiresAt ? Timestamp.fromDate(data.expiresAt) : null
      });
      
      console.log('Notification created:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Get notifications for user
  async getNotifications(userId: string, limitCount = 20): Promise<Notification[]> {
    try {
      const q = query(
        collection(db, this.collection),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
        expiresAt: doc.data().expiresAt?.toDate()
      })) as Notification[];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  // Subscribe to real-time notifications
  subscribeToNotifications(
    userId: string, 
    callback: (notifications: Notification[]) => void,
    limitCount = 20
  ): () => void {
    const q = query(
      collection(db, this.collection),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
        expiresAt: doc.data().expiresAt?.toDate()
      })) as Notification[];
      
      callback(notifications);
    }, (error) => {
      console.error('Error in notifications subscription:', error);
      callback([]);
    });
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const docRef = doc(db, this.collection, notificationId);
      await updateDoc(docRef, {
        read: true,
        readAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read for user
  async markAllAsRead(userId: string): Promise<void> {
    try {
      const q = query(
        collection(db, this.collection),
        where('userId', '==', userId),
        where('read', '==', false)
      );

      const snapshot = await getDocs(q);
      const updates = snapshot.docs.map(doc => 
        updateDoc(doc.ref, {
          read: true,
          readAt: serverTimestamp()
        })
      );

      await Promise.all(updates);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Delete notification
  async delete(notificationId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.collection, notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  // Delete expired notifications
  async deleteExpired(): Promise<void> {
    try {
      const now = new Date();
      const q = query(
        collection(db, this.collection),
        where('expiresAt', '<=', Timestamp.fromDate(now))
      );

      const snapshot = await getDocs(q);
      const deletions = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletions);
      
      console.log(`Deleted ${deletions.length} expired notifications`);
    } catch (error) {
      console.error('Error deleting expired notifications:', error);
    }
  }

  // Convert activity to notification
  private activityToNotification(activity: Activity, userId: string): CreateNotificationData {
    const baseData: CreateNotificationData = {
      userId,
      type: 'activity',
      priority: this.getActivityPriority(activity.type),
      title: this.getActivityTitle(activity.type),
      message: activity.message,
      activityId: activity.id,
      eventId: activity.eventId,
      contactId: activity.contactId
    };

    // Set action URL based on activity type
    if (activity.eventId) {
      baseData.actionUrl = `/dashboard/events/${activity.eventId}`;
      baseData.actionLabel = 'Zobacz wydarzenie';
    } else if (activity.contactId) {
      baseData.actionUrl = '/dashboard/contacts';
      baseData.actionLabel = 'Zobacz kontakty';
    }

    // Auto-delete less important notifications
    if (baseData.priority === 'low') {
      baseData.autoDelete = true;
      baseData.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    }

    return baseData;
  }

  private getActivityPriority(activityType: Activity['type']): Notification['priority'] {
    switch (activityType) {
      case 'guest_accepted':
      case 'guest_declined':
        return 'high';
      case 'guest_response':
      case 'guest_maybe':
        return 'medium';
      case 'event_created':
      case 'event_updated':
        return 'medium';
      case 'event_deleted':
      case 'event_cancelled':
        return 'high';
      case 'contact_added':
      case 'contact_updated':
        return 'low';
      default:
        return 'medium';
    }
  }

  private getActivityTitle(activityType: Activity['type']): string {
    switch (activityType) {
      case 'guest_accepted':
        return 'Nowe potwierdzenie';
      case 'guest_declined':
        return 'Odmowa uczestnictwa';
      case 'guest_maybe':
        return 'Niezdecydowany gość';
      case 'guest_response':
        return 'Nowa odpowiedź';
      case 'event_created':
        return 'Nowe wydarzenie';
      case 'event_updated':
        return 'Zaktualizowane wydarzenie';
      case 'event_deleted':
        return 'Usunięte wydarzenie';
      case 'event_cancelled':
        return 'Anulowane wydarzenie';
      case 'contact_added':
        return 'Nowy kontakt';
      case 'contact_updated':
        return 'Zaktualizowany kontakt';
      default:
        return 'Nowa aktywność';
    }
  }

  // Create system notifications
  async createSystemNotification(
    userId: string,
    title: string,
    message: string,
    priority: Notification['priority'] = 'medium',
    actionUrl?: string,
    actionLabel?: string
  ): Promise<string> {
    return this.create({
      userId,
      type: 'system',
      priority,
      title,
      message,
      actionUrl,
      actionLabel
    });
  }

  // Create reminder notification
  async createReminder(
    userId: string,
    title: string,
    message: string,
    eventId?: string,
    reminderDate?: Date
  ): Promise<string> {
    return this.create({
      userId,
      type: 'reminder',
      priority: 'medium',
      title,
      message,
      eventId,
      actionUrl: eventId ? `/dashboard/events/${eventId}` : undefined,
      actionLabel: 'Zobacz wydarzenie',
      expiresAt: reminderDate
    });
  }
}

export const notificationService = new NotificationService();
export default notificationService;
