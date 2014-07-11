(function() {
	var ps = window.Photoshop = window.Photoshop || {};
	ps.grayscale = function(imageData) {
		var data = imageData.data;
		for (var i = 0; i < data.length; i += 4) {
			var R = data[i],
				G = data[i + 1],
				B = data[i + 2],
				A = data[i + 3];
			var gray = R * 0.3 + G * 0.59 + B * 0.11;
			gray = ~~gray;
			data[i] = gray;
			data[i + 1] = gray;
			data[i + 2] = gray;
			data[i + 3] = A;
		};
	}

	function getCharsMap() {
		var chars = ['@', 'W', '#', '$', 'K', 'T', 'D', 'J', 'i', '.', '&nbsp;'];
		var step = 25,
			map = {};
		for (var i = 0; i < 256; i++) {
			var index = ~~ (i / 25)
			map[i] = chars[index];
		};
		return map;
	}

	function getAvgPixel(blockImageData) {
		var sum = 0;
		for (var i = 0, ln = blockImageData.data.length; i < ln; i += 4) {
			var data = blockImageData.data,
				R = data[i],
				G = data[i + 1],
				B = data[i + 2],
				A = data[i + 3],
				gray = ~~(R * 0.3 + G * 0.59 + B * 0.11);
			sum += gray;
		};
		return~~ (sum / (blockImageData.width * blockImageData.height));
	}

	ps.ascii = function(context, width, height, rowChars) {
		var pixels = [],
			map = getCharsMap(),
			output = "";
		var imageData = context.getImageData(0, 0, width, height),
			data = imageData.data,
			w = h = ~~ (width / rowChars),
			rows = ~~(height / h);
		for (var r = 0; r < rows; r++) {
			for (var c = 0; c < rowChars; c++) {
				var x = c * w,
					y = r * h;
				var blockImageData = context.getImageData(x, y, w, h);
				var avg = getAvgPixel(blockImageData);
				var ch = map[avg];
				output += ch;
			}
			output += '\r\n';
		};
		return output;
	}
})(window);