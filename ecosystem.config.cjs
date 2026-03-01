// PM2 config for Qurieus - run from repo root: pm2 start ecosystem.config.cjs
// .env is copied from /home/ubuntu/{staging|prod}/ to each app dir before deploy

const REPO = "/home/ubuntu/qurieus";

module.exports = {
  apps: [
    {
      name: "qurieus-frontend",
      cwd: `${REPO}/qurieus-frontend`,
      script: "node",
      args: "server.js",
      env: {
        NODE_ENV: "production",
        PORT: "8000",
      },
      instances: 1,
      autorestart: true,
      watch: false,
    },
    {
      name: "qurieus-backend",
      cwd: `${REPO}/qurieus-backend`,
      script: `${REPO}/qurieus-backend/.venv/bin/python`,
      args: "-m uvicorn main:app --host 0.0.0.0 --port 8001",
      env: { NODE_ENV: "production" },
      instances: 1,
      autorestart: true,
      watch: false,
    },
    {
      name: "qurieus-bot-teams",
      cwd: `${REPO}/qurieus-bot-teams`,
      script: "yarn",
      args: "start",
      env: { NODE_ENV: "production" },
      instances: 1,
      autorestart: true,
      watch: false,
    },
  ],
};
