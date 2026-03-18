function toAscii(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "");
}

function escapePdfText(value) {
  return toAscii(value)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function wrapLine(line, maxLength = 82) {
  const words = String(line).split(/\s+/);
  const lines = [];
  let currentLine = "";

  words.forEach((word) => {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;

    if (nextLine.length <= maxLength) {
      currentLine = nextLine;
      return;
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    currentLine = word;
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

function buildContentLines(contract) {
  const baseLines = [
    "Contrato simple de credito - MVP",
    "",
    `Fecha de emision: ${contract.fechaEmision}`,
    `ID de solicitud: ${contract.applicationId}`,
    "",
    "Datos del solicitante",
    `Nombre: ${contract.nombreCompleto}`,
    `RUT: ${contract.rut}`,
    `Mail: ${contract.email}`,
    `Tipo de cliente: ${contract.tipoCliente}`,
  ];

  if (contract.empresaNombre) {
    baseLines.push(`Empresa: ${contract.empresaNombre}`);
  }

  if (contract.empresaRut) {
    baseLines.push(`RUT empresa: ${contract.empresaRut}`);
  }

  baseLines.push(
    "",
    "Condiciones base del MVP",
    `Monto solicitado: ${contract.montoSolicitado}`,
    `Cuota estimada: ${contract.cuotaMensual}`,
    `Estado de evaluacion: ${contract.status}`,
    `Score: ${contract.score}`,
    "",
    "Declaracion",
    "Este documento fue generado automaticamente en el navegador solo para",
    "demostracion del MVP. No reemplaza un contrato legal ni contiene firma",
    "electronica avanzada.",
    "",
    "Resumen de razones del modelo",
    ...contract.razones.map((reason) => `- ${reason}`),
    "",
    "Firma referencial",
    "______________________________",
    contract.nombreCompleto,
  );

  return baseLines.flatMap((line) => wrapLine(line));
}

function buildPdfDocument(lines) {
  const textCommands = [
    "BT",
    "/F1 18 Tf",
    "50 792 Td",
    "22 TL",
  ];

  lines.forEach((line, index) => {
    if (index === 1) {
      textCommands.push("/F1 12 Tf");
      textCommands.push("18 TL");
    }

    if (index > 0) {
      textCommands.push("T*");
    }

    textCommands.push(`(${escapePdfText(line)}) Tj`);
  });

  textCommands.push("ET");

  const contentStream = textCommands.join("\n");
  const contentLength = new TextEncoder().encode(contentStream).length;
  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj",
    "2 0 obj\n<< /Type /Pages /Count 1 /Kids [3 0 R] >>\nendobj",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj",
    "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj",
    `5 0 obj\n<< /Length ${contentLength} >>\nstream\n${contentStream}\nendstream\nendobj`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object) => {
    offsets.push(new TextEncoder().encode(pdf).length);
    pdf += `${object}\n`;
  });

  const xrefOffset = new TextEncoder().encode(pdf).length;

  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  pdf += `startxref\n${xrefOffset}\n%%EOF`;

  return pdf;
}

export function downloadContractPdf(contract) {
  const lines = buildContentLines(contract);
  const pdfDocument = buildPdfDocument(lines);
  const blob = new Blob([pdfDocument], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `contrato-${toAscii(contract.nombreCompleto)
    .toLowerCase()
    .replace(/\s+/g, "-")}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1500);
}
