
# Deployment Guide: Stories of Unais

This guide explains how to deploy your application to Vercel, Netlify, Supabase, and GitHub.

## 1. GitHub (Source Control)
Your code is already in a local Git repository. To host it on GitHub:
1. Create a new repository on GitHub named `storiesofunais`.
2. run these commands in your terminal:
   ```bash
   git remote add origin https://github.com/makhesh46/storiesofunais.git
   git branch -M main
   git push -u origin main
   ```

## 2. Supabase (Database)
Your backend is configured to use Supabase.
1. **URL**: `https://bjlinvmesktdsqcmtzdb.supabase.co`
2. Ensure you have the tables `users`, `stories`, `comments`, and `announcements` created in your Supabase project.
3. The environment variables are already set in `server/.env`.

## 3. Vercel (Frontend & Backend)
Vercel is the recommended platform for this project because it handles the Express API via `vercel.json`.
1. Install Vercel CLI: `npm i -g vercel`.
2. Run `vercel` in the root directory.
3. Set the following environment variables in the Vercel Dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `JWT_SECRET`
   - `VITE_API_BASE_URL` (Set this to your Vercel deployment URL + `/api`)

## 4. Netlify (Static Frontend)
Netlify can host your frontend as a static site.
1. Connect your GitHub repository to Netlify.
2. **Build Command**: `npm run build`
3. **Publish Directory**: `dist`
4. **Environment Variables**: Set `VITE_API_BASE_URL` to point to your Vercel API (e.g., `https://your-vercel-app.vercel.app/api`).
5. Netlify will use the `netlify.toml` I created to handle React Router navigation.

---

### Summary of Host URLs
- **GitHub**: [github.com/makhesh46/storiesofunais](https://github.com/makhesh46/storiesofunais)
- **Vercel**: [storiesofunais07.vercel.app](https://storiesofunais07.vercel.app)
- **Supabase**: [bjlinvmesktdsqcmtzdb.supabase.co](https://bjlinvmesktdsqcmtzdb.supabase.co)
