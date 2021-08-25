const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {
    CleanWebpackPlugin
} = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    mode: 'development',
    watch: true,
    resolve:{
        alias: {
            react: path.resolve('./node_modules/react')
        },
    },
    entry: {
        // app: './src/index.js',
        // print: './src/print.js',
        'cl-components': path.resolve(__dirname, 'public/src/index.js'),
        //'cl-vendor': path.resolve(__dirname, 'public/src/vendors.js')
    },

    devtool: 'inline-source-map',
    devServer: {
        contentBase: './public',
    },
    plugins: [
        //new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            title: 'Output Management',
            template: "./src/index.html",
            filename: "./index.html"
        }),
    ],
    output: {
        library: 'CL',
        libraryTarget: 'umd',
        globalObject:  'this',
        umdNamedDefine: true,
        filename: '[name].bundle.js',
        //path: path.resolve(__dirname, 'public/dist'),
        path: path.resolve(__dirname, '../ui/src/assets/comps'),
        publicPath: '/',
    },
    optimization: {
        splitChunks: {
            chunks: 'all',
        },
        minimize: false, //this is used for prod or dev environment
        minimizer: [new UglifyJsPlugin()],
    },
    module: {
        rules: [{
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader',
                ],
            },
            {
                test: /\.scss$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader',
                ],
            },

            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [
                    'file-loader',
                ],
            },

            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                use: [
                    'file-loader',
                ],
            },
            {
                test: /\.(csv|tsv)$/,
                use: [
                    'csv-loader',
                ],
            },
            {
                test: /\.xml$/,
                use: [
                    'xml-loader',
                ],
            },

        ],
    },
};
