import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import path from "path";
import { eq } from "drizzle-orm";

const dbPath = path.join(process.cwd(), "data", "calendar.db");
const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
const db = drizzle(sqlite, { schema });

async function seed() {
  console.log("Seeding database...");

  // Clear existing data (order matters due to FKs)
  db.delete(schema.events).run();
  db.delete(schema.categories).run();
  db.delete(schema.schoolYears).run();

  // Categories based on the calendar legend
  const cats = [
    { name: "Dni ustawowo wolne", color: "#e53935", description: "Dni ustawowo wolne od pracy", pattern: null as string | null, sortOrder: 1 },
    { name: "Rozpoczęcie/zakończenie zajęć", color: "#fdd835", description: "Rozpoczęcie i zakończenie zajęć dydaktycznych", pattern: null, sortOrder: 2 },
    { name: "Dni wolne od zajęć", color: "#ffcc80", description: "Dni wolne od zajęć dydaktycznych", pattern: null, sortOrder: 3 },
    { name: "Rada klasyfikacyjna", color: "#43a047", description: "Rada klasyfikacyjna", pattern: null, sortOrder: 4 },
    { name: "Zebrania z rodzicami", color: "#29b6f6", description: "Zebrania z rodzicami", pattern: null, sortOrder: 5 },
    { name: "Konsultacje", color: "#81d4fa", description: "Konsultacje", pattern: null, sortOrder: 6 },
    { name: "Praktyki zawodowe", color: "#7e57c2", description: "Praktyki zawodowe klas", pattern: "stripes", sortOrder: 7 },
    { name: "Egzaminy zawodowe", color: "#ab47bc", description: "Egzaminy zawodowe – część pisemna i praktyczna", pattern: null, sortOrder: 8 },
    { name: "Inne", color: "#78909c", description: "Inne wydarzenia szkolne", pattern: null, sortOrder: 9 },
  ];

  const insertedCats = db
    .insert(schema.categories)
    .values(cats)
    .returning()
    .all();

  const catMap: Record<string, number> = {};
  insertedCats.forEach((c) => {
    catMap[c.name] = c.id;
  });

  // School year 2026/2027
  const [year] = db
    .insert(schema.schoolYears)
    .values({
      name: "2026/2027",
      isActive: true,
      startDate: "2026-09-01",
      endDate: "2027-08-31",
    })
    .returning()
    .all();

  // Events from the calendar image
  const eventsData: Array<{
    title: string;
    description?: string;
    startDate: string;
    endDate?: string;
    category: string;
  }> = [
    { title: "Wszystkich Świętych", startDate: "2026-11-01", category: "Dni ustawowo wolne" },
    { title: "Święto Niepodległości", startDate: "2026-11-11", category: "Dni ustawowo wolne" },
    { title: "Boże Narodzenie", startDate: "2026-12-25", endDate: "2026-12-26", category: "Dni ustawowo wolne" },
    { title: "Nowy Rok", startDate: "2027-01-01", category: "Dni ustawowo wolne" },
    { title: "Trzech Króli", startDate: "2027-01-06", category: "Dni ustawowo wolne" },
    { title: "Wielkanoc", startDate: "2027-03-28", endDate: "2027-03-29", category: "Dni ustawowo wolne" },
    { title: "Święto Pracy", startDate: "2027-05-01", category: "Dni ustawowo wolne" },
    { title: "Święto Konstytucji 3 Maja", startDate: "2027-05-03", category: "Dni ustawowo wolne" },
    { title: "Boże Ciało", startDate: "2027-05-27", category: "Dni ustawowo wolne" },
    { title: "Wniebowzięcie NMP", startDate: "2027-08-15", category: "Dni ustawowo wolne" },

    { title: "Rozpoczęcie roku szkolnego", startDate: "2026-09-01", category: "Rozpoczęcie/zakończenie zajęć" },
    { title: "Zakończenie I półrocza klas V i 2 KKZ", startDate: "2026-12-11", category: "Rozpoczęcie/zakończenie zajęć" },
    { title: "Zakończenie I półrocza pozostałych klas", startDate: "2027-01-15", category: "Rozpoczęcie/zakończenie zajęć" },
    { title: "Zakończenie II półrocza klas maturalnych", startDate: "2027-04-30", category: "Rozpoczęcie/zakończenie zajęć" },
    { title: "Zakończenie II półrocza pozostałych klas", startDate: "2027-06-25", category: "Rozpoczęcie/zakończenie zajęć" },
    { title: "Zakończenie roku szkolnego", startDate: "2027-06-25", category: "Rozpoczęcie/zakończenie zajęć" },

    { title: "Dzień Wolny – po Wszystkich Świętych", startDate: "2026-11-02", category: "Dni wolne od zajęć" },
    { title: "Dzień Otwarty", startDate: "2027-04-07", category: "Dni wolne od zajęć" },
    { title: "Matury (dni wolne)", startDate: "2027-05-04", endDate: "2027-05-07", category: "Dni wolne od zajęć" },
    { title: "Dzień Wolny – po Bożym Ciele", startDate: "2027-05-28", category: "Dni wolne od zajęć" },
    { title: "Egzamin zawodowy (dni wolne)", startDate: "2027-06-10", endDate: "2027-06-11", category: "Dni wolne od zajęć" },

    { title: "Przerwa bożonarodzeniowa", startDate: "2026-12-23", endDate: "2026-12-31", category: "Dni wolne od zajęć" },
    { title: "Ferie zimowe", startDate: "2027-01-18", endDate: "2027-01-31", category: "Dni wolne od zajęć" },
    { title: "Przerwa wielkanocna", startDate: "2027-03-25", endDate: "2027-03-30", category: "Dni wolne od zajęć" },
    { title: "Przerwa wakacyjna", startDate: "2027-06-26", endDate: "2027-08-31", category: "Dni wolne od zajęć" },

    { title: "Rada klasyfikacyjna – klasy maturalne", startDate: "2026-12-11", category: "Rada klasyfikacyjna" },
    { title: "Rada klasyfikacyjna – pozostałe klasy", startDate: "2027-01-15", category: "Rada klasyfikacyjna" },
    { title: "Rada klasyfikacyjna – klasy maturalne", startDate: "2027-04-30", category: "Rada klasyfikacyjna" },
    { title: "Rada klasyfikacyjna – pozostałe klasy", startDate: "2027-06-18", category: "Rada klasyfikacyjna" },

    { title: "Zebranie z rodzicami", startDate: "2026-09-08", description: "g. 17:00", category: "Zebrania z rodzicami" },
    { title: "Zebranie z rodzicami (matury)", startDate: "2026-11-17", description: "g. 17:00", category: "Zebrania z rodzicami" },
    { title: "Zebranie z rodzicami (I-IV)", startDate: "2026-12-15", description: "g. 17:00", category: "Zebrania z rodzicami" },
    { title: "Zebranie z rodzicami (matury)", startDate: "2027-03-23", description: "g. 17:00", category: "Zebrania z rodzicami" },
    { title: "Zebranie z rodzicami (I-IV)", startDate: "2027-05-25", description: "g. 17:00", category: "Zebrania z rodzicami" },

    { title: "Konsultacje (I-IV)", startDate: "2026-11-17", description: "g. 17:00", category: "Konsultacje" },
    { title: "Konsultacje (matury)", startDate: "2026-12-15", description: "g. 17:00", category: "Konsultacje" },
    { title: "Konsultacje (I-IV)", startDate: "2027-03-23", description: "g. 17:00", category: "Konsultacje" },
    { title: "Konsultacje (I-IV)", startDate: "2027-05-25", description: "g. 17:00", category: "Konsultacje" },

    { title: "Praktyki zawodowe – 4A, 4F, BS II stopnia (1 KKZ)", startDate: "2026-09-14", endDate: "2026-09-25", category: "Praktyki zawodowe" },
    { title: "Praktyki zawodowe – 3EF, 3P", startDate: "2026-10-12", endDate: "2026-10-23", category: "Praktyki zawodowe" },
    { title: "Praktyki zawodowe – 4DH, 4E, 4P", startDate: "2026-11-16", endDate: "2026-11-27", category: "Praktyki zawodowe" },

    { title: "Egzaminy zawodowe – część pisemna (sesja zimowa)", startDate: "2027-01-07", endDate: "2027-01-13", description: "5DE i 5AH (automatyk), 2 KKZ, poprawki", category: "Egzaminy zawodowe" },
    { title: "Egzaminy zawodowe – część pisemna (sesja letnia)", startDate: "2027-06-02", endDate: "2027-06-10", description: "3EF (teleinf), 3P, 4A, 4DH, 4E, 4F, 4P, poprawki", category: "Egzaminy zawodowe" },
    { title: "Egzaminy zawodowe – część praktyczna (sesja zimowa)", startDate: "2027-01-05", endDate: "2027-01-29", description: "ELE.05, ELM.04, ELM.05, poprawki, termin dodatkowy", category: "Egzaminy zawodowe" },
    { title: "Egzaminy zawodowe – część praktyczna (sesja letnia)", startDate: "2027-06-01", endDate: "2027-06-29", description: "INF, ELE, ELM + poprawki, termin dodatkowy", category: "Egzaminy zawodowe" },

    { title: "Akcja oddawania krwi", startDate: "2026-10-09", category: "Inne" },
    { title: "Konferencja", startDate: "2027-01-15", category: "Inne" },
    { title: "Dzień Otwarty Szkoły", startDate: "2027-04-07", category: "Inne" },
    { title: "Egzaminy maturalne", startDate: "2027-05-04", endDate: "2027-05-30", category: "Inne" },
  ];

  for (const e of eventsData) {
    db.insert(schema.events)
      .values({
        title: e.title,
        description: e.description ?? null,
        startDate: e.startDate,
        endDate: e.endDate ?? null,
        categoryId: catMap[e.category],
        schoolYearId: year.id,
        allDay: true,
      })
      .run();
  }

  console.log(`Seeded ${eventsData.length} events for school year ${year.name}`);
  console.log("Categories:", insertedCats.map((c) => c.name).join(", "));
  console.log("\nAby utworzyć konto administratora, użyj panelu logowania lub uruchom:");
  console.log("  curl -X POST http://localhost:3000/api/auth/sign-up/email -H 'Content-Type: application/json' -d '{\"email\":\"admin@school.local\",\"password\":\"admin123\",\"name\":\"Administrator\"}'");
  console.log("Następnie zaktualizuj role w bazie na 'admin'.");
  sqlite.close();
}

seed().catch(console.error);
