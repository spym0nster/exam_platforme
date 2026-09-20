# ESEN Digital Assessment Platform — Spécification technique & fonctionnelle

## 1. Contexte et problème

Un étudiant de l'ESEN maîtrise parfaitement le contenu académique de ses cours, mais rencontre une difficulté importante et durable dans la **production manuscrite** de ses réponses : écriture peu lisible, difficulté à dessiner des graphes, schémas, diagrammes, circuits logiques, organigrammes ou tableaux.

Le problème n'est **pas** la compréhension ou la capacité académique — c'est la production physique d'une réponse manuscrite lisible.

L'objectif n'est pas de simplifier les examens de cet étudiant, ni de retirer des exercices. Il doit suivre les **mêmes cours, mêmes exercices, mêmes examens, même niveau d'exigence** que ses camarades. Ce qui doit changer, c'est uniquement la **méthode de production de la réponse**.

Utiliser plusieurs logiciels séparés pendant un examen (Word → Excel → GeoGebra → Draw.io → Word) créerait une charge cognitive et technique inutile. La solution retenue est donc une **plateforme unique d'évaluation numérique**, adaptée par matière, où l'étudiant reste dans une seule interface du début à la fin de l'examen.

## 2. Objectifs et principes directeurs

- **Même exercice, même exigence, méthode de saisie différente.** Aucune génération automatique de réponse, aucun solveur, aucune IA répondant à la place de l'étudiant en mode examen.
- **Une seule interface** par examen : pas de bascule entre applications externes.
- **Adaptation par matière** : chaque matière n'expose que les outils dont elle a besoin (pas de surcharge d'interface).
- **Accessibilité générale** : bien que motivée par un cas précis, la plateforme doit pouvoir servir à d'autres étudiants ayant des difficultés d'écriture, de dessin ou de motricité fine.
- **Intégrité des examens** : timer, sauvegarde automatique, mode plein écran, contrôle des outils autorisés par question (IA/calculatrice/Internet activables ou non par l'enseignant).

## 3. Utilisateurs et rôles

| Rôle | Capacités principales |
|---|---|
| **Étudiant** | Se connecter, voir son tableau de bord de matières/examens, composer une copie dans le mode Examen, soumettre. |
| **Enseignant** | Créer une matière/un examen, ajouter des questions, définir les outils autorisés par question, consulter/exporter les copies soumises. |
| **Admin (implicite, hors MVP)** | Gestion des comptes, des matières, des templates d'outils. |

## 4. Architecture générale

Principe : ne pas construire une application différente par matière, mais un **moteur d'évaluation commun (Assessment Engine)** duquel chaque matière n'active qu'un sous-ensemble d'outils.

```
                 ESEN ASSESSMENT ENGINE
                         │
       ┌─────────────────┼─────────────────┐
       │                 │                 │
   Text Engine       Math Engine      Diagram Engine
       │                 │                 │
       │                 ├── Équations     ├── Formes
       │                 ├── Fractions     ├── Flèches
       │                 ├── Matrices      ├── Blocs
       │                 └── Graphes       └── Connecteurs
       │
       └──────────────────────────────────────
                         │
                  Subject Workspaces
                         │
       ┌──────────┬──────┼──────┬───────────┐
       ↓          ↓      ↓      ↓           ↓
    Analyse   Statistiques ASDI  Logique  Architecture
```

Chaque **Subject Workspace** est une configuration déclarative (liste d'outils actifs) au-dessus des mêmes moteurs, pas une réimplémentation.

### Modules d'outils (haut niveau)

- **Text Engine** : éditeur de texte riche (titres, listes, gras/italique, images).
- **Math Engine** : éditeur d'équations (fractions, puissances, racines, intégrales, dérivées, limites, matrices), tableaux de valeurs/variations, tracé de courbes/graphes sur repère.
- **Diagram Engine** : formes de base, flèches, connecteurs, blocs — réutilisé pour les circuits logiques (portes AND/OR/NOT/XOR/NAND/NOR, INPUT/OUTPUT, WIRE), les organigrammes ASDI (Start/End, Process, Input/Output, Condition) et les diagrammes d'architecture (CPU, RAM, registres, bus, mémoire).
- **Table Engine** : tableaux génériques réutilisés par Analyse, Statistiques, Architecture.
- **Chart Engine** : histogrammes, diagrammes en barres, camemberts, nuages de points (Statistiques).
- **Pseudocode Engine** : éditeur structuré avec insertion guidée (Variables, If/Else, For, While, Read, Display, Begin/End) pour ASDI.

## 5. Modèle de données (haut niveau)

```
User            (id, email, password_hash, role[student|teacher], name)
Subject         (id, name, slug, default_toolset)          -- ex: "Analyse"
Exam            (id, subject_id, teacher_id, title, duration_min, status[draft|published|closed])
Question        (id, exam_id, order, prompt, type, allowed_tools[json])
Submission      (id, exam_id, student_id, status[in_progress|submitted], started_at, submitted_at)
Answer          (id, submission_id, question_id, content[json], updated_at)   -- autosave
```

`content` d'une réponse est un document structuré en **blocs typés** (text, equation, table, graph, diagram, pseudocode), sérialisé en JSON, réutilisable pour l'export PDF final.

`allowed_tools` sur une question définit quels blocs l'étudiant peut insérer, et si IA/calculatrice/Internet sont activés pour cette question précise — configuration par défaut héritée du `default_toolset` de la matière, modifiable par l'enseignant.

## 6. Stack technique retenue

- **Framework full-stack** : Next.js (App Router) + TypeScript.
- **Base de données** : PostgreSQL (via un ORM tel que Prisma).
- **Authentification** : session-based (ex. NextAuth / Auth.js) avec rôles étudiant/enseignant.
- **Éditeur riche** : bibliothèque de blocs extensible (ex. TipTap/ProseMirror pour le texte, KaTeX/MathLive pour les équations, une lib de canvas type tldraw/React Flow pour diagrammes et circuits).
- **Déploiement** : compatible plateformes Node standard (ex. Netlify/Vercel-like).

## 7. Fonctionnalités détaillées

### 7.1 Authentification & Dashboard
- Connexion étudiant / enseignant (email + mot de passe pour le MVP).
- Dashboard étudiant : liste des matières et examens disponibles/à venir/terminés.
- Dashboard enseignant : liste des examens créés, statut, accès aux copies soumises.

### 7.2 Gestion des examens (enseignant)
- Création d'examen : matière, titre, durée.
- Ajout de questions avec énoncé, type, outils autorisés (cases à cocher : Texte/Équation/Tableau/Graphe/Diagramme, IA on/off, Calculatrice on/off, Internet on/off).
- Templates de toolset par matière (pré-remplissage automatique, modifiable).

### 7.3 Mode Examen (étudiant)
- Plein écran, timer visible, navigation Précédent/Suivant entre questions.
- Autosave périodique (toutes les X secondes) de chaque réponse.
- Bouton Soumettre avec récapitulatif (nombre de réponses texte/équations/graphes/diagrammes) et confirmation.
- Génération d'une copie numérique consultable par l'enseignant (export PDF en phase 2).

### 7.4 Moteur d'édition
- Barre d'outils contextuelle selon les `allowed_tools` de la question courante.
- Chaque bloc inséré est indépendant et réordonnable dans la zone de réponse.

### 7.5 Workspace Analyse (périmètre du MVP)
Outils actifs : éditeur de texte, éditeur d'équations (fractions, puissances, racines, dérivées, limites, intégrales, matrices), tableaux (ex. tableau de variation), création de graphe/courbe sur repère, formes de base.

## 8. Sécurité & intégrité des examens

- Pas de génération automatique de réponse ni d'assistance IA pendant un examen, sauf activation explicite par l'enseignant sur une question donnée.
- Accès Internet désactivé par défaut en mode Examen, activable par question si l'enseignant l'autorise.
- Autosave côté serveur pour éviter toute perte de travail (déconnexion, fermeture accidentelle).
- Isolation des données par examen/soumission (un étudiant ne voit que ses propres réponses).

## 9. Accessibilité

Conçue au départ pour un besoin spécifique (difficulté d'écriture manuscrite/dessin), la plateforme est généralisable à tout étudiant ayant des difficultés de production écrite manuscrite, de motricité fine, ou d'autres besoins d'accessibilité — sans jamais alléger le contenu académique évalué.

## 10. Roadmap

**Phase 0 — MVP (périmètre actuel) :**
Authentification, dashboard étudiant/enseignant, création d'examen simple, mode Examen basique (timer + autosave + soumission), workspace **Analyse** complet (texte + équations + tableaux + graphes).

**Phase 1 :** Statistiques & Probabilités, ASDI (pseudocode + organigramme), Systèmes Logiques (circuits).

**Phase 2 :** Architecture des ordinateurs, export PDF des copies, templates de toolset avancés, matières théoriques simplifiées (Management, Économie numérique, Éthique, Français, Digital & AI Literacy, Systèmes d'exploitation).

**Phase 3 :** durcissement sécurité/anti-triche, gestion multi-classes, statistiques enseignant, accessibilité étendue (lecteurs d'écran, navigation clavier complète).

## 11. Périmètre exact du MVP actuel

- Authentification étudiant / enseignant.
- Dashboard étudiant (liste des matières/examens) et dashboard enseignant (liste des examens créés).
- Création d'un examen "Analyse" avec questions et énoncés simples.
- Mode Examen : timer, navigation entre questions, autosave, soumission.
- Workspace Analyse complet : éditeur de texte, éditeur d'équations, tableaux, tracé de graphe/courbe.
- Pas encore inclus : IA/calculatrice configurables par question, export PDF, autres matières, gestion multi-classes.
