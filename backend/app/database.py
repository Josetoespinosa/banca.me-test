from __future__ import annotations

import json
import sqlite3
from contextlib import contextmanager
from pathlib import Path
from uuid import uuid4

from backend.app.config import settings


def init_database() -> None:
    database_path = Path(settings.sqlite_path)
    database_path.parent.mkdir(parents=True, exist_ok=True)

    with sqlite3.connect(database_path) as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS credit_applications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                application_id TEXT NOT NULL UNIQUE,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                nombre TEXT NOT NULL,
                apellido TEXT NOT NULL,
                rut TEXT NOT NULL,
                email TEXT NOT NULL,
                tipo_cliente TEXT NOT NULL,
                empresa_nombre TEXT,
                empresa_rut TEXT,
                identity_status TEXT NOT NULL,
                identity_message TEXT NOT NULL,
                ingresos_mensuales REAL,
                gastos_mensuales REAL,
                deudas_mensuales REAL,
                monto_solicitado REAL,
                evaluation_status TEXT,
                evaluation_score INTEGER,
                evaluation_metrics_json TEXT,
                evaluation_reasons_json TEXT
            )
            """
        )
        connection.commit()


@contextmanager
def get_connection():
    connection = sqlite3.connect(settings.sqlite_path)
    connection.row_factory = sqlite3.Row
    try:
        yield connection
    finally:
        connection.close()


def generate_application_id() -> str:
    return f"APP-{uuid4().hex[:10].upper()}"


def create_application(payload: dict, identity_status: str, identity_message: str) -> str:
    application_id = generate_application_id()

    with get_connection() as connection:
        connection.execute(
            """
            INSERT INTO credit_applications (
                application_id,
                created_at,
                updated_at,
                nombre,
                apellido,
                rut,
                email,
                tipo_cliente,
                empresa_nombre,
                empresa_rut,
                identity_status,
                identity_message
            ) VALUES (?, datetime('now'), datetime('now'), ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                application_id,
                payload["nombre"],
                payload["apellido"],
                payload["rut"],
                payload["email"],
                payload["tipoCliente"],
                payload.get("empresaNombre"),
                payload.get("empresaRut"),
                identity_status,
                identity_message,
            ),
        )
        connection.commit()

    return application_id


def get_application(application_id: str) -> dict | None:
    with get_connection() as connection:
        row = connection.execute(
            "SELECT * FROM credit_applications WHERE application_id = ?",
            (application_id,),
        ).fetchone()

    if not row:
        return None

    return dict(row)


def save_financial_evaluation(
    application_id: str, financial_data: dict, evaluation: dict
) -> dict | None:
    with get_connection() as connection:
        connection.execute(
            """
            UPDATE credit_applications
            SET
                updated_at = datetime('now'),
                ingresos_mensuales = ?,
                gastos_mensuales = ?,
                deudas_mensuales = ?,
                monto_solicitado = ?,
                evaluation_status = ?,
                evaluation_score = ?,
                evaluation_metrics_json = ?,
                evaluation_reasons_json = ?
            WHERE application_id = ?
            """,
            (
                financial_data["ingresosMensuales"],
                financial_data["gastosMensuales"],
                financial_data["deudasMensuales"],
                financial_data["montoSolicitado"],
                evaluation["status"],
                evaluation["score"],
                json.dumps(evaluation["metrics"]),
                json.dumps(evaluation["razones"]),
                application_id,
            ),
        )
        connection.commit()

    return get_application(application_id)
