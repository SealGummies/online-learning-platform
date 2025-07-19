const mongoose = require('mongoose');
require('dotenv').config();

/**
 * Query Performance Benchmark Script
 * Tests query performance before and after index creation
 */

class QueryBenchmark {
  constructor() {
    this.results = [];
  }

  async connect() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for benchmarking...');
  }

  async benchmark(queryName, queryFunction, iterations = 100) {
    console.log(`\n🔍 Benchmarking: ${queryName}`);
    
    const times = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = process.hrtime.bigint();
      await queryFunction();
      const end = process.hrtime.bigint();
      times.push(Number(end - start) / 1000000); // Convert to milliseconds
    }
    
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    
    const result = {
      queryName,
      avgTime: avgTime.toFixed(2),
      minTime: minTime.toFixed(2),
      maxTime: maxTime.toFixed(2),
      iterations
    };
    
    this.results.push(result);
    console.log(`  Average: ${result.avgTime}ms | Min: ${result.minTime}ms | Max: ${result.maxTime}ms`);
    
    return result;
  }

  async runBenchmarks() {
    const db = mongoose.connection.db;
    
    // ================================
    // USER QUERIES
    // ================================
    
    console.log('\n📊 USER QUERY BENCHMARKS');
    
    await this.benchmark('Find user by email', async () => {
      await db.collection('users').findOne({ email: 'test@example.com' });
    });
    
    await this.benchmark('Find users by role', async () => {
      await db.collection('users').find({ role: 'student' }).limit(10).toArray();
    });
    
    await this.benchmark('Find active instructors', async () => {
      await db.collection('users').find({ role: 'instructor', isActive: true }).toArray();
    });
    
    await this.benchmark('Text search users', async () => {
      try {
        await db.collection('users').find({ $text: { $search: 'John' } }).toArray();
      } catch (error) {
        // Skip text search if no text index exists
        console.log('    ⚠️  Text index not available, skipping...');
      }
    });

    // ================================
    // COURSE QUERIES
    // ================================
    
    console.log('\n📊 COURSE QUERY BENCHMARKS');
    
    await this.benchmark('Find published courses', async () => {
      await db.collection('courses').find({ 'settings.isPublished': true }).limit(20).toArray();
    });
    
    await this.benchmark('Find courses by category', async () => {
      await db.collection('courses').find({ category: 'Programming' }).toArray();
    });
    
    await this.benchmark('Find courses by instructor', async () => {
      const instructorId = new mongoose.Types.ObjectId();
      await db.collection('courses').find({ instructor: instructorId }).toArray();
    });
    
    await this.benchmark('Complex course search', async () => {
      await db.collection('courses').find({
        'settings.isPublished': true,
        category: 'Programming',
        level: 'Beginner',
        price: { $lte: 100 }
      }).sort({ 'stats.enrollments': -1 }).limit(10).toArray();
    });
    
    await this.benchmark('Course text search', async () => {
      try {
        await db.collection('courses').find({ $text: { $search: 'JavaScript' } }).toArray();
      } catch (error) {
        // Skip text search if no text index exists
        console.log('    ⚠️  Text index not available, skipping...');
      }
    });

    // ================================
    // ENROLLMENT QUERIES
    // ================================
    
    console.log('\n📊 ENROLLMENT QUERY BENCHMARKS');
    
    await this.benchmark('Find student enrollments', async () => {
      const studentId = new mongoose.Types.ObjectId();
      await db.collection('enrollments').find({ student: studentId }).toArray();
    });
    
    await this.benchmark('Find course enrollments', async () => {
      const courseId = new mongoose.Types.ObjectId();
      await db.collection('enrollments').find({ course: courseId }).toArray();
    });
    
    await this.benchmark('Find completed enrollments', async () => {
      await db.collection('enrollments').find({ status: 'completed' }).toArray();
    });
    
    await this.benchmark('Analytics: Recent enrollments', async () => {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      await db.collection('enrollments').find({
        enrollmentDate: { $gte: lastMonth }
      }).sort({ enrollmentDate: -1 }).toArray();
    });
    
    await this.benchmark('Instructor dashboard query', async () => {
      const courseId = new mongoose.Types.ObjectId();
      await db.collection('enrollments').find({
        course: courseId,
        status: 'enrolled'
      }).sort({ enrollmentDate: -1 }).toArray();
    });

    // ================================
    // LESSON QUERIES
    // ================================
    
    console.log('\n📊 LESSON QUERY BENCHMARKS');
    
    await this.benchmark('Find lessons by course', async () => {
      const courseId = new mongoose.Types.ObjectId();
      await db.collection('lessons').find({ course: courseId }).sort({ order: 1 }).toArray();
    });
    
    await this.benchmark('Find published lessons', async () => {
      const courseId = new mongoose.Types.ObjectId();
      await db.collection('lessons').find({
        course: courseId,
        'settings.isPublished': true
      }).sort({ order: 1 }).toArray();
    });

    // ================================
    // EXAM QUERIES
    // ================================
    
    console.log('\n📊 EXAM QUERY BENCHMARKS');
    
    await this.benchmark('Find course exams', async () => {
      const courseId = new mongoose.Types.ObjectId();
      await db.collection('exams').find({ course: courseId }).toArray();
    });
    
    await this.benchmark('Find published exams', async () => {
      const courseId = new mongoose.Types.ObjectId();
      await db.collection('exams').find({
        course: courseId,
        isPublished: true
      }).toArray();
    });

    // ================================
    // EXAM SUBMISSION QUERIES
    // ================================
    
    console.log('\n📊 EXAM SUBMISSION QUERY BENCHMARKS');
    
    await this.benchmark('Find student submissions', async () => {
      try {
        const studentId = new mongoose.Types.ObjectId();
        await db.collection('examsubmissions').find({ student: studentId }).toArray();
      } catch (error) {
        console.log('    ⚠️  examsubmissions collection not available, skipping...');
      }
    });
    
    await this.benchmark('Find exam submissions', async () => {
      try {
        const examId = new mongoose.Types.ObjectId();
        await db.collection('examsubmissions').find({ exam: examId }).toArray();
      } catch (error) {
        console.log('    ⚠️  examsubmissions collection not available, skipping...');
      }
    });
    
    await this.benchmark('Top scores query', async () => {
      try {
        const examId = new mongoose.Types.ObjectId();
        await db.collection('examsubmissions').find({ exam: examId })
          .sort({ score: -1 }).limit(10).toArray();
      } catch (error) {
        console.log('    ⚠️  examsubmissions collection not available, skipping...');
      }
    });
  }

  async explainQuery(queryName, queryFunction) {
    console.log(`\n🔍 Explaining: ${queryName}`);
    
    try {
      const explanation = await queryFunction();
      console.log(JSON.stringify(explanation, null, 2));
    } catch (error) {
      console.error('Error explaining query:', error);
    }
  }

  async runExplainPlans() {
    const db = mongoose.connection.db;
    
    console.log('\n📋 QUERY EXECUTION PLANS');
    
    await this.explainQuery('Find user by email', async () => {
      return await db.collection('users').find({ email: 'test@example.com' }).explain('executionStats');
    });
    
    await this.explainQuery('Complex course search', async () => {
      return await db.collection('courses').find({
        'settings.isPublished': true,
        category: 'Programming',
        level: 'Beginner',
        price: { $lte: 100 }
      }).sort({ 'stats.enrollments': -1 }).limit(10).explain('executionStats');
    });
    
    await this.explainQuery('Student enrollments', async () => {
      const studentId = new mongoose.Types.ObjectId();
      return await db.collection('enrollments').find({ student: studentId }).explain('executionStats');
    });
    
    await this.explainQuery('Course lessons ordered', async () => {
      const courseId = new mongoose.Types.ObjectId();
      return await db.collection('lessons').find({ course: courseId }).sort({ order: 1 }).explain('executionStats');
    });
  }

  printSummary() {
    console.log('\n📊 BENCHMARK SUMMARY');
    console.log('='.repeat(80));
    
    this.results.forEach(result => {
      console.log(`${result.queryName.padEnd(40)} | Avg: ${result.avgTime.toString().padStart(8)}ms`);
    });
    
    console.log('='.repeat(80));
  }

  async run() {
    await this.connect();
    await this.runBenchmarks();
    await this.runExplainPlans();
    this.printSummary();
    await mongoose.disconnect();
  }
}

// Execute if run directly
if (require.main === module) {
  const benchmark = new QueryBenchmark();
  benchmark.run();
}

module.exports = QueryBenchmark;