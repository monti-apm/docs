---
layout: docs.njk
title: Error Tracking
---

## Error Tracking - Introduction

Monti APM has a built in error tracking solution which can be used to track both client and server errors. It is enabled by default.

**Type of Errors Monti APM Tracks**

Monti APM can track both server and client side errors alike. See a list of errors Monti APM can track

**Server Side**

- Server Crash - Errors caused to crash your server
- Method Errors - Errors thrown inside Meteor methods
- Subscriptions Errors - Errors thrown inside the publication (when you subscribed)
- Internal Meteor Errors - Errors thrown inside Meteor core platform

**Client Side**

- Internal Meteor Errors (via Meteor._debug)
- Errors captured via window.onerror
- Unhandled promise rejections

### Error Traces

Monti APM not only tracks errors, but it also trace errors and shows the context for your error. It includes, all the major events related to the trace. Then you can easily reproduce and fix the error very quickly. See below for some error traces which has been captured with Monti APM.

## Tracking Custom Errors

By default, Monti APM tracks all uncaught or unhandled errors for you. However, if you need to handle errors yourself you will need to report the error to Monti APM as well. Here are the some of the options:

### Option 1 - Re-throw the Error**

The easiest option is capture the error and then throw the error. Monti APM will capture the error and you can see it in the UI.

```js
try {
  // your code which may throw some errors
} catch(ex) {
  // handle your error and throw again
  throw ex;
}
```
**Option 2 - Use Monti.trackError**

Other option is to use Monti.trackError API. Which is available on both client and the server. See how it can used.

```js
try {
  functionThatCouldFail();
} catch (err) {
  Monti.trackError(
    err,
    { type: 'payment', subType: 'stripe-payment' } // optional
  );
}
```

Monti APM can use source maps to show where in the original code the error occurred. Learn more in our article on [source maps](https://docs.montiapm.com/source-maps).

## Filtering Errors

You might not want to track every error in your app. The agent allows you to filter out errors you do not want to track.

### Error Filtering API

This api is available on both client and the server.

Each error that occurred in your app goes through error filters before being sent to Monti APM. If one of the error filters rejects an error, it won't be sent to Monti APM.

Here is out to create an error filter:

```js
Monti.errors.addFilter(function(errorType, message, error) {
  // filter out all client errors
  if(errorType == 'client') {
    return false;
  }

  // return true to indicate this error is allowed to be tracked
  return true;
});
```

These are the parameters passed to the filter.

**errorType**
Here are some of the available types:

- client - a client error 
- method - a method error
- sub - a subscription error
- server-crash - an uncaught exception which crash the app
- server-internal - an internal meteor framework error

**client** error type is available inside the client side only(on both in the browser and cordova context) only. All other types are available on the server only.

**message**
actual error message

**error**
actual error object (if any)

### Built-in Filters

Monti APM comes with a few pre-defined filters to make your life easy. We'll be adding more as we understand more common errors. 

**Filter Validation Errors**

Errors created with Meteor.Error inside Meteor methods and publications are normally validations. You may not need to track them at all. If so, you can use a built-in filter as shown below to filter out those errors.

```js
Monti.errors.addFilter(Monti.errorFilters.filterValidationErrors);
```

> Make sure to add the above filter on the server side.

**Filter Common Platform Errors**

There are some platform level errors which cannot be prevented. DDP and sockjs heartbeat issues are a few of those. This filter will filter out those errors.

```js
Monti.errors.addFilter(Monti.errorFilters.filterCommonMeteorErrors);
```

> Make sure to add the above filter on both the server and client

## Disable Error Tracking

If you need to disable error tracking, you have two options:

### Option 1 - Disable when connecting

The best option is to ask Monti APM to not to track errors when connecting. See below:

```js
var montiOptions = {enableErrorTracking: false }
Monti.connect('appId', 'appSecret', montiOptions);
```

If you are using Meteor settings to configure Monti APM, you can use following method:

```js
{
  ...

  "monti": {
    "appId": "appId",
    "appSecret": "appSecret",
    "options": {
      "enableErrorTracking": false
    }
  }

  ...
}
```

### Options 2 - Use Monti.disableErrorTracking

You may need to disable error tracking in runtime or you might be using Environment Variables to configure Monti APM. For those situations, use the following API to disable error tracking.

```js
Monti.disableErrorTracking();
```

If you need to enable it back, use the following API:

```js
Monti.enableErrorTracking();
```

_This content originally appeared in the Kadira Knowledge Base._
