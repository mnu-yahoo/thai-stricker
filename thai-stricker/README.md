# ThaiStricker

Application personnelle d'entraînement Muay Thai, construite avec React,
TypeScript et Vite. Elle fonctionne comme une PWA mobile et conserve les
données uniquement dans le navigateur.

## Développement

```powershell
npm install
npm run dev
```

Contrôles de qualité :

```powershell
npm run typecheck
npm test
npm run build
```

## Déploiement Vercel

Importer le dépôt dans Vercel. Les réglages sont déjà déclarés dans
`vercel.json` : commande `npm run build`, sortie `dist` et réécriture des routes
vers `index.html`.

## Données

Les données sont enregistrées sous `thai-stricker:data:v1` dans le stockage du
navigateur. Utiliser **Réglages > Exporter une sauvegarde** avant de vider les
données du navigateur ou de changer de téléphone.

La procédure pour transférer l'ancienne base Android est documentée dans
[`docs/android-data-migration.md`](docs/android-data-migration.md).
