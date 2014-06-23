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

	ps.ascii = function(imageData, width, height) {
		var pixels = [];
		for (var i = 0; i < imageData.length; i += 4) {
			pixels.push({
				R: imageData[i],
				G: imageData[i + 1],
				B: imageData[i + 2],
				A: imageData[i + 3],
				gray: ~~(imageData[i] * 0.3 + imageData[i + 1] * 0.59 + imageData[i + 2] * 0.11)
				x: i % width,
				y: ~~(i / width)
			});
		};
		var chars = ['W', '#', 'K', 'D', 'J', 'i', ',', '.', ''];
		var result = [];
		var div = 10,
			w = width / div,
			h = height / div,
			x, y;
		w = ~~w;
		h = ~~h;
		for (var i = 0; i < pixels.length; i++) {

		}
		for (var row = 0; row < div; row++) {
			for (var col = 0; col < div; col++) {
				var square = [], count={}, max = 0;
				for (y = 0; y < h; y++) {
					for (x = 0; x < w; x++) {
						var value = pixels[x * width + y];
						count[value] = count[value] || 1;
						count[value]++;
						if(count[value] > max){
							max = count[value];
						}
						square.push(pixels[x * width + y]);
					}
				};
			}
		}
	}
})(window);