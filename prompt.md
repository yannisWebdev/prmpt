# OBJECTIF

Je veux que tu construises une application web **100 % frontend** permettant de visualiser et d'explorer des logs réseau provenant de terminaux mobiles fictifs.

L'application doit être développée avec :

* React
* Vite
* Tailwind CSS
* JavaScript uniquement, pas TypeScript
* composants React réutilisables
* architecture propre et maintenable
* données entièrement mockées côté frontend
* `localStorage` pour la persistance des bookmarks, notes, highlights et préférences

Il n'y a :

* aucun backend ;
* aucune API ;
* aucune base de données ;
* aucun WebSocket ;
* aucun serveur de logs ;
* aucune intégration Grafana ;
* aucune intégration Datadog ;
* aucune intégration Kibana ;
* aucune notion d'infrastructure d'observabilité.

Le projet est uniquement une **application frontend de visualisation de logs réseau fictifs**.

Je ne veux PAS d'une simple maquette statique.

Toutes les fonctionnalités décrites ci-dessous doivent fonctionner réellement avec les données mockées.

---

# 1. CONTEXTE

Des terminaux mobiles fictifs produisent régulièrement des logs concernant leur connectivité réseau.

Chaque log doit notamment contenir :

* le terminal concerné ;
* la date et l'heure ;
* l'opérateur mobile utilisé ;
* la qualité du réseau ;
* la valeur RSRP ;
* le niveau du log ;
* un message ;
* du contexte technique supplémentaire.

Opérateurs disponibles :

* Orange
* SFR
* Bouygues Telecom
* Free

Niveaux :

* INFO
* WARNING
* ERROR

L'objectif de l'interface est de permettre de parcourir rapidement plusieurs milliers de logs afin d'identifier :

* les erreurs ;
* les warnings ;
* les périodes de mauvaise qualité réseau ;
* les changements d'opérateur ;
* les mauvaises valeurs RSRP ;
* les événements particuliers concernant un terminal.

---

# 2. DESIGN GLOBAL

Je veux une interface :

* professionnelle ;
* moderne ;
* sobre ;
* dense ;
* très lisible ;
* orientée application desktop ;
* adaptée à l'affichage de beaucoup de données.

Ne fais pas un dashboard composé de grosses cards.

Évite :

* les énormes border-radius ;
* les composants surdimensionnés ;
* les couleurs décoratives inutiles ;
* les grands espaces perdus.

Privilégie :

* bordures fines ;
* faible border-radius ;
* toolbar compacte ;
* typographie claire ;
* police monospace dans les logs ;
* forte densité d'information ;
* excellente hiérarchie visuelle.

Prévoir :

* thème clair ;
* thème sombre ;
* bouton permettant de basculer entre les deux.

Le dark mode doit être particulièrement soigné.

---

# 3. LAYOUT PRINCIPAL

L'application doit occuper pratiquement tout le viewport.

