(function ($, kendo, moment) {
	"use strict";

   	var clockRadius = 50;
	var clockCanvasHands = {};

	var officeData = new kendo.data.DataSource({
		transport: {
			read: "data/offices.json"
		}
	});

	var timelineData = new kendo.data.DataSource({
		data: []
	});

	var generateTimelineData = function () {
		var data = [];
		var offices = officeData.view();
		var numOffices = offices.length;
		var office;
		var momentForDay;

		for(var i = 0; i < numOffices; i++) {
			office = offices[i];
			momentForDay = moment(this.get("selectedTime")).tz(timezone).add("days", -8);

			for(var dayIdx = -7; dayIdx <= 30; dayIdx++) {
				momentForDay.add("days", 1);
				data.push({
					name: office.name,
					day: dayIdx,
					offset: momentForDay.zone() / 60
				});
			}
		}

		timelineData.data(data);
	};

    var draw_clock = function (elementid){
        var canvas = Raphael(elementid,clockRadius*2, clockRadius*2);
        var clock = canvas.circle(clockRadius,clockRadius,clockRadius-5);
        clock.attr({"fill":"#f5f5f5","stroke":"#444444","stroke-width":"5"});
        var hour_sign;
        for(var i=0;i<12;i++){
            var start_x = clockRadius+Math.round((clockRadius-15)*Math.cos(30*i*Math.PI/180));
            var start_y = clockRadius+Math.round((clockRadius-15)*Math.sin(30*i*Math.PI/180));
            var end_x = clockRadius+Math.round((clockRadius-10)*Math.cos(30*i*Math.PI/180));
            var end_y = clockRadius+Math.round((clockRadius-10)*Math.sin(30*i*Math.PI/180));    
            hour_sign = canvas.path("M"+start_x+" "+start_y+"L"+end_x+" "+end_y);
        }    
        var hour_hand = canvas.path("M" + clockRadius + " " + clockRadius + "L" + clockRadius + " " + clockRadius / 2);
        hour_hand.attr({stroke: "#444444", "stroke-width": 4});
        var minute_hand = canvas.path("M" + clockRadius + " " + clockRadius + "L" + clockRadius + " " + clockRadius / 3);
        minute_hand.attr({stroke: "#444444", "stroke-width": 2});
        //var second_hand = canvas.path("M100 110L100 25");
        //second_hand.attr({stroke: "#444444", "stroke-width": 2}); 
        var pin = canvas.circle(clockRadius, clockRadius, 5);
        pin.attr("fill", "#000000");    
    	clockCanvasHands[elementid] = {
    		hour_hand: hour_hand,
    		minute_hand: minute_hand
    		//second_hand: second_hand
    	};
    };
    
    var update_clock = function (elementid, office){
        var now = moment(viewModel.selectedTime).tz(office.timezone);
        var hours = now.hours();
        var minutes = now.minutes();
        var seconds = now.seconds();
        var hands = clockCanvasHands[elementid];
        hands.hour_hand.rotate(30*hours+(minutes/2.5), clockRadius, clockRadius);
        hands.minute_hand.rotate(6*minutes, clockRadius, clockRadius);
        //hands.second_hand.rotate(6*seconds, clockRadius, clockRadius);
    };

    var initAnalogClocks = function () {
    	$.each(officeData.view(), function (index, item) {
    		setTimeout(function () {
	    		draw_clock("clock-" + item.id);
	    		update_clock("clock-" + item.id, item);
    		}, 1);
    	});
    };

	var viewModel = kendo.observable({
		selectedTime: moment().toDate(),
		offices: officeData,

		selectedDay: function () {
			return kendo.toString(this.get("selectedTime"), "D");
		},

		calcTime: function (data) {
			var timezone = data.get("timezone");
			if(timezone) {
				return moment(this.get("selectedTime")).tz(timezone).format("h:mm a z");
			}
			return "";
		},

		clockListBound: function () {
			initAnalogClocks();
		}
	});

	kendo.bind($("body"), viewModel);
})(window.jQuery, window.kendo, window.moment);