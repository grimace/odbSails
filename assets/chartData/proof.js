$( document ).ready(function() {
    function tabulate(data, columns) {
        // var margin = {top: 0, right: 10, bottom: 40, left: 40},
        //     width = parseInt(d3.select('#container').style('width'), 10),
        //     width = width - margin.left - margin.right;

        // var height = 300;
        $( "table" ).remove();
        // var svg = d3.select("#example-section9 #flotcontainer").append("svg")
        //     .attr("width", width + margin.left + margin.right)
        //     .attr("height", height + margin.top + margin.bottom)
        //     .append("g")
        //     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        var table = d3.select("#container").append("table")
            // .attr("width", width + margin.left + margin.right)
            // .attr("height", height + margin.top + margin.bottom),
            thead = table.append("thead"),
            tbody = table.append("tbody");


        // append the header row
        thead.append("tr")
            .selectAll("th")
            .data(columns)
            .enter()
            .append("th")
            .text(function(column) { return column; });

        // create a row for each object in the data
        var rows = tbody.selectAll("tr")
            .data(data.results)
            .enter()
            .append("tr");

        // create a cell in each row for each column
        var cells = rows.selectAll("td")
            .data(function(row) {
                return columns.map(function(column) {
                    return {column: column, value: row[column]};
                });
            })
            .enter()
            .append("td")
            .text(function(d) { return d.value; });


        
        return table;
    }

    var updatePOPLog = function(pageNum) {
        var uri = "/proofOfPlay/popLog?index=" + pageNum;
        var pop = $.getJSON(uri, function(data) {
            var d = {};
            d.page = (data.page + 1);
            d.currentCount = data.currentCount;
            d.totalPages = data.totalPages;
            d.results = [];
            for (i=0; i<data.pops.length;i++) {
                var row = {};
                row.alltmId = data.pops[i].id;
                var start = new Date(data.pops[i].start);
                row.startTime = start;
                var end = new Date(data.pops[i].end);
                row.endTime = end;
                row.duration = calculateDuration(start, end) + " sec";
                row.campaignId = "AllTM";
                row.mediaName = data.pops[i].mediaName;
                d.results.push(row);
            }

            var popTable = tabulate(d, ["alltmId", "startTime", "endTime", "duration", "campaignId", "mediaName"]);
            // uppercase the column headers
            popTable.selectAll("thead th")
                .text(function(column) {
                    return column.charAt(0).toUpperCase() + column.substr(1);
                });

       } );

    }

    // This should be cleaned up somehow.....
    var pageCount;
    var uri = "/proofOfPlay/count";
    $.getJSON(uri, function(data) {
        pageCount  = data.count;
        options.totalPages = pageCount;
        $('#paginate').bootstrapPaginator(options);
    } );


    updatePOPLog(1);

    function calculateDuration(startTime, endTime) {
        var difference = endTime - startTime;
        return difference/1000;
    }
    var options = {
        currentPage:   1,
        totalPages:   pageCount,
        numberOfPages: 5,
        size: 'normal',
        useBootstrapTooltip:true,
        onPageClicked: function(e,originalEvent,type,page){
            updatePOPLog(page);
        }
    }

    $('#paginate').bootstrapPaginator(options);

});