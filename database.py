import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "app.db"


def connect() -> sqlite3.Connection:
    """Open a connection with dictionary-style rows and foreign keys enabled."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db() -> None:
    """Create the shelter tables and add example data to a new database."""
    conn = connect()
    try:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS animals (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                name        TEXT NOT NULL,
                species     TEXT NOT NULL,
                breed       TEXT,
                age         INTEGER NOT NULL CHECK (age >= 0),
                description TEXT,
                status      TEXT NOT NULL DEFAULT 'available'
                            CHECK (status IN ('available', 'reserved', 'adopted'))
            );

            CREATE TABLE IF NOT EXISTS adoptions (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                animal_id   INTEGER NOT NULL
                            REFERENCES animals(id) ON DELETE CASCADE,
                person_name TEXT NOT NULL,
                phone       TEXT NOT NULL,
                reason      TEXT,
                status      TEXT NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending', 'approved', 'rejected'))
            );

            CREATE UNIQUE INDEX IF NOT EXISTS one_approved_adoption_per_animal
                ON adoptions(animal_id)
                WHERE status = 'approved';
            """
        )

        with conn:
            count = conn.execute(
                "SELECT COUNT(*) AS n FROM animals"
            ).fetchone()["n"]
            if count == 0:
                animals = [
                    ("Барсик", "Кот", "Британская короткошёрстная", 3,
                     "Спокойный и ласковый кот.", "reserved"),
                    ("Рекс", "Собака", "Овчарка", 5,
                     "Активный, знает базовые команды.", "reserved"),
                    ("Мурка", "Кошка", None, 2,
                     "Дружелюбная кошка, любит играть.", "reserved"),
                    ("Дружок", "Собака", "Метис", 1,
                     "Весёлый щенок.", "available"),
                    ("Кеша", "Попугай", "Волнистый", 1,
                     "Любит общение и хорошо поёт.", "available"),
                ]
                animal_ids = []
                for animal in animals:
                    cursor = conn.execute(
                        """
                        INSERT INTO animals
                            (name, species, breed, age, description, status)
                        VALUES (?, ?, ?, ?, ?, ?)
                        """,
                        animal,
                    )
                    animal_ids.append(cursor.lastrowid)

                adoptions = [
                    (animal_ids[0], "Анна Иванова", "+7-900-000-00-01",
                     "Хочу взять кота в семью.", "pending"),
                    (animal_ids[1], "Иван Петров", "+7-900-000-00-02",
                     "Есть опыт содержания собак.", "pending"),
                    (animal_ids[2], "Мария Смирнова", "+7-900-000-00-03",
                     "Ищу домашнего питомца.", "pending"),
                ]
                conn.executemany(
                    """
                    INSERT INTO adoptions
                        (animal_id, person_name, phone, reason, status)
                    VALUES (?, ?, ?, ?, ?)
                    """,
                    adoptions,
                )

            extra_animals = [
                ("Луна", "Кошка", "Сибирская", 2,
                 "Любознательная кошка, любит играть с мячиками.", "available"),
                ("Тайсон", "Собака", "Лабрадор", 4,
                 "Добрый и спокойный пёс, хорошо ладит с детьми.", "available"),
                ("Пушок", "Кролик", "Карликовый", 1,
                 "Тихий кролик, привык к домашнему содержанию.", "available"),
                ("Соня", "Кошка", "Беспородная", 6,
                 "Нежная и спокойная кошка, любит уютные места.", "available"),
                ("Гром", "Собака", "Метис", 3,
                 "Энергичный пёс, которому нравятся долгие прогулки.", "available"),
                ("Чип", "Хомяк", "Джунгарский", 1,
                 "Небольшой активный хомяк, особенно бодр вечером.", "available"),
            ]
            for animal in extra_animals:
                conn.execute(
                    """
                    INSERT INTO animals
                        (name, species, breed, age, description, status)
                    SELECT ?, ?, ?, ?, ?, ?
                    WHERE NOT EXISTS (
                        SELECT 1 FROM animals WHERE name = ? AND species = ?
                    )
                    """,
                    (*animal, animal[0], animal[1]),
                )
    finally:
        conn.close()
