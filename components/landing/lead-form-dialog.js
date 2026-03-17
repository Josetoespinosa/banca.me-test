"use client";

import { useEffect, useEffectEvent, useState } from "react";

import styles from "@/components/landing/landing.module.css";

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  product: "credito-personal",
  notes: "",
};

export function LeadFormDialog({ open, onClose, apiBaseUrl }) {
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleClose = useEffectEvent(() => {
    if (isSubmitting) {
      return;
    }

    setForm(initialForm);
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

  if (!open) {
    return null;
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch(`${apiBaseUrl}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setFeedback({
          type: "warning",
          message:
            payload.detail ||
            "El backend quedó preparado, pero el envío definitivo todavía no está implementado.",
        });
        return;
      }

      setFeedback({
        type: "success",
        message: "Tu lead quedó recibido en el endpoint base de FastAPI.",
      });
      setForm(initialForm);
    } catch {
      setFeedback({
        type: "warning",
        message:
          "No se pudo conectar al backend placeholder. Levanta FastAPI en local para probar el flujo.",
      });
    } finally {
      setIsSubmitting(false);
    }
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
              Empezar tu evaluación
            </h3>

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
              <span className={styles.fieldLabel}>Nombre y apellido</span>
              <input
                className={styles.fieldInput}
                name="fullName"
                onChange={handleChange}
                placeholder="Escribe tu nombre"
                required
                value={form.fullName}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Email</span>
              <input
                className={styles.fieldInput}
                name="email"
                onChange={handleChange}
                placeholder="nombre@correo.com"
                required
                type="email"
                value={form.email}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Teléfono</span>
              <input
                className={styles.fieldInput}
                name="phone"
                onChange={handleChange}
                placeholder="+56 9 1234 5678"
                required
                value={form.phone}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Producto</span>
              <select
                className={styles.fieldSelect}
                name="product"
                onChange={handleChange}
                value={form.product}
              >
                <option value="credito-personal">Crédito personal</option>
              </select>
            </label>

            <label className={`${styles.field} ${styles.fieldWide}`}>
              <span className={styles.fieldLabel}>Cuéntanos tu caso</span>
              <textarea
                className={styles.fieldTextarea}
                name="notes"
                onChange={handleChange}
                placeholder="Monto aproximado, plazo o necesidad principal."
                rows="4"
                value={form.notes}
              />
            </label>
          </div>

          <div className={styles.formActions}>
            <button className={styles.submitButton} disabled={isSubmitting} type="submit">
              {isSubmitting ? "Enviando..." : "Enviar evaluación"}
            </button>
            {/* <p className={styles.helperText}>
              Endpoint configurado: <code>{apiBaseUrl}/api/contact</code>
            </p>  */}
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
