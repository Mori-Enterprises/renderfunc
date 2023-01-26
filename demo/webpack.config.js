const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const entries = {
    basic: './src/basic.ts',
    rx: './src/rx.ts',
    tsx: './src/tsx.tsx',
};

module.exports = {
    entry: entries,
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    plugins: [
        ...Object.keys(entries).map(name => new HtmlWebpackPlugin({
            title: `renderfunc demo - ${name}`,
            chunks: [name],
            filename: `${name}.html`,
        })),
    ],
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
    },
    output: {
        publicPath: '/',
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    mode: 'development',
}