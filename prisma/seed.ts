import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SUBJECTS: { name: string; slug: string; defaultTools: string[] }[] = [
  { name: "Analyse", slug: "analyse", defaultTools: ["text", "equation", "table", "graph"] },
  {
    name: "Statistiques & Probabilités",
    slug: "statistiques-probabilites",
    defaultTools: ["text", "equation", "table", "graph"],
  },
  { name: "Systèmes Logiques", slug: "systemes-logiques", defaultTools: ["text", "diagram"] },
  { name: "ASDI", slug: "asdi", defaultTools: ["text", "diagram"] },
  {
    name: "Systèmes d'exploitation",
    slug: "systemes-exploitation",
    defaultTools: ["text", "table"],
  },
  {
    name: "Architecture des ordinateurs",
    slug: "architecture-ordinateurs",
    defaultTools: ["text", "diagram", "table"],
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

  const analyse = await prisma.subject.findUniqueOrThrow({ where: { slug: "analyse" } });

  const existingExam = await prisma.exam.findFirst({
    where: { subjectId: analyse.id, title: "Analyse — DS1 : Étude de fonctions" },
  });

  if (!existingExam) {
    await prisma.exam.create({
      data: {
        subjectId: analyse.id,
        teacherId: teacher.id,
        title: "Analyse — DS1 : Étude de fonctions",
        durationMin: 90,
        status: "PUBLISHED",
        questions: {
          create: [
            {
              order: 1,
              points: 5,
              allowedTools: ["text", "equation", "table", "graph"],
              prompt:
                "On considère la fonction f définie sur ℝ \\ {-1} par f(x) = (2x - 1) / (x + 1). Étudier les variations de f, préciser ses asymptotes, puis tracer sa représentation graphique Cf.",
            },
            {
              order: 2,
              points: 4,
              allowedTools: ["text", "equation"],
              prompt:
                "Calculer les limites de f en -∞, en -1 (à gauche et à droite) et en +∞.",
            },
            {
              order: 3,
              points: 3,
              allowedTools: ["text", "table"],
              prompt: "Dresser le tableau de variation complet de f.",
            },
            {
              order: 4,
              points: 3,
              allowedTools: ["text", "graph"],
              prompt:
                "Tracer la courbe représentative Cf de f, en faisant apparaître ses asymptotes.",
            },
          ],
        },
      },
    });
  }

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
