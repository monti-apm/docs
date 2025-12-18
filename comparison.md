---
layout: docs.njk
title: Comparison
---

Monti APM and Meteor Cloud APM are the two most popular Meteor APM's. They both build on top of the open source Kadira code base, but have diverged significantly since then.

One significant difference is Monti APM has invested heavily in providing new tools and features to better understand what is happening inside Meteor apps and identify the cause of issues.

Here are some of the highlights of what Monti APM has added:

**Continuous CPU Profiling**

To easily investigate high cpu usage, the continuous cpu profiler records what happens 24/7 so you can go back in time to see what was running. It is designed to have a very low overhead (usually 1 - 2% higher cpu usage) so you can safely use it in production.

**Improved Traces**
Traces are a core feature that show what happened when running a method or subscribing to a publication. Monti APM has significantly improved traces with:

- instrumenting additional packages and methods
- recording more details, including where events started and recording nested events
- apps and packages can record custom events in traces
- easily find traces in the new All Traces view
- and many more

**HTTP Monitoring**

Monti APM tracks incoming HTTP requests to show the response time, status codes, traces, and many other details. It integrates with popular Meteor packages that are used for routing and api's.

**System Metrics**

To better understand what is happening inside the app, Monti APM tracks many details on the internals of Node, fibers, and the MongoDB driver which helps identify issues and the causes.

A partial list of what is tracked includes:
- garbage collection
- event loop delays
- time spent waiting for a connection to the mongo database
- the number of fibers created

**Error Tracking**

Monti APM is able to use production source maps to show where in the original code the error occurred at. After switching to a minifier that produces source maps, no additional setup is needed for Monti APM to use them.

Monti APM shows error insights to help identify patterns and how to reproduce the error.
