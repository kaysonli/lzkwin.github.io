var Utils = {
	format: function() {
		if (arguments.length === 0) {
			return '';
		}
		var formatStr = arguments[0];
		var args = [].slice.call(arguments, 1);
		for (var i = 0; i < args.length; i++) {
			formatStr = formatStr.replace('{' + i + '}', args[i]);
		}
		return formatStr;
	},
	toFixed: function(number, decimal) {
		decimal = decimal || 0;
		var s = String(number);
		var decimalIndex = s.indexOf('.');
		if (decimalIndex < 0) {
			var fraction = '';
			for (var i = 0; i < decimal; i++) {
				fraction += '0';
			}
			return s + '.' + fraction;
		}
		var numDigits = s.length - 1 - decimalIndex;
		if (numDigits <= decimal) {
			var fraction = '';
			for (var i = 0; i < decimal - numDigits; i++) {
				fraction += '0';
			}
			return s + fraction;
		}
		var digits = s.split('');
		var pos = decimalIndex + decimal;
		var roundDigit = digits[pos + 1];
		if (roundDigit > 4) {
			if (pos == decimalIndex) {
				--pos;
			}
			digits[pos] = Number(digits[pos] || 0) + 1;
			while (digits[pos] == 10) {
				digits[pos] = 0;
				--pos;
				if (pos == decimalIndex) {
					--pos;
				}
				digits[pos] = Number(digits[pos] || 0) + 1;
			}
		}
		if (decimal === 0) {
			decimal--;
		}
		return digits.slice(0, decimalIndex + decimal + 1).join('');
	}
};