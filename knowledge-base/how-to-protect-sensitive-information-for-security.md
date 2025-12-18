---
layout: docs.njk
title: How to Protect Sensitive Information for Security Concerns
--- 

We collect three main types of data from your apps: metrics, traces, and errors. Metrics normally contain time related data and some values. But traces contains sensitive information like:

- Database query selectors
- Parameters for methods and publications
- URLs for HTTP requests
- Email addresses when sending emails

We take necessary measures to protect your data. But, no one can make 100% assurance on security these days. So, if you feel uncomfortable sending the above data, you should strip them before sending to Monti APM. Monti APM provides a few ways to do that.

> If you are more comfortable with storing the data in your environment, we provide an on-prem version of Monti APM. Please contact us at hello@montiapm.com for more details.

## Traces

> If you strip trace data, you won't get the full benefit of traces since they won't have some useful information like query selectors.

### Strip All Information

You can use the `stripSensitiveThorough` built-in filter to remove all potentially sensitive information:

```js
Monti.tracer.addFilter(Monti.Tracer.stripSensitiveThorough());
```

> There is also a more customizable `stripSensitive` filter. If you do not need the customization, we recommend using `stripSensitiveThorough`.

### Strip Selectively

You may want to selectively strip some information. Here is an example to strip only selectors from a given set of collections:

```js
Monti.tracer.addFilter(Monti.Tracer.stripSelectors([ "coll1", "coll2" ]));
```

Here's an another example to strip `start`, `http`, and `email` events, and selectors for two collections:

```js
Monti.tracer.addFilter(Monti.Tracer.stripSensitive([ "start", "http", "email" ]));
Monti.tracer.addFilter(Monti.Tracer.stripSelectors([ "coll1", "coll2" ]));
```

Here's how to filter by individual method/subscription.

```js
Monti.tracer.addFilter(Monti.Tracer.stripSelectors([ "coll1", "coll2" ], 'method', 'my-method-name'));
Monti.tracer.addFilter(Monti.Tracer.stripSelectors([ "coll1", "coll2" ], 'sub', 'my-sub-name'));
```

You can also write your own filters. Learn more in the [agent documentation](https://github.com/monti-apm/monti-apm-agent?tab=readme-ov-file#filtering-trace-data).

## Errors

### IP Addresses

By default, Monti APM collects the ip address for client errors. You can configure this with the [`recordIPAddress`](https://github.com/monti-apm/monti-apm-agent?tab=readme-ov-file#options) option.

### Filtering Errors

Learn how to filter errors in the [error tracking article](/knowledge-base/error-tracking/#filtering-errors).

_This content originally appeared in the Kadira Knowledge Base._
