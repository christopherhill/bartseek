var BART_SERVICE_STATION_URL = "http://localhost:4567/bart/stations";
var BART_SERVICE_REAL_TIME_URL = "http://localhost:4567/bart/realtime";

var App = angular.module('App', ['ngRoute', 'geolocation']);

App.config(function($httpProvider) {
    // Enable cross domain calls
    $httpProvider.defaults.useXDomain = true;
    // Remove the header used to identify ajax call that would prevent CORS from working
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
});

App.factory('bartEvents', function($http) {
  return {
    get: function(station, callback) {
      $http({
        url: BART_SERVICE_REAL_TIME_URL,
        params: {station: station},
        method: "GET"
      }).success(callback);
    }
  }
});

App.factory('bartStations', function($http) {
  return {
    get: function(callback) {
      $http({
        url: BART_SERVICE_STATION_URL,
        method: "GET"
      }).success(callback);
    }
  }
});

App.controller('bartSchedule', ['$scope', '$http', 'bartStations', 'bartEvents', 'geolocation', function($scope, $http, bartStations, bartEvents, geolocation) {

  $scope.getPosition = geolocation.getLocation().then(function(data){
    $scope.position = { latitude : data.coords.latitude, longitude : data.coords.longitude};
  });

  $scope.getNearestBart = function() {
    var smallestDistance = 0, smallestDistanceIndex = 0;
    for (var i = 0; i < $scope.stations.length; i++) {
      // update the distance stored
      distance = getDistance($scope.stations[i].gtfs_latitude,
                             $scope.stations[i].gtfs_longitude,
                             $scope.position.latitude,
                             $scope.position.longitude)
      $scope.stations[i].distance = distance; // add new val to array
      if (smallestDistance === 0) {
        smallestDistance = distance;
      } else {
        if (distance < smallestDistance) {
         smallestDistance = distance;
         smallestDistanceIndex = i;
       }
      }
      
    }
    $scope.nearestBart = $scope.stations[smallestDistanceIndex];
  };

  $scope.updateStation = function() {
    if ($scope.position.latitude != "" && $scope.position.longitude != "") {
      bartStations.get(function(result) {
        $scope.stations = result.root.stations.station;
        $scope.getNearestBart();
      });
    }
  };

  $scope.$watch('position', function(newValue, oldValue) {
    $scope.updateStation();
  });

  $scope.$watch('nearestBart', function(newValue, oldValue) {
    bartEvents.get($scope.nearestBart.abbr, function(result) {
      $scope.nearbyEvents = result.root.station.etd;
    });
  });

}]);

if (typeof(Number.prototype.toRad) === "undefined") {
  Number.prototype.toRad = function() {
    return this * Math.PI / 180;
  }
}

// borrowed from http://www.movable-type.co.uk/scripts/latlong.html
function getDistance(lat1, lon1, lat2, lon2) {
  
  for (var i = 0; i < arguments.length; i++) {
    if (typeof(arguments[i] != 'Number')) {
      arguments[i] = parseFloat(arguments[i]);
    }
  }

  var R = 6371; // earth's radius in km
  var dLat = (lat2-lat1).toRad();
  var dLon = (lon2-lon1).toRad();
  var lat1 = (lat1).toRad();
  var lat2 = (lat2).toRad();
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c;
  return d;
}

angular.element(document).ready(function() {
  angular.bootstrap(document, ['App']);
});
