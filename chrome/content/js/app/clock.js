var Clock = {
  $el : {
    digital : {
      time : $('#time'),
      date : $('#date')
    },
    analog: {
      second : $('#secondhand'),
      minute : $('#minutehand'),
      hour : $('#hourhand')
    }
  },

  weekdays : ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
  months : ["January","February","March","April","May","June","July","August","September","October","November","December"],

  timeParts: function(options) {
    var date = new Date(),
        hour = date.getHours();

    if (options.clock === 12) {
      if(hour > 12) {
          hour = hour - 12;
      } else if(hour === 0) {
        hour = 12;
      }
    }
    return {
      // Digital
      day: Clock.weekdays[date.getDay()],
      date: date.getDate(),
      month: Clock.months[date.getMonth()],
      hour: Clock.appendZero(hour),
      minute: Clock.appendZero(date.getMinutes()),
      second: Clock.appendZero(date.getSeconds()),

      // Analog
      secondAngle: date.getSeconds() * 6,
      minuteAngle: date.getMinutes() * 6,
      hourAngle: ((date.getHours() % 12) + date.getMinutes()/60) * 30
    };
  },

  appendZero : function(num) {
    if(num < 10) {
      return "0" + num;
    }
    return num;
  },

  dateTemplate: function(parts){
    return parts.day + ", " + parts.month + " " + parts.date;
  },

  transformTemplate: function(angle){
    return "rotate(" + angle + ",50,50)";
  },

  refresh: function(options) {
    var parts = Clock.timeParts(options);
    var oldParts = Clock._parts || {};

    Clock.$el.digital.date.html(Clock.dateTemplate(parts));

    _.each(['hour', 'minute', 'second'], function(unit){
      if( parts[unit] !== oldParts[unit] ){
        Clock.$el.digital.time.find('.' + unit).text(parts[unit]);
        Clock.$el.analog[unit].attr("transform", Clock.transformTemplate(parts[unit + 'Angle']));
      }
    });

    Clock._parts = parts;
  },

  start: function(options) {
    if (Clock._running) {
      clearInterval(Clock._running);
    }

    function tick() {
      var delayTime = 500;

      Clock.refresh(options);

      Clock._running = setTimeout(function(){
        window.requestAnimationFrame( tick );
      }, delayTime);
    }

    tick();
  }
};
