
//The date format function translates the following characters into
//Date or Time values:
//Y    : 4 digit year
//y    : 2 digit year
//Q, q : Calendar Year Quarter #
//f    : Fiscal Year Quarter #
//F    : Fiscal Year (4 digit)
//M    : 0 prefixed month number
//m    : month number
//o    : month name - short
//O    : month name - long
//D    : 0 prefixed day number
//d    : day number
//w    : weekday name - short
//W    : weekday name - long
//H    : 0 prefixed hour
//h    : hour
//N    : 0 prefixed minute
//n    : minute
//S    : 0 prefixed second
//s    : second
//T    : Time in the format H:MM:SS AM/PM
//t    : Time in the format H:MM AM/PM
//J    : 5 digit Julian Date (2 digit year)
//j    : 4 digit Julian Date (1 digit year)
//Any characters within a string -- can be quoted with '' or ""
exports.formatDate = function formatDate(dd, fmt) {
	var days, months, utc, dt = Date.parse(dd);
	
	if (isNaN(dt)) {
		return '';
	}
	dt = new Date(dt);
	fmt = fmt.toString();
	utc = fmt.substr(0,4) == "UTC:" ? "UTC" : "";
	fmt = utc == "" ? fmt : fmt.slice(4);
    return fmt.replace(/[yodhnsutmwqfj]|('[^']*?')|("[^"]*?")/gi, function(v) {
		var q;
		if (v.charAt(0) == "'" || v.charAt(0) == '"') {
			return v.slice(1,-1);
		}
		switch(v) {
			case 'y': return dt["get"+utc+"FullYear"]().toString().slice(-2);
			case 'Y': return dt["get"+utc+"FullYear"]();
			case 'm': return dt["get"+utc+"Month"]() + 1;
			case 'M': return ('0' + (dt["get"+utc+"Month"]() + 1)).slice(-2);
			case 'd': return dt["get"+utc+"Date"]();
			case 'D': return ('0' + dt["get"+utc+"Date"]()).slice(-2);
			case 'h': return dt["get"+utc+"Hours"]();
			case 'H': return ('0' + dt["get"+utc+"Hours"]()).slice(-2);
			case 'n': return dt["get"+utc+"Minutes"]();
			case 'N': return ('0' + dt["get"+utc+"Minutes"]()).slice(-2);
			case 's': return dt["get"+utc+"Seconds"]();
			case 'S': return ('0' + dt["get"+utc+"Seconds"]()).slice(-2);
			case 'u': return dt["get"+utc+"Milliseconds"]();
			case 'U': return ('00' + dt["get"+utc+"Milliseconds"]()).slice(-2);
			case 't': return (dt["get"+utc+"Hours"]() + (dt["get"+utc+"Hours"]() > 12 ? -12 : 0)) + ':' +
							 ('0' + dt["get"+utc+"Minutes"]()).slice(-2) + (dt["get"+utc+"Hours"]() >= 12 ? ' PM' : ' AM');
			case 'T': return (dt["get"+utc+"Hours"]() + (dt["get"+utc+"Hours"]() > 12 ? -12 : 0)) + ':' +
							 ('0' + dt["get"+utc+"Minutes"]()).slice(-2) + ':' +
							 ('0' + dt["get"+utc+"Seconds"]()).slice(-2) + (dt["get"+utc+"Hours"]() >= 12 ? ' PM' : ' AM');
			case 'o':
			case 'O': months = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
								'August', 'September', 'October', 'November', 'December'];
					  return v == 'o' ? months[dt["get"+utc+"Month"]()].slice(0, 3) : months[dt["get"+utc+"Month"]()];
			case 'w':
			case 'W': days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
					  return v == 'w' ? days[dt["get"+utc+"Day"]()].slice(0, 3) : days[dt["get"+utc+"Day"]()];
			case 'q':
			case 'Q': return Math.floor((dt["get"+utc+"Month"]()/3)+1);
			case 'f': q = Math.floor((dt["get"+utc+"Month"]()/3)+1);
					  return q == 4 ? 1 : q+1;
			case 'F': q = Math.floor((dt["get"+utc+"Month"]()/3)+1);
					  return dt["get"+utc+"FullYear"]() + (q == 4 ? 1 : 0);
			case 'j':
			case 'J':
				return (function () {
					var i, day = dt["get"+utc+"Date"](), month = dt["get"+utc+"Month"](), year = dt["get"+utc+"FullYear"]();
					var days = [31, year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28,
								31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
					for (i = 0; i < month; i++) {
						day += days[i];
					}
					return year.toString().slice(v == 'J' ? -2 : -1) + ('00' + day).slice(-3);
				})();
			default:
				return v;
        }
	});
};

