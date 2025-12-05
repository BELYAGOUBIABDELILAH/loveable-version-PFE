/**
 * Analytics Service - Firebase Implementation
 * 
 * Migrated from Supabase Edge Functions to Firebase Firestore
 * Stores analytics events in the analyticsEvents collection
 */

import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';
import { COLLECTIONS } from '@/integrations/firebase/types';
import { OFFLINE_MODE } from '@/config/app';

interface AnalyticsEventData {
  event_type: string;
  event_data?: Record<string, any>;
  user_id?: string;
}

class AnalyticsService {
  private sessionId: string;
  private queue: AnalyticsEventData[] = [];
  private flushInterval: number = 5000; // 5 seconds
  private maxQueueSize: number = 10;

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.startAutoFlush();
  }

  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem('ch_session_id');
    if (!sessionId) {
      sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('ch_session_id', sessionId);
    }
    return sessionId;
  }

  private startAutoFlush() {
    setInterval(() => {
      if (this.queue.length > 0) {
        this.flush();
      }
    }, this.flushInterval);
  }

  track(event_type: string, event_data?: Record<string, any>, user_id?: string) {
    this.queue.push({ event_type, event_data, user_id });
    
    if (this.queue.length >= this.maxQueueSize) {
      this.flush();
    }
  }

  private async flush() {
    if (this.queue.length === 0 || OFFLINE_MODE) return;

    const events = [...this.queue];
    this.queue = [];

    try {
      const analyticsRef = collection(db, COLLECTIONS.analyticsEvents);
      
      // Store each event in Firestore
      for (const event of events) {
        await addDoc(analyticsRef, {
          eventType: event.event_type,
          eventData: event.event_data || {},
          userId: event.user_id || null,
          sessionId: this.sessionId,
          pageUrl: window.location.href,
          userAgent: navigator.userAgent,
          createdAt: Timestamp.now()
        });
      }
    } catch (error) {
      console.error('Analytics error:', error);
      // Re-queue events on failure
      this.queue = [...events, ...this.queue];
    }
  }

  // Predefined event types
  pageView(page: string, user_id?: string) {
    this.track('page_view', { page }, user_id);
  }

  search(query: string, filters?: any, user_id?: string) {
    this.track('search', { query, filters }, user_id);
  }

  providerView(providerId: string, providerName: string, user_id?: string) {
    this.track('provider_view', { providerId, providerName }, user_id);
  }

  bookingAttempt(providerId: string, user_id?: string) {
    this.track('booking_attempt', { providerId }, user_id);
  }

  reviewSubmit(providerId: string, rating: number, user_id?: string) {
    this.track('review_submit', { providerId, rating }, user_id);
  }

  chatInteraction(messageCount: number, user_id?: string) {
    this.track('chat_interaction', { messageCount }, user_id);
  }
}

export const analytics = new AnalyticsService();
