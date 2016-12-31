    $( document ).ready(function() {
        //sparkline
        
        var spark1 = [5,6,7,6,5,7,6,4,];
        var spark2 = [5,4,7,4,5,5,6,7,];
        var spark3 = [5,6,5,6,5,9,6,4,];
        var spark4 = [3,6,7,2,5,5,6,4,];
        var spark5 = [5,2,7,6,8,7,6,4,];
        var spark6 = [3,6,7,3,5,7,6,8,];

        $("#sparkline-1").sparkline(spark1, {
            type: 'bar',
            height: '150',
            barWidth: 20,
            zeroAxis: false,
            barColor: '#7c87ad',
            negBarColor: '#7c87ad'
        });
        $("#sparkline-2").sparkline(spark2, {
            type: 'bar',
            height: '150',
            barWidth: 20,
            zeroAxis: false,
            barColor: '#999999',
            negBarColor: '#999999'});
        $("#sparkline-3").sparkline(spark3, {
            type: 'bar',
            height: '150',
            barWidth: 20,
            zeroAxis: false,
            barColor: '#404040',
            negBarColor: '#404040'});
        $("#sparkline-4").sparkline(spark4, {
            type: 'bar',
            height: '150',
            barWidth: 20,
            zeroAxis: false,
            barColor: '#FFC414',
            negBarColor: '#FFC414'});
        $("#sparkline-5").sparkline(spark5, {
            type: 'bar',
            height: '150',
            barWidth: 20,
            zeroAxis: false,
            barColor: '#9ABA40',
            negBarColor: '#9ABA40'});
        $("#sparkline-6").sparkline(spark6, {
            type: 'bar',
            height: '150',
            barWidth: 20,
            zeroAxis: false,
            barColor: '#6A5A8C',
            negBarColor: '#6A5A8C'});
    });