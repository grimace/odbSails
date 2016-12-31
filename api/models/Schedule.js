/**
* Schedule.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
      
      //        title: 'Mobile Coupon Schedule', // The title of the event
//        type: 'info', // The type of the event (determines its color). Can be important, warning, info, inverse, success or special
//        startsAt: new Date(2013,5,1,1), // A javascript date object for when the event starts
//        endsAt: new Date(2014,8,26,15), // Optional - a javascript date object for when the event ends

        name: {
            type: 'string'
//			required: true
        },
        title: {
            type: 'string'
        },
        description: {
            type: 'string'
        },
        leType: {
            type: 'json',
        },
        layoutElement: {
            type: 'json'
        },
        displayElements: {
            type: 'json'
        },
        startsAt: {
            type: 'date'
        },
        endsAt: {
            type: 'date'
        },
        recursOn: {
            type: 'string'
        },
        recDetail: {
            type: 'string'
        },
        recurrance: {
            type: 'json'
        },
        recRange: {
            type: 'json'
        },
        tags: {
            type: 'string'
        },
        network: {
            type: 'string'
        },

        toJSON: function () {
            var obj = this.toObject();
            return obj;
        }

  }
};



/*

 eventID           | int(11)                                           | NO   | PRI | NULL    | auto_increment |
| WheelID          | int(11)                                           | NO   | MUL | NULL    |                |
| DisplayGroupIDs   | varchar(254)                                      | NO   |     | NULL    |                |
| recurrence_type   | enum('Minute','Hour','Day','Week','Month','Year') | YES  |     | NULL    |                |
| recurrence_detail | varchar(100)                                      | YES  |     | NULL    |                |
| userID            | int(11)                                           | NO   |     | NULL    |                |
| is_priority       | tinyint(4)                                        | NO   |     | NULL    |                |
| FromDT            | bigint(20)                                        | NO   |     | 0       |                |
| ToDT              | bigint(20)                                        | NO   |     | 0       |                |
| recurrence_range  | bigint(20)                                        | YES  |     | NULL    |                |
| DisplayOrder      | int(11)                                           | NO   |     | 0       |                |
+-------------------+---------------------------------------------------+------+-----+---------+----------------+
11 rows in set (0.00 sec)

mysql> select * from schedule limit 1;
+---------+------------+-----------------+-----------------+-------------------+--------+-------------+------------+------------+------------------+--------------+
| eventID | CampaignID | DisplayGroupIDs | recurrence_type | recurrence_detail | userID | is_priority | FromDT     | ToDT       | recurrence_range | DisplayOrder |
+---------+------------+-----------------+-----------------+-------------------+--------+-------------+------------+------------+------------------+--------------+
|      17 |          9 | 11              | NULL            | NULL              |      1 |           1 | 1422575040 | 1451519040 |             NULL |            0 |
+---------+------------+-----------------+-----------------+-------------------+--------+-------------+------------+------------+------------------+--------------+
1 row in set (0.00 sec)

mysql> describe schedule_detail;
+-------------------+------------+------+-----+---------+----------------+
| Field             | Type       | Null | Key | Default | Extra          |
+-------------------+------------+------+-----+---------+----------------+
| schedule_detailID | int(11)    | NO   | PRI | NULL    | auto_increment |
| DisplayGroupID    | int(11)    | NO   | MUL | NULL    |                |
| userID            | int(8)     | NO   |     | 1       |                |
| eventID           | int(11)    | YES  | MUL | NULL    |                |
| FromDT            | bigint(20) | NO   |     | 0       |                |
| ToDT              | bigint(20) | NO   |     | 0       |                |


*/