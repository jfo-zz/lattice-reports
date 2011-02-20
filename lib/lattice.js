/*!
 * Lattice Reports
 */

var sys = require("sys"),
	events = require("events"),
	formatDate = require("./format").formatDate,
	self,
	buf,
	finished,
	lineEndStyle,
	objNo,
	radsInCircle = Math.PI * 2,	//6.283185307179586;
	degreesInRad = 360 / radsInCircle,	//57.295779513082325;
	GRAPHICS = 0,
	TEXT = 1,
	// Output section types
	O_WATERMARK = 0,
	O_HEADER = 1,
	O_FOOTER = 2,
	O_PAGE = 3,
	O_FIRST = O_WATERMARK,
	O_LAST = O_PAGE,
	fileOffset,		// The number of characters that have been written to the file
	fontObjects=[],	// Array of indices into pdfObjects for the supported fonts
	pageTree,		// Index into pdfObjects for the Page Tree object
	pdfObjects=[],	// Array holding byte offsets to the start of all objects in the PDF file
	output=[],		// Array holding all output streams
	outputIndex,
	outputs = ["Watermark","Header","Footer","Page"],
	pageRefs=[],	// Array holding the reference to the page objects pdfPageRefs.length = the number of pages
	pdfState = {};	// Cache the internal state of PDF parameters (to keep us from resetting things over & over

