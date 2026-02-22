# 📦 Mystery Packet — Collect Unique Monsters Daily

A delightful daily mystery game where users collect unique monsters delivered to their email inbox. Beautiful, polished UI with smooth animations and instant email delivery.

## ✨ Features

- **Daily Deliveries**: One monster arrives in your email every day at 9 AM UTC
- **Collection Tracking**: Beautiful dashboard showing all 6 unique monsters
- **Ultra-Rare Drops**: 1-in-1000 chance to get the legendary Arcana ✨
- **Progress Tracking**: Visual progress bar + monster collection count
- **Email Notifications**: Gorgeous HTML emails with animations
- **Responsive Design**: Works perfectly on mobile and desktop

## 🎮 Monsters

| Monster | Emoji | Rarity | Description |
|---------|-------|--------|-------------|
| Blobby | 🟦 | Common | A geometric dreamer |
| Spindle | 🌀 | Common | Ever rotating |
| Gloop | 🫧 | Common | Bouncy & buoyant |
| Whisper | 👻 | Common | Soft & spectral |
| Zinger | ⚡ | Common | Pure energy |
| Arcana | ✨ | Ultra-Rare | The legendary one (1 in 1000) |

## 🚀 Deploy to Vercel (Free)

1. **Clone or download** this repository
2. **Install Vercel CLI**: `npm i -g vercel`
3. **Deploy**: `vercel`
4. **Set Environment Variables** in Vercel dashboard:
   - `EMAIL_USER` - Your Gmail address
   - `EMAIL_PASS` - Gmail App Password (see below)
   - `APP_URL` - Your Vercel URL (e.g., `https://mystery-packet.vercel.app`)

### Get Gmail App Password

1. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Select "Mail" and "Windows Computer"
3. Copy the 16-character password
4. Use this as `EMAIL_PASS` (spaces removed)

## 🏃 Run Locally

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your Gmail credentials

# Run in development (no cron)
npm run dev

# Server runs on http://localhost:3000
```

## 📡 API Reference

### Signup
```bash
POST /api/signup
Content-Type: application/json

{ "email": "user@example.com" }
```

**Response:**
```json
{
  "userId": "a1b2c3d4",
  "message": "Welcome! Check your email for your first monster..."
}
```

### Get Collection
```bash
GET /api/collection/:userId
```

**Response:**
```json
{
  "collection": {
    "1": { "name": "Blobby", "emoji": "🟦", "rarity": "common", "count": 2 },
    "2": { "name": "Spindle", "emoji": "🌀", "rarity": "common", "count": 1 }
  },
  "completed": false,
  "totalMonsters": 6,
  "totalFound": 3
}
```

## 🗄️ Database Schema

```sql
-- Users
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_packet_sent DATETIME
);

-- Collections (monster counts per user)
CREATE TABLE collections (
  user_id TEXT,
  monster_id INTEGER,
  count INTEGER DEFAULT 1,
  first_obtained DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id),
  PRIMARY KEY(user_id, monster_id)
);

-- Packet history
CREATE TABLE packets_sent (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  monster_id INTEGER,
  sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id)
);
```

## 🎯 Future Features

- **Trading System**: Swap duplicates with other players
- **Leaderboard**: First to complete full collection
- **Streaks**: Bonus for consecutive daily logins
- **Seasonal Monsters**: Limited-time special editions
- **Social Sharing**: Show off rare finds
- **Notifications**: Push alerts for rare drops

## 🛠️ Tech Stack

- **Backend**: Node.js + Express
- **Database**: SQLite (local) / PostgreSQL (production)
- **Email**: Nodemailer + Gmail
- **Scheduling**: node-cron (daily sends)
- **Frontend**: Vanilla JavaScript + CSS3 animations
- **Hosting**: Vercel (serverless)

## 📝 Environment Variables

```
EMAIL_USER=your-gmail@gmail.com          # Gmail address
EMAIL_PASS=xxxx-xxxx-xxxx-xxxx           # Gmail app password
NODE_ENV=production                      # production or development
PORT=3000                                # Port (Vercel ignores)
APP_URL=https://mystery-packet.vercel.app # Your deployed URL
DATABASE_URL=./game.db                   # SQLite path (local only)
```

## 📧 Email Template

Users receive beautiful HTML emails with:
- Animated packet reveal 📦
- Monster emoji + name
- Rarity indicator (ultra-rare gets special styling)
- Link back to collection dashboard
- Reminder that a new packet arrives tomorrow

## ⚙️ Cron Schedule

Daily sends happen at **9 AM UTC** (adjust in `server.js`):
```javascript
cron.schedule('0 9 * * *', sendDailyPackets);
```

## 🚨 Troubleshooting

**Emails not sending?**
- Check Gmail app password (not regular password)
- Verify email address matches
- Check Vercel logs: `vercel logs`

**Database errors?**
- Delete `game.db` locally and restart
- Vercel uses in-memory DB (resets on redeploy)

**Cron not running?**
- Cron only runs on Vercel serverless (not local dev)
- Test locally: Manually call `/api/collection/` to verify database works

## 📄 License

MIT
