/**
 * Appointment Service - Firebase Implementation
 * 
 * Handles appointment CRUD operations with Firestore:
 * - createAppointment: Creates a new appointment document
 * - getAppointmentsByUser: Fetches appointments for a citizen
 * - getAppointmentsByProvider: Fetches appointments for a provider
 * - updateAppointmentStatus: Updates appointment status
 * - cancelAppointment: Cancels an appointment
 * 
 * Requirements: 3.2, 3.3
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
  DocumentData,
} from 'firebase/firestore';
import { db } from '../client';
import { 
  Appointment, 
  AppointmentStatus, 
  CreateAppointmentData, 
  COLLECTIONS 
} from '../types';

/**
 * Convert Firestore document to Appointment
 */
function docToAppointment(docData: DocumentData, id: string): Appointment {
  return {
    id,
    providerId: docData.providerId || '',
    userId: docData.userId || '',
    datetime: docData.datetime || Timestamp.now(),
    status: docData.status || 'pending',
    contactInfo: {
      name: docData.contactInfo?.name || '',
      phone: docData.contactInfo?.phone || '',
      email: docData.contactInfo?.email,
    },
    notes: docData.notes,
    createdAt: docData.createdAt || Timestamp.now(),
    updatedAt: docData.updatedAt || Timestamp.now(),
  };
}

/**
 * Create a new appointment
 * Creates a Firestore document in the appointments collection
 * 
 * @param data - Appointment data to create
 * @returns The created appointment ID
 * Requirements: 3.2, 3.3
 */
export async function createAppointment(data: CreateAppointmentData): Promise<string> {
  try {
    const appointmentsRef = collection(db, COLLECTIONS.appointments);
    const now = Timestamp.now();
    
    const appointmentData = {
      providerId: data.providerId,
      userId: data.userId,
      datetime: Timestamp.fromDate(data.datetime),
      status: 'pending' as AppointmentStatus,
      contactInfo: {
        name: data.contactInfo.name,
        phone: data.contactInfo.phone,
        email: data.contactInfo.email || null,
      },
      notes: data.notes || null,
      createdAt: now,
      updatedAt: now,
    };
    
    const docRef = await addDoc(appointmentsRef, appointmentData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
}


/**
 * Get appointment by ID
 * 
 * @param appointmentId - The appointment ID
 * @returns The appointment or null if not found
 */
export async function getAppointmentById(appointmentId: string): Promise<Appointment | null> {
  try {
    const appointmentRef = doc(db, COLLECTIONS.appointments, appointmentId);
    const snapshot = await getDoc(appointmentRef);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    return docToAppointment(snapshot.data(), snapshot.id);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    throw error;
  }
}

/**
 * Get all appointments for a user (citizen)
 * 
 * @param userId - The user ID
 * @returns Array of appointments for the user
 * Requirements: 3.4
 */
export async function getAppointmentsByUser(userId: string): Promise<Appointment[]> {
  try {
    const appointmentsRef = collection(db, COLLECTIONS.appointments);
    const q = query(
      appointmentsRef,
      where('userId', '==', userId),
      orderBy('datetime', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => docToAppointment(doc.data(), doc.id));
  } catch (error) {
    console.error('Error fetching user appointments:', error);
    throw error;
  }
}

/**
 * Get all appointments for a provider
 * 
 * @param providerId - The provider ID
 * @returns Array of appointments for the provider
 * Requirements: 3.5
 */
export async function getAppointmentsByProvider(providerId: string): Promise<Appointment[]> {
  try {
    const appointmentsRef = collection(db, COLLECTIONS.appointments);
    const q = query(
      appointmentsRef,
      where('providerId', '==', providerId),
      orderBy('datetime', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => docToAppointment(doc.data(), doc.id));
  } catch (error) {
    console.error('Error fetching provider appointments:', error);
    throw error;
  }
}

/**
 * Update appointment status
 * 
 * @param appointmentId - The appointment ID
 * @param status - The new status
 * Requirements: 3.2
 */
export async function updateAppointmentStatus(
  appointmentId: string, 
  status: AppointmentStatus
): Promise<void> {
  try {
    const appointmentRef = doc(db, COLLECTIONS.appointments, appointmentId);
    await updateDoc(appointmentRef, {
      status,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    throw error;
  }
}

/**
 * Cancel an appointment
 * Sets the appointment status to 'cancelled'
 * 
 * @param appointmentId - The appointment ID
 * Requirements: 3.2
 */
export async function cancelAppointment(appointmentId: string): Promise<void> {
  return updateAppointmentStatus(appointmentId, 'cancelled');
}