// Fonts and their metrics.  The metrics are stored for the font face and then characters that have
// different metrics for the bold/italic combinations are stored in their metrics.
var fonts = [
	{	aliases:	['helvetica','arial'],
		metrics:	{32:278,33:278,34:355,35:556,36:556,37:889,38:667,39:222,40:333,41:333,42:389,43:584,44:278,45:333,46:278,47:278,48:556,49:556,50:556,51:556,52:556,53:556,54:556,55:556,56:556,57:556,58:278,59:278,60:584,61:584,62:584,63:556,64:1015,65:667,66:667,67:722,68:722,69:667,70:611,71:778,72:722,73:278,74:500,75:667,76:556,77:833,78:722,79:778,80:667,81:778,82:722,83:667,84:611,85:722,86:667,87:944,88:667,89:667,90:611,91:278,92:278,93:278,94:469,95:556,96:222,97:556,98:556,99:500,100:556,101:556,102:278,103:556,104:556,105:222,106:222,107:500,108:222,109:833,110:556,111:556,112:556,113:556,114:333,115:500,116:278,117:556,118:500,119:722,120:500,121:500,122:500,123:334,124:260,125:334,126:584},
		normal:		{	name:				'Helvetica',
						UnderlinePosition:	-100,
						UnderlineThickness:	50,
						CapHeight:			718,
						XHeight:			523,
						Ascender:			718,
						Descender:			-207,
						metrics:			{},
						kern:{
							'A':	{'C':30,'G':30,'O':30,'Q':30,'T':120,'U':50,'V':70,'W':50,'Y':100,'u':30,'v':40,'w':40,'y':40},
							'B':	{'U':10},
							'D':	{'A':40,'V':70,'W':40,'Y':90},
							'F':	{'A':80,'a':50,'e':30,'o':30,'r':45},
							'J':	{'A':20,'a':20,'u':20},
							'K':	{'O':50,'e':40,'o':40,'u':30,'y':50},
							'L':	{'T':110,'V':110,'W':70,'Y':140,'y':30},
							'O':	{'A':20,'T':40,'V':50,'W':30,'X':60,'Y':70},
							'P':	{'A':120,'a':40,'e':50,'o':50},
							'Q':	{'U':10},
							'R':	{'O':20,'T':30,'U':40,'V':50,'W':30,'Y':50},
							'T':	{'A':120,'O':40,'a':120,'e':120,'o':120,'r':120,'u':120,'w':120,'y':120},
							'U':	{'A':40},
							'V':	{'A':80,'G':40,'O':40,'a':70,'e':80,'o':80,'u':70},
							'W':	{'A':50,'O':20,'a':40,'e':30,'o':30,'u':30,'y':20},
							'Y':	{'A':110,'O':85,'a':140,'e':140,'i':20,'o':140,'u':110},
							'a':	{'v':20,'w':20,'y':30},
							'b':	{'b':10,'l':20,'u':20,'v':20,'y':20},
							'c':	{'k':20},
							'e':	{'v':30,'w':20,'x':30,'y':20},
							'f':	{'a':30,'e':30,'o':30},
							'g':	{'r':10},
							'h':	{'y':30},
							'k':	{'e':20,'o':20},
							'm':	{'u':10,'y':15},
							'n':	{'u':10,'v':20,'y':15},
							'o':	{'v':15,'w':15,'x':30,'y':30},
							'p':	{'y':30},
							'r':	{'a':10,'i':15,'k':15,'l':15,'m':25,'n':25,'p':30,'t':40,'u':15,'v':30,'y':30},
							's':	{'w':30},
							'v':	{'a':25,'e':25,'o':25},
							'w':	{'a':15,'e':10,'o':10},
							'x':	{'e':30},
							'y':	{'a':20,'e':20,'o':20},
							'z':	{'e':15,'o':15}
				}
			},
		bold:		{	name:				'Helvetica-Bold',
						UnderlinePosition:	-100,
						UnderlineThickness:	50,
						CapHeight:			718,
						XHeight:			532,
						Ascender:			718,
						Descender:			-207,
						metrics:			{33:333,34:474,38:722,39:278,58:333,59:333,63:611,64:975,65:722,66:722,74:556,75:722,76:611,91:333,93:333,94:584,96:278,98:611,99:556,100:611,102:333,103:611,104:611,105:278,106:278,107:556,108:278,109:889,110:611,111:611,112:611,113:611,114:389,115:556,116:333,117:611,118:556,119:778,120:556,121:556,123:389,124:280,125:389},
						kern:{
							'A':	{'C':40,'G':50,'O':40,'Q':40,'T':90,'U':50,'V':80,'W':60,'Y':110,'u':30,'v':40,'w':30,'y':30},
							'B':	{'A':30,'U':10},
							'D':	{'A':40,'V':40,'W':40,'Y':70},
							'F':	{'A':80,'a':20},
							'J':	{'A':20,'u':20},
							'K':	{'O':30,'e':15,'o':35,'u':30,'y':40},
							'L':	{'T':90,'V':110,'W':80,'Y':120,'y':30},
							'O':	{'A':50,'T':40,'V':50,'W':50,'X':50,'Y':70},
							'P':	{'A':100,'a':30,'e':30,'o':40},
							'Q':	{'U':10},
							'R':	{'O':20,'T':20,'U':20,'V':50,'W':40,'Y':50},
							'T':	{'A':90,'O':40,'a':80,'e':60,'o':80,'r':80,'u':90,'w':60,'y':60},
							'U':	{'A':50},
							'V':	{'A':80,'G':50,'O':50,'a':60,'e':50,'o':90,'u':60},
							'W':	{'A':60,'O':20,'a':40,'e':35,'o':60,'u':45,'y':20},
							'Y':	{'A':110,'O':70,'a':90,'e':80,'o':100,'u':100},
							'a':	{'g':10,'v':15,'w':15,'y':20},
							'b':	{'l':10,'u':20,'v':20,'y':20},
							'c':	{'h':10,'k':20,'l':20,'y':10},
							'd':	{'d':10,'v':15,'w':15,'y':15},
							'e':	{'v':15,'w':15,'x':15,'y':15},
							'f':	{'e':10,'o':20},
							'g':	{'e':10,'g':10},
							'h':	{'y':20},
							'k':	{'o':15},
							'l':	{'w':15,'y':15},
							'm':	{'u':20,'y':30},
							'n':	{'u':10,'v':40,'y':20},
							'o':	{'v':20,'w':15,'x':30,'y':20},
							'p':	{'y':15},
							'r':	{'c':20,'d':20,'g':15,'o':20,'q':20,'s':15,'t':20,'v':10,'y':10},
							's':	{'w':15},
							'v':	{'a':20,'o':30},
							'w':	{'o':20},
							'x':	{'e':10},
							'y':	{'a':30,'e':10,'o':25},
							'z':	{'e':10}
				}
			},
		italic:		{	name:				'Helvetica-Oblique',
						UnderlinePosition:	-100,
						UnderlineThickness:	50,
						CapHeight:			718,
						XHeight:			523,
						Ascender:			718,
						Descender:			-207,
						metrics:			{},
						kern:{
							'A':	{'C':30,'G':30,'O':30,'Q':30,'T':120,'U':50,'V':70,'W':50,'Y':100,'u':30,'v':40,'w':40,'y':40},
							'B':	{'U':10},
							'D':	{'A':40,'V':70,'W':40,'Y':90},
							'F':	{'A':80,'a':50,'e':30,'o':30,'r':45},
							'J':	{'A':20,'a':20,'u':20},
							'K':	{'O':50,'e':40,'o':40,'u':30,'y':50},
							'L':	{'T':110,'V':110,'W':70,'Y':140,'y':30},
							'O':	{'A':20,'T':40,'V':50,'W':30,'X':60,'Y':70},
							'P':	{'A':120,'a':40,'e':50,'o':50},
							'Q':	{'U':10},
							'R':	{'O':20,'T':30,'U':40,'V':50,'W':30,'Y':50},
							'T':	{'A':120,'O':40,'a':120,'e':120,'o':120,'r':120,'u':120,'w':120,'y':120},
							'U':	{'A':40},
							'V':	{'A':80,'G':40,'O':40,'a':70,'e':80,'o':80,'u':70},
							'W':	{'A':50,'O':20,'a':40,'e':30,'o':30,'u':30,'y':20},
							'Y':	{'A':110,'O':85,'a':140,'e':140,'i':20,'o':140,'u':110},
							'a':	{'v':20,'w':20,'y':30},
							'b':	{'b':10,'l':20,'u':20,'v':20,'y':20},
							'c':	{'k':20},
							'e':	{'v':30,'w':20,'x':30,'y':20},
							'f':	{'a':30,'e':30,'o':30},
							'g':	{'r':10},
							'h':	{'y':30},
							'k':	{'e':20,'o':20},
							'm':	{'u':10,'y':15},
							'n':	{'u':10,'v':20,'y':15},
							'o':	{'v':15,'w':15,'x':30,'y':30},
							'p':	{'y':30},
							'r':	{'a':10,'i':15,'k':15,'l':15,'m':25,'n':25,'p':30,'t':40,'u':15,'v':30,'y':30},
							's':	{'w':30},
							'v':	{'a':25,'e':25,'o':25},
							'w':	{'a':15,'e':10,'o':10},
							'x':	{'e':30},
							'y':	{'a':20,'e':20,'o':20},
							'z':	{'e':15,'o':15}
				}
			},
		bolditalic:	{	name:				'Helvetica-BoldOblique',
						UnderlinePosition:	-100,
						UnderlineThickness:	50,
						CapHeight:			718,
						XHeight:			532,
						Ascender:			718,
						Descender:			-207,
						metrics:			{33:333,34:474,38:722,39:278,58:333,59:333,63:611,64:975,65:722,66:722,74:556,75:722,76:611,91:333,93:333,94:584,96:278,98:611,99:556,100:611,102:333,103:611,104:611,105:278,106:278,107:556,108:278,109:889,110:611,111:611,112:611,113:611,114:389,115:556,116:333,117:611,118:556,119:778,120:556,121:556,123:389,124:280,125:389},
						kern:{
							'A':	{'C':40,'G':50,'O':40,'Q':40,'T':90,'U':50,'V':80,'W':60,'Y':110,'u':30,'v':40,'w':30,'y':30},
							'B':	{'A':30,'U':10},
							'D':	{'A':40,'V':40,'W':40,'Y':70},
							'F':	{'A':80,'a':20},
							'J':	{'A':20,'u':20},
							'K':	{'O':30,'e':15,'o':35,'u':30,'y':40},
							'L':	{'T':90,'V':110,'W':80,'Y':120,'y':30},
							'O':	{'A':50,'T':40,'V':50,'W':50,'X':50,'Y':70},
							'P':	{'A':100,'a':30,'e':30,'o':40},
							'Q':	{'U':10},
							'R':	{'O':20,'T':20,'U':20,'V':50,'W':40,'Y':50},
							'T':	{'A':90,'O':40,'a':80,'e':60,'o':80,'r':80,'u':90,'w':60,'y':60},
							'U':	{'A':50},
							'V':	{'A':80,'G':50,'O':50,'a':60,'e':50,'o':90,'u':60},
							'W':	{'A':60,'O':20,'a':40,'e':35,'o':60,'u':45,'y':20},
							'Y':	{'A':110,'O':70,'a':90,'e':80,'o':100,'u':100},
							'a':	{'g':10,'v':15,'w':15,'y':20},
							'b':	{'l':10,'u':20,'v':20,'y':20},
							'c':	{'h':10,'k':20,'l':20,'y':10},
							'd':	{'d':10,'v':15,'w':15,'y':15},
							'e':	{'v':15,'w':15,'x':15,'y':15},
							'f':	{'e':10,'o':20},
							'g':	{'e':10,'g':10},
							'h':	{'y':20},
							'k':	{'o':15},
							'l':	{'w':15,'y':15},
							'm':	{'u':20,'y':30},
							'n':	{'u':10,'v':40,'y':20},
							'o':	{'v':20,'w':15,'x':30,'y':20},
							'p':	{'y':15},
							'r':	{'c':20,'d':20,'g':15,'o':20,'q':20,'s':15,'t':20,'v':10,'y':10},
							's':	{'w':15},
							'v':	{'a':20,'o':30},
							'w':	{'o':20},
							'x':	{'e':10},
							'y':	{'a':30,'e':10,'o':25},
							'z':	{'e':10}
				}
			}
	},
	{	aliases:	['times roman','times new roman'],
		metrics:	{32:250,33:333,34:408,35:500,36:500,37:833,38:778,39:333,40:333,41:333,42:500,43:564,44:250,45:333,46:250,47:278,48:500,49:500,50:500,51:500,52:500,53:500,54:500,55:500,56:500,57:500,58:278,59:278,60:564,61:564,62:564,63:444,64:921,65:722,66:667,67:667,68:722,69:611,70:556,71:722,72:722,73:333,74:389,75:722,76:611,77:889,78:722,79:722,80:556,81:722,82:667,83:556,84:611,85:722,86:722,87:944,88:722,89:722,90:611,91:333,92:278,93:333,94:469,95:500,96:333,97:444,98:500,99:444,100:500,101:444,102:333,103:500,104:500,105:278,106:278,107:500,108:278,109:778,110:500,111:500,112:500,113:500,114:333,115:389,116:278,117:500,118:500,119:722,120:500,121:500,122:444,123:480,124:200,125:480,126:541},
		normal:		{	name:				'Times-Roman',
						UnderlinePosition:	-100,
						UnderlineThickness:	50,
						CapHeight:			662,
						XHeight:			450,
						Ascender:			683,
						Descender:			-217,
						metrics:			{},
						kern:{
							'A':	{'C':40,'G':40,'O':55,'Q':55,'T':111,'U':55,'V':135,'W':90,'Y':105,'v':74,'w':92,'y':92},
							'B':	{'A':35,'U':10},
							'D':	{'A':40,'V':40,'W':30,'Y':55},
							'F':	{'A':74,'a':15,'o':15},
							'J':	{'A':60},
							'K':	{'O':30,'e':25,'o':35,'u':15,'y':25},
							'L':	{'T':92,'V':100,'W':74,'Y':100,'y':55},
							'N':	{'A':35},
							'O':	{'A':35,'T':40,'V':50,'W':35,'X':40,'Y':50},
							'P':	{'A':92,'a':15},
							'Q':	{'U':10},
							'R':	{'O':40,'T':60,'U':40,'V':80,'W':55,'Y':65},
							'T':	{'A':93,'O':18,'a':80,'e':70,'i':35,'o':80,'r':35,'u':45,'w':80,'y':80},
							'U':	{'A':40},
							'V':	{'A':135,'G':15,'O':40,'a':111,'e':111,'i':60,'o':129,'u':75},
							'W':	{'A':120,'O':10,'a':80,'e':80,'i':40,'o':80,'u':50,'y':73},
							'Y':	{'A':120,'O':30,'a':100,'e':100,'i':55,'o':110,'u':111},
							'a':	{'v':20,'w':15},
							'b':	{'u':20,'v':15},
							'c':	{'y':15},
							'e':	{'g':15,'v':25,'w':25,'x':15,'y':15},
							'f':	{'a':10,'f':25,'i':20},
							'g':	{'a':5},
							'h':	{'y':5},
							'i':	{'v':25},
							'k':	{'e':10,'o':10,'y':15},
							'l':	{'w':10},
							'n':	{'v':40,'y':15},
							'o':	{'v':15,'w':25,'y':10},
							'p':	{'y':10},
							'r':	{'g':18},
							'v':	{'a':25,'e':15,'o':20},
							'w':	{'a':10,'o':10},
							'x':	{'e':15}
				}
			},
		bold:		{	name:				'Times-Bold',
						UnderlinePosition:	-100,
						UnderlineThickness:	50,
						CapHeight:			676,
						XHeight:			461,
						Ascender:			683,
						Descender:			-217,
						metrics:			{34:555,37:1000,38:833,43:570,58:333,59:333,60:570,61:570,62:570,63:500,64:930,67:722,69:667,70:611,71:778,72:778,73:389,74:500,75:778,76:667,77:944,79:778,80:611,81:778,82:722,84:667,87:1000,90:667,94:581,97:500,98:556,100:556,104:556,106:333,107:556,109:833,110:556,112:556,113:556,114:444,116:333,117:556,123:394,124:220,125:394,126:520},
						kern:{
							'A':	{'C':55,'G':55,'O':45,'Q':45,'T':95,'U':50,'V':145,'W':130,'Y':100,'p':25,'u':50,'v':100,'w':90,'y':74},
							'B':	{'A':30,'U':10},
							'D':	{'A':35,'V':40,'W':40,'Y':40},
							'F':	{'A':90,'a':25,'e':25,'o':25},
							'J':	{'A':30,'a':15,'e':15,'o':15,'u':15},
							'K':	{'O':30,'e':25,'o':25,'u':15,'y':45},
							'L':	{'T':92,'V':92,'W':92,'Y':92,'y':55},
							'N':	{'A':20},
							'O':	{'A':40,'T':40,'V':50,'W':50,'X':40,'Y':50},
							'P':	{'A':74,'a':10,'e':20,'o':20},
							'Q':	{'U':10},
							'R':	{'O':30,'T':40,'U':30,'V':55,'W':35,'Y':35},
							'T':	{'A':90,'O':18,'a':92,'e':92,'i':18,'o':92,'r':74,'u':92,'w':74,'y':34},
							'U':	{'A':60},
							'V':	{'A':135,'G':30,'O':45,'a':92,'e':100,'i':37,'o':100,'u':92},
							'W':	{'A':120,'O':10,'a':65,'e':65,'i':18,'o':75,'u':50,'y':60},
							'Y':	{'A':110,'O':35,'a':85,'e':111,'i':37,'o':111,'u':92},
							'a':	{'v':25},
							'b':	{'b':10,'u':20,'v':15},
							'd':	{'w':15},
							'e':	{'v':15},
							'f':	{'i':25,'o':25},
							'h':	{'y':15},
							'i':	{'v':10},
							'k':	{'e':10,'o':15,'y':15},
							'n':	{'v':40},
							'o':	{'v':10,'w':10},
							'r':	{'c':18,'e':18,'g':10,'n':15,'o':18,'p':10,'q':18,'v':10},
							'v':	{'a':10,'e':10,'o':10},
							'w':	{'o':10},
							'y':	{'e':10,'o':25}
				}
			},
		italic:		{	name:				'Times-Italic',
						UnderlinePosition:	-100,
						UnderlineThickness:	50,
						CapHeight:			653,
						XHeight:			441,
						Ascender:			683,
						Descender:			-217,
						metrics:			{34:420,43:675,58:333,59:333,60:675,61:675,62:675,63:500,64:920,65:611,66:611,70:611,74:444,75:667,76:556,77:833,78:667,80:611,82:611,83:500,84:556,86:611,87:833,88:611,89:556,90:556,91:389,93:389,94:422,97:500,102:278,107:444,109:722,114:389,118:444,119:667,120:444,121:444,122:389,123:400,124:275,125:400},
						kern:{
							'A':	{'C':30,'G':35,'O':40,'Q':40,'T':37,'U':50,'V':105,'W':95,'Y':55,'u':20,'v':55,'w':55,'y':55},
							'B':	{'A':25,'U':10},
							'D':	{'A':35,'V':40,'W':40,'Y':40},
							'F':	{'A':115,'a':75,'e':75,'i':45,'o':105,'r':55},
							'J':	{'A':40,'a':35,'e':25,'o':25,'u':35},
							'K':	{'O':50,'e':35,'o':40,'u':40,'y':40},
							'L':	{'T':20,'V':55,'W':55,'Y':20,'y':30},
							'N':	{'A':27},
							'O':	{'A':55,'T':40,'V':50,'W':50,'X':40,'Y':50},
							'P':	{'A':90,'a':80,'e':80,'o':80},
							'Q':	{'U':10},
							'R':	{'O':40,'U':40,'V':18,'W':18,'Y':18},
							'T':	{'A':50,'O':18,'a':92,'e':92,'i':55,'o':92,'r':55,'u':55,'w':74,'y':74},
							'U':	{'A':40},
							'V':	{'A':60,'O':30,'a':111,'e':111,'i':74,'o':111,'u':74},
							'W':	{'A':60,'O':25,'a':92,'e':92,'i':55,'o':92,'u':55,'y':70},
							'Y':	{'A':50,'O':15,'a':92,'e':92,'i':74,'o':92,'u':92},
							'a':	{'g':10},
							'b':	{'u':20},
							'c':	{'h':15,'k':20},
							'e':	{'g':40,'v':15,'w':15,'x':20,'y':30},
							'f':	{'f':18,'i':20},
							'g':	{'e':10,'g':10},
							'k':	{'e':10,'o':10,'y':10},
							'n':	{'v':40},
							'o':	{'g':10,'v':10},
							'r':	{'a':15,'c':37,'d':37,'e':37,'g':37,'o':45,'q':37,'s':10}
				}
			},
		bolditalic:	{	name:				'Times-BoldItalic',
						UnderlinePosition:	-100,
						UnderlineThickness:	50,
						CapHeight:			669,
						XHeight:			462,
						Ascender:			683,
						Descender:			-217,
						metrics:			{33:389,34:555,43:570,58:333,59:333,60:570,61:570,62:570,63:500,64:832,65:667,69:667,70:667,72:778,73:389,74:500,75:667,80:611,86:667,87:889,88:667,89:611,94:570,97:500,104:556,110:556,114:389,117:556,118:444,119:667,121:444,122:389,123:348,124:220,125:348,126:570},
						kern:{
							'A':	{'C':65,'G':60,'O':50,'Q':55,'T':55,'U':50,'V':95,'W':100,'Y':70,'u':30,'v':74,'w':74,'y':74},
							'B':	{'A':25,'U':10},
							'D':	{'A':25,'V':50,'W':40,'Y':50},
							'F':	{'A':100,'a':95,'e':100,'i':40,'o':70,'r':50},
							'J':	{'A':25,'a':40,'e':40,'o':40,'u':40},
							'K':	{'O':30,'e':25,'o':25,'u':20,'y':20},
							'L':	{'T':18,'V':37,'W':37,'Y':37,'y':37},
							'N':	{'A':30},
							'O':	{'A':40,'T':40,'V':50,'W':50,'X':40,'Y':50},
							'P':	{'A':85,'a':40,'e':50,'o':55},
							'Q':	{'U':10},
							'R':	{'O':40,'T':30,'U':40,'V':18,'W':18,'Y':18},
							'T':	{'A':55,'O':18,'a':92,'e':92,'i':37,'o':95,'r':37,'u':37,'w':37,'y':37},
							'U':	{'A':45},
							'V':	{'A':85,'G':10,'O':30,'a':111,'e':111,'i':55,'o':111,'u':55},
							'W':	{'A':74,'O':15,'a':85,'e':90,'i':37,'o':80,'u':55,'y':55},
							'Y':	{'A':74,'O':25,'a':92,'e':111,'i':55,'o':111,'u':92},
							'b':	{'b':10,'u':20},
							'c':	{'h':10,'k':10},
							'e':	{'b':10},
							'f':	{'e':10,'f':18,'o':10},
							'k':	{'e':30,'o':10},
							'n':	{'v':40},
							'o':	{'v':15,'w':25,'x':10,'y':10},
							'v':	{'e':15,'o':15},
							'w':	{'a':10,'e':10,'o':15},
							'x':	{'e':10}
				}
			}
	},
	{	aliases:	['courier','courier new'],
		metrics:	{32:600,33:600,34:600,35:600,36:600,37:600,38:600,39:600,40:600,41:600,42:600,43:600,44:600,45:600,46:600,47:600,48:600,49:600,50:600,51:600,52:600,53:600,54:600,55:600,56:600,57:600,58:600,59:600,60:600,61:600,62:600,63:600,64:600,65:600,66:600,67:600,68:600,69:600,70:600,71:600,72:600,73:600,74:600,75:600,76:600,77:600,78:600,79:600,80:600,81:600,82:600,83:600,84:600,85:600,86:600,87:600,88:600,89:600,90:600,91:600,92:600,93:600,94:600,95:600,96:600,97:600,98:600,99:600,100:600,101:600,102:600,103:600,104:600,105:600,106:600,107:600,108:600,109:600,110:600,111:600,112:600,113:600,114:600,115:600,116:600,117:600,118:600,119:600,120:600,121:600,122:600,123:600,124:600,125:600,126:600},
		normal:		{	name:				'Courier',
						UnderlinePosition:	-100,
						UnderlineThickness:	50,
						CapHeight:			562,
						XHeight:			426,
						Ascender:			629,
						Descender:			-157,
						metrics:			{},
						kern:				null
			},
		bold:		{	name:				'Courier-Bold',
						UnderlinePosition:	-100,
						UnderlineThickness:	50,
						CapHeight:			562,
						XHeight:			439,
						Ascender:			629,
						Descender:			-157,
						metrics:			{},
						kern:				null
			},
		italic:		{	name:				'Courier-Oblique',
						UnderlinePosition:	-100,
						UnderlineThickness:	50,
						CapHeight:			562,
						XHeight:			426,
						Ascender:			629,
						Descender:			-157,
						metrics:			{},
						kern:				null
			},
		bolditalic:	{	name:				'Courier-BoldOblique',
						UnderlinePosition:	-100,
						UnderlineThickness:	50,
						CapHeight:			562,
						XHeight:			439,
						Ascender:			629,
						Descender:			-157,
						metrics:			{},
						kern:				null
			}
	},
	{	aliases:	['symbol'],
		metrics:	{32:250,33:333,34:713,35:500,36:549,37:833,38:778,39:439,40:333,41:333,42:500,43:549,44:250,45:549,46:250,47:278,48:500,49:500,50:500,51:500,52:500,53:500,54:500,55:500,56:500,57:500,58:278,59:278,60:549,61:549,62:549,63:444,64:549,65:722,66:667,67:722,68:612,69:611,70:763,71:603,72:722,73:333,74:631,75:722,76:686,77:889,78:722,79:722,80:768,81:741,82:556,83:592,84:611,85:690,86:439,87:768,88:645,89:795,90:611,91:333,92:863,93:333,94:658,95:500,96:500,97:631,98:549,99:549,100:494,101:439,102:521,103:411,104:603,105:329,106:603,107:549,108:549,109:576,110:521,111:549,112:549,113:521,114:549,115:603,116:439,117:576,118:713,119:686,120:493,121:686,122:494,123:480,124:200,125:480,126:549},
		normal:		{	name:				'Symbol',
						UnderlinePosition:	-100,
						UnderlineThickness:	50,
						metrics:			{},
						kern:				null
			},
		bold:		{	name:				'Symbol',
						UnderlinePosition:	-100,
						UnderlineThickness:	50,
						metrics:			{},
						kern:				null
			},
		italic:		{	name:				'Symbol',
						UnderlinePosition:	-100,
						UnderlineThickness:	50,
						metrics:			{},
						kern:				null
			},
		bolditalic:	{	name:				'Symbol',
						UnderlinePosition:	-100,
						UnderlineThickness:	50,
						metrics:			{},
						kern:				null
			}
	},
	{	aliases:	['zap dingbats','zap f dingbats','zapdingbats','zapfdingbats','dingbats','wingdings'],
		metrics:	{32:278,33:974,34:961,35:974,36:980,37:719,38:789,39:790,40:791,41:690,42:960,43:939,44:549,45:855,46:911,47:933,48:911,49:945,50:974,51:755,52:846,53:762,54:761,55:571,56:677,57:763,58:760,59:759,60:754,61:494,62:552,63:537,64:577,65:692,66:786,67:788,68:788,69:790,70:793,71:794,72:816,73:823,74:789,75:841,76:823,77:833,78:816,79:831,80:923,81:744,82:723,83:749,84:790,85:792,86:695,87:776,88:768,89:792,90:759,91:707,92:708,93:682,94:701,95:826,96:815,97:789,98:789,99:707,100:687,101:696,102:689,103:786,104:787,105:713,106:791,107:785,108:791,109:873,110:761,111:762,112:762,113:759,114:759,115:892,116:892,117:788,118:784,119:438,120:138,121:277,122:415,123:392,124:392,125:668,126:668,128:390},
		normal:		{	name:				'ZapfDingbats',
						UnderlinePosition:	-100,
						UnderlineThickness:	50,
						metrics:			{},
						kern:				null
			},
		bold:		{	name:				'ZapfDingbats',
						UnderlinePosition:	-100,
						UnderlineThickness:	50,
						metrics:			{},
						kern:				null
			},
		italic:		{	name:				'ZapfDingbats',
						UnderlinePosition:	-100,
						UnderlineThickness:	50,
						metrics:			{},
						kern:				null
			},
		bolditalic:	{	name:				'ZapfDingbats',
						UnderlinePosition:	-100,
						UnderlineThickness:	50,
						metrics:			{},
						kern:				null
			}
	}
];

