# Architecture du projet

## Vue d'ensemble

Cette application React affiche des logs réseau dans une interface de tableau.

Le flux principal est :

```text
generateLogs()
  -> fetchMockPage()
  -> useCursorLogs()
  -> normalizeApiLogs()
  -> LogViewer
  -> LogRow / LogDetails
```

La pagination utilise des pages de 100 logs et deux tokens indépendants :

- `previous_token` pour charger les logs précédents ;
- `next_token` pour charger les logs suivants.

Le mock local imite le contrat de l'API décrit dans `logs_example.json`.

## Fichiers racine

### `index.html`

Point d'entrée HTML de Vite. Il contient l'élément `#root` dans lequel React monte l'application et les métadonnées de la page.

### `package.json`

Déclare les scripts et dépendances du projet.

Scripts principaux :

- `npm run dev` : démarre Vite en mode développement ;
- `npm run build` : génère le build de production ;
- `npm run preview` : sert le build localement.

### `package-lock.json`

Verrouille les versions exactes des dépendances npm.

### `vite.config.js`

Configure Vite et active le plugin React.

### `tailwind.config.js`

Configuration Tailwind CSS conservée dans le projet. Les styles actuels sont principalement écrits dans `src/index.css`.

### `postcss.config.js`

Configure PostCSS, utilisé par la chaîne CSS de Vite/Tailwind.

### `logs_example.json`

Documente le format attendu d'une réponse API :

```js
{
  logs: [
    {
      ctx: { operator: 'Orange' },
      date: '<DATE>',
      tag: 'radio_event',
      level: 'D',
      text: 'rsrp=-100 dBm'
    }
  ],
  previous_token: '...',
  next_token: '...'
}
```

### `README.md`

Documentation générale du projet.

### `prompt.md`

Historique et consignes de conception utilisées pour construire l'application. Ce fichier n'est pas chargé par l'application à l'exécution.

## Entrée React

### `src/main.jsx`

Monte le composant `App` dans `#root` et charge la feuille de style globale `index.css`.

### `src/App.jsx`

Composant racine et orchestration de l'application.

Responsabilités :

- génère les données mockées avec `generateLogs()` ;
- initialise `useCursorLogs()` ;
- fournit `fetchMockPage()` comme adaptateur local de l'API ;
- connecte la recherche par date à la pagination ;
- affiche `LogToolbar` et `LogViewer` ;
- conserve le log sélectionné pour afficher ses détails.

`fetchMockPage()` simule une API avec des tokens et renvoie au maximum 100 logs par page.

## Composants

### `src/components/filters/LogToolbar.jsx`

Affiche le champ `datetime-local` permettant de rechercher une date et une heure.

Props principales :

- `minTimestamp` et `maxTimestamp` : bornes de l'input ;
- `onNavigateToDate` : callback appelé lorsque la date change.

Le composant ne contient plus de navbar, branding, compteur, filtres ou thème.

### `src/components/logs/LogViewer.jsx`

Gère la zone principale de consultation des logs.

Responsabilités :

- affiche les boutons de chargement précédent/suivant ;
- déclenche le chargement au scroll en haut ou en bas ;
- préserve la position après l'ajout de logs précédents ;
- affiche l'indicateur de position globale ;
- affiche les lignes de logs ;
- ouvre `LogDetails` lors de la sélection d'une ligne.

Le conteneur `.log-scroll` possède un scroll horizontal lorsque la largeur disponible est trop petite pour le tableau.

### `src/components/logs/LogRow.jsx`

Affiche une ligne de log et gère sa sélection au clic ou au clavier.

Colonnes affichées :

- operator strip ;
- timestamp ;
- device ;
- operator ;
- network ;
- RSRP ;
- severity ;
- text.

### `src/components/logs/LogDetails.jsx`

Affiche le détail du log sélectionné : device, date, opérateur, sévérité, RSRP, réseau, cellule et métriques réseau.

### `src/components/logs/OperatorStrip.jsx`

Affiche la bande colorée associée à l'opérateur. Les couleurs viennent de `OPERATOR_COLORS`.

### `src/components/logs/RsrpIndicator.jsx`

Affiche la valeur RSRP, sa qualité et les barres de signal.

Fonctions utilisées :

- `getRsrpQuality()` ;
- `getRsrpBars()`.

### `src/components/logs/SeverityBadge.jsx`

Affiche le niveau du log sous forme de badge visuel : `INFO`, `WARNING` ou `ERROR`.

### `src/components/ui/IconButton.jsx`

