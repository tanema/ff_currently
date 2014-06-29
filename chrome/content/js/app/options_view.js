var OptionsView = {
  panel: {
    system: {
      unitType: $("input[name=unitType]"),
      clock: $("input[name=clock]"),
      lang : $("select[name=lang]"),
      address: $("input[name=address]")
    },
    layout: {
      ananimation: $("input[name=animation]")
    },
    style: {
      textColor: $("input[name=textColor]"),
      color: $("#color-pick input[type=hidden]")
    }
  },

  set: function(options) {
    _.each(OptionsView.panel, function(elements, panel) {
      _.each(elements, function($el, type) {
        if ($el.is(":radio")){
          $el.filter("[value=" + options[type] + "]").attr("checked", true);
        } else {
          $el.val(options[type]);
        }
      });
    });
  }
};

