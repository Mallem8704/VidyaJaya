const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Test = require('./models/Test');
const Question = require('./models/Question');
const bcrypt = require('bcryptjs');

dotenv.config();

const seedDB = async () => {
  try {
    console.log('Connecting to MongoDB...', process.env.MONGO_URI);
    if (!process.env.MONGO_URI || process.env.MONGO_URI === 'mongodb://localhost:27017/vidyajaya') {
      console.log('Using local Mongo...');
      await mongoose.connect('mongodb://127.0.0.1:27017/vidyajaya');
    } else {
      await mongoose.connect(process.env.MONGO_URI);
    }
    
    // Clear existing
    await User.deleteMany();
    await Test.deleteMany();
    await Question.deleteMany();

    console.log('Database Cleared.');

    // Create Demo User
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Demo@123', salt);

    const user = await User.create({
      name: 'Rahul Demo',
      email: 'demo@vidyajaya.in',
      password: hashedPassword,
      examGoal: 'UPSC',
      isVerified: true,
      streak: { current: 12, max: 20, freezesRemaining: 2 },
      coins: 340,
      globalRank: 342
    });

    console.log('Demo User Created:', user.email);

    // Create Sample Test 1
    const test1 = await Test.create({
      title: 'UPSC Prelims GS Paper 1 — Mock Set #47',
      category: 'UPSC',
      totalQuestions: 3,
      totalMarks: 6, // 3 q's * 2 marks
      negativeMarking: 0.67,
      duration: 120, // 2 hours
      difficulty: 'medium',
      isPaid: false
    });

    // Create Questions for Test 1
    const q1 = await Question.create({
      testId: test1._id,
      text: 'Which article of the Indian Constitution deals with the Right to Constitutional Remedies?',
      options: ['Article 14', 'Article 19', 'Article 32', 'Article 44'],
      correctIndex: 2,
      explanation: 'Article 32 provides the right to move the Supreme Court for enforcement of fundamental rights.',
      category: 'Polity'
    });

    const q2 = await Question.create({
      testId: test1._id,
      text: 'The Directive Principles of State Policy in the Indian Constitution are inspired by the constitution of which country?',
      options: ['USA', 'Ireland', 'UK', 'Canada'],
      correctIndex: 1,
      explanation: 'The Directive Principles of State Policy are inspired by the Irish Constitution.',
      category: 'Polity'
    });

    const q3 = await Question.create({
      testId: test1._id,
      text: 'Which of the following is responsible for the preparation of National Income Estimates in India?',
      options: ['Planning Commission', 'Reserve Bank of India', 'Central Statistical Organisation', 'Ministry of Finance'],
      correctIndex: 2,
      explanation: 'The Central Statistical Organisation (CSO) under the MoSPI is responsible for computing national income.',
      category: 'Economy'
    });

    test1.questions = [q1._id, q2._id, q3._id];
    await test1.save();

    console.log('Test with Mock Questions created.');
    
    console.log('Data Seeding Completed.');
    process.exit();
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedDB();
