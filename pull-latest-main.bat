@echo off
REM ============================================================================
REM  Pull Latest Main Branch - Before Merge
REM ============================================================================

setlocal enabledelayedexpansion

echo.
echo ============================================================================
echo  📥 PULLING LATEST MAIN BRANCH
echo ============================================================================
echo.

cd /d "C:\Users\User\Desktop\it3030-paf-2026-smart-campus-group"

if errorlevel 1 (
    echo ❌ ERROR: Could not navigate to project directory
    pause
    exit /b 1
)

echo ✅ In project directory
echo.

REM Check current branch
echo ============================================================================
echo  📍 CURRENT STATUS
echo ============================================================================
echo.
git branch -v
echo.
echo Current commit:
git log --oneline -1
echo.

REM Fetch latest from remote
echo ============================================================================
echo  📥 FETCHING FROM REMOTE
echo ============================================================================
echo.
git fetch origin
if errorlevel 1 (
    echo ⚠️  Warning: Fetch had issues
)
echo ✅ Fetched latest from remote
echo.

REM Show main branch status
echo ============================================================================
echo  📊 MAIN BRANCH STATUS
echo ============================================================================
echo.
echo Remote main:
git log origin/main --oneline -5
echo.

REM Show local main
echo Local main:
git log main --oneline -5
echo.

REM Pull main into current branch
echo ============================================================================
echo  🔄 PULLING MAIN INTO CURRENT BRANCH
echo ============================================================================
echo.

git pull origin main --no-edit

if errorlevel 1 (
    echo.
    echo ⚠️  Warning: Merge conflicts may have occurred
    echo Please resolve conflicts manually:
    echo.
    echo 1. Check git status: git status
    echo 2. Resolve conflicted files
    echo 3. Stage resolved files: git add .
    echo 4. Complete merge: git commit -m "Merge main branch"
    echo.
    pause
    exit /b 1
)

echo ✅ Successfully pulled main branch
echo.

REM Show updated status
echo ============================================================================
echo  ✅ UPDATED STATUS
echo ============================================================================
echo.
git status
echo.
echo Recent commits:
git log --oneline -5
echo.

REM Summary
echo ============================================================================
echo  ✅ PULL COMPLETE!
echo ============================================================================
echo.
echo Your lochana-branch now has latest changes from main
echo Ready for:
echo  1. Continue with your dashboards work
echo  2. Commit your changes
echo  3. Push to origin
echo  4. Create Pull Request
echo.

pause
