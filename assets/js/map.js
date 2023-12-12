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
            scaledSize: new google.maps.Size(48, 64), // size of the icon
            origin: new google.maps.Point(0, 0),      // origin of the icon, usually (0,0)
            anchor: new google.maps.Point(24, 64)     // anchor point - this is where the pin actually points at. (24,64) should point at the middle-bottom of the icon
        },
        current: {
            url: io_base_url + 'assets/images/pin.svg', // URL of your custom icon image
            scaledSize: new google.maps.Size(48, 64), // size of the icon
            origin: new google.maps.Point(0, 0),      // origin of the icon, usually (0,0)
            anchor: new google.maps.Point(24, 64)     // anchor point - this is where the pin actually points at. (24,64) should point at the middle-bottom of the icon
        }
    };

    var marker = new google.maps.Marker({
        map: map,
        position: iovars.init_loc,
        title: "London",
        icon: iovars.marker_icons.default,
    });
}