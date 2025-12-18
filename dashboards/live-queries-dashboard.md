---
layout: docs.njk
title: Live Queries Dashboard
---

## Live Queries Summary

This is a set of important metrics of your app's Live Queries. It includes following metrics:

- [Fetched Documents](#fetched-documents)
- [Live Updates](/knowledge-base/glossary#live-updates)
- [Observer Reuse Ratio](/knowledge-base/glossary#observer-reuse-ratio)
- [Observe Lifetime](/knowledge-base/glossary#observer-lifetime)

## Fetched Documents

This is the number of documents fetched from MongoDB via [observers](/knowledge-base/glossary#observer). Meteor fetches documents from MongoDB in a few different cases. Here are some of them:

- When a new observer is created (for the initial dataset)
- Every 10 seconds, if this observer is not using the oplog
- When the observer’s internal buffer becomes empty (with oplog observers only)

## Observer Changes

Once an [observer](/knowledge-base/glossary#observer) is created, it’ll trigger events in a few different scenarios. Here's a list of those event types:

- Added (Initially) - When an observer is created for the first time, it’ll fetch the initial set of documents from MongoDB and trigger this event for each document
- Added - If a new document satisfies the query, then the observer will trigger this event with that document
- Updated - If there is a change to an already added document, then the observer will trigger this event with the changes
- Removed - If an existing document does not satisfy the query, then the observer will trigger this event with that document’s ID

## Oplog Notifications

Meteor watches the MongoDB oplog to observe changes happening in the MongoDB. If something happens in the DB, Meteor will receive it as a notification. The notification is attached to a collection. Then, Meteor will forward this notification to most of the observers created for that collection.

There are few different types of oplog notifications. They are:

- Inserted - When a new document is added to the collection
- Updated - When a document is updated in the collection
- Removed - When a document is removed from the collection

Meteor will receive all these notification regardless of whether it has a related observer or not.

## Total/Reused Observer Handlers

When a new [Live Query](/knowledge-base/glossary#live-query) is created, it’ll create a new [observer](/knowledge-base/glossary#observer) that watches the DB for changes. If there is an observer already created for the query, Live Query won’t create a new observer. Instead, it’ll reuse an existing observer.

There is always a handler that sits between the Live Query and the observer.

- Total Observer Handlers refer to the total number of handlers.
- Reused Observer Handlers refer to handler sites between the Live Query and an already created observer.

If the reused count is close to total count, that means Live Queries have created a fewer number of actual observers, which is the ideal case.

Check this [guide](/academy/improving-cpu-network-usage#how-to-reuse-observer) to learn how to increase the Reused Observer Handlers count.

## Live Query Publication Breakdown

This is a breakdown of publications sorted by the different metrics related to [Live Queries](/knowledge-base/glossary#live-query). They include:

- [Fetched Documents](#fetched-documents)
- [Observer Reuse](/knowledge-base/glossary#observer-reuse-ratio): Descending
- [Observer Reuse](/knowledge-base/glossary#observer-reuse-ratio): Ascending 
- [Observer Changes: Total](#observer-changes)
- [Observer Changes: Live Updates](/knowledge-base/glossary#live-updates)
- [Observer Changes: Added (Initially)](#observer-changes)
- [Observer Changes: Added](#observer-changes)
- [Observer Changes: Changed](#observer-changes)
- [Observer Changes: Removed](#observer-changes)
- [Oplog Notifications: Low](#oplog-notifications)

_This content originally appeared in the Kadira Knowledge Base._
