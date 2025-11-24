import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Contact, CreateContactData, UpdateContactData } from '../../types';
import { COLLECTIONS } from '../../types/firebase';

export interface ContactFilters {
  search?: string;
  tags?: string[];
}

export interface ContactResult {
  contacts: Contact[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}

export class ContactService {
  private static readonly COLLECTION = COLLECTIONS.CONTACTS;

  static async createContact(
    userId: string,
    data: CreateContactData
  ): Promise<Contact> {
    try {
      // Odfiltruj undefined wartości z opcjonalnych pól
      const contactData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.dietaryRestrictions !== undefined && {
          dietaryRestrictions: data.dietaryRestrictions,
        }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.tags !== undefined && { tags: data.tags }),
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await addDoc(collection(db, this.COLLECTION), contactData);

      return {
        id: docRef.id,
        ...contactData,
      };
    } catch (error: any) {
      throw new Error('Błąd podczas tworzenia kontaktu: ' + error.message);
    }
  }

  static async getUserContacts(
    userId: string,
    filters: ContactFilters = {},
    pageSize: number = 10,
    lastDocument?: QueryDocumentSnapshot<DocumentData>
  ): Promise<ContactResult> {
    try {
      let q = query(
        collection(db, this.COLLECTION),
        where('userId', '==', userId),
        orderBy('firstName'),
        limit(pageSize + 1)
      );

      if (lastDocument) {
        q = query(q, startAfter(lastDocument));
      }

      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs;

      const hasMore = docs.length > pageSize;
      const contactDocs = hasMore ? docs.slice(0, pageSize) : docs;

      let contacts = contactDocs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Contact[];

      // Apply client-side filtering for search
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        contacts = contacts.filter(
          contact =>
            contact.firstName.toLowerCase().includes(searchTerm) ||
            contact.lastName.toLowerCase().includes(searchTerm) ||
            contact.email.toLowerCase().includes(searchTerm)
        );
      }

      return {
        contacts,
        lastDoc: hasMore ? contactDocs[contactDocs.length - 1] : null,
        hasMore,
      };
    } catch (error: any) {
      throw new Error('Błąd podczas pobierania kontaktów: ' + error.message);
    }
  }

  static async getContact(contactId: string): Promise<Contact | null> {
    try {
      const docRef = doc(db, this.COLLECTION, contactId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate(),
        } as Contact;
      }

      return null;
    } catch (error: any) {
      throw new Error('Błąd podczas pobierania kontaktu: ' + error.message);
    }
  }

  static async updateContact(
    contactId: string,
    data: UpdateContactData
  ): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, contactId);

      // Odfiltruj undefined wartości
      const updateData = Object.fromEntries(
        Object.entries(data).filter(([key, value]) => value !== undefined)
      );

      await updateDoc(docRef, {
        ...updateData,
        updatedAt: new Date(),
      });
    } catch (error: any) {
      throw new Error('Błąd podczas aktualizacji kontaktu: ' + error.message);
    }
  }

  static async deleteContact(contactId: string): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, contactId);
      await deleteDoc(docRef);
    } catch (error: any) {
      throw new Error('Błąd podczas usuwania kontaktu: ' + error.message);
    }
  }

  static async searchContacts(
    userId: string,
    searchTerm: string
  ): Promise<Contact[]> {
    try {
      console.log(
        `ContactService.searchContacts: Searching for "${searchTerm}"`
      );

      const q = query(
        collection(db, this.COLLECTION),
        where('userId', '==', userId),
        orderBy('firstName')
      );

      const querySnapshot = await getDocs(q);

      console.log(
        `ContactService.searchContacts: Found ${querySnapshot.size} total contacts`
      );

      const contacts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Contact[];

      // Log all contacts for debugging
      console.log(
        'ContactService.searchContacts: All contacts:',
        contacts.map(c => `${c.firstName} ${c.lastName} (${c.email})`)
      );

      // Client-side search filtering
      const searchLower = searchTerm.toLowerCase();
      const filtered = contacts.filter(contact => {
        const firstNameMatch = contact.firstName
          .toLowerCase()
          .includes(searchLower);
        const lastNameMatch = contact.lastName
          .toLowerCase()
          .includes(searchLower);
        const emailMatch = contact.email.toLowerCase().includes(searchLower);
        const matches = firstNameMatch || lastNameMatch || emailMatch;

        if (matches) {
          console.log(
            `ContactService.searchContacts: ✓ Match found - ${contact.firstName} ${contact.lastName} (${contact.email})`
          );
        }

        return matches;
      });

      console.log(
        `ContactService.searchContacts: Returning ${filtered.length} filtered contacts`
      );

      return filtered;
    } catch (error: any) {
      console.error('ContactService.searchContacts: Error -', error);
      throw new Error('Błąd podczas wyszukiwania kontaktów: ' + error.message);
    }
  }

  static async checkEmailExists(
    userId: string,
    email: string,
    excludeId?: string
  ): Promise<boolean> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('userId', '==', userId),
        where('email', '==', email)
      );

      const querySnapshot = await getDocs(q);

      if (excludeId) {
        return querySnapshot.docs.some(doc => doc.id !== excludeId);
      }

      return !querySnapshot.empty;
    } catch (error: any) {
      throw new Error('Błąd podczas sprawdzania emaila: ' + error.message);
    }
  }
}
