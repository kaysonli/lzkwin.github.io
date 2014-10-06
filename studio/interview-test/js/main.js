(function() {
	$(function() {
		initSlider();
		lazyLoad();

		$(window).scroll(function() {
			lazyLoad();
			var scrollTop = $(window).scrollTop();
			if(scrollTop > 100) {
				$('.back-top').show();
			} else {
				$('.back-top').hide();
			}
		});

	});

	//初始化banner图片轮播组件
	function initSlider() {
		var sliderImages = ['images/banner.png', 'images/banner.png', 'images/banner.png', 'images/banner.png'];
		var slider = new Slider(sliderImages);
		var timer = setInterval(function() {
			slider.move('right');
		}, 2000);

		$(".banner").mouseover(function() {
			$(".slider-btn.prev").addClass('show');
			$(".slider-btn.next").addClass('show');
			//当光标位于banner区域时，停止自动播放
			clearInterval(timer);
		}).mouseout(function() {
			$(".slider-btn.prev").removeClass('show');
			$(".slider-btn.next").removeClass('show');
			timer = setInterval(function() {
				slider.move('right');
			}, 2000);
		});

		$(".slider-btn").click(function() {
			var direction = $(this).hasClass('prev') ? 'left' : 'right';
			slider.move(direction);
		});
	}

	//图片延迟加载
	function lazyLoad() {
		$(".category").each(function(index, item) {
			var rect = item.getBoundingClientRect();
			var winHeight = $(window).height();
			if (rect.top < winHeight && $(item).attr('loaded') != 1) {
				$(item).find('img').each(function(idx, img) {
					$(img).attr('src', $(img).attr('img-src'));
				});
				$(item).attr('loaded', 1);
			}
		});
	}


	//图片轮播
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