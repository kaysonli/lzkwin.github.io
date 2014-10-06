(function() {
	$(function() {
		initSlider();
		lazyLoad();
			
		$(window).scroll(function(){
			lazyLoad();
		});

	});

	//初始化banner图片轮播组件
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

	//图片延迟加载
	function lazyLoad() {
		$(".category").each(function(index, item){
			var rect = item.getBoundingClientRect();
			var winHeight = $(window).height();
			if(rect.top < winHeight && $(item).attr('loaded') != 1) {
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