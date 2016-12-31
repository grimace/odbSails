[
        { "name" : "Display Rule", "width":"1920", "height":"1080","regions" : [
            {"name":"image", "width":"1920", "height":"1080", "top":"0", "left":"0", "accept":"image/*"}
            
        ]},
        
        { "name" : "Schedule Rule" , "width":"1920", "height":"1080", 
          "regions" : [
            {"name":"video", "width":"1920", "height":"1080", "top":"0", "left":"0", "accept":"video/*"}
          ]},

        { "name" : "Layout Rule", "width":"1920", "height":"1080", "regions" : [
            {"name":"web", "width":"1920", "height":"1080", "top":"0", "left":"0", "accept":"text/*"}
            
        ]},

        { "name" : "Media Rule", "width":"1920", "height":"1080", "regions" : [
            {"name":"Day Part", "types": 
             [ 
                 "Morning":{},
                 "MidMorning":{},
                 "Noon":{},
                 "Afternoon":{},
                 "MidAfternoon":{}, 
                 "Evening":{}
              ]},
            {"name":"Time", 
                "types": 
                 [ 
                     "Before":{},
                     "After":{},
                     "Between":{},
                     "Blocked":{}
                  ]
            },
            {"name":"Day of Week", "types": 
             [ 
                 "Monday":{},
                 "Tuesday":{},
                 "Wednesday":{},
                 "Thursday":{},
                 "Friday":{}, 
                 "Saturday":{}, 
                 "Sunday":{}
              ]},
            {"name":"Sensor Trigger", "types": 
             [ 
                 "Sensor Type":{},
                 "Value Range":{}
              ]}
        ]},

        { "name" : "Sensor Rule","width":"1920", "height":"1080", "regions" : [
                 "Sensor Type":{},
                 "Value Range":{},
                 "Affected":{}
            
        ]}


]
