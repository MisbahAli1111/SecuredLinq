const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add resolver for Node.js polyfills
config.resolver.alias = {
  ...config.resolver.alias,
  buffer: 'buffer',
};

module.exports = config; 