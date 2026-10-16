import mongoose from 'mongoose';
import connectDB from '../config/db';
import User from '../module/user/user.model';
import Note from '../module/note/note.model';

const aliceNotesData = [
  {
    title: 'Q4 Security Audit & Compound Indexing Strategy',
    content:
      'Ensuring all personal note queries utilize the compound index { userId: 1, createdAt: -1 } according to the ESR (Equality, Sort, Range) rule. This guarantees zero in-memory sorting overhead in MongoDB Atlas and ensures lightning-fast retrieval even with millions of records.',
  },
  {
    title: 'JWT Authentication & RBAC Access Matrix',
    content:
      'User roles are enforced strictly via JWT bearer tokens. Alice possesses standard USER permissions allowing private note CRUD operations, while ADMIN users possess platform-wide audit visibility without compromising data integrity.',
  },
  {
    title: 'Node.js Microservices Resilience Checklist',
    content:
      '1. Enable Graceful Shutdown with SIGTERM/SIGINT handlers.\n2. Configure Mongoose connection pool (maxPoolSize: 10, minPoolSize: 2, socketTimeoutMS: 45000).\n3. Centralize async error catching using catchAsync higher-order functions.\n4. Protect sensitive headers with Helmet and CORS whitelist.',
  },
  {
    title: 'MongoDB Aggregation Pipeline Optimization',
    content:
      'When performing relational $lookup joins between users and posts, always place $match stages first to minimize the working dataset before applying $lookup, $unwind, and $project. This reduces RAM allocation and network bandwidth.',
  },
  {
    title: 'Personal Developer Scratchpad & Architecture Notes',
    content:
      'Feature-based modular architecture cleanly separates domain concerns: routes -> validation middleware -> controllers -> services -> models. Keeps unit testing predictable and refactoring painless.',
  },
];

async function seedAliceNotes() {
  try {
    console.log('Connecting to database...');
    await connectDB();

    const alice = await User.findOne({ email: 'alice@example.com' });
    if (!alice) {
      console.error('Alice user not found in database!');
      process.exit(1);
    }

    console.log(`Found Alice: ${alice.name} (${alice._id})`);

    const createdNotes = [];
    for (const noteData of aliceNotesData) {
      const existing = await Note.findOne({
        title: noteData.title,
        userId: alice._id,
      });

      if (existing) {
        existing.content = noteData.content;
        await existing.save();
        console.log(`[UPDATED] Note "${noteData.title}"`);
        createdNotes.push(existing);
      } else {
        const note = await Note.create({
          title: noteData.title,
          content: noteData.content,
          userId: alice._id,
        });
        console.log(`[CREATED] Note "${note.title}"`);
        createdNotes.push(note);
      }
    }

    const totalAliceNotes = await Note.countDocuments({ userId: alice._id });
    console.log(`\nSuccessfully seeded ${createdNotes.length} notes for Alice!`);
    console.log(`Total notes for Alice in database: ${totalAliceNotes}`);
  } catch (err) {
    console.error('Error seeding Alice notes:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed.');
    process.exit(0);
  }
}

seedAliceNotes();
