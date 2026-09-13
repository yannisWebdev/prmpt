# MISSION

Tu dois développer progressivement une application React existante appelée :

**Network Log Explorer**

L'application permet de visualiser et explorer des logs réseau fictifs provenant de terminaux mobiles.

Technologies obligatoires :

* React
* Vite
* Tailwind CSS
* JavaScript uniquement
* `lucide-react`
* `@tanstack/react-virtual`

Application **100 % frontend**.

Interdictions :

* TypeScript
* backend
* API
* Express
* FastAPI
* base de données
* WebSocket
* Grafana
* Loki
* Prometheus
* Datadog
* Kibana

Les logs sont générés localement.

Les bookmarks, notes, highlights et préférences sont stockés avec `localStorage`.

---

# RÈGLE PRINCIPALE : TRAVAILLER PAR PETITES ÉTAPES

IMPORTANT : tu es un agent de développement.

Tu ne dois PAS essayer de réaliser toute l'application dans une seule réponse.

Travaille exclusivement par petites étapes.

À chaque tour :

1. inspecte seulement ce qui est nécessaire ;
2. réalise UNE petite étape cohérente ;
3. modifie directement les fichiers concernés ;
4. vérifie rapidement ton travail ;
5. arrête-toi.

Ne réalise jamais plusieurs grandes phases dans le même tour.

---

# CONTRÔLE DE LA TAILLE DES RÉPONSES

Ta réponse finale après chaque étape doit être TRÈS COURTE.

Maximum recommandé :

**300 mots.**

Ne recopie jamais le contenu complet des fichiers que tu viens de modifier.

Ne montre pas de fichier entier sauf si l'utilisateur le demande explicitement.

Ne donne pas de long tutoriel.

Ne répète pas les exigences du projet.

Ne fais pas de résumé détaillé du raisonnement.

Ne produis pas ton raisonnement interne.

Réfléchis silencieusement puis exécute.

Après une modification, réponds simplement avec :

```text
Étape terminée : <nom>

Modifié :
- fichier
- fichier

Fait :
- ...
- ...

Vérification :
- ...

Prochaine étape :
- ...
```

Maximum 5 à 8 lignes si possible.

---

# RÈGLE DE DÉCOUPAGE

Une étape doit idéalement modifier :

* 1 fichier ;
* 2 fichiers ;
* maximum 3 fichiers si nécessaire.

Exception uniquement si une modification mécanique très simple nécessite plusieurs fichiers.

Évite les énormes modifications d'un seul coup.

---

# RÈGLE D'AUTONOMIE

Ne demande pas confirmation entre les étapes.

Si un choix technique mineur n'est pas spécifié :

* choisis la solution la plus simple ;
* évite l'over-engineering ;
* reste cohérent avec l'architecture existante.

Si tu termines une étape, arrête ta réponse.

Au prochain tour, continue automatiquement à partir de l'étape suivante.

---

# RÈGLE DE CONTEXTE

Avant de modifier un fichier :

1. inspecte-le ;
2. comprends son rôle ;
3. modifie uniquement ce qui est nécessaire.

Ne réécris pas inutilement un fichier complet.

Ne casse pas une fonctionnalité déjà fonctionnelle.

Conserve la configuration React/Vite/Tailwind existante si elle fonctionne.

---

# OBJECTIF FONCTIONNEL

L'application affiche entre **10 000 et 20 000 logs réseau fictifs**.

Chaque log contient au minimum :

```js
{
  id,
  timestamp,
  deviceId,
  operator,
  rsrp,
  severity,
  message,
  context: {
    networkType,
    cellId,
    frequency,
    latency,
    packetLoss,
    signalQuality
  }
}
```

Opérateurs :

```text
Orange
SFR
Bouygues Telecom
Free
```

Severity :

```text
INFO
WARNING
ERROR
```

Créer environ 10 à 30 devices :

```text
DEVICE-001
DEVICE-002
...
```

---

# MOCKS RÉALISTES

Ne génère pas simplement des valeurs totalement aléatoires.

Les logs doivent former des séquences cohérentes.

Exemple de dégradation :

```text
-86
-88
-91
-95
-101
-107
-113
-118
```

Puis éventuellement :

```text
WARNING Weak signal detected
ERROR Network connection lost
```

Puis récupération :

```text
-116
-108
-101
-94
-88
```

Les opérateurs doivent également rester identiques pendant plusieurs logs avant de changer.

