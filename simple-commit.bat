@echo off
REM Simple Git Script - Add and Commit

cd /d "C:\Users\User\Desktop\it3030-paf-2026-smart-campus-group"

echo Configuring Git...
git config --local user.name "Lochana720"
git config --local user.email "lochana720@github.com"

echo.
echo Current status:
git status

echo.
echo Adding changes...
git add "frontend/src/pages/user/ResourceUserDashboard.jsx"
git add "frontend/src/pages/admin/ResourceAdminDashboard.jsx"
git add "frontend/src/App.jsx"

echo.
echo Staged changes:
git diff --cached --name-only

echo.
echo Creating commit...
git commit -m "feat: complete resource management UI with CRUD and search - Enhanced User Dashboard with advanced filtering - Enhanced Admin Dashboard with analytics - Added responsive design for all devices - 40+ test cases documented - Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"

echo.
echo Last commit:
git log -1 --oneline

echo.
echo Ready to push. Current branch:
git branch --show-current

echo.
echo Pushing to remote...
git push -u origin lochana-branch

echo.
echo ✅ Complete!
pause
