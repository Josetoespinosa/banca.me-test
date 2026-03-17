from fastapi import APIRouter, HTTPException, status

from backend.app.config import settings
from backend.app.schemas import ContactRequest

router = APIRouter(prefix="/api", tags=["landing"])


@router.get("/health")
def healthcheck():
    return {
        "status": "ok",
        "environment": settings.environment,
        "contact_provider": settings.contact_provider,
    }


@router.post("/contact")
def create_contact(_: ContactRequest):
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail=(
            "El endpoint ya está conectado al frontend, pero la lógica de envío aún no "
            f"está implementada. Proveedor configurado: {settings.contact_provider}. "
            f"Destino previsto: {settings.contact_recipient}."
        ),
    )
