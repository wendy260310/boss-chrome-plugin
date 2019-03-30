let path = require('path');
module.exports = {
    entry: {
        'popup-react': './react/popup.js',
        'boss-react': './react/boss.js',
    },
    devtool: 'sourcemaps',
    cache: true,
    mode: 'production',
    output: {
        path: __dirname,
        filename: './react/[name].js'
    },
    resolve: {
        extensions: ['.js'],
        modules: [path.resolve(__dirname, 'react'),
            path.resolve(__dirname, 'node_modules')]
    },
    module: {
        rules: [
            {
                test: path.join(__dirname, '.'),
                exclude: /(node_modules)/,
                use: [{
                    loader: 'babel-loader',
                    options: {
                        presets: ["@babel/preset-env",
                            {
                                'plugins': ['@babel/plugin-proposal-class-properties']
                            },
                            "@babel/preset-react"]
                    }
                }]
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    }
};

