from dataclasses import dataclass
from pathlib import Path
import os

from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parents[2]
load_dotenv(ROOT_DIR / ".env")


def _split_csv(value: str) -> list[str]:
    return [item.strip() for item in value.split(",") if item.strip()]


@dataclass(frozen=True)
class Settings:
    app_name: str
    environment: str
    host: str
    port: int
    cors_origins: list[str]
    contact_recipient: str
    contact_provider: str
    sqlite_path: str


settings = Settings(
    app_name=os.getenv("BACKEND_APP_NAME", "Banca.me API"),
    environment=os.getenv("BACKEND_ENV", "development"),
    host=os.getenv("BACKEND_HOST", "0.0.0.0"),
    port=int(os.getenv("BACKEND_PORT", "8000")),
    cors_origins=_split_csv(
        os.getenv(
            "BACKEND_CORS_ORIGINS",
            "http://localhost:3000,http://127.0.0.1:3000",
        )
    ),
    contact_recipient=os.getenv("BACKEND_CONTACT_RECIPIENT", "contacto@banca.me"),
    contact_provider=os.getenv("BACKEND_CONTACT_PROVIDER", "placeholder"),
    sqlite_path=os.getenv(
        "BACKEND_SQLITE_PATH", str(ROOT_DIR / "backend" / "data" / "applications.sqlite3")
    ),
)
