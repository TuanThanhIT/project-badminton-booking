type ExcelCell = string | number | boolean | null | undefined;

export type ExcelSection = {
  title: string;
  headers: string[];
  rows: ExcelCell[][];
};

const escapeHtml = (value: ExcelCell) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const buildTable = (section: ExcelSection) => `
  <h2>${escapeHtml(section.title)}</h2>
  <table>
    <thead>
      <tr>${section.headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr>
    </thead>
    <tbody>
      ${section.rows
        .map(
          (row) =>
            `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`,
        )
        .join("")}
    </tbody>
  </table>
`;

export const exportExcel = (filename: string, sections: ExcelSection[]) => {
  const html = `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: Arial, sans-serif; }
          h2 { margin: 18px 0 8px; }
          table { border-collapse: collapse; margin-bottom: 18px; }
          th, td { border: 1px solid #d9e2ec; padding: 8px 10px; }
          th { background: #eef4fb; font-weight: 700; }
        </style>
      </head>
      <body>${sections.map(buildTable).join("")}</body>
    </html>
  `;

  const blob = new Blob([html], {
    type: "application/vnd.ms-excel;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".xls") ? filename : `${filename}.xls`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
