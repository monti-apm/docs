---
layout: docs.njk
title: Glossary
--- 

## Response Time

The Response Time is the time the server takes to execute your method or publication (it also includes the Wait Time).

In publications, the Response Time is calculate until the server emits the ready message. Therefore, this is the time taken to fetch all the cursor data and push it to the client.

## Total Network Latency

The Total Network Latency is the sum total of [Network Latency](#network-latency) from all your subscriptions within the selected time frame. It is measured in time.

## Total Response Time

The Total Response Time is the sum of [Response Time]() from all your subscriptions or method calls within the selected time frame. Like Network Impact, it's measured in time.

## Throughput

Throughput is the measure that shows the rate of messages processed. In Kadira, Throughput is a key metric when comparing performance.

- In methods, Throughput is the number of methods called in a minute
- In PubSub, SubRate is the number of subscriptions occurred in a minute

## SubRate

SubRate is the number of subscriptions made within a minute.

## Network Latency

Network Latency is the time spent on sending your data to the client. This is an estimated metric, and here's how we process it:

First, we calculate the amount of data this publication sends to client. Then we divide that by a given bandwidth and get the latency as a time. You can change the bandwidth from the top right of the Pub/Sub Detailed View.

*Algorithm*

`Network Latency = Data sent to clients / Bandwidth`

## Event Loop Utilization

On the server, Meteor runs on top of Node.js. Node.js runs in a single thread, and all activities are processed inside an Event Loop. You can learn more about Event Loop in this [article]().

Event Loop utilization tracks the usage of the Event Loop. For example, imagine that in last 30 minutes, the Node.js process spent 15 minutes on the Event Loop. That means that the Event Loop utilization was 50%.

*Algorithm*

`Event Loop utilization = (Time spent on the Event Loop / Total time elapsed) * 100`

This is an effective metric for tracking the processing power utilization of your app, even inside shared cloud platforms.

## Observer Reuse

Observer Reuse is the percentage of observers reused in your publication. For every cursor you return from the publications, Meteor creates an observer. If you create identical cursors, Meteor can reuse observers; then it does not need to fetch data again from the mongodb, which saves both CPU and network usage for both Meteor and the mongodb.

You can learn more about Observer Reuse from our [Academy article](../../academy/improving-cpu-network-usage).

## Estimated Memory Usage

Estimated memory usage is the estimated value of memory used by your publication in the selected time range. Calculating exact memory usage is very difficult. The V8 JavaScript Engine (which is the JavaScript runtime of Node.js) caches objects a lot, so calculating this value is even more difficult.

Therefore, we’ve developed an estimated value, which reflects the memory usage of each publication. Your actual memory usage will be lower than this value.
Memory Usage = (Active Docs * Average Doc Size) * (1- Observer Reuse ratio)
Active Docs is the number of documents that exist inside the publications, whereas Average Doc Size is the average doc size relevant to the current publication. With Meteor, several publications can publish different parts of a single document.

If there is Observer Reuse, actual memory usage will get reduced. That’s why we integrated it into the memory usage calculation as well.

For more information about V8 caching and memory usage, please refer to this [Academy article](../../academy/optimize-memory-usage).

## Lifespan

Lifespan is the average lifetime of a subscription from a given publication. This is calculated from the time Meteor receives the subscription request until it receives an unsubscription request or until the session get disconnected. 

## Active Subs

Active Subs is the number of subscriptions available in the selected time range.

## Update Ratio

Update ratio is the percentage of updated data against the total data sent to the client. This is how we calculate it:

Meteor sends three types of pub/sub-related DDP messages to the client, which are added, updated, and then removed. We only use added and updated data for this metric.

`Update Ratio = Total updated data / Total added data`

If you have a low update ratio, it means your subscription data is not changing very often. If the value is high, that means your subscription data is updating rapidly. It is possible for the update ratio to be more than 100%. This means that there are a lot of updates happening to the data after the initial addition.

## Live Query

When you return a cursor from the publication, that’s considered a Live Query. It watches changes in the DB and sends them to the client.

## Observer

When a Live Query is created, it’ll create an observer to watch the DB for changes. If there is an observer already created for the given query, Live Query will use that instead of creating a new observer. There are two types of observers Meteor creates for MongoDB.

- Oplog Observers - Watches the query using the MongoDB oplog
- Polling Observers - Watches the query by polling MongoDB

## Observer Lifetime

This is the lifetime of the observer from the time it was created to its destruction. 

## Observer Reuse Ratio

The Observer Reuse Ratio is the percentage of reused observer handlers in your Live Queries.

- If this value is closer to 100, that means most of the observers are reused, which is the optimal case.
- If this value if closer to 0, that means not many of the observers are reused. 

Most of the time, it’s possible to increase the observer reuse ratio by writing queries in such a way that they are reusable. Follow this guide for that.

## Live Updates

Live Updates show the count of all the activities of observers after they’ve initialized. Basically, it’s the sum of all the [Observer Changes]() events except for “Added (initially)”.

_Note: This content originally appeared in the Kadira Knowledge Base._
