    $( document ).ready(function() {
        //            alert(".ready()");

        function init() {

            var map;
            map = new OpenLayers.Map('map',
                    {
                        div: "map",
                        projection: new OpenLayers.Projection("EPSG:900913"),
                        units: "m",
                        controls: [
                            new OpenLayers.Control.Navigation(),
                            new OpenLayers.Control.LayerSwitcher(),
                            new OpenLayers.Control.PanZoomBar(),
//                            new OpenLayers.Control.ScaleLine(),
                            new OpenLayers.Control.MousePosition(),
                            new OpenLayers.Control.KeyboardDefaults()
                        ]
                    }
            );



            var osm = new OpenLayers.Layer.OSM();
            map.addLayer(osm);


            var pop_layer = new OpenLayers.Layer.WMS("Population Density in 2000", "http://sedac.ciesin.columbia.edu/geoserver/ows", {
                layers: 'gpw-v3:gpw-v3-population-density_2000',
                transparent: true
            }, {
                opacity: 1.0,
                isBaseLayer: false
            });


            map.addLayer(osm);
            map.setCenter(new OpenLayers.LonLat(-98.9782, 39.8282).transform("EPSG:4326", "EPSG:900913"), 5);
            map.addLayer(pop_layer);
            map.options({touchZoom : false});
//            var size = new OpenLayers.Size(9,9);
//            var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
//            var icon = new OpenLayers.Icon('http://www.openlayers.org/dev/img/marker.png',size,offset);

            d3.json("/alltm/map", function (collection) {

//                alert(collection.features.length);
                 var aOverlay = new OpenLayers.Layer.Vector("Kiosk POI");
//                 alert("aOverlay : "+aOverlay);
                 // Add the container when the overlay is added to the map.
                 aOverlay.afterAdd = function () {
                     aOverlay.transparent = true;
                     aOverlay.opacity = 0.5;
                     var div = d3.selectAll("#" + aOverlay.div.id);
                     div.selectAll("svg").remove();
                     var svg = div.append("svg");
                     g = svg.append("g");

                     var bounds = d3.geo.bounds(collection);
                     var path = d3.geo.path().projection(aProject);
//                     alert("afterAdd , bounds : "+bounds+" , path : "+path);

                     var feature = g.selectAll("path")
                             .data(collection.features)
                             .enter().append("path")
                             .attr("d", path.pointRadius(function (d) {
                                 return Math.sqrt((Math.exp(parseFloat(1.2))));
                             })).on("mouseover", function (d) {
                                 var mousePosition = d3.svg.mouse(this);
                                 //                            var format = d3.time.format("%Y-%m-%d %HH:%MM:%SS");
                                 var title = "ID : "+d.properties.terminalId + " M : "+ d.properties.model;
                                 $("#pop-up").fadeOut(100, function () {
                                     // Popup content
                                     $("#pop-up-title").html( title );
                                     $("#pop-img").html('<img src="assets/images/Icon-Small.png"/>');
                                     $("#pop-desc").html(d.properties.place);

                                     // Popup position
                                     var popLeft = mousePosition[0];
                                     var popTop = mousePosition[1];
                                     $("#pop-up").css({
                                         "left": popLeft,
                                         "top": popTop
                                     });
                                     $("#pop-up").fadeIn(100)
                                 });
                             }).
                             on("mouseout", function () {
                                 $("#pop-up").fadeOut(50);
                             });


                     map.events.register("moveend", map, aReset);
                     aReset();


                     function aReset() {
                         try {
                             var bottomLeft = aProject(bounds[0]),
                                     topRight = aProject(bounds[1]);
                             svg.attr("width", topRight[0] - bottomLeft[0])
                                     .attr("height", bottomLeft[1] - topRight[1])
                                     .style("margin-left", bottomLeft[0] + "px")
                                     .style("margin-top", topRight[1] + "px");
                             g.attr("transform", "translate(" + -bottomLeft[0] + "," + -topRight[1] + ")");
                             feature.attr("d", path);
                         } catch (err) {

                         }
                     }


                     function aProject(x) {
                         if (x[0] < -180 || x[0] > 180 || x[1] < -90 || x[1] > 90) {
                             x[0] = 0.0; x[1] = 0.0;
                         }
                         var point = map.getViewPortPxFromLonLat(new OpenLayers.LonLat(x[0], x[1])
                                 .transform("EPSG:4326", "EPSG:900913"));
                         return [point.x, point.y];
                     }
                 }
                 map.addLayer(aOverlay);

            });

//            $.getJSON( "ajax/test.json", function( data ) {
//                var items = [];
//                $.each( data, function( key, val ) {
//                    items.push( "<li id='" + key + "'>" + val + "</li>" );
//                });
//
//                $( "<ul/>", {
//                    "class": "my-new-list",
//                    html: items.join( "" )
//                }).appendTo( "body" );
//            });
        }

        init();

    });
