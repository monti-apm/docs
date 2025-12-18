---
layout: docs.njk
title: Using Monti APM with enterprise firewall / proxy
---

## Enterprise Firewall

If your app deployed on a restricted environment with tight firewall rules, you have two options:

1. Use our on-prem version of Monti APM to store all data within your environment. Please contact us at hello@montiapm.com to discuss this option.
2. allow access to Monti APM through your firewall.

Our `montiapm:agent` Meteor package uses HTTPS traffic to send data to our infrastructure. Here's the endpoint information:
- host: engine.montiapm.com (or engine-us.montiapm.com for the US region)
- port: 443

If your trying to use the Monti APM dashboard behind a firewall, you need to allow access to it also. Here's the information.:
- host: app.montiapm.com
- port: 443

## HTTP/HTTPS Proxies

If you are accessing internet via a proxy, you will need to apply the following changes:

```js
Monti.connect("appId", "password", {
  proxy: "http://your-http-proxy.com:port"
});
```

You can also configure above options with Meteor settings or using environment variables. Learn how in the [auto connect](/getting-started#auto-connect) docs.

_This content originally appeared in the Kadira Knowledge Base._
