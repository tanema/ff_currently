function style() {
  Storage.getOptions().done(function(options) {
    // Kick off the clock
    Clock.start(options);
    var $main = $('#main');

    // background Color
    if (!$main.hasClass(options.color)) {
      if ($main.is("[class*='-bg']")) {
        $main[0].className = $main[0].className.replace(/\w*-bg/g, '');
      }
      $main.addClass(options.color);
    }

    // Text Color
    if (!$main.hasClass(options.textColor)) {
      if ($main.is("[class*='-text']")) {
        $main[0].className = $main[0].className.replace(/\w*-text/g, '');
      }
      $main.addClass(options.textColor);
    }

    // Remove animation
    if (!options.animation) {
      $(".animated").removeClass('animated');
      $(".fadeIn").removeClass('fadeIn');
      $(".fadeInDown").removeClass('fadeInDown');
    }

    if (!options.seconds) {
      $('#main').addClass('no-seconds');
    }

  });
}

function main() {
  style();

  var loader = Weather.load().then(function(data) {
    Loader.hide(0);
    Weather.render(data);
  });

  loader.fail(function(reason) {
    if (!navigator.onLine) {
      // We are offline
      ErrorHandler.offline();
    } else {
      // Unknown error
      console.error(reason);
      //_gaq.push(['_trackEvent', 'error', reason.message]);
    }
  });

  loader.then(function() {
    $('.tipsy').tipsy({fade: true, delayIn:500, gravity: 's'});
    $('#weather-inner li').tipsy({fade: true, delayIn:500, offset:5, gravity: 's'});
    $('#weather-inner .now').tipsy({fade: true, delayIn:500, offset:-20, gravity: 's'});  
  });

  // Notifications
  Location.current().then(Notifications.current).then(function(messages) {
    if (!_.isEmpty(messages)) {
      //_gaq.push(['_trackEvent', 'notifications', "show", messages[0].id.toString(), 1]);
      $("#update p").html(messages[0].html).parent().data('id', messages[0].id).show(0);
    }
  });

  $('#update').click(function(){
    $(this).fadeOut(100);
    Notifications.finish($(this).data('id'));
  });
}

window.addEventListener('load', function() {
  // Start your engine....
  main();
})

if (navigator.onLine) {
  loadGA();
} else {
  $(window).bind('online', function() {
    setTimeout(function() {
      // wait one second before trying.
      ErrorHandler.hide();
      main();
    }, 1000);
  });
}
