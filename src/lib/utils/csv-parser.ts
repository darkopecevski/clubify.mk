import { ParsedRow, playerCsvRowSchema, PlayerCsvRow } from "@/lib/validation/csv-schemas";

export interface ParseCsvResult {
  rows: ParsedRow[];
  totalRows: number;
  validRows: number;
  invalidRows: number;
}

export function parseCsv(csvText: string): ParseCsvResult {
  const lines = csvText.split("\n").filter((line) => line.trim());

  if (lines.length < 2) {
    throw new Error("CSV file must contain a header row and at least one data row");
  }

  const headers = lines[0].split(",").map((h) => h.trim());
  const rows: ParsedRow[] = [];

  // Validate headers
  const requiredHeaders = [
    "first_name", "last_name", "date_of_birth", "gender", "nationality",
    "city", "email_prefix", "position", "dominant_foot",
    "emergency_contact_name", "emergency_contact_phone", "emergency_contact_relationship",
    "parent_first_name", "parent_last_name", "parent_email", "parent_relationship"
  ];

  const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h));
  if (missingHeaders.length > 0) {
    throw new Error(`Missing required headers: ${missingHeaders.join(", ")}`);
  }

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const values = parseCsvLine(line);
    const rowData: Partial<PlayerCsvRow> = {};

    headers.forEach((header, index) => {
      const value = values[index]?.trim() || "";
      if (value && value.toLowerCase() !== "none") {
        (rowData as Record<string, string>)[header] = value;
      }
    });

    // Validate row
    const validation = validateRow(rowData);

    rows.push({
      rowNumber: i,
      data: rowData,
      validation,
    });
  }

  return {
    rows,
    totalRows: rows.length,
    validRows: rows.filter((r) => r.validation.isValid).length,
    invalidRows: rows.filter((r) => !r.validation.isValid).length,
  };
}

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current);
  return values;
}

function validateRow(data: Partial<PlayerCsvRow>) {
  const result = playerCsvRowSchema.safeParse(data);

  if (result.success) {
    return {
      isValid: true,
      errors: [],
    };
  }

  return {
    isValid: false,
    errors: result.error.issues.map((err) => `${err.path.join(".")}: ${err.message}`),
  };
}

export function generateErrorCsv(rows: ParsedRow[]): string {
  const invalidRows = rows.filter((r) => !r.validation.isValid);

  if (invalidRows.length === 0) {
    return "";
  }

  const headers = Object.keys(invalidRows[0].data).concat(["errors"]);
  const csvLines = [headers.join(",")];

  for (const row of invalidRows) {
    const values = headers.slice(0, -1).map((h) => {
      const value = (row.data as Record<string, string>)[h] || "";
      return value.includes(",") ? `"${value}"` : value;
    });
    values.push(`"${row.validation.errors.join("; ")}"`);
    csvLines.push(values.join(","));
  }

  return csvLines.join("\n");
}
