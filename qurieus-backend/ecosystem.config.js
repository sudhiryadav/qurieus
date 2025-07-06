module.exports = {
    apps : [
      {
        name: "qurieus-backend",
        script: "/home/ubuntu/qurieus/qurieus-backend/.venv/bin/python", 
        args: " -m uvicorn main:app --host 0.0.0.0 --port 8001", 
        cwd: "/home/ubuntu/qurieus/qurieus-backend",
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '4G',
        env: {
          NODE_ENV: "production"
        }
      }
    ]
  };
