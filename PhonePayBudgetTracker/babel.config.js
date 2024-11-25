module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module:react-native-dotenv',
        {
          moduleName: '@env',
          path: '.env',
          blocklist: null, // Add keys you want to block, if any
          allowlist: null, // Add keys you want to allow, if any
          safe: false, // Set to true if you want to require a .env.example file
          allowUndefined: true, // Set to false to throw an error for undefined variables
        },
      ],
    ],
  };
};
