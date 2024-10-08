const path = require('path');
const { devDependencies } = require('./package.json');

module.exports = () => {
    return {
        bundle: true,
        minify: true,
        sourcemap: false,
        platform: 'node',
        keepNames: true,
        target: 'node18',
        packager: 'npm',
        keepOutputDirectory: true,
        exclude: [...Object.keys(devDependencies)],
        outdir: path.join(__dirname, '.build'),
    };
};