/* Private Methods */
//----------Helper Funcitons---------------------------
function CInt(v) {
	return (typeof(v) == "undefined" || v === null) ? null : parseInt(v);
}
function CStr(s) {
	if (typeof(s)  ==  "date") {
		return formatDate(s, "o/d/Y T");
	}
	if (typeof(s) == "undefined" || s==null) {
		return "";
	}
	return String(s);
}
function Round(v, dp) {
	var exp = parseInt(dp), pow = Math.pow(10, exp === NaN ? 0 : exp), n = parseFloat(v);
	return Math.round(n*pow)/pow;
}
function isDefined(v) {
	return typeof(v) != "undefined" && v !== null;
}
function buffer(separator) {
	var output = [];
	this.separator = separator || "\n";
	this.clear = function() {
		output = [];
	}
	this.length = function() {
		return output.length;
	}
	this.size = function() {
		var i, sz;
		for (sz = i = 0; i < output.length; i++) {
			sz += output[i].length;
		}
		if (output.length > 1) {
			sz += (separator.length * (output.length-1));
		}
		return sz;
	}
	this.add = function(s) {
		output[output.length] = s;
	}
	this.toString = function() {
		return output.join(this.separator);
	}
}
//-----------------------------------------------------
function getState() {
	return {
		foreColor: self.foreColor,
		fillColor: self.fillColor,
		fontFamily: self.fontFamily,
		fontSize: self.fontSize,
		fontBold: self.fontBold,
		fontItalic: self.fontItalic,
		lineWidth: self.lineWidth,
		lineStyle: self.lineStyle,
		lineEndStyle: self.lineEndStyle,
		lineJoinStyle: self.lineJoinStyle,
		fontAlignment: self.fontAlignment,
		kern: self.kern
	};
}
function setState(o) {
	self.foreColor = o.foreColor;
	self.fillColor = o.fillColor;
	self.fontFamily = o.fontFamily;
	self.fontSize = o.fontSize;
	self.fontBold = o.fontBold;
	self.fontItalic = o.fontItalic;
	self.lineWidth = o.lineWidth;
	self.lineStyle = o.lineStyle;
	self.lineEndStyle = o.lineEndStyle;
	self.lineJoinStyle = o.lineJoinStyle;
	self.fontAlignment = o.fontAlignment;
	self.kern = o.kern;
}
// Create an indirect object reference
function objRef(obj) {
	return obj + " 0 R";
}

