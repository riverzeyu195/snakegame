#!/bin/bash

# Enhanced Snake Game Deployment Script
# This script helps automate the deployment process to GitHub

set -e  # Exit on any error

echo "🐍 Enhanced Snake Game Deployment Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if git is installed
if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install Git first."
    exit 1
fi

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    print_error "Not in a git repository. Please run 'git init' first."
    exit 1
fi

print_status "Checking repository status..."

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    print_warning "You have uncommitted changes."
    echo "Files with changes:"
    git status --short
    echo
    read -p "Do you want to commit these changes? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter commit message: " commit_message
        if [ -z "$commit_message" ]; then
            commit_message="Update Snake Game"
        fi
        
        print_status "Adding files to git..."
        git add .
        
        print_status "Committing changes..."
        git commit -m "$commit_message"
        
        print_success "Changes committed successfully!"
    else
        print_warning "Deployment cancelled. Please commit your changes first."
        exit 1
    fi
fi

# Check if remote origin exists
if ! git remote get-url origin &> /dev/null; then
    print_warning "No remote 'origin' found."
    echo
    echo "To add a remote repository:"
    echo "1. Create a new repository on GitHub"
    echo "2. Run: git remote add origin https://github.com/yourusername/your-repo-name.git"
    echo "3. Run this script again"
    exit 1
fi

print_status "Pushing to GitHub..."

# Get current branch
current_branch=$(git branch --show-current)

# Push to GitHub
if git push origin "$current_branch"; then
    print_success "Successfully pushed to GitHub!"
else
    print_error "Failed to push to GitHub. Please check your credentials and network connection."
    exit 1
fi

# Get repository URL
repo_url=$(git remote get-url origin)
repo_url=${repo_url%.git}  # Remove .git suffix if present
repo_url=${repo_url/git@github.com:/https://github.com/}  # Convert SSH to HTTPS

# Extract username and repo name
if [[ $repo_url =~ github\.com[/:]([^/]+)/([^/]+) ]]; then
    username="${BASH_REMATCH[1]}"
    repo_name="${BASH_REMATCH[2]}"
    pages_url="https://${username}.github.io/${repo_name}"
else
    print_warning "Could not parse repository URL"
    pages_url="https://yourusername.github.io/your-repo-name"
fi

echo
print_success "Deployment completed!"
echo
echo "📋 Next Steps:"
echo "1. Go to your repository: $repo_url"
echo "2. Navigate to Settings → Pages"
echo "3. Enable GitHub Pages (source: main branch)"
echo "4. Your game will be available at: $pages_url"
echo
echo "📖 For detailed instructions, see DEPLOYMENT_GUIDE.md"
echo
echo "🎮 Happy gaming!"