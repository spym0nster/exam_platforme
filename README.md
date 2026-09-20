# ESEN Digital Assessment Platform

Plateforme numérique unifiée d'évaluation, permettant aux étudiants ayant des difficultés d'écriture ou de dessin manuscrit de composer les mêmes examens que leurs camarades, avec les mêmes exigences académiques, via des outils numériques intégrés (texte, équations, tableaux, graphes, diagrammes, circuits logiques, organigrammes).

Voir [docs/SPECIFICATION.md](docs/SPECIFICATION.md) pour la spécification technique et fonctionnelle complète, l'architecture (Assessment Engine + Subject Workspaces), le modèle de données et la roadmap.

**Périmètre du MVP actuel :** authentification, dashboard, mode Examen, et le workspace **Analyse** (texte + équations + tableaux + graphes) — stack Next.js + TypeScript + PostgreSQL.

## Démarrer sans rien installer — GitHub Codespaces

Le plus simple si tu ne veux pas installer Node.js/PostgreSQL sur ta machine : tout tourne dans ton navigateur, hébergé par GitHub.

1. Ouvre le dépôt sur GitHub et bascule sur la branche `claude/esen-digital-assessment-7tsfqj`.
2. Clique sur le bouton vert **Code** → onglet **Codespaces** → **Create codespace on claude/esen-digital-assessment-7tsfqj**.
3. Patiente pendant la préparation (installation de Node.js, PostgreSQL, `npm install`, création de la base et des données de démo — tout est automatique via `.devcontainer/`).
4. Une fois prêt, l'application démarre automatiquement (`npm run dev`) et une notification "Ouvrir dans le navigateur" apparaît pour le port **3000**. Si elle n'apparaît pas : onglet **Ports** en bas → clic sur le globe 🌐 à côté du port 3000.

Comptes de démonstration (mot de passe : `password123`) :

- Étudiant — `sami.trabelsi@esen.tn`
- Enseignant — `imene.gharbi@esen.tn`

Nécessite juste un compte GitHub (le tien) — inclus gratuitement (heures gratuites mensuelles sur le plan Free).

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
