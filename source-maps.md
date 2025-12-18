---
layout: docs.njk
title: Source Maps
---

To improve loading time, Meteor minifies the app's code to reduce its size. However, it makes error traces much more difficult to understand.

Monti APM supports production client source maps. By using the source maps, Monti APM can modify the error stack traces to reference the line, column, and method name in the source file instead of the minified file.

For example, it can convert stack traces from:
```
TypeError: Cannot read property 'count' of undefined
    at Object.counter (https://example.com/app/app.js?hash=79071b18ec083b74de90664a13966115e626e92b:81:7)
    at https://example.com/packages/blaze.js?hash=a1ff2d6d5ecd59ee11e2ba260b8650a9d1140f59:3051:16
    at https://example.com/packages/blaze.js?hash=a1ff2d6d5ecd59ee11e2ba260b8650a9d1140f59:1715:16
```

To:
```
TypeError: Cannot read property 'count' of undefined
    at count (meteor://💻app/client/main.js:13:39)
    at https://example.com/packages/blaze.js?hash=a1ff2d6d5ecd59ee11e2ba260b8650a9d1140f59:3051:16
    at https://example.com/packages/blaze.js?hash=a1ff2d6d5ecd59ee11e2ba260b8650a9d1140f59:1715:16
```

## Enable

### 1. Change the app's minifier

The default minifier package Meteor uses doesn't generate source maps. You can replace it with one that does by running these commands:

```text
meteor remove standard-minifier-js
meteor add zodern:standard-minifier-js
```

When your Meteor app uses a minifier that creates source maps, Monti APM will automatically use them.

You can learn more about `zodern:standard-minifier-js` on its [Github page](https://github.com/zodern/minify-js-sourcemaps).

### 2. Update the agent

Private source maps requires `montiapm:agent` version 2.33.0 or newer. You can update by running:

```bash
meteor update montiapm:agent
```

### 3. Make the source maps private

To block public access to your source maps, you can run:

```text
meteor add zodern:hide-production-sourcemaps
```

## Disable

Since you have to opt into production source maps being generated, Monti APM uploads source maps by default in production, and disables uploading in development. To override the default, you can set the option with one of the following methods:

### Environment Variable

```bash
export MONTI_UPLOAD_SOURCEMAPS=false
```

### Meteor Settings

```js
"monti": {
  "options": {
    "uploadSourceMaps": false
  }
}
```

### Code

```js
Monti.connect('<app id>', '<app secret>', {
  uploadSourceMaps: false
});
```

## How it works

Every 20 - 40 seconds, the Monti APM Agent sends statistics to Monti APM and receives a list of source maps that are needed by new errors. The agent uploads any of those source maps it finds to Monti APM. The source maps are cached for up to 2 weeks.

The error trace could be shown in the UI before the source maps were available.

## Feedback

If you think Monti APM could have done a better job with an error, please share it with us. You can do this by clicking `SHARE THIS`, and pasting the link in the Support window (click `Support` in the upper left corner).
