var url = "http://rainfalldesign.com",
    ios = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService),
    ssm = Components.classes["@mozilla.org/scriptsecuritymanager;1"].getService(Components.interfaces.nsIScriptSecurityManager),
    dsm = Components.classes["@mozilla.org/dom/storagemanager;1"].getService(Components.interfaces.nsIDOMStorageManager),
    uri = ios.newURI(url, "", null),
    principal = ssm.getCodebasePrincipal(uri);

var Storage = {
  _store: dsm.getLocalStorageForPrincipal(principal, ""),
  cache: {},
  notifications: {
    key : "notifications",
    location: "local",
    defaults: {}
  },

  weather: {
    key: "weather",
    location: "local",
    defaults: {}
  },

  options: {
    key: "options",
    location: "sync",
    defaults: {
      unitType: "f",
      clock: 12,
      seconds: true,
      lang: "EN",
      location: {}, // Used to store you own location.
      animation: true,
      textColor: "light-text",
      color: "dark-bg"
    }
  },

  getStore: function(type) {
    return {
      get: function(key, cb) {
        cb(JSON.parse(Storage._store.getItem(type+"-"+key)));
      },
      set: function(key, data, cb) {
        cb(Storage._store.setItem(type+"-"+key, JSON.stringify(data)));
      },
      remove: function(key, cb){
        cb(Storage._store.removeItem(type+"-"+key))
      }
    }
  },

  load: function(type, use_cache) {
    if (_.isUndefined(use_cache)) use_cache = true;

    if (use_cache && Storage.cache[type]) {
      return Storage.cache[type];
    } else if (!use_cache || !Storage.cache[type]) {
      var deferred = Q.defer();
      Storage.getStore(type).get(Storage[type].key, function(value) {
        if (!_.isEmpty(value)) {
          deferred.resolve(value);
        } else{
          deferred.reject(new Error("Missing Data"));
        }
      });
      Storage.cache[type] = deferred.promise;
    }
    return Storage.cache[type];
  },

  save: function(type, data) {
    var deferred = Q.defer();
    var key = Storage[type].key;
    function _save(current) {
      var saveData;
      if (!_.isNull(current)) {
        saveData = _.extend(current, data);
      } else {
        saveData = data;
      }

      Storage.getStore(type).set(key, saveData, function(value) {
        deferred.resolve(value);
        Storage.cache[type] = null;
      });
    }
    Storage.load(type, false).then(_save, function(){
      _save(null);
    });
    return deferred.promise;
  },

  remove: function(type) {
    var deferred = Q.defer();
    var key = Storage[type].key;
    Storage.getStore(type).remove(key, function(value){
      Storage.cache[type] = null;
      deferred.resolve(value);
    });
    return deferred.promise;
  },

  castOptions: function(key, value) {
    // Case boolean if it is a boolean
    if (value === 'true') {
      return true;
    } else if (value === 'false') {
      return false;
    } else if (!_.isNaN(parseInt(value)) && !isNaN(value)) {
      return parseInt(value);
    } else if (_.isUndefined(value)) {
      return Storage.options.defaults[key];
    } else {
      return value;
    }
  },

  getOption: function(key) {
    return Storage.load("options").then(function(data) {
      return Storage.castOptions(key, data[key]);
    }, function() {
      return Storage.options.defaults[key];
    });
  },

  getOptions: function() {
    return Storage.load("options").then(function(data) {

      var options = _.clone(Storage.options.defaults);
      _.each(data, function(value, key) {
        options[key] = Storage.castOptions(key, value);
      });

      return options;
    }, function() {
      return Storage.options.defaults;
    });
  },

  setOption: function(key, value) {
    value = Storage.castOptions(key, value);
    var obj = {};
    obj[key] = value;
    return Storage.save("options", obj);
  },

  setOptions: function(data) {
    var options = _.clone(data);
    _.each(options, function(value, key) {
      options[key] = Storage.castOptions(key, value);
    });

    return Storage.save("options", options);
  },

  getCachedWeather: function() {
    return Storage.load("weather")
      .then(function(data){
        var now = new Date();
        if (now.getTime() < (parseInt(data.cachedAt) + 60000 * 60)) { // Valid for one hour
          return data;
        }

        throw new Error("Invalid Cache");
      });
  },

  cacheWeather: function(data) {
    var date = new Date();
    data.cachedAt = date.getTime();
    return Storage.save("weather", data).then(function() {
      return data;
    });
  },

  clearWeather: function() {
    return Storage.remove("weather");
  },

  cacheNotifications: function(data) {
    var date = new Date();
    var save = {
      cachedAt : date.getTime(),
      data: data
    };
    return Storage.save("notifications", save).then(function() {
      return data;
    });
  },

  getNotifications: function() {
    return Storage.load("notifications")
      .then(function(data){
        var now = new Date();
        // if (now.getTime() < (parseInt(data.cachedAt) + 15000)) { // Valid for 15 seconds
        if (now.getTime() < (parseInt(data.cachedAt) + 60000 * 120)) { // Valid for 2 hour
          return data.data;
        }

        throw new Error("Invalid Cache");
      });
  },

  markNotification: function(id) {
    return Storage.load("notifications", false)
      .then(function(data) {
        var seen = [];
        if (data.seen) {
          seen = data.seen;
        }
        seen.push(id);
        data.seen = seen;
        //_gaq.push(['_trackEvent', 'notifications', "seen", id.toString(), 1]);
        return Storage.save("notifications", data);
      });
  },

  seenNotifications: function() {
    return Storage.load("notifications").then(function(data) {
      return data.seen;
    }, function() {
      return [];
    });
  }
};
