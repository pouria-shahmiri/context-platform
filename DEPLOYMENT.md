# Deployment Guide

This guide will help you deploy your **Pyramid Solver** application to production using **Supabase** and **Vercel** (or any static site host).

## 1. Supabase Database Setup

You need to apply the database schema to your Supabase project.

1.  **Log in to Supabase**: Go to [supabase.com/dashboard](https://supabase.com/dashboard) and select your project.
2.  **Open SQL Editor**: Click on the **SQL Editor** icon in the left sidebar.
3.  **New Query**: Click **New Query**.
4.  **Paste Schema**: Open the file `supabase_schema.sql` from your project, copy all the content, and paste it into the query editor.
5.  **Run**: Click **Run** to execute the script.
    *   *This will create all necessary tables (pyramids, product_definitions, etc.) and enable security policies.*

## 2. Supabase Auth Configuration

1.  **Go to Authentication**: Click on the **Authentication** icon in the left sidebar.
2.  **Providers**: ensure **Email** is enabled.
    *   *Note: Since we removed Google Login, you only need Email enabled.*
3.  **URL Configuration**:
    *   Go to **URL Configuration**.
    *   Set **Site URL** to your production URL (e.g., `https://your-app-name.vercel.app`) once you have it.
    *   For now, you can keep `http://localhost:5173` (or your local port) in **Redirect URLs**.

## 3. Deploying the Frontend (Vercel Recommended)

We recommend using Vercel as it works seamlessly with Vite and React.

### Option A: Using Vercel CLI (Fastest)

1.  **Install Vercel CLI**:
    ```bash
    npm i -g vercel
    ```
2.  **Login**:
    ```bash
    vercel login
    ```
3.  **Deploy**:
    Run the following command in your project root:
    ```bash
    vercel
    ```
    *   Follow the prompts (accept defaults usually).
    *   It will ask specifically about your settings.

4.  **Environment Variables**:
    *   During the setup, or afterwards in the Vercel Dashboard (Settings > Environment Variables), you **MUST** add these two variables:
        *   `VITE_SUPABASE_URL`: (Your Supabase URL)
        *   `VITE_SUPABASE_ANON_KEY`: (Your Supabase Anon Key)

### Option B: Using Vercel Dashboard (Git Integration)

1.  Push your code to a GitHub/GitLab/Bitbucket repository.
2.  Log in to [Vercel](https://vercel.com) and click **Add New > Project**.
3.  Import your repository.
4.  In the **Environment Variables** section, add:
    *   `VITE_SUPABASE_URL`
    *   `VITE_SUPABASE_ANON_KEY`
5.  Click **Deploy**.

## 4. MCP Server (Optional)

If you want to use the MCP Server capability (for IDE integration):

1.  The `mcp-server` folder is a separate Node.js application.
2.  It is meant to run **locally** on your machine to bridge your IDE (like Cursor or Windsurf) with your remote Supabase database.
3.  You do not typically "deploy" this to the web for public users.
4.  To use it:
    *   Ensure `mcp-server/.env` has your Supabase keys.
    *   Run `npm run build` inside `mcp-server`.
    *   Configure your IDE to point to the build file (instructions in `mcp-server/README.md`).

## Troubleshooting

*   **White Screen on Deploy**: Check the browser console. It usually means environment variables are missing.
*   **"Table not found"**: Ensure you ran the SQL script in Step 1.
*   **"Permission denied"**: This means RLS (Row Level Security) is blocking access. Ensure you are logged in, or check the Policies in Supabase Dashboard > Database > Policies.
