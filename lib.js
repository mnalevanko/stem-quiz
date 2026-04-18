// Pure, DOM-free functions shared between the browser (loaded as a plain script)
// and the Node.js test runner (loaded via require()).

const QUIZ_LENGTH = 10;
const VALID_CATEGORIES = new Set(["Science", "Technology", "Engineering", "Math"]);

function shuffle(items) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [items[index], items[randomIndex]] = [items[randomIndex], items[index]];
  }

  return items;
}

function isValidQuestion(q) {
  return (
    q !== null &&
    typeof q === "object" &&
    typeof q.question === "string" &&
    q.question.trim().length > 0 &&
    VALID_CATEGORIES.has(q.category) &&
    Array.isArray(q.options) &&
    q.options.length >= 2 &&
    Number.isInteger(q.correct_answer_index) &&
    q.correct_answer_index >= 0 &&
    q.correct_answer_index < q.options.length
  );
}

function prepareQuestion(question) {
  const answers = question.options.map((option, index) => ({
    text: option,
    isCorrect: index === question.correct_answer_index,
  }));

  return {
    ...question,
    answers: shuffle(answers),
  };
}

// Picks QUIZ_LENGTH questions with proportional representation from each category.
function selectQuestions(bank) {
  const byCategory = {};
  for (const question of bank) {
    (byCategory[question.category] ??= []).push(question);
  }

  const categories = Object.keys(byCategory);
  const base = Math.floor(QUIZ_LENGTH / categories.length);
  const remainder = QUIZ_LENGTH % categories.length;

  const selected = [];
  categories.forEach((category, index) => {
    const count = base + (index < remainder ? 1 : 0);
    const pool = shuffle([...byCategory[category]]);
    selected.push(...pool.slice(0, count));
  });

  return shuffle(selected);
}

function getResultsMessage(finalScore) {
  if (finalScore === QUIZ_LENGTH) {
    return "Perfect score. Your STEM fundamentals are in excellent shape.";
  }

  if (finalScore >= 8) {
    return "Strong result. You handled this round with real confidence.";
  }

  if (finalScore >= 5) {
    return "Solid effort. Another round should push you even higher.";
  }

  return "Good start. Try another round and build momentum.";
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { QUIZ_LENGTH, VALID_CATEGORIES, shuffle, isValidQuestion, prepareQuestion, selectQuestions, getResultsMessage };
}
