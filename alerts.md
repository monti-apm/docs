---
layout: docs
title: Alerts
---

Table of Contents:

- [Creating Alerts](#creating-alerts)
- [Alert Suggestions](#alert-suggestions)
- [Slack Notifications](#slack-notifications)
- [Webhooks](#webhooks)

Alerts monitor a specific metric and notify you when the metric meets conditions you set. They are useful for becoming aware of issues early without having to check Monti APM or be notified by a user about a problem.

## Creating Alerts

![Alert Button](/images/alerts-location-2x.png)

1. Open the  alerts window from the header when viewing an app. If you do not have any alerts, it will show the create screen. Otherwise, click the `Create new` button

![Create Alert Form](/images/create-alert-3x.png)

2. Fill out the alert form. The form is layed out so you are creating a sentence that explains how the alert works. For example: When method response time is greater than 500ms on any host, then send an email
    - When - the metric to watch 
    - Is - the condition the metric should meet to notify you
    - For - how long the condition should be met (in minutes)
    - On - if the condition should be met on any or all hosts before notifying you

3. Add any emails or [webhooks](#webhooks) that should be notified

## Alert Suggestions

These are good starting points for most apps.

- New Errors
- CPU usage is over 80% for one minute
- High memory usage
- Method response time is over 500ms for 2 minutes
- Mongo Pool Checkout max delay is more than 50ms
- Host count is low. If a number of your servers are not responding for several minutes, there is a higher risk of the remaining servers going down

A good practice is after you encounter an issue in production, create an alert that would notify you if it happens again.

However, if you receive too many unimportant alert notifications, you will likely stop paying attention to them and miss an important issue. This is called alert fatigue. If you notice this happening, modify the conditions or duration you are only notified when there is an issue you have to act on.

Is there an alert you've found to be useful? <a href="mailto:hello@montiapm.com">Let us know.</a>

## Slack Notifications

Monti APM is able to send messages to your slack workspace using webhooks.

1. Add the [Incoming WebHooks](https://slack.com/apps/A0F7XDUAZ-incoming-webhooks) app to your workspace

![Incoming WebHooks App](/images/slack-webhooks-app.png)

2. Choose a channel for the messages to appear in and click `Add`

![Configure Incoming WebHooks](/images/slack-webhooks-configure.png)

3. Copy the webhook URL and add it to the alert in Monti APM

![Add URL To Alert](/images/add-webhook.png)

To make sure everything works, click the `Fire a Test Alert` button. You should see a new message in slack.

## Webhooks

Webhooks allow Monti APM to notify you when an alert triggers or clears. You can create your own integration or use  it  to integrate into other services  For example, you can  send an SMS message with [Zapier](https://zapier.com/apps/sms/integrations/webhook/1677/send-a-webhook-to-a-phone-via-sms).

When an alert is armed, Monti APM sends a POST request to the webhook URL with the content-type `application/json`. The webhook body is in this format:

```js
{
  "name": "Alert name",
  "appId": "app id",
  "enabled": true,
  "appName": "App name",
  "created": "2018-09-16T13:30:40.978Z", // Date alert was created
  "createdBy": "user id", // Id of user who created the alert
  "status": "triggered",
  "result": { // Object with the values used to check if the alert triggered. Format depends on alert type and settings.
    "success": true,
    "data": {
      "server-host-name": {
        "success": true,
        "data": {
          "success": true,
          "data": {
            "value": 56.5,
            "timestamp": 1578970626742
          }
        }
      }
    }
  },
  "triggered": 1578974166802 // Timestamp of when alert triggered
}
```

When the alert is cleared, the webhook body will look like:

```js
{
  "name": "Alert name",
  "appId": "app id",
  "enabled": true,
  "appName": "App name",
  "created": "2018-09-16T13:330:40.978Z",
  "createdBy": "user id", // Id of user who created the alert
  "status": "cleared",
  "triggered": 1596475369935 // Timestamp of when alert triggered
}
```

To test the webhook, click the `Fire a Test Alert` button in the alert edit screen.
