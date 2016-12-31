$( document ).ready(function() {


    var m = {top: 10, right: 20, bottom: 0, left: 90},
        w = parseInt(d3.select('#visits').style('width'), 10),
        w = w - m.left - m.right,
        h = 300,
    // color = d3.scale.category10();
        color = d3.scale.category20c(),
        percent = d3.format('%');

    var format = d3.format(",.0f");

    var x = d3.scale.linear().range([0, w]),
        y = d3.scale.ordinal().rangeRoundBands([0, h], .1);

    var xAxis = d3.svg.axis().scale(x)
            .orient("top").tickSize(-h)
            .ticks(5)
            .tickFormat(d3.format("s")),
        yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .tickSize(0);

    var svg = d3.select("#visits").append("svg")
        .attr("width", w + m.right + m.left)
        .attr("height", h + m.top + m.bottom)
        .append("g")
        .attr("transform", "translate(" + m.left + "," + m.top + ")");

    d3.json("/alltmVisit/visitPerDay", function(data) {

        // Set the scale domain.
        x.domain([0, d3.max(data, function(d) { return d.visit; })]);
        y.domain(data.map(function(d) { return d.start; }));

        var bar = svg.selectAll("g.bar")
            .data(data)
            .enter().append("g")
            .attr("class", "bar")
            .attr("transform", function(d) {
                return "translate(15," + y(d.start) + ")";
            });

        bar.append("rect")
            .attr("width", function(d) { return x(d.visit); })
            .attr("height", y.rangeBand())
            .attr("fill", function(d, i) {
                return color(i);
            } );

        bar.append("text")
            .attr("class", "Seconds")
            .attr("x", function(d) { return x(d.visit); })
            .attr("y", y.rangeBand() / 2)
            .attr("dx", -3)
            .attr("dy", ".35em")
            .attr("text-anchor", "end")
            .text(function(d) { return format(d.visit); });

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(" + 15 + "," + 0 + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);

    });

}); 