const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static('public'));

// Database setup
const db = new sqlite3.Database(process.env.DATABASE_URL || './game.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_packet_sent DATETIME
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS collections (
    user_id TEXT,
    monster_id INTEGER,
    count INTEGER DEFAULT 1,
    first_obtained DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    PRIMARY KEY(user_id, monster_id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS packets_sent (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    monster_id INTEGER,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);
});

// Monsters: 5 common + 1 ultra-rare
const MONSTERS = {
  1: { name: 'Blobby', emoji: '🟦', rarity: 'common', desc: 'A geometric dreamer' },
  2: { name: 'Spindle', emoji: '🌀', rarity: 'common', desc: 'Ever rotating' },
  3: { name: 'Gloop', emoji: '🫧', rarity: 'common', desc: 'Bouncy & buoyant' },
  4: { name: 'Whisper', emoji: '👻', rarity: 'common', desc: 'Soft & spectral' },
  5: { name: 'Zinger', emoji: '⚡', rarity: 'common', desc: 'Pure energy' },
  6: { name: 'Arcana', emoji: '✨', rarity: 'ultra-rare', desc: 'The legendary one' }
};

function rollMonster() {
  const roll = Math.random() * 1000;
  if (roll < 1) return 6; // 1-in-1000 for Arcana
  return Math.floor(Math.random() * 5) + 1;
}

function generateUserId() {
  return crypto.randomBytes(8).toString('hex');
}

// Email setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

function createEmailTemplate(userName, monster, isRare) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; }
        .container { max-width: 500px; margin: 40px auto; background: white; border-radius: 16px; padding: 40px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        h1 { color: #333; margin: 0 0 10px 0; }
        .packet { font-size: 80px; margin: 30px 0; animation: bounce 2s infinite; }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
        .reveal { font-size: 120px; margin: 20px 0; }
        .name { font-size: 32px; font-weight: bold; color: ${isRare ? '#ffd700' : '#667eea'}; margin: 20px 0; }
        .desc { color: #666; font-size: 16px; margin-bottom: 30px; }
        .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; margin-top: 20px; }
        ${isRare ? '.rare { color: #ffd700; font-weight: bold; font-size: 18px; margin-top: 20px; }' : ''}
      </style>
    </head>
    <body>
      <div class="container">
        <h1>📦 Your Mystery Packet Arrived!</h1>
        <div class="packet">📦</div>
        <h2>You found...</h2>
        <div class="reveal">${monster.emoji}</div>
        <div class="name">${monster.name}</div>
        <div class="desc">${monster.desc}</div>
        ${isRare ? '<div class="rare">🎉 ULTRA-RARE! 1 in 1,000! 🎉</div>' : ''}
        <a href="${process.env.APP_URL || 'https://mystery-packet.vercel.app'}" class="button">View Your Collection</a>
        <p style="color: #999; font-size: 12px; margin-top: 40px;">Come back tomorrow for another packet!</p>
      </div>
    </body>
    </html>
  `;
}

async function sendPacketEmail(email, monster, isRare) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: isRare ? '🎉 ULTRA-RARE! Your Mystery Packet!' : '📦 Your Daily Mystery Packet',
      html: createEmailTemplate('Friend', monster, isRare)
    });
    console.log(`Email sent to ${email}: ${monster.name}`);
  } catch (error) {
    console.error('Email error:', error);
  }
}

// Signup endpoint
app.post('/api/signup', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  const userId = generateUserId();
  db.run('INSERT INTO users (id, email) VALUES (?, ?)', [userId, email], async function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'Email already registered' });
      }
      return res.status(500).json({ error: 'Signup failed' });
    }
    
    // Send first packet immediately
    const firstMonsterId = rollMonster();
    const firstMonster = MONSTERS[firstMonsterId];
    const isRare = firstMonsterId === 6;
    
    db.run(`INSERT INTO collections (user_id, monster_id) VALUES (?, ?)
             ON CONFLICT(user_id, monster_id) DO UPDATE SET count = count + 1`,
      [userId, firstMonsterId]);
    db.run('UPDATE users SET last_packet_sent = CURRENT_TIMESTAMP WHERE id = ?', [userId]);
    db.run('INSERT INTO packets_sent (user_id, monster_id) VALUES (?, ?)', [userId, firstMonsterId]);
    
    await sendPacketEmail(email, firstMonster, isRare);
    
    res.json({ userId, message: 'Welcome! Check your email for your first monster. Tomorrow you\'ll get another!' });
  });
});

// Get collection
app.get('/api/collection/:userId', (req, res) => {
  const { userId } = req.params;
  db.all('SELECT monster_id, count FROM collections WHERE user_id = ?', [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    
    const collection = {};
    let totalFound = 0;
    rows.forEach(row => {
      collection[row.monster_id] = {
        ...MONSTERS[row.monster_id],
        count: row.count
      };
      totalFound += row.count;
    });
    
    const completed = Object.keys(MONSTERS).every(id => collection[id]);
    res.json({ collection, completed, totalMonsters: Object.keys(MONSTERS).length, totalFound });
  });
});

// Cron: Send packets daily at 9 AM UTC
if (process.env.NODE_ENV !== 'development') {
  cron.schedule('0 9 * * *', () => {
    console.log('🕘 Sending daily packets...');
    db.all('SELECT id, email FROM users', async (err, users) => {
      if (err) {
        console.error('Failed to fetch users:', err);
        return;
      }
      for (const user of (users || [])) {
        const monsterId = rollMonster();
        const monster = MONSTERS[monsterId];
        const isRare = monsterId === 6;
        
        db.run(`INSERT OR IGNORE INTO collections (user_id, monster_id) VALUES (?, ?)
                 ON CONFLICT(user_id, monster_id) DO UPDATE SET count = count + 1`,
          [user.id, monsterId]);
        db.run('UPDATE users SET last_packet_sent = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);
        db.run('INSERT INTO packets_sent (user_id, monster_id) VALUES (?, ?)', [user.id, monsterId]);
        
        await sendPacketEmail(user.email, monster, isRare);
      }
    });
  });
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🎮 Mystery Packet Game running on port ${PORT}`);
});
