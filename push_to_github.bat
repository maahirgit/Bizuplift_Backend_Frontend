@echo off
echo Pulling latest changes from GitHub...
git pull --no-edit

echo.
echo Adding changes to Git...
git add .

echo Committing changes...
git commit -m "Updated frontend API config and added .npmrc for Vercel compatibility"

echo Pushing to GitHub...
git push -u origin HEAD

echo.
echo Push complete! Press any key to exit.
pause > nul
