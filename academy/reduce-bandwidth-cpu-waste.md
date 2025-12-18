---
layout: docs.njk
title: Reduce Bandwidth and CPU Waste
---

It is common in Meteor apps to unsubscribe to all previous subscriptions when entering into a new route or removing a component from the screen. Read [this article](https://web.archive.org/web/20170518132004mp_/http://meteorhacks.com/meteor-subscription-optimizations.html) to learn more about this.

## Why is this bad?

This causes two main issues:

1. The user has to wait between routes, even for a recently visited route.
2. There is an increase in subscription rate, which introduces cpu and network issues.

## Identifying this issue

With Monti APM you can identify the subscriptions that have this issue and apply a fix.

First visit the Pub/Sub dashboard. Then sort publications by "Shortest Lifespan". Next, Select publications with the short lifespan and high sub rate.

![Sort with Shortest Lifespan](../../images/sort-with-shortest-lifespan.png)

Publications identified by the above selection criteria have the shortest lifespan and high subscription rates, which means they are subscribed and unsubscribed very rapidly. The following fixes can be applied to resolve the issue.

## Potential Fix

Fixing this issue is not that hard by using a subscription manager. Two popular options are:
- [meteorhacks:subs-manager](https://github.com/meteorhacks/subs-manager)
- [ccorcos:subs-cache](https://github.com/ccorcos/meteor-subs-cache)

Instead of using `Meteor.subscribe`, create a subscription manager and subscribe with that.

```js
const subs = new SubsManager();

Router.map(function() {
  this.route('home', {
    path: '/',
    waitOn: function() {
      return subs.subscribe('postList');
    }
  });

  this.route('singlePost', {
    path: '/post/:id',
    waitOn: function() {
      return subs.subscribe('singlePost', this.params.id);
    }
  });
})
```

See the [Subscriptions Manager docs](https://github.com/meteorhacks/subs-manager) for more information.

If you have a lot of users, fixing this issue will greatly help you reduce CPU cycles and Bandwidth.
