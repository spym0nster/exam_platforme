# ESEN Digital Assessment Platform

Plateforme numérique unifiée d'évaluation, permettant aux étudiants ayant des difficultés d'écriture ou de dessin manuscrit de composer les mêmes examens que leurs camarades, avec les mêmes exigences académiques, via des outils numériques intégrés (texte, équations, tableaux, graphes, diagrammes, circuits logiques, organigrammes).

Voir [docs/SPECIFICATION.md](docs/SPECIFICATION.md) pour la spécification technique et fonctionnelle complète, l'architecture (Assessment Engine + Subject Workspaces), le modèle de données et la roadmap.

**Périmètre du MVP actuel :** authentification, dashboard, mode Examen, et le workspace **Analyse** (texte + équations + tableaux + graphes) — stack Next.js + TypeScript + PostgreSQL.

## Démarrer en local

Prérequis : Node.js 20+, PostgreSQL en cours d'exécution.

```bash
npm install

cp .env.example .env
# renseigner DATABASE_URL et SESSION_SECRET dans .env

npm run db:push   # applique le schéma Prisma à la base
npm run db:seed   # crée les matières, un examen de démo et deux comptes

npm run dev       # http://localhost:3000
```

Comptes de démonstration (mot de passe : `password123`) :

- Étudiant — `sami.trabelsi@esen.tn`
- Enseignant — `imene.gharbi@esen.tn`

## Structure du projet

- `app/` — routes Next.js (App Router) : `login`, `dashboard` (étudiant), `teacher` (enseignant), `exam/[examId]` (mode Examen), routes API sous `app/api`.
- `components/` — `ExamRunner` (orchestrateur du mode Examen), `blocks/` (Texte, Équation, Tableau, Graphe, Formes — le "Diagram/Math/Text Engine" de la spécification), `NewExamForm`, `LoginForm`.
- `lib/` — `auth.ts`/`session-token.ts` (session par cookie signé), `prisma.ts`, `blocks.ts` (types des blocs de réponse).
- `prisma/schema.prisma` — modèle de données (User, Subject, Exam, Question, Submission, Answer).
- `prisma/seed.ts` — jeu de données de démonstration.
