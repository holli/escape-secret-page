# escape-secret-page

- git clone https://github.com/holli/escape-secret-page.git
- npm install
- development
  - npx webpack serve --mode production
    - will start to serve the html in http://localhost:9000/ , just edit the index.html, save and reload changes
- deployment
  - npx webpack --mode production
    - will create dist/index.html
  - copy dist/index.html to somewhere , or just add to git

## Other infos

- If making complicated javascript (and want an external file). See webpack.config.js -> part about bundle.js

## Todo

- ... ? ...

