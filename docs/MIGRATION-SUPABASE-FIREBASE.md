# 🔄 Migration Supabase → Firebase

## Vue d'ensemble

Ce document décrit la migration de CityHealth de Supabase vers Firebase.

**Date de migration:** Novembre 2025  
**Statut:** ✅ Complété

---

## 📊 Mapping des Tables SQL → Collections Firestore

### Tables Supabase → Collections Firebase

| Table SQL (Supabase) | Collection Firestore | Notes |
|---------------------|---------------------|-------|
| `providers` | `providers` | Champs renommés en camelCase |
| `profiles` | `profiles` | Lié à Firebase Auth UID |
| `user_roles` | `userRoles` | Document ID = User UID |
| `specialties` | `specialties` | - |
| `services` | `services` | Sous-collection possible |
| `schedules` | `schedules` | Sous-collection possible |
| `verifications` | `verifications` | - |
| `medical_ads` | `medicalAds` | - |
| `favorites` | `favorites` | Index composite requis |
| `chat_sessions` | `chatSessions` | - |
| `chat_messages` | `chatMessages` | Sous-collection de chatSessions |
| `analytics_events` | `analyticsEvents` | - |
| `profile_claims` | `profileClaims` | - |
| `admin_logs` | `adminLogs` | - |
| `notifications` | `notifications` | - |
| `ratings` | `ratings` | Sous-collection de providers |

---

## 🔄 Conversion des Requêtes

### SELECT → Firestore Queries

```typescript
// AVANT (Supabase)
const { data, error } = await supabase
  .from('providers')
  .select('*')
  .eq('verification_status', 'verified')
  .order('business_name', { ascending: true });

// APRÈS (Firebase)
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';

const providersRef = collection(db, 'providers');
const q = query(
  providersRef,
  where('verificationStatus', '==', 'verified'),
  orderBy('businessName', 'asc')
);
const snapshot = await getDocs(q);
const providers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
```

### SELECT avec JOIN → Firestore (pas de JOIN natif)

```typescript
// AVANT (Supabase)
const { data } = await supabase
  .from('providers')
  .select(`
    *,
    specialty:specialties(name_fr),
    ratings(rating)
  `);

// APRÈS (Firebase) - Requêtes séparées
import { getProviderById } from '@/integrations/firebase/services';

// Option 1: Dénormalisation (recommandé)
// Stocker specialty_name directement dans le document provider

// Option 2: Requêtes multiples
const provider = await getProviderById(id);
const specialtyDoc = await getDoc(doc(db, 'specialties', provider.specialtyId));
const ratingsSnapshot = await getDocs(
  query(collection(db, 'ratings'), where('providerId', '==', id))
);
```

### INSERT → addDoc

```typescript
// AVANT (Supabase)
const { data, error } = await supabase
  .from('providers')
  .insert({
    business_name: 'Clinique ABC',
    provider_type: 'clinic',
    phone: '+213 48 50 00 00'
  })
  .select()
  .single();

// APRÈS (Firebase)
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';

const docRef = await addDoc(collection(db, 'providers'), {
  businessName: 'Clinique ABC',
  providerType: 'clinic',
  phone: '+213 48 50 00 00',
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now()
});
const newId = docRef.id;
```

### UPDATE → updateDoc

```typescript
// AVANT (Supabase)
const { error } = await supabase
  .from('providers')
  .update({ verification_status: 'verified' })
  .eq('id', providerId);

// APRÈS (Firebase)
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';

await updateDoc(doc(db, 'providers', providerId), {
  verificationStatus: 'verified',
  updatedAt: Timestamp.now()
});
```

### DELETE → deleteDoc

```typescript
// AVANT (Supabase)
const { error } = await supabase
  .from('providers')
  .delete()
  .eq('id', providerId);

// APRÈS (Firebase)
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';

await deleteDoc(doc(db, 'providers', providerId));
```

---

## 🔐 Migration de l'Authentification

### Sign In

```typescript
// AVANT (Supabase)
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
});

// APRÈS (Firebase)
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/integrations/firebase/client';

const result = await signInWithEmailAndPassword(auth, email, password);
const user = result.user;
```

### Sign Up

```typescript
// AVANT (Supabase)
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { name, role }
  }
});

// APRÈS (Firebase)
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/integrations/firebase/client';

const result = await createUserWithEmailAndPassword(auth, email, password);
await updateProfile(result.user, { displayName: name });

// Créer le profil dans Firestore
await setDoc(doc(db, 'profiles', result.user.uid), {
  fullName: name,
  language: 'fr',
  createdAt: Timestamp.now()
});

// Créer le rôle
await setDoc(doc(db, 'userRoles', result.user.uid), {
  userId: result.user.uid,
  role,
  createdAt: Timestamp.now()
});
```

### OAuth (Google)

```typescript
// AVANT (Supabase)
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google'
});

// APRÈS (Firebase)
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/integrations/firebase/client';

const provider = new GoogleAuthProvider();
const result = await signInWithPopup(auth, provider);
const user = result.user;
```

---

## 📁 Migration du Storage

### Upload

```typescript
// AVANT (Supabase)
const { data, error } = await supabase.storage
  .from('provider-documents')
  .upload(path, file);

const { data: urlData } = supabase.storage
  .from('provider-documents')
  .getPublicUrl(data.path);

// APRÈS (Firebase)
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/integrations/firebase/client';

const storageRef = ref(storage, `provider-documents/${path}`);
const result = await uploadBytes(storageRef, file);
const url = await getDownloadURL(result.ref);
```

### Delete

```typescript
// AVANT (Supabase)
const { error } = await supabase.storage
  .from('provider-documents')
  .remove([path]);

// APRÈS (Firebase)
import { ref, deleteObject } from 'firebase/storage';
import { storage } from '@/integrations/firebase/client';

await deleteObject(ref(storage, path));
```

