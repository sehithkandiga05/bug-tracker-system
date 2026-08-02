const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Bug = require('../models/Bug');
const Comment = require('../models/Comment');
const { memoryUsers } = require('../controllers/authController');
const { memoryBugs } = require('../controllers/bugController');
const { memoryComments } = require('../controllers/commentController');

dotenv.config({ path: '../.env' });

const seedUsers = [
  {
    name: 'Sarah Connor (Admin)',
    email: 'admin@bugtracker.system',
    password: 'password123',
    role: 'Admin',
    department: 'DevOps',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
  },
  {
    name: 'Alex Rivera (Frontend Dev)',
    email: 'frontend@bugtracker.system',
    password: 'password123',
    role: 'Developer',
    department: 'Frontend',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
  },
  {
    name: 'Marcus Vance (Backend Dev)',
    email: 'backend@bugtracker.system',
    password: 'password123',
    role: 'Developer',
    department: 'Backend',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
  },
  {
    name: 'Elena Rostova (Tester QA)',
    email: 'qa@bugtracker.system',
    password: 'password123',
    role: 'Tester',
    department: 'QA',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  },
  {
    name: 'David Kim (Reporter)',
    email: 'reporter@bugtracker.system',
    password: 'password123',
    role: 'Reporter',
    department: 'General',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&q=80',
  },
];

const seedBugs = [
  {
    title: 'OAuth Refresh Token Loop on Session Expiration',
    description: 'When the short-lived access token expires, the axios interceptor enters an infinite refresh loop under high concurrency network requests.',
    summary: 'Infinite token refresh loop triggered upon session expiration under high concurrent client requests.',
    stepsToReproduce: '1. Log into portal\n2. Wait for 15 min token expiry\n3. Trigger 5 parallel API calls',
    expectedResult: 'Single background refresh token request should resolve all queued calls.',
    actualResult: 'Browser makes 5 parallel refresh token calls, causing 401 Unauthorized cascade.',
    environment: 'Production',
    operatingSystem: 'macOS',
    browser: 'Chrome',
    version: 'v2.4.1',
    priority: 'Critical',
    severity: 'Critical',
    category: 'Backend',
    status: 'In Progress',
    suggestedFix: 'Implement a token refresh lock (isRefreshing promise queue) inside axios response interceptor.',
  },
  {
    title: 'Kanban Card Drag Lag on High DPI Monitors',
    description: 'Dragging cards across status columns exhibits framedrops on 4K resolutions when Framer Motion transitions are active.',
    summary: 'Kanban drag and drop performance drops below 30 FPS on high resolution displays.',
    stepsToReproduce: '1. Open Kanban view on 4K display\n2. Drag any bug card rapidly across columns',
    expectedResult: '60 FPS smooth glassmorphic card dragging.',
    actualResult: 'Noticeable stutter and delayed drop event listener response.',
    environment: 'Staging',
    operatingSystem: 'Windows',
    browser: 'Edge',
    version: 'v2.4.0',
    priority: 'High',
    severity: 'Medium',
    category: 'Frontend',
    status: 'Assigned',
    suggestedFix: 'Use CSS `will-change: transform` and throttle drag position listener frames using requestAnimationFrame.',
  },
  {
    title: 'PostgreSQL Index Fragmentation in Audit Log Queries',
    description: 'Full audit log queries take > 1.8s due to missing composite index on (user_id, created_at).',
    summary: 'Slow query execution on user activity logs due to unindexed timestamp filter.',
    stepsToReproduce: '1. Navigate to Admin Panel -> Audit Logs\n2. Filter by date range',
    expectedResult: 'Query results loaded under 100ms.',
    actualResult: 'Page loader spins for ~2 seconds.',
    environment: 'Production',
    operatingSystem: 'Linux',
    browser: 'Firefox',
    version: 'v2.3.9',
    priority: 'Medium',
    severity: 'Medium',
    category: 'Database',
    status: 'Open',
    suggestedFix: 'Add composite index on `(user, createdAt)` schema attribute.',
  },
  {
    title: 'PDF Export Truncates Multiline Code Snippets',
    description: 'When downloading PDF analytics reports, long multiline stack traces overlap with table borders.',
    summary: 'PDF rendering layout overlap issue on extended text snippets.',
    stepsToReproduce: '1. Click Export PDF on bug list\n2. Inspect page 2 overflow',
    expectedResult: 'Clean pagination with text auto-wrapping.',
    actualResult: 'Text clips over table border margin.',
    environment: 'Production',
    operatingSystem: 'Windows',
    browser: 'Chrome',
    version: 'v2.4.1',
    priority: 'Low',
    severity: 'Low',
    category: 'UI/UX',
    status: 'Resolved',
    suggestedFix: 'Adjust `pdfkit` lineBreak parameters and dynamic Y-coordinate height calculation.',
  },
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bug_tracker_db';
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
    console.log('[Seeder] Connected to MongoDB. Wiping existing dataset...');

    await User.deleteMany();
    await Bug.deleteMany();
    await Comment.deleteMany();

    const createdUsers = await User.create(seedUsers);
    console.log(`[Seeder] Created ${createdUsers.length} users successfully.`);

    const admin = createdUsers.find((u) => u.role === 'Admin');
    const dev = createdUsers.find((u) => u.role === 'Developer');
    const reporter = createdUsers.find((u) => u.role === 'Reporter');

    const bugDocs = seedBugs.map((b) => ({
      ...b,
      reporter: reporter._id,
      assignedTo: dev._id,
    }));

    const createdBugs = await Bug.create(bugDocs);
    console.log(`[Seeder] Created ${createdBugs.length} sample bugs successfully.`);

    // Seed Sample Comment
    await Comment.create({
      bug: createdBugs[0]._id,
      author: dev._id,
      content: 'I am reproducing this token loop issue now. @Sarah Connor (Admin) please confirm session timeout limits.',
      mentions: [admin._id],
    });

    console.log('[Seeder] Database Seeding Complete! Exit process.');
    process.exit(0);
  } catch (error) {
    console.warn(`[Seeder Warning] Database connection failed for script seed: ${error.message}`);
    console.log('[Seeder] Populating In-Memory stores for seamless execution...');

    memoryUsers.length = 0;
    memoryBugs.length = 0;

    seedUsers.forEach((u, i) => {
      memoryUsers.push({
        _id: `mem_user_${i + 1}`,
        ...u,
      });
    });

    seedBugs.forEach((b, i) => {
      memoryBugs.push({
        _id: `mem_bug_${i + 1}`,
        ...b,
        reporter: memoryUsers[4],
        assignedTo: memoryUsers[1],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    console.log('[Seeder] In-Memory seeding completed gracefully.');
  }
};

if (require.main === module) {
  seedDB();
}

module.exports = { seedUsers, seedBugs, seedDB };
