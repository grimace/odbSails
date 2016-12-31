/**
 * OpsController
 *
 * @description :: Server-side logic for managing Ops
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var moment = require('moment');
var request = require('request');

var defaultTimeKey = 'hours';
var defaultIncrement = 24;
var defaultListIncrement = 48;

module.exports = {
	reportView: function (req, res) {
		res.view('ops/kioskreport');
	},

	listView: function (req, res) {
		res.view('ops/kiosklist');
	},

	thumbView: function (req, res) {
		res.view('ops/toppercontent');
	},

	/**
	 * Returns all the Kiosks.
	 * @param	{Object}	req	Description
	 * @param	{Object}	res	Description
	 * @returns	{Object}		Description
	 */
	list: function (req, res) {
		var sort = { lastCheckIn: 'asc' };
        Kiosk.findAll( function(err, kiosks) {
            if (err) { res.json(new MessageResponse(false, 'Could not return kiosk list')) }
			sails.log.debug('Found ' + kiosks.length + ' kiosks');
            return res.json(kiosks);
        }, sort );
	},

	/**
	 * Returns all Alert objects. Accepts Start and End dates and type.
	 * Defaults to the last 24 hours, and 'all' types
	 * ---- These can include other Alerts, like Network and Cloud...
	 * @param	{Object}	req	-- optional params : 'type' & 'dateRange'
	 * @param	{Object}	res
	 * @returns	{Object}    an arrary of AlertHistory objects
	 */
    alertHistory: function(req, res) {
		var query = {};

		var type = req.param('type', 'all');
		if (type !== 'all') {
			query.type = type;
		}
        var dateRange = req.param('dateRange');
		var dates = modelhelper.convertDateRange(dateRange, defaultTimeKey, defaultIncrement);
		query.created = { $gte: dates.start, $lte : dates.end };

		sails.log.info(JSON.stringify(query));
        AlertHistory.find().where( query ).sort({ created: 'desc' }).exec(function(err, alerts) {
            if (err) { sails.log.warn(err); }
            res.json( alerts );
        });
    },

	/**
	 * Returns all Alerts for a given Terminal id
	 * @param	{Object}	req
	 * @param	{Object}	res
	 * @returns	{Object}    an arrary of AlertHistory objects
	 */
    terminalAlertHistory: function(req, res) {
        var terminalId = req.param('tid');
        if (terminalId == '') {
            return res.json( new MessageResponse(false, 'Terminal Id is required'));
        }

        var dateRange = req.param('dateRange');
		var dates = modelhelper.convertDateRange(dateRange, defaultTimeKey, defaultIncrement);

        AlertHistory.find().where( {terminalId : terminalId, created : { $gte: dates.start, $lt : dates.end } } ).sort({created:'desc'})
            .exec(function(err, alerts) {
                if (err) { res.json(new MessageResponse(false, 'Could not get alert history for ' + terminalId)) }
                res.json( alerts );
        });
    },


	/**
	 * Returns all Network Alert objects. Accepts Start and End dates and type.
	 * Defaults to the last 24 hours, and 'all' types - valid types are 'Player' & 'Network'
	 *  also allows restricting data to 'operational' hours. 5am - 8pm.
	 * @param	{Object}	req	-- optional params : 'type' 'terminalId' & 'dateRange'
	 * @param	{Object}	res
	 * @returns	{Object}    an arrary of Network Alert objects
	 */
    networkAlert: function(req, res) {
		var query = {};
        var restrictHours = req.param('restrictHours', false);
		var prodOnly = req.param('prodOnly', false);
        var terminalId = req.param('tid');
		if (terminalId) {
			query.terminalId = terminalId;
		}
		var type = req.param('type', 'all');
		if (type !== 'all') {
			query.type = type;
		} else {
			query.type = ['Player','Network'];
		}
        var dateRange = req.param('dateRange');
		var dates = modelhelper.convertDateRange(dateRange, defaultTimeKey, defaultIncrement);
		query.created = { $gte: dates.start, $lte : dateutil.makeEndOfDay(dates.end) };
		// if we only want production information, load the list of production kiosks
		if (prodOnly) {

			Kiosk.findProduction(function(err, kiosks) {
				if (err) {
					sails.log.debug(err);
					res.json(new MessageResponse(false, 'Could not load play count'));
				}
				var terminalIds = kiosks.map(function(item) {
						return item.terminalId;
				});
				query.terminalId = terminalIds;
				NetworkAlert.find().where( query ).sort({ created: 'desc' }).exec(function(err, alerts) {
					if (err) { sails.log.warn(err); }
					//sails.log.info(JSON.stringify(alerts));
					if (restrictHours) {
						alerts = filterAlertsByOperationalHours(alerts);
					}
					res.json( alerts );
				});
			});
		} else {
			NetworkAlert.find().where( query ).sort({ created: 'desc' }).exec(function(err, alerts) {
				if (err) { sails.log.warn(err); }
				//sails.log.info(JSON.stringify(alerts));
				if (restrictHours) {
					alerts = filterAlertsByOperationalHours(alerts);
				}
				res.json( alerts );
			});
		}

    },

	/**
	 * Returns Alert counts grouped by day and type
	 * @param	{Object}	req
	 * @param	{Object}	res
	 * @returns	{Object}    a list of counts
	 */
    deviceAlertCount: function(req, res) {
        var terminalId = req.param('tid');
        if (terminalId == '') {
            return res.json( new MessageResponse(false, 'Terminal Id is required'));
        }

        var dateRange = req.param('dateRange');
		var dates = modelhelper.convertDateRange(dateRange, defaultTimeKey, defaultListIncrement);

		var result = [];
		var types =['checkin', 'reboot'];
		async.each(types, function( type, callback) {

			AlertHistory.native(function(err, collection) {
				collection.aggregate(
					{$match: {created: {$gte : dates.start, $lte : dates.end }, type : type }},
					{$project: {
							year:  {$year : '$created'},
							month: {$month : '$created'},
							day:   {$dayOfMonth : '$created'}
					}},
					{ $group: {
							_id: {year : '$year',month : '$month', day : '$day'},
							count: {$sum : 1}
					}},
					{$sort: { '_id.year' : 1, '_id.month' :1, '_id.day':1}},
				function(err, results) {
					if(err) throw err;

					var data = [];
					for (var i=0; i < results.length; i++) {
						var row = [];
						row.push( results[i]._id.month + '/' + results[i]._id.day + '/' + results[i]._id.year );
						row.push(results[i].count);
						data.push(row);
					}
					result.push({type: type, data: data});
					callback();
				});
			});
		  }, function(err){
			  // check for error, other wise return results
			  if( err ) {
				res.json(new MessageResponse(false, 'Could not process results'));
			  } else {
                res.json( result );
			  }
		  });
    },

    /**
	 * Loads information about a Kiosk and forwards to the correct view.
	 * @param	{Object}	req
	 * @param	{Object}	res
	 */
	detailReportView: function(req, res) {
        var tid = req.param('tid');
		sails.log.debug('Termianl Id: ' + tid);
		// This is a dynamic finder per Waterline`
        Kiosk.findOneByTerminalId( tid ).exec(function(err, item) {
                if(err) throw err;
				if (item == null) {
					res.json(new MessageResponse(false, 'terminal id does not exist'));
					return;
				}
                //var kiosk = {};
                //kiosk.terminalId = item.terminalId;
                //kiosk.tunnelPort = item.tunnelPort;
                //kiosk.lastCheckIn = item.lastCheckIn;
                //kiosk.macAddress = item.macAddress;
                //kiosk.service = item.service;
                sails.log.debug(JSON.stringify(item));
                res.view('ops/detailreport', {kiosk: item});
        });
    },

	/**
	 * Returns the image for a given screen capture
	 * @param	{Object}	req	Description
	 * @param	{Object}	res	Description
	 * @returns	{Object}		streams the response for a screen capture image
	 */
	screenCap: function(req, res) {
        var port = req.param('port', -1);
        if ( port === -1 ) {
           return res.json( new MessageResponse(false, 'Port is required'));
        }
        request.get( 'http://ktun.kombicorp.net/scap?port=' + port ).pipe( res );
    },

	/**
	 * Returns the image for a given Camera capture
	 * @param	{Object}	req	Description
	 * @param	{Object}	res	Description
	 * @returns	{Object}		streams the response for a Camera capture image
	 */
	cameraCap: function(req, res) {
        var port = req.param('port', -1);
        if ( port === -1 ) {
            return res.json( new MessageResponse(false, 'Port is required'));
        }
		try {
			request({uri: 'http://ktun.kombicorp.net/rcap?port=' + port, timeout:45000} , function (error, response, body) {
				if (!error && response.statusCode == 200) {
					sails.log.debug('Camera Image: ' + body);
					res.json({url: body});
				} else {
					res.json(new MessageResponse(false, error.message));
				}
			})
		} catch (e) {
			sails.log.error(e);
		}
    },

    /**
	 * Checks the tunnel status for a specific port.
	 * @param	{Object}	req
	 * @param	{Object}	res
	 * @returns	{Object}    status message ('connected', 'not connected');
	 */
    tunnelStatus: function(req, res) {
        var port = req.param('port', -1);
        if ( port === -1 ) {
            return res.json( new MessageResponse(false, 'Port is required'));
        }
        request({uri: 'http://ktun.kombicorp.net/tup?port=' + port, timeout:10000} , function (error, response, body) {
            if (!error && response.statusCode == 200) {
                sails.log.debug('Tunnel status: ' + body);
                res.json({status: body});
            } else {
                if (error) sails.log.error(error);
                // sails.log.warn('HTTP Status Code: ' + response.statusCode + ', Tunnel status: ' + body + ', Port: ' + port);
                sails.log.warn('tunnelStatus failed for port: ' + port);
                res.json({status: 'Unknown'});
            }
        })
    },

    /**
	 * Checks the Minix for uptime
	 * @param	{Object}	req
	 * @param	{Object}	res
	 * @returns	{Object}    status message ('connected', 'not connected');
	 */
    topperUptime: function(req, res) {
        var port = req.param('port', -1);
        if ( port === -1 ) {
            return res.json( new MessageResponse(false, 'Port is required'));
        }
        request('http://ktun.kombicorp.net/uptime2?port=' + port , function (error, response, body) {
            if (!error && response.statusCode == 200) {
                sails.log.debug('Uptime : ' + body);
                res.json({status: body});
            } else {
                res.json({status: 'Unknown'});
            }
        })
    },

    /**
	 * Checks the *Pi for uptime
	 * @param	{Object}	req
	 * @param	{Object}	res
	 * @returns	{Object}    status message ('connected', 'not connected');
	 */
    hiveUptime: function(req, res) {
        var port = req.param('port', -1);
        if ( port === -1 ) {
            return res.json( new MessageResponse(false, 'Port is required'));
        }
        request('http://ktun.kombicorp.net/uptime?port=' + port , function (error, response, body) {
            if (!error && response.statusCode == 200) {
                sails.log.debug('Uptime : ' + body);
                res.json({status: body});
            } else {
                res.json({status: 'Unknown'});
            }
        })
    },

    /**
	 * Checks the topper tunnel status for a specific port.
	 * @param	{Object}	req
	 * @param	{Object}	res
	 * @returns	{Object}    status message
	 */
    topperTunnelStatus: function(req, res) {
        var port = req.param('port', -1);
        if ( port === -1 ) {
            return res.json( new MessageResponse(false, 'Port is required'));
        }
		sails.log.debug('Calling topper tunnel status with port: ' + port);
        request({uri:'http://ktun.kombicorp.net/t2up?port=' + port, timeout:10000} , function (error, response, body) {
            if (!error && response.statusCode == 200) {
                sails.log.debug('Topper Tunnel status: ' + body);
                res.json({status: body});
            } else {
				sails.log.debug(error);
                res.json({status: 'Unknown'});
            }
        })
    },

	/**
	 * Reboots the topper via *Pi
	 * @param	{Object}	req
	 * @param	{Object}	res
	 * @returns	{Object}    status message
	 */
    topperReboot: function(req, res) {
        var port = req.param('port', -1);
        if ( port === -1 ) {
            return res.json( new MessageResponse(false, 'Port is required'));
        }

        ConsoleEvent.create( {type: 'operational', event: 'Topper Reboot', userid: req.user.userid, message : { port : port } } ).exec(function(err, consoleEvent) {
            // Error handling
            if (err) sails.log.error(err);
			sails.log.info(JSON.stringify(consoleEvent));
        });
        request({uri:'http://ktun.kombicorp.net/mrbt?port=' + port, timeout:15000} , function (error, response, body) {
            if (!error && response.statusCode == 200) {
                sails.log.debug('Topper reboot status: ' + body);
                res.json({status: body});
            } else {
				sails.log.debug(error);
                res.json({status: 'Unknown'});
            }
        })
    },
    distManagerRestart: function(req, res) {
        var port = req.param('port', -1);
        if ( port === -1 ) {
            return res.json( new MessageResponse(false, 'Port is required'));
        }

        ConsoleEvent.create( {type: 'operational', event: 'DistManager Restart', userid: req.user.userid } ).exec(function(err, consoleEvent) {
            // Error handling
            if (err) sails.log.error(err);
			sails.log.info(JSON.stringify(consoleEvent));
        });
        request({uri:'http://ktun.kombicorp.net/krst?port=' + port, timeout:15000} , function (error, response, body) {
            if (!error && response.statusCode == 200) {
                sails.log.debug(' status: ' + body);
                res.json({status: body});
            } else {
				sails.log.debug(error);
                res.json({status: 'Unknown'});
            }
        })
	},
    cameraRestart: function(req, res) {
        var port = req.param('port', -1);
        if ( port === -1 ) {
            return res.json( new MessageResponse(false, 'Port is required'));
        }

        ConsoleEvent.create( {type: 'operational', event: 'Camera Restart', userid: req.user.userid } ).exec(function(err, consoleEvent) {
            // Error handling
            if (err) sails.log.error(err);
			sails.log.info(JSON.stringify(consoleEvent));
        });
        request({uri:'http://ktun.kombicorp.net/crst?port=' + port, timeout:15000} , function (error, response, body) {
            if (!error && response.statusCode == 200) {
                sails.log.debug('Camera Restart status: ' + body);
                res.json({status: body});
            } else {
				sails.log.debug(error);
                res.json({status: 'Unknown'});
            }
        })
	},
    /////////////////////////////////////////////////////////////////////
    // New services added 12/18/2014
    apkRestart: function(req, res) {
        var port = req.param('port', -1);
        if ( port === -1 ) {
            return res.json( new MessageResponse(false, 'Port is required'));
        }

        ConsoleEvent.create( {type: 'operational', event: 'Player Service Restart', userid: req.user.userid } ).exec(function(err, consoleEvent) {
            // Error handling
            if (err) sails.log.error(err);
            sails.log.info(JSON.stringify(consoleEvent));
        });
        request({uri:'http://ktun.kombicorp.net/prst?port=' + port, timeout:15000} , function (error, response, body) {
            if (!error && response.statusCode == 200) {
                sails.log.debug('Player .apk Restart status: ' + body);
                res.json({status: body});
            } else {
                sails.log.debug(error);
                res.json({status: 'Unknown'});
            }
        })
    },
   	hivemgrPowerCycle: function(req, res) {
        var port = req.param('port', -1);
        if ( port === -1 ) {
            return res.json( new MessageResponse(false, 'Port is required'));
        }

        ConsoleEvent.create( {type: 'operational', event: 'Hive Mgr Power Cycle', userid: req.user.userid } ).exec(function(err, consoleEvent) {
            // Error handling
            if (err) sails.log.error(err);
            sails.log.info(JSON.stringify(consoleEvent));
        });
        request({uri:'http://ktun.kombicorp.net/mcycle?port=' + port, timeout:15000}, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                sails.log.debug('Player .apk Restart status: ' + body);
                res.json({status: body});
            } else {
                sails.log.debug(error);
                res.json({status: 'Unknown'});
            }
        })
    },
    topperPowerCycle: function(req, res) {
        var port = req.param('port', -1);
        if ( port === -1 ) {
            return res.json( new MessageResponse(false, 'Port is required'));
        }

        ConsoleEvent.create( {type: 'operational', event: 'Topper Power Cycle', userid: req.user.userid } ).exec(function(err, consoleEvent) {
            // Error handling
            if (err) sails.log.error(err);
            sails.log.info(JSON.stringify(consoleEvent));
        });
        request({uri:'http://ktun.kombicorp.net/mcycle?port=' + port, timeout:15000}, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                sails.log.debug('Player .apk Restart status: ' + body);
                res.json({status: body});
            } else {
                sails.log.debug(error);
                res.json({status: 'Unknown'});
            }
        })
    },
   displayPowerCycle: function(req, res) {
        var port = req.param('port', -1);
        if ( port === -1 ) {
            return res.json( new MessageResponse(false, 'Port is required'));
        }

        ConsoleEvent.create( {type: 'operational', event: 'Display Power Cycle', userid: req.user.userid } ).exec(function(err, consoleEvent) {
            // Error handling
            if (err) sails.log.error(err);
            sails.log.info(JSON.stringify(consoleEvent));
        });
        request({uri:'http://ktun.kombicorp.net/mcycle?port=' + port, timeout:15000}, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                sails.log.debug('Player .apk Restart status: ' + body);
                res.json({status: body});
            } else {
                sails.log.debug(error);
                res.json({status: 'Unknown'});
            }
        })
    },
    versionInfo: function(req, res) {
        var port = req.param('port', -1);
        if ( port === -1 ) {
            return res.json( new MessageResponse(false, 'Port is required'));
        }
        request.get({uri:'http://ktun.kombicorp.net/pver?port=' + port, timeout:15000}, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                sails.log.debug('Getting Version information');
                res.json({version: body});
            } else {
                sails.log.debug(error);
                res.json(500, new MessageResponse(false, error.message));
            }
        })
    },
    screenCapAll: function(req, res) {
        sails.log.debug('Callign ScreenCappAll');
        request.get({uri:'http://ktun.kombicorp.net/scapall', timeout:1200000}, function (error, response, body) {
            sails.log.debug('ScreenCappAll returned ' + response.statusCode );
            if (!error && response.statusCode == 200) {
                sails.log.debug('Response Body: ' + body);
                    var bodyResult = processBody(body);
                    var mailOptions = { from: 'support@kombicorp.com', // sender address
                                        to: req.user.email,
                                        subject: 'Screen Capture Request', // Subject line
                                        html: '<h2>Your Screen Capture Results</h2>' + bodyResult.join('<br/>')
                                      };
                    sails.log.info(JSON.stringify(bodyResult));
                    smtpMailer.sendMail(mailOptions, function(err, info){
                        if (err) sails.log.error(err);
                        sails.log.info('Message sent: ' + info.response);
                    });

            } else {
                sails.log.debug(error);
            }
        })
        res.json(new MessageResponse(true));
    },
	/**
	 * Sends a Support Ticket request to the globally defined topic.
	 * @param	{Object}	req	Description
	 * @param	{Object}	res	Description
	 * @returns	{Object}		status message with the outcome of sending the request.
	 */
    supportTicket: function(req, res) {
        var userid = req.param('userid');
        var terminalId = req.param('terminalId');
        var issue = req.param('issue');
		// Send as AWS SNS call
		var msg = {};
		msg.TopicArn = sails.config.topic;
		msg.Subject = 'Issue Request (' + terminalId + ')';
		msg.Message = 'User ['+userid+'] sent the following issue: ' + issue;
        //sails.log.debug(JSON.stringify(msg));
        // Send Notification
		var sns = new aws.SNS();
		sns.publish(msg, function(err, data) {
			if (err) {
				res.json(new MessageResponse(false, 'Error sending Message'));
			} else  {
				res.json(new MessageResponse(true));
			}
		});
    },

	/**
	 * Gets the play count for a specific Terminal Id
	 * @param	{Object}	req	Description
	 * @param	{Object}	res	Description
	 * @returns	{Object}		Object containing the play counts
	 */
	playCount: function(req, res) {
        var macAddress = req.param('macAddress');
        if (macAddress == '') {
            res.json( new MessageResponse(false, 'MacAddress is required'));
        }
        var dateRange = req.param('dateRange');
		var dates = modelhelper.convertDateRange(dateRange, defaultTimeKey, defaultIncrement);

        dbclient.db().ks.collection( 'report' ).aggregate( [
                { $match: {DISCRIMINATOR: 'POP', macAddress: macAddress, start :  { $gte: dates.start, $lt : dates.end } } },
                { $group : {
					_id : {mediaName : '$mediaName'},
					count : {$sum : 1}
				}}
            ],
            function ( err, results ) {
				if (err) {
					sails.log.debug(err);
                    return res.json(new MessageResponse(false, 'Could not load play count'));
				}
				var data = modelhelper.convertProofOfPlay(results);
				res.json(data);
			}
		);
	},

	/**
	 * Registers a new Kiosk, requires MacAddress to already be present in DB
	 */
	registerKiosk: function(req, res) {
		var macAddress = req.param('macAddress');
		var serialNumber = req.param('serialNumber');

        if (!macAddress) {
            return res.json( new MessageResponse(false, 'MacAddress is required'));
        }
        if (!serialNumber) {
            return res.json( new MessageResponse(false, 'Serial Number is required'));
        }

		sails.log.debug('registering ' + macAddress + ' with serialNumber ' + serialNumber);
        Kiosk.findOneByMacAddress( macAddress ).exec(function(err, item) {
			if(err) throw err;
			if (item == null) {
				res.status(404).send('Mac Address Not Found');
				return;
			}
			var kiosk = {};
			kiosk.service = { serialNumber : serialNumber, isProduction:false, currentStatus:'inactive' }
			Kiosk.update( { macAddress : macAddress }, kiosk ).exec(function(err, k) {
				// Error handling
				if (err) return res.send(err,500);
				res.json(new MessageResponse( true ));
			});

        });

	},
  /**
   * Registers a new Kiosk, requires MacAddress to already be present in DB
   */
  changeProduction: function(req, res) {
    //alert('Ops : changeProduction');
    var tid = req.param('tid');
    var prod = req.param('prod');

    if (!tid) {
      return res.json( new MessageResponse(false, 'TerminalId is required'));
    }
    if (!prod) {
      return res.json( new MessageResponse(false, 'Production value is required'));
    }

    sails.log.debug('changeProduction ' + tid + ' with boolean ' + prod);
    Kiosk.findOneByTerminalId( tid ).exec(function(err, item) {
      if(err) throw err;
      if (item == null) {
        res.status(404).send('TerminalId Not Found');
        return;
      }
      var kiosk = item;
      var service = kiosk.service;
      if (!service) {
        return res.json( new MessageResponse(false, 'Kiosk is not registered'));
      }
      service.isProduction = (prod === 'true');
      Kiosk.update( { terminalId : tid }, kiosk ).exec(function(err, k) {
        // Error handling
        if (err) return res.send(err,500);
        res.json(new MessageResponse( true ));
      });

    });

  }


};

/**
 * Filters our results that do not fall into Operational Hours.
 * Thses are defined as 5am-8pm PST
 */
function filterAlertsByOperationalHours(alerts) {
	if (alerts == null || alerts.length == 0) {
		return alerts;
	}
	var restrictCount = 0;
	var results = alerts.filter(function(alert){
		var alertDate = dateutil.moment(alert.date).zone('-08:00');
		if (alertDate.hour() < 4 || alertDate.hour() > 19 ) {
			//sails.log.debug('Removing: ' + alertDate.format('YYYY MM DD, h:mm:ss a Z'));
			restrictCount++;
			return false;
		}
		return true;
	});
	sails.log.debug('restricted ' +restrictCount+ ' alerts');
	return results;
}

function processBody(body) {
    var re = /\n/;
    var split = body.split(re);
    var urls = split.map(function(row, index) {
        if (row.indexOf('http://') !== -1) {
            var tunnelPort = row.substr( (row.lastIndexOf('/') + 1), 4 );
            return 'Tunnel Port: ' + tunnelPort.link(row);
        } else {
            if (row.length > 1) {
                return 'Error: ' + row;
            } else {
                return '';
            }
        }
    });
    return urls;
}
