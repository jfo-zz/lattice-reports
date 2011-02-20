var fs = require("fs"),
	pdf = require('../lib/lattice').newReport(),
	barColors = [
		"0060FF", "FF0000", "FFFF00", "40FF00", "00FFFF", "FF00FF", "C08000", "30C000",
		"0040C0", "C8C8C8", "008080", "AF4A00", "00C0C0", "800080", "C0C000", "FF80C0"
	],
	data = [
		{'name': 'This is bar #0', 'value': 168},
		{'name': 'This is bar #1', 'value': 67},
		{'name': 'This is bar #2', 'value': 64},
		{'name': 'This is bar #3', 'value': 26},
		{'name': 'This is bar #4', 'value': 185},
		{'name': 'This is bar #5', 'value': 97},
		{'name': 'This is bar #6', 'value': 108},
		{'name': 'This is bar #7', 'value': 30},
		{'name': 'This is bar #8', 'value': 4},
		{'name': 'This is bar #9', 'value': 48}
	],
	topMargin = 1.5,
	bottomMargin = 2.5,
	leftMargin = 1.25,
	rightMargin = .75,
	i, n, x, y, h, cellWidth, cellHeight, barWidth, maxVal, scale, tick;

pdf.begin(pdf.PORTRAIT);

cellWidth = (pdf.pageWidth-leftMargin-rightMargin) / data.length;
cellHeight = (pdf.pageHeight-topMargin-bottomMargin) / 10;
barWidth = cellWidth * .75;

// Build the graph
pdf.textCenter(0,  .75, pdf.pageWidth, "Bar Graph", 22, null, true);
pdf.textCenter(0, 1.10, pdf.pageWidth, "With meaningless data", 14, null, true);
pdf.grid(leftMargin, topMargin, 1, pdf.pageWidth-leftMargin-rightMargin, 10, cellHeight, "c0c0c0");
pdf.grid(leftMargin, topMargin, 1, pdf.pageWidth-leftMargin-rightMargin, 1, cellHeight*10, "000000");
// Caculate the maximum value for the data to be plotted
maxVal = 10;
for (j = 0; j < data.length; j++) {
	maxVal = Math.max(maxVal, data[j].value);
}
// Get the scale of the data
scale = Math.pow(10, (maxVal.toString().length-1)) * (parseInt(maxVal.toString().charAt(0),10)+1);
tick = scale/10;
// Do Tick indicators (on left)
for (n = tick, i = 0; i < 10; i++) {
	pdf.textRight(leftMargin-1, topMargin+((9-i)*cellHeight)+.03, .95, n);
	n += tick;
}

// Plot the bars and their values
for (i = 0; i < data.length; i++) {
	x = leftMargin + (i * cellWidth);
	y = (pdf.pageHeight-bottomMargin);
	h = (data[i].value / tick) * cellHeight;
	pdf.textRotated(x + (cellWidth * .5)+.05, y+.1, 45, data[i].name, 9);
	pdf.rectangle(x + (cellWidth * .125), y, barWidth, -h, "000000", barColors[i%barColors.length]);
	pdf.textCenter(x, y-h-.075, cellWidth, data[i].value, 9);
}

fs.writeFileSync("graph.pdf", pdf.toString());
