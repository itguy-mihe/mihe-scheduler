# Deployment Guide: MIHE Meeting Scheduler

## Step 1: Push to GitHub

### 1.1 Initialize Git in your project
```bash
cd D:\mihe-scheduler
git init
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

### 1.2 Add all files and commit
```bash
git add .
git commit -m "Initial commit: MIHE Meeting Scheduler MVP"
```

### 1.3 Add remote and push to GitHub
Replace `YOUR-USERNAME` with your GitHub username:
```bash
git remote add origin https://github.com/YOUR-USERNAME/mihe-scheduler.git
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy on Render

### 2.1 Create a Render account
1. Go to [render.com](https://render.com)
2. Click **Sign up** (or sign in if you have an account)
3. Choose **GitHub** to sign up with your GitHub account

### 2.2 Connect GitHub repository
1. In Render dashboard, click **New +** → **Web Service**
2. Select **Deploy existing repository**
3. Search for `mihe-scheduler` and click **Connect**
4. Select the **main** branch

### 2.3 Configure the service
Fill in these settings:

| Field | Value |
|-------|-------|
| **Name** | mihe-scheduler |
| **Environment** | Python 3 |
| **Region** | Singapore or Sydney (closest to you) |
| **Branch** | main |
| **Build Command** | `pip install -r backend/requirements.txt && cd frontend && npm install && npm run build && cd ..` |
| **Start Command** | `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT` |
| **Plan** | Free (or Starter for production) |

### 2.4 Add Environment Variables
In **Environment** section, add:

```
ENV=production
SECRET_KEY=<generate-a-random-string>
DATABASE_URL=sqlite:///./scheduler.db
FRONTEND_ORIGIN=https://<your-render-url>.onrender.com
```

**To generate SECRET_KEY**, run in terminal:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 2.5 Create Disk (for persistent database)
1. Click **Disks** tab
2. Click **Add Disk**
3. Name: `scheduler-db`
4. Mount path: `/opt/render`
5. Size: 1 GB

### 2.6 Deploy
Click **Deploy** button. Render will:
1. Pull code from GitHub
2. Run build command (install dependencies, build frontend)
3. Start the backend server

Watch the logs for errors. Deployment takes **2-3 minutes**.

---

## Step 3: Verify Deployment

Once deployed, you'll get a URL like: `https://mihe-scheduler.onrender.com`

1. Open it in your browser
2. Login with: `admin@mihe.edu.au` / `admin123`
3. Create a poll and test the full flow

---

## Step 4: Seed Production Data (Optional)

To create admin user in production, SSH into your Render service:

1. In Render dashboard, click your service
2. Click **Shell** tab
3. Run:
```bash
cd backend
python seed.py
```

---

## Troubleshooting

### Build fails: "npm: command not found"
- Render detects `frontend/package.json` and installs Node automatically
- Make sure `package.json` exists in `frontend/` directory

### 502 Bad Gateway
- Check backend logs in Render dashboard
- Ensure `Start Command` is correct
- Wait 2-3 minutes for server to stabilize

### Database not persisting
- Make sure **Disk** is mounted to `/opt/render`
- Update `DATABASE_URL` to use the disk path:
```
DATABASE_URL=sqlite:////opt/render/scheduler.db
```

### Changes not deploying
- Push to GitHub: `git push origin main`
- Render auto-deploys when code is pushed
- Check **Deployments** tab to see history

---

## Production Checklist

- [ ] GitHub repo created and code pushed
- [ ] Render service connected to GitHub
- [ ] Environment variables set
- [ ] Disk created for database
- [ ] Build and start commands working
- [ ] Admin user seeded
- [ ] Login works with credentials
- [ ] Create a test poll
- [ ] Share poll link and test voting
- [ ] Check analytics page

---

## Next Steps: Upgrade Database

For production traffic, **switch from SQLite to PostgreSQL**:

1. Create a PostgreSQL database on [Render](https://render.com) (or [Supabase](https://supabase.com))
2. Get the connection string: `postgresql://user:pass@host:5432/dbname`
3. Set `DATABASE_URL` environment variable on Render
4. No code changes needed! SQLModel handles both.

---

## Custom Domain (Optional)

1. Buy a domain (Namecheap, GoDaddy, etc.)
2. In Render dashboard → **Settings** → **Custom Domain**
3. Add your domain
4. Follow DNS instructions
5. Your app will be at `https://yourdomain.com`

---

## Support

- **Render Docs**: https://render.com/docs
- **FastAPI Docs**: https://fastapi.tiangolo.com
- **React Docs**: https://react.dev

Good luck! 🚀
