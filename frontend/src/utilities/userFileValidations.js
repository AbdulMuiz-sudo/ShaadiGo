const MAX_FILE_SIZE_MB    = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_MIME_TYPES  = ["text/csv", "application/vnd.ms-excel", "text/plain"];
const ALLOWED_EXTENSIONS  = [".csv"];

// Every one of these must be present (matched as substring, case-insensitive)
const REQUIRED_COLUMNS = ["description", "debit", "credit", "balance"];

// Friendly aliases for each required column — any one alias satisfies it
const COLUMN_ALIASES = {
  description: ["description", "desc", "narration", "particulars", "details", "memo", "merchant"],
  debit:       ["debit", "dr", "withdrawal", "withdrawals", "amount"],
  credit:      ["credit", "cr", "deposit", "deposits"],
  balance:     ["balance", "available balance", "running balance", "closing balance"],
};

/**
 * Step 1 — validate the File object before parsing.
 * @param {File} file
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateFile(file) {
  if (!file) {
    return { valid: false, error: "No file provided." };
  }

  const fileName  = file.name || "";
  const extension = fileName.slice(fileName.lastIndexOf(".")).toLowerCase();

  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: `Invalid file type "${extension}". Please upload a .csv file.`,
    };
  }

  const mimeOk =
    ALLOWED_MIME_TYPES.includes(file.type) ||
    file.type === "" ||
    file.type === "application/octet-stream";

  if (!mimeOk) {
    return {
      valid: false,
      error: `Unexpected file format (${file.type}). Only CSV files are accepted.`,
    };
  }

  if (file.size === 0) {
    return { valid: false, error: "The file appears to be empty." };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File is too large (${sizeMB} MB). Maximum allowed size is ${MAX_FILE_SIZE_MB} MB.`,
    };
  }

  return { valid: true };
}

/**
 * Step 2 — validate parsed CSV data (called after PapaParse completes).
 * Checks that all required columns are present.
 *
 * @param {Array<Object>} rows - PapaParse output (header: true)
 * @returns {{ valid: boolean, error?: string, warnings?: string[] }}
 */
export function validateParsedData(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return { valid: false, error: "The CSV file contains no data rows." };
  }

  const headers = Object.keys(rows[0]).map((h) => h.trim().toLowerCase());

  // Check each required column against its alias list
  const missingColumns = REQUIRED_COLUMNS.filter((col) => {
    const aliases = COLUMN_ALIASES[col] || [col];
    return !aliases.some((alias) =>
      headers.some((h) => h.includes(alias.toLowerCase()))
    );
  });

  if (missingColumns.length > 0) {
    const friendly = missingColumns.map((c) => `"${c}"`).join(", ");
    return {
      valid: false,
      error: `CSV is missing required column(s): ${friendly}. Please export a valid bank statement.`,
    };
  }

  const warnings = [];

  if (rows.length > 10_000) {
    warnings.push(
      `Large file: ${rows.length.toLocaleString()} rows detected. Processing may take a moment.`
    );
  }

  // Warn if a date column is absent (non-blocking)
  const hasDate = headers.some((h) =>
    ["date", "booking date", "transaction date", "value date", "posting date"].some((k) =>
      h.includes(k)
    )
  );
  if (!hasDate) {
    warnings.push(
      "No date column detected. Monthly trend charts will be unavailable."
    );
  }

  return { valid: true, warnings: warnings.length ? warnings : undefined };
}