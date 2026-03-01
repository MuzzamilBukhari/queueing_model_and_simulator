# Deployment Guide

This guide will walk you through deploying the Queue Simulator application:
- **Frontend** (Next.js) → Vercel
- **Backend** (ASP.NET Core) → Render

---

## Prerequisites

Before you begin, ensure you have:
- A GitHub account (to push your code)
- A Vercel account (https://vercel.com)
- A Render account (https://render.com)
- Git installed on your machine

---

## Part 1: Prepare Your Code

### 1.1 Initialize Git Repository (if not done already)

```bash
# Navigate to your project root
cd "c:\Muzzamil\Learning\Uni\7th sem\TOCI 2 (Simulation)\Simulator"

# Initialize git (if not already)
git init

# Create .gitignore
```

### 1.2 Create .gitignore file

Create a `.gitignore` file in the root directory with the following content:

```
# Frontend
frontend/node_modules/
frontend/.next/
frontend/out/
frontend/.env.local
frontend/.vercel

# Backend
backend/bin/
backend/obj/
backend/appsettings.Development.json

# IDE
.vs/
.vscode/
*.suo
*.user
*.userosscache
*.sln.docstates

# OS
.DS_Store
Thumbs.db
```

### 1.3 Commit Your Code

```bash
git add .
git commit -m "Initial commit for deployment"
```

### 1.4 Push to GitHub

```bash
# Create a new repository on GitHub (https://github.com/new)
# Then link and push:
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

---

## Part 2: Deploy Backend on Render

### 2.1 Create a Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select your repository from the list

### 2.2 Configure the Service

Fill in the deployment settings:

- **Name**: `queue-simulator-api` (or any name you prefer)
- **Region**: Choose the closest to your users
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `.NET`
- **Build Command**: 
  ```bash
  dotnet publish -c Release -o out
  ```
- **Start Command**: 
  ```bash
  cd out && dotnet QueueSimulatorAPI.dll
  ```

### 2.3 Environment Variables (if needed)

Click **"Advanced"** and add any environment variables if you have database connections or secrets.

For this project, you might want to add:
- `ASPNETCORE_ENVIRONMENT`: `Production`

### 2.4 Deploy

1. Click **"Create Web Service"**
2. Render will automatically build and deploy your backend
3. Wait for the deployment to complete (this may take 5-10 minutes)
4. Once deployed, you'll get a URL like: `https://queue-simulator-api.onrender.com`

### 2.5 Test Your Backend

Visit your backend URL in a browser. You should see:
```json
{"message":"Queue Simulator API Running"}
```

Test the API endpoint:
- URL: `https://your-app.onrender.com/api/simulation/mm1`
- Method: POST
- Body:
```json
{
  "meanInterarrivalTime": 10,
  "meanServiceTime": 8
}
```

---

## Part 3: Deploy Frontend on Vercel

### 3.1 Import Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Select the repository you just pushed

### 3.2 Configure the Project

Vercel will auto-detect it's a Next.js project:

- **Framework Preset**: Next.js (auto-detected)
- **Root Directory**: `frontend`
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)

### 3.3 Add Environment Variable

**This is crucial!** Add the environment variable for your backend:

1. Click **"Environment Variables"**
2. Add:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://your-backend-url.onrender.com` (Your Render backend URL from Part 2)
3. Make sure to add it for **Production**, **Preview**, and **Development** environments

### 3.4 Deploy

1. Click **"Deploy"**
2. Vercel will build and deploy your frontend (takes 2-5 minutes)
3. Once complete, you'll get a URL like: `https://your-app.vercel.app`

---

## Part 4: Verify Deployment

### 4.1 Test the Application

1. Visit your Vercel frontend URL
2. Try the M/M/1 Queue Simulator
3. Enter values:
   - Mean Interarrival Time: 10
   - Mean Service Time: 8
4. Click "Run Simulation"
5. Verify you get results!

### 4.2 Check CORS (if you get errors)

If you see CORS errors in the browser console, you may need to update the backend CORS policy to only allow your Vercel domain.

In `backend/Program.cs`, update the CORS policy:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
            "https://your-app.vercel.app",  // Your Vercel URL
            "http://localhost:3000"          // For local development
        )
        .AllowAnyMethod()
        .AllowAnyHeader();
    });
});

// Then use it:
app.UseCors("AllowFrontend");
```

After updating, commit and push to trigger a new deployment on Render.

---

## Part 5: Custom Domains (Optional)

### 5.1 Add Custom Domain to Vercel

1. In Vercel project settings → Domains
2. Add your custom domain
3. Update DNS records as instructed by Vercel

### 5.2 Add Custom Domain to Render

1. In Render service settings → Custom Domain
2. Add your API subdomain (e.g., `api.yourdomain.com`)
3. Update DNS records as instructed by Render

---

## Troubleshooting

### Frontend can't connect to backend

- Verify `NEXT_PUBLIC_API_URL` is set correctly in Vercel
- Check that the Render backend is running
- Check browser console for CORS errors

### Backend deployment fails on Render

- Verify the build command is correct
- Check the start command points to the correct DLL file
- Check Render logs for specific errors

### Application works locally but not in production

- Verify environment variables are set in both Vercel and Render
- Check that .env.local is in .gitignore (it should not be deployed)
- Verify the API URL doesn't have trailing slashes

---

## Maintenance

### Update Frontend

```bash
# Make changes to frontend code
git add frontend/
git commit -m "Update frontend"
git push
```

Vercel will automatically redeploy.

### Update Backend

```bash
# Make changes to backend code
git add backend/
git commit -m "Update backend"
git push
```

Render will automatically redeploy.

---

## Free Tier Limitations

### Vercel Free Tier:
- 100 GB bandwidth per month
- Unlimited deployments
- Automatic SSL

### Render Free Tier:
- Web services spin down after 15 minutes of inactivity
- May take 30-60 seconds for first request to wake up
- 750 hours/month (effectively 24/7 for one service)

---

## Next Steps

1. Set up continuous deployment (already configured with GitHub!)
2. Add custom domains
3. Monitor your deployments
4. Set up environment-specific configurations
5. Add analytics (Vercel Analytics, Google Analytics, etc.)

---

## Support

If you encounter issues:
- Vercel Docs: https://vercel.com/docs
- Render Docs: https://render.com/docs
- Check deployment logs on both platforms
