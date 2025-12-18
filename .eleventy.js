const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
const CleanCSS = require('clean-css');
const markdownIt = require('markdown-it');
const markdownItAnchor = require('markdown-it-anchor');
const htmlParser = require('node-html-parser');
const path = require('node:path');
const fs = require('node:fs');
const { imageSize } = require('image-size');
const inspect = require('node:util').inspect;

let DISABLE_IMAGE_SIZE = process.env.DISABLE_IMAGE_SIZE === 'true';

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(syntaxHighlight);

  eleventyConfig.addPassthroughCopy('./favicon.png');
  eleventyConfig.addPassthroughCopy('./favicon.ico');
  eleventyConfig.addPassthroughCopy('./images');
  eleventyConfig.addPassthroughCopy('./videos');

  eleventyConfig.addFilter(
    'debug',
    (content) => `<pre>${inspect(content)}</pre>`,
  );

  eleventyConfig.addFilter('removeTrailingSlash', function (value) {
    if (value.endsWith('/')) {
      return value.slice(0, -1);
    }
  });

  eleventyConfig.addTransform('image-size', function (content) {
    if (DISABLE_IMAGE_SIZE) {
      return content;
    }

    let root = htmlParser.parse(content);
    let base = this.inputPath;

    // Avoid content jumping when image loads by setting size and aspect ratio
    root.querySelectorAll('img').forEach((img) => {
      let src = img.getAttribute('src');
      let imgPath = src.startsWith('/')
        ? path.join(__dirname, src)
        : path.resolve(base, src);
      const buffer = fs.readFileSync(imgPath);
      let size = imageSize(buffer);

      img.setAttribute('height', size.height);
      img.setAttribute('width', size.width);

      let style = img.getAttribute('style');

      style = style ? `${style};` : '';

      let customStyles = [`aspect-ratio: ${size.width} / ${size.height}`].join(
        ';',
      );

      img.setAttribute('style', style + customStyles);
    });

    // Make images in content clickable to view full size
    root.querySelectorAll('main img').forEach((img) => {
      let src = img.getAttribute('src');
      let imgHtml = img.outerHTML;
      img.insertAdjacentHTML('afterend', `<a href="${src}">${imgHtml}</a>`);
      img.remove();
    });

    return root.toString();
  });

  let markdownLibrary = markdownIt({
    html: true,
    breaks: true,
    linkify: true,
  }).use(markdownItAnchor, {
    permalink: markdownItAnchor.permalink.headerLink(),
  });
  eleventyConfig.setLibrary('md', markdownLibrary);

  eleventyConfig.addFilter('cssmin', function (code) {
    return new CleanCSS({}).minify(code).styles;
  });
};
