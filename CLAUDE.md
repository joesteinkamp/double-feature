# CLAUDE.md — Double Feature

## Project Overview

Double Feature is a React web application that helps users find movies playing at nearby theaters and matches them into "double feature" pairs based on showtime timing and configurable break windows. It uses geolocation to identify the user's location and fetches real-time showtime data from external APIs.

## Tech Stack

- **Framework**: React 16.8.2 (class-based components, Create React App)
- **Build tool**: react-scripts 2.1.8
- **Styling**: Plain CSS (dark theme, Google Fonts — Lato, Material Icons)
- **External APIs**: GraceNote TMS (showtimes), TMDB (posters), OMDB (poster fallback), Mapbox (geocoding/maps)
- **Node.js**: Requires `--openssl-legacy-provider` flag (set in package.json scripts)

## Directory Structure

```
double-feature/
├── CLAUDE.md
├── README.md
├── Double Feature.sketch          # Design file
└── double-feature-app/
    ├── package.json
    ├── public/
    │   ├── index.html             # SPA entry point
    │   └── manifest.json          # PWA manifest
    └── src/
        ├── App.js                 # Main application (~770 lines, all components)
        ├── App.css                # All styles
        ├── App.test.js            # Basic render test
        ├── index.js               # React DOM entry
        └── index.css              # Base styles
```

## Development Commands

All commands run from `double-feature-app/`:

```bash
cd double-feature-app
npm install          # Install dependencies
npm start            # Start dev server (localhost:3000)
npm test             # Run tests (Jest via react-scripts)
npm run build        # Production build
```

## Environment Setup

1. Install dependencies: `cd double-feature-app && npm install`
2. Create `double-feature-app/src/apiKeys.json` with the following structure:

```json
{
  "onConnectKey": "<GraceNote TMS API key>",
  "theMovieDBKey": "<TMDB API key>",
  "omdbKey": "<OMDB API key>",
  "mapBoxToken": "<Mapbox access token>"
}
```

This file is gitignored (`apiKeys.*` pattern).

## Architecture & Key Components

All components live in `App.js` as class-based React components:

| Component | Purpose |
|---|---|
| `App` | Root container, holds all application state |
| `LocationForm` | Initial form: zip code, date, min/max break times |
| `FilterForm` | Post-load filters for theaters and movies |
| `TheaterList` / `TheaterListItem` | Theater selection checkboxes |
| `MoviesList` / `MovieListItem` | Movie selection with poster images |
| `MatchList` / `MatchCard` | Displays matched double-feature pairs |

**State management**: All state lives in `App` and is passed down via props (no Redux or Context API).

**Data flow**: User submits location → fetch showtimes from GraceNote → fetch posters from TMDB/OMDB → compute matching pairs based on timing constraints → display results.

## Key Utility Functions (in App.js)

- `convertRunTimeToMins()` — Parse runtime string to minutes
- `convertTimeToMinutes()` — Convert datetime to minutes-of-day
- `convertTimeToHuman()` — Format time as 12-hour display
- `getPoster()` — Fetch poster from TMDB, fall back to OMDB
- `geocodeLocation()` / `getBoundingBoxFromZip()` — Mapbox geocoding helpers

## Code Conventions

- **Components**: PascalCase (`LocationForm`, `MatchCard`)
- **Functions/variables**: camelCase (`handleClickGrabData`, `convertTimeToMinutes`)
- **Event handlers**: `handle` + action pattern (`handleChangeDate`, `handleClickGrabData`)
- **Component suffixes**: `Form`, `List`, `ListItem`, `Card`
- **Async**: Native `fetch()` with Promises
- **No TypeScript** — plain JavaScript throughout

## Styling Conventions

- Dark theme: background `#282c2f`, accent blue `#4A90E2`
- Google Fonts: Lato family via CDN import
- Material Icons via Google Fonts CDN
- Responsive design with max-width containers
- All styles in `App.css` — no CSS modules or CSS-in-JS

## Testing

- Minimal test coverage: single smoke test in `App.test.js`
- Test runner: Jest via `react-scripts test`

## Known Constraints

- **Monolithic App.js**: All components and logic in one ~770-line file
- **Class components**: Uses older React patterns (no hooks)
- **Legacy OpenSSL**: Node 17+ requires `--openssl-legacy-provider` flag (already configured in scripts)
- **No CI/CD**: No GitHub Actions or other pipeline configured
- **No error boundaries or comprehensive error handling** on API calls
