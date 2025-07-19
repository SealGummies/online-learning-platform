const mongoose = require('mongoose');
require('dotenv').config();

/**
 * Drop Indexes Script
 * Useful for testing performance differences
 */

async function dropIndexes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for dropping indexes...');

    const db = mongoose.connection.db;
    const collections = ['users', 'courses', 'enrollments', 'lessons', 'exams'];

    for (const collectionName of collections) {
      console.log(`Dropping indexes for ${collectionName}...`);
      
      try {
        // Check if collection exists
        const collections = await db.listCollections({ name: collectionName }).toArray();
        if (collections.length === 0) {
          console.log(`  ⚠️  Collection ${collectionName} does not exist, skipping...`);
          continue;
        }
        
        // Get all indexes except _id
        const indexes = await db.collection(collectionName).listIndexes().toArray();
        
        for (const index of indexes) {
          if (index.name !== '_id_') {
            await db.collection(collectionName).dropIndex(index.name);
            console.log(`  Dropped: ${index.name}`);
          }
        }
      } catch (error) {
        console.log(`  ⚠️  Error processing ${collectionName}:`, error.message);
      }
    }
    
    console.log('✅ All custom indexes dropped successfully!');
    
  } catch (error) {
    console.error('❌ Error dropping indexes:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Execute if run directly
if (require.main === module) {
  dropIndexes();
}

module.exports = { dropIndexes };