// Convert an value from inches to PDF space (72 points/inch), don't apply any offsets
function mapV(v) {
	return v * 72;
}

// Convert an X value from real world (inches) to PDF (points)
function mapX(x) {
	return ((x >= 0 ? x : self.pageWidth + x) + (output[outputIndex].left >= 0 ? output[outputIndex].left : self.pageWidth + output[outputIndex].left)) * 72;
}

// Convert a Y value from real world (inches) to PDF (points)
// PDF sees the lower right corner of a page as 0,0 -- convert this to the upper left corner
function mapY(y) {
	return (self.pageHeight - (output[outputIndex].top >= 0 ? output[outputIndex].top : self.pageHeight + output[outputIndex].top) - (y >= 0 ? y : self.pageHeight + y)) * 72;
}

// Set the maximum Y extent on the page (for the current output buffer)
function setMaxY(y) {
	return output[outputIndex].maxY = Math.max(output[outputIndex].maxY, y);
}

// Create a font reference resource for all fonts available.
// This should really only add references for the fonts used -- Has to reference all fonts
function fontRef() {
	var i, x, a, s;
	
	s = "<<";
	for (i = 0; i < fonts.length; i++) {
		x = i*4;
		s += "/F" + x + " " + objRef(fontObjects[x]);
		s += "/F" + (x+1) + " " + objRef(fontObjects[x+1]);
		s += "/F" + (x+2) + " " + objRef(fontObjects[x+2]);
		s += "/F" + (x+3) + " " + objRef(fontObjects[x+3]);
	}
	return s + ">>\r\n";
}

// Create the resources reference for a page object (all fonts used on the page)
function resources() {
	return "/Resources <<\r\n\t/Font " + fontRef() + ">>\r\n";
}
// Builds a stream from the data in the pdfText and pdfGraphics arrays.
// The stream is ready for being written into a page content object
function buildStream(ndx) {
	var i, s="";
	if (output[ndx].graphics.length > 0) {
		s += output[ndx].graphics.join("\r\n") + "\r\n";
	}
	if (output[ndx].text.length > 0) {
		s += "BT" + "\r\n";
		s += output[ndx].text.join("\r\n") + "\r\n";
		s += "ET" + "\r\n";
	}
	return s;
}

// Return array of indirect object references that make up the contents of this page
function contentsRef() {
	var i, a = [];
	for (i = O_FIRST; i <= O_LAST; i++) {
		if (output[i].obj) {
			a.push(objRef(output[i].obj));
		}
	}
	return a.length == 0 ? "[]" : a.length > 1 ? "[" + a.join(" ") + "]" : a.join(" ");
}
// Because we have to know the length of the text object stream before we write them out
// We save the text in an array.  This routine calculates the length of all text strings
// Writes the header and then writes the text stream.
function writePage(obj) {
	var a, s, x, i, annots;

	self.emit("beforeWritePage", {pageNo:self.pageNo, pageWidth:self.pageWidth, pageHeight:self.pageHeight});
	annots = annotations();
	for (i = O_FIRST; i <= O_LAST; i++) {
		s = buildStream(i);
		if (s != "" || i == O_PAGE) {
			objNo += 1;
			pdfObjects[objNo] = fileOffset;
			write(objNo + " 0 obj\r\n<<\r\n/Length " + s.length + "\r\n>>\r\nstream\r\n" + s + "endstream\r\nendobj");
			output[i].obj = objNo;
			output[i].text = [];
			output[i].graphics = [];
			output[i].annotations = [];
			output[i].maxY = 0;
		}
	}

	// Only output the fonts on the first page
	if (pageRefs.length == 2) {
		for (i = 0; i < fonts.length; i++) {
			x = i*4;
			fontObjects[x] = pdfObject(null, "/Type/Font/Subtype/Type1\r\n/Name/F" + x + "\r\n/Encoding/MacRomanEncoding\r\n/BaseFont/" + fonts[i].normal.name);
			fontObjects[x+1] = pdfObject(null, "/Type/Font/Subtype/Type1\r\n/Name/F" + (x+1) + "\r\n/Encoding/MacRomanEncoding\r\n/BaseFont/" + fonts[i].bold.name);
			fontObjects[x+2] = pdfObject(null, "/Type/Font/Subtype/Type1\r\n/Name/F" + (x+2) + "\r\n/Encoding/MacRomanEncoding\r\n/BaseFont/" + fonts[i].italic.name);
			fontObjects[x+3] = pdfObject(null, "/Type/Font/Subtype/Type1\r\n/Name/F" + (x+3) + "\r\n/Encoding/MacRomanEncoding\r\n/BaseFont/" + fonts[i].bolditalic.name);
		}
	}
	pageRefs[pageRefs.length-1] = pdfObject(null, "/Parent " + objRef(pageTree) + "\r\n/Type/Page\r\n/MediaBox[0 0 " + fn(mapV(self.pageWidth)) + " " + fn(mapV(self.pageHeight)) + "]" + "\r\n" + resources() + "/Contents " + contentsRef() + annots);
	self.pageNo += 1;
}

