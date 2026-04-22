#!/usr/bin/env node
/**
 * i18n QA Script
 * 번역 파일 간 누락/불일치 키를 자동으로 검출합니다.
 *
 * Usage:
 *   npx tsx scripts/i18n-qa.ts
 *   npx tsx scripts/i18n-qa.ts --strict   (빈 값도 오류로 처리)
 *   npx tsx scripts/i18n-qa.ts --fix-hint  (누락 키에 대한 ko 값 힌트 출력)
 */

import fs from "fs";
import path from "path";

// ─────────────────────────────────────────
// Config
// ─────────────────────────────────────────
const MESSAGES_DIR = path.resolve(
  __dirname,
  "../apps/commerce/messages"
);
const REFERENCE_LOCALE = "ko";
const LOCALES = ["ko", "en", "ja", "de"];
const STRICT = process.argv.includes("--strict");
const FIX_HINT = process.argv.includes("--fix-hint");

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────
type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];

interface QAResult {
  locale: string;
  missing: string[];   // 해당 언어에 없는 키 (reference 기준)
  extra: string[];     // reference에 없는 키 (해당 언어에만 있음)
  empty: string[];     // 값이 빈 문자열인 키
}

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────
function loadJson(locale: string): JsonObject {
  const filePath = path.join(MESSAGES_DIR, `${locale}.json`);
  if (!fs.existsSync(filePath)) {
    console.error(`[ERROR] File not found: ${filePath}`);
    process.exit(1);
  }
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as JsonObject;
}

/**
 * JSON 객체를 dot-notation 평탄 키 목록으로 변환
 * e.g. { a: { b: "x" } } → ["a.b"]
 */
function flattenKeys(obj: JsonObject, prefix = ""): string[] {
  const keys: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === "object" && !Array.isArray(v)) {
      keys.push(...flattenKeys(v as JsonObject, full));
    } else {
      keys.push(full);
    }
  }
  return keys;
}

/**
 * dot-notation 키로 중첩 객체에서 값 가져오기
 */
function getByPath(obj: JsonObject, dotPath: string): JsonValue | undefined {
  const parts = dotPath.split(".");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cur: any = obj;
  for (const p of parts) {
    if (cur === null || typeof cur !== "object") return undefined;
    cur = cur[p];
  }
  return cur as JsonValue;
}

// ─────────────────────────────────────────
// Core QA
// ─────────────────────────────────────────
function qa(reference: JsonObject, target: JsonObject, locale: string): QAResult {
  const refKeys = new Set(flattenKeys(reference));
  const tgtKeys = new Set(flattenKeys(target));

  const missing = [...refKeys].filter((k) => !tgtKeys.has(k));
  const extra = [...tgtKeys].filter((k) => !refKeys.has(k));
  const empty: string[] = [];

  if (STRICT) {
    for (const k of tgtKeys) {
      const val = getByPath(target, k);
      if (typeof val === "string" && val.trim() === "") {
        empty.push(k);
      }
    }
  }

  return { locale, missing, extra, empty };
}

// ─────────────────────────────────────────
// Reporter
// ─────────────────────────────────────────
function report(results: QAResult[], reference: JsonObject): void {
  const colors = {
    reset: "\x1b[0m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    green: "\x1b[32m",
    cyan: "\x1b[36m",
    bold: "\x1b[1m",
    dim: "\x1b[2m",
  };

  const isTTY = process.stdout.isTTY;
  const c = (code: string, s: string) => (isTTY ? `${code}${s}${colors.reset}` : s);

  let totalIssues = 0;

  console.log(`\n${c(colors.bold, "═══════════════════════════════════════")}`);
  console.log(`${c(colors.bold, " i18n QA Report")} ${c(colors.dim, `(reference: ${REFERENCE_LOCALE})`)}`);
  console.log(`${c(colors.bold, "═══════════════════════════════════════")}\n`);

  for (const r of results) {
    const issueCount = r.missing.length + r.extra.length + r.empty.length;
    totalIssues += issueCount;

    const status = issueCount === 0
      ? c(colors.green, "✓ PASS")
      : c(colors.red, `✗ FAIL (${issueCount} issues)`);

    console.log(`${c(colors.cyan, c(colors.bold, `[${r.locale}]`))} ${status}`);

    if (r.missing.length > 0) {
      console.log(`  ${c(colors.red, `Missing keys (${r.missing.length}):`)} `);
      for (const k of r.missing) {
        const hint = FIX_HINT ? c(colors.dim, `  ← ko: "${getByPath(reference, k)}"`) : "";
        console.log(`    ${c(colors.red, "−")} ${k}${hint}`);
      }
    }

    if (r.extra.length > 0) {
      console.log(`  ${c(colors.yellow, `Extra keys (${r.extra.length}) — not in reference:`)}`);
      for (const k of r.extra) {
        console.log(`    ${c(colors.yellow, "+")} ${k}`);
      }
    }

    if (r.empty.length > 0) {
      console.log(`  ${c(colors.yellow, `Empty values (${r.empty.length}):`)} ${c(colors.dim, "(--strict)")}`);
      for (const k of r.empty) {
        console.log(`    ${c(colors.yellow, "~")} ${k}`);
      }
    }

    if (issueCount === 0) {
      // pass — no detail needed
    }
    console.log();
  }

  // ── Summary ──
  console.log(`${c(colors.bold, "───────────────────────────────────────")}`);
  if (totalIssues === 0) {
    console.log(c(colors.green, c(colors.bold, "All locales are in sync. ✓")));
  } else {
    console.log(
      `${c(colors.red, c(colors.bold, `Total issues: ${totalIssues}`))}` +
      ` across ${results.filter((r) => r.missing.length + r.extra.length + r.empty.length > 0).length} locale(s).`
    );
    console.log(c(colors.dim, "Run with --fix-hint to see reference (ko) values for missing keys."));
  }
  console.log();

  if (totalIssues > 0) process.exit(1);
}

// ─────────────────────────────────────────
// Main
// ─────────────────────────────────────────
function main(): void {
  const reference = loadJson(REFERENCE_LOCALE);
  const results: QAResult[] = [];

  for (const locale of LOCALES) {
    if (locale === REFERENCE_LOCALE) continue;
    const target = loadJson(locale);
    results.push(qa(reference, target, locale));
  }

  report(results, reference);
}

main();