Structure générale :

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ TOOLBAR                                                                      │
├─────┬─────────────────────────────────────────────┬───────────┬──────────────┤
│ OP  │                                             │           │              │
│ BAR │               LOG VIEWER                    │  MINIMAP  │  BOOKMARKS   │
│     │                                             │           │   & NOTES    │
│     │                                             │           │              │
└─────┴─────────────────────────────────────────────┴───────────┴──────────────┘
```

Les différentes zones sont :

1. Toolbar supérieure
2. Operator Strip très fin à gauche
3. Log Viewer principal
4. Minimap / heatmap verticale à droite
5. Panneau Bookmarks & Notes encore plus à droite

Le Log Viewer doit conserver la majorité de l'espace disponible.

Le panneau Bookmarks doit pouvoir être ouvert et fermé.

---

# 4. GÉNÉRATION DES MOCKS

Créer un véritable générateur de logs.

Ne pas écrire manuellement 20 lignes statiques.

Créer entre :

```text
10 000 et 20 000 logs
```

afin de réellement tester :

* la virtualisation ;
* le scroll ;
* les performances ;
* les filtres ;
* la minimap ;
* les bookmarks.

Créer par exemple :

```text
src/mocks/generateLogs.js
```

Structure indicative d'un log :

```js
{
  id: "log_000001",

  timestamp: "2026-09-12T14:32:45.213Z",

  deviceId: "DEVICE-042",

  operator: "Orange",

  rsrp: -92,

  severity: "INFO",

  message: "Network connection stable",

  context: {
    networkType: "5G",
    cellId: "20801-394829",
    frequency: 3500,
    latency: 32,
    packetLoss: 0.2,
    signalQuality: "good"
  }
}
```

Créer environ 10 à 30 terminaux fictifs :

```text
DEVICE-001
DEVICE-002
DEVICE-003
...
```

Faire varier de manière cohérente :

* timestamp ;
* terminal ;
* opérateur ;
* severity ;
* RSRP ;
* network type ;
* latency ;
* packet loss ;
* fréquence ;
* cell ID ;
* message.

---

# 5. MOCKS RÉALISTES

Les mocks ne doivent pas être complètement aléatoires.

Créer des séquences cohérentes.

Par exemple :

```text
-86 dBm
-88 dBm
-91 dBm
-95 dBm
-101 dBm
-107 dBm
-113 dBm
-118 dBm
```

puis éventuellement :

```text
WARNING Weak signal detected
ERROR Network connection lost
```

Créer aussi des périodes de récupération :

```text
-116
-108
-101
-94
-88
```

Le dataset doit contenir des scénarios intéressants à visualiser.

---

# 6. RSRP

Utiliser des valeurs réalistes.

Référence approximative :

```text
>= -80 dBm       Excellent
-80 à -90 dBm    Very Good
-90 à -100 dBm   Good
-100 à -110 dBm  Poor
< -110 dBm       Critical
```

Créer une fonction utilitaire :

```js
getRsrpQuality(rsrp)
```

pour centraliser cette logique.

---

# 7. CORRÉLATION SEVERITY / RÉSEAU

La severity doit être partiellement corrélée à la qualité réseau.

Exemples :

### INFO

* connexion normale ;
* changement de cellule réussi ;
* bonne qualité réseau ;
* signal mis à jour ;
* connexion établie.

### WARNING

* signal faible ;
* latence élevée ;
* packet loss ;
* dégradation progressive ;
* fallback de 5G vers 4G.

### ERROR

* perte réseau ;
* handover failed ;
* timeout ;
* network registration failed ;
* packet transmission failed ;
* signal extrêmement faible.

Ne rends cependant pas toutes les erreurs uniquement dépendantes du RSRP.

---

# 8. MESSAGES MOCKÉS

Créer plusieurs dizaines de messages possibles.

INFO :

```text
Network connection established
Network connection stable
Operator selected
Cell handover completed
Network type changed from 4G to 5G
Signal strength updated
Data session established
```

WARNING :

```text
Weak signal detected
High network latency
Packet loss detected
Frequent cell handovers detected
Signal degradation detected
Network type fallback to 4G
```

ERROR :

```text
Network connection lost
Data session timeout
Cell handover failed
Network registration failed
SIM registration error
Severe signal degradation
Packet transmission failed
```

---

# 9. LOG VIEWER

Le Log Viewer est le cœur de l'application.

Chaque log correspond à une ligne compacte.

Exemple :

```text
14:32:45.213 | DEVICE-042 | ORANGE | 5G | -92 dBm  | INFO    | Network connection stable
14:32:47.501 | DEVICE-042 | ORANGE | 5G | -95 dBm  | INFO    | Signal strength updated
14:32:50.304 | DEVICE-042 | ORANGE | 5G | -104 dBm | WARNING | Weak signal detected
14:32:55.114 | DEVICE-042 | ORANGE | 4G | -116 dBm | ERROR   | Network connection lost
```

Colonnes principales :

```text
timestamp
device
operator
network
RSRP
severity
message
```

Les colonnes doivent être parfaitement alignées.

Utiliser une police monospace.

La hauteur d'une ligne doit rester faible afin de pouvoir afficher beaucoup de logs.

---

# 10. DÉTAIL D'UN LOG

Cliquer sur une ligne doit permettre de consulter davantage d'informations.

Afficher par exemple :

* Device ID
* Timestamp complet
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

Prévoir également une représentation lisible du contexte :

```json
{
  "networkType": "5G",
  "cellId": "20801-394829",
  "frequency": 3500,
  "latency": 32,
  "packetLoss": 0.2
}
```

Le détail peut être :

* expandable inline ;
* ou affiché dans un petit panneau contextuel.

Choisis la solution la plus cohérente avec le Log Viewer.

---

# 11. VIRTUALISATION

Cette fonctionnalité est obligatoire.

L'application doit rester fluide avec :

```text
20 000 logs
```

Ne jamais rendre directement les 20 000 lignes dans le DOM.

Utiliser :

```text
@tanstack/react-virtual
```

ou une solution légère équivalente si réellement plus appropriée.

Le scroll doit être fluide.

---

# 12. ORDRE TEMPOREL

Afficher par défaut :

```text
plus ancien
↓
↓
↓
plus récent
```

Donc :

```text
scroll vers le haut = remonter dans le passé
scroll vers le bas = avancer dans le temps
```

L'utilisateur doit pouvoir parcourir toute la timeline de manière naturelle.

---

# 13. OPERATOR STRIP

Ajouter immédiatement à gauche du Log Viewer une bande verticale très fine.

Cette bande représente l'opérateur de chaque ligne.

Couleurs :

```text
Orange            → orange
SFR               → rouge
Free              → violet
Bouygues Telecom  → bleu
```

IMPORTANT :

Ne colore PAS toute la ligne du log en fonction de l'opérateur.

Seul le segment de l'Operator Strip correspondant à la ligne doit être coloré.

Exemple :

```text
│ ORANGE │ log
│ ORANGE │ log
│ ORANGE │ log
│ RED    │ log
│ RED    │ log
│ PURPLE │ log
│ BLUE   │ log
│ BLUE   │ log
```

La bande doit être parfaitement synchronisée avec les lignes actuellement visibles.

Elle ne doit pas être une décoration indépendante.

---

# 14. CHANGEMENTS D'OPÉRATEUR

Les mocks doivent contenir des périodes cohérentes d'utilisation d'un opérateur.

Évite :

```text
Orange
Free
SFR
Orange
Bouygues
Free
Orange
```

à chaque ligne.

Préfère des séquences :

```text
Orange
Orange
Orange
Orange
Orange
SFR
SFR
SFR
SFR
Bouygues
Bouygues
...
```

Lors d'un changement, un log peut être généré :

```text
Operator changed from Orange to SFR
```

Cela rend l'Operator Strip beaucoup plus intéressant visuellement.

---

# 15. MINIMAP

À droite du Log Viewer, créer une minimap verticale inspirée du principe de l'overview ruler de VS Code.

Elle doit représenter la répartition des événements sur l'ensemble des logs actuellement affichables.

Code couleur :

```text
ERROR   → rouge
WARNING → ambre / jaune
INFO    → bleu
```

Les erreurs doivent être visuellement plus importantes.

La minimap doit permettre de comprendre immédiatement :

* où se concentrent les erreurs ;
* où apparaissent les warnings ;
* quelles zones sont principalement composées d'informations normales.

---

# 16. AGRÉGATION MINIMAP

Il peut y avoir :

```text
20 000 logs
```

pour seulement :

```text
700 pixels
```

de hauteur disponible.

Il faut donc agréger les logs.

Créer une fonction indépendante du rendu React :

```js
createMinimapBuckets(logs, bucketCount)
```

Un bucket pourrait ressembler à :

```js
{
  startIndex: 1200,
  endIndex: 1229,

  info: 23,
  warning: 5,
  error: 2,

  dominantSeverity: "ERROR",

  startTimestamp: "...",
  endTimestamp: "..."
}
```

Priorité :

```text
ERROR > WARNING > INFO
```

La couleur et éventuellement l'intensité doivent représenter le contenu du bucket.

---

# 17. INTERACTIONS MINIMAP

La minimap doit être réellement interactive.

## Hover

Afficher un tooltip :

```text
14:30:00 → 14:32:00

