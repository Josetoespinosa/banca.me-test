"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import styles from "@/components/admin/admin-dashboard.module.css";
import { getApiBaseUrl } from "@/lib/api-base-url";
const pageSize = 12;

function formatPercent(value) {
  return `${Math.round((value || 0) * 100)}%`;
}

function formatCurrency(value) {
  if (typeof value !== "number") {
    return "-";
  }

  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getBarWidth(value, maxValue) {
  if (!maxValue || value <= 0) {
    return "0%";
  }

  return `${Math.max((value / maxValue) * 100, 6)}%`;
}

function getEvaluationTone(status) {
  if (status === "apto") {
    return "success";
  }

  if (status === "indeciso") {
    return "warning";
  }

  if (status === "no_apto") {
    return "danger";
  }

  return "neutral";
}

function StatusBadge({ children, tone = "neutral" }) {
  return (
    <span className={`${styles.statusBadge} ${styles[`statusBadge${tone}`] || ""}`}>
      {children}
    </span>
  );
}

function DistributionChart({ title, items, tone }) {
  const maxValue = Math.max(...items.map((item) => item.value), 0);

  return (
    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <p className={styles.eyebrow}>Gráfico</p>
          <h2 className={styles.panelTitle}>{title}</h2>
        </div>
      </div>
      <div className={styles.chartList}>
        {items.map((item) => (
          <div className={styles.chartItem} key={item.label}>
            <div className={styles.chartMeta}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
            <div className={styles.chartTrack}>
              <span
                className={`${styles.chartFill} ${styles[`chartFill${tone}`]}`}
                style={{ width: getBarWidth(item.value, maxValue) }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function DataItem({ label, value }) {
  return (
    <div className={styles.detailItem}>
      <span className={styles.detailLabel}>{label}</span>
      <strong>{value || "-"}</strong>
    </div>
  );
}

export function AdminDashboard() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedApplicationId, setExpandedApplicationId] = useState(null);
  const [reviewingId, setReviewingId] = useState(null);
  const [reviewFeedback, setReviewFeedback] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [identityFilter, setIdentityFilter] = useState("all");
  const [evaluationFilter, setEvaluationFilter] = useState("all");
  const [clientTypeFilter, setClientTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const loadOverview = useCallback(async () => {
    const apiBaseUrl = getApiBaseUrl();

    try {
      const response = await fetch(`${apiBaseUrl}/api/admin/overview`, {
        cache: "no-store",
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.detail || "No pudimos cargar el overview del admin.");
      }

      setData(payload);
      setError(null);
    } catch (loadError) {
      setError(loadError.message || "No pudimos cargar el panel.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  useEffect(() => {
    if (!data || !expandedApplicationId) {
      return;
    }

    const stillExists = data.indecisos.some(
      (application) => application.applicationId === expandedApplicationId
    );

    if (!stillExists) {
      setExpandedApplicationId(null);
    }
  }, [data, expandedApplicationId]);

  const kpiCards = useMemo(() => {
    if (!data) {
      return [];
    }

    return [
      {
        label: "Total solicitudes",
        value: data.kpis.totalSolicitudes,
        hint: "Incluye rechazadas por identidad",
      },
      {
        label: "Identidad aprobada",
        value: data.kpis.identidadAprobada,
        hint: formatPercent(data.kpis.tasaIdentidadAprobada),
      },
      {
        label: "Identidad rechazada",
        value: data.kpis.identidadRechazada,
        hint: formatPercent(data.kpis.tasaIdentidadRechazada),
      },
      {
        label: "Aptas",
        value: data.kpis.aptas,
        hint: formatPercent(data.kpis.tasaAptas),
      },
      {
        label: "No aptas",
        value: data.kpis.noAptas,
        hint: formatPercent(data.kpis.tasaNoAptas),
      },
      {
        label: "Indecisas",
        value: data.kpis.indecisas,
        hint: formatPercent(data.kpis.tasaIndecisas),
      },
    ];
  }, [data]);

  const filteredApplications = useMemo(() => {
    if (!data) {
      return [];
    }

    const normalizedSearch = searchTerm.trim().toLowerCase();

    return data.applications.filter((application) => {
      const matchesSearch =
        !normalizedSearch ||
        [
          application.applicationId,
          application.nombreCompleto,
          application.rut,
          application.email,
          application.empresaNombre,
          application.empresaRut,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedSearch));

      const matchesIdentity =
        identityFilter === "all" || application.identityStatus === identityFilter;

      const currentEvaluationStatus = application.evaluationStatus || "pendiente";
      const matchesEvaluation =
        evaluationFilter === "all" || currentEvaluationStatus === evaluationFilter;

      const matchesClientType =
        clientTypeFilter === "all" || application.tipoCliente === clientTypeFilter;

      return matchesSearch && matchesIdentity && matchesEvaluation && matchesClientType;
    });
  }, [clientTypeFilter, data, evaluationFilter, identityFilter, searchTerm]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredApplications.length / pageSize));
  }, [filteredApplications.length]);

  const paginatedApplications = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredApplications.slice(startIndex, startIndex + pageSize);
  }, [currentPage, filteredApplications]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, identityFilter, evaluationFilter, clientTypeFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  async function handleManualReview(applicationId, decision) {
    const apiBaseUrl = getApiBaseUrl();

    setReviewingId(applicationId);
    setReviewFeedback(null);

    try {
      const response = await fetch(`${apiBaseUrl}/api/admin/applications/${applicationId}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ decision }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.detail || "No pudimos actualizar la solicitud.");
      }

      setReviewFeedback({
        type: "success",
        message: payload.message || "La solicitud fue actualizada manualmente.",
      });
      await loadOverview();
    } catch (reviewError) {
      setReviewFeedback({
        type: "error",
        message: reviewError.message || "No pudimos actualizar la solicitud.",
      });
    } finally {
      setReviewingId(null);
    }
  }

  return (
    <section className={styles.pageSection}>
      <div className={styles.pageShell}>
        <div className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>Admin</p>
            <h1 className={styles.pageTitle}>Panel de originación</h1>
            <p className={styles.pageText}>
              Vista operativa de solicitudes, identidad, evaluación financiera,
              indecisos y señales iniciales del funnel.
            </p>
          </div>
          <div className={styles.heroCard}>
            <span className={styles.heroLabel}>Estado del panel</span>
            <strong>{isLoading ? "Cargando" : error ? "Con incidencias" : "Operativo"}</strong>
          </div>
        </div>

        {isLoading ? (
          <div className={styles.emptyState}>
            <h2 className={styles.panelTitle}>Cargando datos</h2>
            <p className={styles.pageText}>
              Consultando solicitudes, métricas y distribución del pipeline.
            </p>
          </div>
        ) : null}

        {error ? (
          <div className={styles.errorState}>
            <h2 className={styles.panelTitle}>No pudimos cargar el panel</h2>
            <p className={styles.pageText}>{error}</p>
          </div>
        ) : null}

        {!isLoading && !error && data ? (
          <>
            <div className={styles.kpiGrid}>
              {kpiCards.map((card) => (
                <article className={styles.kpiCard} key={card.label}>
                  <span className={styles.kpiLabel}>{card.label}</span>
                  <strong className={styles.kpiValue}>{card.value}</strong>
                  <span className={styles.kpiHint}>{card.hint}</span>
                </article>
              ))}
            </div>

            <div className={styles.analyticsGrid}>
              <DistributionChart
                items={data.charts.identityDistribution}
                title="Distribución de identidad"
                tone="Violet"
              />
              <DistributionChart
                items={data.charts.evaluationDistribution}
                title="Distribución de evaluación"
                tone="Lime"
              />
            </div>

            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <p className={styles.eyebrow}>Análisis</p>
                  <h2 className={styles.panelTitle}>Observaciones automáticas</h2>
                </div>
              </div>
              <div className={styles.observationList}>
                {data.observations.length > 0 ? (
                  data.observations.map((observation) => (
                    <article className={styles.observationItem} key={observation}>
                      <span className={styles.observationDot} />
                      <p>{observation}</p>
                    </article>
                  ))
                ) : (
                  <p className={styles.pageText}>
                    Aún no hay suficientes datos para emitir observaciones.
                  </p>
                )}
              </div>
            </section>

            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <p className={styles.eyebrow}>Revisión manual</p>
                  <h2 className={styles.panelTitle}>Solicitudes indecisas</h2>
                </div>
                <StatusBadge tone="warning">{data.indecisos.length} casos</StatusBadge>
              </div>

              {reviewFeedback ? (
                <div
                  className={
                    reviewFeedback.type === "error"
                      ? styles.feedbackError
                      : styles.feedbackSuccess
                  }
                >
                  {reviewFeedback.message}
                </div>
              ) : null}

              {data.indecisos.length > 0 ? (
                <div className={styles.indecisosGrid}>
                  {data.indecisos.map((application) => {
                    const isExpanded = expandedApplicationId === application.applicationId;
                    const isReviewing = reviewingId === application.applicationId;

                    return (
                      <article
                        className={`${styles.indecisoCard} ${
                          isExpanded ? styles.indecisoCardExpanded : ""
                        }`}
                        key={application.applicationId}
                      >
                        <button
                          className={styles.indecisoTrigger}
                          onClick={() =>
                            setExpandedApplicationId((current) =>
                              current === application.applicationId
                                ? null
                                : application.applicationId
                            )
                          }
                          type="button"
                        >
                          <div className={styles.indecisoTop}>
                            <div>
                              <strong>{application.nombreCompleto}</strong>
                              <p>{application.applicationId}</p>
                            </div>
                            <StatusBadge tone="warning">Indeciso</StatusBadge>
                          </div>
                          <div className={styles.indecisoMeta}>
                            <span>Score: {application.evaluationScore ?? "-"}</span>
                            <span>Monto: {formatCurrency(application.montoSolicitado)}</span>
                          </div>
                          <ul className={styles.reasonList}>
                            {application.razones.map((reason) => (
                              <li key={reason}>{reason}</li>
                            ))}
                          </ul>
                          <span className={styles.expandHint}>
                            {isExpanded ? "Ocultar detalle" : "Ver detalle completo"}
                          </span>
                        </button>

                        {isExpanded ? (
                          <div className={styles.indecisoDetail}>
                            <div className={styles.detailGrid}>
                              <DataItem label="Nombre" value={application.nombreCompleto} />
                              <DataItem label="RUT" value={application.rut} />
                              <DataItem label="Mail" value={application.email} />
                              <DataItem
                                label="Tipo de cliente"
                                value={application.tipoCliente}
                              />
                              <DataItem
                                label="Empresa"
                                value={application.empresaNombre || "Sin empresa"}
                              />
                              <DataItem
                                label="RUT empresa"
                                value={application.empresaRut || "Sin empresa"}
                              />
                              <DataItem
                                label="Identidad"
                                value={application.identityMessage}
                              />
                              <DataItem
                                label="Creada"
                                value={formatDate(application.createdAt)}
                              />
                              <DataItem
                                label="Ingresos"
                                value={formatCurrency(application.ingresosMensuales)}
                              />
                              <DataItem
                                label="Gastos"
                                value={formatCurrency(application.gastosMensuales)}
                              />
                              <DataItem
                                label="Deudas"
                                value={formatCurrency(application.deudasMensuales)}
                              />
                              <DataItem
                                label="Monto solicitado"
                                value={formatCurrency(application.montoSolicitado)}
                              />
                            </div>

                            {application.metrics ? (
                              <div className={styles.metricsGrid}>
                                <DataItem
                                  label="DTI"
                                  value={application.metrics.DTI?.toFixed(2)}
                                />
                                <DataItem
                                  label="Margen disponible"
                                  value={formatCurrency(
                                    application.metrics.margenDisponible
                                  )}
                                />
                                <DataItem
                                  label="Ratio gastos"
                                  value={application.metrics.ratioGastos?.toFixed(2)}
                                />
                                <DataItem
                                  label="Capacidad de pago"
                                  value={application.metrics.capacidadPago?.toFixed(2)}
                                />
                                <DataItem
                                  label="Cuota mensual"
                                  value={formatCurrency(application.metrics.cuotaMensual)}
                                />
                              </div>
                            ) : null}

                            <div className={styles.actionRow}>
                              <button
                                className={styles.approveButton}
                                disabled={isReviewing}
                                onClick={() =>
                                  handleManualReview(application.applicationId, "apto")
                                }
                                type="button"
                              >
                                {isReviewing ? "Procesando..." : "Aceptar solicitud"}
                              </button>
                              <button
                                className={styles.rejectButton}
                                disabled={isReviewing}
                                onClick={() =>
                                  handleManualReview(application.applicationId, "no_apto")
                                }
                                type="button"
                              >
                                {isReviewing ? "Procesando..." : "Rechazar solicitud"}
                              </button>
                            </div>
                          </div>
                        ) : null}
                      </article>
                    );
                  })}
                </div>
              ) : (
                <p className={styles.pageText}>
                  No hay solicitudes indecisas pendientes de revisión manual.
                </p>
              )}
            </section>

            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <p className={styles.eyebrow}>Solicitudes</p>
                  <h2 className={styles.panelTitle}>Historial completo</h2>
                </div>
                <StatusBadge>{filteredApplications.length} resultados</StatusBadge>
              </div>

              <div className={styles.filterBar}>
                <label className={styles.filterField}>
                  <span className={styles.filterLabel}>Buscar</span>
                  <input
                    className={styles.filterInput}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Nombre, RUT, mail, ID..."
                    value={searchTerm}
                  />
                </label>

                <label className={styles.filterField}>
                  <span className={styles.filterLabel}>Identidad</span>
                  <select
                    className={styles.filterInput}
                    onChange={(event) => setIdentityFilter(event.target.value)}
                    value={identityFilter}
                  >
                    <option value="all">Todas</option>
                    <option value="approved">Aprobada</option>
                    <option value="rejected">Rechazada</option>
                  </select>
                </label>

                <label className={styles.filterField}>
                  <span className={styles.filterLabel}>Evaluación</span>
                  <select
                    className={styles.filterInput}
                    onChange={(event) => setEvaluationFilter(event.target.value)}
                    value={evaluationFilter}
                  >
                    <option value="all">Todas</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="apto">Apto</option>
                    <option value="indeciso">Indeciso</option>
                    <option value="no_apto">No apto</option>
                  </select>
                </label>

                <label className={styles.filterField}>
                  <span className={styles.filterLabel}>Tipo</span>
                  <select
                    className={styles.filterInput}
                    onChange={(event) => setClientTypeFilter(event.target.value)}
                    value={clientTypeFilter}
                  >
                    <option value="all">Todos</option>
                    <option value="persona">Persona</option>
                    <option value="empresa">Empresa</option>
                  </select>
                </label>
              </div>

              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Solicitud</th>
                      <th>Cliente</th>
                      <th>Tipo</th>
                      <th>Identidad</th>
                      <th>Evaluación</th>
                      <th>Monto</th>
                      <th>Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedApplications.length > 0 ? (
                      paginatedApplications.map((application) => (
                        <tr key={application.applicationId}>
                          <td>
                            <strong>{application.applicationId}</strong>
                            <span>{formatDate(application.createdAt)}</span>
                          </td>
                          <td>
                            <strong>{application.nombreCompleto}</strong>
                            <span>{application.rut}</span>
                          </td>
                          <td>
                            <strong>{application.tipoCliente}</strong>
                            <span>{application.empresaNombre || "Sin empresa"}</span>
                          </td>
                          <td>
                            <StatusBadge
                              tone={
                                application.identityStatus === "approved"
                                  ? "success"
                                  : "danger"
                              }
                            >
                              {application.identityStatus}
                            </StatusBadge>
                            <span>{application.identityMessage}</span>
                          </td>
                          <td>
                            {application.evaluationStatus ? (
                              <>
                                <StatusBadge
                                  tone={getEvaluationTone(application.evaluationStatus)}
                                >
                                  {application.evaluationStatus}
                                </StatusBadge>
                                {application.manualDecision ? (
                                  <span>
                                    Resuelta manualmente el{" "}
                                    {formatDate(application.manualReviewedAt)}
                                  </span>
                                ) : null}
                              </>
                            ) : (
                              <StatusBadge>pendiente</StatusBadge>
                            )}
                          </td>
                          <td>{formatCurrency(application.montoSolicitado)}</td>
                          <td>{application.evaluationScore ?? "-"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className={styles.noResultsCell} colSpan={7}>
                          No hay resultados para los filtros aplicados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {filteredApplications.length > 0 ? (
                <div className={styles.pagination}>
                  <span className={styles.paginationInfo}>
                    Página {currentPage} de {totalPages}
                  </span>
                  <div className={styles.paginationActions}>
                    <button
                      className={styles.pageButton}
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                      type="button"
                    >
                      Anterior
                    </button>
                    <button
                      className={styles.pageButton}
                      disabled={currentPage === totalPages}
                      onClick={() =>
                        setCurrentPage((page) => Math.min(totalPages, page + 1))
                      }
                      type="button"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              ) : null}
            </section>
          </>
        ) : null}
      </div>
    </section>
  );
}
