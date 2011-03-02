var fs = require("fs");
var	formatDate = require('../lib/format').formatDate;
var	pdf = require('../lib/lattice').newReport();

pdf.begin(pdf.PORTRAIT);

pdf.loadImage("img1", "img/Test24.bmp");
pdf.loadImage("img2", "img/Test8.bmp");
pdf.loadImage("img3", "img/Test4.bmp");
pdf.loadImage("img4", "img/Test1.bmp");
pdf.loadImage("img5", "img/Test8rle.bmp");
pdf.loadImage("img6", "img/Test4rle.bmp");
pdf.image("img1", .25, .25);
pdf.image("img2", 3.25, .25, .75);
pdf.image("img3", 4.25, .25, .5);
pdf.image("img4", 5.25, .25, .25);
pdf.image("img5", 0, 4, null, null, 30);
pdf.image("img6", 2.8, 4, null, null, 45);
pdf.image("img1", 5.6, 4, null, null, 60);
pdf.newPage();
pdf.image("img2", .25, .25, 8, 10.5);
pdf.newPage();
pdf.image("img3", 2, .25, 2, 10.5);
pdf.newPage();
pdf.image("img4", 2, 2, 2, 8, null, 15);
pdf.newPage();
pdf.image("img5", 2, 2, 2, 8, null, null, 15);
pdf.newPage();
pdf.image("img6", 2, 2, 2, 8, null, 15, 15);

fs.writeFileSync("image.pdf", pdf.toString());

