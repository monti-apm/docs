---
layout: docs.njk
title: Send data with a custom hostname
--- 

Sometimes you may need to send data with a custom hostname. Some possible reasons are:

- You are running multiple instances of the app on the same server, and need to use a different hostname for each
- You may need to group data from few different servers into one host
- You may need to give a more readable name than the default hostname

You can easily achieve with this when connecting to Monti APM. See below:

```js
Monti.connect(<appId>, <appSecret>, {hostname: "my-host"})
```

If you configure Monti APM via Meteor Settings, you can add the above option like this:

```js
{
  "monti": {
    "appId": "<appId>", 
    "appSecret": "<appSecret>",
    "options": {
      "hostname": "my-host"
    }
  }
}
```

If you configure Monti APM via environment variables, export the following environment variable:

```js
export MONTI_OPTIONS_HOSTNAME=my-host
```

_This content originally appeared in the Kadira Knowledge Base._
