var Outages = function() {
	var me = this;

	var _formatOutageListItem = function() {
		return "" +
			"<h3>" + this.ipAddress + "/" + this.monitoredService.serviceType.name + "</h3>" +
			"<p>" + this.serviceLostEvent.logMessage + "</p>" +
			"<p class=\"ui-li-aside\"><abbr class=\"timeago\" title=\"" + this.ifLostService + "\">" + $.timeago(this.ifLostService) + "</abbr></p>";
	};

	this.processOutages = function(data) {
		if (!$.isArray(data.outage)) {
			data.outage = [data.outage];
		}
		for (var outageIndex in data.outage) {
			var outage = data.outage[outageIndex];
			outage.toListItem = _formatOutageListItem;
		}
		return data;
	};

	this.getOutages = function(callback, cache) {
		if (cache === undefined) {
			cache = true;
		}

		$.ajax({
			url: getUrl("outages"),
			cache: cache,
			dataType: "json",
			data: {
				limit: 50,
				orderBy: "ifLostService",
				order: "desc",
				ifRegainedService: "null"
			}
		}).done(function(data) {
			callback(me.processOutages(data));
		});
	};
}