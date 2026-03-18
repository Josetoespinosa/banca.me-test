"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { getApiBaseUrl } from "@/lib/api-base-url";
import {
  applicantInitialValues,
  clearFinanceDraft,
  formatRutInput,
  saveApplicantDraft,
  validateApplicantStep,
} from "@/lib/application-flow";
import styles from "@/components/landing/landing.module.css";

export function LeadFormDialog({ open, onClose }) {
  const router = useRouter();
  const [form, setForm] = useState(applicantInitialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleClose = useEffectEvent(() => {
    if (isSubmitting) {
      return;
    }

    setForm(applicantInitialValues);
    setErrors({});
    setFeedback(null);
    onClose();
  });

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, handleClose]);

  useEffect(() => {
    if (feedback?.type !== "warning" || feedback?.mode !== "reset") {
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      setForm(applicantInitialValues);
      setErrors({});
      setFeedback(null);
    }, 2200);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [feedback]);

  if (!open) {
    return null;
  }

  function handleChange(event) {
    const { name, value } = event.target;
    const nextValue =
      name === "rut" || name === "empresaRut" ? formatRutInput(value) : value;

    setForm((current) => ({
      ...current,
      [name]: nextValue,
      ...(name === "tipoCliente" && value === "persona"
        ? {
            empresaNombre: "",
            empresaRut: "",
          }
        : {}),
    }));
    setErrors((current) => ({
      ...current,
      [name]: "",
    }));
    setFeedback(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const { errors: fieldErrors, data } = validateApplicantStep(form);

    if (Object.keys(fieldErrors).length > 0 || !data) {
      setErrors(fieldErrors);
      setFeedback(null);
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    setFeedback(null);

    try {
      const apiBaseUrl = getApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/api/applications/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setFeedback({
          type: "warning",
          mode: "default",
          message: payload.detail || "No pudimos iniciar la solicitud.",
        });
        setIsSubmitting(false);
        return;
      }

      if (payload.identityStatus === "rejected") {
        saveApplicantDraft({
          ...data,
          applicationId: payload.applicationId,
          identityStatus: payload.identityStatus,
        });
        setFeedback({
          type: "warning",
          mode: "reset",
          message: payload.message || "No se pudo reconocer la identidad. Volvemos al inicio.",
        });
        setIsSubmitting(false);
        return;
      }

      clearFinanceDraft();
      saveApplicantDraft({
        ...data,
        applicationId: payload.applicationId,
        identityStatus: payload.identityStatus,
      });
      setForm(applicantInitialValues);
      setErrors({});
      setFeedback(null);
      setIsSubmitting(false);
      onClose();
      router.push("/solicitud/finanzas");
    } catch {
      setFeedback({
        type: "warning",
        mode: "default",
        message: "No pudimos conectar con el backend.",
      });
      setIsSubmitting(false);
    }
  }

  function getFieldClass(hasError) {
    return `${styles.fieldInput} ${hasError ? styles.fieldInputError : ""}`;
  }

  return (
    <div className={styles.modalBackdrop} onClick={handleClose} role="presentation">
      <div
        aria-labelledby="lead-form-title"
        aria-modal="true"
        className={styles.modalCard}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className={styles.modalHeader}>
          <div>
            <p className={styles.sectionEyebrow}>Formulario</p>
            <h3 className={styles.modalTitle} id="lead-form-title">
              Empezar solicitud
            </h3>
            <p className={styles.modalCopy}>
              Completa tus datos básicos para validar identidad y avanzar al
              siguiente paso del MVP.
            </p>
          </div>
          <button
            aria-label="Cerrar formulario"
            className={styles.modalClose}
            onClick={handleClose}
            type="button"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Nombre</span>
              <input
                className={getFieldClass(Boolean(errors.nombre))}
                name="nombre"
                onChange={handleChange}
                placeholder="Escribe tu nombre"
                required
                value={form.nombre}
              />
              {errors.nombre ? (
                <span className={styles.fieldError}>{errors.nombre}</span>
              ) : null}
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Apellido</span>
              <input
                className={getFieldClass(Boolean(errors.apellido))}
                name="apellido"
                onChange={handleChange}
                placeholder="Escribe tu apellido"
                required
                value={form.apellido}
              />
              {errors.apellido ? (
                <span className={styles.fieldError}>{errors.apellido}</span>
              ) : null}
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>RUT</span>
              <input
                className={getFieldClass(Boolean(errors.rut))}
                name="rut"
                onChange={handleChange}
                placeholder="12.345.678-8"
                required
                value={form.rut}
              />
              {errors.rut ? (
                <span className={styles.fieldError}>{errors.rut}</span>
              ) : null}
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Mail</span>
              <input
                className={getFieldClass(Boolean(errors.email))}
                name="email"
                onChange={handleChange}
                placeholder="nombre@correo.com"
                required
                type="email"
                value={form.email}
              />
              {errors.email ? (
                <span className={styles.fieldError}>{errors.email}</span>
              ) : null}
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Tipo de cliente</span>
              <select
                className={`${styles.fieldSelect} ${
                  errors.tipoCliente ? styles.fieldInputError : ""
                }`}
                name="tipoCliente"
                onChange={handleChange}
                value={form.tipoCliente}
              >
                <option value="persona">Persona</option>
                <option value="empresa">Empresa</option>
              </select>
              {errors.tipoCliente ? (
                <span className={styles.fieldError}>{errors.tipoCliente}</span>
              ) : null}
            </label>

            {form.tipoCliente === "empresa" ? (
              <>
                <label className={`${styles.field} ${styles.fieldWide}`}>
                  <span className={styles.fieldLabel}>Nombre de la empresa</span>
                  <input
                    className={getFieldClass(Boolean(errors.empresaNombre))}
                    name="empresaNombre"
                    onChange={handleChange}
                    placeholder="Escribe el nombre de la empresa"
                    required
                    value={form.empresaNombre}
                  />
                  {errors.empresaNombre ? (
                    <span className={styles.fieldError}>{errors.empresaNombre}</span>
                  ) : null}
                </label>

                <label className={`${styles.field} ${styles.fieldWide}`}>
                  <span className={styles.fieldLabel}>RUT de la empresa</span>
                  <input
                    className={getFieldClass(Boolean(errors.empresaRut))}
                    name="empresaRut"
                    onChange={handleChange}
                    placeholder="76.543.210-2"
                    required
                    value={form.empresaRut}
                  />
                  {errors.empresaRut ? (
                    <span className={styles.fieldError}>{errors.empresaRut}</span>
                  ) : null}
                </label>
              </>
            ) : null}
          </div>

          <div className={styles.formActions}>
            <button className={styles.submitButton} disabled={isSubmitting} type="submit">
              {isSubmitting ? "Validando..." : "Siguiente"}
            </button>
          </div>

          {feedback ? (
            <p
              aria-live="polite"
              className={`${styles.feedback} ${
                feedback.type === "success"
                  ? styles.feedbackSuccess
                  : styles.feedbackWarning
              }`}
            >
              {feedback.message}
            </p>
          ) : null}
        </form>
      </div>
    </div>
  );
}
