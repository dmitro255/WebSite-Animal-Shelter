from database import connect


def list_all() -> list[dict]:
    conn = connect()
    try:
        rows = conn.execute(
            "SELECT * FROM animals ORDER BY id"
        ).fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()

def get(animal_id: int) -> dict | None:
    conn = connect()
    try:
        row = conn.execute(
            "SELECT * FROM animals WHERE id = ?",
            (animal_id,),
        ).fetchone()
        return dict(row) if row else None
    finally:
        conn.close()


def create(data: dict) -> dict:
    conn = connect()
    try:
        cursor = conn.execute(
            """
            INSERT INTO animals (name, species, breed, age, description, status)
            VALUES (:name, :species, :breed, :age, :description, :status)
            """,
            data,
        )
        conn.commit()
        row = conn.execute(
            "SELECT * FROM animals WHERE id = ?",
            (cursor.lastrowid,),
        ).fetchone()
        return dict(row)
    finally:
        conn.close()


def update(animal_id: int, data: dict) -> dict | None:
    conn = connect()
    try:
        cursor = conn.execute(
            """
            UPDATE animals
            SET name = :name, species = :species, breed = :breed, age = :age,
                description = :description, status = :status
            WHERE id = :id
            """,
            {**data, "id": animal_id},
        )
        conn.commit()
        if cursor.rowcount == 0:
            return None
        row = conn.execute(
            "SELECT * FROM animals WHERE id = ?",
            (animal_id,),
        ).fetchone()
        return dict(row)
    finally:
        conn.close()


def delete(animal_id: int) -> bool:
    conn = connect()
    try:
        cursor = conn.execute("DELETE FROM animals WHERE id = ?", (animal_id,))
        conn.commit()
        return cursor.rowcount > 0
    finally:
        conn.close()
