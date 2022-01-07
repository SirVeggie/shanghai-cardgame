cd backend
npm run tsc
cd ../frontend
npm run build
cd ..
git add -A
git commit -m "Deploy BUILD commit"
git subtree push --prefix backend/ heroku master
