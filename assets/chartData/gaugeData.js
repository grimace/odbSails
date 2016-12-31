    $( document ).ready(function() {
        
        //gage
        var g = new JustGage({
            id: "gage-1",
            value: getRandomInt(0, 980),
            min: 0,
            max: 980,
            showInnerShadow: true,
            shadowOpacity : 0.3,
            valueFontColor : ['#4A98BE'],
            levelColors : ['#4A98BE','#3d86a9','#347290'],
            title: "Visitors"
        });

        var g = new JustGage({
            id: "gage-2",
            value: getRandomInt(0, 100),
            min: 00,
            max: 100,
            showInnerShadow: true,
            shadowOpacity : 0.3,
            valueFontColor : ['#e07a59'],
            levelColors : ['#e07a59','#db633c','#cf5027'],
            title: "Errors"
        });

        var g = new JustGage({
            id: "gage-3",
            value: getRandomInt(0, 500),
            min: 0,
            max: 500,
            showInnerShadow: true,
            shadowOpacity : 0.3,
            valueFontColor : ['#6A5A8C'],
            levelColors : ['#6A5A8C','#5a4d77','#4b3f63'],
            title: "Events"
        });

        var g = new JustGage({
            id: "gage-4",
            value: getRandomInt(350, 980),
            min: 350,
            max: 980,
            showInnerShadow: true,
            valueFontColor : ['#9aba40'],
            shadowOpacity : 0.3,
            levelColors : ['#9aba40','#85a137','#70872f'],
            title: "Incomes"
        });

         var g = new JustGage({
            id: "gage-5",
            value: getRandomInt(0, 500),
            min: 0,
            max: 500,
            showInnerShadow: true,
            shadowOpacity : 0.3,
            valueFontColor : ['#6A5A8C'],
            levelColors : ['#6A5A8C','#5a4d77','#4b3f63'],
            title: "Losses"
        });

        var g = new JustGage({
            id: "gage-6",
            value: getRandomInt(350, 980),
            min: 350,
            max: 980,
            showInnerShadow: true,
            valueFontColor : ['#9aba40'],
            shadowOpacity : 0.3,
            levelColors : ['#9aba40','#85a137','#70872f'],
            title: "Interdimensionals"
        });

   });