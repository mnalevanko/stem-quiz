# STEM Sprint Quiz

Interactive STEM quiz built with `HTML`, `CSS3`, and vanilla `JavaScript`.

The app shows:
- a landing page
- a 10-question category-balanced quiz
- shuffled answer order for each question
- live score and progress tracking
- instant feedback after each answer
- a replayable results screen with personal best tracking

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd stem-quiz
```

### 2. Run it through a local server

This project loads `questions.json` with `fetch()`, so it must not be opened directly with `file://`.

```bash
python3 -m http.server
```

Then open:

```text
http://localhost:8000
```

## Project Structure

```text
stem-quiz/
├── index.html        — markup and screen layout
├── style.css         — all visual styling and responsive breakpoints
├── lib.js            — pure logic (shuffle, validation, question selection)
├── script.js         — DOM-facing quiz behaviour and localStorage
├── questions.json    — question bank (100 questions)
├── validate.js       — CLI validator for questions.json
├── test.js           — unit test suite
└── README.md
```

## How the Quiz Works

- All questions are loaded from `questions.json` at the start of the first round
- Every question is validated on load; the quiz refuses to start if any question is malformed
- 10 questions are selected each round with proportional representation across all four STEM categories (2–3 questions per category)
- Each selected question has its answer options shuffled before display
- Score, progress, and results are tracked in the browser only — no backend required
- The best score across all rounds is saved to `localStorage` and shown on the results screen

## Required JSON Structure

`questions.json` must be a valid JSON array. Each question must use this structure:

```json
{
  "id": 1,
  "category": "Science",
  "question": "Which planet is known as the Red Planet?",
  "options": ["Venus", "Jupiter", "Mars", "Saturn"],
  "correct_answer_index": 2
}
```

### Field requirements

| Field | Type | Rules |
|---|---|---|
| `id` | number | Must be unique across all questions |
| `category` | string | Must be one of: `Science`, `Technology`, `Engineering`, `Math` |
| `question` | string | Must be non-empty |
| `options` | array of strings | Must contain at least 2 items |
| `correct_answer_index` | integer | Must be a valid zero-based index into `options` |

## Validating questions.json

Run the validator before editing the question bank or after adding new questions:

```bash
node validate.js
```

A passing run prints the total question count and a category breakdown. Any schema errors are listed with their question ID and a description of the problem. The script exits with code `1` on failure, making it safe to use in CI.

## Running the Tests

The test suite covers all pure functions in `lib.js`. Requires Node 18 or later.

```bash
node test.js
```

## Customizing the Quiz

To add or replace questions:

1. Open `questions.json`
2. Add new question objects following the structure above
3. Run `node validate.js` to confirm the file is valid
4. Refresh the browser

To change the number of questions per round, update `QUIZ_LENGTH` in `lib.js`. The category-balancing logic adapts automatically.

## Notes

- The app is fully client-side with no build step required
- Pure functions (shuffle, question selection, validation, scoring messages) live in `lib.js` and are shared by the browser and the Node.js test runner
- DOM behaviour and `localStorage` access are handled in `script.js`
- Styling and responsive layout are defined in `style.css`
