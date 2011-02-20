
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
			case 'f': var q = Math.floor((dt["get"+utc+"Month"]()/3)+1);
					  return q == 4 ? 1 : q+1;
			case 'F': var q = Math.floor((dt["get"+utc+"Month"]()/3)+1);
					  return dt["get"+utc+"FullYear"]() + (q == 4 ? 1 : 0);
			case 'j':
			case 'J':
				return (function () {
					var i, day = dt["get"+utc+"Date"](), month = dt["get"+utc+"Month"](), year = dt["get"+utc+"FullYear"]();
					var days = [31, year % 4 == 0 && (year % 100 != 0 || year % 400 == 0) ? 29 : 28,
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
}
