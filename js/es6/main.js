(function() {
  'use strict';
  $(document).ready(init);
  function init() {
    initMap(36, -86, 3);
    $('#add').click(add);
  }
  var map;
  function initMap(lat, lng, zoom) {
    var styles = [{'stylers': [{'hue': '#bbff00'}, {'weight': 0.5}, {'gamma': 0.5}]}, {
      'elementType': 'labels',
      'stylers': [{'visibility': 'off'}]
    }, {
      'featureType': 'landscape.natural',
      'stylers': [{'color': '#a4cc48'}]
    }, {
      'featureType': 'road',
      'elementType': 'geometry',
      'stylers': [{'color': '#ffffff'}, {'visibility': 'on'}, {'weight': 1}]
    }, {
      'featureType': 'administrative',
      'elementType': 'labels',
      'stylers': [{'visibility': 'on'}]
    }, {
      'featureType': 'road.highway',
      'elementType': 'labels',
      'stylers': [{'visibility': 'simplified'}, {'gamma': 1.14}, {'saturation': -18}]
    }, {
      'featureType': 'road.highway.controlled_access',
      'elementType': 'labels',
      'stylers': [{'saturation': 30}, {'gamma': 0.76}]
    }, {
      'featureType': 'road.local',
      'stylers': [{'visibility': 'simplified'}, {'weight': 0.4}, {'lightness': -8}]
    }, {
      'featureType': 'water',
      'stylers': [{'color': '#4aaecc'}]
    }, {
      'featureType': 'landscape.man_made',
      'stylers': [{'color': '#718e32'}]
    }, {
      'featureType': 'poi.business',
      'stylers': [{'saturation': 68}, {'lightness': -61}]
    }, {
      'featureType': 'administrative.locality',
      'elementType': 'labels.text.stroke',
      'stylers': [{'weight': 2.7}, {'color': '#f4f9e8'}]
    }, {
      'featureType': 'road.highway.controlled_access',
      'elementType': 'geometry.stroke',
      'stylers': [{'weight': 1.5}, {'color': '#e53013'}, {'saturation': -42}, {'lightness': 28}]
    }];
    var mapOptions = {
      center: new google.maps.LatLng(lat, lng),
      zoom: zoom,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: styles
    };
    map = new google.maps.Map(document.getElementById('map'), mapOptions);
  }
  function addMarker(lat, lng, name) {
    var icon = arguments[3] !== (void 0) ? arguments[3] : './media/Location_Icon_64x64.png';
    var latLng = new google.maps.LatLng(lat, lng);
    new google.maps.Marker({
      map: map,
      position: latLng,
      title: name,
      icon: icon
    });
  }
  function zoomTo(lat, lng) {
    var latLng = new google.maps.LatLng(lat, lng);
    map.setCenter(latLng);
    map.setZoom(15);
  }
  function add() {
    var address = $('#address').val();
    var geocoder = new google.maps.Geocoder();
    var locationData = {};
    geocoder.geocode({address: address}, checkWeatherFromMapData);
    function checkWeatherFromMapData(results, status) {
      if (status === 'OK') {
        locationData = recordLocation(results[0]);
        if (locationData.zip) {
          try {
            throw undefined;
          } catch (url) {
            url = 'http://api.wunderground.com/api/1cb29612b414031f/forecast10day/q/' + locationData.zip + '.json?callback=?';
            $.getJSON(url, getWeather);
          }
        } else {
          alert('ERROR: Weather not found');
        }
      }
    }
    function getWeather(forecast10day) {
      var forecasts = forecast10day.forecast.simpleforecast.forecastday;
      var forecastData = createChartData(forecasts);
      zoomTo(locationData.latitude, locationData.longitude);
      if ($('#forecast' + locationData.zip).length) {
        chart[$traceurRuntime.toProperty(locationData.zip)].dataProvider = forecastData;
        chart[$traceurRuntime.toProperty(locationData.zip)].validateData();
      } else {
        addMarker(locationData.latitude, locationData.longitude, locationData.zip, forecasts[0].icon_url);
        addChart(forecastData, locationData.zip);
      }
    }
    function createChartData(forecasts) {
      var chartData = [];
      forecasts.forEach(function(forecast) {
        chartData.push({
          day: forecast.date.weekday,
          high: forecast.high.fahrenheit,
          low: forecast.low.fahrenheit
        });
      });
      return chartData;
    }
  }
  function recordLocation(googleMapResultObject) {
    var title = googleMapResultObject.address_components[0].long_name;
    var lat = googleMapResultObject.geometry.location.k;
    var lng = googleMapResultObject.geometry.location.A;
    var premise = '';
    var street_number = '';
    var route = '';
    var routeShort = '';
    var neighborhood = '';
    var locality = '';
    var county = '';
    var state = '';
    var stateShort = '';
    var country = '';
    var postal_code = '';
    googleMapResultObject.address_components.forEach(function(addressObject) {
      var type = addressObject.types[0];
      switch (type) {
        case 'premise':
          premise = addressObject.long_name;
          break;
        case 'street_number':
          street_number = addressObject.long_name;
          break;
        case 'route':
          route = addressObject.long_name;
          routeShort = addressObject.short_name;
          break;
        case 'neighborhood':
          neighborhood = addressObject.long_name;
          break;
        case 'locality':
          locality = addressObject.long_name;
          break;
        case 'administrative_area_level_2':
          county = addressObject.long_name;
          break;
        case 'administrative_area_level_1':
          state = addressObject.long_name;
          stateShort = addressObject.short_name;
          break;
        case 'country':
          country = addressObject.long_name;
          break;
        case 'postal_code':
          postal_code = addressObject.long_name;
          break;
      }
    });
    return {
      title: title,
      name: premise,
      street_number: street_number,
      street: route,
      streetShort: routeShort,
      neighborhood: neighborhood,
      city: locality,
      county: county,
      state: state,
      stateShort: stateShort,
      country: country,
      zip: postal_code,
      latitude: lat,
      longitude: lng
    };
  }
  var chart = [];
  function addChart(data, zip) {
    var newForecastId = 'forecast' + zip;
    var $div = $('<div>').attr('id', newForecastId).addClass('forecast');
    $('#forecasts').append($div);
    $traceurRuntime.setProperty(chart, zip, AmCharts.makeChart(newForecastId, {
      'type': 'serial',
      'theme': 'light',
      'pathToImages': 'http://www.amcharts.com/lib/3/images/',
      'legend': {'useGraphSettings': true},
      'titles': [{
        'text': zip,
        'size': 18
      }],
      'dataProvider': data,
      'valueAxes': [{
        'id': 'v1',
        'axisAlpha': 0.2,
        'dashLength': 1,
        'position': 'left'
      }],
      'graphs': [{
        'id': 's1',
        'balloonText': 'High: <b><span style=\'font-size:14px;\'>[[value]]°F</span></b>',
        'bullet': 'round',
        'bulletBorderAlpha': 1,
        'bulletColor': '#FFFFFF',
        'hideBulletsCount': 50,
        'title': 'High',
        'valueField': 'high',
        'useLineColorForBulletBorder': true
      }, {
        'id': 's2',
        'balloonText': 'Low: <b><span style=\'font-size:14px;\'>[[value]]°F</span></b>',
        'bullet': 'square',
        'bulletBorderAlpha': 1,
        'bulletColor': '#FFFFFF',
        'hideBulletsCount': 50,
        'title': 'Low',
        'valueField': 'low',
        'useLineColorForBulletBorder': true
      }],
      'chartCursor': {'cursorPosition': 'mouse'},
      'categoryField': 'day',
      'categoryAxis': {
        'axisColor': '#DADADA',
        'dashLength': 1,
        'minorGridEnabled': true,
        'labelRotation': 30
      },
      'exportConfig': {
        menuRight: '20px',
        menuBottom: '30px',
        menuItems: [{
          icon: 'http://www.amcharts.com/lib/3/images/export.png',
          format: 'png'
        }]
      }
    }));
    chart.addListener('rendered', zoomChart);
    zoomChart();
    function zoomChart() {
      chart.zoomToIndexes(chart.dataProvider.length - 40, chart.dataProvider.length - 1);
    }
  }
})();

//# sourceMappingURL=main.map
