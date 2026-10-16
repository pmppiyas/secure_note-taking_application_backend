import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import config from './config';
import connectDB from './config/db';
import User from './module/user/user.model';
import Note from './module/note/note.model';
import Post from './module/post/post.model';

const seedDatabase = async (): Promise<void> => {
  try {
    console.log('Connecting to database for seeding...');
    await connectDB();

    console.log('Checking and seeding Admin user...');
    const adminPasswordHash = await bcrypt.hash(
      config.seedAdminPassword,
      config.bcryptSaltRounds
    );

    let admin = await User.findOne({ email: config.seedAdminEmail });
    if (!admin) {
      admin = await User.create({
        name: 'System Admin',
        email: config.seedAdminEmail,
        password: adminPasswordHash,
        role: 'ADMIN',
        interests: ['leadership', 'security', 'tech'],
      });
      console.log(`Admin user created: ${admin.email}`);
    } else {
      console.log(`Admin user already exists: ${admin.email}`);
    }

    console.log('Checking and seeding default sample users...');
    const defaultPasswordHash = await bcrypt.hash(
      config.seedDefaultPassword,
      config.bcryptSaltRounds
    );

    const sampleUsersData = [
      {
        name: 'Alice Developer',
        email: 'alice@example.com',
        password: defaultPasswordHash,
        role: 'USER' as const,
        interests: ['coding', 'typescript', 'react'],
      },
      {
        name: 'Bob Engineer',
        email: 'bob@example.com',
        password: defaultPasswordHash,
        role: 'USER' as const,
        interests: ['coding', 'mongodb', 'gaming'],
      },
      {
        name: 'Charlie Designer',
        email: 'charlie@example.com',
        password: defaultPasswordHash,
        role: 'USER' as const,
        interests: ['design', 'music', 'gaming'],
      },
    ];

    const users = [];
    for (const userData of sampleUsersData) {
      let user = await User.findOne({ email: userData.email });
      if (!user) {
        user = await User.create(userData);
        console.log(`Sample user created: ${user.email}`);
      } else {
        console.log(`Sample user already exists: ${user.email}`);
      }
      users.push(user);
    }

    console.log('Checking and seeding sample notes and posts...');
    const [alice, bob] = users;

    if (alice) {
      const aliceNoteCount = await Note.countDocuments({ userId: alice._id });
      if (aliceNoteCount === 0) {
        await Note.create([
          {
            title: 'Welcome to Secure Notes',
            content: 'This is my first private note encrypted and secured.',
            userId: alice._id,
          },
          {
            title: 'Learning TypeScript Aggregations',
            content: 'MongoDB aggregate pipelines with $match and $lookup are powerful.',
            userId: alice._id,
          },
        ]);
        console.log(`Created sample notes for ${alice.email}`);
      }

      const alicePostCount = await Post.countDocuments({ userId: alice._id });
      if (alicePostCount === 0) {
        await Post.create([
          {
            title: 'Getting Started with Modular Architecture',
            body: 'Feature-based modular architecture separates domain logic cleanly.',
            userId: alice._id,
          },
        ]);
        console.log(`Created sample posts for ${alice.email}`);
      }
    }

    if (bob) {
      const bobNoteCount = await Note.countDocuments({ userId: bob._id });
      if (bobNoteCount === 0) {
        await Note.create([
          {
            title: 'Database Indexing Tips',
            content: 'Compound indexes must consider equality, sort, and range rules.',
            userId: bob._id,
          },
        ]);
        console.log(`Created sample notes for ${bob.email}`);
      }

      const bobPostCount = await Post.countDocuments({ userId: bob._id });
      if (bobPostCount === 0) {
        await Post.create([
          {
            title: 'Why MongoDB Indexes Matter',
            body: 'Proper indexing speeds up queries and enables efficient multikey aggregation.',
            userId: bob._id,
          },
          {
            title: 'MongoDB Indexing Mastery: Enforcing the ESR Rule for Compound Indexes',
            body: 'Compound indexing in MongoDB requires strict adherence to the ESR (Equality, Sort, Range) rule. Always position exact equality filter fields (such as userId) first, sort fields (such as createdAt: -1) second, and range filters last. This design ensures MongoDB executes pure index scans with zero in-memory sort overhead, eliminating DISK_USE spills on high-volume collections.',
            userId: bob._id,
          },
        ]);
        console.log(`Created sample posts for ${bob.email}`);
      }
    }

    // Seed tech posts for other users if needed
    const techPosts = [
      {
        title: 'Deep Dive into Node.js Event Loop & Non-Blocking Asynchronous I/O',
        body: 'Node.js achieves exceptional throughput through its single-threaded event loop powered by libuv. Grasping the priority between the microtask queue (process.nextTick, Promise callbacks) and macrotask phases (Timers, I/O, Poll, Check) is vital. Delegating CPU-intensive operations such as bcrypt password hashing to libuv background worker threads keeps latency low and throughput high.',
        userId: alice?._id,
      },
      {
        title: 'Architecting Resilient Express.js Middleware & Centralized Error Handlers',
        body: 'Production-ready Express.js architectures demand modular router separation and an unbreachable error-handling pipeline. By wrapping asynchronous controllers in a higher-order catchAsync utility and deploying a 4-parameter global error middleware (err, req, res, next), unhandled promise rejections are eliminated while returning type-safe, predictable JSON responses.',
        userId: users[2]?._id || alice?._id,
      },
      {
        title: 'Relational Joins in MongoDB: Leveraging $lookup Aggregations in Express APIs',
        body: 'Although MongoDB is document-based, real-world systems regularly model 1-to-many relationships across collections. Using the $lookup aggregation stage in Express endpoints allows developers to perform foreign key joins (userId -> _id) in a single database roundtrip, complemented by $unwind and $project stages to shape concise, production-grade API payloads.',
        userId: admin?._id,
      },
    ];

    for (const tp of techPosts) {
      if (tp.userId) {
        const exists = await Post.findOne({ title: tp.title });
        if (!exists) {
          await Post.create(tp);
          console.log(`Created tech post: "${tp.title}"`);
        }
      }
    }

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed.');
    process.exit(0);
  }
};

seedDatabase();
