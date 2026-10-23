# ThaiStricker Web

- React 19, TypeScript strict and Vite.
- Mobile-first PWA deployed on Vercel.
- Browser-local JSON persistence only; no backend or authentication.
- Preserve the versioned backup format and validate every imported file before replacing local data.

## Knowledge Base Sources

- `knowledge base/` is a local-only knowledge source directory and must never be committed or sent to Git.
- PDF files stored in `knowledge base/` may be used to enrich the Muay Thai knowledge base and coaching sheets.
- The `urls` file in `knowledge base/` may contain Evolve MMA Muay Thai blog URLs. Only pages from that Evolve MMA site and only content remaining within the Muay Thai context may be used.
- Keep source attribution and validate extracted information before adding it to application data or coach knowledge.

## AI Coach Knowledge and Selection

- Validated technique fiches are the source of truth for coaching content; the local model must not invent or enrich advice.
- The local model is a constrained selector. It receives numbered fiche candidates and must return only one candidate index.
- The application must validate the index and display the exact fiche entry. Invalid output must use the local fallback and must never be displayed as free-form model text.
- Each guided action returns exactly one entry: one technique tip, one common mistake, one focus point, or one explanation.
- Fiche entries must be standalone, concise, specific to their category, and written in English.
- Do not fine-tune or retrain the model for the current version; improve the validated fiches and their source attribution first.
