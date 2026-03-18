const apiBaseUrl = process.env.API_BASE_URL || "http://localhost:8000";
const totalRequests = Number(process.env.COUNT || 25);
const concurrency = Math.max(1, Number(process.env.CONCURRENCY || 5));

function formatRutFromDigits(digits) {
  const cleanDigits = String(digits).replace(/\D/g, "").slice(0, 9);
  const verifier = cleanDigits.slice(-1);
  const body = cleanDigits.slice(0, -1);
  const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${formattedBody}-${verifier}`;
}

function buildApplicant(index) {
  const identityPasses = index % 3 !== 0;
  const verifier = identityPasses ? 8 : 7;
  const body = String(21046360 + index).padStart(8, "0");

  return {
    nombre: `Tester${index}`,
    apellido: `Carga${index}`,
    rut: formatRutFromDigits(`${body}${verifier}`),
    email: `tester${index}@bancame-mvp.cl`,
    tipoCliente: index % 5 === 0 ? "empresa" : "persona",
    empresaNombre: index % 5 === 0 ? `Empresa Test ${index}` : "",
    empresaRut: index % 5 === 0 ? formatRutFromDigits(`${88000000 + index}8`) : "",
  };
}

function buildFinancialData(index) {
  const baseIncome = 900000 + index * 25000;

  if (index % 4 === 0) {
    return {
      ingresosMensuales: baseIncome,
      gastosMensuales: 420000,
      deudasMensuales: 120000,
      montoSolicitado: 1200000,
    };
  }

  if (index % 4 === 1) {
    return {
      ingresosMensuales: baseIncome,
      gastosMensuales: 580000,
      deudasMensuales: 190000,
      montoSolicitado: 1700000,
    };
  }

  if (index % 4 === 2) {
    return {
      ingresosMensuales: baseIncome,
      gastosMensuales: 760000,
      deudasMensuales: 250000,
      montoSolicitado: 2600000,
    };
  }

  return {
    ingresosMensuales: baseIncome,
    gastosMensuales: 980000,
    deudasMensuales: 330000,
    montoSolicitado: 3400000,
  };
}

async function createAndEvaluate(index) {
  const applicant = buildApplicant(index);
  const startResponse = await fetch(`${apiBaseUrl}/api/applications/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(applicant),
  });

  const startPayload = await startResponse.json().catch(() => ({}));

  if (!startResponse.ok) {
    throw new Error(startPayload.detail || `Fallo en start para solicitud ${index}`);
  }

  if (startPayload.identityStatus !== "approved") {
    return {
      phase: "identity",
      identityStatus: startPayload.identityStatus,
      evaluationStatus: null,
    };
  }

  const financialData = buildFinancialData(index);
  const evaluateResponse = await fetch(
    `${apiBaseUrl}/api/applications/${startPayload.applicationId}/evaluate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(financialData),
    }
  );

  const evaluatePayload = await evaluateResponse.json().catch(() => ({}));

  if (!evaluateResponse.ok) {
    throw new Error(
      evaluatePayload.detail || `Fallo en evaluate para solicitud ${startPayload.applicationId}`
    );
  }

  return {
    phase: "evaluation",
    identityStatus: startPayload.identityStatus,
    evaluationStatus: evaluatePayload.status,
  };
}

async function runBatch(batchIndexes) {
  return Promise.all(
    batchIndexes.map(async (index) => {
      try {
        return await createAndEvaluate(index);
      } catch (error) {
        return {
          phase: "error",
          identityStatus: null,
          evaluationStatus: null,
          error: error.message,
        };
      }
    })
  );
}

async function main() {
  const indexes = Array.from({ length: totalRequests }, (_, index) => index + 1);
  const results = [];

  for (let current = 0; current < indexes.length; current += concurrency) {
    const batch = indexes.slice(current, current + concurrency);
    const batchResults = await runBatch(batch);
    results.push(...batchResults);
    process.stdout.write(
      `Procesadas ${Math.min(current + concurrency, totalRequests)}/${totalRequests}\n`
    );
  }

  const summary = {
    total: results.length,
    errores: results.filter((result) => result.phase === "error").length,
    identidadAprobada: results.filter((result) => result.identityStatus === "approved").length,
    identidadRechazada: results.filter((result) => result.identityStatus === "rejected").length,
    apto: results.filter((result) => result.evaluationStatus === "apto").length,
    indeciso: results.filter((result) => result.evaluationStatus === "indeciso").length,
    noApto: results.filter((result) => result.evaluationStatus === "no_apto").length,
  };

  console.log("\nResumen de carga");
  console.table(summary);

  const errors = results.filter((result) => result.error);
  if (errors.length > 0) {
    console.log("\nErrores detectados");
    console.table(errors);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