Évite :

```text
Orange
Free
SFR
Orange
Free
```

Préfère :

```text
Orange
Orange
Orange
Orange
SFR
SFR
SFR
Bouygues
Bouygues
```

Lors d'un changement :

```text
Operator changed from Orange to SFR
```

---

# RSRP

Créer :

```js
getRsrpQuality(rsrp)
```

Référence :

```text
>= -80       Excellent
-80 à -90    Very Good
-90 à -100   Good
-100 à -110  Poor
< -110       Critical
```

La severity doit être partiellement corrélée à la qualité réseau.

Exemples :

INFO :

```text
Network connection established
Network connection stable
Operator selected
Cell handover completed
Signal strength updated
Data session established
```

WARNING :

```text
Weak signal detected
High network latency
Packet loss detected
Signal degradation detected
Network type fallback to 4G
```

ERROR :

```text
Network connection lost
Data session timeout
Cell handover failed
Network registration failed
Severe signal degradation
Packet transmission failed
```

Toutes les erreurs ne doivent cependant pas dépendre uniquement du RSRP.

---

# DESIGN

Interface :

* professionnelle ;
* moderne ;
* sobre ;
* dense ;
* desktop-first ;
* très lisible.

Éviter :

* grosses cards ;
* énormes border-radius ;
* couleurs décoratives ;
* espaces excessifs.

Privilégier :

* bordures fines ;
* petits radius ;
* toolbar compacte ;
* forte densité ;
* typographie claire ;
* monospace pour les logs.

Support :

* dark mode ;
* light mode.

Le dark mode doit être particulièrement propre.

---

# LAYOUT

Organisation générale :

```text
┌───────────────────────────────────────────────────────────────┐
│ TOOLBAR                                                       │
├────┬──────────────────────────────┬──────────┬────────────────┤
│ OP │                              │ MINIMAP  │ BOOKMARKS      │
│    │         LOG VIEWER           │          │ & NOTES        │
│    │                              │          │                │
└────┴──────────────────────────────┴──────────┴────────────────┘
```

Le Log Viewer occupe la majorité de l'écran.

Le panneau Bookmarks peut être fermé.

---

# LOG VIEWER

Le Log Viewer est la fonctionnalité principale.

Exemple :

```text
14:32:45.213 | DEVICE-042 | ORANGE | 5G | -92 dBm  | INFO  | Network connection stable
14:32:50.304 | DEVICE-042 | ORANGE | 5G | -104 dBm | WARN  | Weak signal detected
14:32:55.114 | DEVICE-042 | ORANGE | 4G | -116 dBm | ERROR | Network connection lost
```

Colonnes :

```text
timestamp
device
operator
network
RSRP
severity
message
```

Contraintes :

* lignes compactes ;
* police monospace ;
* colonnes alignées ;
* scroll fluide.

---

# VIRTUALISATION

Obligatoire.

Utiliser :

```text
@tanstack/react-virtual
```

Ne jamais rendre 20 000 lignes simultanément dans le DOM.

Ordre :

```text
ancien
↓
récent
```

Scroll vers le bas = avancer dans le temps.

---

# DÉTAIL D'UN LOG

Cliquer sur une ligne permet de consulter :

* Device ID
* Timestamp
* Operator
* RSRP
* Network type
* Cell ID
* Frequency
* Latency
* Packet loss
* Signal quality
* Message
* Severity
* contexte JSON

Choisir une UI compacte cohérente avec le Log Viewer.

---

# OPERATOR STRIP

Ajouter une bande très fine immédiatement à gauche du Log Viewer.

Couleurs :

```text
Orange           orange
SFR              rouge
Free             violet
Bouygues Telecom bleu
```

IMPORTANT :

Ne colore jamais toute la ligne selon l'opérateur.

Uniquement la bande correspondante.

La bande doit être parfaitement synchronisée avec les lignes visibles.

---

# MINIMAP

Ajouter une minimap verticale à droite du Log Viewer.

Principe similaire à l'overview ruler de VS Code.

Couleurs :

```text
INFO    bleu
WARNING ambre
ERROR   rouge
```

Créer une fonction indépendante :

```js
createMinimapBuckets(logs, bucketCount)
```

Exemple :

```js
{
  startIndex,
  endIndex,
  info,
  warning,
  error,
  dominantSeverity,
  startTimestamp,
  endTimestamp
}
```

Priorité :

```text
ERROR > WARNING > INFO
```

