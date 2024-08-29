
const path = require('path');
const yaml = require('yaml');
const fs = require('fs');
const CryptoJS = require('crypto-js');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlInlineScriptPlugin = require('html-inline-script-webpack-plugin');



// Determine which secrets file to use and read it
const secretsFilePath = fs.existsSync('./secrets.yaml') ? './secrets.yaml' : './secrets_example.yaml';
const secretsFile = fs.readFileSync(secretsFilePath, 'utf8');
const secrets = yaml.parse(secretsFile);
const encryptedSecrets = [];

function normalizePassword(password) {
    return password.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  }

// Encrypt each secret and push it to the list
Object.keys(secrets).forEach((password) => {
    passNormalized = normalizePassword(password)
    const encrypted = CryptoJS.AES.encrypt(secrets[password], passNormalized).toString();
    encryptedSecrets.push(encrypted);
});


const secretsJson = JSON.stringify(encryptedSecrets);

module.exports = {
    mode: 'development', // Set to 'development' for development build or 'production' for production build
    // Enable following if using index.js, also add "<script src="bundle.js"></script>" to index.html to load the javascript
    // entry: './src/index.js',
    // output: {
    //     path: path.resolve(__dirname, 'dist'),
    //     filename: 'bundle.js',
    //     publicPath: '', // Explicitly set the publicPath to the root
    // },
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
            template: './src/index.html',
            inlineSource: '.(js|css)$', // Inline all JavaScript and CSS files
            minify: false, // Disable HTML minification
        }),
        new HtmlInlineScriptPlugin(),
        {
            apply: (compiler) => {
                compiler.hooks.compilation.tap('InjectSecretsPlugin', (compilation) => {
                    HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync(
                        'InjectSecretsPlugin',
                        (data, cb) => {
                            data.html = data.html.replace(
                                '<script>alert("Warning, you didnt build files, no secrets included in the file!")</script>',
                                `<!-- Secrets parsed from (${secretsFilePath}) on ${new Date()} -->\n<script>window.encryptedSecrets = ${secretsJson};</script></body>`
                            );
                            cb(null, data);
                        }
                    );
                });
            },
        },
    ],
};


