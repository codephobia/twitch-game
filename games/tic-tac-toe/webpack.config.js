'use strict';

const webpack = require('webpack');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

var pathToPhaser = path.join(__dirname, '/node_modules/phaser/');
var phaser = path.join(pathToPhaser, 'dist/phaser.js');

module.exports = {

    mode: 'development',

    entry: path.join(__dirname, 'src/app.ts'),

    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'game.js'
    },

    resolve: {
        extensions: ['.ts', '.js'],
        alias: {
            phaser: phaser,
            assets: path.join(__dirname, 'assets/')
        }
    },

    module: {
        rules: [
            {
                test: /\.(jpe?g|gif|png|svg|woff|ttf|wav|mp3)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[path][name].[ext]',
                            context: ''
                        }
                    }
                ],
                exclude: /node_modules/
            },
            {
                test: /\.scss$/,
                use: [{
                    loader: 'style-loader'
                }, {
                    loader: 'css-loader'
                }, {
                    loader: 'sass-loader',
                    options: {
                        includePaths: ['sass']
                    },
                }],
                exclude: /node_modules/
            },
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: [
                    /node_modules/,
                    /\.d\.tsx?$/
                ]
            },
            {
                test: [/\.vert$/, /\.frag$/],
                use: 'raw-loader'
            }
        ]
    },

    devServer: {
        contentBase: path.join(__dirname, '/dist'),
        //hot: true,
        compress: true,
        port: 9000,
        //inline: true,
        watchOptions: {
            aggregateTimeout: 300,
            poll: true,
            ignored: /node_modules/
        }
    },

    plugins: [
        new webpack.DefinePlugin({
            'CANVAS_RENDERER': JSON.stringify(true),
            'WEBGL_RENDERER': JSON.stringify(true)
        }),
        new CopyWebpackPlugin([{
            from: './*.html'
        }])
    ]
};