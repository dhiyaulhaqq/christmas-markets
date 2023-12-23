<!DOCTYPE html>

<head>
    <link rel="stylesheet" href="assets/css/fontawesome-all.css">
    <link rel="stylesheet" href="assets/css/theme.css">
    <script src="https://polyfill.io/v3/polyfill.js?features=default"></script>
    <script>
        var io_sample_url = 'https://reptile2.developmentpath.co.uk/tui/christmas-markets/';
        var io_base_url = 'http://localhost/learning/christmas-markets/';
    </script>
</head>

<body>
    <div class="page-section section-map">
        <div id="map">
        </div>
        <div class="floating-container">
            <div class="control-box box-shadow">
                <div class="search d-flex flex-wrap justify-content-center">
                    <div class="border border-primary rounded-lg d-flex flex-fill bg-white px-1 mr-2 mb-3">
                        <input type="text" id="search-input" class="flex-fill border-white" placeholder="Click the target or type a location">
                        <button class="btn" onclick="ioGetCurrentLocation()"><i class="fa-solid fa-location-crosshairs"></i></button>
                    </div>
                    <button class="btn btn-round mb-3" onclick="ioShowSavedLocations()"><i class="fa-solid fa-location-dot mr-2"></i>Saved (<span id="saved">0</span>)</button>
                </div>
                <div class="filter block-hor">
                    <button class="btn btn-round item" onclick="ioFilterOpenNow()">Open Now</button>
                    <button class="btn btn-round item">Filter Date</button>
                    <button class="btn btn-round item" onclick="ioResetMap()">Reset Map</button>

                </div>
            </div>
            <div class="content-box box-shadow scroll-y">
                <div id="landing-box">
                    <div class="block-body">
                        <h3>Christmas Markets in Europe</h3>
                        <p>An interactive European map showcasing the most enchanting Christmas markets.</p>

                        <p>Plan your festive journey - virtually or in person.</p>

                        <p>Pick your favourite markets and enter a city to explore the Yuletide wonders nearby - all from the comfort of your home! Check out the magical stalls of Nuremberg, wander the twinkling pathways of Strasbourg, or delve into the festive delights of Vienna's Christkindlmarkt.</p>

                        <p class="note">Please note that this page should only be used as a guidance as Christmas market opening times may be subject to change during the festive season. We advise that you check the individual market's official website or contact the organisers directly for the most up-to-date timings.</p>
                    </div>
                </div>
                <div id="result-box" class="d-none">
                    <div id="marker-detail">

                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="assets/js/map.js"></script>
    <script async defer src="https://maps.googleapis.com/maps/api/js?libraries=places,geometry&callback=ioInitMap&key=AIzaSyAo6oq92figYRhKvO7jz4GKPIvJVncWkZY"></script>

</body>