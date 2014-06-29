var ErrorHandler = {
  $el: {
    error: $("#error"),
    weather: $("#weather-inner"),
    city: $("#city")
  },

  show: function(message) {
    Loader.hide();
    ErrorHandler.$el.error.html(message);
    ErrorHandler.$el.error.show();
    ErrorHandler.$el.weather.hide();
    ErrorHandler.$el.city.hide();
  },

  hide: function() {
    ErrorHandler.$el.error.hide();
    ErrorHandler.$el.weather.show(); 
  },

  offline: function() {
    ErrorHandler.show($("#offlineError").html());
  },

  noLocation: function () {
    _gaq.push(['_trackEvent', 'nolocation', "missing geolocation"]);
    ErrorHandler.show($("#locationError").html());

    $("#set-location").submit(function() {
      var address = $('#error form input').val();

      if (!_.isEmpty(address)) {
        // Geocode address
        Location.gecodeAddress(address).then(function(data) {
          var options = {};
          options.location = data.location;
          options.address = data.address;
          Storage.clearWeather().then(function() {
            Storage.setOptions(options).then(main);
          });
        }, function() {
          // FIXME: Add waring about not finding address.
        });
      } else {
        // FIXME: Add validation to address
      }
      return false;
    });
  }
};
