module.exports = {
    apps: [{
      name: 'subscription-server',
      script: 'index.js',
      // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 4220
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 4220
      },
      out_file: "./Logs/subscription-server.pm2.info.log",
      error_file: "./Logs/subscription-server.pm2.error.log"
    }],
    deploy: {
      production: {
        user: 'node',
        host: '212.83.163.1',
        ref: 'origin/master',
        repo: 'git@github.com:repo.git',
        path: '/var/www/production',
        'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production'
      }
    }
  };
  