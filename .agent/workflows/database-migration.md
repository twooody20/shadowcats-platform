---
description: How to migrate Shadowcats Platform to a Postgres Database
---

# Database Migration Workflow

This workflow will guide you through setting up a real database so your data persists when you deploy the app online.

## Step 1: Create a Database
1.  Go to [Vercel Storage](https://vercel.com/dashboard/storage).
2.  Click **Create Database**.
3.  Choose **Postgres** (or Neon).
4.  Give it a name (e.g., `shadowcats-db`) and zone (e.g., `us-east-1`).
5.  Click **Create**.

## Step 2: Get Credentials
1.  Once created, go to the **.env.local** tab in Vercel.
2.  Click **Copy** to get the content.
3.  **Action**: Create a file named `.env.production` in your project root locally (or just paste these values into Vercel's "Environment Variables" settings for your project).
    *   Ideally, you connect the database to your Vercel Project directly:
    *   Go to **Project Settings** -> **Storage** -> **Connect**.

## Step 3: Enable Database Mode
To tell the app to use the database instead of the file:
1.  Go to **Vercel Project Settings** -> **Environment Variables**.
2.  Add a new variable:
    *   **Key**: `USE_DATABASE`
    *   **Value**: `true`

## Step 4: Migrate Data (Seeding)
Once deployed with `USE_DATABASE=true`:
1.  Open your browser to: `https://<your-project>.vercel.app/api/seed`
2.  You should see: `{"message":"Database seeded successfully"}`.
    *   *Note: This copies your local `db.json` data (that was pushed to git) into the database tables.*

## Step 5: Verify
1.  Login to your app.
2.  Create a new transaction or edit a player.
3.  Refresh the page. If the data stays, you are successfully using the database!
