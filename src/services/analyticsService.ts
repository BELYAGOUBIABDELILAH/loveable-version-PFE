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
    if (this.queue.length === 0) return;

    const events = [...this.queue];
    this.queue = [];

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analytics-track`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            ...events[0],
            session_id: this.sessionId,
            page_url: window.location.href,
          }),
        }
      );

      if (!response.ok) {
        console.error('Analytics tracking failed:', response.statusText);
      }
    } catch (error) {
      console.error('Analytics error:', error);
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
