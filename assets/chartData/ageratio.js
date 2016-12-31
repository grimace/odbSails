$( document ).ready(function() {

 
    svg = d3.select("svg");
    art = d3.select("#art");
    labels = d3.select("#labels");

    var m = {top: 0, right: 0, bottom: 0, left: 0},
        w = parseInt(d3.select('#age').style('width')),
        h = parseInt(d3.select('#age').style('height'));

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
            width: parseInt(d3.select('#age').style('width'))
        });

    svgw = parseInt(d3.select('svg').style('width'));

    // This translate property moves the origin of the group's coordinate
    // space to the center of the SVG element, saving us translating every
    // coordinate individually. 
    art.attr("transform", "translate(" + (svgw / 2) + "," + (150) + ")");
    labels.attr("transform", "translate(" + (svgw / 2) + "," + (150) + ")");

    d3.json("/devicemetrics/deviceType", function(error, data) {
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
