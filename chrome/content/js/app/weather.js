var Weather = {

  $el: {
    now : $('.now'),
    forecast : $('#weather li'),
    city : $('#city')
  },

  urlBuilder: function(type, location, lang) {
    var url = "http://api.wunderground.com/api/dc203fba39f6674e/" + type + "/";

    if (lang) {
      url = url + "lang:" + lang + "/";
    }

    return url + "q/" + location.lat + "," + location.lng + ".json";
  },

  atLocation: function (location) {
    return Storage.getOption("lang").then(function(lang) {
      return Q.when($.ajax({
        url: Weather.urlBuilder("conditions/forecast/", location, lang),
        type: 'GET',
        dataType: "json"
      }))
      .then(function(data) {
        return Location.getDisplayName(location).then(function(name) {
          data.locationDisplayName = name;
          return data;
        });
      })
      .then(Weather.parse)
      .then(Storage.cacheWeather);
    });
  },

  parse: function(data) {
    return Storage.getOption("unitType").then(function(unitType) {
      var startUnitType = "f";

      // Lets only keep what we need.
      var w2 = {
        city: data.locationDisplayName,
        weatherUrl: data.current_observation.forecast_url,
        current: {
          condition: data.current_observation.weather,
          conditionCode: Weather.condition(data.current_observation.icon_url),
          temp: Weather.tempConvert(data.current_observation.temp_f, startUnitType, unitType)
        },
        forecast: []
      };

      for (var i = Weather.$el.forecast.length - 1; i >= 0; i--) {
        var df = data.forecast.simpleforecast.forecastday[i];
        w2.forecast[i] = {
          day: df.date.weekday,
          condition: df.conditions,
          conditionCode: Weather.condition(df.icon_url),
          high: Weather.tempConvert(df.high.fahrenheit, startUnitType, unitType),
          low: Weather.tempConvert(df.low.fahrenheit, startUnitType, unitType)
        };
      }
      return w2;
    });
  },

  condition: function (url){
    var matcher = /\/(\w+).gif$/;
    var code = matcher.exec(url);
    if (code) {
      code = code[1];
    } else {
      // We can't find the code
      code = null;
    }
    switch(code) {

      case "chanceflurries":
      case "chancesnow":
        return "p";

      case "/ig/images/weather/flurries.gif":
        return "]";

      case "chancesleet":
        return "4";

      case "chancerain":
        return "7";

      case "chancetstorms":
        return "x";

      case "tstorms":
      case "nt_tstorms":
        return "z";

      case "clear":
      case "sunny":
        return "v";

      case "cloudy":
        return "`";

      case "flurries":
      case "nt_flurries":
        return "]";

      case "fog":
      case "hazy":
      case "nt_fog":
      case "nt_hazy":
        return "g";

      case "mostlycloudy":
      case "partlysunny":
      case "partlycloudy":
      case "mostlysunny":
        return "1";

      case "sleet":
      case "nt_sleet":
        return "3";

      case "rain":
      case "nt_rain":
        return "6";

      case "snow":
      case "nt_snow":
        return "o";

      // Night Specific

      case "nt_chanceflurries":
        return "a";

      case "nt_chancerain":
        return "8";

      case "nt_chancesleet":
        return "5";

      case "nt_chancesnow":
        return "[";

      case "nt_chancetstorms":
        return "c";

      case "nt_clear":
      case "nt_sunny":
        return "/";

      case "nt_cloudy":
        return "2";

      case "nt_mostlycloudy":
      case "nt_partlysunny":
      case "nt_partlycloudy":
      case "nt_mostlysunny":
        return "2";


      default:
        console.log("MISSING", code);
        //_gaq.push(['_trackEvent', 'unknowweather', code]);
        return "T";
    }
  },

  render: function(wd) {
    // Set Current Information
    Weather.renderDay(Weather.$el.now, wd.current);
    Weather.$el.city.html(wd.city).show();

    // Show Weather & Hide Loader
    $('#weather-inner').removeClass('hidden').show();

    // Show Forecast
    Storage.getOption('animation').done(function(animation) {
      Weather.$el.forecast.each(function(i, el) {
        var $el = $(el);
          if (animation) {
            $el.css("-webkit-animation-delay",150 * i +"ms").addClass('animated fadeInUp');
          }
        var dayWeather = wd.forecast[i];
        Weather.renderDay($el, dayWeather);
      });
    });

    // Change link to weather underground
    $('a.wunder').attr('href', Weather.link(wd)).click(function() {
      //_gaq.push(['_trackEvent', 'button', 'click', 'weather-underground']);
    });
  },

  link: function(data) {
    return data.weatherUrl + "?apiref=846edca2fe64735c";
  },

  renderDay: function(el, data) {
    el.attr("title", data.condition);
    el.find('.weather').html(data.conditionCode);
    if (!_.isUndefined(data.high) && !_.isUndefined(data.low)) {
      el.find('.high').html(data.high);
      el.find('.low').html(data.low);
    } else {
      el.find('.temp').html(data.temp);
    }
    if(data.day) {
      el.find('.day').html(data.day);
    }
  },

  tempConvert: function(temp, startType, endType) {
    temp = Math.round(parseFloat(temp));
    if (startType === "f") {
      if (endType === 'c') {
        return Math.round((5/9)*(temp-32));
      } else {
        return temp;
      }
    } else {
      if (endType === 'c') {
        return temp;
      } else {
        return Math.round((9/5) * temp + 32);
      }
    }
  },

  load: function() {
    Loader.show();
    return Storage.getCachedWeather()
      .fail(function() {
        // No Cache
        return Storage.getOption("location")
          .then(function(location) {
            if (!_.isEmpty(location)) {
              return location;
            } else {
              var l = Location.current();
              l.fail(ErrorHandler.noLocation);

              return l;
            }
          })
          .then(Weather.atLocation);
      }); 
  }
};
