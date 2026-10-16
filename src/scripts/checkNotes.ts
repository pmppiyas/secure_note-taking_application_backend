import mongoose from 'mongoose';
import connectDB from '../config/db';
import User from '../module/user/user.model';
import Note from '../module/note/note.model';

async function check() {
  await connectDB();
  const users = await User.find({}, '_id name email role');
  console.log('USERS IN DB:');
  console.log(users);

  const notes = await Note.find({});
  console.log('\nTOTAL NOTES IN DB:', notes.length);
  notes.forEach((n) => {
    console.log(`- Note "${n.title}" (userId: ${n.userId})`);
  });

  await mongoose.disconnect();
}

check();
