module.exports = {
  apps: [
    {
      name: 'saarthi-backend',
      script: 'src/server.js',
      cwd: './saarthi-backend',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 4000
      },
      error_file: '../logs/backend-error.log',
      out_file: '../logs/backend-out.log',
      log_file: '../logs/backend-combined.log',
      time: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '1G'
    },
    {
      name: 'saarthi-frontend',
      script: 'server.js',
      cwd: './saarthi-webapp/.next/standalone',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0'
      },
      error_file: '../../../logs/frontend-error.log',
      out_file: '../../../logs/frontend-out.log',
      log_file: '../../../logs/frontend-combined.log',
      time: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '1G'
    }
  ]
};