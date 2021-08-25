cd ../guoyi-ui;
nvm use node;
npm run build_mobile;
npx cap sync android;
npx cap sync ios;
npx cap open android;
npx cap open ios;
