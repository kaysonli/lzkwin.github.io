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

	function fillChars(pixels, w, h) {
		var result = [];
		var chars = ['W', '#', 'K', 'D', 'J', 'i', ',', '.', ''];
		var min = Math.min.apply(null, pixels),
			max = Math.max.apply(null, pixels),
			range = max - min,
			step = range / chars.length;
		for (var i = 0; i < pixels.length; i++) {
			var p = pixels[i];
			switch (true) {
				case (p >= (min + step * 0) && (p < min + step * 1)):
					p = chars[0];
					break;
				case p >= min + step * 1 && p < min + step * 2:
					p = chars[1];
					break;
				case p >= min + step * 2 && p < min + step * 3:
					p = chars[2];
					break;
				case p >= min + step * 3 && p < min + step * 4:
					p = chars[3];
					break;
				case p >= min + step * 4 && p < min + step * 5:
					p = chars[4];
					break;
				case p >= min + step * 5 && p < min + step * 6:
					p = chars[5];
					break;
				case p >= min + step * 6 && p < min + step * 7:
					p = chars[6];
					break;
				case p >= min + step * 7 && p < min + step * 8:
					p = chars[7];
					break;
				case p >= min + step * 8 && p < min + step * 9:
					p = chars[8];
					break;
				default:
					p = '.';
					break;
			}
			result.push(p);
			if(i % w == 0 && i > 0){
				result.push('\n');
			}
		};
		console.log(result);
		return result.join('');
	}

	ps.ascii = function(imageData, width, height) {
		var pixels = [];
		var data = imageData.data;
		for (var i = 0, ln = data.length; i < ln; i += 4) {
			pixels.push({
				R: data[i],
				G: data[i + 1],
				B: data[i + 2],
				A: data[i + 3],
				gray: ~~(data[i] * 0.3 + data[i + 1] * 0.59 + data[i + 2] * 0.11),
				x: i % width,
				y: ~~(i / width)
			});
		};

		var result = [];
		var div = 10,
			w = width / div,
			h = height / div,
			x, y;
		w = ~~w;
		h = ~~h;
		for (var i = 0; i < pixels.length; i++) {

		}
		var square = [];
		for (var row = 0; row < h; row++) {
			for (var col = 0; col < w; col++) {
				var count = {},
					max = 0,
					target;
				for (y = 0; y < div; y++) {
					for (x = 0; x < div; x++) {
						var cx = col * w + x,
							cy = row * h + y;
						var pixel = pixels[cy * width + cx];
						if (pixel == undefined) {
							continue;
						}
						var value = pixel.gray;
						count[value] = count[value] || 1;
						count[value]++;
						if (count[value] > max) {
							max = count[value];
							target = value;
						}
					}
				};
				square.push(value);
			}
		}
		// console.log(square);
		var str = fillChars(square, w);
		return str;
	}
})(window);