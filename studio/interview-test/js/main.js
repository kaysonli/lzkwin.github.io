/*
* 还原设计稿页面脚本
* @李中凯 2014-10-6
*/
(function() {
	$(function() {
		initSlider();
		lazyLoad();

		$(window).scroll(function() {
			lazyLoad();
			var scrollTop = $(window).scrollTop();
			if (scrollTop > 100) {
				$('.back-top').show();
			} else {
				$('.back-top').hide();
			}
			var isBottom = reachBottom();
			if(isBottom) {
				appendContent();
			}
		});

	});

	//判断页面滚动条是否到达底部
	function reachBottom() {
		var scrollTop = $(window).scrollTop();
		var scrollHeight = $(document).height();
		var windowHeight = $(window).height();
		return scrollTop + windowHeight == scrollHeight;
	}

	//模拟无限下拉加载内容
	function appendContent() {
		var tpl = '<div class="category clear"><div class="left"><div class="pavilion beauty"><div class="content"><div class="name">美妆馆</div><div class="name-en"><h1>BEAUTY</h1><h1>MAKEUP</h1><h6>PAVILION</h6></div></div></div><div class="popular"><h3 class="title">明星店铺</h3><div class="logo"><a href="#"><img src="images/shop1.gif"alt=""></a></div></div><div class="popular"><h3 class="title">热门品牌</h3><div class="logo"><a href="#"><img src="images/brand1.gif"alt=""></a></div></div></div><div class="recomend"><div class="title-box"><h3 class="title">推荐商品</h3><ul class="nav"><li></li><li></li><li></li></ul></div><div class="item-container clear"><div class="item"><div class="imgbox"><a href="#"target="_blank"><img src="images/1-1.gif"alt=""img-src="images/1-1.gif"><span class="price">￥150.00</span></a></div><p class="desc"><a href="#"target="_blank">[资生堂]安热沙安耐晒沙安耐露/霜60ML</a></p></div><div class="item"><div class="imgbox"><a href="#"target="_blank"><img src="images/1-2.gif"alt=""img-src="images/1-2.gif"><span class="price">￥150.00</span></a></div><p class="desc"><a href="#"target="_blank">[资生堂]安热沙安耐晒沙安耐露/霜60ML</a></p></div><div class="item"><div class="imgbox"><a href="#"target="_blank"><img src="images/1-3.gif"alt=""img-src="images/1-3.gif"><span class="price">￥150.00</span></a></div><p class="desc"><a href="#"target="_blank">[资生堂]安热沙安耐晒沙安耐露/霜60ML</a></p></div><div class="item"><div class="imgbox"><a href="#"target="_blank"><img src="images/1-4.gif"alt=""img-src="images/1-4.gif"><span class="price">￥150.00</span></a></div><p class="desc"><a href="#"target="_blank">[资生堂]安热沙安耐晒沙安耐露/霜60ML</a></p></div></div></div></div>';
		var tpl2 = '<div class="category clear col2"><div class="left"><div class="pavilion parent-children"><div class="content"><div class="name">亲子馆</div><div class="name-en"><h1>PARENTS</h1><h1>CHILDREN</h1><h6>PAVILION</h6></div></div></div><div class="popular"><h3 class="title">明星店铺</h3><div class="logo"><a href="#"><img src="images/shop2.gif"alt=""></a></div></div><div class="popular"><h3 class="title">热门品牌</h3><div class="logo"><a href="#"><img src="images/brand2.gif"alt=""></a></div></div></div><div class="recomend"><div class="title-box"><h3 class="title">推荐商品</h3><ul class="nav"><li></li><li></li><li></li></ul></div><div class="item-container clear"><div class="item"><div class="imgbox"><a href="#"target="_blank"><img src="images/2-1.gif"alt=""img-src="images/2-1.gif"><span class="price">￥150.00</span></a></div><p class="desc"><a href="#"target="_blank">[资生堂]安热沙安耐晒沙安耐露/霜60ML</a></p></div><div class="item"><div class="imgbox"><a href="#"target="_blank"><img src="images/2-2.gif"alt=""img-src="images/2-2.gif"><span class="price">￥150.00</span></a></div><p class="desc"><a href="#"target="_blank">[资生堂]安热沙安耐晒沙安耐露/霜60ML</a></p></div><div class="item"><div class="imgbox"><a href="#"target="_blank"><img src="images/2-3.gif"alt=""img-src="images/2-3.gif"><span class="price">￥150.00</span></a></div><p class="desc"><a href="#"target="_blank">[资生堂]安热沙安耐晒沙安耐露/霜60ML</a></p></div><div class="item"><div class="imgbox"><a href="#"target="_blank"><img src="images/2-4.gif"alt=""img-src="images/2-4.gif"><span class="price">￥150.00</span></a></div><p class="desc"><a href="#"target="_blank">[资生堂]安热沙安耐晒沙安耐露/霜60ML</a></p></div></div></div></div>';
		$(".container").append($(tpl));
		$(".container").append($(tpl2));
	}

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