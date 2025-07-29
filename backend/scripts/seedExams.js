const mongoose = require("mongoose");
const Exam = require("../models/Exam");
const Course = require("../models/Course");
require("dotenv").config();

// Sample exam data
const sampleExams = [
  {
    title: "Introduction to Web Development Quiz",
    description: "Test your knowledge of basic web development concepts including HTML, CSS, and JavaScript fundamentals.",
    type: "quiz",
    questions: [
      {
        text: "What does HTML stand for?",
        options: [
          "Hyper Text Markup Language",
          "High Tech Modern Language",
          "Home Tool Markup Language",
          "Hyperlink and Text Markup Language"
        ],
        correctAnswer: 0,
        points: 2
      },
      {
        text: "Which CSS property is used to change the text color?",
        options: [
          "text-color",
          "color",
          "font-color",
          "text-style"
        ],
        correctAnswer: 1,
        points: 2
      },
      {
        text: "What is the correct way to write a JavaScript array?",
        options: [
          "var colors = (1:'red', 2:'green', 3:'blue')",
          "var colors = 'red', 'green', 'blue'",
          "var colors = ['red', 'green', 'blue']",
          "var colors = 'red' + 'green' + 'blue'"
        ],
        correctAnswer: 2,
        points: 3
      },
      {
        text: "Which HTML tag is used to define an internal style sheet?",
        options: [
          "<script>",
          "<css>",
          "<style>",
          "<link>"
        ],
        correctAnswer: 2,
        points: 2
      },
      {
        text: "What is the purpose of the JavaScript 'typeof' operator?",
        options: [
          "To create a new variable",
          "To check the data type of a variable",
          "To convert a string to a number",
          "To define a function"
        ],
        correctAnswer: 1,
        points: 3
      }
    ],
    duration: 30,
    isPublished: true,
    isActive: true,
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    instructions: "This quiz contains 5 questions about web development basics. You have 30 minutes to complete it. Good luck!"
  },
  {
    title: "Database Design Midterm",
    description: "Comprehensive assessment of database design principles, normalization, and SQL queries.",
    type: "midterm",
    questions: [
      {
        text: "What is the primary purpose of database normalization?",
        options: [
          "To make databases faster",
          "To reduce data redundancy and improve data integrity",
          "To increase storage space",
          "To make queries more complex"
        ],
        correctAnswer: 1,
        points: 5
      },
      {
        text: "Which normal form eliminates transitive dependencies?",
        options: [
          "First Normal Form (1NF)",
          "Second Normal Form (2NF)",
          "Third Normal Form (3NF)",
          "Boyce-Codd Normal Form (BCNF)"
        ],
        correctAnswer: 2,
        points: 5
      },
      {
        text: "What SQL command is used to create a new table?",
        options: [
          "CREATE TABLE",
          "BUILD TABLE",
          "MAKE TABLE",
          "GENERATE TABLE"
        ],
        correctAnswer: 0,
        points: 3
      },
      {
        text: "Which of the following is NOT a valid SQL aggregate function?",
        options: [
          "COUNT",
          "AVG",
          "SUM",
          "CONCAT"
        ],
        correctAnswer: 3,
        points: 3
      },
      {
        text: "What is a foreign key?",
        options: [
          "A key that is always unique",
          "A key that references a primary key in another table",
          "A key that contains only numbers",
          "A key that is automatically generated"
        ],
        correctAnswer: 1,
        points: 4
      }
    ],
    duration: 60,
    isPublished: true,
    isActive: true,
    startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    instructions: "This midterm covers database design concepts. You have 60 minutes to complete 5 questions. Each question is worth different points based on complexity."
  },
  {
    title: "JavaScript Fundamentals Assignment",
    description: "Practical assignment testing JavaScript programming skills and problem-solving abilities.",
    type: "assignment",
    questions: [
      {
        text: "What will console.log(typeof null) output?",
        options: [
          "null",
          "undefined",
          "object",
          "number"
        ],
        correctAnswer: 2,
        points: 2
      },
      {
        text: "Which method is used to add an element to the end of an array?",
        options: [
          "push()",
          "pop()",
          "shift()",
          "unshift()"
        ],
        correctAnswer: 0,
        points: 2
      },
      {
        text: "What is the difference between == and === in JavaScript?",
        options: [
          "There is no difference",
          "== checks value and type, === checks only value",
          "=== checks value and type, == checks only value",
          "== is faster than ==="
        ],
        correctAnswer: 2,
        points: 4
      },
      {
        text: "What is a closure in JavaScript?",
        options: [
          "A function that has access to variables in its outer scope",
          "A way to close browser windows",
          "A method to end loops",
          "A type of variable declaration"
        ],
        correctAnswer: 0,
        points: 5
      },
      {
        text: "Which of the following is NOT a JavaScript data type?",
        options: [
          "string",
          "number",
          "boolean",
          "character"
        ],
        correctAnswer: 3,
        points: 2
      }
    ],
    duration: 45,
    isPublished: true,
    isActive: true,
    startDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    instructions: "This assignment tests your JavaScript knowledge. You have 45 minutes to complete 5 questions. Pay attention to the different point values."
  }
];

async function seedExams() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    // Get the first course (assuming it exists)
    const course = await Course.findOne();
    if (!course) {
      console.error("No courses found. Please seed courses first.");
      process.exit(1);
    }

    console.log(`Using course: ${course.title} (ID: ${course._id})`);

    // Clear existing exams for this course
    await Exam.deleteMany({ course: course._id });
    console.log("Cleared existing exams for this course");

    // Create sample exams
    const createdExams = [];
    for (const examData of sampleExams) {
      const exam = new Exam({
        ...examData,
        course: course._id
      });
      await exam.save();
      createdExams.push(exam);
      console.log(`Created exam: ${exam.title}`);
    }

    console.log(`\n✅ Successfully seeded ${createdExams.length} exams`);
    console.log("Sample exams created:");
    createdExams.forEach(exam => {
      console.log(`- ${exam.title} (${exam.type}) - ${exam.questions.length} questions, ${exam.totalPoints} points`);
    });

  } catch (error) {
    console.error("Error seeding exams:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run the seeding function
if (require.main === module) {
  seedExams();
}

module.exports = { seedExams }; 