32 logs
25 INFO
5 WARNING
2 ERROR
```

## Click

Cliquer sur une zone doit faire défiler le Log Viewer jusqu'au groupe de logs correspondant.

## Viewport

Afficher clairement la partie du dataset actuellement visible.

Exemple conceptuel :

```text
│ blue
│ blue
│ yellow
├══════════┤
║ VIEWPORT ║
├══════════┤
│ red
│ red
│ blue
```

Le viewport doit se déplacer en temps réel avec le scroll.

## Bonus

Si cela reste propre et robuste, permettre de dragger le viewport dans la minimap.

---

# 18. SCROLL PROGRAMMATIQUE

Centraliser la navigation vers un log avec une fonction du type :

```js
scrollToLog(logId)
```

Cette fonction sera utilisée par :

* les bookmarks ;
* la minimap ;
* éventuellement d'autres interactions.

Avec `@tanstack/react-virtual`, utiliser l'API du virtualizer.

Éviter autant que possible :

```js
document.querySelector(...)
```

pour piloter la navigation.

---

# 19. LOG CIBLÉ

Lorsqu'un log est atteint via un bookmark ou une navigation programmatique, utiliser un état :

```js
focusedLogId
```

Afficher pendant environ une seconde :

* un outline subtil ;
* ou un léger flash de background.

Le but est de montrer immédiatement à l'utilisateur quelle ligne vient d'être ciblée.

---

# 20. HIGHLIGHT MANUEL

L'utilisateur doit pouvoir surligner manuellement des logs.

Prévoir une action :

```text
Highlight
```

et quelques couleurs :

* jaune ;
* vert ;
* bleu ;
* violet ;
* rose ;
* orange.

Le highlight doit apparaître subtilement derrière la ligne.

Il doit être suffisamment transparent pour ne pas masquer :

* severity ;
* operator ;
* sélection ;
* contenu.

Prévoir également :

```text
Remove highlight
```

---

# 21. BOOKMARKS

L'utilisateur doit pouvoir bookmarker n'importe quel log.

Exemple d'icône :

```text
Bookmark
BookmarkCheck
```

avec `lucide-react`.

Un bookmark pourrait avoir cette structure :

```js
{
  logId: "log_1234",
  createdAt: "2026-09-12T14:40:00Z",
  note: ""
}
```

---

# 22. NOTES

Chaque bookmark peut avoir une note personnelle.

Exemple :

```text
Perte réseau observée pendant le test terrain.
```

Permettre :

* Add note
* Edit note
* Delete note

Une note appartient au bookmark correspondant.

---

# 23. PANNEAU BOOKMARKS & NOTES

Créer à droite de la minimap un panneau latéral.

Il doit pouvoir être :

```text
ouvert
fermé
```

Lorsqu'il est fermé, il doit libérer pratiquement toute sa largeur.

Exemple :

```text
BOOKMARKS

