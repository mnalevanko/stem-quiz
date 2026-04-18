const QUIZ_LENGTH = 10;

const screens = {
  landing: document.getElementById("landing-screen"),
  quiz: document.getElementById("quiz-screen"),
  results: document.getElementById("results-screen"),
};

const ui = {
  startButton: document.getElementById("start-button"),
  nextButton: document.getElementById("next-button"),
  restartButton: document.getElementById("restart-button"),
  category: document.getElementById("question-category"),
  questionCount: document.getElementById("question-count"),
  scoreDisplay: document.getElementById("score-display"),
  progressFill: document.getElementById("progress-fill"),
  questionText: document.getElementById("question-text"),
  answerGrid: document.getElementById("answer-grid"),
  feedbackMessage: document.getElementById("feedback-message"),
  resultsScore: document.getElementById("results-score"),
  resultsMessage: document.getElementById("results-message"),
};

let questionBank = [];
let activeQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let hasAnsweredCurrentQuestion = false;

ui.startButton.addEventListener("click", startQuiz);
ui.nextButton.addEventListener("click", goToNextQuestion);
ui.restartButton.addEventListener("click", startQuiz);

async function startQuiz() {
  ui.startButton.disabled = true;
  ui.restartButton.disabled = true;

  try {
    if (questionBank.length === 0) {
      questionBank = await loadQuestions();
    }

    activeQuestions = shuffle([...questionBank])
      .slice(0, QUIZ_LENGTH)
      .map(prepareQuestion);
    currentQuestionIndex = 0;
    score = 0;
    hasAnsweredCurrentQuestion = false;

    showScreen("quiz");
    renderQuestion();
  } catch (error) {
    showScreen("landing");
    ui.feedbackMessage.textContent = "";
    alert("The quiz could not load. Please refresh the page and try again.");
    console.error(error);
  } finally {
    ui.startButton.disabled = false;
    ui.restartButton.disabled = false;
  }
}

async function loadQuestions() {
  const response = await fetch("questions.json");

  if (!response.ok) {
    throw new Error(`Question load failed with status ${response.status}`);
  }

  const questions = await response.json();

  if (!Array.isArray(questions) || questions.length < QUIZ_LENGTH) {
    throw new Error("Not enough questions available to build the quiz.");
  }

  return questions;
}

function renderQuestion() {
  const question = activeQuestions[currentQuestionIndex];

  hasAnsweredCurrentQuestion = false;
  ui.category.textContent = question.category;
  ui.questionCount.textContent = `Question ${currentQuestionIndex + 1} of ${QUIZ_LENGTH}`;
  ui.scoreDisplay.textContent = `Score: ${score}`;
  ui.progressFill.style.width = `${(currentQuestionIndex / QUIZ_LENGTH) * 100}%`;
  ui.questionText.textContent = question.question;
  ui.feedbackMessage.textContent = "";
  ui.feedbackMessage.className = "feedback-message";
  ui.nextButton.classList.add("hidden");
  ui.answerGrid.innerHTML = "";

  question.answers.forEach((answer, optionIndex) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer-button";
    button.textContent = answer.text;
    button.addEventListener("click", () => handleAnswer(optionIndex));
    ui.answerGrid.appendChild(button);
  });
}

function handleAnswer(selectedIndex) {
  if (hasAnsweredCurrentQuestion) {
    return;
  }

  hasAnsweredCurrentQuestion = true;
  const question = activeQuestions[currentQuestionIndex];
  const answerButtons = [...ui.answerGrid.querySelectorAll(".answer-button")];
  const isCorrect = question.answers[selectedIndex].isCorrect;

  if (isCorrect) {
    score += 1;
    ui.feedbackMessage.textContent = "Correct. Nice work.";
    ui.feedbackMessage.classList.add("is-correct");
  } else {
    ui.feedbackMessage.textContent = "Not quite. The highlighted answer is correct.";
    ui.feedbackMessage.classList.add("is-wrong");
  }

  ui.scoreDisplay.textContent = `Score: ${score}`;

  answerButtons.forEach((button, index) => {
    button.disabled = true;

    if (question.answers[index].isCorrect) {
      button.classList.add("is-correct");
    } else if (index === selectedIndex && !isCorrect) {
      button.classList.add("is-wrong");
    } else {
      button.classList.add("is-muted");
    }
  });

  ui.nextButton.textContent = currentQuestionIndex === QUIZ_LENGTH - 1 ? "See Results" : "Next Question";
  ui.nextButton.classList.remove("hidden");
  ui.progressFill.style.width = `${((currentQuestionIndex + 1) / QUIZ_LENGTH) * 100}%`;
}

function goToNextQuestion() {
  if (!hasAnsweredCurrentQuestion) {
    return;
  }

  if (currentQuestionIndex === QUIZ_LENGTH - 1) {
    renderResults();
    return;
  }

  currentQuestionIndex += 1;
  renderQuestion();
}

function renderResults() {
  showScreen("results");
  ui.resultsScore.textContent = `${score} / ${QUIZ_LENGTH}`;
  ui.resultsMessage.textContent = getResultsMessage(score);
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

function showScreen(targetScreen) {
  Object.values(screens).forEach((screen) => {
    screen.classList.remove("screen--active");
  });

  screens[targetScreen].classList.add("screen--active");
}

function shuffle(items) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [items[index], items[randomIndex]] = [items[randomIndex], items[index]];
  }

  return items;
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