Bouton générique avec `aria-label` et tooltip. Il est utilisé notamment pour fermer le panneau de détails.

## Hooks

### `src/hooks/useCursorLogs.js`

Abstraction principale de pagination.

Fonction exportée : `useCursorLogs({ fetchPage, mapLogs })`.

Responsabilités :

- demande des pages de 100 logs ;
- transmet un token opaque à `fetchPage()` ;
- conserve `previousToken` et `nextToken` ;
- ajoute une page au début ou à la fin du tableau ;
- conserve `windowStart` et `windowEnd` pour l'indicateur de pagination ;
- expose `loadPrevious()`, `loadNext()` et `replaceLogs()` ;
- conserve la dernière valeur RSRP entre les pages.

Pour brancher une vraie API, il suffit de remplacer `fetchMockPage()` par une fonction qui accepte `{ token, direction, limit }` et renvoie les clés API correspondantes.

## Données et normalisation

### `src/mocks/generateLogs.js`

Génère 2 000 logs bruts déterministes.

Les logs suivent le format API :

- `ctx.operator` ;
- `date` ;
- `tag` ;
- `level` ;
- `text`.

Les tags simulés comprennent notamment `radio_event`, `signal_measurement`, `registration`, `connection`, `handover` et `heartbeat`.

Les logs de mesure peuvent contenir un RSRP explicite. Les autres événements ne le répètent pas nécessairement.

### `src/mocks/mockConfig.js`

Contient les paramètres du générateur : nombre de devices, messages d'information, avertissement et erreur, ainsi que le profil de dégradation RSRP.

### `src/utils/logApi.js`

Transforme les logs bruts API en modèle utilisé par l'interface.

Fonctions :

- `normalizeApiLogs(logs, initialRsrp)` : normalise une page en conservant le dernier RSRP connu ;
- `normalizeApiLog(log, index, previousRsrp)` : transforme un log brut individuel.

Le niveau API est converti ainsi :

- `D` ou `I` -> `INFO` ;
- `W` -> `WARNING` ;
- `E` -> `ERROR`.

### `src/constants/logs.js`

Contient les constantes encore utilisées :

- liste des opérateurs ;
- couleurs des opérateurs ;
- nombre total de logs mockés ;
- hauteur de référence d'une ligne pour le seuil de scroll.

### `src/utils/rsrp.js`

Calcule la qualité RSRP et le nombre de barres de signal à afficher.

Fonctions :

- `getRsrpQuality(rsrp)` ;
- `getRsrpBars(rsrp)`.

## Navigation par date

### `src/utils/logDateNavigation.js`

Contient la logique de recherche du log le plus proche d'une date.

Fonctions :

- `parseUtcDateTimeLocal(value)` : convertit la valeur de l'input en timestamp UTC ;
- `findClosestLogIndex(logs, targetTimestamp)` : recherche binaire du log le plus proche.

Avec une vraie API, cette recherche devrait idéalement être déléguée au serveur via un paramètre de date, puis l'API devrait renvoyer une page avec ses deux tokens.

### `src/utils/formatDate.js`

Formate les dates affichées dans le tableau et les détails.

Fonctions :

- `formatLogTime(timestamp)` : heure avec millisecondes ;
- `formatShortTime(timestamp)` : heure courte ;
- `formatFullDate(timestamp)` : date complète en UTC.

## Styles

### `src/index.css`

Feuille de style globale de l'application.

Elle contient :

- variables de couleur et surfaces ;
- layout du dashboard ;
- search input flottant ;
- timeline et contrôles de pagination ;
- tableau de logs et operator strip ;
- indicateurs RSRP et badges de sévérité ;
- panneau de détails ;
- scrollbar horizontale et verticale ;
- règles responsive.

Le tableau conserve une largeur minimale afin que les colonnes ne se superposent pas. Sur petit écran, le conteneur `.log-scroll` devient horizontalement défilable.

## Validation

### `scripts/smoke-browser.mjs`

Script de smoke test via Chrome DevTools Protocol.

Il vérifie notamment :

- le chargement initial de 100 logs ;
- le chargement d'une page précédente au scroll haut ;
- le chargement d'une page suivante au scroll bas ;
- la navigation par date ;
- l'ouverture des détails d'un log.

## Fichiers générés ou externes

- `dist/` : build de production généré par Vite ;
- `node_modules/` : dépendances installées ;
- `artifacts/` : sorties éventuelles des smoke tests.

Ces dossiers ne contiennent pas la logique applicative principale.
