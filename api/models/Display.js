/**
* Display.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

	attributes: {

        name: {
            type: 'string',
			required: true
        },
        displayId: {
            type: 'string',
        },
        displayprofileid: {
            type: 'string',
        },
        license: {
            type: 'string',
        },
        licensed: {
            type: 'boolean',
        },
        network: {
            type: 'string',
        },
        orientation: {
            type: 'string',
        },
        ipAddress: {
            type: 'string'
        },
        macAddress: {
            type: 'string'
        },
        portNumber: {
            type: 'string'
        },
        geometry: {
            type: 'json'
        },
        defaultLayout: {
            type: 'string'
        },
        defaultLayoutType: {
            type: 'string'
        },
        description: {
            type: 'string'
        },
        tags: {
            type: 'string'
        },
        toJSON: function () {
            var obj = this.toObject();
            return obj;
        }

	}
    /* from xibo to be added as needed
    
    
displayid                 | int(8)       | NO   | PRI | NULL    | auto_increment |
| isAuditing                | tinyint(4)   | NO   |     | 0       |                |
| display                   | varchar(50)  | NO   |     | NULL    |                |
| defaultlayoutid           | int(8)       | NO   | MUL | NULL    |                |
| license                   | varchar(40)  | YES  |     | NULL    |                |
| licensed                  | tinyint(1)   | NO   |     | 0       |                |
| loggedin                  | tinyint(4)   | NO   |     | 0       |                |
| lastaccessed              | int(11)      | YES  |     | NULL    |                |
| inc_schedule              | tinyint(1)   | NO   |     | 0       |                |
| email_alert               | tinyint(1)   | NO   |     | 1       |                |
| alert_timeout             | int(11)      | NO   |     | 0       |                |
| ClientAddress             | varchar(100) | YES  |     | NULL    |                |
| MediaInventoryStatus      | tinyint(4)   | NO   |     | 0       |                |
| MediaInventoryXml         | longtext     | YES  |     | NULL    |                |
| MacAddress                | varchar(254) | YES  |     | NULL    |                |
| LastChanged               | int(11)      | YES  |     | NULL    |                |
| NumberOfMacAddressChanges | int(11)      | NO   |     | 0       |                |
| LastWakeOnLanCommandSent  | int(11)      | YES  |     | NULL    |                |
| WakeOnLan                 | tinyint(4)   | NO   |     | 0       |                |
| WakeOnLanTime             | varchar(5)   | YES  |     | NULL    |                |
| BroadCastAddress          | varchar(100) | YES  |     | NULL    |                |
| SecureOn                  | varchar(17)  | YES  |     | NULL    |                |
| Cidr                      | varchar(6)   | YES  |     | NULL    |                |
| GeoLocation               | point        | YES  |     | NULL    |                |
| version_instructions      | varchar(255) | YES  |     | NULL    |                |
| client_type               | varchar(20)  | YES  |     | NULL    |                |
| client_version            | varchar(15)  | YES  |     | NULL    |                |
| client_code               | smallint(6)  | YES  |     | NULL    |                |
| displayprofileid          | int(11)      | YES  |     | NULL    |                |
| currentLayoutId           | int(11)      | YES  |     | NULL    |                |
| screenShotRequested       | tinyint(4)   | NO   |     | 0       |                |
| storageAvailableSpace     | bigint(20)   | YES  |     | NULL    |                |
| storageTotalSpace         | bigint(20)   | YES  |     | NULL    |                |
    
    
    */
};

