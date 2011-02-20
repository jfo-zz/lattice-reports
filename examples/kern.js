var fs = require("fs");
var	formatDate = require('../lib/format').formatDate;
var	pdf = require('../lib/lattice').newReport();
var textHeight;
var gettysburg = "Four score and seven years ago our fathers brought forth on this continent, a new nation, conceived in Liberty, and dedicated to the proposition that all men are created equal.\n\n" +
	"Now we are engaged in a great civil war, testing whether that nation, or any nation so conceived and so dedicated, can long endure. We are met on a great battle-field of that war. We have come to dedicate a portion of that field, as a final resting place for those who here gave their lives that that nation might live. It is altogether fitting and proper that we should do this.\n\n" +
	"But, in a larger sense, we can not dedicate -- we can not consecrate -- we can not hallow -- this ground. The brave men, living and dead, who struggled here, have consecrated it, far above our poor power to add or detract. The world will little note, nor long remember what we say here, but it can never forget what they did here. It is for us the living, rather, to be dedicated here to the unfinished work which they who fought here have thus far so nobly advanced. It is rather for us to be here dedicated to the great task remaining before us -- that from these honored dead we take increased devotion to that cause for which they gave the last full measure of devotion -- that we here highly resolve that these dead shall not have died in vain -- that this nation, under God, shall have a new birth of freedom -- and that government of the people, by the people, for the people, shall not perish from the earth.";

pdf.begin(pdf.PORTRAIT);

pdf.kern = false;
pdf.setFont(10, "Times Roman");
pdf.setLine("000000", pdf.LINE_SOLID, .2);


pdf.startHeader(0, .75);
pdf.textCenter(0, 0, pdf.pageWidth, "Font Kerning", 18, null, true);
pdf.endHeader();

pdf.startFooter(0, -.5);
pdf.textCenter(0, 0, pdf.pageWidth, formatDate(new Date(), "m/d/Y"));
pdf.endFooter();

pdf.startWatermark(0, 0);
pdf.textRotated(3.5, 2, 90, "Draft", 220, null, null, null, "f0f0f0");
pdf.endWatermark();

pdf.fontAlignment = pdf.ASCENDER;
textHeight = pdf.textWrap(1, 3, 4, 6, gettysburg, pdf.ALIGN_LEFT);
pdf.rectangle(1, 3, 4, textHeight);

pdf.newPage();
pdf.fontAlignment = pdf.BASELINE;
textHeight = pdf.textWrap(1, 3, 4, 6, gettysburg, pdf.ALIGN_LEFT);
pdf.rectangle(1, 3, 4, textHeight);

pdf.newPage();
pdf.setFont(11);
pdf.fontAlignment = pdf.ASCENDER;
pdf.kern = false;
pdf.textCenter(.1, 2.8, 4, "Kerning Off");
textHeight = pdf.textWrap(.1, 3, 4, 6, gettysburg, pdf.ALIGN_LEFT);
pdf.rectangle(.1, 3, 4, textHeight);
pdf.kern = true;
pdf.textCenter(4.3, 2.8, 4, "Kerning On");
textHeight = pdf.textWrap(4.3, 3, 4, 6, gettysburg, pdf.ALIGN_LEFT);
pdf.rectangle(4.3, 3, 4, textHeight);

pdf.newPage();
pdf.kern = false;
pdf.textCenter(.1, 2.8, 4, "Kerning Off");
textHeight = pdf.textWrap(.1, 3, 4, 6, gettysburg, pdf.ALIGN_CENTER);
pdf.rectangle(.1, 3, 4, textHeight);
pdf.kern = true;
pdf.textCenter(4.3, 2.8, 4, "Kerning On");
textHeight = pdf.textWrap(4.3, 3, 4, 6, gettysburg, pdf.ALIGN_CENTER);
pdf.rectangle(4.3, 3, 4, textHeight);

pdf.newPage();
pdf.kern = false;
pdf.textCenter(.1, 2.8, 4, "Kerning Off");
textHeight = pdf.textWrap(.1, 3, 4, 6, gettysburg, pdf.ALIGN_RIGHT);
pdf.rectangle(.1, 3, 4, textHeight);
pdf.kern = true;
pdf.textCenter(4.3, 2.8, 4, "Kerning On");
textHeight = pdf.textWrap(4.3, 3, 4, 6, gettysburg, pdf.ALIGN_RIGHT);
pdf.rectangle(4.3, 3, 4, textHeight);

//Obvious kerning
var text = "WAWA WAWA AVAV AVAV ToTo ToTo WAWA WAWA AVAV AVAV To To To To";
pdf.newPage();
pdf.clearWatermark();
pdf.kern = false;
pdf.textCenter(.1, 2.8, 4, "Kerning Off");
pdf.textWrap(.1, 3, 4, 1, text, pdf.ALIGN_LEFT);
pdf.kern = true;
pdf.textCenter(.1, 3.8, 4, "Kerning On");
pdf.textWrap(.1, 4, 4, 1, text, pdf.ALIGN_LEFT);

fs.writeFileSync("kern.pdf", pdf.toString());
