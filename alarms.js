var Alarms = function() {
	var me = this;

	var _formatAlarmListItem = function() {
		var label = this.nodeLabel;
		if (!label) {
			label = this.ipAddress;
		}
		return "" +
			"<h3>" + label + "</h3>" +
			this.description +
			"<p class=\"ui-li-aside\"><abbr class=\"timeago\" title=\"" + this.lastEventTime + "\">" + $.timeago(this.lastEventTime) + "</abbr></p>";
	};

	this.processAlarms = function(data) {
		if (!$.isArray(data.alarm)) {
			data.alarm = [data.alarm];
		}
		for (var alarmIndex in data.alarm) {
			var alarm = data.alarm[alarmIndex];
			alarm.toListItem = _formatAlarmListItem;
		}
		return data;
	};

	this.getAlarms = function(callback, cache) {
		if (cache === undefined) {
			cache = true;
		}

		$.ajax({
			url: getUrl("alarms"),
			cache: cache,
			dataType: "json",
			data: {
				limit: 50,
				orderBy: "lastEventTime",
				order: "desc",
				alarmAckUser: "null"
			}
		}).done(function(data) {
			callback(me.processAlarms(data));
		});
	};
}