Interactions obligatoires :

* hover avec tooltip ;
* clic pour naviguer ;
* représentation du viewport courant ;
* viewport synchronisé avec le scroll.

Drag du viewport = bonus.

---

# NAVIGATION PROGRAMMATIQUE

Centraliser la navigation :

```js
scrollToLog(logId)
```

Utiliser le virtualizer.

Éviter de piloter le scroll avec :

```js
document.querySelector(...)
```

Lorsqu'un log est ciblé :

```js
focusedLogId
```

Afficher un léger highlight temporaire pendant environ une seconde.

---

# RECHERCHE PAR DATE

La barre de recherche doit aussi permettre de saisir ou sélectionner une date/heure.

Lorsque l'utilisateur choisit une date :

1. trouver le log ayant le timestamp correspondant ou le plus proche ;
2. retrouver son index dans le dataset filtré ;
3. utiliser le virtualizer ;
4. centrer approximativement le log ;
5. appliquer `focusedLogId`.

Cette navigation doit fonctionner avec plusieurs milliers de logs.

---

# FILTRES

Ajouter :

### Search

Cherche dans :

* message ;
* device ;
* operator ;
* cell ID ;
* contexte.

### Operator

Multi-select :

```text
Orange
SFR
Bouygues
Free
```

### Severity

```text
INFO
WARNING
ERROR
```

### Device

```text
All devices
DEVICE-001
DEVICE-002
...
```

### RSRP

```text
All
Excellent
Very Good
Good
Poor
Critical
```

Le même dataset filtré doit alimenter :

```text
Log Viewer
Operator Strip
Minimap
Statistiques
```

---

# BOOKMARKS

Chaque log peut être bookmarké.

Structure :

```js
{
  logId,
  createdAt,
  note
}
```

Utiliser `lucide-react`.

Par exemple :

```text
Bookmark
BookmarkCheck
```

Les bookmarks apparaissent dans un panneau à droite de la minimap.

Cliquer sur un bookmark :

1. retrouve le log ;
2. retrouve son index ;
3. navigue avec le virtualizer ;
4. centre approximativement le log ;
5. applique `focusedLogId`.

Si le log est masqué par les filtres :

```text
This log is hidden by the current filters.
```

avec :

```text
Clear filters and show log
```

---

# NOTES

Un bookmark peut contenir une note.

Actions :

```text
Add note
Edit note
Delete note
```

La note appartient au bookmark.

---

# HIGHLIGHTS

Permettre de surligner manuellement un log.

Couleurs :

* jaune
* vert
* bleu
* violet
* rose
* orange

Le highlight doit rester subtil.

Ajouter :

```text
Remove highlight
```

---

# LOCAL STORAGE

Créer un utilitaire/hook centralisé :

```text
useLocalStorage.js
```

Persister :

* bookmarks ;
* notes ;
* highlights ;
* thème ;
* éventuellement état du panneau bookmarks.

Ne pas appeler `localStorage` directement depuis de nombreux composants.

---

# TOOLBAR

Toolbar compacte avec approximativement :

```text
Network Logs | 12,482 logs | Search | Date | Operator | Severity | Device | RSRP | Bookmarks 8 | Theme
```

Afficher également de manière compacte :

```text
12,482 logs
407 errors
1,782 warnings
10,293 info
```

Pas de grosses cards KPI.

---

# ARCHITECTURE CIBLE

Utiliser une architecture proche de :

```text
src/
├── components/
│   ├── layout/
│   ├── logs/
│   ├── minimap/
│   ├── bookmarks/
│   ├── filters/
│   └── ui/
├── hooks/
├── mocks/
├── utils/
├── constants/
├── App.jsx
├── main.jsx
└── index.css
```

Composants recommandés :

```text
AppLayout
LogToolbar

LogViewer
LogRow
LogDetails
OperatorStrip
SeverityBadge
RsrpIndicator

LogMinimap
MinimapTooltip

BookmarkPanel
BookmarkItem
BookmarkNoteEditor

SearchInput
OperatorFilter
SeverityFilter
DeviceFilter
RsrpFilter
```

Hooks/utilitaires possibles :

```text
useBookmarks
useHighlights
useLogFilters
useLocalStorage

generateLogs
getRsrpQuality
createMinimapBuckets
formatDate
```

Ne mets jamais toute l'application dans `App.jsx`.

---

# PERFORMANCE

Cible :

