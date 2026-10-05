---
layout: docs.njk
title: API
---


Most data collected and aggregated for your app can be accessed through our REST API. Use it to build custom dashboards, integrations, explore data in ways not possible through Monti APM's UI, or give access to the data in Monti APM to your agents. The API is available for all users and apps.

This REST API replaces our former GraphQL API, and provides more data with more flexible ways to query.

### Stability

While we anticipate no large changes, the API is currently not considered stable as we continue to test and improve the API and the query system it uses. It is ready to be used to explore your app's data (personally or through an agent), but writing deeper integrations might require minor updates until we stabilize the API. Any breaking changes will be announced on our [changelog](https://headwayapp.co/monti-apm-changelog).

## Authenticate

You can get an API token in your [account settings](https://app.montiapm.com/account/profile). Each token can be scoped to a single app or to access data for all of your apps.

The REST API uses bearer auth. Set the `Authorization` header to this, of course replacing `<api token>` with your API token.

```
Bearer <api token>
```

## Routes

The base URL is `https://api.montiapm.com/v1/`, or `https://api-us.montiapm.com/v1` for apps using the Galaxy integration.

### List of metrics

A list of metrics and their filters, dimensions, and aggregations can be retrieved with a GET request to `/metrics`.

```bash
curl https://api.montiapm.com/v1/metrics \
  -H "Authorization: Bearer $MONTI_TOKEN"
```

For each metric, the first listed aggregation is the default aggregation. The default for specific metrics might change over time, so we recommend specifying the aggregation when querying metrics.

### List of tag values

You can get a list of values for a tag with a POST request to `/tag-values`.

The body should be in the format of:

```json
{
  "appIds": ["YOUR_APP_ID"],
  "tagId": "tag:host",
  "metricId": "methods.total"
}
```

A `startTime` and `endTime` can also be optionally provided, defaulting to the last hour.

The result looks like:

```json
{
  "values": ["web-1", "web-2"]
}
```

The tag values can differ based on the metric, specifically with the collection the metric is from. For example, for the tag with the id `tag:name` will have different values for method and http metrics.

Provides a maximum of 1,000 values. `appIds` must have exactly one id; querying more than one app at a time is not supported at the moment.

### Query

The metrics can be queried with a POST request to `/query`.

#### The body

| Field | Required | What it is |
| --- | --- | --- |
| `appIds` | yes | A list of app IDs to measure. |
| `startTime` | no | Start of the time window (ms). Defaults to an hour before end time. |
| `endTime` | no | End of the time window (ms). Defaults to current timestamp. |
| `type` | yes | The type of query: `timeseries`, `summary`, or `breakdown`. |
| `metric` | yes | Which metric to query, such as `methods.total`. |
| `aggregation` | no | Which aggregation. Leave it out to use the metric's default aggregation. |
| `filters` | no | List of filters to apply. |
| `dimensions` | only required for breakdown queries | List of tags to group results with |
| `limit` | no | `breakdown` only. How many results to return (1 to 1000). Default: 100. |
| `order` | no | `breakdown` only. `desc` or `asc`. Default: `desc`. |
| `extraMetrics` | no | `breakdown` only. Additional metric IDs to return for each result. Must be from the same collection as the main metric |

There are 3 types of queries:

- **timeseries** provides a list of timestamps and values
- **summary** provides a single aggregated value for the whole time range (or per group when using dimensions)
- **breakdown** provides a list of groups for a metric ordered by the aggregated value of a metric

The response has an array for each field. The first index of each array is the data for the first result, the second index for the second result, etc.

```json
{
  "timestamps": [1758600000000, 1758600060000, 1758600120000],
  "metrics": { "methods.total": [42.5, 38.1, 51.9] },
  "tags": { "tag:host": ["web-1", "web-1", "web-1"] }
}
```

- `metrics` has the value for each metric queried.
- `tags` has the value of each tag for each metric value/timestamp.
- `timestamps` is only provided for timeseries queries, and are in milliseconds.

The results will be aggregated into values for every minute, 30 minutes, or 3 hours, depending on the range between startTime and endTime in the query.

Timeseries have a limit of 200 values for each dimensions. If there are more values, the less common ones will be grouped into an "Other" dimension.


#### Example 1: how fast were the methods over the last hour?

```bash
curl https://api.montiapm.com/v1/query \
  -H "Authorization: Bearer $MONTI_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "appIds": ["YOUR_APP_ID"],
    "type": "timeseries",
    "metric": "methods.total"
  }'
```

#### Example 2: what are the 5 slowest methods?

```json
{
  "appIds": ["YOUR_APP_ID"],
  "type": "breakdown",
  "metric": "methods.total",
  "dimensions": ["tag:name"],
  "limit": 5,
  "extraMetrics": ["methods.count"]
}
```

The response might look like:

```json
{
  "metrics": {
    "methods.total": [812.4, 530.2, 301.7, 250.0, 199.3],
    "methods.count": [12, 340, 55, 8, 1020]
  },
  "tags": {
    "tag:name": ["generateReport", "search", "saveSettings", "exportCsv", "addTodo"]
  }
}
```

Reading down the columns: the method `generateReport` took 812 ms on average and was called an average of 12 times per minute and is the slowest. The second method, `search`, took 530ms and was called 340 times per minute, so optimizing it might have even more benefit.

#### Filtering

A filter is in the shape of:

```json
{ "tagId": "tag:host", "operator": "is", "values": ["web-1", "web-2"] }
```

There are three operators available:

| Operator | Meaning |
| --- | --- |
| `is` | Keep data where the tag is one of the values. |
| `isNot` | Remove data where the tag is one of the values. |
| `matchesRegex` | Keep data when tag value matches a pattern, such as `"^user\\."`. |

You can use more than one filter. Data has to be matched by all filters to be kept.

Not every filter works with every metric. Check `GET /metrics` to see which ones you can use.

### List Traces

To get a list of traces, send a POST request to `/traces` with a body like:

```json
{
  "type": "method",
  "appIds": ["YOUR_APP_ID"],
  "filters": [{ "tagId": "tag:name", "operator": "is", "values": ["generateReport"] }],
  "sortBy": "total",
  "order": "desc",
  "limit": 10
}
```

All of the options are:

| Field | Required | Description |
| --- | --- | --- |
| `type` | yes | `method`, `pub`, `http`, `job`, or `error`. |
| `appIds` | yes | Currently, only one app id can be provided. |
| `startTime` | no | Start of the time window (ms). Defaults to an hour before end time |
| `endTime` | no | End of the time window (ms). Defaults to current timestamp |
| `filters` | yes | Same kind of filters as metrics. Traces can filter by `tag:name` and `tag:host`. Error traces can also use `tag:type`. |
| `sortBy` | no | Field to sort by, default to `startTime`. |
| `order` | no | `desc` or `asc`. Default: `desc`. |
| `limit` | no | How many traces (1 to 1000). Default: 20. |
| `skip` | no | Use for pagination. Default: 0. |

There are 5 types of traces:

- `method`
- `pub`
- `http`
- `job` Also used for custom traces
- `error`

`error` traces can only be sorted by `startTime`. Other types can also be sorted by `total`, `wait`, `db`, `compute`, `http`, `email`, `async`, or `fs`.

The response returns a `hasMore` property, `true` if there are more pages of traces.

```json
{
  "traces": [
    {
      "id": "eee2a942-24e3-4003-8c67-67ee5b810f7f",
      "name": "generateReport",
      "host": "web-1",
      "startTime": 1758598765000,
      "errored": false,
      "metrics": {"total": 2410, "db": 1900, "compute": 300, "wait": 210}
    }
  ],
  "hasMore": false
}
```

### Single Trace

Send a GET request to `/trace` with the appId, type, and id query params:

```
https://api.montiapm.com/v1/trace?appId=YOUR_APP_ID&type=method&id=eee2a942-24e3-4003-8c67-67ee5b810f7f
```

The response will look like:

```json
{
  "id": "abc123",
  "type": "method",
  "name": "generateReport",
  "host": "web-1",
  "startTime": 1758598765000,
  "errored": false,
  "metrics": { "total": 2410, "db": 1900, "compute": 300, "wait": 210 },
  "events": [
    ["start", 0],
    ["db", 1900, {"coll": "reports"}],
    ["compute", 300],
    ["wait", 210],
    ["complete", 0]
  ]
}
```

The events array contains an array for each event, in the format `[type, duration, data, details]`. Some details have a `nested` property with an array of child events.

## Examples

#### 10 most common errors in the last hour:

```json
{
  "appIds": ["YOUR_APP_ID"],
  "type": "breakdown",
  "metric": "errors.count",
  "dimensions": ["tag:name"],
  "limit": 10,
  "extraMetrics": ["errors.lastSeen"]
}
```

#### List traces for a specific error

```json
{
  "type": "error",
  "appIds": ["YOUR_APP_ID"],
  "filters": [
    { "tagId": "tag:name", "operator": "is", "values": ["Cannot read properties of undefined"]},
    { "tagId": "tag:type", "operator": "is", "values": ["method"]}
  ]
}
```

#### Get the 95th percentile Method response time:

```json
{
  "appIds": ["YOUR_APP_ID"],
  "type": "summary",
  "metric": "methods.resTimeHistogram",
  "aggregation": "p95"
}
```

Response:

```json
{
  "metrics": {"methods.resTimeHistogram": [250]},
  "tags": {}
}
```

#### Total method calls


```json
{
  "appIds": ["YOUR_APP_ID"],
  "type": "summary",
  "metric": "methods.count",
  "aggregation": "sum"
}
```

#### Method calls per minute

```json
{
  "appIds": ["YOUR_APP_ID"],
  "type": "summary",
  "metric": "methods.count",
  "aggregation": "rate"
}
```

#### Average method response time per host

```json
{
  "appIds": ["YOUR_APP_ID"],
  "type": "timeseries",
  "metric": "methods.total",
  "dimensions": ["tag:host"]
}
```

The response would look similar to:

```json
{
  "timestamps": [1758600000000, 1758600060000, 1758600000000, 1758600060000],
  "metrics": {"methods.total": [42.5, 38.1, 61.2, 55.7]},
  "tags": {"tag:host": ["web-1", "web-1", "web-2", "web-2"]}
}
```

#### List 10 most common errors with when they were last seen

```json
{
  "appIds": ["YOUR_APP_ID"],
  "type": "breakdown",
  "metric": "errors.count",
  "dimensions": ["tag:type", "tag:name"],
  "filters": [{"tagId": "tag:status", "operator": "isNot", "values": ["ignored"]}],
  "extraMetrics": ["errors.lastSeen"],
  "limit": 10
}
```

#### Error response

```json
{
  "error": "400",
  "message": "endTime must be greater than startTime"
}
```
