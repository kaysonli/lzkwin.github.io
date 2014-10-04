(function() {
	$(function() {
		initSlider();
	});

	function initSlider() {
		var sliderImages = ['images/banner.png', 'images/banner.png', 'images/banner.png', 'images/banner.png'];
		var slider = new Slider(sliderImages);
		setInterval(function() {
			slider.move('right');
		}, 2000);
		$(".banner").mouseover(function(){
			$(".slider-btn.prev").css('left', '6px');
			$(".slider-btn.next").css('right', '6px');
		}).mouseout(function(){
			$(".slider-btn.prev").css('left', '-36px');
			$(".slider-btn.next").css('right', '-36px');
		});
		$(".slider-btn").click(function() {
			var direction = $(this).hasClass('prev') ? 'left' : 'right';
			slider.move(direction);
		});
	}

	function Slider(imagesArray) {
		this.imagesArray = imagesArray;
		this.current = 0;
	}

	Slider.prototype.move = function(direction) {
		var len = this.imagesArray.length,
			me = this,
			current = this.current;
		if (direction === 'left') {
			current = (current - 1 + len) % len;
		} else if (direction === 'right') {
			current = (current + 1) % len;
		}
		$("img.banner-img").fadeOut(200, function() {
			me.current = current;
			$("ul.slider-nav li").removeClass('on');
			$("ul.slider-nav li:nth-child(" + (me.current + 1) + ")").addClass('on');
			$("img.banner-img").attr('src', me.imagesArray[me.current]).fadeIn();
		});
	}
})();