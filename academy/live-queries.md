---
layout: docs.njk
title: Optimizing Your Meteor App for Live Queries
---

Live Query support is one of the major features of Meteor. A new Live Query is normally created when you return a cursor from a publication. Meteor will then reactively watch the query and send changes to the client.

Monti APM also tracks live queries created inside publications with the [`cursor.observe`](https://docs.meteor.com/api/collections.html#Mongo-Cursor-observe) and [`cursor.observeChanges`](https://docs.meteor.com/api/collections.html#Mongo-Cursor-observeChanges) api's. Those api's are used by many packages that help with publications, such as [zodern:relay](https://github.com/zodern/meteor-relay) or [peerlibrary:reactive-publish](https://github.com/peerlibrary/meteor-reactive-publish).

> What is the difference between an observer and live query?
> Observers are how you create live queries in Meteor. Meteor doesn't use the term live query as much anymore, though it is used as the name for similar features in other projects. You can consider it as another name for observers.

In order to detect these changes, Live Queries do some amazing work behind the scenes. This work requires cpu cycles and make live queries a major factor affecting your app’s CPU usage and scalability.

However, the number of Live Queries itself does not cause many issues. These are the factors affecting the CPU usage:

* Number of documents fetched by Live Queries
* Number of live changes happening
* Number of oplog notifications Meteor is receiving

Fortunately, there are ways to optimize our apps for better-utilized Live Queries. Let’s take a look.

### Try to fetch as little as possible

This is the rule of thumb you can apply for any app. But you can’t decide which publication to optimize until you go live or launch a load test. After that, you can use Monti to find out which publications fetch a lot of data from MongoDB. Here’s how to:

![Publications](/images/live-queries-fetched-documents.gif)

* Go to Monti APM’s Live Queries tab
* Sort the publications by “Fetched Documents”

Now you can see a set of publications sorted by the number of documents they fetched from MongoDB. Here are some optimizations you can apply to them:

* If the "Observer Lifetime" is short, try to use [SubsManager](https://github.com/kadirahq/subs-manager) to reduce the throughput.
* If the "Observer Reuse Ratio" is low, try to reduce it. We’ll talk more about this in a second.
* If possible, try to reduce the number of documents fetched by changing your code. For instance, You could use a limit when fetching data.

The fetched-document total combines initial and recurring work. A publication such as `catalogIcons` fetching 12,000 documents once can be intentional. Fetching the same result repeatedly with a polling observer is more likely to cause sustained database and CPU pressure. Read the [Fetched Documents dashboard guide](/dashboards/live-queries-dashboard#fetched-documents) for this distinction.

### Investigate repeated polling

The agent can report a [repeated live-query polling diagnostic](/knowledge-base/error-tracking#repeated-live-query-polling-diagnostic) when one polling observer repeatedly fetches a large cumulative result. Start with the publication, collection, polling interval, fetched-document total, duration, and non-oplog reason in the report.

Then work through these fixes:

* Inspect the non-oplog reason and confirm why Meteor selected polling for the observer.
* Remove `disableOplog` or `_disableOplog` when it is not required.
* Correct selectors, sort specifications, and projections that Meteor's oplog observer does not support. The [oplog optimization guide](/academy/optimize-your-app-for-oplog) lists common causes.
* Narrow the selector and projection so each cycle fetches and diffs only the documents and fields the publication needs.
* Increase `pollingIntervalMs` only as a mitigation. It lowers the frequency of the repeated work but does not remove the underlying polling or oversized result.

### Reuse observers as much as possible

When you create a Live Query, it’ll create an observer internally. Observers are responsible for watching changes in the DB and notifying the Live Query. However, if there is an existing observer for a similar query, Meteor won’t create a new observer. 

To be a similar query, both the query and the options passed to `Collection.find()` should be the same.

**Now let’s try to find some Live Queries to optimize**

* Sort publications by “Fetched Documents.”
* Then, check their Observer Reuse value.
* If that’s low, then we can optimize.

There are few things you can do to increase your observer reuse ratio. Take a look at [this guide](/academy/improving-cpu-network-usage). 

### Optimize busy Live Queries

Another key point is to identify busy subscriptions and try to optimize them. A busy subscription is a subscription that triggers a lot of events, such as added, changed or removed, after it is created.

To identify busy subscriptions, with “Observer Changes: Live Updates”. These are the busy publications in your app.

![Sort publications](/images/sort-publications.gif)

> We calculate Live Updates by combining all the Observer Changes events except “Added (Initially)”.

Now that you know the busy publications in your app, try to see whether there is any chance to reduce the changes in those queries. Sometimes, you can add a field filter and try to avoid unnecessary changes, but it’s totally dependent on your app.

### Prevent unwanted oplog notifications

Meteor watches the MongoDB oplog to see changes happening in the MongoDB. Whenever something changes in the database, Meteor will receive the change as a notification. The notification is attached to a collection. Then, Meteor will forward this notification to most of the observers created for that collection.

Now let’s try to see whether we are getting unwanted oplog notifications or not.

For this, look at the trends of observer changes with the trends of oplog notifications. If there is a big difference in trends (but not in the count), that means there are some unwanted notifications.

<figure>

  ![Observer and Oplog changes](../../images/observer-and-oplog-changes.gif)
  <figcaption>This is how you can check trends</figcaption>

</figure>

This is usually because of doing bulk write operations in the DB. In that case, Meteor will also get those operations and try to handle them, even if there are no observers related to those updates. There is no direct fix; the only option is to avoid those bulk updates.

There are a few ways to improve this:
- If you can, avoid the bulk updates
- Move the collections with the bulk updates to a separate database and [manually connect](http://stackoverflow.com/a/20537457) to that database without the oplog. Observers will then poll the database every 10 seconds instead of following the oplog
- Switch to [cultofcoders:redis-oplog](https://github.com/Meteor-Community-Packages/redis-oplog). This replaces following the Mongo oplog with a more efficient implementation that uses redis. However, changes to the database made outside of the Meteor app are not detected by observers
- [Exclude](https://github.com/meteor/meteor/pull/13009) the collections from oplog tailing. Observers for those collections will use polling instead

<hr />

These are just a couple of ways to optimize your app for Live Queries. Some of these fixes are very easy to implement. Always try to fix the subscriptions that are used frequently; otherwise this may lead to premature optimization.
