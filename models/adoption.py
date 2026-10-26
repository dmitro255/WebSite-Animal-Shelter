import sqlite3
from database import connect


def list_all() -> list[dict]:
    conn = connect()
    try:
        rows = conn.execute(
            "SELECT * FROM adoptions ORDER BY id"
        ).fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()


def get(adoption_id: int) -> dict | None:
    conn = connect()
    try:
        row = conn.execute(
            "SELECT * FROM adoptions WHERE id = ?",
            (adoption_id,),
        ).fetchone()
        return dict(row) if row else None
    finally:
        conn.close()


def create(data: dict) -> dict:
    conn = connect()
    try:
        with conn:
            _ensure_animal_not_adopted(conn, data["animal_id"])
            if data["status"] == "approved":
                _ensure_approvable(conn, data["animal_id"])

            cursor = conn.execute(
                """
                INSERT INTO adoptions
                    (animal_id, person_name, phone, reason, status)
                VALUES (:animal_id, :person_name, :phone, :reason, :status)
                """,
                data,
            )
            _sync_animal_status(conn, data["animal_id"])

            row = conn.execute(
                "SELECT * FROM adoptions WHERE id = ?",
                (cursor.lastrowid,),
            ).fetchone()
            return dict(row)
    finally:
        conn.close()


def update(adoption_id: int, data: dict) -> dict | None:
    conn = connect()
    try:
        with conn:
            existing = conn.execute(
                "SELECT animal_id, status FROM adoptions WHERE id = ?",
                (adoption_id,),
            ).fetchone()
            if existing is None:
                return None

            previous_animal_id = existing["animal_id"]
            if data["status"] == "approved":
                _ensure_approvable(
                    conn,
                    data["animal_id"],
                    excluding_adoption_id=adoption_id,
                )

            conn.execute(
                """
                UPDATE adoptions
                SET animal_id = :animal_id, person_name = :person_name,
                    phone = :phone, reason = :reason, status = :status
                WHERE id = :id
                """,
                {**data, "id": adoption_id},
            )

            _sync_animal_status(conn, previous_animal_id)
            if data["animal_id"] != previous_animal_id:
                _sync_animal_status(conn, data["animal_id"])
        row = conn.execute(
            "SELECT * FROM adoptions WHERE id = ?",
            (adoption_id,),
        ).fetchone()
        return dict(row) if row else None
    finally:
        conn.close()


def delete(adoption_id: int) -> bool:
    conn = connect()
    try:
        with conn:
            row = conn.execute(
                "SELECT animal_id FROM adoptions WHERE id = ?",
                (adoption_id,),
            ).fetchone()
            if row is None:
                return False
            animal_id = row["animal_id"]
            conn.execute("DELETE FROM adoptions WHERE id = ?", (adoption_id,))
            _sync_animal_status(conn, animal_id)
            return True
    finally:
        conn.close()


def _ensure_approvable( conn: sqlite3.Connection,animal_id: int, excluding_adoption_id: int | None = None,) -> None:
    animal = conn.execute(
        "SELECT status FROM animals WHERE id = ?",
        (animal_id,),
    ).fetchone()
    if animal is None:
        raise ValueError("Animal not found.")
    approved = conn.execute(
        """
        SELECT 1 FROM adoptions
        WHERE animal_id = ? AND status = 'approved' AND id != COALESCE(?, -1)
        """,
        (animal_id, excluding_adoption_id),
    ).fetchone()
    current_approval = None
    if excluding_adoption_id is not None:
        current_approval = conn.execute(
            """
            SELECT 1 FROM adoptions
            WHERE id = ? AND animal_id = ? AND status = 'approved'
            """,
            (excluding_adoption_id, animal_id),
        ).fetchone()
    if approved is not None or (
        animal["status"] == "adopted" and current_approval is None
    ):
        raise ValueError("This animal already has an approved adoption.")


def _ensure_animal_not_adopted(conn: sqlite3.Connection, animal_id: int) -> None:
    row = conn.execute(
        "SELECT status FROM animals WHERE id = ?",
        (animal_id,),
    ).fetchone()
    if row is None:
        raise ValueError("Animal not found.")
    if row["status"] == "adopted":
        raise ValueError("Cannot create an application for an adopted animal.")


def _sync_animal_status(conn: sqlite3.Connection, animal_id: int) -> None:
    approved = conn.execute(
        """
        SELECT 1 FROM adoptions
        WHERE animal_id = ? AND status = 'approved'
        """,
        (animal_id,),
    ).fetchone()
    if approved is not None:
        status = "adopted"
    else:
        pending = conn.execute(
            """
            SELECT 1 FROM adoptions
            WHERE animal_id = ? AND status = 'pending'
            """,
            (animal_id,),
        ).fetchone()
        status = "reserved" if pending is not None else "available"
    conn.execute(
        "UPDATE animals SET status = ? WHERE id = ?",
        (status, animal_id),
    )
