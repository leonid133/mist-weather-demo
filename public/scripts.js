function init() {
  const markers = {
    from: null,
    to: null
  };
  let directionsDisplay = null;
  const directionsService = new google.maps.DirectionsService();
  let lastDirectionsPoints = {};

  const map = new google.maps.Map(document.querySelector('.js-map-container'), {
    center: { lat: -34.397, lng: 150.644 },
    zoom: 8
  });

  [].forEach.call(document.querySelectorAll('.js-address'), (input) => {
    new google.maps.places.Autocomplete(input, { types: ['geocode'] }).addListener('place_changed', function () {
      console.log(this.getPlace());
      let marker = new google.maps.Marker({
        position: this.getPlace().geometry.location,
        title: this.getPlace().name
      });
      if (input.classList.contains('js-from')) {
        markers.from && markers.from.setMap(null);
        markers.from = marker;
      } else if (input.classList.contains('js-to')) {
        markers.to && markers.to.setMap(null);
        markers.to = marker;
      } else {
        throw new Error('Unknown autocomplete field');
      }
      marker.setMap(map);

      const bounds = new google.maps.LatLngBounds();
      markers.from && bounds.extend(markers.from.position);
      markers.to && bounds.extend(markers.to.position);
      map.fitBounds(bounds);

      if (markers.from && markers.to) {
        directionsDisplay && directionsDisplay.setMap(null);
        directionsDisplay = new google.maps.DirectionsRenderer();
        const request = {
          origin: markers.from.position,
          destination: markers.to.position,
          travelMode: 'DRIVING'
        };
        directionsService.route(request, (result, status) => {
          if (status === 'OK') {
            lastDirectionsPoints = {
              points: result.routes[0].overview_path
                .map((m) => Object({lat: m.lat().toString(), lng: m.lng().toString()})),
              legs: {
                distance: result.routes[0].legs[0].distance,
                duration: result.routes[0].legs[0].duration
              }
            }
            directionsDisplay.setDirections(result);
            directionsDisplay.setMap(map);
          }
        });

        document.querySelector('.js-submit').removeAttribute('disabled');
      }
    });
  });

  let weatherMarkers = [];
  document.querySelector('.js-submit').addEventListener('click', () => {
    weatherMarkers.forEach((marker) => marker.setMap(null));
    weatherMarkers = [];
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/forecast', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.addEventListener('readystatechange', () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          const forecast = JSON.parse(xhr.response);
          console.log("success: ", forecast.success);
          weatherMarkers = forecast.payload.result.parameters
            .map((item, idx) => {
              return new google.maps.Marker({
                position: new google.maps.LatLng(item.point.lat, item.point.lng),
                map: map,
                title: `${new Date(item.datetime).toLocaleString()} ${item.temperature}ºC`,
                icon: 'http://openweathermap.org/img/w/' + (() => {
                  if (item.sun > 50 && item.cloud < 50) {
                    return '01d.png';
                  } else if (item.sun >= 50 && item.cloud >= 50) {
                    return '02d.png';
                  } else if (item.cloud > 50 && item.sun < 50) {
                    return '03d.png';
                  } else if (item.sun <= 50 && item.rain >= 50) {
                    return '09d.png';
                  } else if (item.sun > 50 && item.rain > 50) {
                    return '10d.png';
                  } else {
                    console.log("no image: ", item);
                  }
                })()
              });
            })
            .filter((m) => m); 
        }
      }
    });
    xhr.send(JSON.stringify(lastDirectionsPoints));
  });
}
