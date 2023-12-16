var map;
var iovars = {
   days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
   map: {},
   sort_xarkers: [],
   xarkers: [],
   marker_icons: {},
   init_xarkers: [],
   nearby_xarkers: [],
   search_loc: {},
   init_loc: { lat: 51.5074, lng: -0.1278 },
   init_loc_name: 'London, UK',
   input_date: '',
   input_time: '',
   filtered: false,
   near_radius: 160934, // 100 miles,
}

async function ioInitMap() {
   map = new google.maps.Map(document.getElementById("map"), {
      zoomControl: false,
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false,
      center: iovars.init_loc,
      zoom: 6,
   });

   iovars.marker_icons = {
      default: {
         url: io_base_url + 'assets/images/pin.svg', // URL of your custom icon image
         scaledSize: new google.maps.Size(36, 48), // size of the icon
         origin: new google.maps.Point(0, 0),      // origin of the icon, usually (0,0)
         anchor: new google.maps.Point(18, 48)     // anchor point - this is where the pin actually points at. (24,64) should point at the middle-bottom of the icon
      },
      current: {
         url: io_base_url + 'assets/images/pin.svg', // URL of your custom icon image
         scaledSize: new google.maps.Size(36, 48), // size of the icon
         origin: new google.maps.Point(0, 0),      // origin of the icon, usually (0,0)
         anchor: new google.maps.Point(18, 48)     // anchor point - this is where the pin actually points at. (24,64) should point at the middle-bottom of the icon
      }
   };

   ioSetInitialMarkers();
}

var sampleOpeningHours = [
   { open: '08:00', close: '23:00' },  // Sunday
   { open: '09:00', close: '21:00' },  // Monday
   { open: '09:00', close: '21:00' },  // Tuesday
   { open: '09:00', close: '21:00' },  // Wednesday
   { open: '09:00', close: '21:00' },  // Thursday
   { open: '09:00', close: '21:00' },  // Friday
   { open: '08:00', close: '23:00' }   // Saturday
];

var longHoursData = [
   { open: '00:01', close: '23:58' },  // Sunday
   { open: '00:01', close: '23:58' },  // Monday
   { open: '00:01', close: '23:58' },  // Tuesday
   { open: '00:01', close: '23:58' },  // Wednesday
   { open: '00:01', close: '23:58' },  // Thursday
   { open: '00:01', close: '23:58' },  // Friday
   { open: '00:01', close: '23:58' }   // Saturday
];

var open24HoursData = [
   { open: '00:00', close: '23:59' },  // Sunday
   { open: '00:00', close: '23:59' },  // Monday
   { open: '00:00', close: '23:59' },  // Tuesday
   { open: '00:00', close: '23:59' },  // Wednesday
   { open: '00:00', close: '23:59' },  // Thursday
   { open: '00:00', close: '23:59' },  // Friday
   { open: '00:00', close: '23:59' }   // Saturday
];

// Initial markers, make sure to only used once
function ioSetInitialMarkers() {
   // The URL endpoint where you're fetching the markers data from
   var markersUrl = io_base_url + 'assets/data.json';

   fetch(markersUrl)
      .then(response => response.json())  // Parse the data as JSON
      .then(data => {

         var locations = data;

         locations.forEach((marker, index) => {

            if (index % 2 === 0) {
               marker.openingHours = [...longHoursData];
               marker.openingDate = { open: '2023-10-01', close: '2024-01-10' };
            }
            else if (index % 3 === 0) {
               marker.openingHours = [...sampleOpeningHours];
               marker.openingDate = { open: '2023-12-01', close: '2024-01-10' };
            }
            else if (index % 5 === 0) {
               marker.openingHours = [];
               marker.openingDate = {};
            }
            else if (index % 7 === 0) {

            }
            else {
               // marker.openingHours = [...open24HoursData];
               marker.openingHours = [...sampleOpeningHours];
               marker.openingDate = { open: '2023-10-01', close: '2024-01-10' };
            }

         });

         iovars.init_xarkers = [...locations];

         // Finally, add the locations to the map
         ioAddMarkers(locations);

         // add distance field
         ioAddDistance();

         setTimeout(function () {
            processURL();
         }, 100);
      })
      .catch(error => {
         console.error('Error fetching marker data:', error);
      });
}

// Add markers to the map
function ioAddMarkers(markerData) {
   // ioClearMarkers();

   // iovars.xarkers = [...markerData];

   markerData.forEach((data, index) => {
      var markerSettings = {
         ...data, ...{
            position: data.gps,
            map: map,
            title: data.name,
         }
      };

      if (typeof data.icon !== 'undefined') {
         markerSettings.icon = data.icon;
      }
      else {
         markerSettings.icon = iovars.marker_icons.default;
      }

      var marker = new google.maps.Marker(markerSettings);

      marker.addListener('click', function () {
         ioShowMarkerDetail(data.id);
      });

      // markers.push(marker);
      iovars.xarkers.push(marker);
   });

   // ioShowMarkersList(markerData);
}

