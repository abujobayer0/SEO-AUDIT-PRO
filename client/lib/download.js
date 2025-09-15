import api from "./api";

export async function downloadAuditPdf(auditId, websiteUrl) {
  const safeName = (websiteUrl || "report").replace(/[^a-zA-Z0-9]/g, "-");
  const filename = `seo-audit-${safeName}.pdf`;

  const response = await api.get(`/reports/pdf/${auditId}`, {
    responseType: "blob",
  });

  const blob = new Blob([response.data], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
