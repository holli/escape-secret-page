
const path = require('path');
const yaml = require('yaml');
const fs = require('fs');
const CryptoJS = require('crypto-js');
const HtmlWebpackPlugin = require('html-webpack-plugin'); // Import HtmlWebpackPlugin
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin'); // Import HtmlWebpackInlineSourcePlugin


// Read and encrypt secrets
const secretsFile = fs.readFileSync('./secrets_example.yaml', 'utf8');
const secrets = yaml.parse(secretsFile);
const encryptedSecrets = [];

// Encrypt each secret and push it to the list
Object.keys(secrets).forEach((password) => {
    const encrypted = CryptoJS.AES.encrypt(secrets[password], password).toString();
    // console.log(password, ':', secrets[password], ':', encrypted)
    encryptedSecrets.push(encrypted);
});

module.exports = {
    mode: 'development', // Set to 'development' for development build or 'production' for production build
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
    },
    module: {
        rules: [
            {
                test: /\.yaml$/,
                use: 'yaml-loader',
            },
        ],
    },
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'),
        },
        compress: true,
        port: 9000,
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html', // Specify the HTML template to use
            inlineSource: '.js$' // Inline JavaScript files
        }),
        // new HtmlWebpackInlineSourcePlugin(HtmlWebpackPlugin), // Inline JavaScript files
        // {
        //     apply: (compiler) => {
        //         compiler.hooks.thisCompilation.tap('InjectSecretsPlugin', (compilation) => {
        //             compilation.hooks.processAssets.tap(
        //                 {
        //                     name: 'InjectSecretsPlugin',
        //                     stage: compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
        //                 },
        //                 () => {
        //                     // Inject the secrets JSON into the HTML file
        //                     const htmlPlugin = compilation.plugins.find(plugin => plugin.constructor.name === 'HtmlWebpackPlugin');
        //                     if (htmlPlugin) {
        //                         htmlPlugin.options.inject = {
        //                             after: `<script>window.encryptedSecrets = ${secretsJson};</script>`
        //                         };
        //                     }
        //                 }
        //             );
        //         });
        //     },
        //   }

        {
            apply: (compiler) => {
                // Use processAssets hook to modify assets as recommended by Webpack 5
                compiler.hooks.thisCompilation.tap('EncryptSecretsPlugin', (compilation) => {
                    compilation.hooks.processAssets.tap(
                        {
                            name: 'EncryptSecretsPlugin',
                            stage: compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
                        },
                        (assets) => {
                            assets['secrets.json'] = {
                                source: () => JSON.stringify(encryptedSecrets),
                                size: () => JSON.stringify(encryptedSecrets).length,
                            };
                        }
                    );
                });
            },
        },
    ],
};


