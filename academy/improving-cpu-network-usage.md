---
layout: docs.njk
title: Improve CPU & Network Usage
---

Before we start, I'd like to explain a bit about some Meteor Internals that might help you to understand this topic better. To make it easier to understand, I won't be using the exact terms Meteor uses internally.

## How Observers are Handled in Meteor

When you are returning Mongo cursors from a publication, Meteor will create an observer for each cursor. These observers are responsible for sending document changes to the client in real time.

For example, the following code creates two observers for the Posts and Comments collections.

```js
Meteor.publish('getPost', function(id) {
  let cursors = [];
  cursors.push(Posts.find(id));
  cursors.push(Comments.find({post: id}));

  return cursors;
});
```

When an observer is initializing, it will query mongodb for the initial dataset and send it to the client. After that, it will use oplog information to send data to the client (assuming your app is running with an active oplog).

But Meteor does something very smart: if you create multiple identical observers, Meteor won't fetch the initial dataset from the DB for each observer. Instead, it reuses the data already fetched by the first observer. That's what we are calling “an observer reuse”.

In order to create identical observers, you need to create cursors with:

* the same collection
* the same selector (query)
* the same set of options (including sort, limit, etc.)

## Why Observer Reuse Is Important

If your apps have many subscriptions, there is a tendency to have many observers as well. All of them will query mongo and get data from the DB instead of reusing the data from other observers.

* This will increase the CPU usage of both Meteor and MongoDB.
* This will increase the network usage of both Meteor and MongoDB.
* This will affect the pubsub response time.

If you can reuse observers, most of the above issues will be reduced.

## How to Identify Whether Observers are Reusing or Not

Plug Monti APM into your app. Play with your app for a while. Make sure there are multiple users using your app. Otherwise, the data won’t be realistic. In fact, if you can try this with a set of real users, you'll be getting the most realistic values.

Now visit the Monti APM Dashboard and switch into the Live Queries dashboard. There you will find a metric called "Observer Reuse Ratio", which tells you the percentage of Observer Reuse.

![Observer Reuse Percentage](/images/observer-reuse-percentage.png)

Additionally, you can sort publications by "Observer Reuse: Ascending" and identify which publications you need to improve.

![Publication Breakdown with Low Observer Reuse](../../images/publication-breakdown-with-low-observer-reuse.png)

If you are getting more than 75% of Observer Reuse, your publication is doing a great job.

## How to Reuse Observers

You can reuse observers by using identical cursors. In this section, I will use some realistic examples and show you how to improve their level of observer reuse.

### Querying Data with a Time Limit

Take a look at the following cursor:

```js
let dateBeforeOneDay = new Date(Date.now() - 1000 * 3600 * 24)
let messages = Messages.find({
  time: {$gt: dateBeforeOneDay}
}, {
  sort: {time: -1}
});
```

This cursor will have very low (near zero) Observer Reuse, because `dateBeforeOneDay` depends on the current time (in millis) when creating the observer.

Here is how you can fix this:

```js
let now = Date.now();
let currentHour = now - (now % (1000 * 3600));
let dateBeforeOneDay = new Date(currentHour - 1000 * 3600 * 24)
let messages = Messages.find({
  time: {$gt: dateBeforeOneDay}
}, {
  sort: {time: -1}
});
```

The query above will normalize the currentTime into the currentHour. In this way, you can create identical queries while keeping your logic as it is.

### Always Do a Null Check for `_id`

When the `_id` field in a query is `null`, Meteor changes the `_id` to a random string to ensure it will not select anything. However, this makes the query always unique and prevents reusing observers.

One situation this could happen is when publishing additional user data to the client:

```js
Meteor.publish('currentUser', function() {
  return Meteor.users.find({_id: this.userId}, {fields: {userType: 1}});
});
```

If you are getting many public views for your app, most of the time `this.userId` will be null. Even though the observers won't get anything from the DB, they will still individually query it and watch for changes.

These observers are unnecessary. A null check can be used to avoid this issue, as shown below:

```js
Meteor.publish('currentUser', function() {
  if(this.userId) {
    return Meteor.users.find({_id: this.userId}, {fields: {userType: 1}});
  } else {
    this.ready();
  }
});
```

### Limit by User Given Values

Depending on some client logic, you can ask the server to limit the number of documents to be sent.

```js
Meteor.publish('getRecentPosts', function(limit) {
  return Posts.find({}, {limit: limit});
});
```

If you are dynamically sending a limit from the client and there's many possible values, the observer can't be reused when the limit is different. Here is a fix for the above example:

```js
Meteor.publish('getRecentPosts', function(limit) {
  var base = 10;
  var normalizedLimit = limit + (base - (limit % base))
  return Posts.find({}, {limit: normalizedLimit});
});
```

Now you'll be getting more than you requested to the client, but it will give you a better Observer Reuse percentage. Play with the base value to get the optimal result.

Observer Reuse is one of the key metrics you can use to improve the CPU and network usage of your app. Be sure to stay alert to the Observer Reuse of your Meteor app.
