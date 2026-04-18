// Run with: node test.js
// Requires Node 18+

const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  QUIZ_LENGTH,
  shuffle,
  isValidQuestion,
  prepareQuestion,
  selectQuestions,
  getResultsMessage,
} = require("./lib.js");

function makeQuestion(overrides = {}) {
  return {
    id: 1,
    category: "Science",
    question: "What is H2O?",
    options: ["Water", "Fire", "Earth", "Air"],
    correct_answer_index: 0,
    ...overrides,
  };
}

function makeBank() {
  const categories = ["Science", "Technology", "Engineering", "Math"];
  return categories.flatMap((category, ci) =>
    Array.from({ length: 25 }, (_, i) =>
      makeQuestion({ id: ci * 25 + i + 1, category, question: `${category} question ${i + 1}` })
    )
  );
}

// --- shuffle ---

test("shuffle preserves array length", () => {
  const arr = [1, 2, 3, 4, 5];
  assert.equal(shuffle([...arr]).length, arr.length);
});

test("shuffle contains the same elements", () => {
  const arr = [1, 2, 3, 4, 5];
  assert.deepEqual([...shuffle([...arr])].sort((a, b) => a - b), [...arr].sort((a, b) => a - b));
});

test("shuffle mutates and returns the same array reference", () => {
  const arr = [1, 2, 3];
  assert.equal(shuffle(arr), arr);
});

test("shuffle with a single element returns unchanged", () => {
  assert.deepEqual(shuffle([42]), [42]);
});

// --- isValidQuestion ---

test("isValidQuestion accepts a well-formed question", () => {
  assert.equal(isValidQuestion(makeQuestion()), true);
});

test("isValidQuestion rejects null", () => {
  assert.equal(isValidQuestion(null), false);
});

test("isValidQuestion rejects a non-object", () => {
  assert.equal(isValidQuestion("string"), false);
});

test("isValidQuestion rejects empty question text", () => {
  assert.equal(isValidQuestion(makeQuestion({ question: "" })), false);
});

test("isValidQuestion rejects whitespace-only question text", () => {
  assert.equal(isValidQuestion(makeQuestion({ question: "   " })), false);
});

test("isValidQuestion rejects an unknown category", () => {
  assert.equal(isValidQuestion(makeQuestion({ category: "History" })), false);
});

test("isValidQuestion accepts all four STEM categories", () => {
  for (const category of ["Science", "Technology", "Engineering", "Math"]) {
    assert.equal(isValidQuestion(makeQuestion({ category })), true);
  }
});

test("isValidQuestion rejects correct_answer_index out of bounds (high)", () => {
  assert.equal(isValidQuestion(makeQuestion({ correct_answer_index: 4 })), false);
});

test("isValidQuestion rejects negative correct_answer_index", () => {
  assert.equal(isValidQuestion(makeQuestion({ correct_answer_index: -1 })), false);
});

test("isValidQuestion rejects non-integer correct_answer_index", () => {
  assert.equal(isValidQuestion(makeQuestion({ correct_answer_index: 1.5 })), false);
});

test("isValidQuestion rejects options array with fewer than 2 items", () => {
  assert.equal(isValidQuestion(makeQuestion({ options: ["Only one"], correct_answer_index: 0 })), false);
});

test("isValidQuestion rejects missing options field", () => {
  const q = makeQuestion();
  delete q.options;
  assert.equal(isValidQuestion(q), false);
});

// --- prepareQuestion ---

test("prepareQuestion produces the same number of answers as options", () => {
  const q = makeQuestion();
  assert.equal(prepareQuestion(q).answers.length, q.options.length);
});

test("prepareQuestion marks exactly one answer as correct", () => {
  const result = prepareQuestion(makeQuestion({ correct_answer_index: 2 }));
  assert.equal(result.answers.filter((a) => a.isCorrect).length, 1);
});

test("prepareQuestion marks the correct option by text", () => {
  const q = makeQuestion({ correct_answer_index: 1 });
  const result = prepareQuestion(q);
  const correct = result.answers.find((a) => a.isCorrect);
  assert.equal(correct.text, q.options[1]);
});

test("prepareQuestion preserves all original option texts", () => {
  const q = makeQuestion();
  const result = prepareQuestion(q);
  const texts = result.answers.map((a) => a.text).sort();
  assert.deepEqual(texts, [...q.options].sort());
});

// --- selectQuestions ---

test("selectQuestions returns exactly QUIZ_LENGTH questions", () => {
  assert.equal(selectQuestions(makeBank()).length, QUIZ_LENGTH);
});

test("selectQuestions includes all four categories", () => {
  const categories = new Set(selectQuestions(makeBank()).map((q) => q.category));
  assert.equal(categories.size, 4);
});

test("selectQuestions draws proportionally (2–3 per category for QUIZ_LENGTH=10)", () => {
  const counts = {};
  for (const q of selectQuestions(makeBank())) {
    counts[q.category] = (counts[q.category] ?? 0) + 1;
  }
  for (const [cat, count] of Object.entries(counts)) {
    assert.ok(count >= 2 && count <= 3, `Category "${cat}" got ${count} questions, expected 2–3`);
  }
});

test("selectQuestions picks different questions across runs (statistical)", () => {
  const bank = makeBank();
  const run1 = selectQuestions(bank).map((q) => q.id).sort((a, b) => a - b);
  const run2 = selectQuestions(bank).map((q) => q.id).sort((a, b) => a - b);
  // With 100 questions and 10 slots the chance of identical selection is astronomically low
  assert.notDeepEqual(run1, run2);
});

// --- getResultsMessage ---

test("getResultsMessage returns perfect-score message for QUIZ_LENGTH", () => {
  assert.ok(getResultsMessage(QUIZ_LENGTH).toLowerCase().includes("perfect"));
});

test("getResultsMessage returns strong-result message for score 8", () => {
  assert.ok(getResultsMessage(8).toLowerCase().includes("strong"));
});

test("getResultsMessage returns strong-result message for score 9", () => {
  assert.ok(getResultsMessage(9).toLowerCase().includes("strong"));
});

test("getResultsMessage returns solid-effort message for score 5", () => {
  assert.ok(getResultsMessage(5).toLowerCase().includes("solid"));
});

test("getResultsMessage returns solid-effort message for score 7", () => {
  assert.ok(getResultsMessage(7).toLowerCase().includes("solid"));
});

test("getResultsMessage returns good-start message for score below 5", () => {
  assert.ok(getResultsMessage(4).toLowerCase().includes("good start"));
});

test("getResultsMessage returns good-start message for score 0", () => {
  assert.ok(getResultsMessage(0).toLowerCase().includes("good start"));
});
