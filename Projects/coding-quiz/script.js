const progressBar = document.getElementById('progressBar');
const questionCounter = document.getElementById('questionCounter');
const currentQSpan = document.getElementById('currentQ');
const totalQsSpan = document.getElementById('totalQs');
const startScreen = document.getElementById('startScreen');
const quizContainer = document.getElementById('quizContainer');
const resultsScreen = document.getElementById('resultsScreen');
const startBtn = document.getElementById('startBtn');
const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
const feedbackEl = document.getElementById('feedback');
const timeEl = document.getElementById('time');
const scoreEl = document.getElementById('score');
const scoreForm = document.getElementById('scoreForm');
const initialsInput = document.getElementById('initials');
const highScoresList = document.getElementById('highScoresList');
const restartBtn = document.getElementById('restartBtn');
const backButtons = document.querySelectorAll('.back-btn');


let currentQuestion = 0;
let score = 0;
let timeLeft = 60;
let timer;


const questions = [
    {
        question: "What does 'DOM' stand for?",
        options: [
            "Document Object Model", 
            "Digital Orientation Method",
            "Data Object Management"
        ],
        answer: 0
    },
    {
        question: "Which operator returns true if two values are equal in value and type?",
        options: [
            "==",
            "===",
            "="
        ],
        answer: 1
    },
    {
        question: "What does 'JSON' stand for?",
        options: [
            "JavaScript Object Notation",
            "JavaScript Oriented Networking",
            "JavaScript Operator Namespace"
        ],
        answer: 0
    },
    {
        question: "Which method adds an element to the end of an array?",
        options: [
            "array.push()",
            "array.pop()",
            "array.shift()"
        ],
        answer: 0
    },
    {
        question: "What is the correct way to declare a constant in JavaScript?",
        options: [
            "let constantName;",
            "var constantName;",
            "const constantName;"
        ],
        answer: 2
    },
    {
        question: "Which HTML tag is used to link a JavaScript file?",
        options: [
            "<script>",
            "<javascript>",
            "<js>"
        ],
        answer: 0
    },
    {
        question: "What will 'console.log(typeof null)' output?",
        options: [
            "object",
            "null",
            "undefined"
        ],
        answer: 0
    },
    {
        question: "Which method converts a string to lowercase?",
        options: [
            "string.toLowerCase()",
            "string.toLower()",
            "string.lowerCase()"
        ],
        answer: 0
    },
    {
        question: "What does the 'this' keyword refer to in a method?",
        options: [
            "The function itself",
            "The object that owns the method",
            "The global object"
        ],
        answer: 1
    },
    {
        question: "Which array method creates a new array with filtered elements?",
        options: [
            "array.filter()",
            "array.map()",
            "array.reduce()"
        ],
        answer: 0
    },
    {
        question: "What does CSS stand for?",
        options: [
            "Cascading Style Sheets",
            "Computer Style Sheets",
            "Creative Style Sheets"
        ],
        answer: 0
    },
    {
        question: "Which symbol is used for single-line comments in JavaScript?",
        options: [
            "//",
            "/*",
            "#"
        ],
        answer: 0
    },
    {
        question: "What does the 'querySelector()' method return?",
        options: [
            "An array of elements",
            "The first matching element",
            "All matching elements"
        ],
        answer: 1
    },
    {
        question: "Which event occurs when a user clicks an element?",
        options: [
            "onhover",
            "onclick",
            "onchange"
        ],
        answer: 1
    },
    {
        question: "What is the correct syntax for an arrow function?",
        options: [
            "function => {}",
            "() => {}",
            "() -> {}"
        ],
        answer: 1
    },
    {
        question: "Which method parses a JSON string into an object?",
        options: [
            "JSON.parse()",
            "JSON.stringify()",
            "JSON.toObject()"
        ],
        answer: 0
    },
    {
        question: "What does 'NaN' stand for?",
        options: [
            "Not a Number",
            "Null and None",
            "New Assignment"
        ],
        answer: 0
    },
    {
        question: "Which loop is best for iterating through an array?",
        options: [
            "for...in",
            "for...of",
            "while"
        ],
        answer: 1
    },
    {
        question: "What does 'API' stand for?",
        options: [
            "Application Programming Interface",
            "Automated Programming Instruction",
            "Advanced Program Interaction"
        ],
        answer: 0
    },
    {
        question: "Which method adds an element to the beginning of an array?",
        options: [
            "array.push()",
            "array.unshift()",
            "array.shift()"
        ],
        answer: 1
    }
];


