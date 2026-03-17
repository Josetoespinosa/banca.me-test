export type CreditEvaluationInput = {
  ingresosMensuales: number;
  gastosMensuales: number;
  deudasMensuales: number;
  montoSolicitado?: number;
};

export type CreditEvaluationOutput = {
  status: "apto" | "no_apto" | "indeciso";
  score: number;
  metrics: {
    DTI: number;
    margenDisponible: number;
    ratioGastos: number;
    capacidadPago: number;
    cuotaMensual: number;
  };
  razones: string[];
};

function estimateMonthlyInstallment(montoSolicitado?: number): number {
  if (!montoSolicitado) {
    return 0;
  }

  return montoSolicitado * 0.1;
}

function calculateMetrics(input: CreditEvaluationInput) {
  const cuotaMensual = estimateMonthlyInstallment(input.montoSolicitado);
  const deudaTotalMensual = input.deudasMensuales + cuotaMensual;
  const DTI = input.ingresosMensuales > 0 ? deudaTotalMensual / input.ingresosMensuales : 0;
  const margenDisponible =
    input.ingresosMensuales - input.gastosMensuales - input.deudasMensuales;
  const ratioGastos =
    input.ingresosMensuales > 0 ? input.gastosMensuales / input.ingresosMensuales : 0;
  const capacidadPago =
    input.ingresosMensuales > 0 ? margenDisponible / input.ingresosMensuales : 0;

  return {
    DTI,
    margenDisponible,
    ratioGastos,
    capacidadPago,
    cuotaMensual,
  };
}

function getHardRejectionReasons(
  input: CreditEvaluationInput,
  metrics: CreditEvaluationOutput["metrics"]
): string[] {
  const reasons: string[] = [];

  if (input.ingresosMensuales <= 0) reasons.push("Ingresos inválidos o inexistentes");
  if (metrics.margenDisponible <= 0) reasons.push("Margen insuficiente");
  if (metrics.DTI > 0.6) reasons.push("DTI alto");
  if (metrics.ratioGastos > 0.8) reasons.push("Gastos demasiado altos para el nivel de ingresos");

  return reasons;
}

export function evaluateCredit(input: CreditEvaluationInput): CreditEvaluationOutput {
  const metrics = calculateMetrics(input);
  const hardRejectionReasons = getHardRejectionReasons(input, metrics);

  if (hardRejectionReasons.length > 0) {
    return {
      status: "no_apto",
      score: 0,
      metrics,
      razones: hardRejectionReasons,
    };
  }

  let score = 0;
  const razones: string[] = [];

  if (metrics.DTI < 0.3) {
    score += 2;
    razones.push("DTI saludable");
  } else if (metrics.DTI <= 0.5) {
    score += 1;
    razones.push("DTI en rango intermedio");
  } else {
    razones.push("DTI elevado");
  }

  if (metrics.margenDisponible > 0.4 * input.ingresosMensuales) {
    score += 2;
    razones.push("Margen holgado");
  } else if (metrics.margenDisponible >= 0.2 * input.ingresosMensuales) {
    score += 1;
    razones.push("Margen ajustado pero razonable");
  } else {
    razones.push("Margen bajo");
  }

  if (metrics.ratioGastos < 0.5) {
    score += 2;
    razones.push("Buena contención de gastos");
  } else if (metrics.ratioGastos <= 0.7) {
    score += 1;
    razones.push("Gastos en rango medio");
  } else {
    razones.push("Ratio de gastos alto");
  }

  if (metrics.capacidadPago > 0.3) {
    score += 2;
    razones.push("Buena capacidad de pago");
  } else if (metrics.capacidadPago >= 0.15) {
    score += 1;
    razones.push("Capacidad de pago intermedia");
  } else {
    razones.push("Capacidad de pago baja");
  }

  let status: CreditEvaluationOutput["status"] = "no_apto";

  if (score >= 6) {
    status = "apto";
  } else if (score >= 3) {
    status = "indeciso";
  }

  return {
    status,
    score,
    metrics,
    razones,
  };
}
