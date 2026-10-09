# Platform Architecture

- React 19 with semantic HTML, TypeScript strict and Vite.
- Mobile-first layout targeting a personal phone browser.
- Installable Progressive Web App with an offline application shell.
- Browser-local JSON data; no backend, authentication or cloud sync.
- React Router supplies stable URLs and browser back navigation.
- Vercel Hobby hosts the production build from `dist`.

## Development and deployment

```powershell
npm run dev
npm run typecheck
npm test
npm run build
```

Vercel builds with `npm run build`. `vercel.json` rewrites application routes to
`index.html`. The service worker caches only code and static assets; user data
remains in local browser storage.

The last Expo Android code is retained in the Git tag
`android-final-pre-web` for recovery and one-time data export work.