exports.sprintf = function sprintf() {
	var a,b,re,str,leftPart,rightPart,minLength,numSubstitutions,numMatches;
	var pPad, pJustify, pMinLength,pPrecision,pType,param,pad,justifyRight,pDollar,pComma=false;
	var precision,subst,i;

	function CStr(s) {
		if (typeof(s)  ==  "date") {
			return formatDate(s, "o/d/Y T");
		}
		if (typeof(s) == "undefined" || s === null) {
			return "";
		}
		return String(s);
	}
	function isNumeric(v) {
		return !isNaN(parseFloat(v));
	}
	function rpt(c,n) {
		var i, s='';
		for (i=0; i < n; i++) {
			s += c;
		}
		return s;
	}
	function rev(v) {
		var i, s='';
		for (i = v.length-1; i >= 0; i--) {
			s += v.charAt(i);
		}
		return s;
	}
	function comma(v) {
		var i,s,a = CStr(v).split(".");
		if (a[0].length > 3) {
			s = rev(a[0]);
			s = s.replace(/(...)/g, "$1,");
			if (s.slice(-1) == ",") {
				s = s.slice(0,-1);
			}
			return rev(s) + (a.length > 1 ? "." + a[1] : "");
		}
		else {
			return a.join(".");
		}
	}
	
	if (arguments.length < 1) {
		return '';
	}
	rightPart = CStr(arguments[0]).replace(/\n/gm, "%n");
	re = /([^%]*)%('.|0|\x20)?(-|\+|,|\$)?(\d+)?(\.\d+)?([%bcdufosxXn])(.*)/;
	a = b = [];
	numSubstitutions = numMatches = 0;
	str='';
	a = re.exec(rightPart);
	while (a) {
		leftPart = a[1];
		pPad = a[2];
		pJustify = a[3];
		pMinLength = a[4];
		pPrecision = a[5];
		pType = a[6];
		rightPart = a[7];
		if (pJustify == "," || pJustify == "$") {
			pComma = true;
			pDollar = (pJustify == "$");
			pJustify = "";
		}
		numMatches++;
		if (pType == '%') {
			subst = '%';
		}
		else {
			numSubstitutions++;
			param = arguments[numSubstitutions];
			pad = '';
			justifyRight = true;
			minLength = precision = -1;
			subst = param;
			if (pPad && pPad.charAt(0) == "'") {
				pad = pPad.slice(-1);
			}
			else if (pPad) {
				pad = pPad;
			}
			if (pJustify && pJustify === "-") {
				justifyRight = false;
			}
			if (pMinLength) {
				minLength = parseInt(pMinLength,10);
			}
			if (pPrecision) {
				precision = parseInt(pPrecision.substring(1),10);
			}
			if (pType == 'b') {
				subst = parseInt(param,10).toString(2);
			}
			else if (pType == 'c') {
				subst = String.fromCharCode(parseInt(param,10));
			}
			else if (pType == 'd') {
				if (isNumeric(param)) {
					subst = CStr(parseInt(param, 10) ? parseInt(param, 10) : 0);
					if (precision >= 0) {
						subst = subst.slice(-precision);
					}
					if (minLength >= 0) {
						subst = rpt(pad, minLength-subst.length)+subst;
					}
					if (pDollar || pComma) {
						subst = (pDollar ? '$' : '') + comma(subst).replace(/-,/, "-");
					}
					else {
						subst = (pJustify == '+' ? '+' : '') + subst;
					}
				}
				else {
					subst = '';
				}
			}
			else if (pType == 'u') {
				subst = Math.abs(param);
			}
			else if (pType == 'f') {
				if (isNumeric(param)) {
					subst = (precision > -1) ? Math.round(parseFloat(param) * Math.pow(10, precision)) / Math.pow(10, precision): parseFloat(param);
					if (isNumeric(subst) && (minLength >= 0 || precision > 0)) {
						subst = CStr(subst);
						b = subst.split('.');
						if (b.length==1) {
							b[1]='';
						}
						if (precision > 0) {
							b[1] += rpt('0', precision-b[1].length);
							if (minLength >= 0) {
								b[0] += rpt(pad, minLength-b[0].length);
							}
							else if (b[0]=="0") {
								b[0] = "";
							}
							subst = b[0]+'.'+b[1];
						}
						else if (minLength >= 0) {
							if (minLength >= 0) {
								b[1] += rpt('0', precision-b[1].length);
							}
							b[0] += rpt(pad, minLength-b[0].length);
							subst = b[0]+'.'+b[1];
						}
					}
					if (pDollar || pComma) {
						subst = (pDollar ? '$' : '') + comma(subst).replace(/-,/, "-");
					}
				}
				else {
					subst = '';
				}
			}
			else if (pType == 'o') {
				subst = parseInt(param,10).toString(8);
			}
			else if (pType == 's') {
				subst = CStr(param);
				if (pad=='') {
					pad = ' ';
				}
				if (minLength > subst.length) {
					subst = (justifyRight ? rpt(pad,minLength-subst.length):'') + subst + (justifyRight ? '':rpt(pad,minLength-subst.length));
				}
				if (precision > 0 && precision < subst.length) {
					subst = justifyRight ? subst.slice(0, precision) : subst.slice(-precision);
				}
			}
			else if (pType == 'x') {
				subst = ('' + parseInt(param,10).toString(16)).toLowerCase();
				if (minLength >= 0) {
					subst = rpt(pad, minLength-subst.length)+subst;
				}
			}
			else if (pType == 'X') {
				subst = ('' + parseInt(param,10).toString(16)).toUpperCase();
				if (minLength >= 0) {
					subst = rpt(pad, minLength-subst.length)+subst;
				}
			}
			else if (pType == 'n') {
				subst = "\n";
				numSubstitutions -= 1;
			}

			if (numSubstitutions >= arguments.length) {
				throw new Error('Argument mismatch: ' + (arguments.length - 1) + ' arguments, substition patterns: ' + numSubstitutions + ' so far).');
			}
		}
		str += leftPart + subst;
		a = re.exec(rightPart);
	}
	return str+rightPart;
};
