# Stocknity UI Deployment Guide

## Deploying to Vercel

### Prerequisites
1. Install Vercel CLI: `npm i -g vercel`
2. Have a Vercel account (sign up at https://vercel.com)

### Step 1: Build the Project Locally
```bash
cd stocknity-ui
npm install
npm run build
```

### Step 2: Deploy to Vercel

#### Option A: Using Vercel CLI
```bash
# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? [your-account]
# - Link to existing project? N
# - What's your project's name? stocknity-ui
# - In which directory is your code located? ./
# - Want to override the settings? N
```

#### Option B: Using Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - Framework Preset: Create React App
   - Root Directory: `stocknity-ui`
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Install Command: `npm install`

### Step 3: Environment Variables
In your Vercel project settings, add these environment variables:

```
REACT_APP_API_BASE_URL=https://stock-portfolio-theta.vercel.app/api
```

### Step 4: Custom Domain (Optional)
1. Go to your Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Update DNS settings as instructed

## Local Development

### Environment Setup
Create a `.env` file in the `stocknity-ui` directory:

```env
REACT_APP_API_BASE_URL=http://localhost:5001/api
```

### Running Locally
```bash
npm start
```

## Troubleshooting

### Build Issues
- Make sure all dependencies are installed: `npm install`
- Clear cache: `npm run build -- --reset-cache`
- Check for TypeScript errors: `npx tsc --noEmit`

### API Connection Issues
- Verify the API_BASE_URL is correct
- Check CORS settings on the backend
- Ensure the backend is deployed and accessible

### Deployment Issues
- Check Vercel build logs for errors
- Verify environment variables are set correctly
- Ensure all required files are committed to git
