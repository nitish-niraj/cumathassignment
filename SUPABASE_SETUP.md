# Supabase Setup Guide for Cumaths

## Problem Solved
Your app was failing on Vercel because it was using SQLite (`file:./dev.db`), which doesn't work in production (ephemeral filesystem). The app is now configured to use PostgreSQL via Supabase.

## What You Need to Do (3 Steps, 5 Minutes)

### Step 1: Create a Free Supabase PostgreSQL Database

1. Go to https://supabase.com/dashboard
2. Click **+ New Project**
3. Fill in:
   - **Name:** `cumaths`
   - **Password:** Create a strong password (you'll need this)
   - **Region:** Choose the closest to you (e.g., `us-east-1` for USA)
4. Click **Create new project**
5. Wait 1-2 minutes for initialization (you'll see a progress bar)

### Step 2: Get Your Connection String

Once the project is ready:

1. Go to **Settings** (bottom left sidebar)
2. Click **Database**
3. Under **Connection String**, click the **URI** tab
4. Copy the entire connection string (it looks like):
   ```
   postgresql://postgres.xxxxxxxxxxxxx:xxxxxxxxxxxxx@db.supabase.co:5432/postgres
   ```

**Important:** The password is shown in brackets like `[PASSWORD]`. Replace it with the actual password you created in Step 1.

Example final string:
```
postgresql://postgres.xxxxxxxxxxxxx:mySecurePassword123@db.supabase.co:5432/postgres
```

### Step 3: Set Environment Variables

#### For Local Development:
1. Open `.env.local` in the project root
2. Replace the `DATABASE_URL` value:
   ```
   DATABASE_URL="postgresql://postgres.xxxxx:myPassword@db.supabase.co:5432/postgres?schema=public"
   ```
3. Save the file

#### For Vercel Production:
1. Run this command in the project terminal:
   ```bash
   npx vercel env add DATABASE_URL production
   ```
2. When prompted, paste your full connection string
3. Press Enter to confirm

### Step 4: Run Migrations and Deploy

```bash
# Locally: generate and run migrations
npm run prisma:migrate

# Then deploy to Vercel
npx vercel deploy --prod --yes
```

## What Changed in Your Code

- **prisma/schema.prisma**: Changed from SQLite to PostgreSQL
- **.env.example**: Updated with PostgreSQL connection string format
- **.env**: Updated with placeholder PostgreSQL URL

## Troubleshooting

**Q: Where do I find the password?**
A: In the Supabase Connection String URI tab, look for `[PASSWORD]` and replace it with your actual database password from Step 1.

**Q: Connection string looks like: `postgresql://postgres.[PROJECT_ID]:[PASSWORD]@...`**
A: That's correct! Just fill in your actual password where it says `[PASSWORD]`.

**Q: My app still shows "Something went wrong" after pasting the URL**
A: Run migrations first: `npm run prisma:migrate`

**Q: How do I verify it's connected?**
A: Go to your Supabase dashboard → **SQL Editor** → Run:
```sql
SELECT COUNT(*) FROM "Deck";
```
If it returns a number, you're connected!

---

**Need help?** Reply with the connection string format you see in Supabase (without the actual password) and I can verify it's correct.