```text
20 000 logs
```

Utiliser lorsque réellement utile :

```js
useMemo
useCallback
React.memo
```

Éviter les recalculs inutiles.

Le virtualizer doit être la référence pour la position du scroll.

Doivent rester synchronisés :

```text
Log Viewer
Operator Strip
Minimap
Minimap viewport
Bookmarks
Focused log
Selected log
```

---

# ACCESSIBILITÉ

Prévoir :

* focus visible ;
* navigation clavier raisonnable ;
* `aria-label` sur les boutons icône ;
* contrastes corrects.

---

# DÉPENDANCES

Limiter les dépendances à :

```text
react
react-dom
vite
tailwindcss
lucide-react
@tanstack/react-virtual
```

N'ajouter une autre dépendance que si elle apporte une réelle valeur.

Pas de Material UI.

Pas d'Ant Design.

---

# EMPTY STATES

Gérer correctement :

```text
No logs match the current filters.
No search results.
No bookmarks yet.
```

---

# PLAN D'EXÉCUTION OBLIGATOIRE

IMPORTANT :

Respecte exactement cet ordre.

Chaque numéro ci-dessous contient plusieurs micro-étapes.

Ne réalise qu'une micro-étape par tour.

---

## PHASE 1 — INSPECTION ET SQUELETTE

### 1.1

Inspecter :

```text
package.json
src/
configuration Vite
configuration Tailwind
```

Ne rien modifier inutilement.

STOP.

### 1.2

Définir l'architecture de dossiers minimale nécessaire.

Créer uniquement les dossiers/fichiers de base nécessaires.

STOP.

### 1.3

Créer le layout principal :

```text
Toolbar
Operator Strip placeholder
Log Viewer placeholder
Minimap placeholder
Bookmarks placeholder
```

STOP.

---

## PHASE 2 — MODÈLE ET MOCKS

### 2.1

Créer les constantes :

```text
operators
severity
couleurs
```

STOP.

### 2.2

Créer :

```js
getRsrpQuality()
```

STOP.

### 2.3

Créer la structure du générateur de logs.

Commencer avec un petit nombre de logs pour validation.

STOP.

### 2.4

Ajouter les séquences réalistes :

```text
dégradation
récupération
changements opérateur
severity
```

STOP.

### 2.5

Passer à environ 10 000-20 000 logs.

STOP.

---

## PHASE 3 — LOG VIEWER

### 3.1

Créer `LogRow`.

STOP.

### 3.2

Créer `LogViewer`.

STOP.

### 3.3

Ajouter `@tanstack/react-virtual`.

STOP.

### 3.4

Valider le scroll avec 20 000 logs.

STOP.

### 3.5

Ajouter sélection d'une ligne.

STOP.

### 3.6

Ajouter détail du log.

STOP.

---

## PHASE 4 — OPERATOR STRIP

### 4.1

Créer `OperatorStrip`.

STOP.

### 4.2

Synchroniser exactement avec les lignes virtualisées.

STOP.

---

## PHASE 5 — MINIMAP

### 5.1

Créer :

```js
createMinimapBuckets()
```

STOP.

### 5.2

Afficher les buckets.

STOP.

### 5.3

Ajouter les couleurs severity.

STOP.

### 5.4

Ajouter tooltip.

STOP.

### 5.5

Ajouter clic → navigation.

STOP.

### 5.6

Ajouter viewport synchronisé.

STOP.

---

## PHASE 6 — FILTRES

### 6.1

Créer l'état central des filtres.

STOP.

### 6.2

Ajouter recherche texte.

STOP.

### 6.3

Ajouter recherche/navigation par date.

STOP.

### 6.4

Ajouter filtre operator.

STOP.

### 6.5

Ajouter filtre severity.

STOP.

### 6.6

Ajouter filtre device.

STOP.

### 6.7

Ajouter filtre RSRP.

STOP.

### 6.8

Vérifier que Viewer + Strip + Minimap + Stats utilisent exactement le même dataset.

STOP.

---

## PHASE 7 — NAVIGATION

### 7.1

Créer :

```js
scrollToLog(logId)
```

STOP.

### 7.2

Créer :

```text
focusedLogId
```

avec effet visuel temporaire.

STOP.

---

## PHASE 8 — BOOKMARKS

### 8.1

Créer `useLocalStorage`.

STOP.

### 8.2

Créer logique bookmarks.

STOP.

### 8.3

Ajouter bouton bookmark sur les logs.

