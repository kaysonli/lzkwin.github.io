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
		var chars = ['@', 'w', '#', '$', 'k', 'd', 't', 'j', 'i', '.', '&nbsp;'];
		var step = 25,
			map = {};
		for (var i = 0; i < 256; i++) {
			var index = ~~ (i / 25)
			map[i] = chars[index];
		};
		return map;
	}

	function getAvgPixel(blockImageData) {
		var sumGray = 0,
			sumR = 0,
			sumG = 0,
			sumB = 0;
		for (var i = 0, ln = blockImageData.data.length; i < ln; i += 4) {
			var data = blockImageData.data,
				R = data[i],
				G = data[i + 1],
				B = data[i + 2],
				A = data[i + 3],
				gray = ~~ (R * 0.3 + G * 0.59 + B * 0.11);
			sumGray += gray;
			sumR += R;
			sumG += G;
			sumB += B;
		};
		var pixelCount = blockImageData.width * blockImageData.height;
		return {
			gray: ~~(sumGray / pixelCount),
			color: [sumR / pixelCount, sumG / pixelCount, sumB / pixelCount]
		}
	}

	function getBlockInfo(imageData, x, y, w, h) {
		var sumGray = 0,
			sumR = 0,
			sumG = 0,
			sumB = 0;
		for (var r = 0; r < h; r++) {
			for (var c = 0; c < w; c++) {
				var cx = x + c,
					cy = y + r;
				var index = (cy * imageData.width + cx) * 4;
				var data = imageData.data,
					R = data[index],
					G = data[index + 1],
					B = data[index + 2],
					A = data[index + 3],
					gray = ~~ (R * 0.3 + G * 0.59 + B * 0.11);
				sumGray += gray;
				sumR += R;
				sumG += G;
				sumB += B;
			}
		}
		var pixelCount = w * h;
		return {
			gray: ~~(sumGray / pixelCount),
			color: [sumR / pixelCount, sumG / pixelCount, sumB / pixelCount]
		};
	}

	ps.ascii = function(context, width, height, rowChars) {
		var pixels = [],
			map = getCharsMap(),
			output = "";
		var imageData = context.getImageData(0, 0, width, height),
			data = imageData.data,
			rowChars = width < rowChars ? width : rowChars,
			w = h = ~~ (width / rowChars),
			rows = ~~ (height / h),
			cols = ~~ (width / w);
		for (var r = 0; r < rows; r++) {
			for (var c = 0; c < cols; c++) {
				var x = c * w,
					y = r * h;
				// var blockImageData = context.getImageData(x, y, w, h);
				// var avg = getAvgPixel(blockImageData);
				var avg = getBlockInfo(imageData, x, y, w, h);
				var ch = map[avg.gray];
				var color = 'RGB(' + avg.color[0] + ',' + avg.color[1] + ',' + avg.color[2] + ')';
				// output += '<label style="color:' + color + ';">' + ch + '</label>';
				output += ch;
			}
			output += '\r\n';
		};
		return output;
	}
})(window);