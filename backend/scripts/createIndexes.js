const mongoose = require('mongoose');
require('dotenv').config();

/**
 * Database Index Creation Script
 * Creates optimized indexes for the online learning platform
 */

async function createIndexes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for index creation...');

    const db = mongoose.connection.db;

    // ================================
    // USER COLLECTION INDEXES
    // ================================
    
    console.log('Creating User collection indexes...');
    
    // 1. Email index (unique, frequently queried for authentication)
    await db.collection('users').createIndex(
      { email: 1 }, 
      { unique: true, background: true }
    );
    
    // 2. Role-based queries (filtering users by role)
    await db.collection('users').createIndex(
      { role: 1 }, 
      { background: true }
    );
    
    // 3. Compound index for role + status queries
    await db.collection('users').createIndex(
      { role: 1, isActive: 1 }, 
      { background: true }
    );
    
    // 4. Text search index for user names
    await db.collection('users').createIndex(
      { firstName: 'text', lastName: 'text' }, 
      { background: true }
    );

    // ================================
    // COURSE COLLECTION INDEXES
    // ================================
    
    console.log('Creating Course collection indexes...');
    
    // 1. Instructor-based queries (get courses by instructor)
    await db.collection('courses').createIndex(
      { instructor: 1 }, 
      { background: true }
    );
    
    // 2. Category and level filtering
    await db.collection('courses').createIndex(
      { category: 1, level: 1 }, 
      { background: true }
    );
    
    // 3. Published courses (most common query)
    await db.collection('courses').createIndex(
      { 'settings.isPublished': 1 }, 
      { background: true }
    );
    
    // 4. Compound index for course discovery
    await db.collection('courses').createIndex(
      { 'settings.isPublished': 1, category: 1, level: 1 }, 
      { background: true }
    );
    
    // 5. Price range queries
    await db.collection('courses').createIndex(
      { price: 1 }, 
      { background: true }
    );
    
    // 6. Creation date for sorting
    await db.collection('courses').createIndex(
      { createdAt: -1 }, 
      { background: true }
    );
    
    // 7. Text search index for course titles and descriptions
    await db.collection('courses').createIndex(
      { title: 'text', description: 'text' }, 
      { background: true }
    );
    
    // 8. Stats-based sorting (popular courses)
    await db.collection('courses').createIndex(
      { 'stats.enrollments': -1 }, 
      { background: true }
    );

    // ================================
    // ENROLLMENT COLLECTION INDEXES
    // ================================
    
    console.log('Creating Enrollment collection indexes...');
    
    // 1. Student-based queries (get student's enrollments)
    await db.collection('enrollments').createIndex(
      { student: 1 }, 
      { background: true }
    );
    
    // 2. Course-based queries (get course enrollments)
    await db.collection('enrollments').createIndex(
      { course: 1 }, 
      { background: true }
    );
    
    // 3. Compound index for student-course lookup (prevent duplicates)
    await db.collection('enrollments').createIndex(
      { student: 1, course: 1 }, 
      { unique: true, background: true }
    );
    
    // 4. Status-based filtering
    await db.collection('enrollments').createIndex(
      { status: 1 }, 
      { background: true }
    );
    
    // 5. Enrollment date for analytics
    await db.collection('enrollments').createIndex(
      { enrollmentDate: -1 }, 
      { background: true }
    );
    
    // 6. Progress tracking
    await db.collection('enrollments').createIndex(
      { 'progress.completionPercentage': 1 }, 
      { background: true }
    );
    
    // 7. Compound index for instructor dashboard
    await db.collection('enrollments').createIndex(
      { course: 1, status: 1, enrollmentDate: -1 }, 
      { background: true }
    );

    // ================================
    // LESSON COLLECTION INDEXES
    // ================================
    
    console.log('Creating Lesson collection indexes...');
    
    // 1. Course-based queries (get lessons by course)
    await db.collection('lessons').createIndex(
      { course: 1 }, 
      { background: true }
    );
    
    // 2. Course and order for sequential access
    await db.collection('lessons').createIndex(
      { course: 1, order: 1 }, 
      { background: true }
    );
    
    // 3. Instructor-based queries
    await db.collection('lessons').createIndex(
      { instructor: 1 }, 
      { background: true }
    );
    
    // 4. Published lessons
    await db.collection('lessons').createIndex(
      { 'settings.isPublished': 1 }, 
      { background: true }
    );
    
    // 5. Compound index for lesson discovery
    await db.collection('lessons').createIndex(
      { course: 1, 'settings.isPublished': 1, order: 1 }, 
      { background: true }
    );

    // ================================
    // EXAM COLLECTION INDEXES
    // ================================
    
    console.log('Creating Exam collection indexes...');
    
    // 1. Course-based queries
    await db.collection('exams').createIndex(
      { course: 1 }, 
      { background: true }
    );
    
    // 2. Instructor-based queries
    await db.collection('exams').createIndex(
      { instructor: 1 }, 
      { background: true }
    );
    
    // 3. Published exams
    await db.collection('exams').createIndex(
      { isPublished: 1 }, 
      { background: true }
    );
    
    // 4. Compound index for exam management
    await db.collection('exams').createIndex(
      { course: 1, isPublished: 1 }, 
      { background: true }
    );

    // ================================
    // EXAM SUBMISSION COLLECTION INDEXES
    // ================================
    
    console.log('Creating ExamSubmission collection indexes...');
    
    // 1. Student-based queries
    await db.collection('examsubmissions').createIndex(
      { student: 1 }, 
      { background: true }
    );
    
    // 2. Exam-based queries
    await db.collection('examsubmissions').createIndex(
      { exam: 1 }, 
      { background: true }
    );
    
    // 3. Compound index for student-exam lookup
    await db.collection('examsubmissions').createIndex(
      { student: 1, exam: 1 }, 
      { background: true }
    );
    
    // 4. Submission date for analytics
    await db.collection('examsubmissions').createIndex(
      { submittedAt: -1 }, 
      { background: true }
    );
    
    // 5. Score-based sorting
    await db.collection('examsubmissions').createIndex(
      { score: -1 }, 
      { background: true }
    );

    console.log('✅ All indexes created successfully!');
    
    // Display created indexes
    await displayIndexes();
    
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
  } finally {
    await mongoose.disconnect();
  }
}

async function displayIndexes() {
  console.log('\n📊 Created Indexes Summary:');
  
  const collections = ['users', 'courses', 'enrollments', 'lessons', 'exams', 'examsubmissions'];
  
  for (const collectionName of collections) {
    const indexes = await mongoose.connection.db.collection(collectionName).listIndexes().toArray();
    console.log(`\n${collectionName.toUpperCase()} (${indexes.length} indexes):`);
    indexes.forEach(index => {
      console.log(`  - ${JSON.stringify(index.key)} ${index.unique ? '(UNIQUE)' : ''}`);
    });
  }
}

// Execute if run directly
if (require.main === module) {
  createIndexes();
}

module.exports = { createIndexes };