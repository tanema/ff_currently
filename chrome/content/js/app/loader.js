var Loader = {
  loader: $('#loader'),
  show: function() {
    this.loader.siblings('div').hide();
    this.loader.show();
  },
  hide: function() {
    this.loader.hide();
  }
};

