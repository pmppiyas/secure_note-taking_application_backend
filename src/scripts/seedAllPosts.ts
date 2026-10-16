import mongoose from 'mongoose';
import connectDB from '../config/db';
import User from '../module/user/user.model';
import Post from '../module/post/post.model';

interface PostSeedItem {
  title: string;
  body: string;
  authorEmail: string;
}

const allPostsToSeed: PostSeedItem[] = [
  // ==========================================
  // ALICE DEVELOPER (Default User - 4 Posts)
  // ==========================================
  {
    title: 'Deep Dive into Node.js Event Loop & Non-Blocking Asynchronous I/O',
    body: 'Node.js delivers remarkable throughput via its single-threaded event loop backed by libuv. Mastering the interaction between the microtask queue (process.nextTick, Promise callbacks) and macrotask phases (Timers, I/O polling, Check/setImmediate) is critical to prevent thread starvation in high-concurrency microservices.',
    authorEmail: 'alice@example.com',
  },
  {
    title: 'Building Scalable REST APIs with Express, TypeScript & Zod Validation',
    body: 'Combining TypeScript with Express and Zod transforms API development. By declaring strict runtime request schemas for params, queries, and bodies, we catch malformed payloads at the middleware boundary before business logic executes, guaranteeing 100% type safety from controller to database.',
    authorEmail: 'alice@example.com',
  },
  {
    title: 'Optimizing MongoDB Query Performance with Explain Plans and Indexes',
    body: 'Never guess query performance—always inspect executionStats using .explain("executionStats")! Look out for COLLSCAN vs IXSCAN and totalDocsExamined vs nReturned. An optimal query should examine exactly the number of documents it returns, eliminating wasteful memory pressure on MongoDB Atlas.',
    authorEmail: 'alice@example.com',
  },
  {
    title: 'Clean Architecture in Node.js: Decoupling Routes, Controllers & Services',
    body: 'Separating routing definitions, request orchestration, and domain services keeps enterprise codebases maintainable. Controllers handle HTTP-specific status codes and validation, while pure service functions execute business rules and MongoDB interactions, making unit testing seamless.',
    authorEmail: 'alice@example.com',
  },

  // ==========================================
  // OTHER USERS (Bob, Charlie, Admin - 7 Posts)
  // ==========================================
  // Bob Engineer (3 Posts)
  {
    title: 'MongoDB Indexing Mastery: Enforcing the ESR Rule for Compound Indexes',
    body: 'Compound indexes must strictly follow the ESR (Equality, Sort, Range) rule. Equality predicates (such as userId) come first, sort criteria (createdAt: -1) second, and range filters last. This ensures MongoDB performs index-based sorting without loading unindexed documents into RAM.',
    authorEmail: 'bob@example.com',
  },
  {
    title: 'Demystifying MongoDB Multikey Indexes for Array Fields',
    body: 'When an indexed field holds an array—such as user interests or tags—MongoDB creates a multikey index by generating separate index keys for every array element. This enables blazing-fast $in and equality queries across tagged datasets without scanning full collections.',
    authorEmail: 'bob@example.com',
  },
  {
    title: 'Connection Pooling and Replica Sets in Production Node.js Services',
    body: 'Configuring Mongoose connection pools (maxPoolSize, minPoolSize, socketTimeoutMS) prevents connection spikes during traffic surges. When coupled with automated replica set failovers and readPreferences (secondaryPreferred for heavy analytics), your Node/Mongo backend achieves enterprise 99.99% uptime.',
    authorEmail: 'bob@example.com',
  },

  // Charlie Designer (2 Posts)
  {
    title: 'Architecting Resilient Express.js Middleware & Centralized Error Handlers',
    body: 'Production Express applications need a fail-safe error hierarchy. By wrapping asynchronous handlers with catchAsync and delegating all errors to a 4-argument global error middleware (err, req, res, next), unhandled promise rejections are completely eradicated while clients receive uniform, secure error payloads.',
    authorEmail: 'charlie@example.com',
  },
  {
    title: 'Implementing Rate Limiting & Security Headers in Express.js',
    body: 'Protecting public API endpoints against brute-force attacks requires layering helmet for secure HTTP headers, cors for domain origin locking, and express-rate-limit backed by Redis or memory stores for token bucket request throttling on authentication routes.',
    authorEmail: 'charlie@example.com',
  },

  // System Admin (2 Posts)
  {
    title: 'Relational Joins in MongoDB: Leveraging $lookup Aggregations in Express APIs',
    body: 'Although MongoDB is document-centric, normalized relationships between Users and Posts are commonplace. The $lookup aggregation pipeline stage joins foreign keys (userId -> _id) in a single database roundtrip, paired with $unwind and $project for lean, performant API payloads.',
    authorEmail: 'admin@example.com',
  },
  {
    title: 'Database Security: Principle of Least Privilege and Role-Based Access Control',
    body: 'Enforcing granular role-based access control (RBAC) at both the application layer (JWT bearer tokens with role claims) and database layer (dedicated MongoDB Atlas users with restricted read/write scopes) ensures that regular users cannot access administrative audit trails or cross-tenant datasets.',
    authorEmail: 'admin@example.com',
  },
];

async function seedAllPosts() {
  try {
    console.log('Connecting to database...');
    await connectDB();

    const users = await User.find({});
    if (users.length === 0) {
      console.error('No users found in database. Please run initial seed first.');
      process.exit(1);
    }

    const defaultUser = users[0];
    const userMap = new Map(users.map((u) => [u.email.toLowerCase(), u]));

    console.log(`Found ${users.length} users in database: ${users.map((u) => u.email).join(', ')}`);

    let aliceCount = 0;
    let othersCount = 0;

    for (const postData of allPostsToSeed) {
      const user = userMap.get(postData.authorEmail.toLowerCase()) || defaultUser;
      const authorId = user._id;

      // Upsert by title so we don't duplicate on multiple runs
      const existing = await Post.findOne({ title: postData.title });
      if (existing) {
        existing.body = postData.body;
        existing.userId = authorId;
        await existing.save();
        console.log(`[UPDATED] "${postData.title}" -> ${user.name} (${user.email})`);
      } else {
        await Post.create({
          title: postData.title,
          body: postData.body,
          userId: authorId,
        });
        console.log(`[CREATED] "${postData.title}" -> ${user.name} (${user.email})`);
      }

      if (user.email.toLowerCase() === 'alice@example.com') {
        aliceCount++;
      } else {
        othersCount++;
      }
    }

    const totalInDb = await Post.countDocuments({});
    console.log('\n======================================================');
    console.log(` Seeding Complete!`);
    console.log(` - Alice Developer posts: ${aliceCount}`);
    console.log(` - Other users posts:    ${othersCount}`);
    console.log(` - Total posts in Atlas: ${totalInDb}`);
    console.log('======================================================');
  } catch (error) {
    console.error('Failed to seed posts:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed.');
    process.exit(0);
  }
}

seedAllPosts();
