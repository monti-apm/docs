---
layout: docs.njk
title: Monti Debug in Production
---

You can use [Monti Debug](https://github.com/monti-apm/monti-debug#using-with-production-apps) in production apps to check the end to end performance of your app. It's a useful tool to find bottlenecks in your app and ways to fix them.

Before you start a session, you need to do some **configuration**.

## Add a debug auth key to your app

You don't want anyone unauthorized to view the Monti Debug data for your app. In production, Monti Debug requires you to set a debug auth key. When starting a Monti Debug session, you will provide this key to authenticate.

> You must add this key to your app, otherwise Monti Debug won't work in production.

You have two options to add the debug auth key:

### 1. Using Environment Variables

Set the `MONTI_DEBUG_AUTH_KEY` environment variable in your production deployment:

```js
MONTI_DEBUG_AUTH_KEY=<your very long password>
```

### 2. Using Meteor Settings

You can also use Meteor Settings to configure the debug auth key. This is how to do it:

```js
{
  "public": {},

  "monti": {
    "debug": {
      "authKey": "<your very long key>"
    }
  }
}
```

_This content originally appeared in the Kadira Knowledge Base._
