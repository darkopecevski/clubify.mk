"use client";

import { useState } from "react";
import Link from "next/link";
import { Upload, Download, FileText, AlertCircle, CheckCircle2, ArrowLeft, Loader2 } from "lucide-react";
import { parseCsv, generateErrorCsv, ParseCsvResult } from "@/lib/utils/csv-parser";

type ImportStep = "upload" | "preview" | "importing" | "complete";

export default function PlayerImportClient({ clubId }: { clubId: string }) {
  const [step, setStep] = useState<ImportStep>("upload");
  const [parseResult, setParseResult] = useState<ParseCsvResult | null>(null);
  const [importResult, setImportResult] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (!file.name.endsWith(".csv")) {
      alert("Please upload a CSV file");
      return;
    }

    try {
      const text = await file.text();
      const result = parseCsv(text);
      setParseResult(result);
      setStep("preview");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to parse CSV");
    }
  };

  const handleImport = async () => {
    if (!parseResult) return;

    setStep("importing");

    try {
      const response = await fetch(`/api/club/players/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clubId,
          rows: parseResult.rows.filter((r) => r.validation.isValid),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Import failed");
      }

      const result = await response.json();
      setImportResult(result);
      setStep("complete");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Import failed");
      setStep("preview");
    }
  };

  const downloadTemplate = () => {
    const link = document.createElement("a");
    link.href = "/templates/player-import-template.csv";
    link.download = "player-import-template.csv";
    link.click();
  };

  const downloadErrorLog = () => {
    if (!parseResult) return;

    const errorCsv = generateErrorCsv(parseResult.rows);
    const blob = new Blob([errorCsv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "import-errors.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Link
              href={`/club/${clubId}/players`}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Import Players
            </h1>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Bulk import players from CSV file
          </p>
        </div>
        <button
          onClick={downloadTemplate}
          className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          <Download className="h-4 w-4" />
          Download Template
        </button>
      </div>

      {/* Upload Step */}
      {step === "upload" && (
        <div className="rounded-lg border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800">
          <div
            className={`relative rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
              dragActive
                ? "border-green-500 bg-green-50 dark:bg-green-900/10"
                : "border-gray-300 dark:border-gray-600"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              Upload CSV File
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Drag and drop your CSV file here, or click to browse
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileInput}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
          </div>

          <div className="mt-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
              <div className="text-sm text-blue-800 dark:text-blue-300">
                <p className="font-medium">CSV Format Requirements:</p>
                <ul className="mt-2 list-inside list-disc space-y-1">
                  <li>First row must contain column headers</li>
                  <li>Date format: YYYY-MM-DD (e.g., 2015-05-10)</li>
                  <li>All required fields must be filled</li>
                  <li>Use exact values for enums (male/female, goalkeeper/defender/midfielder/forward, etc.)</li>
                  <li>Download the template for correct format</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Step */}
      {step === "preview" && parseResult && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Rows
                  </p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                    {parseResult.totalRows}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Valid Rows
                  </p>
                  <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
                    {parseResult.validRows}
                  </p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Invalid Rows
                  </p>
                  <p className="mt-2 text-3xl font-bold text-red-600 dark:text-red-400">
                    {parseResult.invalidRows}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>

          {/* Preview Table */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-200 p-4 dark:border-gray-700">
              <h3 className="font-medium text-gray-900 dark:text-white">
                Preview (First 10 rows)
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                      Row
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                      DOB
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                      Position
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                      Parent Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {parseResult.rows.slice(0, 10).map((row) => (
                    <tr
                      key={row.rowNumber}
                      className={`${
                        !row.validation.isValid ? "bg-red-50 dark:bg-red-900/10" : ""
                      }`}
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {row.rowNumber}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {row.data.first_name} {row.data.last_name}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {row.data.date_of_birth}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {row.data.position}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {row.data.parent_email}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        {row.validation.isValid ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/20 dark:text-green-400">
                            <CheckCircle2 className="h-3 w-3" />
                            Valid
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/20 dark:text-red-400"
                            title={row.validation.errors.join(", ")}
                          >
                            <AlertCircle className="h-3 w-3" />
                            Invalid
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setStep("upload");
                  setParseResult(null);
                }}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              {parseResult.invalidRows > 0 && (
                <button
                  onClick={downloadErrorLog}
                  className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  <Download className="h-4 w-4" />
                  Download Error Log
                </button>
              )}
            </div>
            <button
              onClick={handleImport}
              disabled={parseResult.validRows === 0}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-green-500 dark:hover:bg-green-600"
            >
              Import {parseResult.validRows} Players
            </button>
          </div>

          {parseResult.invalidRows > 0 && (
            <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-yellow-600 dark:text-yellow-400" />
                <div className="text-sm text-yellow-800 dark:text-yellow-300">
                  <p className="font-medium">
                    {parseResult.invalidRows} row(s) have validation errors and will be skipped.
                  </p>
                  <p className="mt-1">
                    Download the error log to see details and fix the issues.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Importing Step */}
      {step === "importing" && (
        <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-green-600 dark:text-green-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              Importing Players...
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              This may take a few moments
            </p>
          </div>
        </div>
      )}

      {/* Complete Step */}
      {step === "complete" && importResult && (
        <div className="space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800">
            <CheckCircle2 className="mx-auto h-16 w-16 text-green-600 dark:text-green-400" />
            <h3 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">
              Import Complete!
            </h3>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {importResult.success}
                </p>
                <p className="mt-1 text-sm text-green-800 dark:text-green-300">
                  Players Imported
                </p>
              </div>
              <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {importResult.failed}
                </p>
                <p className="mt-1 text-sm text-red-800 dark:text-red-300">
                  Failed
                </p>
              </div>
            </div>

            {importResult.errors.length > 0 && (
              <div className="mt-6 rounded-lg bg-yellow-50 p-4 text-left dark:bg-yellow-900/20">
                <p className="font-medium text-yellow-800 dark:text-yellow-300">
                  Some imports failed:
                </p>
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-yellow-800 dark:text-yellow-300">
                  {importResult.errors.slice(0, 5).map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                  {importResult.errors.length > 5 && (
                    <li>... and {importResult.errors.length - 5} more</li>
                  )}
                </ul>
              </div>
            )}

            <div className="mt-8 flex justify-center gap-3">
              <Link
                href={`/club/${clubId}/players`}
                className="rounded-lg bg-green-600 px-6 py-2 text-sm font-medium text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
              >
                View Players
              </Link>
              <button
                onClick={() => {
                  setStep("upload");
                  setParseResult(null);
                  setImportResult(null);
                }}
                className="rounded-lg border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Import More
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
