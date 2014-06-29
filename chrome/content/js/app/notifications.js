var Notifications = {

  urls: {
    gold: "https://s3.amazonaws.com/currently-notifications/notifications.json",
    beta: "https://s3.amazonaws.com/currently-notifications/notifications.beta.json"
  },

  current: function(location) {
    // Get notification json
    return Notifications.request()
      .then(Notifications.parse)
      .then(function(data) {
        return Notifications.filter(data, location);
      });
  },

  isActive: function(message) {
    return message.active;
  },

  isInTimeFrame: function(message) {
    var now = new Date();
    if (!message.dates) {
      return true;
    } else if (message.dates.start && !message.dates.end) {
      if (message.dates.start <= now) {
        return true;
      }
    } else if (message.dates.start && message.dates.end) {
      return (message.dates.start <= now && message.dates.end >= now);
    } else {
      return false;
    }
    return true;
  },

  isInLocation: function(message, location) {
    if (message.geo) {
      if (message.geo.type === "distance") {

        var pass = geolib.isPointInCircle(
          {latitude: location.lat, longitude: location.lng},
          message.geo.from,
          (message.geo.distance * 1609.344)
        );

        return pass;
      }
    } else {
      return true;
    }

    return false;
  },

  isNew: function(message) {
    return Storage.seenNotifications().then(function(seen) {
      return !_.contains(seen, message.id);
    });
  },

  filter: function(messages, location) {
    var checks = [];
    _.each(messages, function(message) {
      var check = Q.all([
        Notifications.isActive(message),
        Notifications.isNew(message),
        Notifications.isInTimeFrame(message),
        Notifications.isInLocation(message, location)
      ]).spread(function(active, isnew, time, location) {
        if (active && isnew && time && location) {
          return message;
        }
      });

      checks.push(check);
    });

    return Q.allResolved(checks)
      .then(function(promises) {
        var results = [];
        _.each(promises, function(promise) {
          if (promise.isFulfilled()) {
            var message = promise.valueOf();
            if (!_.isUndefined(message)) {
              results.push(message);
            }          
          }
        });
        return results;
      });
  },

  parse: function(messages) {
    _.each(messages, function(message) {
      if (message.dates) {
        message.dates.start= new Date(message.dates.start);

        if (message.dates.end) {
          message.dates.end = new Date(message.dates.end);
        }        
      }
    });
    return messages;
  },

  getCached: function() {
    return Storage.getNotifications();
  },

  cache: function(data) {
    return Storage.cacheNotifications(data);
  },

  url: function() {
    if (inBeta()) {
      return Notifications.urls.beta;
    } else {
      return Notifications.urls.gold;
    }
  },

  request: function() {
    return Notifications.getCached().then(function(data) {
      return data;
    }, function() {
      return Q.when($.ajax({
        url: Notifications.url(),
        dataType: "json"
      })).then(Notifications.cache);
    });
  },

  finish: function(id) {
    return Storage.markNotification(id);
  }
};
