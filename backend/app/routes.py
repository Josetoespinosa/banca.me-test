import json
import re

from fastapi import APIRouter, HTTPException, status

from backend.app.credit_evaluation import CreditEvaluationInput, evaluate_credit
from backend.app.database import (
    create_application,
    get_application,
    save_financial_evaluation,
)
from backend.app.config import settings
from backend.app.schemas import (
    ApplicationFinancialRequest,
    ApplicationStartRequest,
    ContactRequest,
)

router = APIRouter(prefix="/api", tags=["landing"])
rut_pattern = re.compile(r"^\d{1,2}\.\d{3}\.\d{3}-\d$")


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


def validate_rut_format(rut: str) -> bool:
    return bool(rut_pattern.match(rut.strip()))


def evaluate_identity(rut: str) -> tuple[str, str]:
    last_digit = int(rut.strip()[-1])
    if last_digit % 2 == 0:
        return "approved", "Tu identidad fue verificada correctamente"
    return "rejected", "No se pudo reconocer la identidad"


@router.post("/applications/start")
def start_application(payload: ApplicationStartRequest):
    if not validate_rut_format(payload.rut):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El RUT debe usar el formato xx.xxx.xxx-y",
        )

    if payload.tipoCliente == "empresa":
        if not payload.empresaNombre:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El nombre de la empresa es obligatorio",
            )
        if not payload.empresaRut or not validate_rut_format(payload.empresaRut):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El RUT de la empresa debe usar el formato xx.xxx.xxx-y",
            )

    identity_status, identity_message = evaluate_identity(payload.rut)
    application_id = create_application(
        payload.model_dump(),
        identity_status=identity_status,
        identity_message=identity_message,
    )

    return {
        "applicationId": application_id,
        "identityStatus": identity_status,
        "message": identity_message,
    }


@router.post("/applications/{application_id}/evaluate")
def evaluate_application_financials(
    application_id: str, payload: ApplicationFinancialRequest
):
    application = get_application(application_id)

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No encontramos la solicitud",
        )

    if application["identity_status"] != "approved":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La solicitud no superó la validación de identidad",
        )

    evaluation = evaluate_credit(
        CreditEvaluationInput(
            ingresos_mensuales=payload.ingresosMensuales,
            gastos_mensuales=payload.gastosMensuales,
            deudas_mensuales=payload.deudasMensuales,
            monto_solicitado=payload.montoSolicitado,
        )
    )

    saved_application = save_financial_evaluation(
        application_id, payload.model_dump(), evaluation
    )

    return {
        "applicationId": application_id,
        "status": evaluation["status"],
        "score": evaluation["score"],
        "metrics": evaluation["metrics"],
        "razones": evaluation["razones"],
        "identityStatus": application["identity_status"],
        "applicant": {
            "nombre": application["nombre"],
            "apellido": application["apellido"],
            "rut": application["rut"],
            "email": application["email"],
            "tipoCliente": application["tipo_cliente"],
            "empresaNombre": application["empresa_nombre"],
            "empresaRut": application["empresa_rut"],
        },
        "storedRecord": {
            "createdAt": saved_application["created_at"] if saved_application else None,
            "updatedAt": saved_application["updated_at"] if saved_application else None,
            "evaluationMetrics": json.loads(saved_application["evaluation_metrics_json"])
            if saved_application and saved_application["evaluation_metrics_json"]
            else None,
        },
    }
