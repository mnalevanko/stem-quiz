#!/usr/bin/env node
// Run with: node validate.js

import { readFileSync } from "fs";

const VALID_CATEGORIES = new Set(["Science", "Technology", "Engineering", "Math"]);
const MIN_OPTIONS = 2;

function validateQuestion(q, index) {
  const errors = [];
  const label = `Question at index ${index} (id: ${q?.id ?? "missing"})`;

  if (q === null || typeof q !== "object") {
    return [`${label}: not an object`];
  }
  if (typeof q.id !== "number") errors.push(`${label}: missing or non-numeric "id"`);
  if (typeof q.question !== "string" || q.question.trim().length === 0) {
    errors.push(`${label}: missing or empty "question"`);
  }
  if (!VALID_CATEGORIES.has(q.category)) {
    errors.push(`${label}: invalid category "${q.category}" (must be one of ${[...VALID_CATEGORIES].join(", ")})`);
  }
  if (!Array.isArray(q.options) || q.options.length < MIN_OPTIONS) {
    errors.push(`${label}: "options" must be an array with at least ${MIN_OPTIONS} items`);
  } else {
    q.options.forEach((opt, i) => {
      if (typeof opt !== "string" || opt.trim().length === 0) {
        errors.push(`${label}: option[${i}] is empty or not a string`);
      }
    });
    if (!Number.isInteger(q.correct_answer_index)) {
      errors.push(`${label}: "correct_answer_index" must be an integer`);
    } else if (q.correct_answer_index < 0 || q.correct_answer_index >= q.options.length) {
      errors.push(
        `${label}: "correct_answer_index" (${q.correct_answer_index}) is out of bounds for options array (length ${q.options.length})`
      );
    }
  }

  return errors;
}

let raw;
try {
  raw = readFileSync("questions.json", "utf8");
} catch {
  console.error("ERROR: Could not read questions.json");
  process.exit(1);
}

let questions;
try {
  questions = JSON.parse(raw);
} catch (e) {
  console.error(`ERROR: questions.json is not valid JSON — ${e.message}`);
  process.exit(1);
}

if (!Array.isArray(questions)) {
  console.error("ERROR: questions.json must contain a JSON array");
  process.exit(1);
}

const ids = questions.map((q) => q?.id);
const duplicateIds = ids.filter((id, i) => ids.indexOf(id) !== i);
if (duplicateIds.length > 0) {
  console.error(`ERROR: Duplicate ids found: ${[...new Set(duplicateIds)].join(", ")}`);
  process.exit(1);
}

const allErrors = questions.flatMap((q, i) => validateQuestion(q, i));

if (allErrors.length > 0) {
  console.error(`VALIDATION FAILED — ${allErrors.length} error(s) found:\n`);
  allErrors.forEach((e) => console.error(`  ✗ ${e}`));
  process.exit(1);
}

const categoryCounts = {};
questions.forEach((q) => {
  categoryCounts[q.category] = (categoryCounts[q.category] ?? 0) + 1;
});

console.log(`OK — ${questions.length} questions validated successfully`);
console.log("Category breakdown:", categoryCounts);
