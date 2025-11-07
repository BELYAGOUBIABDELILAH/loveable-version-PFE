# CityHealth Platform - Complete Architecture Documentation

## System Overview
CityHealth is a multilingual healthcare directory platform connecting citizens in Sidi Bel Abbès, Algeria with verified health providers through AI assistance, smart search, and comprehensive provider management.

## Technology Stack

### Frontend
- **React 18.3** + **TypeScript** + **Vite**
- **Tailwind CSS** + **shadcn/ui** components
- **React Router** for navigation
- **TanStack Query** for data fetching
- **Mapbox GL** for interactive maps

### Backend
- **Supabase** (Database + Auth + Storage + Edge Functions)
- **PostgreSQL** for structured data
- **Supabase Storage** for file uploads

### AI & Services
- **Lovable AI Gateway** (Gemini 2.5 Flash/Pro + GPT-5 models)
- **Real-time streaming** chat with SSE
- **Analytics tracking** system

## Architecture Layers

### 1. Data Layer (Supabase)

**Tables:**
- `analytics_events` - User behavior tracking
- `provider_documents` - Uploaded verification docs  
- `reviews` - Provider ratings & reviews
- `providers` - Healthcare provider profiles
- `users` (auth.users) - User authentication

**Storage Buckets:**
- `provider-documents` - Licenses, photos, certificates

**Row Level Security (RLS):**
- Public read for approved content
- Authenticated users can create/update own records
- Admin-only for approval workflows

### 2. Service Layer (Edge Functions)

**`ai-chat` Function:**
- Streams AI responses using Lovable AI Gateway
- Multi-language support (FR/AR/EN)
- Healthcare-specific system prompts
- Rate limiting & error handling

**`analytics-track` Function:**
- Collects user events (page views, searches, bookings)
- Batches requests for performance
- IP & user-agent tracking

### 3. Business Logic Layer (React Services)

**`aiChatService.ts`:**
- SSE streaming client
- Token-by-token rendering
- Error recovery & retries

**`analyticsService.ts`:**
- Auto-batching events (5s intervals or 10 events)
- Session tracking
- Predefined event types (pageView, search, providerView, etc.)

**`fileUploadService.ts`:**
- Multi-file uploads to Supabase Storage
- File validation (type, size)
- Document verification workflow

### 4. UI Layer (React Components)

**Core Components:**
- `ErrorBoundary` - Global error handling & logging
- `FileUpload` - Drag-drop file uploader with preview
- `AIChatbot` - Streaming AI chat interface
- `ReviewSystem` - Rating & reviews with moderation
- `SearchInterface` - Advanced search with filters
- `MapSection` - Interactive Mapbox integration

**Feature Modules:**
- `homepage/*` - Landing page sections
- `search/*` - Provider search & filters
- `manage/*` - Admin dashboard views
- `projects/*` - Provider management

### 5. State Management

**Contexts:**
- `AuthContext` - User authentication & sessions
- `LanguageContext` - i18n with RTL support (FR/AR/EN)
- `ThemeContext` - Dark/light mode

**Hooks:**
- `useAnalytics` - Auto-track page views
- `useLanguage` - Translation helper (legacy compatible)
- `useToastNotifications` - Toast messaging

## Key Features Implementation

### 1. Provider Onboarding
**Flow:**
1. Multi-step registration form (4 steps)
2. File upload (license + photos)
3. Admin approval in dashboard
4. Email notification on approval

**Files:**
- `src/pages/ProviderRegister.tsx` 
- `src/components/FileUpload.tsx`
- `src/services/fileUploadService.ts`

### 2. AI Chatbot
**Flow:**
1. User sends message → frontend
2. Frontend calls `/ai-chat` edge function
3. Edge function streams from Lovable AI Gateway
4. SSE parsed line-by-line, tokens rendered immediately

**Files:**
- `supabase/functions/ai-chat/index.ts`
- `src/services/aiChatService.ts`
- `src/components/AIChatbot.tsx`

### 3. Review System
**Flow:**
1. Users submit reviews (pending status)
2. Admin approves/rejects in dashboard
3. Providers can respond to approved reviews
4. Users can vote reviews as helpful

**Files:**
- `src/components/ReviewSystem.tsx`
- `src/types/reviews.ts`
- Database: `reviews` table

### 4. Analytics
**Flow:**
1. Auto-track page views on route change
2. Manual tracking for user actions
3. Batch events every 5s or 10 events
4. Store in analytics_events table

**Files:**
- `supabase/functions/analytics-track/index.ts`
- `src/services/analyticsService.ts`
- `src/hooks/useAnalytics.ts`

### 5. Internationalization (i18n)
**Features:**
- 3 languages: French, Arabic, English
- RTL layout for Arabic
- Font switching (Inter/Tajawal)
- Centralized translations in `src/i18n/translations.ts`

**Usage:**
```typescript
const { t, language, isRTL } = useLanguage();
const text = t('nav', 'home'); // Access translations by section.key
```

### 6. File Uploads & Verification
**Security:**
- File type validation (PDF, JPG, PNG)
- Size limits (5MB default)
- Server-side verification in admin dashboard
- Public URLs for approved documents only

### 7. Performance Optimizations
- Code splitting with React.lazy()
- Image lazy loading
- Analytics batching
- Debounced search inputs
- Memoized expensive computations

### 8. Monitoring & Logging
**Error Tracking:**
- ErrorBoundary catches React errors
- Errors logged to localStorage (last 50)
- Production: Send to monitoring service

**Console Logs:**
- Structured logging in edge functions
- Client errors tracked in ErrorBoundary
- Network request monitoring

## Deployment Strategy

### Frontend
1. Build: `npm run build`
2. Deploy to Lovable Cloud (auto-deploy on push)
3. Custom domain configuration in Lovable dashboard

### Backend (Supabase)
1. Run migrations: `supabase db push`
2. Deploy edge functions: `supabase functions deploy`
3. Set secrets: `supabase secrets set LOVABLE_API_KEY=xxx`

### Required Environment Variables
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJxxx
LOVABLE_API_KEY=xxx (server-side only)
```

## Security Measures

1. **Authentication:** Supabase Auth with JWT
2. **RLS Policies:** Row-level security on all tables
3. **Input Validation:** Zod schemas for forms
4. **File Validation:** Type + size checks server-side
5. **Rate Limiting:** Lovable AI enforces rate limits
6. **CORS:** Configured in edge functions

## Testing Strategy

### Unit Tests (TODO)
- Service layer functions
- Utility helpers
- Form validation logic

### Integration Tests (TODO)
- API endpoints
- Edge functions
- Database queries

### E2E Tests (TODO - Playwright/Cypress)
- User registration flow
- Provider onboarding
- Search & booking
- AI chat interaction

## Future Enhancements

1. **Real-time Features:** WebSocket notifications
2. **Payment Integration:** Stripe for premium features
3. **Video Consultations:** WebRTC integration
4. **SMS Notifications:** Twilio integration
5. **Mobile Apps:** React Native
6. **Advanced Analytics:** Custom dashboards
7. **ML Recommendations:** Personalized provider suggestions
8. **Multi-city Expansion:** Beyond Sidi Bel Abbès

## Maintenance & Operations

**Database Backups:** Automatic daily backups via Supabase
**Monitoring:** Set up alerts for edge function errors
**Updates:** Regular dependency updates for security
**Performance:** Monitor Core Web Vitals

---

**Version:** 1.0.0  
**Last Updated:** 2025-01-07  
**Maintainer:** CityHealth Team
