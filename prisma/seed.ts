import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SUBJECTS: { name: string; slug: string; defaultTools: string[] }[] = [
  { name: "Analyse", slug: "analyse", defaultTools: ["text", "equation", "table", "graph"] },
  {
    name: "Statistiques & Probabilités",
    slug: "statistiques-probabilites",
    defaultTools: ["text", "equation", "table", "chart"],
  },
  { name: "Systèmes Logiques", slug: "systemes-logiques", defaultTools: ["text", "circuit"] },
  { name: "ASDI", slug: "asdi", defaultTools: ["text", "pseudocode", "flowchart"] },
  {
    name: "Systèmes d'exploitation",
    slug: "systemes-exploitation",
    defaultTools: ["text", "table"],
  },
  {
    name: "Architecture des ordinateurs",
    slug: "architecture-ordinateurs",
    defaultTools: ["text", "flowchart", "table"],
  },
  { name: "Management", slug: "management", defaultTools: ["text"] },
  { name: "Économie numérique", slug: "economie-numerique", defaultTools: ["text"] },
  {
    name: "Éthique et droit du numérique",
    slug: "ethique-droit-numerique",
    defaultTools: ["text"],
  },
  { name: "Digital & AI Literacy", slug: "digital-ai-literacy", defaultTools: ["text"] },
  { name: "Français", slug: "francais", defaultTools: ["text"] },
];

type QuestionSeed = { points: number; allowedTools: string[]; prompt: string };

async function ensureExam(
  subjectSlug: string,
  teacherId: string,
  title: string,
  durationMin: number,
  questions: QuestionSeed[]
) {
  const subject = await prisma.subject.findUniqueOrThrow({ where: { slug: subjectSlug } });
  const existing = await prisma.exam.findFirst({ where: { subjectId: subject.id, title } });
  if (existing) return;

  await prisma.exam.create({
    data: {
      subjectId: subject.id,
      teacherId,
      title,
      durationMin,
      status: "PUBLISHED",
      questions: {
        create: questions.map((q, i) => ({ order: i + 1, ...q })),
      },
    },
  });
}

async function main() {
  for (const [index, subject] of SUBJECTS.entries()) {
    await prisma.subject.upsert({
      where: { slug: subject.slug },
      update: { name: subject.name, order: index, defaultTools: subject.defaultTools },
      create: { ...subject, order: index },
    });
  }

  const passwordHash = await bcrypt.hash("password123", 10);

  const teacher = await prisma.user.upsert({
    where: { email: "imene.gharbi@esen.tn" },
    update: {},
    create: {
      email: "imene.gharbi@esen.tn",
      name: "Imène Gharbi",
      role: "TEACHER",
      passwordHash,
    },
  });

  await prisma.user.upsert({
    where: { email: "sami.trabelsi@esen.tn" },
    update: {},
    create: {
      email: "sami.trabelsi@esen.tn",
      name: "Sami Trabelsi",
      role: "STUDENT",
      passwordHash,
    },
  });

  await ensureExam("analyse", teacher.id, "Analyse — DS1 : Étude de fonctions", 90, [
    {
      points: 5,
      allowedTools: ["text", "equation", "table", "graph"],
      prompt:
        "On considère la fonction f définie sur ℝ \\ {-1} par f(x) = (2x - 1) / (x + 1). Étudier les variations de f, préciser ses asymptotes, puis tracer sa représentation graphique Cf.",
    },
    {
      points: 4,
      allowedTools: ["text", "equation"],
      prompt: "Calculer les limites de f en -∞, en -1 (à gauche et à droite) et en +∞.",
    },
    {
      points: 3,
      allowedTools: ["text", "table"],
      prompt: "Dresser le tableau de variation complet de f.",
    },
    {
      points: 3,
      allowedTools: ["text", "graph"],
      prompt: "Tracer la courbe représentative Cf de f, en faisant apparaître ses asymptotes.",
    },
  ]);

  await ensureExam(
    "statistiques-probabilites",
    teacher.id,
    "Statistiques — DS1 : Analyse d'une série statistique",
    60,
    [
      {
        points: 6,
        allowedTools: ["text", "equation", "table", "chart"],
        prompt:
          "On a relevé les notes suivantes sur 5 étudiants : 12, 15, 18, 14, 20. Calculer la moyenne et l'écart-type de cette série, puis la représenter par un diagramme en barres.",
      },
      {
        points: 4,
        allowedTools: ["text", "chart"],
        prompt: "Représenter la répartition de ces notes par un diagramme circulaire.",
      },
    ]
  );

  await ensureExam("asdi", teacher.id, "ASDI — DS1 : Algorithme de parité", 60, [
    {
      points: 5,
      allowedTools: ["text", "pseudocode"],
      prompt:
        "Écrire en pseudocode un algorithme qui lit un entier n et affiche s'il est pair ou impair.",
    },
    {
      points: 5,
      allowedTools: ["text", "flowchart"],
      prompt:
        "Représenter cet algorithme sous forme d'organigramme (Début, condition, traitements, Fin).",
    },
  ]);

  await ensureExam("systemes-logiques", teacher.id, "Systèmes Logiques — DS1 : Portes logiques", 45, [
    {
      points: 6,
      allowedTools: ["text", "circuit"],
      prompt:
        "Construire le circuit logique correspondant à l'expression S = (A ET B) OU (NON C), à l'aide des portes INPUT, AND, NOT, OR et OUTPUT.",
    },
    {
      points: 4,
      allowedTools: ["text"],
      prompt: "Expliquer en quelques lignes le fonctionnement du circuit obtenu.",
    },
  ]);

  console.log("Seed terminé : comptes de démonstration (mot de passe: password123)");
  console.log(" - Étudiant : sami.trabelsi@esen.tn");
  console.log(" - Enseignant : imene.gharbi@esen.tn");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
