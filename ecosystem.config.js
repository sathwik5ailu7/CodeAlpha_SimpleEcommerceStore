module.exports = {
  apps: [{
    name: 'shopzone-ecommerce',
    script: 'server.js',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
