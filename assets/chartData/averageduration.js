$( document ).ready(function() {

    var m = {top: 10, right: 10, bottom: 40, left: 45},
        w = parseInt(d3.select('#duration').style('width'), 10),
        w = w - m.left - m.right,
        h = 295, 
        // color = d3.scale.category10();
        color = d3.scale.category20c(),
        percent = d3.format('%');

    var format = d3.format(",.0f");

    var x = d3.scale.linear().range([0, w]),
        y = d3.scale.ordinal().rangeRoundBands([0, h], .1);

    var xAxis = d3.svg.axis().scale(x).orient("top").tickSize(-h).ticks(4).tickFormat(d3.format("s")),
        yAxis = d3.svg.axis().scale(y).orient("left").tickSize(0);

    var svg = d3.select("#duration").append("svg")
        .attr("width", w + m.right + m.left)
        .attr("height", h + m.top + m.bottom)
        .append("g")
        .attr("transform", "translate(" + m.left + "," + m.top + ")");

    d3.json("/alltmVisit/visitAvgDuration", function(data) {

        // Parse numbers, and sort by Seconds.
        //data.forEach(function(d) { d.Seconds = +d.Seconds; });
        //data.sort(function(a, b) { return b.Seconds - a.Seconds; });

        // Set the scale domain.
        x.domain([0, d3.max(data, function(d) { return d.value; })]);
        y.domain(data.map(function(d) { return d.label; }));

        var bar = svg.selectAll("g.bar")
            .data(data)
        .enter().append("g")
            .attr("class", "bar")
            .attr("transform", function(d) {
                return "translate(15," + y(d.label) + ")";
            });

        bar.append("rect")
          .attr("width", function(d) { return x(d.value); })
          .attr("height", y.rangeBand())
          .attr("fill", function(d, i) { 
                return color(i); 
            } );

        bar.append("text")
          .attr("class", "Seconds")
          .attr("x", function(d) { return x(d.value); })
          .attr("y", y.rangeBand() / 2)
          .attr("dx", -10)
          .attr("dy", ".35em")
          .attr("text-anchor", "end")
          .text(function(d) { return format(d.value); });

        svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(" + 15 + "," + 0 + ")")
          .call(xAxis);

        svg.append("g")
          .attr("class", "y axis")
          .call(yAxis);

    });

}); 
