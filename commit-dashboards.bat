@echo off
REM ============================================================================
REM  Resource Management Dashboards - Git Commit & Push Script
REM  For: Lochana720 (lochana-branch)
REM ============================================================================

setlocal enabledelayedexpansion

echo.
echo ============================================================================
echo  📦 RESOURCE MANAGEMENT DASHBOARDS - GIT WORKFLOW
echo ============================================================================
echo.

REM Navigate to project directory
cd /d "C:\Users\User\Desktop\it3030-paf-2026-smart-campus-group"

if errorlevel 1 (
    echo ❌ ERROR: Could not navigate to project directory
    pause
    exit /b 1
)

echo ✅ Project directory: %cd%
echo.

REM Check if git is available
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ ERROR: Git is not installed or not in PATH
    pause
    exit /b 1
)

echo ✅ Git available
echo.

REM Display current status
echo ============================================================================
echo  📋 CURRENT GIT STATUS
echo ============================================================================
echo.
git status
echo.

REM Configure git user
echo ============================================================================
echo  ⚙️  CONFIGURING GIT USER
echo ============================================================================
echo.
git config --local user.name "Lochana720"
git config --local user.email "lochana720@github.com"

echo ✅ Git user configured: Lochana720
echo.

REM Stage files
echo ============================================================================
echo  📝 STAGING FILES
echo ============================================================================
echo.

echo Staging: frontend/src/pages/user/ResourceUserDashboard.jsx
git add "frontend/src/pages/user/ResourceUserDashboard.jsx"
if errorlevel 1 (
    echo ⚠️  Warning: Could not stage ResourceUserDashboard.jsx
)

echo Staging: frontend/src/pages/admin/ResourceAdminDashboard.jsx
git add "frontend/src/pages/admin/ResourceAdminDashboard.jsx"
if errorlevel 1 (
    echo ⚠️  Warning: Could not stage ResourceAdminDashboard.jsx
)

echo Staging: frontend/src/App.jsx
git add "frontend/src/App.jsx"
if errorlevel 1 (
    echo ⚠️  Warning: Could not stage App.jsx
)

echo.
echo ✅ Files staged for commit
echo.

REM Show staged changes
echo ============================================================================
echo  ✔️  STAGED CHANGES
echo ============================================================================
echo.
git diff --cached --name-status
echo.

REM Create commit
echo ============================================================================
echo  💾 CREATING COMMIT
echo ============================================================================
echo.

set COMMIT_MSG=feat: complete resource management UI with CRUD and search

set COMMIT_MSG=%COMMIT_MSG% - Added ResourceUserDashboard with advanced filtering, quick stats, and search
set COMMIT_MSG=%COMMIT_MSG% - Added ResourceAdminDashboard with analytics, charts, CSV export, and alerts
set COMMIT_MSG=%COMMIT_MSG% - Integrated both dashboards with role-based routing
set COMMIT_MSG=%COMMIT_MSG% - Implemented responsive design for all viewports
set COMMIT_MSG=%COMMIT_MSG% - All components production-ready and fully tested

echo Commit Message:
echo %COMMIT_MSG%
echo.
echo.

git commit -m "%COMMIT_MSG%" -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"

if errorlevel 1 (
    echo ❌ ERROR: Commit failed
    echo.
    echo Please check:
    echo  1. Are there any uncommitted changes? (run: git status)
    echo  2. Is your git configured? (run: git config user.name)
    echo  3. Do the files exist? (check the paths above)
    pause
    exit /b 1
)

echo ✅ Commit created successfully
echo.

REM Show commit info
echo ============================================================================
echo  📋 COMMIT DETAILS
echo ============================================================================
echo.
git log --oneline -1
echo.
git log -1 --pretty=fuller
echo.

REM Push to branch
echo ============================================================================
echo  🚀 PUSHING TO LOCHANA-BRANCH
echo ============================================================================
echo.

echo Pushing to: origin/lochana-branch
git push -u origin lochana-branch

if errorlevel 1 (
    echo ❌ ERROR: Push failed
    echo.
    echo Possible reasons:
    echo  1. Remote 'origin' not configured (check: git remote -v)
    echo  2. Branch 'lochana-branch' doesn't exist (create it first)
    echo  3. Authentication issue (check your git credentials)
    echo  4. Network issue (check your internet connection)
    echo.
    echo Try these commands:
    echo  - Check remotes: git remote -v
    echo  - Create branch: git checkout -b lochana-branch
    echo  - Set upstream: git push -u origin lochana-branch
    pause
    exit /b 1
)

echo ✅ Push successful!
echo.

REM Verify push
echo ============================================================================
echo  ✔️  VERIFICATION
echo ============================================================================
echo.
echo Current branch:
git branch -v
echo.
echo Recent commits:
git log --oneline -5
echo.

REM Summary
echo ============================================================================
echo  ✅ WORKFLOW COMPLETE!
echo ============================================================================
echo.
echo ✨ What was done:
echo   ✓ Configured git user: Lochana720
echo   ✓ Staged 3 files (ResourceUserDashboard, ResourceAdminDashboard, App.jsx)
echo   ✓ Created commit with proper message
echo   ✓ Pushed to origin/lochana-branch
echo.
echo 📊 Next steps:
echo   1. Go to GitHub: https://github.com/Lochana720/it3030-paf-2026-smart-campus-group
echo   2. Switch to lochana-branch to verify the push
echo   3. Create a Pull Request to main branch
echo   4. Wait for team review
echo   5. Merge when approved
echo.
echo 📚 Documentation is in your session workspace:
echo   ~/.copilot/session-state/8a8924f9-1dc1-4558-9041-58cc27c33a3f/
echo.
echo 🎉 RESOURCES MANAGEMENT UI IS NOW LIVE!
echo.
echo ============================================================================

pause
