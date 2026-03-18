export const applicantDraftKey = "bancame-applicant-draft";
export const financeDraftKey = "bancame-finance-draft";

export const applicantInitialValues = {
  nombre: "",
  apellido: "",
  rut: "",
  email: "",
  tipoCliente: "persona",
  empresaNombre: "",
  empresaRut: "",
};

export const financeInitialValues = {
  ingresos: "",
  gastos: "",
  deudas: "",
  montoSolicitado: "",
};

const rutPattern = /^\d{1,2}\.\d{3}\.\d{3}-\d$/;

function sanitizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function isEmailValid(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function parseAmount(value) {
  if (value === "") {
    return null;
  }

  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? amount : null;
}

export function isRutFormatValid(rut) {
  return rutPattern.test(sanitizeText(rut));
}

export function formatRutInput(value) {
  const digits = String(value ?? "")
    .replace(/\D/g, "")
    .slice(0, 9);

  if (!digits) {
    return "";
  }

  if (digits.length === 1) {
    return digits;
  }

  const verifier = digits.slice(-1);
  const body = digits.slice(0, -1);
  const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return `${formattedBody}-${verifier}`;
}

export function isRutApproved(rut) {
  const lastDigit = Number(sanitizeText(rut).slice(-1));
  return Number.isInteger(lastDigit) && lastDigit % 2 === 0;
}

export function validateApplicantStep(values) {
  const errors = {};

  const data = {
    nombre: sanitizeText(values.nombre),
    apellido: sanitizeText(values.apellido),
    rut: sanitizeText(values.rut),
    email: sanitizeText(values.email).toLowerCase(),
    tipoCliente: sanitizeText(values.tipoCliente) || "persona",
    empresaNombre: sanitizeText(values.empresaNombre),
    empresaRut: sanitizeText(values.empresaRut),
  };

  if (!data.nombre) {
    errors.nombre = "Ingresa tu nombre";
  }

  if (!data.apellido) {
    errors.apellido = "Ingresa tu apellido";
  }

  if (!data.rut) {
    errors.rut = "Ingresa tu RUT";
  } else if (!isRutFormatValid(data.rut)) {
    errors.rut = "Usa el formato xx.xxx.xxx-y";
  }

  if (!data.email) {
    errors.email = "Ingresa tu mail";
  } else if (!isEmailValid(data.email)) {
    errors.email = "Ingresa un mail válido";
  }

  if (!data.tipoCliente) {
    errors.tipoCliente = "Selecciona el tipo de cliente";
  }

  if (data.tipoCliente === "empresa") {
    if (!data.empresaNombre) {
      errors.empresaNombre = "Ingresa el nombre de la empresa";
    }

    if (!data.empresaRut) {
      errors.empresaRut = "Ingresa el RUT de la empresa";
    } else if (!isRutFormatValid(data.empresaRut)) {
      errors.empresaRut = "Usa el formato xx.xxx.xxx-y";
    }
  }

  return {
    data,
    errors,
  };
}

export function validateFinancialStep(values) {
  const errors = {};

  const data = {
    ingresos: parseAmount(values.ingresos),
    gastos: parseAmount(values.gastos),
    deudas: parseAmount(values.deudas),
    montoSolicitado: parseAmount(values.montoSolicitado),
  };

  if (data.ingresos === null) {
    errors.ingresos = "Ingresa un monto válido";
  }

  if (data.gastos === null) {
    errors.gastos = "Ingresa un monto válido";
  }

  if (data.deudas === null) {
    errors.deudas = "Ingresa un monto válido";
  }

  if (data.montoSolicitado === null) {
    errors.montoSolicitado = "Ingresa un monto válido";
  }

  return {
    data,
    errors,
  };
}

export function saveApplicantDraft(data) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(applicantDraftKey, JSON.stringify(data));
}

export function getApplicantDraft() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.sessionStorage.getItem(applicantDraftKey);
  return raw ? JSON.parse(raw) : null;
}

export function clearApplicantDraft() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(applicantDraftKey);
}

export function saveFinanceDraft(data) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(financeDraftKey, JSON.stringify(data));
}

export function getFinanceDraft() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.sessionStorage.getItem(financeDraftKey);
  return raw ? JSON.parse(raw) : null;
}

export function clearFinanceDraft() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(financeDraftKey);
}
