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
        ]);
        console.log(`Created sample posts for ${bob.email}`);
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
