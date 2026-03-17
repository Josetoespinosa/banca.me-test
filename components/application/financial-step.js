"use client";

import { useEffect, useMemo, useState } from "react";

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

  useEffect(() => {
    const applicantDraft = getApplicantDraft();
    const financeDraft = getFinanceDraft();

    setApplicant(applicantDraft);
    if (financeDraft) {
      setForm({
        ingresos: String(financeDraft.ingresos ?? ""),
        gastos: String(financeDraft.gastos ?? ""),
        deudas: String(financeDraft.deudas ?? ""),
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
  }

  function handleSubmit(event) {
    event.preventDefault();

    const { data, errors: fieldErrors } = validateFinancialStep(form);

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      setFeedback(null);
      return;
    }

    saveFinanceDraft(data);
    setErrors({});
    setFeedback({
      type: "success",
      message:
        "Tus datos financieros quedaron guardados para el siguiente paso del MVP.",
    });
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
                <button className={styles.primaryAction} type="submit">
                  Guardar datos
                </button>
                <a className={styles.secondaryAction} href="/">
                  Volver a la landing
                </a>
              </div>

              {feedback ? (
                <p className={`${styles.statusMessage} ${styles.statusSuccess}`}>
                  {feedback.message}
                </p>
              ) : null}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