function ioAddDistance() {
   let center = iovars.init_loc;
   let locations = iovars.xarkers;

   // Convert the center to a Google Maps LatLng object
   let centerLatLng = new google.maps.LatLng(center.lat, center.lng);

   // Calculate distance and append it to each location object
   locations.forEach(location => {
      let locationLatLng = new google.maps.LatLng(location.gps.lat, location.gps.lng);
      location.distance = google.maps.geometry.spherical.computeDistanceBetween(centerLatLng, locationLatLng);

      if (isNaN(location.distance)) {
         console.log(center, location.gps)
      }
   });

   // Sort the locations based on the calculated distance
   locations.sort((a, b) => {
      return a.distance - b.distance;
   });

   iovars.sort_xarkers = [...locations];
}

const landingBox = document.getElementById('landing-box');
const resultBox = document.getElementById('result-box');
const markerDetail = document.getElementById('marker-detail');

function ioShowMarkerDetail(id) {
   landingBox.classList.add("d-none");
   resultBox.classList.remove("d-none");

   var data = iovars.xarkers.find(item => item.id == id);

   var detail_image = "";
   if (typeof data.imageIdList !== 'undefined' && typeof data.imageIdList[0] !== 'undefined') {
      detail_image = io_sample_url + 'backend/assets/dynamic/' + data.imageIdList[0] + '-medium.jpg';
   }

   if (detail_image) {
      detail_image = `<div class="block-thumb"><img src="${detail_image}" alt="${data.name} Image"></div>`;
   }

   let content = `
      <div id="back-button" class="mb-3">
         <button class="btn btn-round" onclick="ioBackShowMoreLocations()">« Back to more locations</button>
      </div>
      <div class="marker-detail scroll-y">
         ${detail_image}
         <h5>${data.name}</h5>
         <p>${data.address}</p>
         <p>${data.description}</p>
         <p class="note">Please note that this page should only be used as a guidance as Christmas market opening times may be subject to change during the festive season. We advise that you check the individual market's official website or contact the organisers directly for the most up-to-date timings.</p>
      </div>
      `;

   markerDetail.innerHTML = content;// Display the back button

   // Re-center and zoom in on the clicked marker's gps
   map.setCenter(data.gps);
   map.setZoom(14);  // You can adjust the zoom level as needed

}

// Reset map to initial state
// for reset button
function ioResetMap() {
   map.setCenter(iovars.init_loc);
   map.setZoom(6);

   landingBox.classList.remove("d-none");
   resultBox.classList.add("d-none");
}

// show more location button click function
function ioBackShowMoreLocations() {
   let content = "";
   let detail_image = "";
   let imageUrl = "";
   let distance = "";
   let isOpen = "";

   let listMarker = iovars.sort_xarkers;

   listMarker.forEach((data) => {
      isOpen = isOpenNow(data);

      if (typeof data.imageIdList !== 'undefined' && typeof data.imageIdList[0] !== 'undefined') {
         imageUrl = io_sample_url + 'backend/assets/dynamic/' + data.imageIdList[0] + '-small.jpg';
      }

      if (imageUrl) {
         detail_image = `<div class="block-thumb"><img src="${imageUrl}" alt="${data.name} Image"></div>`;
      }
      if (typeof data.distance !== 'undefined') {
         distance = `<p class="distance">Distance: ${ioFormatDistance(data.distance)}</p>`;
      }

      if (isOpen) {
         isOpen = `
            <div class="label ${isOpen}">${isOpen}</div>
         `
      }

      // console.log(isOpen);

      content += `
         <div class="marker-item">
            ${detail_image}
            <div class="block-body">
               <div class="head">
                  <h5>${data.name}</h5>
                  ${isOpen}
               </div>
               <div>${data.address}</div>
               ${distance}
               <button class="btn btn-round" onclick="ioShowMarkerDetail(${data.id})">
                  <i class="fa-solid fa-magnifying-glass-location mr-1"></i>
                  View Detail
               </button>
               <button class="btn btn-round">
               <i class="fa-solid fa-heart mr-1"></i>
                  Save Location
               </button>
            </div>
         </div>
         `;
   })

   content = `
      <div class="heading">
         <h4>Christmas Markets near London, UK</h4>
      </div>
      <div class="marker-list scroll-y">
         ${content}
      </div>
   `

   markerDetail.innerHTML = content;
}

function ioFormatDistance(distance) {
   if (distance < 1000) {
      return `${Math.round(distance)} m`;
   } else {
      return `${(distance / 1000).toFixed(2)} km`;
   }
}

function isOpenNow(data) {
   // Disable time checking for now.
   return isOpenToday(data);
}


function isOpenToday(location) {
   // Check if location or location.openingDate is not defined or if open/close dates are not present
   if (!location || !location.openingDate || !location.openingDate.open || !location.openingDate.close) {
      return 'closed';
   }
   let today = Date.now();
   let openingDate = new Date(location.openingDate.open);
   let closingDate = new Date(location.openingDate.close);

   console.log(today <= openingDate);

   if (today >= openingDate && today <= closingDate) {
      return "open";
   } else {
      return "closed";
   }
}

