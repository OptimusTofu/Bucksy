module.exports = {
    apps: [
        {
            name: 'bucksy',
            script: './dist/index.js',
            instances: 1,
            autorestart: true,
            watch: false,
            env: {
                NODE_ENV: 'production'
            },
            env_development: {
                NODE_ENV: 'development'
            },
            error_file: './logs/error.log',
            out_file: './logs/out.log',
            merge_logs: true,
            max_memory_restart: '300M'
        },
        {
            name: 'bucksy-admin',
            script: './dist/admin/server.js',
            instances: 1,
            autorestart: true,
            watch: false,
            env: {
                NODE_ENV: 'production'
            },
            env_development: {
                NODE_ENV: 'development'
            },
            error_file: './logs/admin-error.log',
            out_file: './logs/admin-out.log',
            merge_logs: true,
            max_memory_restart: '200M'
        }
    ]
}; 