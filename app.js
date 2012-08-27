var outages = new Outages();
var alarms  = new Alarms();
var nodes   = new Nodes();

var tabState = {
	outages: { pageId: "outages", url: "#outages" },
	nodes:   { pageId: "nodes",   url: "#nodes" },
	alarms:  { pageId: "alarms",  url: "#alarms" }
};

var initializeNodeDetails = function( state, evt, data, toUrl ) {
	console.log("initializeNodeDetails");
	var page   = data.toPage;
	var source = '#' + state.pageId;
	var params = {};
	var nodeId = undefined;
	if (toUrl) {
		var match = toUrl.search.match("^.*?nodeId=([0-9]+).*?$");
		console.log("match = " + match);
		nodeId = match[1];
	}

	var $footer = $(page).find(":jqmData(role=footer)");
	$footer.find('a').each(function(index) {
		var $href = $(this).attr('href');
		if ($href == source) {
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
};

$(document).bind('pagebeforechange', function(e, data) {
	var fromPage = data.options.fromPage;
	var toPage   = data.toPage;
	var fromId   = undefined;
	var toId     = undefined;
	var toUrl    = undefined;

	if (fromPage) fromId = fromPage.attr('id');
	if (typeof toPage === 'string') {
		toUrl = $.mobile.path.parseUrl(toPage);
		var hash = toUrl.hash;
		if (hash) {
			toId = hash.replace(/^.*?\\#/, "");
			console.log("hash -- toId = " + toId);
		} else {
			toId = toUrl.pathname.substring(1);
			console.log("pathname -- toId = " + toId);
		}
	} else {
		toId = toPage.attr('id').replace(/^.*?\\#/, "");
		console.log("attr -- toId = " + toId);
	}
	
	console.log(fromId + " -> " + toId + " (toUrl = " + toUrl + ")");

	if (fromPage === undefined || fromId === undefined) {
		console.log("? -> " + toId + ": no previous page; skipping");
		return;
	}

	if (fromId != toId) {
		console.log("fromId = " + fromId + ", toId = " + toId + ", tabState = " + JSON.stringify(tabState));
		if (toId.startsWith("outages")) {
			console.log("toId starts with outages");
			if (fromId.startsWith("outages")) {
				// changing outage tab state
				if (typeof toPage === 'string') {
					tabState.outages = { pageId: toId, url: toPage };
				} else {
					tabState.outages = { pageId: toId, url: '#' + toId };
				}
				console.log("saving state for outages: " + JSON.stringify(tabState.outages));
				
				if (toId == "outages-node-detail") {
					e.preventDefault();
					initializeNodeDetails(tabState.outages, e, data, toUrl);
					return;
				}
			} else {
				// going back to the outage tab from elsewhere, restore state
				console.log("pageId = " + tabState.outages.pageId + ", toId = " + toId);
				if (tabState.outages.pageId != toId) {
					evt.preventDefault();
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
});

// var router = new $.mobile.Router([
//	{ "#(outages)-node-detail[?](.*)": { handler: initializeNodeDetails,  events: "bs" /* bs,s,h */ } },
//	{ "#(nodes)-node-detail[?](.*)":   { handler: initializeNodeDetails,  events: "bs" /* bs,s,h */ } },
//	{ "#(alarms)-detail[?](.*)":       { handler: initializeAlarmDetails, events: "bs" /* bs,s,h */ } },
//	{ "^\\#([^?]*)([?].*?)?$":         { handler: defaultHandler,         events: "bC" /* bC,bl,l,bc,c,bs,s,bh,h,i,rm */ } }
//]);

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

$( document ).ready(function() {
	refresh(true);
});