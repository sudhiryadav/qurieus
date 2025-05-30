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
      env: {
        PORT: 8000,
        NODE_ENV: 'production',
        NEXT_TELEMETRY_DISABLED: 1,
      },
      env_development: {
        PORT: 8000,
        NODE_ENV: 'development',
        NEXT_TELEMETRY_DISABLED: 1,
      },
      error_file: 'logs/err.log',
      out_file: 'logs/out.log',
      log_file: 'logs/combined.log',
      time: true,
    },
  ],
}; 