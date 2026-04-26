@echo off
echo Starting BizUplift Backend...
start cmd /k "cd /d BizUplift-backend && node local-server.js"

echo Starting BizUplift Frontend...
start cmd /k "cd /d BizUplift-main && npm run dev"

echo Both servers are starting in new windows!
