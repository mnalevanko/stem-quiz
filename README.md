# STEM Sprint Quiz

Interactive STEM quiz built with `HTML`, `CSS3`, and vanilla `JavaScript`.

The app shows:
- a landing page
- a 10-question randomized quiz
- shuffled answer order for each question
- live score and progress tracking
- instant feedback after each answer
- a replayable results screen

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd quiz-game
```

### 2. Run it through a local server

This project loads `questions.json` with `fetch()`, so it should not be opened directly with `file://`.

One simple option:

```bash
python3 -m http.server
```

Then open:

```text
http://localhost:8000
```

## Project Structure

```text
quiz-game/
├── index.html
├── style.css
├── script.js
├── questions.json
└── README.md
```

## How the Quiz Works

- The app loads all questions from `questions.json`
- It randomly selects `10` questions at the start of each run
- Each selected question has its answer options shuffled before display
- The app keeps track of score, progress, and final results in the browser only
- No backend or database is required

## Required JSON Structure

The app expects `questions.json` to contain a JSON array of question objects.

Each question must use this exact structure:

```json
{
  "id": 1,
  "category": "Science",
  "question": "Which planet is known as the Red Planet?",
  "options": ["Venus", "Jupiter", "Mars", "Saturn"],
  "correct_answer_index": 2
}
```

### Field Requirements

- `id`
  - Type: number
  - Should be unique for each question

- `category`
  - Type: string
  - Used for display in the quiz header
  - Example values in this project: `Science`, `Technology`, `Engineering`, `Math`

- `question`
  - Type: string
  - The text shown in the question area

- `options`
  - Type: array of strings
  - Must contain exactly `4` answer options
  - Each item should be plain text

- `correct_answer_index`
  - Type: number
  - Must be a valid zero-based index pointing to the correct item inside `options`
  - Valid values are `0`, `1`, `2`, or `3`

## JSON Rules the App Depends On

To work correctly with the current implementation:

- `questions.json` must be a valid JSON array
- the file must contain at least `10` questions
- every question must include all 5 required fields
- every question must have exactly `4` options
- `correct_answer_index` must match the correct answer in `options`
- all user-facing text should be in English if you want the app language to stay consistent

If any of these rules are broken, the app may fail to load the quiz or show incorrect answer behavior.

## Example Question Set Snippet

```json
[
  {
    "id": 1,
    "category": "Science",
    "question": "What gas do plants absorb from the atmosphere for photosynthesis?",
    "options": ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"],
    "correct_answer_index": 2
  },
  {
    "id": 2,
    "category": "Math",
    "question": "What is 7 raised to the power of 3?",
    "options": ["21", "49", "343", "512"],
    "correct_answer_index": 2
  }
]
```

## Customizing the Quiz

To add or replace questions:

1. Open `questions.json`
2. Add new question objects using the same structure
3. Keep exactly 4 options per question
4. Make sure `correct_answer_index` points to the correct answer
5. Save the file and refresh the browser

## Notes

- The quiz length is currently fixed to `10` questions in `script.js`
- The app is fully client-side
- Styling and layout are defined in `style.css`
- Quiz behavior and data loading are handled in `script.js`