STOP.

### 8.4

Créer panneau bookmarks.

STOP.

### 8.5

Ajouter bookmark → scrollToLog.

STOP.

### 8.6

Gérer bookmark masqué par filtres.

STOP.

---

## PHASE 9 — NOTES

### 9.1

Ajouter notes aux bookmarks.

STOP.

### 9.2

Ajouter édition et suppression.

STOP.

---

## PHASE 10 — HIGHLIGHTS

### 10.1

Créer logique highlight.

STOP.

### 10.2

Ajouter choix de couleur.

STOP.

### 10.3

Ajouter suppression.

STOP.

### 10.4

Persister dans localStorage.

STOP.

---

## PHASE 11 — TOOLBAR

### 11.1

Finaliser statistiques compactes.

STOP.

### 11.2

Finaliser les contrôles de filtres.

STOP.

### 11.3

Ajouter compteur bookmarks.

STOP.

---

## PHASE 12 — THÈMES

### 12.1

Finaliser dark mode.

STOP.

### 12.2

Finaliser light mode.

STOP.

### 12.3

Persister le thème.

STOP.

---

## PHASE 13 — POLISH

Procéder encore par petites étapes :

```text
13.1 responsive desktop
13.2 empty states
13.3 accessibility
13.4 tooltips
13.5 détails visuels
13.6 optimisation des rerenders
```

Un seul point par tour.

---

## PHASE 14 — VALIDATION

### 14.1

Exécuter :

```bash
npm run build
```

Corriger uniquement les erreurs rencontrées.

STOP si plusieurs problèmes nécessitent des modifications importantes.

### 14.2

Relancer :

```bash
npm run build
```

STOP.

### 14.3

Vérifier les principales interactions.

STOP.

---

# GESTION DES ERREURS

Si une commande échoue :

1. lis l'erreur ;
2. identifie la cause probable ;
3. corrige uniquement cette cause ;
4. relance la commande nécessaire ;
5. arrête-toi lorsque l'étape fonctionne.

Ne profite pas d'une erreur pour refactorer toute l'application.

---

# PROTECTION CONTRE LES BOUCLES

Si tu as déjà tenté deux fois la même correction sans succès :

STOP.

Réponds brièvement :

```text
Blocage :
<erreur>

Tentatives :
- ...
- ...

Cause probable :
...

Prochaine correction recommandée :
...
```

N'enchaîne pas indéfiniment les tentatives.

---

# INTERDICTION DE VERBOSITÉ

Ne produis jamais :

* ton raisonnement étape par étape ;
* de longues explications ;
* une analyse détaillée avant d'agir ;
* la totalité des fichiers après modification ;
* un récapitulatif de toutes les exigences ;
* une liste de ce qu'il restera à faire sur 50 lignes.

Réfléchis silencieusement.

Utilise les outils.

Modifie les fichiers.

Teste.

Réponds brièvement.

---

# ÉTAT DE PROGRESSION

Tu dois conserver mentalement la phase actuelle.

À la fin de chaque réponse, indique uniquement :

```text
Prochaine étape : X.X — nom
```

Au tour suivant, commence directement cette étape.

Ne recommence pas depuis la phase 1.

---

# PRIORITÉS

Si un compromis est nécessaire :

1. application fonctionnelle ;
2. absence d'erreurs ;
3. virtualisation ;
4. performances ;
5. Log Viewer ;
6. navigation ;
7. minimap ;
8. Operator Strip ;
9. filtres ;
10. bookmarks ;
11. UX ;
12. esthétique ;
13. bonus.

---

# BONUS

Seulement lorsque toutes les fonctionnalités principales fonctionnent :

```text
Live mock mode
```

Un nouveau log peut être généré toutes les 1 à 3 secondes.

Ne commence jamais ce bonus avant la validation complète du reste.

---

# PREMIÈRE ACTION

Commence UNIQUEMENT par la micro-étape :

```text
1.1 — Inspecter le projet existant
```

Inspecte uniquement ce qui est nécessaire pour connaître :

* la structure du projet ;
* les dépendances ;
* la configuration React/Vite ;
* la configuration Tailwind.

Ne commence aucune fonctionnalité.

Ne crée encore aucun composant.

Ne réécris aucun fichier inutilement.

Une fois l'inspection terminée, réponds en maximum 8 lignes et termine par :

```text
Prochaine étape : 1.2 — Architecture minimale
```