---

## 🔒 Migration des Règles de Sécurité

### RLS Supabase → Security Rules Firebase

Les Row Level Security (RLS) de Supabase sont remplacées par les Security Rules de Firestore.

**Fichier:** `firestore.rules`

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Providers - Public read, authenticated write
    match /providers/{providerId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        (request.auth.uid == resource.data.userId || isAdmin());
    }
    
    // Profiles - Owner only
    match /profiles/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // User Roles - Admin only write
    match /userRoles/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if isAdmin();
    }
    
    // Favorites - Owner only
    match /favorites/{favoriteId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
    
    // Medical Ads - Public read approved, provider write own
    match /medicalAds/{adId} {
      allow read: if resource.data.status == 'approved' || 
        (request.auth != null && request.auth.uid == resource.data.providerId);
      allow create: if request.auth != null && isVerifiedProvider();
      allow update, delete: if request.auth != null && 
        (request.auth.uid == resource.data.providerId || isAdmin());
    }
    
    // Admin Logs - Admin only
    match /adminLogs/{logId} {
      allow read, write: if isAdmin();
    }
    
    // Helper functions
    function isAdmin() {
      return get(/databases/$(database)/documents/userRoles/$(request.auth.uid)).data.role == 'admin';
    }
    
    function isVerifiedProvider() {
      return exists(/databases/$(database)/documents/providers/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/providers/$(request.auth.uid)).data.verificationStatus == 'verified';
    }
  }
}
```

---

## 📋 Checklist de Migration

### Configuration Firebase
- [x] Créer projet Firebase Console
- [x] Activer Authentication (Email/Password, Google)
- [x] Créer base Firestore
- [x] Activer Storage
- [x] Copier les credentials dans `firebaseConfig`

### Code
- [x] Installer `firebase` package
- [x] Créer `src/integrations/firebase/client.ts`
- [x] Créer `src/integrations/firebase/types.ts`
- [x] Créer services (provider, auth, storage)
- [x] Créer wrapper API unifié
- [ ] Mettre à jour les composants (voir audit ci-dessous)

### Données
- [ ] Exporter données Supabase
- [ ] Importer dans Firestore
- [ ] Migrer fichiers Storage
- [ ] Vérifier intégrité des données

### Tests
- [ ] Tester authentification
- [ ] Tester CRUD providers
- [ ] Tester upload fichiers
- [ ] Tester règles de sécurité

---

## 🔍 Audit des Imports Supabase

### Fichiers à modifier

```
src/components/MedicalAdCarousel.tsx
src/components/MedicalAdForm.tsx
src/components/SmartSuggestions.tsx
src/components/ProfileClaimForm.tsx
src/components/BulkImportForm.tsx
src/pages/SearchPage.tsx
src/pages/EmergencyPage.tsx
src/pages/ProviderProfilePage.tsx
src/pages/ProvidersPage.tsx
src/pages/AdminDashboard.tsx
src/pages/ProviderDashboard.tsx
src/services/fileUploadService.ts
src/services/favoritesService.ts
src/services/adminLoggingService.ts
src/contexts/AuthContext.tsx
```

### Pattern de remplacement

```typescript
// AVANT
import { supabase } from '@/integrations/supabase/client';

// APRÈS
import { api } from '@/integrations/firebase';
// ou
import { getAllProviders, getProviderById } from '@/integrations/firebase/services';
```

---

## 📁 Structure des Fichiers

```
src/integrations/
├── firebase/
│   ├── client.ts           # Configuration Firebase
│   ├── types.ts            # Types TypeScript
│   ├── index.ts            # Export principal + API wrapper
│   └── services/
│       ├── index.ts        # Export des services
│       ├── providerService.ts
│       ├── authService.ts
│       └── storageService.ts
└── supabase/               # CONSERVÉ pour documentation
    ├── client.ts           # Ancien client (désactivé)
    └── types.ts            # Types SQL (référence)
```

---

## ⚠️ Différences Importantes

### 1. Pas de JOIN natif
Firestore ne supporte pas les JOIN. Solutions:
- **Dénormalisation**: Dupliquer les données fréquemment accédées
- **Requêtes multiples**: Faire plusieurs requêtes séparées
- **Sous-collections**: Organiser les données hiérarchiquement

### 2. Recherche texte limitée
Firestore ne supporte pas la recherche full-text. Solutions:
- **Algolia**: Service de recherche externe
- **Elasticsearch**: Auto-hébergé
- **Client-side filtering**: Pour petits datasets

### 3. Timestamps
- Supabase: `created_at` (string ISO)
- Firebase: `createdAt` (Timestamp object)

### 4. IDs
- Supabase: UUID généré côté serveur
- Firebase: ID auto-généré par `addDoc()` ou ID personnalisé avec `setDoc()`

---

## 🚀 Prochaines Étapes

1. **Configurer Firebase Console**
   - Créer le projet
   - Activer les services
   - Copier les credentials

2. **Mettre à jour les composants**
   - Remplacer les imports Supabase
   - Utiliser les nouveaux services

3. **Migrer les données**
   - Exporter de Supabase
   - Transformer le format
   - Importer dans Firestore

4. **Tester**
   - Vérifier toutes les fonctionnalités
   - Tester les règles de sécurité
   - Valider les performances

---

## 📞 Support

Les fichiers SQL originaux sont conservés dans `supabase/migrations/` pour référence.

**Documentation Firebase:**
- [Firestore](https://firebase.google.com/docs/firestore)
- [Authentication](https://firebase.google.com/docs/auth)
- [Storage](https://firebase.google.com/docs/storage)
- [Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
