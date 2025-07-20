module.exports = {
  apps: [
    {
      name: 'qurieus-frontend',
      cwd: './qurieus-frontend',
      script: 'yarn',
      args: 'start',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      env: {
        PORT: 8000,
        NODE_ENV: 'production',
        NEXT_TELEMETRY_DISABLED: 1,
        NEXTAUTH_URL: 'https://qurieus.com',
      },
      env_development: {
        PORT: 8000,
        NODE_ENV: 'development',
        NEXT_TELEMETRY_DISABLED: 1,
        NEXTAUTH_URL: 'http://localhost:8000',
      },
      'pre-deploy-local': 'yarn install && yarn build',
      error_file: 'logs/err.log',
      out_file: 'logs/out.log',
      log_file: 'logs/combined.log',
      time: true,
    },
  ],
}; 