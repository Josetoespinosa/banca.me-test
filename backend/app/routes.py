import json
import re

from fastapi import APIRouter, HTTPException, status

from backend.app.credit_evaluation import CreditEvaluationInput, evaluate_credit
from backend.app.database import (
    create_application,
    get_application,
    list_applications,
    save_manual_review,
    save_financial_evaluation,
)
from backend.app.config import settings
from backend.app.schemas import (
    AdminManualReviewRequest,
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


def build_admin_overview_payload(applications: list[dict]) -> dict:
    identity_approved = sum(1 for app in applications if app["identity_status"] == "approved")
    identity_rejected = sum(1 for app in applications if app["identity_status"] == "rejected")
    apto_count = sum(1 for app in applications if app["evaluation_status"] == "apto")
    no_apto_count = sum(1 for app in applications if app["evaluation_status"] == "no_apto")
    indeciso_count = sum(1 for app in applications if app["evaluation_status"] == "indeciso")
    evaluated_count = sum(1 for app in applications if app["evaluation_status"])
    total_count = len(applications)

    def ratio(count: int) -> float:
        if total_count == 0:
            return 0.0
        return round(count / total_count, 4)

    application_rows = []
    indecisos = []

    for application in applications:
        metrics = (
            json.loads(application["evaluation_metrics_json"])
            if application["evaluation_metrics_json"]
            else None
        )
        reasons = (
            json.loads(application["evaluation_reasons_json"])
            if application["evaluation_reasons_json"]
            else []
        )

        row = {
            "applicationId": application["application_id"],
            "createdAt": application["created_at"],
            "updatedAt": application["updated_at"],
            "nombreCompleto": f'{application["nombre"]} {application["apellido"]}',
            "rut": application["rut"],
            "email": application["email"],
            "tipoCliente": application["tipo_cliente"],
            "empresaNombre": application["empresa_nombre"],
            "empresaRut": application["empresa_rut"],
            "identityStatus": application["identity_status"],
            "identityMessage": application["identity_message"],
            "evaluationStatus": application["evaluation_status"],
            "evaluationScore": application["evaluation_score"],
            "manualDecision": application["manual_decision"],
            "manualReviewedAt": application["manual_reviewed_at"],
            "ingresosMensuales": application["ingresos_mensuales"],
            "gastosMensuales": application["gastos_mensuales"],
            "deudasMensuales": application["deudas_mensuales"],
            "montoSolicitado": application["monto_solicitado"],
            "metrics": metrics,
            "razones": reasons,
        }

        application_rows.append(row)

        if application["evaluation_status"] == "indeciso":
            indecisos.append(row)

    observations: list[str] = []
    if total_count == 0:
        observations.append("Aún no existen solicitudes en el sistema.")
    else:
        if identity_rejected > identity_approved:
            observations.append(
                "El rechazo por identidad supera a las identidades aprobadas; conviene revisar el funnel inicial."
            )
        if indeciso_count > 0:
            observations.append(
                f"Hay {indeciso_count} solicitudes indecisas disponibles para revisión manual."
            )
        if apto_count > 0:
            observations.append(
                f"El sistema ya identificó {apto_count} solicitudes aptas con evaluación financiera completa."
            )
        if no_apto_count > 0:
            observations.append(
                f"Existen {no_apto_count} solicitudes no aptas luego del modelo financiero; revisar razones recurrentes."
            )

    return {
        "kpis": {
            "totalSolicitudes": total_count,
            "identidadAprobada": identity_approved,
            "identidadRechazada": identity_rejected,
            "evaluadas": evaluated_count,
            "aptas": apto_count,
            "noAptas": no_apto_count,
            "indecisas": indeciso_count,
            "tasaIdentidadAprobada": ratio(identity_approved),
            "tasaIdentidadRechazada": ratio(identity_rejected),
            "tasaAptas": ratio(apto_count),
            "tasaNoAptas": ratio(no_apto_count),
            "tasaIndecisas": ratio(indeciso_count),
        },
        "charts": {
            "identityDistribution": [
                {"label": "Aprobada", "value": identity_approved},
                {"label": "Rechazada", "value": identity_rejected},
            ],
            "evaluationDistribution": [
                {"label": "Apto", "value": apto_count},
                {"label": "No apto", "value": no_apto_count},
                {"label": "Indeciso", "value": indeciso_count},
            ],
        },
        "indecisos": indecisos,
        "applications": application_rows,
        "observations": observations,
    }


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


@router.get("/admin/overview")
def get_admin_overview():
    applications = list_applications()
    return build_admin_overview_payload(applications)


@router.post("/admin/applications/{application_id}/review")
def review_indeciso_application(
    application_id: str, payload: AdminManualReviewRequest
):
    application = get_application(application_id)

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No encontramos la solicitud",
        )

    if application["evaluation_status"] != "indeciso":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Solo se pueden revisar manualmente solicitudes indecisas",
        )

    reviewed_application = save_manual_review(application_id, payload.decision)

    return {
        "applicationId": application_id,
        "status": reviewed_application["evaluation_status"] if reviewed_application else None,
        "manualDecision": reviewed_application["manual_decision"] if reviewed_application else None,
        "manualReviewedAt": reviewed_application["manual_reviewed_at"]
        if reviewed_application
        else None,
        "message": (
            "La solicitud fue aprobada manualmente."
            if payload.decision == "apto"
            else "La solicitud fue rechazada manualmente."
        ),
    }
