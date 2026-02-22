# 🚀 Quick Deploy Guide

## Option 1: Deploy to Vercel (Recommended, Free)

### Prerequisites
- Vercel account (free): [vercel.com](https://vercel.com)
- Gmail account with 2FA enabled

### Step 1: Create Gmail App Password
1. Go to [myaccount.google.com](https://myaccount.google.com)
2. Click **Security** in the left menu
3. Enable **2-Step Verification** (if not already done)
4. Click **App passwords** (appears after 2FA is enabled)
5. Select "Mail" and "Mac" → Google generates a 16-character password
6. Copy this password (remove spaces)

### Step 2: Deploy to Vercel

**Option A: Using Git + Vercel Dashboard (Easiest)**
```bash
# Create a git repository
cd mystery-packet-game
git init
git add .
git commit -m "Initial commit"

# Create a GitHub repo, then push:
git remote add origin https://github.com/YOUR_USERNAME/mystery-packet-game.git
git branch -M main
git push -u origin main
```

Then:
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repo
3. Add environment variables:
   - `EMAIL_USER`: Your Gmail address (e.g., vinnie@gmail.com)
   - `EMAIL_PASS`: Your 16-character app password (spaces removed)
   - `APP_URL`: Leave blank (Vercel fills this automatically)
4. Click **Deploy**
5. Your site is live! 🎉

**Option B: Using Vercel CLI**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd mystery-packet-game
vercel

# Follow prompts:
# 1. Link to Vercel account
# 2. Create project
# 3. Add environment variables when prompted

# Set production environment variables
vercel env add EMAIL_USER
vercel env add EMAIL_PASS
vercel env add APP_URL  # Will be shown after first deploy

# Deploy to production
vercel --prod
```

### Step 3: Verify It Works

1. Visit your Vercel URL (e.g., `mystery-packet.vercel.app`)
2. Sign up with a test email
3. Check your email for the first monster 📦
4. Verify the collection dashboard shows your new monster

## Option 2: Deploy to Railway (Alternative)

```bash
npm install -g railway
railway login
railway up

# Follow setup prompts
# Add environment variables in Railway dashboard
```

## Option 3: Deploy to Heroku (Legacy)

```bash
# Install Heroku CLI
npm install -g heroku

# Deploy
heroku create mystery-packet
heroku config:set EMAIL_USER=your-email@gmail.com
heroku config:set EMAIL_PASS=your-app-password
heroku config:set APP_URL=https://mystery-packet.herokuapp.com
git push heroku main
```

## Local Development (Testing Before Deploy)

```bash
# Copy example env
cp .env.example .env

# Edit .env with your Gmail credentials
nano .env

# Install dependencies
npm install

# Run locally
npm run dev

# Visit http://localhost:3000
```

## Troubleshooting

**"Email not sending"**
- Verify EMAIL_USER is your full Gmail address
- Verify EMAIL_PASS is the 16-character app password (no spaces)
- Check Vercel/Railway logs

**"Database locked"**
- Serverless platforms don't support SQLite persistence
- This is expected; new signups work fine
- For production: upgrade to PostgreSQL

**"404 on collection page"**
- Make sure you signed up first
- Check browser localStorage (should have userId)

## Custom Domain

In Vercel dashboard:
1. Go to your project → Settings → Domains
2. Add your custom domain (e.g., mysterypocket.xyz)
3. Update DNS records per Vercel instructions

## Next Steps

- Monitor daily sends in Vercel logs
- Share the link with friends
- Track collection rates + engagement
- Plan future features (trading, leaderboard, events)

## Support

- Vercel docs: [vercel.com/docs](https://vercel.com/docs)
- Node.js on Vercel: [vercel.com/docs/runtimes/nodejs](https://vercel.com/docs/runtimes/nodejs)
- Nodemailer: [nodemailer.com](https://nodemailer.com)
