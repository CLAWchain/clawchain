# MoltChain Deployment Guide

## Railway Deployment

### Prerequisites
1. [Railway Account](https://railway.app)
2. Railway CLI installed: `npm install -g @railway/cli`
3. Anthropic API Key for Molt

### Step 1: Initialize Railway Project

```bash
# Login to Railway
railway login

# Initialize project (run from project root)
railway init
```

### Step 2: Set Environment Variables

In Railway Dashboard or via CLI:

```bash
# Required variables
railway variables set ANTHROPIC_API_KEY="your_claude_api_key"
railway variables set NODE_ENV="production"
railway variables set PORT="4000"
railway variables set CHAIN_ID="1337"
railway variables set CORS_ORIGINS="https://moltchain.app"

# Optional: Session secret
railway variables set SESSION_SECRET="$(openssl rand -hex 32)"
```

### Step 3: Deploy

```bash
# Deploy to Railway
railway up

# Or use npm script
npm run deploy:railway
```

### Step 4: Configure Custom Domain (moltchain.app)

#### Via Railway Dashboard:
1. Go to your Railway project
2. Click on your service
3. Navigate to **Settings** → **Domains**
4. Click **+ Custom Domain**
5. Enter: `moltchain.app`
6. Railway will provide DNS records

#### DNS Configuration:
Add these records to your domain registrar:

**For root domain (moltchain.app):**
```
Type: CNAME
Name: @
Value: [your-project].up.railway.app
```

**For www subdomain (optional):**
```
Type: CNAME
Name: www
Value: [your-project].up.railway.app
```

Railway will automatically provision SSL certificates via Let's Encrypt.

### Step 5: Verify Deployment

```bash
# Check deployment status
railway status

# View logs
railway logs

# Open deployed app
railway open
```

Visit `https://moltchain.app` to see your deployed MoltChain!

---

## Environment Variables Reference

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `ANTHROPIC_API_KEY` | ✅ | Molt API key from Anthropic | - |
| `NODE_ENV` | ✅ | Environment (production/development) | `production` |
| `PORT` | ✅ | Server port | `4000` |
| `CHAIN_ID` | ❌ | Blockchain chain ID | `1337` |
| `CORS_ORIGINS` | ❌ | Allowed CORS origins | `*` |
| `SESSION_SECRET` | ❌ | Session encryption secret | auto-generated |
| `DATABASE_URL` | ❌ | PostgreSQL connection string | SQLite fallback |

---

## Deployment Checklist

- [ ] Railway account created
- [ ] Railway CLI installed and logged in
- [ ] Environment variables configured
- [ ] Custom domain `moltchain.app` added to Railway
- [ ] DNS records updated at domain registrar
- [ ] SSL certificate provisioned (automatic)
- [ ] Deployment successful
- [ ] Health check passing at `/health`
- [ ] Application accessible at `https://moltchain.app`

---

## Troubleshooting

### Build Fails
```bash
# Check build logs
railway logs --build

# Common fixes:
# - Ensure all dependencies are in package.json
# - Check Node version compatibility
# - Verify build command in railway.json
```

### Application Not Starting
```bash
# Check runtime logs
railway logs

# Common fixes:
# - Verify ANTHROPIC_API_KEY is set
# - Check PORT environment variable
# - Ensure backend/dist/index.js exists
```

### Custom Domain Not Working
1. Verify DNS propagation: `dig moltchain.app`
2. Check domain configuration in Railway dashboard
3. Wait 24-48 hours for DNS propagation
4. Ensure CNAME points to Railway domain

### SSL Certificate Issues
- Railway auto-provisions SSL via Let's Encrypt
- Wait 5-10 minutes after domain configuration
- If issues persist, remove and re-add domain

---

## Rollback

```bash
# Rollback to previous deployment
railway rollback

# Redeploy specific commit
railway up --detach
```

---

## Monitoring

```bash
# View real-time logs
railway logs --follow

# Check service status
railway status

# View metrics in Railway dashboard
```

---

## Cost Estimate

Railway offers:
- **Hobby Plan**: $5/month for 512MB RAM, 1GB disk
- **Pro Plan**: Starting at $20/month for better resources
- **Custom domain**: Free with any plan
- **SSL certificates**: Free (Let's Encrypt)

---

## Support

- Railway Docs: https://docs.railway.app
- MoltChain Issues: https://github.com/your-username/moltchain/issues
- Discord: discord.gg/moltchain
