const presets = [
  [
    '@babel/preset-env',
    {
      targets: {
        browsers: ['> 1%', 'last 2 versions', 'not ie <= 9', 'iOS 9']
      }
    }
  ]
];

module.exports = {
  presets
};
