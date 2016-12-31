var i=0;
var hashList = null;
var atmlistByHash = null;
var markerList = null;
var alltmIcon = null;
var atmIcon = null;
var complete = false;
var total = 0;
var page = 0;
var wait = 0;

// not being used right now
function timedCount() {
    if (i >= hashList.length) {
      complete = true;
      postMessage({ 'complete' : complete})
    }  else {
      var hash = hashList[i];
      postMessage({ 'complete':complete, 'hash' : hash});
      //console.log('loadAtmList worker : ' + hash);
      setTimeout("timedCount()", 3000);
      i++;
    }
}
// the real signal to the marker loader
function signal() {
  var index = i*page;
  i++;
  postMessage({'complete': complete, 'index' : index });
  //console.log('loadAtmList worker , index : ' + index);
}

// send complete message or defer
function next() {
  //console.log('worker message next');
  var index = i*page;
  if (index >= total) {
  //if (i >= hashList.length) {
    complete = true;
    postMessage({ 'complete' : complete})
  }  else {
    setTimeout(signal, 1);

    //// when the index is a multiple of 10000, set the wait flag
    //if (!wait && index == 30000) {
    //  wait = 1;
    //}
    //if (wait == 1) {
    //  wait = 2;
    //  console.log('waiting 10 seconds');
    //  setTimeout(next, 10000);
    //} else {
    //  wait = 0;
    //}
  }
}

self.addEventListener("message", function(e) {
  var state = e.data.state;
  switch (state) {
    case 'start':
      //console.log('worker message start');
      args = e.data.args;
      hashList = args.hashList;
      atmlistByHash = args.atmlistByHash;
      markerList = args.markerList;
      alltmIcon = args.alltmIcon;
      atmIcon = args.atmIcon;
      total = args.total;
      page = args.page;
      // fall through to start the process
    case 'next':
      next();
      break;

  }
//  $ = args.$;
//  timedCount();
}, false);
//console.log('... timedPageLoad()')
