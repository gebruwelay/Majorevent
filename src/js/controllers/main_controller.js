angular.module('MajorEvent.controllers.Main', [])

.controller('MainController', function($scope,$interval,$http) {

    try {
        $scope.show = false;
        $scope.pointshw = false;
        $scope.droneImgShow = false;
        var stop, counter, dcount = 63, restart = 0, id = 0, imgID = 139, status = 1, name = "", volumeCounter = 0,
            removalCounter = 0, group;
        var polyLayers = [], lastLatlng, radioShow = false, layer, person, imageOverlay,
            imageBounds = [[51.1773635631666, 6.39008925396992], [51.1658094374799, 6.38165954298877]];
        var sd, marker, goldCounter = 0, bestScoreFlag = 0, bonusFlag = 0;

        $scope.score = 0;
        $scope.time;
        $scope.yesno = false;
        $scope.highscore = 0;
        $scope.title = 'Mönchengladbach Football Match';
        $scope.data = new Array();
        $scope.test;
        $scope.info=false;

        // toggle behaviour for the content of about
        $scope.infoFunc=function () {
            if($scope.info==false) {
                $scope.info = true;
                document.getElementById("info").innerHTML="- About";
            }
            else
            {
                $scope.info=false;
                document.getElementById("info").innerHTML="+ About";

            }

        }
        // audio function to change the bootstrap icon for mute and unmute options when the user clicks
        $scope.audio = function () {
            if (volumeCounter == 0) {
                document.getElementById("volumemute").className = "glyphicon glyphicon-volume-off";
                volumeCounter = 1;
            }
            else {
                document.getElementById("volumemute").className = "glyphicon glyphicon-volume-up";
                volumeCounter = 0;
            }
            document.getElementById('player').muted = !document.getElementById('player').muted;
        }

// change the vertices of polygon from rectangle to circle
        var circleIcon = L.Icon.extend({
            options: {
                iconSize: [20, 20],
                shadowAnchor: [0, 0]
            }
        });
        var vertexIcon = new circleIcon({
            iconUrl: 'https://www.dropbox.com/s/mdsla3bwfll1b02/Violet_circle.png?raw=1'
        });

// load the highest score of the network game
        $scope.loadData = function () {
            $http.get('https://ashenda-server.herokuapp.com/Ashenda/').then(function (response) {
                if (response.data.highScore > $scope.highscore) {
                    $scope.highscore = response.data.highScore;// storing only the data part of the response
                }
            });

        }
        //call loadData when controller initialized
        $scope.loadData();
        function bonus() {
            var bonusIcon = L.icon({
                iconUrl: 'https://www.dropbox.com/s/16h1u20fa7vyeeg/bonus.jpg?raw=1',

                iconSize: [38, 95], // size of the icon
                shadowSize: [50, 64], // size of the shadow
                iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
                shadowAnchor: [4, 62],  // the same for the shadow
                popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
            });
            $scope.score = $scope.score + 2000;
            marker = L.marker(mymap.getCenter(), {icon: bonusIcon}).addTo(mymap);
            bonusFlag = 1;
        }

        function bestScore() {
            bestScoreFlag = 1;
            var medal = L.icon({
                iconUrl: 'https://www.dropbox.com/s/yjpmzsuxd4kf43j/medal.png?raw=1',
                iconSize: [38, 95], // size of the icon
                shadowSize: [50, 64], // size of the shadow
                iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
                shadowAnchor: [4, 62],  // the same for the shadow
                popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
            });
            marker = L.marker(mymap.getCenter(), {icon: medal}).addTo(mymap);
        }

        var mymap = L.map('mapid').setView([51.17621876549104, 6.386135816574098], 18);// set the map DOM HTML element
        var drawnItems = L.featureGroup().addTo(mymap);// set the to draw the polygon on the map
        // load the tile as base map from map box
        L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
            maxZoom: 23,
            id: 'mapbox.streets',
            opacity: 0.4,
            accessToken: 'pk.eyJ1IjoiZ2VicnUiLCJhIjoiY2o4M2U3eDg4MGlwcDJ3czQ5c2Mya3lydSJ9.zLbww1nIzzQ4P4-wRUCxBA'
        }, {'drawlayer': drawnItems}, {position: 'right', collapsed: false}).addTo(mymap);

        // player registration
        function userName() {
            var personloc = prompt("Please enter your name");

            if (personloc ==null || personloc == "") {
                window.location.reload();
            }
            return personloc;
        }

        // draw controls of the polygons over the map
        var drawControl = mymap.addControl(new L.Control.Draw({
            position: 'topright',
            edit: {
                featureGroup: drawnItems,
                remove: false

            },
            draw: {
                polygon: {
                    icon: vertexIcon,
                    title: 'Draw polygon',
                    allowIntersection: false,
                    showArea: true,
                    repeatMode: true,
                    drawError: {
                        color: '#e1e100', // Color the shape will turn when intersects
                        timeout: 1000,
                        message: '<strong>Oh snap!<strong> you can\'t draw that!'
                    },
                    shapeOptions: {
                        color: '#97009c'
                    }
                },
                marker: false,
                circle: false,
                circlemarker: false,
                polyline: false,
                rectangle: false
            }
        }));
        // popup for the crowd density options for the drawn polygon
        function popupfunc() {
            var popup = L.popup({closeOnClick: true})
                .setLatLng(lastLatlng)
                .setContent('<form action="">' +
                    '<fieldset>' +
                    '<legend>Hello' + ' ' + person + '</legend>' +
                    '<input type="radio" name="crowd" value="high"  id="high" required checked> high crowded<br>' +
                    '<input type="radio" name="crowd" value="medium" id="medium" > medium crowded<br>' +
                    '<input type="radio" name="crowd" value="less" id="less" > low crowded' +
                    '</fiedldset>' +
                    '</form>').openOn(mymap);
        }

        // Events associated with polygon drawing
        mymap.on(L.Draw.Event.CREATED, function (event) {
            layer = event.layer;
            polyLayers.push(layer);
            if (layer.editing.latlngs[0][0].length >= 7 || polyLayers.length >= 5) {
                bonus();
            }

            group = new L.layerGroup();
            // group.addLayer(polyLayers);
            $scope.yesno = true;
            for (var i = 0; i < polyLayers.length; i++) {
                group.addLayer(polyLayers[i]);
            }
            mymap.addLayer(group);

            // call the popup for the crowd density options
            popupfunc();


            removalCounter++;

            id = id + 1;


        });
        // helps to overlay the image over the leaflet interactive base map
        function image_Overlay() {
            //'http://geomundus.org/2017/Thesis_images/Geo_MOS0137.jpg'
            var imageUrl = 'http://geomundus.org/2017/Thesis_images/Geo_MOS0138.jpg';
            imageOverlay = new L.imageOverlay(imageUrl, imageBounds, {
                bubblingMouseEvents: true,
                interactive: true
            }).addTo(mymap);
            imageOverlay.on('load', function () {
                sd = new L.imageOverlay('http://geomundus.org/2017/Thesis_images/Geo_MOS0139.jpg', imageBounds, {
                    opacity: 0, zIndex: 1,
                    bubblingMouseEvents: true, interactive: true
                }).addTo(mymap);
            });
        }

        // iterates over all images of the crowd
        function itrateImage() {
            imgID = imgID + 1;
            if (imgID ==152) {
                alert("Game over\n Thank you for playing!");
                window.location.reload();

            }
           // console.log(sd);
            //console.log(imgID);
            restart = restart + 1;
            dcount = 63;//this is the id of individual polygon
            for (var i = 0; i < polyLayers.length; i++) {
                group.removeLayer(polyLayers[i]);
            }
            polyLayers = [];
            mymap.removeLayer(imageOverlay);
            imageOverlay = sd;
            imageOverlay.setOpacity(1);
            //imageOverlay.on('click', function(){
            sd = new L.imageOverlay('http://geomundus.org/2017/Thesis_images/Geo_MOS0' + imgID + '.jpg', imageBounds, {
                opacity: 0, zIndex: 1,
                bubblingMouseEvents: true, interactive: true
            }).addTo(mymap);
            //});
        }

        // Down counter for the time
        function downCounter() {
            dcount = dcount - 1;
            $scope.time = dcount + 's';
           /* if (dcount == 90) {
                mymap.flyTo([51.17575129225785, 6.3878846168518075], 18);
            }
            else if (dcount == 60) {
                mymap.flyTo([51.17575129225785, 6.3878846168518075], 18);
            }
            else if (dcount == 30) {
                mymap.flyTo([51.17343739812021, 6.3863343000412], 18);
            }

            else if (dcount == 15) {
                mymap.flyTo([51.17648108652422, 6.3853257894516], 18);

            }
            else if (dcount == 0) {
                mymap.flyTo([51.17621876549104, 6.386135816574098], 18);

            }*/
        }

        // fire this event on pupupclose to save the polygon to database
        mymap.on('popupclose', function (e) {
            if (document.getElementById("high").checked) {
                status = 3;
            }
            else if (document.getElementById("medium").checked) {
                status = 2;
            }
            else {
                status = 1;
            }

            var marker1 = {
                id: id,
                eventName: "Mönchengladbach,Germany",
                playerName: person,
                imgID: imgID,
                polygon: layer.editing.latlngs[0][0],
                status: status,
                highScore: $scope.highscore,
                creationTime: new Date()
            };
            $http.post('https://ashenda-server.herokuapp.com/Ashenda', marker1, {
                headers: {
                    'Content-Type': 'application/json; charset=UTF-8'
                    // json type of content which match with body parser of our server side code
                },

            });
        });

        // add score  while player play the game
        function onMapClick(e) {
            // new L.Draw.Polygon(mymap, drawControl).enable()

            $scope.score = $scope.score + 1000;
            lastLatlng = e.latlng;
            //console.log(e.latlng);
            if ($scope.score > $scope.highscore) {
                $scope.highscore = $scope.score;
                if (bestScoreFlag == 0) {
                    bestScore();
                }
                goldCounter++;
            }

            if (goldCounter == 5 || bonusFlag == 1) {
                mymap.removeLayer(marker);
                bonusFlag = 0;
            }

        }


        // main function to start the game
        $scope.map = function () {
            $scope.title = "";
            $scope.pointshw = true;
            $scope.droneImgShow = true;
            $scope.show = false;
            //ask for player to register
            person = userName();

            // overlay image
            image_Overlay();

            // loop over images every one minute
            stop = $interval(itrateImage, 63000, 13);// call a function iterate over the crowd aerial imagery
            counter = $interval(downCounter, 1000, 819);// call a function counts down the given time
            $scope.$on('$destroy', function () {
                if (angular.isDefined(stop)) {
                    $interval.cancel(stop);
                    $interval.cancel(counter);
                }
            });
            // call on mouse click  to manage the score of the player
            mymap.on('click', onMapClick);
        }


        $scope.displayTip = function () {
            if($scope.show==false)
            {
                $scope.show = true;
                document.getElementById("ins").innerHTML="- Instructions";

            }
            else
            {
                document.getElementById("ins").innerHTML="+ Instructions";
                $scope.show=false;
            }
        }
        $scope.showDroneImg = function () {
            $scope.droneImgShow = true;
        };
    }
    catch (err)
    {
        document.getElementById("mapid").innerHTML=err.message;
    }

});