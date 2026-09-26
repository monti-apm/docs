---
layout: docs.njk
title: Optimize Your Meteor App for Oplog Integration
# permalink: /academy/optimize-your-app-for-oplog
---

[Oplog integration](https://github.com/meteor/meteor/blob/devel/docs/long-form/oplog-observe-driver.md) gives a huge performance boost for Meteor apps, and it's recommended to use oplog with every production Meteor app.

Meteor supports most of the queries with oplog, but there are some edge cases where observers will fall back into an inefficient poll and diff implementation. It's very hard to implement oplog support for those queries (though with Mongo Change Streams it might now be possible).

Therefore, some of the queries in your app may fail to use oplog even if you've integrated oplog support into your app. I will show what those unsupported queries are and how to identify them easily.

## When You can't Use Oplog

Let me show you those edge cases in which oplog support cannot be enabled.

### Limit Without Sort

If your query has a limit but not a sort specifier, your query can't take advantage of oplog. See below:

```js
Posts.find({category: "meteor"}, {limit: 10});
```

If you add a sort specifier, you can get rid of this issue.

### Unsupported Operators

Meteor’s oplog integration does not support the `$where` operator or any geo–location specific operators. Therefore, you will need to find an alternative if you require oplog support for those queries.

### Unsupported Projections

Meteor’s oplog integration relies on MiniMongo for projections. MiniMongo does not support all of the projection operators. One such operator is `$elemMatch`. If you are using such operators in your query, your query won't receive the oplog support.

### Invalid Selectors

Sometimes, it's possible to have invalid selectors in some of your queries. This may be the result of some runtime behavior. For an example, check out following code:

```js
var remainder = getConfig('remainder');
Posts.find({users: {$mod: [10, remainder]}})
```

Due to a runtime error, it is possible to have the remainder listed as `null`. MiniMongo requires the `$mod` array to be filled with two numbers; therefore, oplog support won't be enabled for the above query.

### Unsupported Sort Operators

Oplog implementation relies on MiniMongo for the sorting behavior. Again, MiniMongo does not support all of MongoDB's sorting operators and features. If you use any unsupported feature, your observer can't take advantage of the oplog. See the following query for an example:

```js
Posts.find({}, {sort: {$natural: -1}, limit: 10});
```

Because it is using `$natural`, it won't be able to get the oplog support.

## Identify Above Scenarios

Now you clearly know why some of your observers cannot use oplog support. But it can be hard to find the reason for such queries in production, especially with invalid selectors.

[Monti APM](https://montiapm.com/) shows you whether oplog is enabled or not for your observers via its [tracing](/dashboards/pubsub-dashboard#response-time-with-traces) support. When the oplog is not used, it will show you why.

![Oplog Debugging Support in Monti APM](../../images/oplog-debugging.png)

The agent can also report a [repeated live-query polling diagnostic](/knowledge-base/error-tracking#repeated-live-query-polling-diagnostic) when a polling observer repeatedly crosses its cumulative fetched-document budget. Use its non-oplog reason to identify the relevant case above, then follow the [live-query investigation steps](/academy/live-queries#investigate-repeated-polling). A longer polling interval can reduce pressure temporarily, but enabling oplog support or reducing the query result addresses the recurring work itself.

Now you know how to optimize your app for Meteor’s oplog integration and find out whether oplog support is enabled for your individual observers. If it is not, Monti APM will help you to determine the reason and fix it.
