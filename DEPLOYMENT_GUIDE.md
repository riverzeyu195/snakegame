# 🚀 Deployment Guide: Snake Game to GitHub & Custom Domain

## 📋 Prerequisites

- GitHub account
- Git installed on your computer
- Your custom domain (if using one)
- Domain registrar access (for DNS configuration)

## 🔄 Replacing Old Version with New Version

### If you have an existing repository:

1. **Backup your old version** (optional but recommended):
   ```bash
   # Clone your existing repo to a backup folder
   git clone https://github.com/yourusername/your-old-repo.git backup-old-snake-game
   ```

2. **Delete old repository content**:
   ```bash
   # Navigate to your existing repository
   cd path/to/your/existing/repo
   
   # Remove all files except .git folder
   find . -not -path './.git*' -delete
   
   # Or manually delete all files except .git folder
   ```

3. **Copy new version files**:
   ```bash
   # Copy all files from this enhanced version
   cp -r /path/to/enhanced-snake-game/* .
   cp /path/to/enhanced-snake-game/.gitignore .
   ```

4. **Commit the replacement**:
   ```bash
   git add .
   git commit -m "Replace with enhanced Snake Game version
   
   - Added dynamic music system with 3 styles
   - Implemented power-ups and special food
   - Enhanced UI with particle effects
   - Added mobile touch controls
   - Improved responsive design"
   
   git push origin main
   ```

## 🆕 Creating New Repository

### Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com)
2. Click the "+" icon → "New repository"
3. Repository name: `snake-game` (or your preferred name)
4. Description: "Enhanced Snake Game with dynamic music and power-ups"
5. Set to **Public** (required for GitHub Pages)
6. ✅ **Do NOT** initialize with README (we already have one)
7. Click "Create repository"

### Step 2: Connect Local Repository to GitHub

```bash
# Add GitHub remote (replace with your actual GitHub username and repo name)
git remote add origin https://github.com/yourusername/snake-game.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## 🌐 GitHub Pages Setup

### Step 1: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll down to **Pages** section (left sidebar)
4. Under "Source":
   - Select **Deploy from a branch**
   - Branch: **main** (or **master**)
   - Folder: **/ (root)**
5. Click **Save**

### Step 2: Access Your Game

After a few minutes, your game will be available at:
```
https://yourusername.github.io/snake-game
```

## 🏷️ Custom Domain Setup

### Step 1: Create CNAME File

```bash
# Create CNAME file with your domain
echo "yourdomain.com" > CNAME

# Commit and push
git add CNAME
git commit -m "Add custom domain configuration"
git push origin main
```

### Step 2: Configure DNS Settings

In your domain registrar's DNS settings, add these records:

#### Option A: Apex Domain (yourdomain.com)
```
Type: A
Name: @
Value: 185.199.108.153

Type: A
Name: @
Value: 185.199.109.153

Type: A
Name: @
Value: 185.199.110.153

Type: A
Name: @
Value: 185.199.111.153
```

#### Option B: Subdomain (game.yourdomain.com)
```
Type: CNAME
Name: game
Value: yourusername.github.io
```

### Step 3: Configure GitHub Pages for Custom Domain

1. Go to repository **Settings** → **Pages**
2. Under "Custom domain", enter: `yourdomain.com`
3. ✅ Check **Enforce HTTPS** (wait for SSL certificate)
4. Click **Save**

### Step 4: Update README.md

Update the live demo link in your README.md:
```markdown
## 🚀 Live Demo

[Play the game here](https://yourdomain.com)
```

## 🔧 Troubleshooting

### Common Issues:

1. **404 Error**: Wait 10-15 minutes for GitHub Pages to deploy
2. **DNS Not Resolving**: DNS changes can take 24-48 hours to propagate
3. **HTTPS Certificate Issues**: Wait for GitHub to provision SSL certificate
4. **Custom Domain Not Working**: Check CNAME file and DNS settings

### Verification Commands:

```bash
# Check DNS propagation
nslookup yourdomain.com

# Check CNAME record
nslookup game.yourdomain.com

# Test GitHub Pages
curl -I https://yourusername.github.io/snake-game
```

## 📱 Testing Deployment

### Test Checklist:
- [ ] Game loads without errors
- [ ] All music styles work
- [ ] Touch controls work on mobile
- [ ] High scores save properly
- [ ] All power-ups function correctly
- [ ] Responsive design works on different screen sizes
- [ ] Sound effects play correctly
- [ ] Game over and pause modals display properly

## 🔄 Future Updates

To update your deployed game:

```bash
# Make your changes
# ...

# Commit and push
git add .
git commit -m "Update: describe your changes"
git push origin main

# GitHub Pages will automatically redeploy
```

## 📊 Analytics (Optional)

To track game usage, add Google Analytics:

1. Create Google Analytics account
2. Add tracking code to `index.html` before `</head>`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_TRACKING_ID');
</script>
```

## 🎯 SEO Optimization

Add these meta tags to `index.html` for better search visibility:

```html
<meta name="description" content="Play the enhanced Snake Game with dynamic music, power-ups, and smooth gameplay. Multiple difficulty levels and mobile support.">
<meta name="keywords" content="snake game, browser game, javascript game, retro game, arcade game">
<meta property="og:title" content="Enhanced Snake Game">
<meta property="og:description" content="Modern Snake game with dynamic music and power-ups">
<meta property="og:url" content="https://yourdomain.com">
<meta property="og:type" content="website">
```

---

**🎉 Congratulations! Your enhanced Snake Game is now live and accessible to players worldwide!**

**Need help?** Create an issue in your GitHub repository or refer to [GitHub Pages documentation](https://docs.github.com/en/pages).