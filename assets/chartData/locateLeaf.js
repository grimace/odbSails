
//$( document ).ready(function() {
var initializeLeaflet = function() {
//  alert('leaf document ready.');
  var condition = false;


  var check = function(){

    if (!condition){

        setTimeout(check, 100); // check again in a second
        // alert("running check");

    }
  }

  var inService, outOfService;
  var map, updateProgressBar, inServiceFeatures, outOfServiceFeatures, progress, progressBar, markers, hashList, w, atmlistByHash, page, maxKiosks, pageCount;

  page = 100000;
  maxKiosks = 39000;
  pageCount = 0;
  //progress = $( document ).getElementById('progress');
  //progressBar = $( document ).getElementById('progress-bar');
  progress = $(document.getElementById('progress'));
  progressBar = $( document.getElementById('progress-bar'));
  updateProgressBar = function(processed, total, elapsed, layersArray) {
//    console.log('updateProgressBar processed '+processed+' , total : '+total+' , time : '+(new Date()) );
    //if (w && processed >= total) {
    //  if (pageCount-- <= 0) {
    //    w.postMessage({'state': 'next'});
    //  }
    //}
    if (elapsed > 1000) {
      // if it takes more than a second to load, display the progress bar:
      showLoader();
      //progress.style.display = 'block';
      //progressBar.style.width = Math.round(processed/total*100) + '%';
    }
    //
    if (processed === total) {
      // all markers processed - hide the progress bar:
      //progress.style.display = 'none';
      hideLoader();
    }
  }


  var alltmIcon = L.icon({
      iconUrl: '/lib/leaflet/KioskIS.png',
      // shadowUrl: 'IconShadow.png',

      iconSize:     [19, 19], // size of the icon
      // shadowSize:   [19, 19], // size of the shadow
      // iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
      // shadowAnchor: [8, 8],  // the same for the shadow
      popupAnchor:  [0, -10] // point from which the popup should open relative to the iconAnchor
  });
  var atmIcon = L.icon({
    iconUrl: '/lib/leaflet/KioskOOS.png',
    // shadowUrl: 'IconShadow.png',

    iconSize:     [19, 19], // size of the icon
    // shadowSize:   [19, 19], // size of the shadow
    // iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    // shadowAnchor: [8, 8],  // the same for the shadow
    popupAnchor:  [0, -10] // point from which the popup should open relative to the iconAnchor
  });

  window.refresh = function(showAll) {
    console.log("refresh being called");
    if (showAll) {
      map.addLayer(outOfService);
    } else {
      map.removeLayer(outOfService);
    }
      //map.removeLayer(markers);
      //markers = L.markerClusterGroup({ chunkedLoading: true, chunkProgress: updateProgressBar });
      // , chunkSize: page, chunkProgress: updateProgressBar
      //markerList = [];
      //map.addLayer(markers);
      //loadHashList(showAll);
  }

  var loadHashList = function(showAll) {
      var atmAPI = "/alltm/hashList";
      if (showAll) {
          atmAPI = atmAPI + "?alltmOnly=false";
      }
      hashList = [];
      $.getJSON(atmAPI, function(json){
          //alert(json.length);
          for (var i=0; i <  json.length; i++)  {
              var gh = json[i];
              hashList.push(gh);
          }
          loadAtmList(showAll);
      });
  }

  var loadAll = function() {

    // get the total count for the kiosks
    var atmAPI = "/alltm/total";
    showLoader();
    $.getJSON(atmAPI, function(json) {

      var index = 0;
      var total = json.count;
      //total = Math.min(maxKiosks, total);
      //console.log('/alltm/total returned : '+JSON.stringify(json));
      console.log('/alltm/total returned : '+total);
      if (total > 0) {

        w = new Worker('/chartData/pageLoad.js');
        var args = {};
        args.hashList = hashList;
        args.atmlistByHash = atmlistByHash;
        args.alltmIcon = alltmIcon;
        args.atmIcon = atmIcon;
        args.total = total;
        args.page = page;
        w.postMessage({ 'state' : 'start', 'args': args });

        w.onmessage = function(event) {
          var eData = event.data;
          if (eData.complete) {
            w.terminate();
            w = null;
            //markers.addLayers(markerList);
            condition = false;
            //console.log('saving inServiceFeatures : '+inServiceFeatures.length);
            //localStorage.setItem("inServiceFeatures", JSON.stringify(inServiceFeatures));
            //localStorage.setItem("outOfServiceFeatures", JSON.stringify(outOfServiceFeatures));
            //check();
            //$( document).outOfService = outOfService;
            hideLoader();
          } else {

            var index = eData.index;

            var def = $.Deferred(function () {
              //for (; index <= total;) {
              atmAPI = "/alltm/kioskListPaged?index=" + index + "&page=" + page;
              //console.log('calling ' + JSON.stringify(atmAPI));
              $.getJSON(atmAPI, function (j2) {
                var markerArray = [];
                var inServiceArray = [];
                var outOfServiceArray = [];
                // alert("adding "+j2.features.length);
                //var markerArray = [];
                console.log('...returned ' + j2.features.length);
                for (var i = 0; i < j2.features.length; i++) {
                  index += j2.features.length;
                  var f = j2.features[i];
                  var crd = f.geometry.coordinates;
                  var lon = crd[0];
                  var lat = crd[1];
                  var terminalId = f.properties.terminalId;
                  var title = terminalId;
                  var model = f.properties.model;
                  var time = f.properties.time;
                  var mac = f.properties.macAddress;
                  var marker;
                  if (f.properties.topper != null) {
                    marker = L.marker(new L.LatLng(lat, lon), {'title': title, icon: alltmIcon});
                  } else {
                    marker = L.marker(new L.LatLng(lat, lon), {'title': title, icon: atmIcon});
                  }
                  marker.mac = mac;
                  marker.terminalId = terminalId;
                  marker.lon = lon;
                  marker.lat = lat;
                  marker.model = model;
                  marker.on('click',
                    function (event) {
                      var alltmTerminal = "/alltm/alltmTerminal?terminalId=" + this.terminalId;
                      var mkr = this;
                      $.getJSON(alltmTerminal, function (vj) {
                        console.log("alltmTerminal no mac");
                        // POP up what ever you want!
                        mkr.bindPopup('<h4>Kiosk Details</h4>' +
                          '<span id="bold">Title: </span>' + mkr.terminalId + '<br>' +
                          '<span id="bold">Lon: </span>' + mkr.lon + '<br>' +
                          '<span id="bold">Lat: </span>' + mkr.lat + '<br>' +
                          '<span id="bold">Address: </span>' + vj.place + '<br>' +
                          '<span id="bold">Zip/Postal: </span>' + vj.zip + '<br>').openPopup();

                      });
                    }
                  );
                  outOfServiceArray.push(marker);
                }
                outOfService.addLayers(outOfServiceArray);
                w.postMessage({ 'state' : 'next'});
              });
            });
          }
        }
      }
    });
  }

  var loadInService = function() {

      // get the total count for the kiosks
    var atmAPI;
    var def = $.Deferred(function () {
      //for (; index <= total;) {
      atmAPI = "/alltm/kioskInService";
      //console.log('calling ' + JSON.stringify(atmAPI));
      $.getJSON(atmAPI, function (j2) {
        var markerArray = [];
        var inServiceArray = [];
        var outOfServiceArray = [];
        // alert("adding "+j2.features.length);
        //var markerArray = [];
        console.log('...returned ' + j2.features.length);
        for (var i = 0; i < j2.features.length; i++) {
          var f = j2.features[i];
          var crd = f.geometry.coordinates;
          var lon = crd[0];
          var lat = crd[1];
          var terminalId = f.properties.terminalId;
          var title = terminalId;
          var model = f.properties.model;
          var time = f.properties.time;
          var mac = f.properties.macAddress;
          var marker;
          if (f.properties.topper != null) {
            marker = L.marker(new L.LatLng(lat, lon), {'title': title, icon: alltmIcon});
          } else {
            marker = L.marker(new L.LatLng(lat, lon), {'title': title, icon: atmIcon});
          }
          marker.mac = mac;
          marker.terminalId = terminalId;
          marker.lon = lon;
          marker.lat = lat;
          marker.model = model;
          marker.on('click',
            function (event) {
                var visitByAlltm = "/alltmVisit/visitsByAlltm?mac=" + this.mac;
                var alltmMetrics = "/alltmVisit/alltmMetrics?mac=" + this.mac;
                var alltmTerminal = "/alltm/alltmTerminal?terminalId=" + this.terminalId;
                var mkr = this;
                var address = {};
                $.getJSON(alltmTerminal, function (tr) {
                  console.log("alltmTerminal mac : " + mac);
                  address.place = tr.place;
                  address.zip = tr.zip;

                  $.getJSON(alltmMetrics, function (m) {
                    mkr.checkins = m.checkins;
                    mkr.coupons = m.coupons;
                    mkr.uniqueUsers = m.uniqueUsers;
                    mkr.lastCheckIn = m.lastCheckIn;

                    $.getJSON(visitByAlltm, function (vj) {
                      // alert('vj: ' + vj.total + 'male:' + vj.male + '<br>' + 'female:' + vj.female + '<br>' + 'group' + vj.group);

                      // var popup = L.popup() .setLatLng(latlng) .setContent('<p>Hello world!<br />This is a nice popup.</p>') .openOn(map);
                      var alltmDetails = '<div id="cropped"><h4>Kiosk Details</h4>' +
                        '<span id="bold">Title: </span>' + mkr.terminalId + '<br>' +
                        '<span id="bold">Lon: </span>' + mkr.lon + '<br>' +
                        '<span id="bold">Lat: </span>' + mkr.lat + '<br>' +
                        '<span id="bold">Address: </span>' + address.place + '<br>' +
                        '<span id="bold">Zip/Postal: </span>' + address.zip + '<br>' +
                        '<span id="bold">Unique Users: </span>' + mkr.uniqueUsers + '<br>' +
                        '<span id="bold">User Checkins: </span>' + mkr.checkins + '<br>' +
                        '<span id="bold">Coupons Redemption: </span>' + mkr.coupons +
                        '<h4>Camera Visit Information</h4>' +
                        '<span id="bold">Total Visitors: </span>' + vj.total + '<br>' +
                        '<span id="bold">Men: </span>' + vj.male + '<br>' +
                        '<span id="bold">Women: </span>' + vj.female + '<br>' +
                        '<span id="bold">Groups: </span>' + vj.group;
                      if (isOps) {
                        alltmDetails +=
                          '<h4>Monitoring Status</h4>' +
                          '<span id="bold">Hive Mgr Last Checkin: </span>' + mkr.lastCheckIn + ' <br>' +
                            //'<span id="bold">Manager: </span>XXXXXX' + '<br>' +
                            //'<span id="bold">Player: </span>XXXXXX' + '<br>' +
                            //'<span id="bold">Player Last Checkin: </span>XXXXX' + '<br>' +
                            //'<span id="bold">Play Count: </span>XXXXXX' + '<br>' +
                          '<span style="margin-top: 10px;"><a href="/kiosk/detailreport/' + mkr.terminalId + '">' +
                          '<input id="alltmDetails" type="button" class="btn btn-small btn-primary btn-block" value="View Details"/></a></span></div>'
                      }
                      mkr.bindPopup(
                        alltmDetails
                      ).openPopup();
                    });
                  });
                });
            }
          );
          inServiceArray.push(marker);
        }
        if (inServiceArray.length > 0) {
          inService.addLayers(inServiceArray);
          //console.log("setting document inService");
          //$( document).inService = inService;
        }
      });
    });
    def.promise();
  }

  var loadAtmList = function(showAll) {
    atmlistByHash = "/alltm/listByHash?hash=";
    if (showAll) {
      atmlistByHash = "/alltm/listByHash?alltmOnly=false&hash=";
    }

    if(typeof(Worker) !== "undefined") {
      console.log('running web worker.');
      loadASync();
    } else {
      loadSync();
    }
  }

  function processInServiceFeatures() {

    var inServiceArray = [];
    // alert("adding "+j2.features.length);
    //var markerArray = [];
    console.log('process inServiceFeatures : '+JSON.stringify(inServiceFeatures[0]));
    for (var i = 0; i < inServiceFeatures.length; i++) {
      var f = inServiceFeatures[i];
      var crd = f.geometry.coordinates;
      var lon = crd[0];
      var lat = crd[1];
      var terminalId = f.properties.terminalId;
      var title = terminalId;
      var model = f.properties.model;
      var time = f.properties.time;
      var mac = f.properties.macAddress;
      var marker;
      if (f.properties.topper != null) {
        marker = L.marker(new L.LatLng(lat, lon), {'title': title, icon: alltmIcon});
      } else {
        marker = L.marker(new L.LatLng(lat, lon), {'title': title, icon: atmIcon});
      }
      marker.mac = mac;
      marker.terminalId = terminalId;
      marker.lon = lon;
      marker.lat = lat;
      marker.model = model;
      marker.on('click',
        function (event) {
            var visitByAlltm = "/alltmVisit/visitsByAlltm?mac=" + this.mac;
            var alltmMetrics = "/alltmVisit/alltmMetrics?mac=" + this.mac;
            var alltmTerminal = "/alltm/alltmTerminal?terminalId=" + this.terminalId;
            var mkr = this;
            var address = {};
            $.getJSON(alltmTerminal, function (tr) {
              console.log("alltmTerminal mac : " + mac);
              address.place = tr.place;
              address.zip = tr.zip;

              $.getJSON(alltmMetrics, function (m) {
                mkr.checkins = m.checkins;
                mkr.coupons = m.coupons;
                mkr.uniqueUsers = m.uniqueUsers;
                mkr.lastCheckIn = m.lastCheckIn;

                $.getJSON(visitByAlltm, function (vj) {
                  // alert('vj: ' + vj.total + 'male:' + vj.male + '<br>' + 'female:' + vj.female + '<br>' + 'group' + vj.group);

                  // var popup = L.popup() .setLatLng(latlng) .setContent('<p>Hello world!<br />This is a nice popup.</p>') .openOn(map);
                  var alltmDetails = '<div id="cropped"><h4>Kiosk Details</h4>' +
                    '<span id="bold">Title: </span>' + mkr.terminalId + '<br>' +
                    '<span id="bold">Lon: </span>' + mkr.lon + '<br>' +
                    '<span id="bold">Lat: </span>' + mkr.lat + '<br>' +
                    '<span id="bold">Address: </span>' + address.place + '<br>' +
                    '<span id="bold">Zip/Postal: </span>' + address.zip + '<br>' +
                    '<span id="bold">Unique Users: </span>' + mkr.uniqueUsers + '<br>' +
                    '<span id="bold">User Checkins: </span>' + mkr.checkins + '<br>' +
                    '<span id="bold">Coupons Redemption: </span>' + mkr.coupons +
                    '<h4>Camera Visit Information</h4>' +
                    '<span id="bold">Total Visitors: </span>' + vj.total + '<br>' +
                    '<span id="bold">Men: </span>' + vj.male + '<br>' +
                    '<span id="bold">Women: </span>' + vj.female + '<br>' +
                    '<span id="bold">Groups: </span>' + vj.group;
                  if (isOps) {
                    alltmDetails +=
                      '<h4>Monitoring Status</h4>' +
                      '<span id="bold">Hive Mgr Last Checkin: </span>' + mkr.lastCheckIn + ' <br>' +
                        //'<span id="bold">Manager: </span>XXXXXX' + '<br>' +
                        //'<span id="bold">Player: </span>XXXXXX' + '<br>' +
                        //'<span id="bold">Player Last Checkin: </span>XXXXX' + '<br>' +
                        //'<span id="bold">Play Count: </span>XXXXXX' + '<br>' +
                      '<span style="margin-top: 10px;"><a href="/kiosk/detailreport/' + mkr.terminalId + '">' +
                      '<input id="alltmDetails" type="button" class="btn btn-small btn-primary btn-block" value="View Details"/></a></span></div>'
                  }
                  mkr.bindPopup(
                    alltmDetails
                  ).openPopup();
                });
              });
            });
        }
      );
      inServiceArray.push(marker);
    }
    console.log('adding to inService : '+inServiceArray.length);
    inService.addLayers(inServiceArray);
  }

  function processOutOfServiceFeatures() {
    var outOfServiceArray = [];
    console.log('process outOfServiceFeatures : '+outOfServiceFeatures.length);
    for (var i = 0; i < outOfServiceFeatures.length; i++) {
      var f = outOfServiceFeatures[i];
      var crd = f.geometry.coordinates;
      var lon = crd[0];
      var lat = crd[1];
      var terminalId = f.properties.terminalId;
      var title = terminalId;
      var model = f.properties.model;
      var time = f.properties.time;
      //var mac = f.properties.macAddress;
      var marker;
      if (f.properties.topper != null) {
        marker = L.marker(new L.LatLng(lat, lon), {'title': title, icon: alltmIcon});
      } else {
        marker = L.marker(new L.LatLng(lat, lon), {'title': title, icon: atmIcon});
      }
      //marker.mac = mac;
      marker.terminalId = terminalId;
      marker.lon = lon;
      marker.lat = lat;
      marker.model = model;
      marker.on('click',
        function (event) {
          if (this.mac === undefined) {
            // alert('terminalId = ' + this.terminalId);
            var alltmTerminal = "/alltm/alltmTerminal?terminalId=" + this.terminalId;
            var mkr = this;
            $.getJSON(alltmTerminal, function (vj) {
              console.log("alltmTerminal no mac");
              // POP up what ever you want!
              mkr.bindPopup('<h4>Kiosk Details</h4>' +
                '<span id="bold">Title: </span>' + mkr.terminalId + '<br>' +
                '<span id="bold">Lon: </span>' + mkr.lon + '<br>' +
                '<span id="bold">Lat: </span>' + mkr.lat + '<br>' +
                '<span id="bold">Address: </span>' + vj.place + '<br>' +
                '<span id="bold">Zip/Postal: </span>' + vj.zip + '<br>').openPopup();

            });
          }
        }
      );
      outOfServiceArray.push(marker);
      //markerArray.push(marker);
    }
    console.log('adding to outOfService : '+outOfServiceArray.length);
    outOfService.addLayers(outOfServiceArray);
  }


  function loadSync() {
    for (var i=0; i < hashList.length; i++) {
      var hash = hashList[i];
      // gregm use a Web Worker here
      //$.delay(1);
      console.log('loadAtmList chartData2 : '+hash);

      $.getJSON(atmlistByHash+hash, function(j2){
        // alert("adding "+j2.features.length);
        //var markerArray = [];

        for (var i=0; i <  j2.features.length; i++)  {
          var f = j2.features[i];
          var crd = f.geometry.coordinates;
          var lon = crd[0];
          var lat = crd[1];
          var terminalId = f.properties.terminalId;
          var title = terminalId;
          var model = f.properties.model;
          var time = f.properties.time;
          var mac = f.properties.macAddress;
          var marker;
          if (f.properties.topper != null) {
            marker = L.marker(new L.LatLng(lat, lon), { 'title' : title, icon : alltmIcon  });
          } else {
            marker = L.marker(new L.LatLng(lat, lon), { 'title' : title, icon : atmIcon  });
          }
          marker.mac = mac;
          marker.terminalId = terminalId;
          marker.lon = lon;
          marker.lat = lat;
          marker.model = model;
          marker.on('click',
            function (event) {
              if (this.mac === undefined) {
                // alert('terminalId = ' + this.terminalId);
                var alltmTerminal = "/alltm/alltmTerminal?terminalId=" + this.terminalId;
                var mkr = this;
                $.getJSON(alltmTerminal, function(vj) {
                  console.log("alltmTerminal no mac");
                  // POP up what ever you want!
                  mkr.bindPopup('<h4>Kiosk Details</h4>' +
                    '<span id="bold">Title: </span>' + mkr.terminalId + '<br>' +
                    '<span id="bold">Lon: </span>' + mkr.lon + '<br>' +
                    '<span id="bold">Lat: </span>' + mkr.lat + '<br>' +
                    '<span id="bold">Address: </span>' + vj.place + '<br>' +
                    '<span id="bold">Zip/Postal: </span>' + vj.zip + '<br>' ).openPopup();

                });
              } else {
                var visitByAlltm = "/alltmVisit/visitsByAlltm?mac=" + this.mac;
                var alltmMetrics = "/alltmVisit/alltmMetrics?mac=" + this.mac;
                var alltmTerminal = "/alltm/alltmTerminal?terminalId=" + this.terminalId;
                var mkr = this;
                var address = {};
                $.getJSON(alltmTerminal, function(tr) {
                  console.log("alltmTerminal mac : "+mac);
                  address.place = tr.place;
                  address.zip = tr.zip;

                  $.getJSON(alltmMetrics, function(m) {
                    mkr.checkins = m.checkins;
                    mkr.coupons = m.coupons;
                    mkr.uniqueUsers = m.uniqueUsers;
                    mkr.lastCheckIn = m.lastCheckIn;

                    $.getJSON(visitByAlltm, function (vj) {
                      // alert('vj: ' + vj.total + 'male:' + vj.male + '<br>' + 'female:' + vj.female + '<br>' + 'group' + vj.group);

                      // var popup = L.popup() .setLatLng(latlng) .setContent('<p>Hello world!<br />This is a nice popup.</p>') .openOn(map);
                      var alltmDetails = '<div id="cropped"><h4>Kiosk Details</h4>' +
                        '<span id="bold">Title: </span>' + mkr.terminalId + '<br>' +
                        '<span id="bold">Lon: </span>' + mkr.lon + '<br>' +
                        '<span id="bold">Lat: </span>' + mkr.lat + '<br>' +
                        '<span id="bold">Address: </span>' + address.place + '<br>' +
                        '<span id="bold">Zip/Postal: </span>' + address.zip + '<br>' +
                        '<span id="bold">Unique Users: </span>' +mkr.uniqueUsers + '<br>' +
                        '<span id="bold">User Checkins: </span>' +mkr.checkins + '<br>' +
                        '<span id="bold">Coupons Redemption: </span>' +mkr.coupons +
                        '<h4>Camera Visit Information</h4>' +
                        '<span id="bold">Total Visitors: </span>' + vj.total + '<br>' +
                        '<span id="bold">Men: </span>' + vj.male + '<br>' +
                        '<span id="bold">Women: </span>' + vj.female + '<br>' +
                        '<span id="bold">Groups: </span>' + vj.group;
                      if (isOps) {
                        alltmDetails +=
                          '<h4>Monitoring Status</h4>' +
                          '<span id="bold">Hive Mgr Last Checkin: </span>' + mkr.lastCheckIn + ' <br>' +
                            //'<span id="bold">Manager: </span>XXXXXX' + '<br>' +
                            //'<span id="bold">Player: </span>XXXXXX' + '<br>' +
                            //'<span id="bold">Player Last Checkin: </span>XXXXX' + '<br>' +
                            //'<span id="bold">Play Count: </span>XXXXXX' + '<br>' +
                          '<span style="margin-top: 10px;"><a href="/kiosk/detailreport/' + mkr.terminalId + '">' +
                          '<input id="alltmDetails" type="button" class="btn btn-small btn-primary btn-block" value="View Details"/></a></span></div>'
                      }
                      mkr.bindPopup(
                        alltmDetails
                      ).openPopup();
                    });
                  });
                });
              }
            }
          );

//          markerList.push(marker);
        }
//        markers.addLayers(markerList);
      });
      condition = false;
      //check();
    }
  }

  function loadASync() {

    w = new Worker('/chartData/pageLoad.js');
    var args = {};
    args.hashList = hashList;
    args.atmlistByHash = atmlistByHash;
    //args.markerList = markerList;
    args.alltmIcon = alltmIcon;
    args.atmIcon = atmIcon;

//    args.$ = $;
    w.postMessage({ 'state' : 'start', 'args': args });

    w.onmessage = function(event) {
      var eData = event.data;
      if (eData.complete) {
        w.terminate();
        w = null;
        //console.log("loadAsync worker complete , markerList : "+markerList.length);
        //markers.addLayers(markerList);
        condition = false;
        //check();
      } else {

        var hash = eData.hash;
        var def = $.Deferred(function() {

          console.log("deferred calling getJSON() for : "+atmlistByHash+hash);
          $.getJSON(atmlistByHash+hash, function(j2) {
            var markerArray = [];
            console.log("loadAsync data received for : " + hash + " length : " + j2.features.length + " time : " + (new Date()));
            for (var i = 0; i < j2.features.length; i++) {
              try {
                var f = j2.features[i];
                var crd = f.geometry.coordinates;
                var lon = crd[0];
                var lat = crd[1];
                var terminalId = f.properties.terminalId;
                var title = terminalId;
                var model = f.properties.model;
                var time = f.properties.time;
                var mac = f.properties.macAddress;
                var marker;
                if (f.properties.topper != null) {
                  marker = L.marker(new L.LatLng(lat, lon), {'title': title, icon: alltmIcon});
                } else {
                  marker = L.marker(new L.LatLng(lat, lon), {'title': title, icon: atmIcon});
                }
                marker.mac = mac;
                marker.terminalId = terminalId;
                marker.lon = lon;
                marker.lat = lat;
                marker.model = model;
                marker.on('click',
                  function (event) {
                    if (this.mac === undefined) {
                      // alert('terminalId = ' + this.terminalId);
                      console.log("alltmTerminal no mac");
                      var alltmTerminal = "/alltm/alltmTerminal?terminalId=" + this.terminalId;
                      var mkr = this;
                      $.getJSON(alltmTerminal, function (vj) {
                        // POP up what ever you want!
                        console.log("alltmTerminal no mac event!");
                        mkr.bindPopup('<h4>Kiosk Details</h4>' +
                          '<span id="bold">Title: </span>' + mkr.terminalId + '<br>' +
                          '<span id="bold">Lon: </span>' + mkr.lon + '<br>' +
                          '<span id="bold">Lat: </span>' + mkr.lat + '<br>' +
                          '<span id="bold">Address: </span>' + vj.place + '<br>' +
                          '<span id="bold">Zip/Postal: </span>' + vj.zip + '<br>').openPopup();

                      });
                    } else {
                      var visitByAlltm = "/alltmVisit/visitsByAlltm?mac=" + this.mac;
                      var alltmMetrics = "/alltmVisit/alltmMetrics?mac=" + this.mac;
                      var alltmTerminal = "/alltm/alltmTerminal?terminalId=" + this.terminalId;
                      var mkr = this;
                      var address = {};
                      console.log("alltmTerminal mac : " + mac);
                      $.getJSON(alltmTerminal, function (tr) {
                        console.log("alltmTerminal mac : " + mac + " event!");
                        address.place = tr.place;
                        address.zip = tr.zip;

                        $.getJSON(alltmMetrics, function (m) {
                          mkr.checkins = m.checkins;
                          mkr.coupons = m.coupons;
                          mkr.uniqueUsers = m.uniqueUsers;
                          mkr.lastCheckIn = m.lastCheckIn;

                          $.getJSON(visitByAlltm, function (vj) {
                            // alert('vj: ' + vj.total + 'male:' + vj.male + '<br>' + 'female:' + vj.female + '<br>' + 'group' + vj.group);

                            // var popup = L.popup() .setLatLng(latlng) .setContent('<p>Hello world!<br />This is a nice popup.</p>') .openOn(map);
                            var alltmDetails = '<div id="cropped"><h4>Kiosk Details</h4>' +
                              '<span id="bold">Title: </span>' + mkr.terminalId + '<br>' +
                              '<span id="bold">Lon: </span>' + mkr.lon + '<br>' +
                              '<span id="bold">Lat: </span>' + mkr.lat + '<br>' +
                              '<span id="bold">Address: </span>' + address.place + '<br>' +
                              '<span id="bold">Zip/Postal: </span>' + address.zip + '<br>' +
                              '<span id="bold">Unique Users: </span>' + mkr.uniqueUsers + '<br>' +
                              '<span id="bold">User Checkins: </span>' + mkr.checkins + '<br>' +
                              '<span id="bold">Coupons Redemption: </span>' + mkr.coupons +
                              '<h4>Camera Visit Information</h4>' +
                              '<span id="bold">Total Visitors: </span>' + vj.total + '<br>' +
                              '<span id="bold">Men: </span>' + vj.male + '<br>' +
                              '<span id="bold">Women: </span>' + vj.female + '<br>' +
                              '<span id="bold">Groups: </span>' + vj.group;
                            if (isOps) {
                              alltmDetails +=
                                '<h4>Monitoring Status</h4>' +
                                '<span id="bold">Hive Mgr Last Checkin: </span>' + mkr.lastCheckIn + ' <br>' +
                                  //'<span id="bold">Manager: </span>XXXXXX' + '<br>' +
                                  //'<span id="bold">Player: </span>XXXXXX' + '<br>' +
                                  //'<span id="bold">Player Last Checkin: </span>XXXXX' + '<br>' +
                                  //'<span id="bold">Play Count: </span>XXXXXX' + '<br>' +
                                '<span style="margin-top: 10px;"><a href="/kiosk/detailreport/' + mkr.terminalId + '">' +
                                '<input id="alltmDetails" type="button" class="btn btn-small btn-primary btn-block" value="View Details"/></a></span></div>'
                            }
                            mkr.bindPopup(
                              alltmDetails
                            ).openPopup();
                          });
                        });
                      });
                    }
                  }
                );

                markerArray.push(marker);
              } catch(e) {
                console.log(e);
              }

            }
            markers.addLayers(markerArray);
            //markerList = markerList.concat(markerArray);
            console.log('finished for hash : '+hash+'  length : '+markerArray.length+" time : "+(new Date()));
            w.postMessage({ 'state' : 'next'});
          });
        });
        //Return the promise object (an "immutable" Deferred object for consumers to use)
        return def.promise();
      }
    }
    // TODO : add markerList layer here or later
//    markers.addLayers(markerList);

  }

  // determine if we filter by alltm's only
  function shouldFilterByAlltm() {
    if (window.location.href.indexOf('showAll') != -1) {
        return false;
    }
    return true;
  }

  L.Map.addInitHook( function () {
    
    var that = this
    ,   h
    ;
    
    if (that.on)
    {
        that.on( 'click',    check_later );
        that.on( 'dblclick', function () { setTimeout( clear_h, 0 ); } );
    }
    
    function check_later( e )
    {
        clear_h();
        
        h = setTimeout( check, 500 );
        
        function check()
        {
            that.fire( 'singleclick', L.Util.extend( e, { type : 'singleclick' } ) );
        }
    }
    
    function clear_h()
    {
        if (h != null)
        {
            clearTimeout( h );
            h = null;
        }
    }
    
  });
    L.AwesomeMarkers.Icon.prototype.options.prefix = 'ion';
    var redMarker = L.AwesomeMarkers.icon({
        icon: 'star',
        markerColor: 'red'
    });
    var marker;
//    icon: L.AwesomeMarkers.icon({
//        icon: 'star',
//        markerColor: 'red'
//    })                                 
    var map = L.map('map', {
        center: [39.82, -98],
        zoom: 4,
        zoomControl: true
    });
    map.options.singleClickTimeout = 250;
    function onMapClick(e) {
        //    gib_uni();
//        var marker = new L.marker(e.latlng, {id:uni, icon:redIcon, draggable:'true'});
//                                  {id:'loc', icon:redIcon, draggable:'true'}
        console.log('creating marker');
        if (marker) {
            map.removeLayer(marker);
            marker = L.marker(e.latlng, { icon: redMarker, draggable:'true' });
        } else {
            marker = L.marker(e.latlng, { icon: redMarker, draggable:'true' });
        }
        console.log('adding dragend listener to marker');
        marker.on('dragend', function(event){
                var marker = event.target;
                var position = marker.getLatLng();
//                alert(position);
                marker.setLatLng([position],{id:'location',draggable:'true'}).bindPopup(position).update();
                setLatLon(position);
        });
        console.log('adding marker to map');
        setLatLon(marker.getLatLng(), map.getZoom());
        map.addLayer(marker);
        
//        popup
//        .setLatLng(e.latlng)
//        .setContent("Location " + e.latlng.toString())
//        .openOn(map);
    };
   
//    marker.on('dragend', function(event){
//        var marker = event.target;
//        var position = marker.getLatLng();
//        alert(position);
//        marker.setLatLng([position],{id:uni,draggable:'true'}).bindPopup(position).update();
//    });
    
  map.on('singleclick', onMapClick);
  var defaultLayer = L.tileLayer.provider('OpenStreetMap.Mapnik').addTo(map);
    
  // var defaultLayer = L.tileLayer.provider('Acetate').addTo(map);

  // D3 with Leaflet layer
  /*
  var svg = d3.select(map.getPanes().overlayPane).append("svg"),
      g = svg.append("g").attr("class", "leaflet-zoom-hide");
  */
  /*
  d3.json("/chartData/us-states.json", function(collection) {

    var transform = d3.geo.transform({point: projectPoint}),
        path = d3.geo.path().projection(transform);

    var feature = g.selectAll("path")
      .data(collection.features)
      .enter().append("path");

    map.on("viewreset", reset);

    reset();

    // Reposition the SVG to cover the features.
    function reset() {
      var bounds = path.bounds(collection),
          topLeft = bounds[0],
          bottomRight = bounds[1];

      svg.attr("width", bottomRight[0] - topLeft[0])
          .attr("height", bottomRight[1] - topLeft[1])
          .style("left", topLeft[0] + "px")
          .style("top", topLeft[1] + "px");

      g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");

      feature.attr("d", path);
    }

    // Use Leaflet to implement a D3 geometric transformation.
    function projectPoint(x, y) {
      var point = map.latLngToLayerPoint(new L.LatLng(y, x));
      this.stream.point(point.x, point.y);
    }
  });
  */

  // Check browser support
  map.scrollWheelZoom.disable();
  //if (typeof(Storage) !== "undefined") {
  //  // Store
  //  try {
  //    var isf = localStorage.getItem("inServiceFeatures");
  //    if (isf) {
  //      inServiceFeatures = JSON.parse(isf);
  //    }
  //    var oosf = localStorage.getItem("outOfServiceFeatures");
  //    if (oosf) {
  //      outOfServiceFeatures = JSON.parse(oosf);
  //    }
  //    console.log('loading - inServiceFeatures exists : ' + (typeof inServiceFeatures != 'undefined'));
  //  } catch (e) {
  //    localStorage.removeItem("inServiceFeatures");
  //    localStorage.removeItem("outOfServiceFeatures");
  //  }
  //}
  //
  //console.log("retreiving inService");
  //inService = $( document ).inService;
  //outOfService =  $( document ).outOfService;

  //if (inService) {
  //  map.addLayer(inService);
  //} else {
  //  console.log("didn't find inService");
    
//    inService = L.markerClusterGroup({ chunkedLoading: true, chunkSize:10000 });
//    outOfService = L.markerClusterGroup({ chunkedLoading: true, chunkSize:10000, chunkProgress: updateProgressBar});
//    map.addLayer(inService);
    
//    loadInService();
//    loadAll();
  //}
  //if (inServiceFeatures) {
  //  processInServiceFeatures();
  //  processOutOfServiceFeatures();
  //} else {
    inServiceFeatures = [];
    outOfServiceFeatures = [];
    //loadInService();
    //loadAll();
  //}


////  markers = L.markerClusterGroup();
//  inService = L.markerClusterGroup({ chunkedLoading: true, chunkSize:10000 });
//    //, chunkProgress: updateProgressBar });
//  outOfService = L.markerClusterGroup({ chunkedLoading: true, chunkSize:10000});
//  //, chunkProgress: updateProgressBar });
//
//  //markers = L.markerClusterGroup({ chunkedLoading: true, chunkProgress: updateProgressBar });
//  // , chunkProgress: updateProgressBar
//  markerList = [];
//  //map.addLayer(markers);
//  map.addLayer(inService);
////  map.addLayer(outOfService);
//  map.scrollWheelZoom.disable();
//
//
//  loadAll();
////  loadHashList(false);

//});
}