function initQuiz() {
    totalQsSpan.textContent = questions.length;
    loadHighScores();
    
    startBtn.addEventListener('click', startQuiz);
    scoreForm.addEventListener('submit', saveScore);
    restartBtn.addEventListener('click', restartQuiz);
    
    backButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (quizContainer.style.display === 'block' && 
                !confirm('Quiz in progress! Leave anyway?')) {
                e.preventDefault();
            }
        });
    });
}


function startQuiz() {
    startScreen.style.display = 'none';
    quizContainer.style.display = 'block';
    resultsScreen.style.display = 'none';
    
    currentQuestion = 0;
    score = 0;
    timeLeft = 60;
    timeEl.textContent = timeLeft;
    
    
    timer = setInterval(() => {
        timeLeft--;
        timeEl.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            endQuiz();
        }
    }, 1000);
    
    loadQuestion();
}


function loadQuestion() {
    const question = questions[currentQuestion];
    questionEl.textContent = question.question;
    optionsEl.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.textContent = option;
        button.classList.add('option');
        button.addEventListener('click', () => selectAnswer(index));
        optionsEl.appendChild(button);
    });
    
    currentQSpan.textContent = currentQuestion + 1;
    progressBar.style.width = `${((currentQuestion + 1) / questions.length) * 100}%`;
}


function selectAnswer(selectedIndex) {
    const question = questions[currentQuestion];
    const options = document.querySelectorAll('.option');
    
    if (selectedIndex === question.answer) {
        feedbackEl.textContent = 'Correct!';
        feedbackEl.style.color = 'green';
        score++;
    } else {
        feedbackEl.textContent = 'Wrong!';
        feedbackEl.style.color = 'red';
        timeLeft = Math.max(0, timeLeft - 10);
    }
    
   
    options.forEach(option => {
        option.disabled = true;
        if (parseInt(option.dataset.index) === question.answer) {
            option.style.backgroundColor = 'lightgreen';
        }
    });
    
   
    setTimeout(() => {
        currentQuestion++;
        if (currentQuestion < questions.length) {
            loadQuestion();
            feedbackEl.textContent = '';
        } else {
            endQuiz();
        }
    }, 1000);
}


function endQuiz() {
    clearInterval(timer);
    quizContainer.style.display = 'none';
    resultsScreen.style.display = 'block';
    scoreEl.textContent = score;
}


function saveScore(e) {
    e.preventDefault();
    const initials = initialsInput.value.trim();
    if (!initials) return;
    
    const scores = JSON.parse(localStorage.getItem('quizScores') || '[]');
    scores.push({ initials, score });
    scores.sort((a, b) => b.score - a.score);
    localStorage.setItem('quizScores', JSON.stringify(scores.slice(0, 5)));
    loadHighScores();
    initialsInput.value = '';
}


function loadHighScores() {
    const scores = JSON.parse(localStorage.getItem('quizScores') || '[]');
    highScoresList.innerHTML = scores
        .map((entry, i) => `<li>${i + 1}. ${entry.initials} - ${entry.score}</li>`)
        .join('');
}


function restartQuiz() {
    resultsScreen.style.display = 'none';
    startScreen.style.display = 'block';
    feedbackEl.textContent = '';
}


initQuiz();



function initQuiz() {
    totalQsSpan.textContent = questions.length;
    loadHighScores();
    
    startBtn.addEventListener('click', startQuiz);
    scoreForm.addEventListener('submit', saveScore);
    restartBtn.addEventListener('click', restartQuiz);
    
 
    document.querySelectorAll('.back-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (quizContainer.style.display === 'block' && 
                !confirm('Quiz in progress! Leave anyway?')) {
                e.preventDefault();
            }
        });
    });
}




initQuiz();
