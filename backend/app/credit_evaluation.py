from dataclasses import dataclass


@dataclass(frozen=True)
class CreditEvaluationInput:
    ingresos_mensuales: float
    gastos_mensuales: float
    deudas_mensuales: float
    monto_solicitado: float | None = None


def estimate_monthly_installment(monto_solicitado: float | None) -> float:
    if monto_solicitado is None:
        return 0.0
    return monto_solicitado * 0.1


def calculate_credit_metrics(input_data: CreditEvaluationInput) -> dict[str, float]:
    cuota_mensual = estimate_monthly_installment(input_data.monto_solicitado)
    deuda_total_mensual = input_data.deudas_mensuales + cuota_mensual
    ingresos = input_data.ingresos_mensuales

    dti = deuda_total_mensual / ingresos if ingresos > 0 else 0.0
    margen_disponible = (
        input_data.ingresos_mensuales
        - input_data.gastos_mensuales
        - input_data.deudas_mensuales
    )
    ratio_gastos = input_data.gastos_mensuales / ingresos if ingresos > 0 else 0.0
    capacidad_pago = margen_disponible / ingresos if ingresos > 0 else 0.0

    return {
        "DTI": round(dti, 4),
        "margenDisponible": round(margen_disponible, 2),
        "ratioGastos": round(ratio_gastos, 4),
        "capacidadPago": round(capacidad_pago, 4),
        "cuotaMensual": round(cuota_mensual, 2),
    }


def get_hard_rejection_reasons(
    input_data: CreditEvaluationInput, metrics: dict[str, float]
) -> list[str]:
    reasons: list[str] = []

    if input_data.ingresos_mensuales <= 0:
        reasons.append("Ingresos inválidos o inexistentes")
    if metrics["margenDisponible"] <= 0:
        reasons.append("Margen insuficiente")
    if metrics["DTI"] > 0.6:
        reasons.append("DTI alto")
    if metrics["ratioGastos"] > 0.8:
        reasons.append("Gastos demasiado altos para el nivel de ingresos")

    return reasons


def score_metric_dti(dti: float) -> tuple[int, str | None]:
    if dti < 0.3:
        return 2, "DTI saludable"
    if dti <= 0.5:
        return 1, "DTI en rango intermedio"
    return 0, "DTI elevado"


def score_metric_margin(margen: float, ingresos: float) -> tuple[int, str | None]:
    if margen > 0.4 * ingresos:
        return 2, "Margen holgado"
    if margen >= 0.2 * ingresos:
        return 1, "Margen ajustado pero razonable"
    return 0, "Margen bajo"


def score_metric_expense_ratio(ratio_gastos: float) -> tuple[int, str | None]:
    if ratio_gastos < 0.5:
        return 2, "Buena contención de gastos"
    if ratio_gastos <= 0.7:
        return 1, "Gastos en rango medio"
    return 0, "Ratio de gastos alto"


def score_metric_payment_capacity(capacidad_pago: float) -> tuple[int, str | None]:
    if capacidad_pago > 0.3:
        return 2, "Buena capacidad de pago"
    if capacidad_pago >= 0.15:
        return 1, "Capacidad de pago intermedia"
    return 0, "Capacidad de pago baja"


def classify_score(score: int) -> str:
    if score >= 6:
        return "apto"
    if 3 <= score <= 5:
        return "indeciso"
    return "no_apto"


def evaluate_credit(input_data: CreditEvaluationInput) -> dict:
    metrics = calculate_credit_metrics(input_data)
    hard_rejection_reasons = get_hard_rejection_reasons(input_data, metrics)

    if hard_rejection_reasons:
        return {
            "status": "no_apto",
            "score": 0,
            "metrics": metrics,
            "razones": hard_rejection_reasons,
        }

    score = 0
    reasons: list[str] = []

    dti_points, dti_reason = score_metric_dti(metrics["DTI"])
    margin_points, margin_reason = score_metric_margin(
        metrics["margenDisponible"], input_data.ingresos_mensuales
    )
    expense_points, expense_reason = score_metric_expense_ratio(metrics["ratioGastos"])
    payment_points, payment_reason = score_metric_payment_capacity(
        metrics["capacidadPago"]
    )

    score += dti_points + margin_points + expense_points + payment_points

    for reason in (dti_reason, margin_reason, expense_reason, payment_reason):
        if reason:
            reasons.append(reason)

    return {
        "status": classify_score(score),
        "score": score,
        "metrics": metrics,
        "razones": reasons,
    }
