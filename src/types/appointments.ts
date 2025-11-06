export interface Appointment {
  id: string;
  providerId: string;
  providerName: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  dateTime: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  appointmentId?: string;
}

export interface ProviderSchedule {
  providerId: string;
  dayOfWeek: number; // 0-6
  slots: TimeSlot[];
}
