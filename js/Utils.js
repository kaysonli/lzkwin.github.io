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
	},

	rgbToHexFormat: function() {
		if(arguments.length === 3) {
			return '#' + arguments[0].toString(16) + arguments[1].toString(16) + arguments[2].toString(16);
		}

		if(arguments.length === 1 && typeof arguments[0] === 'string') {
			var exp = arguments[0],
				start = exp.indexOf('('),
				rgb = exp.slice(start + 1, exp.length - 1);
			var parts = rgb.split(',');
			return arguments.callee.call(null, ~~parts[0], ~~parts[1], ~~parts[2]);
		}
		return '';
	},

	hexToRgbFormat: function(hex) {
		if(typeof hex === 'number') {
			hex = '#' + hex.toString(16);
		}
		var val = hex.slice(1);
		if(val.length === 3) {
			var parts = val.split('');
			val = '' + parts[0] + parts[0] + parts[1] + parts[1] + parts[2] + parts[2];
		}
		var number = parseInt(val, 16);
		var r = number >> 16,
			g = (number & 0xffff) >> 8,
			b = (number & 0xff);
		// parts = val.split('');
		// var r = parseInt(val.slice(0, 2), 16),
		// 	g = parseInt(val.slice(2, 4), 16),
		// 	b = parseInt(val.slice(4, 6), 16);
		return Utils.format('rgb({0},{1},{2})', r, g, b);
	}
};