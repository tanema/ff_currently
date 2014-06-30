$(function(){
  $('#newTabView').load(function(){
    var button = $("#newTabView").contents().find("#newtab-toggle")
    if(!button.attr('page-disabled')) {
      button.click()
    }
    button.css('top', 'unset');
    button.css('right','10px');
    button.css('bottom','18px');
    button.css('background-size','500px 46px');
    button.css('background-position','-468px 0px');
    button.css('width','32px');
    button.css('height','32px');

    $("#weather").css('z-index', 998);
    button.on('click', function(){
      $("#weather").css('z-index', button.attr('page-disabled') ? 998 : 1);
    })
  });
});

var settings = $('.settings');

// Analytics
//_gaq.push(['_trackEvent', 'currently', 'version', chrome.runtime.getManifest().version]);

$('#gift').click(function() {
  //_gaq.push(['_trackEvent', 'button', 'click', 'donation']);
});

$('#share').click(function() {
  //_gaq.push(['_trackEvent', 'button', 'click', 'share']);
});

$('.vitaly').click(function() {
  //_gaq.push(['_trackEvent', 'button', 'click', 'twitter-vitaly']);
});

$('.henry').click(function() {
  //_gaq.push(['_trackEvent', 'button', 'click', 'twitter-henry']);
});

$('#support').click(function() {
  //_gaq.push(['_trackEvent', 'button', 'click', 'twitter-henry']);
});

setTimeout(function() {
  settings.first().fadeIn(0); // Unhide first settings panel.
}, 100);

$(".options").click(function() {
  //_gaq.push(['_trackEvent', 'button', 'click', 'options']);
  Storage.getOptions().done(function(options) {

    OptionsView.set(options);

    switchPreviewBgColor($("#options #color-pick input").val());
    switchPreviewTextColor($("input[name=textColor]:checked").val());
    
    Avgrund.show( "#options" );
    $('#options #list li:not(#options .active)').each(function(index){
      $(this).css("-webkit-animation-delay",80 * index +"ms").addClass('animated fadeInLeft');
    });
  });
  
  return false;
});

function showOptions() {
  if (window.location.hash === "#options") {
    $(".options").trigger('click');
  }
}

$(window).bind('hashchange', showOptions);
showOptions();

$('#options #list li').click(function(){
  var $el = $(this);

  // Update List
  $('#options #list li.active').removeClass('active');
  $el.addClass('active');

  //_gaq.push(['_trackEvent', 'tab', 'change', $el.text()]);

  // Load New Content
  $('.settings.show').fadeOut(0).removeClass('show');
  var idx = $(this).index();
  $(settings[idx]).fadeIn(100).addClass('show');
});

function switchPreviewBgColor(bgclass) {
  var $li = $("#options #color-pick li");
  var $preview = $("#preview");
  
  $li.removeClass("active");
  $li.filter("." + bgclass).addClass("active");

  $preview[0].className = $preview[0].className.replace(/\w*-bg/g, '');
  $preview.addClass(bgclass);
}

function switchPreviewTextColor(textclass) {
  var $preview = $("#preview");
  
  $preview[0].className = $preview[0].className.replace(/\w*-text/g, '');
  $preview.addClass(textclass);
}

$("#options #color-pick li").click(function(){
  var $li = $(this);

  var className = $li[0].className.match(/\w*-bg/g)[0];
  $("#options #color-pick input").val(className);
  switchPreviewBgColor(className);

});

$("input[name=textColor]").change(function() {
  var $input = $(this);
  switchPreviewTextColor($input.val());
});

$("#options #close").click(function() {
  Avgrund.hide( "#options" );
});

function save(options) {
  Storage.clearWeather().then(function() {
    Storage.setOptions(options).then(function() {
      main();
    });
    
    // Save options
    $("#options button[type=submit]").addClass("saved");

    setTimeout(function(){
      $('#options button').removeClass('saved').html('SAVE');
    },700);
  });
}

$("#options form").submit(function() {
  var $form = $(this);
  var options = {};
  _.each($form.serializeArray(), function(inputs) {
    options[inputs.name] = inputs.value;
  });

  if (options.address) {
    // Geocode address
    Location.gecodeAddress(options.address).then(function(data) {
      options.location = data.location;
      options.address = data.address;
      save(options);
    });
  } else {
    options.location = undefined;
      options.address = undefined;
    save(options);
  }
  return false;
});

