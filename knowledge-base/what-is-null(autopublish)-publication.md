---
layout: docs.njk
title: What is null(autopublish) publication?
---

Have you wondered about the publication which shows as `null(autopublish)` in Monti APM?

This has no relationship with the [autopublish](https://atmospherejs.com/meteor/autopublish) package. This is about null unnamed publications. If you create a publication with the name as null,
  it will be automatically published to clients whenever a session is created. See the following example:

```js
Meteor.publish(null, function() {
  return Posts.find({});
});
```

Meteor uses this kind of publication to send user data to the client. That's how you are able to access user information with `Meteor.user()`. 

That's what Monti APM shows as the `null(autopublish)` publication.

_This content originally appeared in the Kadira Knowledge Base._
