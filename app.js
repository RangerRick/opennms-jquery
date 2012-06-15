var outages = new Outages();
var alarms  = new Alarms();
var nodes   = new Nodes();

var tabState = {
	outages: { pageId: "outages", url: "#outages" },
	nodes:   { pageId: "nodes",   url: "#nodes" },
	alarms:  { pageId: "alarms",  url: "#alarms" }
};

$.mobile.defaultPageTransition = 'none';

var defaultHandler = function( eventType, matchObj, ui, toPage, evt ) {
	var toId = undefined;
	if (toPage) {
		toId = $(toPage).attr('id');
	}
	if (toId === undefined) {
		// infer it from the matchObj
		toId = matchObj[1];
	}
	
	var fromPage = undefined;
	if (ui && ui.prevPage && ui.prevPage.attr('id')) {
		fromPage = ui.prevPage;
	} else {
		fromPage = $.mobile.activePage;
	}
	var fromId = undefined;
	if (fromPage && fromPage.attr('id')) {
		fromId = fromPage.attr('id');
	}

	if (false) {
		console.log("===============================================================");
		console.log("eventType = " + eventType);
		console.log("matchObj  = " + matchObj);
		console.log("ui        = " + ui);
		console.log("page      = " + toPage);
		console.log("evt       = " + evt);
	}

	if (eventType == "pagebeforechange") {
		console.log(eventType + ": " + fromId + " -> " + toId);

		if (fromPage === undefined || fromId === undefined) {
			console.log(eventType + ": ? -> " + toId + ": no previous page; skipping");
			return;
		}

		if (fromId != toId) {
			console.log("tabState = " + JSON.stringify(tabState));
			if (toId.startsWith("outages")) {
				if (fromId.startsWith("outages")) {
					// changing outage tab state
					console.log("saving state for outages");
					tabState.outages = { pageId: toId, url: matchObj[0] };
				} else {
					// going back to the outage tab from elsewhere, restore state
					console.log("pageId = " + tabState.outages.pageId + ", toId = " + toId);
					if (tabState.outages.pageId != toId) {
						evt.preventDefault();
						// evt.stopPropagation();
						$.mobile.changePage(tabState.outages.url);
					} else {
						return;
					}
				}
			}
			if (toId.startsWith("nodes")) {
				if (fromId.startsWith("nodes")) {
					// changing nodes tab state
					console.log("saving state for nodes");
					tabState.nodes = { pageId: toId, url: matchObj[0] };
				} else {
					// going back to the nodes tab from elsewhere, restore state
					console.log("pageId = " + tabState.nodes.pageId + ", toId = " + toId);
					if (tabState.nodes.pageId != toId) {
						evt.preventDefault();
						// evt.stopPropagation();
						$.mobile.changePage(tabState.nodes.url);
					} else {
						return;
					}
				}
			}
			if (toId.startsWith("alarms")) {
				if (fromId.startsWith("alarms")) {
					// changing nodes tab state
					console.log("saving state for alarms");
					tabState.alarms = { pageId: toId, url: matchObj[0] };
				} else {
					// going back to the alarms tab from elsewhere, restore state
					console.log("pageId = " + tabState.alarms.pageId + ", toId = " + toId);
					if (tabState.alarms.pageId != toId) {
						evt.preventDefault();
						// evt.stopPropagation();
						$.mobile.changePage(tabState.alarms.url);
					} else {
						return;
					}
				}
			}
		}
	}
};

var initializeNodeDetails = function( eventType, matchObj, ui, page, evt ) {
	/*
	console.log("eventType = " + eventType);
	console.log("matchObj  = " + matchObj);
	console.log("ui        = " + ui);
	console.log("page      = " + page);
	console.log("event     = " + evt);
	*/

	var currentPage = $.mobile.activePage;

	if (eventType == "pagebeforeshow") {
		var source = matchObj[1];
		var params = router.getParams(matchObj[2]);
		var nodeId = params.nodeId;

		var $footer = $(page).find(":jqmData(role=footer)");
		$footer.find('a').each(function(index) {
			var $href = $(this).attr('href');
			if ($href == '#' + source) {
				$(this).addClass('ui-btn-active');
				$(this).addClass('ui-state-persist');
			} else {
				$(this).removeClass('ui-btn-active');
			}
		});

		var $nodeTitle = $(page).find(":jqmData(role=header)").find('h1');
		var $nodeContent = $(page).find(":jqmData(role=content)");
		$nodeTitle.html("Node #" + nodeId);
		var template = nodes.getTemplate(nodeId);
		$nodeContent.html(template);
		nodes.updateNode(nodeId, page, true);
	}
};

var initializeAlarmDetails = function( eventType, matchObj, ui, page, evt ) {
	
};

var refresh = function( cache ) {
	outages.getOutages(function( data ) {
		var $outageList = $("#outage-list");
		if (!data) {
			console.log("alarm data is empty");
			return;
		}
		for (var outage in data.outage) {
			outage = data.outage[outage];
			$outageList.append("<li><a href=\"#outages-node-detail?nodeId=" + outage.serviceLostEvent.nodeId + "\">" + outage.toListItem() + "</a></li>");
		}
		if ($outageList.hasClass('ui-listview')) {
			$outageList.listview( 'refresh' );
		} else {
			console.log("warning: not yet initialized");
			// $outageList.listview();
		}
	}, cache);
	alarms.getAlarms(function( data ) {
		var $alarmList = $("#alarm-list");
		if (!data) {
			console.log("alarm data is empty");
			return;
		}
		for (var alarm in data.alarm) {
			alarm = data.alarm[alarm];
			$alarmList.append("<li><a href=\"#alarms-detail?alarmId=" + alarm["@id"] + "\">" + alarm.toListItem() + "</a></li>");
		}
		if ($alarmList.hasClass('ui-listview')) {
			$alarmList.listview( 'refresh' );
		} else {
			console.log("warning: not yet initialized");
			// $alarmList.listview();
		}
	}, cache);
};

var router = new $.mobile.Router([
	{ "#(outages)-node-detail[?](.*)": { handler: initializeNodeDetails, events: "bs,s,h"    } },
	{ "#(nodes)-node-detail[?](.*)":   { handler: initializeNodeDetails, events: "bs,s,h"    } },
	{ "#(alarms)-detail[?](.*)":       { handler: initializeAlarmDetails, events: "bs,s,h"   } },
	{ "^\\#([^?]*)([?].*?)?$":         { handler: defaultHandler,        events: "bC,bl,l,bc,c,bs,s,bh,h,i,rm" } }
]);

$( document ).ready(function() {
	refresh(true);
});