---
layout: docs.njk
title: Reducing PubSub Data Usage
---

Publications are the main place where your app sends data to the client when a client subscribes to it. Meteor caches a copy of each client's data in the server's memory. For example, let's say a single client has  approximately 2MB of subscription data. If you have 1000 concurrent clients connecting to your app, Meteor caches approximately 2GB (2MB * 1000) of client data in the server's memory.

If your app sends a large amount of data, it will take a considerable amount of time for it to reach the client (especially when utilizing mobile networks). So it is very important to reduce the amount of data your app sends to clients, both for server performance and to provide a fast experience for your users. Let’s see what we can do about it.

> Fetching a lot of data (~1 MB per each subscription) from the DB and sending them to the client takes considerable amount of CPU. This will lead to a major bottleneck in your app's scalability.

## Use Field Filtering

Most of the time, you don't need to publish all the fields of the MongoDB documents. Try using field filtering to remove the data your client doesn't need. For example, imagine your app is a blog and a typical blog post looks like this in MongoDB:

```js
    {
      "_id": "this is the id",
      "title": "This is my summery",
      "content": "This is my content and it is very very long"
    }
```

Your home page contains a list of all blog posts and their titles. This is the publication used for that:

```js
    Meteor.publish('getTitles', function() {
      return Posts.find();
    });
```

In this case, you are also sending the `content` field to the client, but the client does not need it. Thus, the optimized version excludes `content` by using field filtering:

```js
    Meteor.publish('getTitles', function() {
      return Posts.find({}, {fields: {title: 1}});
    });
```

Use Meteor Documentation to learn more about [field filtering](https://docs.meteor.com/api/collections.html#fieldspecifiers).

## Restructure Your Application

With some small changes, you can greatly reduce the amount of data you send to the client.

Let's look at an example. You have a Meteor app for your blog. The blog has 200 articles, and you are sending all of the titles to the client. However, your users only need to know about the more recent articles. You could send the last 20 articles instead of all of them. Making this change reduces the required memory by a factor of 10. The following example shows how to implement this modification:

```js
    Meteor.publish('getTitles', function() {
      return Posts.find({}, {fields: {title: 1}, limit: 20});
    });
```

This is just an example. You can use paginations or implement a similar technique. Refer to the [Pagination subscriptions](https://guide.meteor.com/data-loading#pagination) section of the Meteor Guide, or the Meteorpedia article on [infinite scrolling](http://www.meteorpedia.com/read/Infinite_Scrolling) for implementing paginations with Meteor.

## Restructure Your Data

What if you want a content summary along with the title for your blog posts? In this case, you may decide to send the `content` to the client too, and you can show a summary based on that to the client. This works, but there is better way.

You can create a summary when you are creating and editing the blog post and assign it to a new field called `summary`. Then you can send that field instead of `content`, reducing the data usage. See below:

```js
    Meteor.publish('getTitles', function() {
      return Posts.find({}, {fields: {title: 1, summary: 1}, limit: 20});
    });
```

## Counting On The Server Side

Sometimes, especially when you are building dashboard and charts, you might need to count the number of documents for some queries. For that, you should not send documents to the client and do the counts on the client side. 

Best way is to count them in the server side using a package like [publish-counts](https://github.com/percolatestudio/publish-counts).

You may also consider using [MongoDB aggregation techniques](/academy/make-your-app-faster#do-server-side-aggregations) to get a summery of data and send them to the client.

These are only some of the tips you can use to save subscription data, save server memory usage, and reduce latency.
<!-- TODO: implement alternative.
 Try applying some of these; you can verify the results from the [Network Latency](../../knowledge-base/glossary#network-latency) metric in the Monti APM. -->
