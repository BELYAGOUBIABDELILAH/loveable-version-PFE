# Analyse Approfondie & Plan de Lancement - CityHealth

## 1. Cartographie de l'Architecture

### 1.1 Vue d'Ensemble
L'application est une SPA React (Vite) structurée autour de composants UI (Shadcn/Tailwind) et de services métier.
- **Frontend** : React 18, TypeScript, Tailwind CSS, Lucide Icons.
- **Backend (BaaS)** : Supabase (Auth, Database, Edge Functions).
- **State Management** : Context API (`AuthContext`, `LanguageContext`, `ThemeContext`) + React Query (installé mais sous-utilisé).

### 1.2 Flux de Données & Incohérences Critiques
> [!CRITICAL]
> **Problème Majeur d'Authentification** :
> Actuellement, `AuthContext.tsx` utilise un système de **MOCK** basé sur `localStorage` pour simuler l'authentification.
> Cependant, les services comme `adminLoggingService.ts` tentent d'utiliser `supabase.auth.getUser()`.
> **Conséquence** : L'application ne peut pas fonctionner en production. Les appels à la base de données échoueront car l'utilisateur n'est pas réellement authentifié auprès de Supabase (RLS policies bloquantes).

### 1.3 Modules Principaux
| Module | État | Description |
| :--- | :--- | :--- |
| **Auth** | 🔴 **Broken** | Mock local vs dépendance Supabase réelle. À réécrire totalement. |
| **Providers** | 🟡 **Partiel** | Affichage OK, mais import en masse inefficace et recherche côté client. |
| **Map** | 🔴 **Placeholder** | `MapSection` est une coquille vide sans vraie carte interactive. |
| **Admin** | 🟡 **Fragile** | Logs implémentés mais dépendent d'une auth inexistante. |
| **UI/Design** | 🟢 **Solide** | Système de design bien défini dans `index.css` (variables CSS, glassmorphism). |

## 2. Risques & Dettes Techniques

### 2.1 Risques de Stabilité
1.  **Auth Disconnect** : Le plus grand risque. L'app simule être connectée mais ne l'est pas au niveau API.
2.  **Type Safety** : `tsconfig` permissif + `as any` partout = bombes à retardement.
3.  **Performance** :
    - Import CSV séquentiel (O(n) requêtes).
    - Pas de virtualisation pour les longues listes de prestataires.
    - Bundle unique (pas de lazy loading).

### 2.2 Modules Abandonnés / Code Mort
-   `src/pages/Index.tsx` : Ancienne landing page, remplacée par `NewIndex.tsx`. À supprimer.
-   `src/components/CounterAnimation.tsx` : Utilisé ? À vérifier.

## 3. Plan de Travail Séquencé

### Phase 1 : Fondations & Sécurité (Semaine 1)
1.  **Migration Auth** : Remplacer le mock dans `AuthContext` par le vrai `supabase.auth`.
2.  **Type Hardening** : Activer `strict: true` et générer les types Supabase (`supabase gen types`).
3.  **Nettoyage** : Supprimer `Index.tsx` et les routes dupliquées.

### Phase 2 : Fonctionnalités Core (Semaine 2)
4.  **Carte Interactive** : Intégrer `react-map-gl` ou `leaflet` dans `MapSection`.
5.  **Optimisation Import** : Réécrire `BulkImportForm` pour utiliser `insert([])` (batch).
6.  **Lazy Loading** : Découper le routing avec `React.lazy`.

### Phase 3 : UX & Polish (Semaine 3)
7.  **Framer Motion** : Installer `framer-motion` et remplacer les animations CSS manuelles pour plus de fluidité.
8.  **Feedback UI** : Ajouter des squelettes (Skeletons) pendant les chargements de données (remplacer les spinners bloquants).

## 4. Proposition Refonte UI/UX

### 4.1 Design System (Existant à renforcer)
Le fichier `index.css` définit déjà une belle palette "Santé Moderne" (Vert Menthe #9DBBAE, Blanc Cassé).
-   **Typography** : Standardiser sur `Inter` (UI) et `Tajawal` (Arabe).
-   **Glassmorphism** : Utiliser les classes `.glass-panel` existantes de manière cohérente sur toutes les cards.

### 4.2 Améliorations Visuelles
-   **Cartes Prestataires** : Ajouter un état "Hover" plus marqué (légère élévation + glow).
-   **Transitions** : Utiliser `AnimatePresence` de Framer Motion pour les changements de pages (fondu enchaîné doux).

## 5. Préparation Production

### 5.1 Variables d'Environnement
Créer un `.env` propre :
```env
VITE_SUPABASE_URL=https://xyz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_MAPBOX_TOKEN=pk... (si Mapbox choisi)
```

### 5.2 Checklist Déploiement
- [ ] Build production sans erreur (`npm run build`).
- [ ] Vérification des règles RLS Supabase (Security Rules).
- [ ] Configuration des redirections SPA sur l'hébergeur (Netlify/Vercel).
- [ ] Audit Lighthouse (Performance, Accessibilité).

## 6. Nouvelles Fonctionnalités Pertinentes
1.  **Onboarding** : Un tour guidé au premier lancement pour expliquer la recherche et les urgences.
2.  **Favoris (Local)** : Permettre de sauvegarder des médecins en local (localStorage) sans compte.
3.  **Mode Urgence** : Un bouton flottant "SOS" toujours visible qui appelle le 15 ou affiche la pharmacie de garde la plus proche (géolocalisation requise).

## 7. Rapport d'Erreurs Techniques (Extrait)
-   `AuthContext.tsx` : Logique Mock à supprimer d'urgence.
-   `BulkImportForm.tsx` : Regex inefficaces et échappements inutiles.
-   `App.tsx` : Route `/profile` définie deux fois.
-   `package.json` : Manque `framer-motion` malgré la demande d'animations avancées.

---
**Recommandation Immédiate** : Ne **PAS** commencer par le design ou les nouvelles features. La priorité absolue est de connecter le `AuthContext` à Supabase, sinon l'application est une coquille vide inutilisable.
