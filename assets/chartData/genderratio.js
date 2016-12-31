$( document ).ready(function() {

    // d3.json("/alltmVisit/visitsByNetwork", function(error, data) {
    //     if (error) return console.warn(error);

    //     var margin = {top: 0, right: 0, bottom: 0, left: 0},
    //         w = parseInt(d3.select('#gender').style('width'), 10),
    //         w = w - margin.left - margin.right,
    //         h = w, 
    //         r = w/2,
    //         // color = d3.scale.category10(),
    //         color = d3.scale.category20(),
    //         percent = d3.format('%');

    //     var vis = d3.select("#gender")
    //         .append("svg:svg")                                  //create the SVG element inside the <body>
    //         .data([data])                                       //associate our data with the document
    //         .attr("width", w)                                   //set the width and height of our visualization (these will be attributes of the <svg> tag
    //         .attr("height", h)
    //         .attr("viewBox", "0 0 " + w + " " + h)
    //         .append("svg:g")                                        //make a group to hold our pie chart
    //         .attr("perserveAspectRatio", 'xMidYMid')
    //         .attr("transform", "translate(" + r + "," + r + ")")    //move the center of the pie chart from 0, 0 to radius, radius
     
    //     var chart = $("#gender svg"),
    //         aspect = chart.width() / chart.height(),
    //         pc = "#gender";

    //     var arc = d3.svg.arc()                                  //this will create <path> elements for us using arc data
    //         .outerRadius(r);
     
    //     var pie = d3.layout.pie()                               //this will create arc data for us given a list of values
    //         .value(function(d) { return d.value; });            //we must tell it out to access the value of each element in our data array
     
    //     var arcs = vis.selectAll("g.slice")                     //this selects all <g> elements with class slice (there aren't any yet)
    //         .data(pie)                                          //associate the generated pie data (an array of arcs, each having startAngle, endAngle and value properties) 
    //         .enter()                                            //this will create <g> elements for every "extra" data element that should be associated with a selection. The result is creating a <g> for every object in the data array
    //         .append("svg:g")                                    //create a group to hold each slice (we will have a <path> and a <text> element associated with each slice)
    //         .attr("class", "slice");                            //allow us to style things in the slices (like text)
     
    //     arcs.append("svg:path")
    //         .attr("fill", function(d, i) { 
    //             return color(i); 
    //         } )                                                 //set the color for each slice to be chosen from the color function defined above
    //         .attr("d", arc);                                    //this creates the actual SVG path using the associated data (pie) with the arc drawing function
    

    //     arcs.append("svg:text")                                 //add a label to each slice
    //         .attr("transform", function(d) {                    //set the label's origin to the center of the arc
    //             d.innerRadius = w/4;                              //we have to make sure to set these before calling arc.centroid
    //             d.outerRadius = r;                              //we have to make sure to set these before calling arc.centroid
    //             return "translate(" + arc.centroid(d) + ")";    //this gives us a pair of coordinates like [50, 50]
    //         })
    //     .attr("text-anchor", "middle")                          //center the text on it's origin
    //     .text(function(d, i) { return data[i].label; });        //get the label from our original data array

    // });

    svg = d3.select("svg");
    // canvas = d3.select("#canvas");
    art = d3.select("#art");
    labels = d3.select("#labels");
    // h = parseInt(d3.select('#gender').style('height'));
    // w = parseInt(d3.select('#gender').style('width'));

    // var m = {top: 0, right: 0, bottom: 0, left: 0},
    //     w = parseInt(d3.select('#gender').style('height')),
    //     w = w - m.left - m.right,
    //     h = 300;

    var m = {top: 0, right: 0, bottom: 0, left: 0},
        w = parseInt(d3.select('#gender').style('width')),
        h = parseInt(d3.select('#gender').style('height'));

    if (w >= h) {
        u = h;
        u = u - m.top - m.bottom;
        // alert("using height: " + u);
    } 
    else if (w < h) {
        u = w;
        u = u - m.left - m.right;
        // alert("using width: " + u);
    }

    // Create the pie layout function.
    // This function will add convenience
    // data to our existing data, like 
    // the start angle and end angle
    // for each data element.
    pie = d3.layout.pie()
    pie.value(function (d, i) {
        // Tells the layout function what
        // property of our data object to
        // use as the value.
        return d.value;
    });

    // Store our chart dimensions
    cDim = {
        height: 300,
        width: u,
        innerRadius: 0,
        // outerRadius: u/2,
        labelRadius: u/2.5
    }

    // Set the size of our SVG element
    svg.attr({
            height: cDim.height,
            width: parseInt(d3.select('#gender').style('width'))
        });

    svgw = parseInt(d3.select('svg').style('width'));

    // alert("svg width: " + svgw);

    // var svg = d3.select("#gender").append("svg")
    //     .attr("width", w + m.right + m.left)
    //     .attr("height", h + m.top + m.bottom)
    //     .append("g")
    //     .attr("transform", "translate(" + m.left + "," + m.top + ")");


    // This translate property moves the origin of the group's coordinate
    // space to the center of the SVG element, saving us translating every
    // coordinate individually. 
    art.attr("transform", "translate(" + (svgw / 2) + "," + (150) + ")");
    labels.attr("transform", "translate(" + (svgw / 2) + "," + (150) + ")");

    d3.json("/alltmVisit/visitsByNetwork", function(error, data) {
        if (error) return console.warn(error);

        pied_data = pie(data);

        // The pied_arc function we make here will calculate the path
        // information for each wedge based on the data set. This is 
        // used in the "d" attribute.
        pied_arc = d3.svg.arc()
            .innerRadius(0)
            .outerRadius(w/5);

        // COLOR ORDINALS
        pied_colors = d3.scale.category10();

        // Let's start drawing the arcs.
        enteringArcs = art.selectAll(".wedge").data(pied_data).enter();

        enteringArcs.append("path")
            .attr("class", "wedge")
            .attr("d", pied_arc)
            .style("fill", function (d, i) {
            return pied_colors(i);
        });

        // Now we'll draw our label lines, etc.
        enteringLabels = labels.selectAll(".label").data(pied_data).enter();
        labelGroups = enteringLabels.append("g").attr("class", "label");
        labelGroups.append("circle").attr({
            x: 0,
            y: 0,
            r: 2,
            fill: "#000",
            transform: function (d, i) {
                centroid = pied_arc.centroid(d);
                return "translate(" + pied_arc.centroid(d) + ")";
            },
                'class': "label-circle"
        });

        textLines = labelGroups.append("line").attr({
            x1: function (d, i) {
                return pied_arc.centroid(d)[0];
            },
            y1: function (d, i) {
                return pied_arc.centroid(d)[1];
            },
            x2: function (d, i) {
                centroid = pied_arc.centroid(d);
                midAngle = Math.atan2(centroid[1], centroid[0]);
                x = Math.cos(midAngle) * cDim.labelRadius;
                return x;
            },
            y2: function (d, i) {
                centroid = pied_arc.centroid(d);
                midAngle = Math.atan2(centroid[1], centroid[0]);
                y = Math.sin(midAngle) * cDim.labelRadius;
                return y;
            },
                'class': "label-line"
        });

        textLabels = labelGroups.append("text").attr({
            x: function (d, i) {
                centroid = pied_arc.centroid(d);
                midAngle = Math.atan2(centroid[1], centroid[0]);
                x = Math.cos(midAngle) * cDim.labelRadius;
                sign = (x > 0) ? 1 : -1
                labelX = x + (5 * sign)
                return labelX;
            },
            y: function (d, i) {
                centroid = pied_arc.centroid(d);
                midAngle = Math.atan2(centroid[1], centroid[0]);
                y = Math.sin(midAngle) * cDim.labelRadius;
                return y;
            },
                'text-anchor': function (d, i) {
                centroid = pied_arc.centroid(d);
                midAngle = Math.atan2(centroid[1], centroid[0]);
                x = Math.cos(midAngle) * cDim.labelRadius;
                return (x > 0) ? "start" : "end";
            },
                'class': 'label-text'
        }).text(function (d) {
            return d.data.label
        });

        alpha = 0.5;
        spacing = 12;

        function relax() {
            again = false;
            textLabels.each(function (d, i) {
                a = this;
                da = d3.select(a);
                y1 = da.attr("y");
                textLabels.each(function (d, j) {
                    b = this;
                    // a & b are the same element and don't collide.
                    if (a == b) return;
                    db = d3.select(b);
                    // a & b are on opposite sides of the chart and
                    // don't collide
                    if (da.attr("text-anchor") != db.attr("text-anchor")) return;
                    // Now let's calculate the distance between
                    // these elements. 
                    y2 = db.attr("y");
                    deltaY = y1 - y2;
                    
                    // Our spacing is greater than our specified spacing,
                    // so they don't collide.
                    if (Math.abs(deltaY) > spacing) return;
                    
                    // If the labels collide, we'll push each 
                    // of the two labels up and down a little bit.
                    again = true;
                    sign = deltaY > 0 ? 1 : -1;
                    adjust = sign * alpha;
                    da.attr("y",+y1 + adjust);
                    db.attr("y",+y2 - adjust);
                });
            });
            // Adjust our line leaders here
            // so that they follow the labels. 
            if(again) {
                labelElements = textLabels[0];
                textLines.attr("y2",function(d,i) {
                    labelForLine = d3.select(labelElements[i]);
                    return labelForLine.attr("y");
                });
                setTimeout(relax,20)
            }
        }

        relax();
    });

    // MOVED TO INDEX PAGE AND ADDED TIMER TO RESIZE //
    // $(window).bind('resize',function(){
    //      window.location.href = window.location.href;
    // });

}); 
