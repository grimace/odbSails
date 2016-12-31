$( document ).ready(function() {


  var w = parseInt(d3.select('#bubbles').style('width'));
  var h = parseInt(d3.select('#bubbles').style('height'));

  var diameter = w/1.2,
      format = d3.format(",d"),
      color = d3.scale.category20c();

  var bubble = d3.layout.pack()
      .sort(null)
      .size([diameter, diameter])
      .padding(5);

  var svg = d3.select("#bubbles").append("svg")
      .attr("width", diameter)
      .attr("height", diameter)
      .attr("class", "bubble");
  
  $.getJSON('/budget/api/report', function(bdata) {
      // build the table
      var bs = bdata.children;
      if (bs.length == 0) {
        $("#bubbles").empty();
        $("#bubbles").prepend('No Data.');
        return;
      }
      
      // Create The Bubble Chart
      var node = svg.selectAll(".node")
          .data(bubble.nodes(classes(bdata))
          .filter(function(d) { return !d.children; }))
        .enter().append("g")
          .attr("class", "node")
          .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
  
      node.append("title")
          .text(function(d) { return d.className + ": " + format(d.value); });
  
      node.append("circle")
          .attr("r", function(d) { return d.r; })
          .style("fill", function(d) { return color(d.packageName); });
  
      node.append("text")
          .attr("dy", ".3em")
          .style("text-anchor", "middle")
          .text(function(d) { return d.className.substring(0, d.r / 3); });
      
      // Returns a flattened hierarchy containing all leaf nodes under the root.
      function classes(root) {
        var classes = [];
    
        function recurse(name, node) {
          if (node.children) node.children.forEach(function(child) { recurse(node.name, child); });
          else classes.push({packageName: name, className: node.name, value: node.size});
        }
    
        recurse(null, root);
        return {children: classes};
      }
    
      d3.select(self.frameElement).style("height", diameter + "px");
    
      var dataHeight = parseInt(d3.select('#bubbles').style('height'));
    
      $( '#data' ).height( dataHeight );
    
      $(window).bind('resize',function(){
           window.location.href = window.location.href;
      });
  });
  
  // Build the table
  $.getJSON('/budget/api/reportromi', function(data) {
      for (key in data) {
          $('<tr>').append('<td>' + key + '</td>')
                   .append('<td> </td>')
                   .append('<td> ' + formatCurrency(data[key].amount, '$') + ' </td>')
                   .append('<td> ' + formatCurrency(data[key].romi, '$') + ' </td>')
                   .append('</tr>').appendTo('#budgetTable');
        
          $.each(data[key].polist, function(i, item) {
              $('<tr>').append('<td> </td>' )
                       .append('<td> ' + item.name + '</td>')
                       .append('<td> ' + formatCurrency(item.amount, '$') + '</td>')
                       .append('<td> </td>')
                   .append('</tr>').appendTo('#budgetTable');

          });
      }
  });
  
}); 
