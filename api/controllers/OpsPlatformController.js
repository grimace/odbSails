/**
 * OpsPlatformController
 *
 * @description :: Server-side logic for managing Opsplatforms
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var moment = require('moment');
var request = require('request');

var defaultTimeKey = "hours";
var defaultIncrement = 24;

module.exports = {
	
    mmsAlerts: function(req, res) {
        var status = req.param('show', 'OPEN');
        if (status != 'OPEN') {
            status = 'CLOSED';
        }
        var dateRange = req.param("dateRange");
		var dates = modelhelper.convertDateRange(dateRange, defaultTimeKey, defaultIncrement);
       
        var mmsUser = sails.config.mmsUser;
        var mmsApiKey = sails.config.mmsApiKey;
        var mmsGroup = sails.config.mmsGroup;

        var alerts = [];
        var url = 'https://mms.mongodb.com/api/public/v1.0/groups/' + mmsGroup + '/alerts?status='+status;
        request({
            uri: url,
            method: 'GET',
            auth: {
                'user': mmsUser,
                'pass': mmsApiKey,
                'sendImmediately': false
            }
        }, function(error, response, body) {
            
            if (error || response.statusCode != 200) {
                sails.log.warn("MMS service returned "+ response.statusCode);
                res.json(new MessageResponse(false, "Error" + JSON.stringify(error)) );
            }
            var resBody = JSON.parse(body);
            for (var i=0; i< resBody.results.length; i++) {
                var item = resBody.results[i];
                if (dateRange) {
                    var date = new Date(item.created);
                    if (dates.start > date || dates.end < date) continue;
                }
                var alert = {};
                alert.status = item.status;
                alert.created = item.created;
                alert.updated = item.updated;
                alert.resolved = item.resolved;
                alert.type = item.typeName;
                alert.event = item.eventTypeName;
                alert.currentValue = item.currentValue;
                
                alerts.push(alert);
            }
            
            res.json(alerts);
        });
    },
    
    cloudAlerts: function(req, res) {
        var dateRange = req.param("dateRange");
		var dates = modelhelper.convertDateRange(dateRange, defaultTimeKey, defaultIncrement);
        
        CloudAlert.find().where( {type:'cloudwatch', created : { $gte: dates.start, $lte : dates.end } } ).sort({created:'desc'})
            .exec(function(err, alerts) {
                if (err) { res.json(new MessageRespose(false, "Could not get cloudwatch alerts for " + terminalId)) }
                res.json( alerts );
        });
        
    },
    
    cloudStatus: function(req, res) {
        var ec2 = new aws.EC2(); 
        
		var instanceIds = [];
		async.series([
			function(callback){
				var params = {
				    DryRun: false,
				    Filters: [
						{
						  Name: 'tag:METRICS',
						  Values: [ 'ALLTM_SERVER' ]
						}
				    ]
				};				
				ec2.describeInstances(params, function(err, data) {
					var servers = [];
					if (err != null) {
						res.json(new MessageResponse(false, "Could not get EC2 Instance Information: " + err));
					} else {
						for (var i=0; i < data.Reservations.length; i++) {
							if (data.Reservations[i].Instances) {
								for (var x=0; x < data.Reservations[i].Instances.length; x++) {
									var instance = data.Reservations[i].Instances[x];
									instanceIds.push(instance.InstanceId);
									var server = {};
									server.instanceId = instance.InstanceId;
									server.instanceType  = instance.InstanceType;
									server.state = instance.State.Name;
									server.stateCode = instance.State.Code;
									server.location = instance.Placement.AvailabilityZone;
									server.privateDns = instance.PrivateDnsName;
									server.publicDns = instance.PublicDnsName;
									server.privateIpAddress = instance.PrivateIpAddress;
									server.publicIpAddress = instance.PublicIpAddress;
									if (instance.Tags) {
										for (var x=0; x < instance.Tags.length; x++ ) {
											if (instance.Tags[x].Key == 'Name') {
												server.name = instance.Tags[x].Value;
											}
										}
									}
									servers.push(server);
								}
							}
						}
						callback(null, servers);
					}
				});
			},
			function(callback){
				var params = {
				    DryRun: false,
					InstanceIds: instanceIds,
				};
				ec2.describeInstanceStatus(params, function(err, data) {
					if (err) {
						callback(err);
						return;
					}
					callback(null, data);
				});
			}
		],
		// optional callback
		function(err, results){
			if (err) {
				res.json(new MessageResponse(false, JSON.stringify(err)));
				return;
			}
			if (results.length != 2) {
				res.json(new MessageResponse(false, "Incorrect number of results"));
				return;
			}
			var servers = results[0];
			var statuses = results[1].InstanceStatuses;
			for (var i=0; i < servers.length; i++) {
				var server = servers[i];
				var status = _.find( statuses, { 'InstanceId' : server.instanceId } )
				if (!status) {
					continue;
				}
				server.status = { systemStatus: status.SystemStatus.Status,
								  instanceStatus: status.InstanceStatus.Status,
								  events: status.Events }
				
			}
			res.json(servers);
		});	
    },
    /**
     * Return metric information grouped by timestamps
     */
    cloudMetrics: function(req, res) {
        var dateRange = req.param("dateRange");
		var dates = modelhelper.convertDateRange(dateRange, defaultTimeKey, defaultIncrement);
        
        sails.log.debug("Calling cloudMetrics with" + JSON.stringify(dates));
        
        dbclient.db().ks.collection('metrics').find({created : { $gte: dates.start, $lte : dates.end }}).limit(1000).toArray(
            function(err, results) {
                if (err) {
                    sails.log.error(err);
                }
                /**
                 * This is ugly. convert stored data in multi dimensional/associative array
                 */
                var metrics = {};
                var data = _.pluck(results, 'metrics');
                _.each(data, function(element, index, list){
                    _.each(element, function(e) {
                        var name = e.name;
                        if (metrics[name]) {
                            var m = metrics[name];
                            _.each(e.data, function (elem, i, items) {
                                if (m[elem.Timestamp]) {
                                    m[elem.Timestamp].push(elem.Average);
                                } else {
                                    m[elem.Timestamp] = [elem.Average];
                                }
                            });
                        } else {
                            var m = metrics[name] = {};
                            _.each(e.data, function (elem, i, items) {
                                if (m[elem.Timestamp]) {
                                    m[elem.Timestamp].push(elem.Average);
                                } else {
                                    m[elem.Timestamp] = [elem.Average];
                                }
    
                            });
                        }
                    });
                });
                
                // now average and sort based on timestamp.
                for (var key in metrics) {
                    var stat = metrics[key];
                    averages = [];
                    for (var date in stat) {
                        var total=0;
                        _.each(stat[date], function(elem, index, list) {
                            total += elem;
                        });
                        var avg = total / stat[date].length;
                        averages.push([date, avg]);
                        delete stat[date];
                    }
                    averages.sort(function(a, b) {
                        if (a[0] < b[0]) return -1;
                        if (a[0] > b[0]) return 1;
                        if (a[0] == b[0]) return 0;
                    });
                    stat.avg = averages;
                }
                    
                res.json(metrics);
        });
        
    },
    platformView: function(req, res) {
        res.view('ops/platform');
    },
    reportView: function(req, res) {
        res.view('ops/platformreport');
    },
    rollupView: function(req, res) {
        res.view('ops/rollup');
    }
};

