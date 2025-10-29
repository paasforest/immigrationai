// PM2 Ecosystem Configuration for Immigration AI Backend
module.exports = {
  apps: [{
    name: 'immigration-backend',
    script: './dist/app.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'development',
      PORT: 4000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 4000
    },
    // Auto restart on crashes
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '1G',
    
    // Logging
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true,
    
    // Watch files (development only)
    watch: false,
    ignore_watch: ['node_modules', 'logs', '.git'],
    
    // Merge logs
    merge_logs: true,
    
    // Graceful shutdown
    kill_timeout: 5000,
    listen_timeout: 10000,
    
    // Instance environment variables
    instance_var: 'INSTANCE_ID'
  }]
};


