import mongoose from 'mongoose';
import connectDB from '../config/db';
import User from '../module/user/user.model';
import Post from '../module/post/post.model';

const techPosts = [
  {
    title: 'MongoDB Indexing Mastery: Enforcing the ESR Rule for Compound Indexes',
    body: 'Compound indexing in MongoDB requires strict adherence to the ESR (Equality, Sort, Range) rule. Always position exact equality filter fields (such as userId) first, sort fields (such as createdAt: -1) second, and range filters last. This design ensures MongoDB executes pure index scans with zero in-memory sort overhead, eliminating DISK_USE spills on high-volume collections.',
    preferredAuthor: 'bob@example.com',
  },
  {
    title: 'Deep Dive into Node.js Event Loop & Non-Blocking Asynchronous I/O',
    body: 'Node.js achieves exceptional throughput through its single-threaded event loop powered by libuv. Grasping the priority between the microtask queue (process.nextTick, Promise callbacks) and macrotask phases (Timers, I/O, Poll, Check) is vital. Delegating CPU-intensive operations such as bcrypt password hashing to libuv background worker threads keeps latency low and throughput high.',
    preferredAuthor: 'alice@example.com',
  },
  {
    title: 'Architecting Resilient Express.js Middleware & Centralized Error Handlers',
    body: 'Production-ready Express.js architectures demand modular router separation and an unbreachable error-handling pipeline. By wrapping asynchronous controllers in a higher-order catchAsync utility and deploying a 4-parameter global error middleware (err, req, res, next), unhandled promise rejections are eliminated while returning type-safe, predictable JSON responses.',
    preferredAuthor: 'charlie@example.com',
  },
  {
    title: 'Relational Joins in MongoDB: Leveraging $lookup Aggregations in Express APIs',
    body: 'Although MongoDB is document-based, real-world systems regularly model 1-to-many relationships across collections. Using the $lookup aggregation stage in Express endpoints allows developers to perform foreign key joins (userId -> _id) in a single database roundtrip, complemented by $unwind and $project stages to shape concise, production-grade API payloads.',
    preferredAuthor: 'admin@example.com',
  },
];

async function seedPosts() {
  try {
    console.log('Connecting to database...');
    await connectDB();

    // Fetch existing users
    const users = await User.find({});
    if (users.length === 0) {
      console.error('No users found in database. Please run initial seed first.');
      process.exit(1);
    }

    const defaultUser = users[0];
    const userMap = new Map(users.map((u) => [u.email, u._id]));

    console.log(`Found ${users.length} users in database.`);

    const seededPosts = [];

    for (const postData of techPosts) {
      // Find matching user or fallback to first user
      const authorId = userMap.get(postData.preferredAuthor) || defaultUser._id;

      // Check if post with this title already exists
      const existing = await Post.findOne({ title: postData.title });
      if (existing) {
        // Update content to ensure it matches
        existing.body = postData.body;
        existing.userId = authorId;
        await existing.save();
        console.log(`Updated existing post: "${postData.title}"`);
        seededPosts.push(existing);
      } else {
        const created = await Post.create({
          title: postData.title,
          body: postData.body,
          userId: authorId,
        });
        console.log(`Created new post: "${created.title}" (Author: ${authorId})`);
        seededPosts.push(created);
      }
    }

    console.log(`\nSuccessfully seeded ${seededPosts.length} posts about MongoDB, Node.js, and Express!`);
    console.log('----------------------------------------------------');
    seededPosts.forEach((p, idx) => {
      console.log(`[${idx + 1}] ${p.title}`);
    });
    console.log('----------------------------------------------------');
  } catch (error) {
    console.error('Failed to seed posts:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed.');
    process.exit(0);
  }
}

seedPosts();
