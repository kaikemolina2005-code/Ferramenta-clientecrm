#!/usr/bin/env node

/**
 * Setup Script for GitHub + Vercel
 * Run: npm run setup:github
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('\n🚀 ADVGD CRM - GitHub + Vercel Setup\n');

// Check if git is installed
try {
  execSync('git --version', { stdio: 'pipe' });
  console.log('✅ Git detected\n');
} catch (error) {
  console.error('❌ Git not found. Install from: https://git-scm.com/download\n');
  process.exit(1);
}

// Initialize git if not already
if (!fs.existsSync(path.join(__dirname, '..', '.git'))) {
  console.log('📝 Initializing Git repository...');
  try {
    execSync('git init', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
    execSync('git add .', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
    execSync('git commit -m "Initial commit: ADVGD CRM - Production Ready"', { 
      cwd: path.join(__dirname, '..'), 
      stdio: 'inherit' 
    });
    console.log('✅ Git repository initialized\n');
  } catch (error) {
    console.error('⚠️  Git initialization encountered an issue\n');
  }
} else {
  console.log('✅ Git repository already initialized\n');
}

console.log('📋 Next steps:\n');
console.log('1. Go to: https://github.com/new');
console.log('2. Create repository: advgd-crm-frontend');
console.log('3. Copy the repository URL\n');
console.log('4. Run:\n');
console.log('   git remote add origin https://github.com/YOUR_USERNAME/advgd-crm-frontend.git');
console.log('   git branch -M main');
console.log('   git push -u origin main\n');
console.log('5. Then go to: https://vercel.com');
console.log('6. Connect with GitHub and import the repository\n');
console.log('✨ That\'s it! You\'re ready to deploy!\n');
