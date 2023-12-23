var map;
var iovars = {
   days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
   map: {},
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
   ioSetupAutoComplete();
   ioShowSavedNumbers();
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

         // sort by distance
         locations = ioSortDistance();

         iovars.xarkers = [...locations];

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
   let markers = [];

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

      markers.push(marker);
   });

   iovars.xarkers = [...markers];

}

function ioSortDistance(locations) {

   if (!locations) {
      locations = iovars.xarkers;
   }

   let center = iovars.init_loc;

   if (typeof iovars.search_loc.geometry != "undefined") {
      const loc = iovars.search_loc.geometry.location;
      center = { lat: loc.lat(), lng: loc.lng() };
   }

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

   // iovars.xarkers = [...locations];

   return locations;
}

const landingBox = document.getElementById('landing-box');
const resultBox = document.getElementById('result-box');
const markerDetail = document.getElementById('marker-detail');
const input = document.getElementById('search-input');
const savedText = document.getElementById('saved');

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

   let isOpen = isOpenNow(data);

   if (isOpen) {
      isOpen = `
         <div class="label ${isOpen}">${isOpen}</div>
      `
   }

   let openingDate = getOpeningDate(data);

   if (openingDate) {
      openingDate = `
            <p class="opening"><strong>Opening Date: </strong>${openingDate}</p>
         `
   }

   let content = `
      <div id="back-button" class="mb-3">
         <button class="btn btn-round" onclick="ioShowMoreLocations()">« Back to more locations</button>
      </div>
      <div class="marker-detail scroll-y">
         ${detail_image}
         <div class="block-body">
            <div class="head">
               <h5>${data.name}</h5>
               ${isOpen}
            </div>
            <p>${data.address}</p>
            ${openingDate}
            <p>${data.description}</p>
         </div>
         <div class="my-3">
            <button class="btn btn-round">
            <i class="fa-solid fa-heart mr-1"></i>
               Save Location
            </button>
            <a class="btn btn-round" href="https://www.google.com/maps/search/?api=1&query=${data.gps.lat},${data.gps.lng}" target="_blank" >
               <i class="fa-solid fa-magnifying-glass-location mr-1"></i>
               View on Google Maps
            </a>
         </div>
         <div class="note">
            <p>Please note that this page should only be used as a guidance as Christmas market opening times may be subject to change during the festive season. We advise that you check the individual market's official website or contact the organisers directly for the most up-to-date timings.</p>
            <p>Visit <a href="http://www.website.com" target="_blank"></a> for opening hours</p>
         </div>
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

   ioClearMarkers();
   ioClearSearch();
   ioAddMarkers(iovars.init_xarkers);

   let locations = ioSortDistance();
   iovars.xarkers = [...locations];

   ioClearSavedLocations();

   landingBox.classList.remove("d-none");
   resultBox.classList.add("d-none");
}

// show more location button click function
function ioShowMoreLocations() {
   landingBox.classList.add("d-none");
   resultBox.classList.remove("d-none");

   let center = iovars.init_loc;

   if (typeof iovars.search_loc.geometry != "undefined") {
      const loc = iovars.search_loc.geometry.location;
      center = { lat: loc.lat(), lng: loc.lng() };
   }

   map.setCenter(center);
   map.setZoom(6);

   let content = "";

   let listMarker = iovars.xarkers;

   content = ioShowLocationList(listMarker);

   markerDetail.innerHTML = content;
}

function ioShowLocationList(listMarker) {
   let content = "";
   let detail_image = "";
   let imageUrl = "";
   let distance = "";
   let isOpen = "";
   let openingDate = "";
   let placeName = "";

   listMarker.forEach((location) => {
      if (typeof location.imageIdList !== 'undefined' && typeof location.imageIdList[0] !== 'undefined') {
         imageUrl = io_sample_url + 'backend/assets/dynamic/' + location.imageIdList[0] + '-small.jpg';
      }

      if (imageUrl) {
         detail_image = `<div class="block-thumb"><img src="${imageUrl}" alt="${location.name} Image"></div>`;
      }
      if (typeof location.distance !== 'undefined') {
         distance = `<div class="distance">Distance: ${ioFormatDistance(location.distance)}</div>`;
      }

      isOpen = isOpenNow(location);

      if (isOpen) {
         isOpen = `
            <div class="label ${isOpen}">${isOpen}</div>
         `
      }

      openingDate = getOpeningDate(location);

      if (openingDate) {
         openingDate = `
            <div class="opening"><strong>Opening Date: </strong>${openingDate}</div>
         `
      }

      content += `
         <div class="marker-item">
            ${detail_image}
            <div class="block-body">
               <div class="head">
                  <h5 class="mr-2">${location.name}</h5>
                  ${isOpen}
               </div>
               <div>${location.address}</div>
               ${distance}
               ${openingDate}
               <div class="mt-3">
                  <button class="btn btn-round" onclick="ioShowMarkerDetail(${location.id})">
                     <i class="fa-solid fa-magnifying-glass-location mr-1"></i>
                     View Detail
                  </button>
                  <button class="btn btn-round" onclick="ioSaveLocation(${location.id})">
                  <i class="fa-solid fa-heart mr-1"></i>
                     Save Location
                  </button>
               </div>
            </div>
         </div>
         `;
   })

   placeName = iovars.init_loc_name;

   if (typeof iovars.search_loc.formatted_address != 'undefined') {
      placeName = iovars.search_loc.formatted_address;
   }

   content = `
      <div class="heading">
         <h4>Christmas Markets near ${placeName}</h4>
      </div>
      <div class="marker-list scroll-y">
         ${content}
      </div>
   `

   return content;
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

   if (today >= openingDate && today <= closingDate) {
      return "open";
   } else {
      return "closed";
   }
}

// open now button click function
function ioFilterOpenNow() {
   landingBox.classList.add("d-none");
   resultBox.classList.remove("d-none");

   let listMarker = ioMakeIsOpenNowList();

   ioClearMarkers();
   ioAddMarkers(listMarker);

   ioShowMoreLocations();

}

function ioMakeIsOpenNowList() {
   let filtered = [];
   let listMarker = iovars.xarkers;

   listMarker.forEach((location) => {
      isOpen = isOpenNow(location);

      if (isOpen == "open") {
         filtered.push(location);
      }
   })

   return filtered;
}

function ioClearMarkers() {
   iovars.xarkers.forEach(marker => marker.setMap(null));
   iovars.xarkers = [];
}

function ioClearSearch() {
   iovars.search_loc = {};
   input.value = "";
}

function getOpeningDate(location) {
   const options = {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
   };
   // Check if location or location.openingDate is not defined or if open/close dates are not present
   if (!location || !location.openingDate || !location.openingDate.open || !location.openingDate.close) {
      return '';
   }
   let openingDate = new Date(location.openingDate.open);
   let closingDate = new Date(location.openingDate.close);

   return openingDate.toLocaleDateString("en-US", options) + " - " + closingDate.toLocaleDateString("en-US", options);
}

function ioSetupAutoComplete() {
   // Setup autocomplete
   const autocomplete = new google.maps.places.Autocomplete(input);

   autocomplete.bindTo('bounds', map);

   // Listen for the event fired when the user selects a prediction and retrieve more details for that place.
   autocomplete.addListener('place_changed', function () {
      const place = autocomplete.getPlace();
      const loc = place.geometry.location;

      iovars.search_loc = place;

      if (!place.geometry) {
         console.log("No details available for this location.");
         return;
      }

      // const center = { lat: loc.lat(), lng: loc.lng() };

      let locations = ioSortDistance();
      iovars.xarkers = [...locations];

      ioShowMoreLocations();

   });
}

function ioSaveLocation(id) {
   let savedMarkers = [];

   try {
      savedMarkers = JSON.parse(localStorage.getItem('savedMarkers')) || [];
   } catch (error) {
      console.error(error);
   }

   var markerData = iovars.init_xarkers.find(item => item.id == id);

   // Check if marker is already saved (based on its title, for simplicity)
   const isAlreadySaved = savedMarkers.some(savedMarker => savedMarker.id === markerData.id);

   if (!isAlreadySaved) {
      savedMarkers.push(markerData);
      localStorage.setItem('savedMarkers', JSON.stringify(savedMarkers));
      console.log('Marker saved to localStorage.');
   } else {
      console.log('Marker is already saved.');
   }

   ioShowSavedNumbers();
}

function ioShowSavedNumbers() {
   const savedData = localStorage.getItem('savedMarkers');
   let total = 0;

   if (savedData) {
      const markerData = JSON.parse(savedData);

      total = markerData.length;
   }

   savedText.innerHTML = total;
}

function ioClearSavedLocations() {
   localStorage.setItem('savedMarkers', []);

   ioShowSavedNumbers();
   ioShowSavedLocations();
}

function ioShowSavedLocations() {
   landingBox.classList.add("d-none");
   resultBox.classList.remove("d-none");

   let center = iovars.init_loc;

   if (typeof iovars.search_loc.geometry != "undefined") {
      const loc = iovars.search_loc.geometry.location;
      center = { lat: loc.lat(), lng: loc.lng() };
   }

   map.setCenter(center);
   map.setZoom(6);

   const savedData = localStorage.getItem('savedMarkers');
   let markerData = "";

   if (savedData) {
      markerData = JSON.parse(savedData);
   }

   let content = ioShowSavedLocationList(markerData);

   markerDetail.innerHTML = content;
}

function ioShowSavedLocationList(listMarker) {
   let content = "";
   let detail_image = "";
   let imageUrl = "";
   let distance = "";
   let isOpen = "";
   let openingDate = "";

   if (listMarker) {

      listMarker = ioSortDistance(listMarker);

      listMarker.forEach((location) => {
         if (typeof location.imageIdList !== 'undefined' && typeof location.imageIdList[0] !== 'undefined') {
            imageUrl = io_sample_url + 'backend/assets/dynamic/' + location.imageIdList[0] + '-small.jpg';
         }

         if (imageUrl) {
            detail_image = `<div class="block-thumb"><img src="${imageUrl}" alt="${location.name} Image"></div>`;
         }
         if (typeof location.distance !== 'undefined') {
            distance = `<div class="distance">Distance: ${ioFormatDistance(location.distance)}</div>`;
         }

         isOpen = isOpenNow(location);

         if (isOpen) {
            isOpen = `
            <div class="label ${isOpen}">${isOpen}</div>
         `
         }

         openingDate = getOpeningDate(location);

         if (openingDate) {
            openingDate = `
            <div class="opening"><strong>Opening Date: </strong>${openingDate}</div>
         `
         }

         content += `
         <div class="marker-item">
            ${detail_image}
            <div class="block-body">
               <div class="head">
                  <h5 class="mr-2">${location.name}</h5>
                  ${isOpen}
               </div>
               <div>${location.address}</div>
               ${distance}
               ${openingDate}
               <div class="mt-3">
                  <button class="btn btn-round" onclick="ioShowMarkerDetail(${location.id})">
                     <i class="fa-solid fa-magnifying-glass-location mr-1"></i>
                     View Detail
                  </button>
               </div>
            </div>
         </div>
         `;
      })
   } else {
      content = `
         <div class="no-data">
            <p>No locations in your shortlist. Open a location on the map and click "Save location"</p>
         </div>
      `
   }

   content = `
      <div class="heading">
         <h4>Saved Location</h4>
         <button class="btn btn-round btn-small" onclick="ioClearSavedLocations()">
            Clear saved locations
         </button>
      </div>
      <div class="marker-list scroll-y">
         ${content}
      </div>
   `

   return content;
}