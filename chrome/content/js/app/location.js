var Location = {
  getDisplayName: function(location) {
    return Q.when($.ajax({
      url : "https://maps.googleapis.com/maps/api/geocode/json",
      data: {"latlng": location.lat +","+ location.lng, sensor:false},
      dataType: "json"
    }))
    .then(function(data) {
      if (data.status === "OK") {
        var result=data.results[0].address_components;
        var info=[];
        for(var i=0;i<result.length;++i) {
            if(result[i].types[0]=="country"){
              info.push(result[i].long_name);
            }
            
            if(result[i].types[0]=="administrative_area_level_1"){
              info.push(result[i].short_name);
            }

            if(result[i].types[0]=="locality"){
              info.unshift(result[i].long_name);
            }

        }
        var locData = _.uniq(info);
        if (locData.length === 3) {
          locData.pop(2);
        }
        return locData.join(", ");
      } else {
        throw new Error("Failed to geocode");
      }
    });
  },

  gecodeAddress: function(address) {
    return Q.when(
      $.ajax({
        url : "https://maps.googleapis.com/maps/api/geocode/json",
        data: {"address": address, sensor: false},
        dataType: "json"
      })
    ).then(function(data) {
      if (data.status == "OK") {
        return {
          'location' : data.results[0].geometry.location,
          'address' : data.results[0].formatted_address
        };
      }
    });
  },

  current: function() {
    var deferred = Q.defer();
    var geolocation = Components.classes["@mozilla.org/geolocation;1"].getService(Components.interfaces.nsISupports);
    geolocation.getCurrentPosition(
      function(position) {
        deferred.resolve({lat: position.coords.latitude, lng: position.coords.longitude});
        // deferred.resolve({lat: -222, lng: 2})
      }, function() {
        deferred.reject(new Error("Couldn't find location"));
      }
    );
    return deferred.promise;
  }

};
