---
layout: docs.njk
title: Jobs Dashboard
--- 

This dashboard shows the performance of jobs in your app. Jobs can be:

- cron jobs, such as with [meteor-synced-cron](https://github.com/percolatestudio/meteor-synced-cron)
- jobs from a job queue, such as with [BullMQ](https://bullmq.io)
- any custom traces you create with `Monti.traceJob`

Monti APM automatically tracks jobs in these packages:
- `percolate:synced-cron`
- `littledata:synced-cron`
- `@hokify/agenda`
- `agenda`
- `bullmq`
- `quave:synced-cron`

Are you using another open source job package? Please [create an issue](https://github.com/monti-apm/monti-apm-agent/issues) on GitHub and we'll look into automatically tracking jobs in it.

Jobs monitoring requires version 2.50 or 3.0.0-beta.11 or newer of `montiapm:agent`

## Custom Traces

You can use `Monti.traceJob` to track any function or job in your app. The traces and metrics will appear in the Jobs Dashboard.

The full documentation for custom traces is in the [agent documentation](https://github.com/monti-apm/monti-apm-agent?tab=readme-ov-file#custom-traces).

Here is an example:

```js
setInterval(() => {
  Monti.traceJob({ name: 'remove expired messages' }, async () => {
    await Messages.removeAsync({ expiresAt: { $lt: new Date() } })
  });
}, 1000 * 30);
```


## Jobs Summary

The Jobs summary shows you the summary for the selected job, or all jobs if none are selected.

The metrics are:
- **Throughput** - the number of jobs completed each minute
- **Duration** - how long it takes to complete a single job
- **Delay** - the amount of time between when the job was created or was scheduled to run and when it started being processed
- **Error Rate** - the percentage of jobs that errored

## Job Breakdown

The breakdown shows a list of the different jobs in your app. It always shows the throughput for each job. You can also choose a second metric to view with the sort option. The metrics are:

- **Throughput** - the number of jobs completed each minute
- **Pending Jobs** - the number of jobs waiting to run
- **Errored jobs** - the number of jobs that errored
- **Job Duration** - the average amount of time it takes for a job to run
- **Job Delay** - how long a job waits to run after it was scheduled
- **Impact** - how much impact it could have optimizing the job, based on throughput and duration
- **DB Time** - the average time spent on database operations in each job
- **Async Time** - the average time spent on async operations in each job
- **Compute Time** - the average time spent doing compute in each job
- **Email Time** - the average time spent sending email in each job
- **FS Time** - the average time spent on accessing the filesystem in each job
- **HTTP Time** - the average time spent making HTTP requests in each job

## Job Duration with Traces

The Job Duration chart shows the job duration, broken down by how much time was spent in different categories:

- **db** - Time spent on database activities, including read and write operations.
- **http** - Time spent waiting on HTTP requests
- **compute** - Time spent on CPU-intensive tasks inside a method (e.g. time spent sorting and calculating a value).
- **async** - Time spent on async activities, especially with NPM modules.
- **email** - Time spent sending emails.
- **fs** - Time spent accessing the file system

Additionally, if you like to inspect a trace of a job at a particular point, find that point on the chart and click it. You'll get a few sample traces that you can analyze. Or you can click `view all traces` to see a full list you can sort.

## Added and Completed Jobs

This chart shows the number of jobs added compared to the number of jobs completed.

The added metric is only tracked for job queues. Other types of jobs will not show any added jobs.

You can manually record created jobs by calling [`Monti.recordNewJob('job name')`](https://github.com/monti-apm/monti-apm-agent?tab=readme-ov-file#new-jobs). Learn more in the [agent documentation](https://github.com/monti-apm/monti-apm-agent?tab=readme-ov-file#new-jobs).

## Error Rate

This chart shows the percentage of jobs that have errored.

## Job Delay

This chart shows the amount of time from when the job was scheduled to run to when it did run.

This metric is automatically tracked for job queues. When using `Monti.traceJob`, you can pass the delay as waitTime:

```js
// waitTime is in milliseconds
Monti.traceJob({ name: 'job name', waitTime: 100}, () => {
  // code to trace
});
```

## Running Jobs

This chart shows the number of jobs currently running, at the moment the agent sent the metrics to Monti APM.

## Pending Jobs

This chart shows the number of jobs waiting to be processed. Currently, Monti APM does not track this metric by default to avoid causing performance issues.

You can manually track it by having your app occasionally call [`Monti.recordPendingJobs('job name', pendingCount)`](https://github.com/monti-apm/monti-apm-agent?tab=readme-ov-file#pending-jobs) to update the value. Learn more in the [agent documentation](https://github.com/monti-apm/monti-apm-agent?tab=readme-ov-file#pending-jobs).
