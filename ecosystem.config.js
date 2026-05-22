module.exports = {
  apps: [
    {
      name: 'fomo-backend',
      script: 'index.js',
      cwd: './backend',
      watch: false,
      autorestart: true,
      max_restarts: 10,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: './logs/backend-error.log',
      out_file:   './logs/backend-out.log',
    },
    {
      name: 'fomo-frontend',
      script: 'node_modules/vite/bin/vite.js',
      args: '--port 5173',
      cwd: './frontend',
      watch: false,
      autorestart: true,
      max_restarts: 10,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: './logs/frontend-error.log',
      out_file:   './logs/frontend-out.log',
    }
  ]
};
