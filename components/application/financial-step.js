"use client";

import { useEffect, useMemo, useState } from "react";

import { getApiBaseUrl } from "@/lib/api-base-url";
import { downloadContractPdf } from "@/lib/contract-pdf";
import {
  financeInitialValues,
  getApplicantDraft,
  getFinanceDraft,
  saveFinanceDraft,
  validateFinancialStep,
} from "@/lib/application-flow";
import styles from "@/components/application/application-flow.module.css";

function formatCurrency(value) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function FinancialStep() {
  const [isReady, setIsReady] = useState(false);
  const [applicant, setApplicant] = useState(null);
  const [form, setForm] = useState(financeInitialValues);
  const [errors, setErrors] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloadingContract, setIsDownloadingContract] = useState(false);

  useEffect(() => {
    const applicantDraft = getApplicantDraft();
    const financeDraft = getFinanceDraft();

    setApplicant(applicantDraft);
    if (financeDraft) {
      setForm({
        ingresos: String(financeDraft.ingresos ?? ""),
        gastos: String(financeDraft.gastos ?? ""),
        deudas: String(financeDraft.deudas ?? ""),
        montoSolicitado: String(financeDraft.montoSolicitado ?? ""),
      });
    }
    setIsReady(true);
  }, []);

  const totalCompromisos = useMemo(() => {
    const gastos = Number(form.gastos || 0);
    const deudas = Number(form.deudas || 0);
    return gastos + deudas;
  }, [form.deudas, form.gastos]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
    setErrors((current) => ({
      ...current,
      [name]: "",
    }));
    setFeedback(null);
    setEvaluation(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const { data, errors: fieldErrors } = validateFinancialStep(form);

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      setFeedback(null);
      return;
    }

    if (!applicant.applicationId) {
      setFeedback({
        type: "error",
        message: "No encontramos el identificador de la solicitud.",
      });
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    setFeedback(null);
    setEvaluation(null);

    try {
      const apiBaseUrl = getApiBaseUrl();
      const payload = {
        ingresosMensuales: data.ingresos,
        gastosMensuales: data.gastos,
        deudasMensuales: data.deudas,
        montoSolicitado: data.montoSolicitado,
      };

      const response = await fetch(
        `${apiBaseUrl}/api/applications/${applicant.applicationId}/evaluate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const responsePayload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setFeedback({
          type: "error",
          message: responsePayload.detail || "No pudimos evaluar la solicitud.",
        });
        setIsSubmitting(false);
        return;
      }

      saveFinanceDraft(data);
      setEvaluation(responsePayload);
      setFeedback({
        type: "success",
        message: "La solicitud fue enviada y evaluada correctamente.",
      });
    } catch {
      setFeedback({
        type: "error",
        message: "No pudimos conectar con el backend para evaluar la solicitud.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDownloadContract() {
    if (!evaluation || evaluation.status !== "apto" || !applicant) {
      return;
    }

    setIsDownloadingContract(true);

    try {
      downloadContractPdf({
        applicationId: applicant.applicationId,
        fechaEmision: new Intl.DateTimeFormat("es-CL", {
          dateStyle: "full",
          timeStyle: "short",
        }).format(new Date()),
        nombreCompleto: `${applicant.nombre} ${applicant.apellido}`,
        rut: applicant.rut,
        email: applicant.email,
        tipoCliente: applicant.tipoCliente === "empresa" ? "Empresa" : "Persona",
        empresaNombre: applicant.empresaNombre,
        empresaRut: applicant.empresaRut,
        montoSolicitado: formatCurrency(Number(form.montoSolicitado || 0)),
        cuotaMensual: formatCurrency(evaluation.metrics.cuotaMensual),
        status: evaluation.status,
        score: evaluation.score,
        razones: evaluation.razones,
      });
    } finally {
      setIsDownloadingContract(false);
    }
  }

  if (!isReady) {
    return null;
  }

  if (!applicant) {
    return (
      <section className={styles.pageSection}>
        <div className={styles.pageShell}>
          <div className={styles.emptyState}>
            <p className={styles.pageEyebrow}>Solicitud</p>
            <h1 className={styles.pageTitle}>No encontramos tu paso anterior</h1>
            <p className={styles.pageText}>
              Vuelve al inicio y completa primero la validación de identidad para
              continuar.
            </p>
            <a className={styles.primaryAction} href="/">
              Volver al inicio
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.pageSection}>
      <div className={styles.pageShell}>
        <div className={styles.pageGrid}>
          <div className={styles.introBlock}>
            <p className={styles.pageEyebrow}>Siguiente paso</p>
            <h1 className={styles.pageTitle}>Completa tu información financiera</h1>
            <p className={styles.pageText}>
              Tu identidad ya fue reconocida. Ahora necesitamos tus ingresos, gastos
              y deudas para seguir armando el flujo.
            </p>

            <div className={styles.summaryCard}>
              <h2 className={styles.summaryTitle}>Resumen del solicitante</h2>
              <div className={styles.summaryGrid}>
                <div>
                  <span className={styles.summaryLabel}>Nombre</span>
                  <strong>{`${applicant.nombre} ${applicant.apellido}`}</strong>
                </div>
                <div>
                  <span className={styles.summaryLabel}>RUT</span>
                  <strong>{applicant.rut}</strong>
                </div>
                <div>
                  <span className={styles.summaryLabel}>Mail</span>
                  <strong>{applicant.email}</strong>
                </div>
                <div>
                  <span className={styles.summaryLabel}>Tipo de cliente</span>
                  <strong>{applicant.tipoCliente === "empresa" ? "Empresa" : "Persona"}</strong>
                </div>
                {applicant.tipoCliente === "empresa" ? (
                  <>
                    <div>
                      <span className={styles.summaryLabel}>Empresa</span>
                      <strong>{applicant.empresaNombre}</strong>
                    </div>
                    <div>
                      <span className={styles.summaryLabel}>RUT empresa</span>
                      <strong>{applicant.empresaRut}</strong>
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          <div className={styles.formCard}>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGrid}>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Monto a solicitar</span>
                  <input
                    className={`${styles.fieldInput} ${
                      errors.montoSolicitado ? styles.fieldInputError : ""
                    }`}
                    min="0"
                    name="montoSolicitado"
                    onChange={handleChange}
                    placeholder="2500000"
                    type="number"
                    value={form.montoSolicitado}
                  />
                  {errors.montoSolicitado ? (
                    <span className={styles.fieldError}>{errors.montoSolicitado}</span>
                  ) : null}
                </label>

                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Ingresos</span>
                  <input
                    className={`${styles.fieldInput} ${
                      errors.ingresos ? styles.fieldInputError : ""
                    }`}
                    min="0"
                    name="ingresos"
                    onChange={handleChange}
                    placeholder="1200000"
                    type="number"
                    value={form.ingresos}
                  />
                  {errors.ingresos ? (
                    <span className={styles.fieldError}>{errors.ingresos}</span>
                  ) : null}
                </label>

                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Gastos</span>
                  <input
                    className={`${styles.fieldInput} ${
                      errors.gastos ? styles.fieldInputError : ""
                    }`}
                    min="0"
                    name="gastos"
                    onChange={handleChange}
                    placeholder="450000"
                    type="number"
                    value={form.gastos}
                  />
                  {errors.gastos ? (
                    <span className={styles.fieldError}>{errors.gastos}</span>
                  ) : null}
                </label>

                <label className={`${styles.field} ${styles.fieldWide}`}>
                  <span className={styles.fieldLabel}>Deudas</span>
                  <input
                    className={`${styles.fieldInput} ${
                      errors.deudas ? styles.fieldInputError : ""
                    }`}
                    min="0"
                    name="deudas"
                    onChange={handleChange}
                    placeholder="150000"
                    type="number"
                    value={form.deudas}
                  />
                  {errors.deudas ? (
                    <span className={styles.fieldError}>{errors.deudas}</span>
                  ) : null}
                </label>
              </div>

              <div className={styles.infoStrip}>
                <span className={styles.summaryLabel}>Compromisos actuales</span>
                <strong>{formatCurrency(totalCompromisos)}</strong>
              </div>

              <div className={styles.formActions}>
                <button className={styles.primaryAction} disabled={isSubmitting} type="submit">
                  {isSubmitting ? "Evaluando..." : "Evaluar solicitud"}
                </button>
                <a className={styles.secondaryAction} href="/">
                  Volver a la landing
                </a>
              </div>

              {feedback ? (
                <p
                  className={`${styles.statusMessage} ${
                    feedback.type === "error" ? styles.statusError : styles.statusSuccess
                  }`}
                >
                  {feedback.message}
                </p>
              ) : null}

              {evaluation ? (
                <div className={styles.resultCard}>
                  <div className={styles.resultTop}>
                    <div>
                      <span className={styles.summaryLabel}>Resultado del modelo</span>
                      <h3 className={styles.resultTitle}>{evaluation.status}</h3>
                    </div>
                    <div className={styles.scoreBadge}>
                      <span className={styles.summaryLabel}>Score</span>
                      <strong>{evaluation.score}</strong>
                    </div>
                  </div>

                  <div className={styles.metricsGrid}>
                    <div>
                      <span className={styles.summaryLabel}>DTI</span>
                      <strong>{evaluation.metrics.DTI}</strong>
                    </div>
                    <div>
                      <span className={styles.summaryLabel}>Margen</span>
                      <strong>{formatCurrency(evaluation.metrics.margenDisponible)}</strong>
                    </div>
                    <div>
                      <span className={styles.summaryLabel}>Ratio gastos</span>
                      <strong>{evaluation.metrics.ratioGastos}</strong>
                    </div>
                    <div>
                      <span className={styles.summaryLabel}>Capacidad de pago</span>
                      <strong>{evaluation.metrics.capacidadPago}</strong>
                    </div>
                    <div>
                      <span className={styles.summaryLabel}>Cuota estimada</span>
                      <strong>{formatCurrency(evaluation.metrics.cuotaMensual)}</strong>
                    </div>
                  </div>

                  <div className={styles.reasonBlock}>
                    <span className={styles.summaryLabel}>Razones</span>
                    <ul className={styles.reasonList}>
                      {evaluation.razones.map((reason) => (
                        <li key={reason}>{reason}</li>
                      ))}
                    </ul>
                  </div>

                  {evaluation.status === "apto" ? (
                    <div className={styles.formActions}>
                      <button
                        className={styles.secondaryAction}
                        disabled={isDownloadingContract}
                        onClick={handleDownloadContract}
                        type="button"
                      >
                        {isDownloadingContract
                          ? "Generando contrato..."
                          : "Descargar contrato PDF"}
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
