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
                    ("Milo", "Cat", "British Shorthair", 3,
                     "A calm and affectionate cat.", "reserved"),
                    ("Rex", "Dog", "German Shepherd", 5,
                     "An active dog who knows basic commands.", "reserved"),
                    ("Misty", "Cat", None, 2,
                     "A friendly cat who loves to play.", "reserved"),
                    ("Buddy", "Dog", "Mixed Breed", 1,
                     "A cheerful young dog.", "available"),
                    ("Kiwi", "Parrot", "Budgerigar", 1,
                     "Enjoys company and loves to sing.", "available"),
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
                    (animal_ids[0], "Anna Ivanova", "+1-555-010-0001",
                     "I would love to welcome a cat into my family.", "pending"),
                    (animal_ids[1], "Ivan Petrov", "+1-555-010-0002",
                     "I have experience caring for dogs.", "pending"),
                    (animal_ids[2], "Maria Smirnova", "+1-555-010-0003",
                     "I am looking for a companion animal.", "pending"),
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
                ("Luna", "Cat", "Siberian", 2,
                 "A curious cat who loves playing with balls.", "available"),
                ("Tyson", "Dog", "Labrador", 4,
                 "A kind, calm dog who gets along well with children.", "available"),
                ("Puff", "Rabbit", "Dwarf", 1,
                 "A quiet rabbit who is used to living indoors.", "available"),
                ("Sophie", "Cat", "Domestic Shorthair", 6,
                 "A gentle, calm cat who loves cozy places.", "available"),
                ("Thunder", "Dog", "Mixed Breed", 3,
                 "An energetic dog who enjoys long walks.", "available"),
                ("Chip", "Hamster", "Djungarian", 1,
                 "A small, active hamster who is especially lively in the evening.", "available"),
            ]
            for animal in extra_animals:
                conn.execute(
                    """
                    INSERT INTO animals
                        (name, species, breed, age, description, status)
                    SELECT ?, ?, ?, ?, ?, ?
                    WHERE NOT EXISTS (
                        SELECT 1 FROM animals WHERE name = ?
                    )
                    """,
                    (*animal, animal[0]),
                )
    finally:
        conn.close()