★ 14:32:55
DEVICE-042
Network connection lost

Perte réseau observée pendant le test.

────────────────────

★ 14:37:22
DEVICE-012
High network latency

À comparer avec les autres événements.
```

Afficher éventuellement :

```text
8 bookmarks
```

dans la toolbar.

---

# 24. NAVIGATION BOOKMARK → LOG

Cliquer sur un bookmark doit :

1. retrouver le log ;
2. calculer son index ;
3. utiliser le virtualizer pour naviguer vers lui ;
4. si possible le centrer dans le Log Viewer ;
5. appliquer temporairement l'effet `focusedLogId`.

Cette fonctionnalité doit réellement fonctionner même avec plusieurs milliers de logs.

---

# 25. LOCAL STORAGE

Tout ce qui concerne les préférences de l'utilisateur doit être stocké côté navigateur avec :

```js
localStorage
```

Conserver notamment :

* bookmarks ;
* notes ;
* highlights ;
* thème ;
* éventuellement état du panneau bookmarks.

Créer un hook ou utilitaire propre :

```text
useLocalStorage.js
```

Ne pas appeler directement `localStorage` dans dix composants différents.

Aucun backend n'est nécessaire pour ces données.

---

# 26. TOOLBAR

Créer une toolbar compacte.

Exemple :

```text
Network Logs | 12,482 logs | Search... | Operator ▾ | Severity ▾ | Device ▾ | RSRP ▾ | Bookmarks 8 | Theme
```

Elle doit contenir :

* nom de l'application ;
* nombre de logs ;
* recherche ;
* filtres ;
* compteur bookmarks ;
* bouton ouverture du panneau bookmarks ;
* changement de thème.

---

# 27. STATISTIQUES COMPACTES

Afficher dans la toolbar ou à proximité :

```text
12,482 logs
407 errors
1,782 warnings
10,293 info
```

Pas de grosses cards KPI.

Je veux une présentation compacte.

---

# 28. RECHERCHE

Ajouter une recherche textuelle.

Elle doit pouvoir trouver des correspondances dans :

* message ;
* device ID ;
* operator ;
* cell ID ;
* contexte pertinent.

Éviter des recalculs inutiles.

Utiliser `useMemo` lorsque pertinent.

---

# 29. FILTRE OPÉRATEUR

Permettre de sélectionner :

```text
☑ Orange
☑ SFR
☑ Bouygues
☑ Free
```

Plusieurs opérateurs doivent pouvoir être actifs simultanément.

---

# 30. FILTRE SEVERITY

Permettre :

```text
☑ INFO
☑ WARNING
☑ ERROR
```

Afficher éventuellement le nombre d'éléments correspondant à chaque severity.

---

# 31. FILTRE DEVICE

Ajouter un filtre :

```text
All devices
DEVICE-001
DEVICE-002
DEVICE-003
...
```

---

# 32. FILTRE RSRP

Permettre de filtrer par niveau :

```text
All
Excellent
Very Good
Good
Poor
Critical
```

ou utiliser un range si cela donne une meilleure UX.

---

# 33. SYNCHRONISATION DES FILTRES

Le dataset filtré doit alimenter :

```text
Log Viewer
Operator Strip
Minimap
Statistiques
```

Tous ces composants doivent toujours représenter exactement le même dataset.

Si un bookmark pointe vers un log actuellement masqué par les filtres, afficher quelque chose comme :

```text
This log is hidden by the current filters.
```

avec une action :

```text
Clear filters and show log
```

---

# 34. SEVERITY BADGES

Afficher les severities discrètement :

```text
INFO
WARN
ERROR
```

Couleurs :

```text
INFO    → bleu
WARNING → ambre
ERROR   → rouge
```

Ne colore pas toute la ligne.

---

# 35. RSRP INDICATOR

Toujours afficher la valeur :

```text
-87 dBm
-104 dBm
-118 dBm
```

Un petit indicateur de qualité peut être ajouté s'il reste discret.

Exemple :

```text
▮▮▮▮ -78
▮▮▮  -91
▮▮   -104
▮    -116
```

Mais ne surcharge pas l'interface.

---

# 36. TOOLTIPS

Ajouter quelques tooltips utiles.

Par exemple pour le RSRP :

```text
-112 dBm
Critical signal
```

Pour certains éléments :

```text
ERROR
Critical network event
```

Ne mets pas des tooltips partout.

---

# 37. PERFORMANCE

L'application doit rester fluide avec plus de 20 000 logs.

Faire attention à :

* virtualisation ;
* rerenders ;
* filtres ;
* scroll events ;
* minimap ;
* bookmarks ;
* highlights ;
* tooltips.

Utiliser lorsque pertinent :

```js
useMemo
useCallback
React.memo
```

Ne pas faire de micro-optimisation inutile.

---

# 38. SYNCHRONISATION GLOBALE

Les éléments suivants doivent rester synchronisés :

```text
Log Viewer
Operator Strip
Minimap
Minimap viewport
Bookmarks navigation
Focused log
Selected log
```

Le Log Viewer / virtualizer doit être la référence principale concernant la position de scroll.

---

# 39. ARCHITECTURE

Organiser proprement le projet.

Exemple :

```text
src/
│
├── components/
│   ├── layout/
│   │   ├── AppLayout.jsx
│   │   └── Header.jsx
│   │
│   ├── logs/
│   │   ├── LogViewer.jsx
│   │   ├── LogRow.jsx
│   │   ├── LogDetails.jsx
│   │   ├── OperatorStrip.jsx
│   │   ├── SeverityBadge.jsx
│   │   └── RsrpIndicator.jsx
│   │
│   ├── minimap/
│   │   ├── LogMinimap.jsx
│   │   └── MinimapTooltip.jsx
│   │
│   ├── bookmarks/
│   │   ├── BookmarkPanel.jsx
│   │   ├── BookmarkItem.jsx
│   │   └── BookmarkNoteEditor.jsx
│   │
│   ├── filters/
│   │   ├── LogToolbar.jsx
│   │   ├── SearchInput.jsx
│   │   ├── OperatorFilter.jsx
│   │   ├── SeverityFilter.jsx
│   │   ├── DeviceFilter.jsx
│   │   └── RsrpFilter.jsx
│   │
│   └── ui/
│       ├── Tooltip.jsx
│       ├── Dropdown.jsx
│       └── IconButton.jsx
│
├── hooks/
│   ├── useBookmarks.js
│   ├── useHighlights.js
│   ├── useLogFilters.js
│   └── useLocalStorage.js
│
├── mocks/
│   ├── generateLogs.js
│   └── mockConfig.js
│
├── utils/
│   ├── rsrp.js
│   ├── logColors.js
│   ├── minimap.js
│   ├── formatDate.js
│   └── logSearch.js
│
├── constants/
│   └── logs.js
│
├── App.jsx
├── main.jsx
└── index.css
```

Cette architecture est indicative.

Tu peux l'améliorer si tu trouves quelque chose de plus cohérent.

IMPORTANT :

Ne mets pas toute l'application dans `App.jsx`.

---

# 40. GESTION DE L'ÉTAT

Séparer clairement :

## Dataset

```text
logs
filteredLogs
```

## État UI

```text
selectedLog
focusedLogId
bookmarkPanelOpen
expandedLog
theme
filters
```

## Données utilisateur locales

```text
bookmarks
notes
highlights
```

Tu peux utiliser :

* React Context ;
* hooks personnalisés ;
* ou un petit store si cela simplifie réellement le projet.

Ne mets pas Redux uniquement pour complexifier l'application.

---

# 41. CONSTANTES

Centraliser les couleurs.

Par exemple :

```js
const OPERATOR_COLORS = {
  Orange: "...",
  SFR: "...",
  Free: "...",
  Bouygues: "..."
}
```

Même principe pour :

```js
SEVERITY_COLORS
HIGHLIGHT_COLORS
```

Ne duplique pas les valeurs dans différents composants.

---

# 42. FRONTEND UNIQUEMENT

Cette règle est importante.

Le projet doit fonctionner intégralement dans le navigateur.

Les logs sont créés par :

```js
generateLogs()
```

Ils restent en mémoire côté frontend.

Les données utilisateur sont persistées via :

```js
localStorage
```

Ne crée pas :

* serveur Node ;
* Express ;
* FastAPI ;
* endpoints ;
* fichiers backend ;
* base de données ;
* Docker backend ;
* API REST ;
* WebSocket ;
* système d'observabilité.

Tout doit fonctionner avec :

```bash
npm run dev
```

comme simple application Vite.

---

# 43. RESPONSIVE

L'application est prioritairement desktop.

Optimiser notamment :

```text
1440 × 900
1920 × 1080
2560 × 1440
```

Sur des écrans plus petits :

* le panneau bookmarks peut devenir un drawer ;
* certaines colonnes secondaires peuvent être cachées ;
* la minimap peut devenir plus étroite.

Ne sacrifie pas l'expérience desktop pour essayer d'en faire une application mobile.

---

# 44. ACCESSIBILITÉ

Prévoir :

* navigation clavier ;
* focus states ;
* `aria-label` sur les boutons avec uniquement une icône ;
* contrastes suffisants ;
* boutons réellement cliquables et accessibles.

---

# 45. ICÔNES

Utiliser :

```text
lucide-react
```

Exemples :

```text
Bookmark
BookmarkCheck
Search
Filter
PanelRight
PanelRightClose
Sun
Moon
ChevronDown
ChevronRight
X
Highlighter
StickyNote
AlertTriangle
CircleAlert
Info
```

Ne pas utiliser des emojis comme icônes d'interface finales.

---

# 46. DÉPENDANCES

Limiter les dépendances.

Principalement :

```text
react
react-dom
vite
tailwindcss
lucide-react
@tanstack/react-virtual
```

Ajouter une dépendance seulement si elle apporte une vraie valeur.

Ne pas installer Material UI, Ant Design ou une énorme bibliothèque UI simplement pour obtenir quelques boutons.

Les composants visuels doivent principalement être construits avec React + Tailwind.

---

# 47. QUALITÉ DU CODE

Je veux :

* composants lisibles ;
* responsabilités clairement séparées ;
* fonctions utilitaires indépendantes ;
* hooks personnalisés lorsque pertinent ;
* aucune duplication inutile ;
* aucun composant gigantesque ;
* commentaires uniquement lorsque le fonctionnement n'est pas évident.

Évite absolument :

```text
App.jsx avec 1000 lignes
```

---

# 48. EMPTY STATES

Gérer proprement :

```text
aucun log après filtrage
aucun résultat de recherche
aucun bookmark
```

Exemple :

```text
No logs match the current filters.
```

---

# 49. LIVE MOCK MODE — BONUS

Après avoir terminé toutes les fonctionnalités principales, tu peux ajouter un mode :

```text
Live
```

Toujours entièrement frontend.

Quand activé, générer localement un nouveau mock toutes les 1 à 3 secondes.

Si l'utilisateur est déjà en bas :

```text
auto-scroll
```

S'il a remonté les logs :

```text
ne pas modifier son scroll
```

Afficher par exemple :

```text
12 new logs
```

avec un bouton pour revenir en bas.

Cette fonctionnalité est secondaire.

Ne la réalise qu'après les fonctionnalités principales.

---

# 50. ORDRE D'IMPLÉMENTATION

Travaille dans cet ordre.

## Phase 1

* inspecter le projet existant ;
* vérifier React/Vite/Tailwind ;
* conserver la configuration existante si elle fonctionne ;
* construire le layout.

## Phase 2

* créer le modèle de log ;
* générer 10 000 à 20 000 mocks réalistes ;
* créer les fonctions RSRP ;
* créer les constantes.

## Phase 3

* LogViewer ;
* LogRow ;
* virtualisation ;
* détail d'un log.

## Phase 4

* Operator Strip ;
* synchronisation avec les lignes.

## Phase 5

* minimap ;
* buckets ;
* tooltip ;
* navigation par clic ;
* viewport synchronisé.

## Phase 6

* recherche ;
* filtres operator ;
* severity ;
* device ;
* RSRP.

## Phase 7

* bookmarks ;
* notes ;
* panneau latéral ;
* navigation bookmark → log.

## Phase 8

* highlights ;
* sélection des couleurs ;
* persistance localStorage.

## Phase 9

* dark mode ;
* light mode ;
* polish UI ;
* responsive desktop ;
* animations subtiles.

## Phase 10

* tests manuels ;
* performances ;
* edge cases ;
* build.

---

# 51. CRITÈRES DE VALIDATION

Avant de considérer la tâche terminée, vérifie tout ceci.

## Logs

* 10 000+ logs ;
* timestamps cohérents ;
* données RSRP réalistes ;
* opérateurs répartis par périodes ;
* changements d'opérateur ;
* INFO / WARNING / ERROR cohérents.

## Log Viewer

* virtualisé ;
* très fluide ;
* colonnes alignées ;
* navigation précise.

## Operator Strip

* chaque ligne correspond à la bonne couleur ;
* alignement parfait ;
* scroll synchronisé.

## Minimap

* représente le dataset filtré ;
* ERROR rouge ;
* WARNING ambre ;
* INFO bleu ;
* agrégation fonctionnelle ;
* tooltip ;
* clic fonctionnel ;
* viewport synchronisé.

## Bookmarks

* ajout ;
* suppression ;
* notes ;
* édition ;
* navigation vers le log ;
* persistance après refresh.

## Highlights

* ajout ;
* choix de couleur ;
* suppression ;
* persistance après refresh.

## Filters

* operator ;
* severity ;
* device ;
* RSRP ;
* recherche.

## UI

* dark mode ;
* light mode ;
* desktop responsive ;
* panneau bookmarks collapsible ;
* aucune grosse card inutile ;
* interface dense et professionnelle.

---

# 52. TEST DU PROJET

À la fin :

1. installe les dépendances nécessaires ;
2. vérifie que le projet démarre ;
3. lance le build ;
4. corrige toutes les erreurs ;
5. corrige les warnings importants ;
6. vérifie les principales interactions.

Exécuter notamment :

```bash
npm install
npm run build
```

Ne considère pas la tâche terminée si le build échoue.

---

# 53. AUTONOMIE

Ne me demande pas de valider chaque choix technique.

Si un détail n'est pas précisé :

1. utilise ton jugement ;
2. choisis la solution la plus simple et robuste ;
3. respecte l'architecture générale ;
4. évite l'over-engineering ;
5. continue l'implémentation.

Ne t'arrête pas après avoir créé un squelette.

Ne me fournis pas uniquement un tutoriel ou quelques snippets.

Tu dois modifier directement les fichiers du projet et réaliser l'application.

---

# 54. PRIORITÉS

Si tu dois faire des compromis, respecte cet ordre :

1. fonctionnement réel ;
2. fluidité avec 20 000 logs ;
3. Log Viewer ;
4. minimap interactive ;
5. Operator Strip ;
6. bookmarks + navigation ;
7. filtres ;
8. highlights ;
9. UX ;
10. esthétique ;
11. fonctionnalités bonus.

---

# RÉSULTAT ATTENDU

Je veux obtenir une SPA complète :

```text
NETWORK LOG EXPLORER

OPERATOR STRIP | VIRTUALIZED LOG VIEWER | EVENT MINIMAP | BOOKMARKS
```

L'application doit permettre de comprendre rapidement :

```text
où sont les erreurs ?
où sont les warnings ?
quel opérateur était utilisé ?
quel terminal est concerné ?
quelle était la valeur RSRP ?
quand la qualité réseau s'est-elle dégradée ?
```

Les éléments distinctifs principaux doivent être :

### 1. Log Viewer

Dense, rapide, virtualisé.

### 2. Operator Strip

```text
Orange / SFR / Free / Bouygues
```

avec des couleurs alignées précisément sur les lignes.

### 3. Minimap

```text
INFO / WARNING / ERROR
```

représentant visuellement la totalité des logs filtrés et permettant de naviguer dedans.

### 4. Bookmarks / Notes / Highlights

Outils locaux permettant à l'utilisateur d'annoter son exploration.

Tout le projet doit rester **strictement frontend**.

Aucune architecture backend ou d'observabilité n'est nécessaire.

Commence maintenant par inspecter le projet existant. Conserve ce qui est déjà correctement configuré, notamment Vite, React et Tailwind s'ils fonctionnent déjà, puis implémente progressivement l'application complète.