// Write out a string to the PDF file.
// Add the length of the outgoing string (plus the CRLF) to pdfN -- needed for the cross reference table we have to create.
function write(s) {
	fileOffset += s.length + 2;
	buf.add(s);
}

// Write out a string to the PDF file.
// Add the length of the outgoing string (plus the CRLF) to pdfN -- needed for the cross reference table we have to create.
function pdfObject(ndx, obj) {
	var x;
	
	if (isDefined(ndx)) {
		x = ndx;
	}
	else {
		objNo += 1;
		x = objNo;
	}
	pdfObjects[x] = fileOffset;
	write(x + " 0 obj\r\n<<\r\n" + obj + "\r\n>>\r\nendobj");
	return x;
}
// Takes either a 6 digit HTML hex color string or it's integer equivalent, converts to PDF color values
function pdfColor(color) {
	var a=[], c;

	c = typeof(color) == "string" ? parseInt(color.replace(/#/g, ""), 16) : CInt(color);

	a[0] = CInt(c / 0x10000);
	a[1] = CInt((c & 0xff00) / 0x100);
	a[2] = CInt(c & 0xff);
	return a;
}

// Takes a color array and builds the PDF color command (RG or rg)
function pdfColorCommand(color, command) {
	return fn(color[0]/256) + " " + fn(color[1]/256) + " " + fn(color[2]/256) + " " + command;
}

// Format a numeric value for a PDF file
function fn(n) {
	return ""+Round(n, 3);
}

// Get all information about a font and font family
function getFont(fontFamily, fontBold, fontItalic, fontSize) {
	var obj = {index: 0, fontFamily: fontFamily || self.fontFamily, fontBold: fontBold || self.fontBold, fontItalic: fontItalic || self.fontItalic, fontSize: fontSize || self.fontSize, kern: self.kern};

	obj.index = selectFont(obj.fontFamily);
	obj.family = fonts[CInt(obj.index/4)];
	obj.font = obj.family[obj.fontBold ? obj.fontItalic ? "bolditalic" : "bold" : obj.fontItalic ? "italic" : "normal"];
	obj.UnderlinePosition =	(obj.font.UnderlinePosition * (obj.fontSize/72)) / 1000;
	obj.UnderlineThickness = obj.font.UnderlineThickness;
	obj.CapHeight =			(obj.font.CapHeight * (obj.fontSize/72)) / 1000
	obj.XHeight =			(obj.font.XHeight * (obj.fontSize/72)) / 1000;
	obj.Ascender =			(obj.font.Ascender * (obj.fontSize/72)) / 1000;
	obj.Descender =			(obj.font.Descender * (obj.fontSize/72)) / 1000;
	return obj;
}

// Look up the font name and parameters (bold/italic) and select the PDF font index
function selectFont(fontFamily, fontBold, fontItalic) {
	var i, j, fnt;
	var fFamily = fontFamily || self.fontFamily;
	var fBold = fontBold || self.fontBold;
	var fItalic = fontItalic || self.fontItalic;

	fnt = String(fFamily).toLowerCase();
	for (i = 0; i < fonts.length; i++) {
		for (j = 0; j < fonts[i].aliases.length; j++) {
			if (fnt == fonts[i].aliases[j] || fnt == fonts[i].aliases[j].replace(/ +/g, "")) {
				return (i * 4) + (fBold ? 1 : 0) + (fItalic ? 2 : 0);
			}
		}
	}
	return 1;		// Default font is Times Roman
}
// Generate a unique identifier for this PDF
function pdfIdentifier() {
	var i, s1, s2, d;

	//First ident string -- 10 random values and 'lattice'
	// First Start with 10 Random Hex values
	s1 = "";
	for (i = 0; i < 10; i++) {
		s1 += ('0'+parseInt(Math.random()*256, 10).toString(16)).slice(-2);
	}
	s1 += "4C617474696365";		// Hex for 'Lattice'

	//Second ident string (year, day of year, week of year, month, hour, minute, second) + 10 random values
	s2 = "";
	d = new Date();
	s2  = ('0'+parseInt(formatDate(d, "y"), 10).toString(16)).slice(-2);
	s2 += ('0'+parseInt(formatDate(d, "m"), 10).toString(16)).slice(-2);
	s2 += ('0'+parseInt(formatDate(d, "d"), 10).toString(16)).slice(-2);
	s2 += ('0'+parseInt(formatDate(d, "h"), 10).toString(16)).slice(-2);
	s2 += ('0'+parseInt(formatDate(d, "n"), 10).toString(16)).slice(-2);
	s2 += ('0'+parseInt(formatDate(d, "s"), 10).toString(16)).slice(-2);
	for (i1 = 0; i1 < 10; i1++) {
		s2 += ('0'+parseInt(Math.random()*256, 10).toString(16)).slice(-2);
	}
	return "<" + s1.toUpperCase() + "><" + s2.toUpperCase() + ">";
}
function getLineStyle(style) {
	return ["[]",			// 0 = LINE_SOLID
			"[3]",			// 1 = LINE_DASH
			"[1 3]",		// 2 = LINE_DOT
			"[3 3 1 3]",	// 3 = LINE_DASHDOT
			"[3 3 1 3 1 3]",// 4 = LINE_DASHDOTDOT
			"[]",			// 5 = LINE_INVISIBLE -- don't do invisible
			"[]"			// 6 = LINE_INSIDESOLID
	][Math.max(Math.min(6, style), 0)] + " 0 d";
}
// return font index
function xFont(fontFamily, fontBold, fontItalic) {
	var fontIndex = selectFont(fontFamily, fontBold, fontItalic);
	if (fontIndex !== pdfState.fontIndex) {
		pdfState.fontIndex = fontIndex;
		return "/F" + fontIndex + " 1 Tf\r\n";
	}
	return "";
}
// return line parameters
function xLineParameters(lineWidth, lineStyle) {
	var lw = isDefined(lineWidth) ? lineWidth : self.lineWidth, ls = lineStyle || self.lineStyle;
	if (lw !== pdfState.lineWidth || ls !== pdfState.lineStyle || self.lineEndStyle !== pdfState.lineEndStyle) {
		pdfState.lineWidth = lw;
		pdfState.lineStyle = ls;
		pdfState.lineEndStyle = self.lineEndStyle;
		return self.lineEndStyle + " J " + getLineStyle(ls) + " " + lw + " w\r\n";
	}
	return "";
}
// return line color
function xLineColor(lineColor) {
	var lc = lineColor || self.lineColor;
	if (lc !== pdfState.lineColor) {
		pdfState.lineColor = lc;
		return pdfColorCommand(pdfColor(lc), "RG") + "\r\n";
	}
	return "";
}
function xForeColor(foreColor) {
	var fc = foreColor || self.foreColor;
	if (fc !== pdfState.foreColor) {
		pdfState.foreColor = fc;
		return pdfColorCommand(pdfColor(fc), "rg") + "\r\n";
	}
	return "";
}
function xFillColor(fillColor) {
	var fc = fillColor || self.fillColor;
	if (fc !== pdfState.fillColor) {
		pdfState.fillColor = pdfState.foreColor = fc;
		return pdfColorCommand(pdfColor(fc), "rg") + "\r\n";
	}
	return "";
}
function breakStr(s, width, fixedWidth) {
	var i, j, t;
	fixedWidth = fixedWidth || 0;
	for (i = s.length-2; i >= 0; i--) {
		t = s.slice(0, i);
		if (fixedWidth + self.textWidth(t) < width) {
			if (s.charAt(i) != " ") {
				j = Math.max(Math.max(t.lastIndexOf(" "), t.lastIndexOf("-")), t.lastIndexOf("/"));
				j = j >= 0 ? j+1 : i;
			}
			else {
				j = i;
			}
			return [s.trim().slice(0, j), s.trim().slice(0,-j)];
		}
	}
	return [s, ""];
}
// Build the annotations section (hyperlinks) section
function annotations() {
	var i, j, a = [];
	for (i = O_FIRST; i <= O_LAST; i++) {
		for (j = 0; j < output[i].annotations.length; j++) {
			a.push(output[i].annotations[j]);
		}
	}
	if (a.length > 0) {
		objNo += 1;
		pdfObjects[objNo] = fileOffset;
		write(objNo + " 0 obj\r\n[\r\n" + a.join("\r\n") + "\r\n]\r\nendobj");
		return "\r\n/Annots " + objRef(objNo);
	}
	return "";
}
// Add an annotation (hyperlink) on the page
function annotation(obj) {
	output[outputIndex].annotations.push(objRef(obj));
}
// Add item to page
function add(type, contents) {
	if (type == TEXT) {
		output[outputIndex].text.push(contents);
	}
	else {
		output[outputIndex].graphics.push(contents);
	}
}
// make objects to support an annotation (hyperlink)
function mkLink(x, y, kt, href, foreColor) {
	var uri, rect, ascender, descender;
	ascender = y-kt.Ascender;
	descender = y-kt.Descender;
	uri = pdfObject(null, "/Type /Action\r\n/S /URI\r\n/URI (" + href + ")");
	rect = pdfObject(null, "/Type /Annot\r\n/Subtype /Link\r\n/A " + objRef(uri) + "\r\n/Rect [ " + fn(mapX(x)) + " " + fn(mapY(ascender)) + " " + fn(mapX(x+kt.textWidth)) + " " + fn(mapY(descender)) + " ]\r\n/Border [ 10 10 10 60 ]");
	annotation(rect);
	self.hLine(x, y-kt.UnderlinePosition, kt.textWidth, foreColor, kt.UnderlineThickness/72, self.LINE_SOLID);
}
// cache widths for all the provided words
function cacheTextWidths(str, font, fontSize, fontFamily, fontBold, fontItalic) {
	var i, ci, wc, words = typeof(str)=="object" && str.slice ? str : str.split(" ");
	font = font || getFont(fontFamily, fontBold, fontItalic, fontSize);
	if (!font.font.widthCache) {
		font.font.widthCache = {};
	}
	ci = font.fontSize.toString() + (font.kern ? "K" : "k");
	wc = font.font.widthCache[ci];
	if (!wc) {
		wc = font.font.widthCache[ci] = {};
		wc[""] = 0;
		wc[" "] = self.textWidth(" ", font.fontSize, font.fontFamily, font.fontBold, font.fontItalic);
	}
	for (i = 0; i < words.length; i++) {
		if (!wc[words[i]]) {
			wc[words[i]] = self.textWidth(words[i], font.fontSize, font.fontFamily, font.fontBold, font.fontItalic);
		}
	}
	return wc;
}

function lattice(orientation) {
	self = this;
	events.EventEmitter.call(this);
	self.version = "0.1.0";

	// Fill Types
	self.FILL_SOLID = 0;
	self.FILL_TRANSPARENT = 1;
	self.FILL_HORIZLINE = 2;
	self.FILL_VERTLINE = 3;
	self.FILL_UPDIAG = 4;
	self.FILL_DOWNDIAG = 5;
	self.FILL_CROSS = 6;
	self.FILL_DIAGCROSS = 7;

	// Line Types
	self.LINE_SOLID = 0;
	self.LINE_DASH = 1;
	self.LINE_DOT = 2;
	self.LINE_DASHDOT = 3;
	self.LINE_DASHDOTDOT = 4;
	self.LINE_INVISIBLE = 5;
	self.LINE_INSIDESOLID = 6;

	// Line End Styles
	self.LINEEND_BUTT = 0;
	self.LINEEND_CAP = 1;
	self.LINEEND_PROJECTING_SQUARE = 2;

	// Line Join Styles
	self.LINEJOIN_MITER = 0;
	self.LINEJOIN_ROUND = 1;
	self.LINEJOIN_BEVEL = 2;

	// Page Style
	self.PORTRAIT = 1;
	self.LANDSCAPE = 2;

	// Alignment
	self.ALIGN_LEFT = "L";
	self.ALIGN_RIGHT = "R";
	self.ALIGN_CENTER = "C";

	// Font Alignment
	self.BASELINE = 0;
	self.ASCENDER = 1;
	self.CAPHEIGHT = 2;
}
sys.inherits(lattice, events.EventEmitter);
exports.lattice = lattice;

/* Public Methods */
lattice.prototype.begin = function(orientation) {
	buf = new buffer("\r\n");
	finished = false;
	self.pageNo = 1;
	self.pageLeftOffset = self.pageTopOffset = 0;
	self.pageOrientation = orientation == self.LANDSCAPE ? self.LANDSCAPE : self.PORTRAIT;
	self.pageWidth = self.pageOrientation  == self.LANDSCAPE ? 11 : 8.5;
	self.pageHeight = self.pageOrientation == self.LANDSCAPE ? 8.5 : 11;
	outputIndex = O_PAGE;
	output[O_PAGE] = {text:[], graphics:[], annotations:[], obj: objNo, top: self.pageTopOffset, left: self.pageLeftOffset, maxY: 0};
	output[O_HEADER] = {text:[], graphics:[], annotations:[], top: 0, left:0, maxY: 0};
	output[O_FOOTER] = {text:[], graphics:[], annotations:[], top: 0, left:0, maxY: 0};
	output[O_WATERMARK] = {text:[], graphics:[], annotations:[], top: 0, left:0, maxY: 0};
	fileOffset = 0;
	self.foreColor = self.lineColor = "000000";
	self.fillColor = "ffffff";
	self.fontSize = 12;
	self.fontBold = false;
	self.fontItalic = false;
	self.lineWidth = 1;
	self.lineStyle = 0;
	self.lineEndStyle = self.LINEEND_BUTT;
	self.lineJoinStyle = self.LINEJOIN_MITER;
	self.fontAlignment = self.BASELINE;
	self.fontFamily = "Times New Roman";
	self.kern = true;
	// Reserve object 0 for the Page Tree - can't be output till the document is ended
	// Reserve object 1 for the content of page #1
	pageRefs = [null,null];
	pageTree = 1;
	pdfObjects = [null,null];
	objNo = 1;
	write("%PDF-1.3");
}
  /**
   * Initialize the pdf engine
   *
   * @param {Number} pageOrientation PORTRAIT or LANDSCAPE, defaults to PORTRAIT
   */
lattice.prototype.setColor = function(foreColor, fillColor) {
	if (isDefined(foreColor)) self.foreColor = foreColor;
	if (isDefined(fillColor)) self.fillColor = fillColor;
}
lattice.prototype.setLine = function(lineColor, lineStyle, lineWidth, lineEndStyle, lineJoinStyle) {
	if (isDefined(lineColor)) self.lineColor = lineColor;
	if (isDefined(lineStyle)) self.lineStyle = lineStyle;
	if (isDefined(lineWidth)) self.lineWidth = lineWidth;
	if (isDefined(lineEndStyle)) self.lineEndStyle = lineEndStyle;
	if (isDefined(lineJoinStyle)) self.lineJoinStyle = lineJoinStyle;
}
lattice.prototype.setFont = function(fontSize, fontFamily, fontBold, fontItalic, foreColor) {
	if (isDefined(fontFamily)) self.fontFamily = fontFamily;
	if (isDefined(fontSize)) self.fontSize = fontSize;
	if (isDefined(fontBold)) self.fontBold = fontBold;
	if (isDefined(fontItalic)) self.fontItalic = fontItalic;
	if (isDefined(foreColor)) self.foreColor = foreColor;
}
lattice.prototype.line = function(x1, y1, x2, y2, lineColor, lineWidth, lineStyle) {
	setMaxY(Math.max(y1,y2));
	add(GRAPHICS, 
			xLineParameters(lineWidth, lineStyle) +
			xLineColor(lineColor) +
			fn(mapX(x1)) + " " + fn(mapY(y1)) + " m" + "\r\n" +
			fn(mapX(x2)) + " " + fn(mapY(y2)) + " l" + "\r\n" +
			"S");
}
lattice.prototype.vLine = function(x, y, length, lineColor, lineWidth, lineStyle) {
	setMaxY(y+length);
	add(GRAPHICS, 
			xLineParameters(lineWidth, lineStyle) +
			xLineColor(lineColor) +
			fn(mapX(x)) + " " + fn(mapY(y)) + " m" + "\r\n" +
			fn(mapX(x)) + " " + fn(mapY(y+length)) + " l" + "\r\n" +
			"S");
}
lattice.prototype.hLine = function(x, y, length, lineColor, lineWidth, lineStyle) {
	setMaxY(y);
	add(GRAPHICS, 
			xLineParameters(lineWidth, lineStyle) +
			xLineColor(lineColor) +
			fn(mapX(x)) + " " + fn(mapY(y)) + " m" + "\r\n" +
			fn(mapX(x+length)) + " " + fn(mapY(y)) + " l" + "\r\n" +
			"S");
}
/*
 * See http://www.whizkidtech.redprince.net/bezier/circle/kappa/
 * from that article, kappa = 0.5522847498
 */
lattice.prototype.circle = function(x, y, r, lineColor, fillColor, lineWidth, lineStyle) {
	var kappa = ((Math.sqrt(2)-1) / 3) * 4;
	setMaxY(y+r);
	add(GRAPHICS,
			xLineParameters(lineWidth, lineStyle) +
			xLineColor(lineColor) +
			fn(mapX(x-r)) + " " + fn(mapY(y)) + " m" + "\r\n" +
			fn(mapX(x-r)) + " " + fn(mapY(y-(r*kappa))) + " " + fn(mapX(x-(r*kappa))) + " " + fn(mapY(y-r)) + " " + fn(mapX(x)) + " " + fn(mapY(y-r)) + " c" + "\r\n" +
			fn(mapX(x+(r*kappa))) + " " + fn(mapY(y-r)) + " " + fn(mapX(x+r)) + " " + fn(mapY(y-(r*kappa))) + " " + fn(mapX(x+r)) + " " + fn(mapY(y)) + " c" + "\r\n" +
			fn(mapX(x+r)) + " " + fn(mapY(y+(r*kappa))) + " " + fn(mapX(x+(r*kappa))) + " " + fn(mapY(y+r)) + " " + fn(mapX(x)) + " " + fn(mapY(y+r)) + " c" + "\r\n" +
			fn(mapX(x-(r*kappa))) + " " + fn(mapY(y+r)) + " " + fn(mapX(x-r)) + " " + fn(mapY(y+(r*kappa))) + " " + fn(mapX(x-r)) + " " + fn(mapY(y)) + " c" + "\r\n" +
			"s");
	if (isDefined(fillColor)) {
		add(GRAPHICS,
				xFillColor(fillColor) +
				fn(mapX(x-r)) + " " + fn(mapY(y)) + " m" + "\r\n" +
				fn(mapX(x-r)) + " " + fn(mapY(y-(r*kappa))) + " " + fn(mapX(x-(r*kappa))) + " " + fn(mapY(y-r)) + " " + fn(mapX(x)) + " " + fn(mapY(y-r)) + " c" + "\r\n" +
				fn(mapX(x+(r*kappa))) + " " + fn(mapY(y-r)) + " " + fn(mapX(x+r)) + " " + fn(mapY(y-(r*kappa))) + " " + fn(mapX(x+r)) + " " + fn(mapY(y)) + " c" + "\r\n" +
				fn(mapX(x+r)) + " " + fn(mapY(y+(r*kappa))) + " " + fn(mapX(x+(r*kappa))) + " " + fn(mapY(y+r)) + " " + fn(mapX(x)) + " " + fn(mapY(y+r)) + " c" + "\r\n" +
				fn(mapX(x-(r*kappa))) + " " + fn(mapY(y+r)) + " " + fn(mapX(x-r)) + " " + fn(mapY(y+(r*kappa))) + " " + fn(mapX(x-r)) + " " + fn(mapY(y)) + " c" + "\r\n" +
				"f*");
	}
}
lattice.prototype.rectangle = function(x, y, width, height, lineColor, fillColor, lineWidth, lineStyle) {
	setMaxY(y+height);
	if (isDefined(fillColor)) {
		add(GRAPHICS, 
				xFillColor(fillColor) +
				xLineParameters(lineWidth, lineStyle) +
				xLineColor(lineColor) +
				fn(mapX(x)) + " " + fn(mapY(y)) + " m" + "\r\n" +
				fn(mapX(x)) + " " + fn(mapY(y+height)) + " l" + "\r\n" +
				fn(mapX(x+width)) + " " + fn(mapY(y+height)) + " l" + "\r\n" +
				fn(mapX(x+width)) + " " + fn(mapY(y)) + " l" + "\r\n" +
				"h B");
	}
	else {
		add(GRAPHICS, 
				xLineParameters(lineWidth, lineStyle) +
				xLineColor(lineColor) +
				fn(mapX(x)) + " " + fn(mapY(y)) + " m" + "\r\n" +
				fn(mapX(x)) + " " + fn(mapY(y+height)) + " l" + "\r\n" +
				fn(mapX(x+width)) + " " + fn(mapY(y+height)) + " l" + "\r\n" +
				fn(mapX(x+width)) + " " + fn(mapY(y)) + " l" + "\r\n" +
				"h\r\ns");
	}
}
lattice.prototype.grid = function(x, y, cols, colWidth, rows, rowHeight, lineColor) {
	var i;
	setMaxY(y + (rows*rowHeight));
	for (i = 0; i <= cols; i++) {
		self.vLine(x + (i*colWidth), y, rowHeight * rows, lineColor);
	}
	for (i = 0; i <= rows; i++) {
		self.hLine(x, y+(i*rowHeight), colWidth * cols, lineColor);
	}
}
lattice.prototype.text = function(x, y, str, fontSize, fontFamily, fontBold, fontItalic, foreColor, href) {
	var Y, kt, fColor = foreColor || (href ? "0000ff" : self.foreColor), fSize = fontSize || self.fontSize;
	setMaxY(y);
	if (CStr(str) != "") {
		kt = self.kernText(str, fontSize, fontFamily, fontBold, fontItalic);
		Y = y + (self.fontAlignment == self.CAPHEIGHT ? kt.CapHeight : self.fontAlignment == self.ASCENDER ? kt.Ascender : 0);
		add(TEXT, 
					xFont(fontFamily, fontBold, fontItalic) +
					fSize + " 0 0 " + fSize + " " + fn(mapX(x)) + " " + fn(mapY(Y/*+(fSize/80)*/)) + " Tm\r\n" +
					xForeColor(fColor) +
					(kt.totalKern > 0 ? "[" + kt.str + "]TJ" : kt.str + "Tj"));
		if (href) {
			mkLink(x, Y, kt, href, fColor);
		}
	}
	return kt;
}
lattice.prototype.wordWrap = function(width, height, str, fontSize, fontFamily, fontBold, fontItalic) {
	var a, b, c, i, j, s, t, tw, ww, xw, wc, fSize = fontSize || self.fontSize;
	var font, words, spaceWidth;

	if (parseFloat(width) === NaN || width <= 0) {
		throw new Error("lattice.wordWrap: width must be a positive number, value = " + width);
	}
	a = CStr(str).replace(/\r/g,"").replace(/\n$/,"").split("\n");
	b = [];
	font = getFont(fontFamily, fontBold, fontItalic, fontSize);
	for (i = 0; i < a.length; i++) {
		tw = self.textWidth(a[i], fontSize, fontFamily, fontBold, fontItalic);
		if (tw > width) {
			s = a[i];
			words = s.split(" ");
			wc = cacheTextWidths(words, font);
			spaceWidth = wc[" "];
			c = "";
			tw = 0;
			for (j = 0; j < words.length; j++) {
				ww = (j > 0 ? spaceWidth : 0) + wc[words[j]];
				if (tw + ww < width) {
					c += (j > 0 ? " " : "") + words[j];
					tw += ww;
				}
				else if (wc[words[j]] > width) {
					if (c != "") {
						b.push(c);
					}
					s = words[j];
					tw = self.textWidth(s, fontSize, fontFamily, fontBold, fontItalic);
					while (tw > width) {
						c = breakStr(s, width);
						b.push(c[0]);
						s = c[1];
						tw = self.textWidth(s, fontSize, fontFamily, fontBold, fontItalic);
					}
					if (s != "") {
						b.push(s);
					}
					c = "";
				}
				else {
					b.push(c);
					c = words[j];
					tw = wc[words[j]];
				}
			}
			if (c != "") {
				b.push(c);
			}
		}
		else {
			b.push(a[i]);
		}
	}
	return b;
}
lattice.prototype.textWrap = function(x, y, width, height, str, align, fontSize, fontFamily, fontBold, fontItalic, foreColor, href) {
	var a, i, h = 0, fSize = fontSize || self.fontSize;
	if (str && typeof(str)=="object") {
		a = str;
	}
	else {
		a = self.wordWrap(width, height, str, fontSize, fontFamily, fontBold, fontItalic, foreColor);
	}
	for (i = 0; i < a.length; i++) {
		if (align.toUpperCase() == self.ALIGN_CENTER) {
			self.textCenter(x, y + h, width, a[i], fontSize, fontFamily, fontBold, fontItalic, foreColor, href);
		}
		else if (align.toUpperCase() == self.ALIGN_RIGHT) {
			self.textRight(x, y + h, width, a[i], fontSize, fontFamily, fontBold, fontItalic, foreColor, href);
		}
		else {
			self.text(x, y + h, a[i], fontSize, fontFamily, fontBold, fontItalic, foreColor, href);
		}
		h += ((fSize*1.12)/72);
	}
	return h;
}
lattice.prototype.textWidth = function(text, fontSize, fontFamily, fontBold, fontItalic) {
	var i, tw, kw, c, c1, v, s, kern, font, str = CStr(text);
	var fSize = fontSize || self.fontSize;
	var fFamily = fontFamily || self.fontFamily;
	var fBold = fontBold || self.fontBold;
	var fItalic = fontItalic || self.fontItalic;
	if (str.length > 0) {
		font = getFont(fFamily, fBold, fItalic);
		kern = self.kern && font.font.kern;
		for (i = tw = kw = 0; i < str.length; i++) {
			c = str.charAt(i);
			v = str.charCodeAt(i);
			if (isDefined(font.font.metrics[v])) {
				tw += font.font.metrics[v];
			}
			else if (isDefined(font.family.metrics[v])) {
				tw += font.family.metrics[v];
			}
			// Kerning
			if (kern && i < (str.length-1)) {
				c1 = str.charAt(i+1);
				if (isDefined(font.font.kern[c]) && isDefined(font.font.kern[c][c1])) {
					kw += font.font.kern[c][c1];
				}
			}
		}
		return ((tw-kw) * (fSize/72)) / 1000;
	}
	return 0;
}
lattice.prototype.kernText = function(text, fontSize, fontFamily, fontBold, fontItalic) {
	var i, k, tw, kw, c, c1, v, s, font, s, str = CStr(text);
	var r = {	str:		"()",
				totalKern:	0,
				width:		0,
				textWidth:	0,
				fontSize:	fontSize || self.fontSize,
				fontFamily:	fontFamily || self.fontFamily,
				fontBold:	fontBold || self.fontBold,
				fontItalic:	fontItalic || self.fontItalic
	};
	
	if (str.length > 0) {
		r.str = "(";
		font = getFont(r.fontFamily, r.fontBold, r.fontItalic, r.fontSize);
		r.kerned = self.kern && font.font.kern;
		r.UnderlinePosition = font.UnderlinePosition;
		r.UnderlineThickness = font.UnderlineThickness;
		r.CapHeight = font.CapHeight;
		r.XHeight = font.XHeight;
		r.Ascender = font.Ascender;
		r.Descender = font.Descender;
		s = "";
		for (i = tw = kw = 0; i < str.length; i++) {
			c = str.charAt(i);
			s += c == "\\" ? "\\\\" : c == ")" ? "\\)" : c == "(" ? "\\(" : c;
			v = str.charCodeAt(i);
			if (font.font.metrics[v]) {
				tw += font.font.metrics[v];
			}
			else if (font.family.metrics[v]) {
				tw += font.family.metrics[v];
			}
			// Kerning
			if (r.kerned && i < (str.length-1)) {
				c1 = str.charAt(i+1);
				if (font.font.kern[c] && font.font.kern[c][c1]) {
					r.str += s + ")" + font.font.kern[c][c1] + "(";
					s = "";
					kw += font.font.kern[c][c1];
				}
			}
		}
		r.str += s + ")";
		r.totalKern = kw;
		r.width = tw;
		r.textWidth = ((tw-kw) * (r.fontSize/72)) / 1000;
	}
	return r;
}
lattice.prototype.textCenter = function(x, y, width, str, fontSize, fontFamily, fontBold, fontItalic, foreColor, href) {
	var kt;
	if (CStr(str).trim() != "") {
		kt = self.kernText(str, fontSize, fontFamily, fontBold, fontItalic);
		self.text(x + ((width/2) - (kt.textWidth/2)), y, str, fontSize, fontFamily, fontBold, fontItalic, foreColor, href);
	}
}
lattice.prototype.textRight = function(x, y, width, str, fontSize, fontFamily, fontBold, fontItalic, foreColor, href) {
	var kt;
	if (CStr(str).trim() != "") {
		kt = self.kernText(str, fontSize, fontFamily, fontBold, fontItalic);
		self.text(x + width - kt.textWidth, y, str, fontSize, fontFamily, fontBold, fontItalic, foreColor, href);
	}
}
lattice.prototype.textRotated = function(x, y, degrees, str, fontSize, fontFamily, fontBold, fontItalic, foreColor) {
	var kt, rads, fSize = fontSize || self.fontSize;
	setMaxY(y);		// don't know how to calculate this here??
	if (CStr(str).trim() != "") {
		kt = self.kernText(str, fontSize, fontFamily, fontBold, fontItalic);
		degrees %= 360;
		rads = degrees / degreesInRad;
		add(TEXT,
					xFont(fontFamily, fontBold, fontItalic) +
					fn(Math.cos(rads) * fSize) + " " + fn(Math.sin(radsInCircle - rads) * fSize) + " " + fn(Math.sin(rads) * fSize) + " " + fn(Math.cos(radsInCircle - rads) * fSize) + " " + fn(mapX(x-.115)) + " " + fn(mapY(y+.015)) + " Tm\r\n" +
					xForeColor(foreColor) +
					(kt.totalKern > 0 ? "[" + kt.str + "]TJ" : kt.str + "Tj"));
	}
}
lattice.prototype.clearHeader = function() {
	output[O_HEADER] = {text:[], graphics:[], annotations:[], top:0, left:0};
}
lattice.prototype.startHeader = function(leftMargin, topMargin) {
	if (outputIndex == O_PAGE) {
		self.clearHeader();
		output[O_HEADER].state = getState();
		output[O_HEADER].left = leftMargin || 0;
		output[O_HEADER].top = topMargin || 0;
		outputIndex = O_HEADER;
		pdfState = {};
	}
	else {
		throw new Error("lattice.startHeader: Already started a " + outputs[outputIndex]);
	}
}
lattice.prototype.endHeader = lattice.prototype.endFooter = lattice.prototype.endWatermark = function() {
	outputIndex = O_PAGE;
	pdfState = {};
	setState(output[O_HEADER].state);
}
lattice.prototype.clearFooter = function() {
	output[O_FOOTER] = {text:[], graphics:[], annotations:[], top:0, left:0};
}
lattice.prototype.startFooter = function(leftMargin, topMargin) {
	if (outputIndex == O_PAGE) {
		self.clearFooter();
		output[O_FOOTER].state = getState();
		output[O_FOOTER].left = leftMargin || 0;
		output[O_FOOTER].top = topMargin || 0;
		outputIndex = O_FOOTER;
		pdfState = {};
	}
	else {
		throw new Error("lattice.startFooter: Already started a " + outputs[outputIndex]);
	}
}
lattice.prototype.endFooter = function() {
	outputIndex = O_PAGE;
	pdfState = {};
	setState(output[O_FOOTER].state);
}
lattice.prototype.clearWatermark = function() {
	output[O_WATERMARK] = {text:[], graphics:[], annotations:[], top:0, left:0};
}
lattice.prototype.startWatermark = function(leftMargin, topMargin) {
	if (outputIndex == O_PAGE) {
		self.clearWatermark();
		output[O_WATERMARK].state = getState();
		output[O_WATERMARK].left = leftMargin || 0;
		output[O_WATERMARK].top = topMargin || 0;
		outputIndex = O_WATERMARK;
		pdfState = {};
	}
	else {
		throw new Error("lattice.startWatermark: Already started a " + outputs[outputIndex]);
	}
}
lattice.prototype.endWatermark = function() {
	outputIndex = O_PAGE;
	pdfState = {};
	setState(output[O_WATERMARK].state);
}
// Write out the page contents, then create and write out all of the page level objects.
lattice.prototype.newPage = function(pageOrientation) {
	writePage();
	if (isDefined(pageOrientation)) {
		self.pageOrientation = pageOrientation;
		self.pageWidth = self.pageOrientation == self.LANDSCAPE ? 11 : 8.5;
		self.pageHeight = self.pageOrientation == self.LANDSCAPE ? 8.5 : 11;
	}
	objNo += 1;
	pageRefs[pageRefs.length] = null;
	pdfState = {};
	output[O_PAGE].text = [];
	output[O_PAGE].graphics = [];
	output[O_PAGE].annotations = [];
	output[O_PAGE].obj = null;
	output[O_PAGE].maxY = 0;
}
// Purge the last page and write the document level objects
lattice.prototype.toString = function() {
	var i, j, s, d, xRef, root, pg, info;
	
	if (!finished) {
		writePage();
		d = new Date();

		pg = pdfObject(null, "/Nums[0<</S/D>>]");
		s = "";
		for (j = 1; j < pageRefs.length; j++) {
			s += objRef(pageRefs[j]) + " ";
		}
		s = s.trim();
		pdfObject(pageTree, "/Type/Pages/Count " + (pageRefs.length-1) + "\r\n/Kids[" + s + "]");
		root = pdfObject(null, "/Type/Catalog\r\n/PageLabels " + objRef(pg) + "\r\n/Pages " + objRef(pageTree));
		info = pdfObject(null, "/Creator(lattice)\r\n/Producer(lattice)\r\n/CreationDate(D:" + formatDate(d, "YMDHNS") + ")\r\n/ModDate(D:" + formatDate(d, "YMDHNS") + ")");

		xRef = fileOffset;
		// Now do the Xref table
		write("xref\r\n0 " + pdfObjects.length + "\r\n0000000010 65535 f");
		for (i = 1; i < pdfObjects.length; i++) {
			s = "";
			for (j = CStr(pdfObjects[i]).length; j < 10; j++) {
				s += "0";
			}
			write(s + CStr(pdfObjects[i]) + " 00000 n");
		}
		write("trailer\r\n<<\r\n/Size " + pdfObjects.length + "\r\n/Root " + objRef(root) + "\r\n/Info " + objRef(info) + "\r\n/ID[" + pdfIdentifier() + "]" + "\r\n>>");
		write("startxref\r\n" + xRef + "\r\n%%EOF");
		buf.add("");
		finished = true;
	}
	return buf.toString();
}

exports.newReport = function(orientation) {
	return new lattice(orientation);
}
