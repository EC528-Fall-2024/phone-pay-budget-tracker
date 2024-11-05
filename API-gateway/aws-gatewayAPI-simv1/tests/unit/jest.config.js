const path = require('path');

module.exports = {
  rootDir: '.', 
  testEnvironment: 'node',
  testMatch: ['<rootDir>/**/*.test.js'],
  moduleDirectories: [
    'node_modules',
    path.join(__dirname, '../../../../microservices/User-Profile/node_modules'),
  ],
};
