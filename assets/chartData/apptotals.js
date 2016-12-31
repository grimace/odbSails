$( document ).ready(function() {

    svg.selectAll("text.title")
        .data(dataset)
        .enter()
        .append("text")
        .attr("class", "title")
        .text(function(d){
            return d.metric;
        })
        .attr("y",function(d,i){
            return meshy[i] + meshsize/2 + 20;
        })
        .attr("x", function(d,i){
            return meshx[i] + meshsize/2 ;
        })
        .attr("font-size",25)
        .attr("font-family","serif")
        .attr("text-anchor","middle")
        .attr("font-weight","bold");

    svg.selectAll("text.value")
        .data(dataset)
        .enter()
        .append("text")
        .attr("class", "value")
        .text(function(d){
            return d.value;
        })
        .attr("y",function(d,i){
            return meshy[i] + meshsize/2 + 20;
        })
        .attr("x", function(d,i){
            return meshx[i] + meshsize/2 ;
        })
        .attr("font-size",25)
        .attr("font-family","serif")
        .attr("text-anchor","middle")
        .attr("font-weight","bold");

}); 
