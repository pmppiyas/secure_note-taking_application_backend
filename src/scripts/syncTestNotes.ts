import mongoose from 'mongoose';
import connectDB from '../config/db';
import Post from '../module/post/post.model';
import Note from '../module/note/note.model';

async function sync() {
  await connectDB();
  const testPosts = await Post.find({
    title: { $in: ['yfyi', 'yifyuf'] },
  });

  console.log(`Found ${testPosts.length} test posts:`);
  for (const p of testPosts) {
    console.log(`- Post: ${p.title} (userId: ${p.userId})`);
    // Also create matching Note for Alice so user sees them in both places!
    const noteExists = await Note.findOne({ title: p.title, userId: p.userId });
    if (!noteExists) {
      await Note.create({
        title: p.title,
        content: p.body,
        userId: p.userId,
      });
      console.log(`  -> Created matching Note: "${p.title}"`);
    } else {
      console.log(`  -> Note already exists`);
    }
  }

  await mongoose.disconnect();
}

sync();
