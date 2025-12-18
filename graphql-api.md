---
layout: docs.njk
title: API
---

Most data collected and aggregated for your app can be accessed through our [GraphQL](https://graphql.org/) API. Use it to build custom dashboards, integrations, or explore data in ways not possible through Monti APM's UI. The API is available for all users and apps.

We value any feedback related to the API. Have an idea of something that could be improved? Please [let us know](mailto:hello@montiapm.com).

We have several [example projects](https://github.com/monti-apm/api-examples) showing how the API can be used.

## Authenticate

Send a POST request to `https://api.montiapm.com/auth` with a json object in the body:

```js
{
  "appId": "< app id >",
  "appSecret": "< app secret >"
}
```

Replace the app id and app secret with the values for your app. You can view them in the app's setting window on [app.montiapm.com](https://app.montiapm.com).

The response will be a JWT token. A separate JWT token will be needed for each app.

## Querying

Queries can be sent in a POST request to `https://api.montiapm.com/core`. The `authorization` header should be set to the JWT token created for the app.

## Documentation

A GraphiQL instance can be accessed at [api.montiapm.com/docs/explore](http://api.montiapm.com/docs/explore.html) to explore and try the API. Documentation is available in the sidebar.

## Example Queries

Highest memory usage for each server during the last hour:

```graphql
meteorSystemMetrics (metric:RAM_USAGE, groupByHost:true) {
    host
    percentile(value:100)
}
```

Method traces with response time larger than 1,000ms in the last hour:

```graphql
meteorMethodTraces (minValue:1000) {
    id
    host
    method
    totalValue
}
```

## Limits

Since the schema is not deeply nested, we only rate-limit the root fields (`meteorMethodTraces`, `meteorSystemMetrics`, etc.). They are limited to a total of 5,000 per hour. For example, the following query would count as 2:

```graphql
{
  meteorMethodTraces (minValue:1000) {
      id
      host
      method
      totalValue
  }

  meteorSystemMetrics (metric:RAM_USAGE groupByHost:true) {
      host
      percentile(value:100)
  }
}
```

When there is a `limit` option the maximum it can be set to is 1,000.

The range for metrics (the difference between startTime and endTime) is limited based on the resolution:

- Resolution of `1min` is limited to a range of 1000 minutes
- Resolution of `30min` is limited to a range of 14 days
- Resolution of `3hour` is only limited by the retention of the plan you are using
