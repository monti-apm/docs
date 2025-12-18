---
layout: docs.njk
title: Managing Wait Time
---

If you've ever looked at a Monti APM trace, you should've seen the waitTime. In this article, I'll explain to you about the waitTime and how you can manage it. waitTime is not something evil, but you need to learn how to manage it.

## What is wait time?

Internally, Meteor executes all the DDP messages for a given client sequentially. Let me explain with an example:

> When I refer to "DDP messages", they include subscriptions, unsubscribes, and method calls made to the server.

Let's say I have a **blog** running with Meteor. When a user visits a page, a few things are happening behind the scenes:

1. a subscription to get postList (which will be shown in the sidebar)
2. a call to the detectCountry method to get the country from the IP address
3. a subscription to get the blogPost
4. a subscription to get comments
5. a subscription to get categories

Meteor processes all these DDP messages in a sequence by default. The `detectCountry` method has to wait for the `postList` subscription to become ready, and the `categories` subscription has to wait for the previous 3 subscriptions and one method call to finish before it can start. So, categories will be executed at the end and the result will be delayed!
You see this behavior by analyzing a trace for the categories subscription:

![Showing Meteor WaitTime](/images/showing-meteor-waittime.png) 

You can clearly see it has a waitTime of **6415** milliseconds due to waiting on the method and subscriptions.

## Using this.unblock

Now let's think about these DDP messages: 

* the `detectCountry` method has no dependencies on other DDP messages
* all the other DDP messages should load after the blogPost subscription

By looking at the rules above, we don't need detectCountry to block any other messages in particular, since it took almost 5 seconds to execute. 
So we can invoke this.unblock inside the method body as shown below and tell Meteor to stop blocking other messages.

```js
Meteor.methods({
  detectCountry: function() {
    this.unblock();
    // other logic
  }
});
```

We need the blogPost subscription to load before the others but the other subscriptions may execute in parallel. So, we can add this.unblock inside blogPost publications as well.  

> If you are using a Meteor release older than 2.3, `this.unblock` is not available in publications. You can add it with [lamhieu:unblock](https://github.com/lh0x00/meteor-unblock) (for Meteor 1.7 or newer) or [meteorhacks:unblock](https://github.com/meteorhacks/unblock) (for older Meteor releases)

Now we've added the necessary optimizations. Let's run the app and see what's happening right now: 

![Meteor WaitTime fixed](../../images/meteor-waittime-fixed.png)

Wow, that's great. We've reduced the initial subscription load time from **6415 to 360** milliseconds. That's a huge achievement. 

If you carefully look at the above trace, we still have the waitList because the `blogPost` subscription is a blocking one. But you can clearly see that other messages don't block the execution.

## Unblock Carefully

`this.unblock` cannot be enabled for all methods and subscriptions by default since it might give you some [unexpected behaviors](https://web.archive.org/web/20170518121334mp_/https://meteorhacks.com/understanding-meteor-wait-time-and-this-unblock.html#why-thisunblock-does-not-always-work). Iif your methods and subscriptions don't depend on others, there is a good chance you can unblock them and reduce the waitTime. It all depends on your app.

If you need to ask a specific question related to your app, please post to our [repository](https://github.com/monti-apm/feedback/discussions) and let's carry on the discussion.
