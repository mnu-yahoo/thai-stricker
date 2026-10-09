# Migration des données Android

La dernière version Expo est conservée dans le tag Git `android-final-pre-web`.
Avant de désinstaller l’application Android, extraire une copie de sa base
`thai-stricker.db`, puis la convertir vers le format web partagé.

Pour une installation Android de développement :

```powershell
adb exec-out run-as com.personal.thaistricker cat databases/thai-stricker.db > thai-stricker.db
npm run migrate:android -- thai-stricker.db thai-stricker-android-export.json
```

Dans la PWA, ouvrir **Réglages > Importer une sauvegarde** et sélectionner le
fichier généré. L’import valide l’intégralité du document et télécharge une
sauvegarde des données web courantes avant de les remplacer.

`run-as` fonctionne uniquement lorsque l’installation Android autorise le
débogage. Si l’application installée ne le permet pas, conserver l’application
et sa base jusqu’à ce qu’une extraction soit possible depuis une version de
développement issue du tag.
