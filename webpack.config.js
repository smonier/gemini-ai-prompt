const path = require('path');
const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');
const fs = require('fs');

// Call dotenv and it will return an Object with a parsed key
if(fs.existsSync('.env.local'))
    dotenvExpand.expand(dotenv.config({ path: '.env.local' }));
dotenvExpand.expand(dotenv.config())

module.exports = (env, argv) => {
    const config = {
        entry: {
            'geminiPrompt': [path.resolve(__dirname, 'src/javascript/webapp', 'index.js')]
        },

        output: {
            path: path.resolve(__dirname, 'src/main/resources/javascript/webapp/'),
            filename: "[name].js"
        },
        resolve: {
            mainFields: ['module', 'main'],
            extensions: ['.mjs', '.js', '.jsx', 'json']
        },
        module: {
            rules: [
                {
                    test: /\.m?js$/,
                    include: /node_modules/,
                    type: "javascript/auto"
                },
                {
                    test: /\.m?js$/,
                    resolve: {
                        fullySpecified: false
                    }
                },
                {
                    test: /\.jsx?$/,
                    include: [path.join(__dirname, "src")],
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                ['@babel/preset-env', {
                                    modules: false,
                                    targets: {chrome: '60', edge: '44', firefox: '54', safari: '12'}
                                }],
                                '@babel/preset-react'
                            ],
                            plugins: [
                                'lodash',
                                '@babel/plugin-syntax-dynamic-import'
                            ]
                        }
                    }
                },
                {
                    test: /\.s[ac]ss$/i,
                    use: [
                        // Creates `style` nodes from JS strings
                        "style-loader",
                        // Translates CSS into CommonJS
                        "css-loader",
                        // Compiles Sass to CSS
                        "sass-loader",
                    ]
                },
                {
                    test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                    use: [{
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'fonts/'
                        }
                    }]
                }
            ]
        },
        optimization: {
            splitChunks: {
                cacheGroups: {
                    commons: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'geminiPrompt-vendors',
                        chunks: 'all'
                    }
                }
            }
        },
        plugins: [
            new webpack.EnvironmentPlugin([
                'REACT_APP_JCONTENT_HOST',
                'REACT_APP_JCONTENT_WORKSPACE',
                'REACT_APP_JCONTENT_FILES_ENDPOINT',
                'REACT_APP_JCONTENT_GQL_ENDPOINT',
                'REACT_APP_JCUSTOMER_ENDPOINT'
            ])
        ],
        mode: 'development'
    };

    config.devtool = (argv.mode === 'production') ? 'source-map' : 'eval-source-map';

    if (argv.watch) {
        config.module.rules.push({
            test: /\.jsx?$/,
            include: [path.join(__dirname, 'src')],
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env', '@babel/preset-react']
                }
            }
        });
    }

    if (argv.analyze) {
        config.devtool = 'source-map';
        config.plugins.push(new BundleAnalyzerPlugin());
    }

    return config;
};
