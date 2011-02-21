//http://earthquake.usgs.gov/earthquakes/catalogs/eqs7day-M1.txt
//http://www.data.gov/raw/34

var fs = require("fs"),
	formatDate = require('../lib/format').formatDate,
	pdf = require('../lib/lattice').newReport(),
	data = JSON.parse(fs.readFileSync("data/earthquake.json", "utf8"));

pdf.begin(pdf.PORTRAIT);
// Report footer
pdf.on("beforeWritePage", function(obj) {
	var kt;
	pdf.hLine(0.1, -0.5, pdf.pageWidth - 0.2, null, 2);
	kt = pdf.text(0.2, -0.33, "Data from: ");
	pdf.text(kt.textWidth+0.2, -0.33, "http://www.data.gov/raw/34", null, null, null, null, null, "http://www.data.gov/raw/34");
	pdf.textCenter(0, -0.33, pdf.pageWidth, formatDate(new Date(), "m/d/Y"));
	pdf.textRight(0, -0.33, pdf.pageWidth-0.2, "Page " + pdf.pageNo);
});
pdf.report({
	data:			data,
	topMargin:		0.4,
	bottomMargin:	0.75,
	leftMargin:		0.75,
	lineWidth:		1,
	fontSize:		9,
	defaultTop:		0.16,
	fontFamily:		'Arial',
	groups: {
		 "GR1":		{field: "{Region}", repeatHeader: true}
	},
	runningTotals: {
		"nQuakes":			{operation: "COUNT", field: "{Magnitude}", resetOnGroup: "GR1"},
		"maxMagnitude":		{operation: "MAX", field: "{Magnitude}", resetOnGroup: "GR1"},
		"nQuakesAll":		{operation: "COUNT", field: "{Magnitude}"},
		"maxMagnitudeAll":	{operation: "MAX", field: "{Magnitude}"}
	},
	guides:	{
		c1:		{ width: 2.25, left: 0 },
		c2:		{ width: 1.40 },
		c3:		{ width: 0.90, align: pdf.ALIGN_RIGHT },
		c4:		{ width: 0.90, align: pdf.ALIGN_RIGHT },
		c5:		{ width: 0.80, align: pdf.ALIGN_RIGHT },
		c6:		{ width: 0.80, align: pdf.ALIGN_RIGHT }
	},
	sections: {
		"PH1": {type: "PH", minHeight: 0.8, fontBold: true, items: [
					{guide: "rw",	field: "Earthquakes", fontSize: 20},
					{guide: "rw",	field: "1-7 Feb, 2011", fontSize: 14, top: 0.45}
			]
		},
		"PH2": {type: "PH", minHeight: 0.2, fontBold: true, items: [
				{guide: "c1",	field: "Region"},
				{guide: "c2",	field: "Date/Time"},
				{guide: "c3",	field: "Latitude"},
				{guide: "c4",	field: "Longitude"},
				{guide: "c5",	field: "Depth"},
				{guide: "c6",	field: "Magnitude"},
				{guide: "rw",	type: "HL", moveToBottom: true}
			]
		},
		"GH1": {type: "GH", minHeight: 0.2, group: "GR1", underlay: true, items: [
				{guide: "c1",	field: "{Region}", canGrow: true}
			]
		},
		"DT1": {type: "DT", minHeight: 0.2, items: [
				{guide: "c2",	field: "{Datetime:m/d/Y T}"},
				{guide: "c3",	field: "{Lat:%.4f}"},
				{guide: "c4",	field: "{Lon:%.4f}"},
				{guide: "c5",	field: "{Depth:%.1f}"},
				{guide: "c6",	field: "{Magnitude:%.1f}"}
			]
		},
		"GF1": {type: "GF", minHeight: 0.5, group: "GR1", items: [
				{left: "c2.x",	type: "HL", top: 0, right: "c6.X"},
				{left: "c2.f",	field: "{#nQuakes} quake(s) with a maximum magnitude of {#maxMagnitude:%.1f}", right: "c6.r", align: pdf.ALIGN_RIGHT}
			]
		},
		"RF1": {type: "RF", minHeight: 0.5, group: "GR1", items: [
				{guide: "rw",	field: "Grand Total: {#nQuakesAll} quake(s) with a maximum magnitude of {#maxMagnitudeAll:%.1f}", align: pdf.ALIGN_CENTER}
			]
		}
	}
}, function() {
	fs.writeFileSync("earthquake.pdf", pdf.toString());
});
