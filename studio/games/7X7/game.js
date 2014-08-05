$(function() {
    if ('ontouchstart' in document.documentElement) {
        $("#bdshare").hide();
    }
    var game = new Game($('#board'));
    $("#restart").click(function() {
        $("#game-over").hide();
        var game = new Game($('#board'));
    });
});
(function() {
    function format() {
        if (arguments.length === 0) {
            return '';
        }
        var formatStr = arguments[0];
        var args = [].slice.call(arguments, 1);
        for (var i = 0; i < args.length; i++) {
            formatStr = formatStr.replace('{' + i + '}', args[i]);
        }
        return formatStr;
    }
    var css = {
        wall: 'wall',
        open: 'open'
    };
    var colors = ['#99cc00', '#ffbb33', '#34b5e5', '#ff4444', '#aa66cc'];

    var GraphNodeType = {
        OPEN: 1,
        WALL: 0
    };

    function Game($graph, options, implementation) {
        this.$graph = $graph;
        this.$comingCells = $('#coming-cells');
        this.search = implementation;
        this.level = 1;
        this.comingCount = [0, 3, 4, 5, 6];
        this.setScoreRule();
        this.score = 0;
        this.combo = 0;
        this.anyWhereMoves = 2;
        this.turns = 0;
        this.opts = $.extend({
            bgColor: '#ddd',
            movesPerLevel: 40,
            gridSize: 7
        }, options);

        this.leftMovesToNextLevel = this.opts.movesPerLevel;
        this.initialize();
    }

    Game.prototype.setScoreRule = function() {
        this.scoreRule = {
            '4': 20,
            '5': 28,
            '6': 36,
            '7': 44,
            '7-2': 80
        };
        for (var i = 8; i <= 25; i++) {
            this.scoreRule[i] = 96 + (i - 8) * 40;
        }
    };

    Game.prototype.setOption = function(opt) {
        this.opts = $.extend(this.opts, opt);
    };
    Game.prototype.initialize = function() {
        var self = this;
        var grid = this.grid = [];
        var $graph = this.$graph;
        $graph.empty();
        var gameBoardWidth = ~~ ((window.innerHeight - 200) * 7 / 8);
        if ("ontouchstart" in document.documentElement) {
            gameBoardWidth = window.innerWidth * 0.9;
            $("#container").addClass('container-mobile');
        } else {
            $("#container").addClass('container-desktop');
        }
        $graph.width(gameBoardWidth).height(gameBoardWidth);
        var cellWidth = ($graph.width() / this.opts.gridSize) - 2; // -2 for border
        var cellHeight = ($graph.height() / this.opts.gridSize) - 2;

        $("#info").height(cellHeight + 10);
        $("img.icon").width(cellWidth).height(cellHeight);
        $(".move-anywhere img").width(cellWidth - 10).height(cellHeight - 10);
        $(".move-anywhere").css("line-height", (cellHeight + 5) + 'px');
        $("#coming-cells .grid_item").width(cellWidth - 10).height(cellHeight - 10);

        var $cellTemplate = $("<span><span class='grid_item_inner' /></span>").addClass("grid_item").width(cellWidth).height(cellHeight);
        var startSet = false;

        for (var x = 0; x < this.opts.gridSize; x++) {
            var $row = $("<div class='clear' />");
            $graph.append($row);

            var row = [];

            for (var y = 0; y < this.opts.gridSize; y++) {
                var id = "cell_" + x + "_" + y;
                var $cell = $cellTemplate.clone();
                // $cell.attr("id", id).attr("x", x).attr("y", y);
                $cell.find('.grid_item_inner').attr("id", id).attr("x", x).attr("y", y);
                $row.append($cell);
                row.push(GraphNodeType.OPEN);
            }
            grid.push(row);
        }

        // this.graph = new Graph(grid);

        // bind cell event, set start/wall positions
        this.$cells = $graph.find(".grid_item_inner");
        var event = "ontouchstart" in document.documentElement ? "touchstart" : "click";

        this.$cells.on(event, function(evt) {
            console.log(evt);
            self.cellClicked($(this));
        });

        this.makeComingColors();
        this.fillCells();

        $(".move-anywhere").on(event, function(event) {
            console.log(event);
            if (self.anyWhereMoves > 0 && !self.anyWhereMovesChecked) {
                $(this).find('img.on').show();
                $(this).find('img.off').hide();
                self.anyWhereMovesChecked = true;
            } else if (self.anyWhereMovesChecked) {
                $(this).find('img.on').hide();
                $(this).find('img.off').show();
                self.anyWhereMovesChecked = false;
            }
        });
    };

    Game.prototype.makeComingColors = function() {
        this.comingCells = [];
        for (var i = 0; i < this.comingCount[Math.min(this.level, 4)]; i++) {
            var colorIndex = ~~ (Math.random() * colors.length);
            this.comingCells.push(colors[colorIndex]);
            var cell = $("[index=" + i + "]");
            cell.css('background-color', colors[colorIndex]);
        }
    };

    Game.prototype.getAdjacentCells = function($cell) {
        var actions = [

            function(x, y) {
                return {
                    x: x - 1,
                    y: y,
                    direction: 'n-s'
                };
            },
            function(x, y) {
                return {
                    x: x + 1,
                    y: y,
                    direction: 'n-s'
                };
            },
            function(x, y) {
                return {
                    x: x,
                    y: y - 1,
                    direction: 'w-e'
                };
            },
            function(x, y) {
                return {
                    x: x,
                    y: y + 1,
                    direction: 'w-e'
                };
            },
            function(x, y) {
                return {
                    x: x - 1,
                    y: y - 1,
                    direction: 'nw-se'
                };
            },
            function(x, y) {
                return {
                    x: x + 1,
                    y: y + 1,
                    direction: 'nw-se'
                };
            },
            function(x, y) {
                return {
                    x: x - 1,
                    y: y + 1,
                    direction: 'ne-sw'
                };
            },
            function(x, y) {
                return {
                    x: x + 1,
                    y: y - 1,
                    direction: 'ne-sw'
                };
            }
        ];
        var cells = [$cell];
        var directionCells = {
            'w-e': [],
            'n-s': [],
            'nw-se': [],
            'ne-sw': []
        };
        var directions = 0;
        var x = $cell.attr('x'),
            y = $cell.attr('y');
        for (var i = 0; i < actions.length; i++) {
            var cord = actions[i](~~x, ~~y);
            var cx = cord.x,
                cy = cord.y;
            var $target = $(format('[x={0}][y={1}]', cx, cy), this.$graph);
            var search = directionCells[cord.direction];
            while ($target.css('background-color') == $cell.css('background-color')) {
                search.push($target);
                cord = actions[i](cx, cy);
                cx = cord.x;
                cy = cord.y;
                $target = $(format('[x={0}][y={1}]', cx, cy), this.$graph);
            }
            if (search.length >= 3 && i % 2 === 1) {
                cells = cells.concat(search);
                ++directions;
            }
        }
        return {
            cells: cells,
            directions: directions
        };
    };

    Game.prototype.setGameOver = function() {
        this.gameOver = true;
        $('#game-over').show();
        this.showResultPanel();
    };

    Game.prototype.showResultPanel = function() {
        var cur_score = this.score;
        var zs_num, fy_num, sd_num, level;
        if (cur_score < 2000) {
            zs_num = 56;
            fy_num = 70;
            sd_num = 60;

            level_name = '常人';
            zs_num += Math.floor((cur_score / 2000) * 200 + 8) / 10;
            fy_num += Math.floor((cur_score / 2000) * 200 + 1) / 10;
            sd_num += Math.floor((cur_score / 2000) * 200 + 5) / 10;
        } else if (cur_score < 4000) {
            zs_num = 56;
            fy_num = 70;
            sd_num = 60;

            level_name = '高手';
            zs_num += Math.floor((cur_score / 4000) * 200 + 8) / 10;
            fy_num += Math.floor((cur_score / 4000) * 200 + 1) / 10;
            sd_num += Math.floor((cur_score / 4000) * 200 + 5) / 10;
        } else if (cur_score < 6000) {
            zs_num = 68;
            fy_num = 70;
            sd_num = 72;

            level_name = '专家';
            zs_num += Math.floor((cur_score / 6000) * 200 + 2) / 10;
            fy_num += Math.floor((cur_score / 6000) * 200 + 7) / 10;
            sd_num += Math.floor((cur_score / 6000) * 200 + 6) / 10;
        } else if (cur_score < 10000) {
            zs_num = 79;
            fy_num = 75;
            sd_num = 78;

            level_name = '大师';
            zs_num += Math.floor((cur_score / 10000) * 200 + 4) / 10;
            fy_num += Math.floor((cur_score / 10000) * 200 + 1) / 10;
            sd_num += Math.floor((cur_score / 10000) * 200 + 5) / 10;
        } else if (cur_score > 10000) {
            level_name = '神';
            zs_num = 99;
            fy_num = 99;
            sd_num = 99;
        }
        $('#result_content').html('<span style="font-size:36px;"><font color="#fce700">' + cur_score + '!</font></span><br/><br/>' + '天呐！在中国地区<br/>' + '您的智商 <font color="#fc4d35">>' + zs_num + '％</font> 的人<br/>' + '反应速度 <font color="#fc4d35">>' + fy_num + '％</font> 的人<br/>' + '协调能力 <font color="#fc4d35">>' + sd_num + '％</font> 的人<br/><br/>' + '您属于<span style="color:#04e5f9; font-size:30px;">' + level_name + '</span>级别！');
        document.title = format('7X7消除，我大战{0}回合，得了{1}分，你能比我更高吗？', this.turns, this.score);
    };

    Game.prototype.fillCells = function() {
        this.comingCells = this.comingCells || [];
        this.filledMap = this.filledMap || {};
        var grid = this.grid;
        var size = this.opts.gridSize;
        var openList = [];
        for (var row = 0; row < size; row++) {
            for (var col = 0; col < size; col++) {
                if (grid[row][col] == GraphNodeType.OPEN) {
                    openList.push({
                        x: row,
                        y: col,
                        type: grid[row][col]
                    });
                }
            }
        }
        for (var i = 0; i < this.comingCells.length; i++) {
            var openIndex = ~~ (Math.random() * openList.length);
            var x = openList[openIndex].x,
                y = openList[openIndex].y;
            openList.splice(openIndex, 1);
            grid[x][y] = GraphNodeType.WALL;
            var selector = format('span[x={0}][y={1}]', x, y);
            var $cell = $(selector, this.$graph);
            $cell.css('background-color', this.comingCells[i]);
            $cell.attr('wall', 'wall');

            var w = $cell.width(),
                h = $cell.height();
            $cell.width(0).height(0);
            $cell.animate({
                width: w,
                height: h
            }, 'slow', null, function() {

            });

            var adjacentCells = this.getAdjacentCells($cell);
            if (adjacentCells.cells.length >= 4) {
                this.clearAway(adjacentCells.cells);
                this.updateScore(adjacentCells);
            } else if (openList.length === 0) {
                this.setGameOver();
                return;
            }
        }
        this.makeComingColors();
    };

    Game.prototype.clearAway = function(adjacentCells) {
        var self = this;
        for (var i = 0; i < adjacentCells.length; i++) {
            adjacentCells[i].animate({
                width: 0,
                height: 0
            }, 'slow', null, (function(i) {
                return function() {
                    adjacentCells[i].css('background-color', self.opts.bgColor).removeAttr('wall');
                    self.grid[adjacentCells[i].attr('x')][adjacentCells[i].attr('y')] = GraphNodeType.OPEN;
                    adjacentCells[i].css('width', '100%').css('height', '100%');
                }
            })(i));
        }
    };

    Game.prototype.updateScore = function(adjacentCells) {
        var cellCount = adjacentCells.cells.length;
        if (cellCount == 7 && adjacentCells.directions == 2) {
            var score = this.scoreRule[cellCount + '-' + '2'];
            this.score += score;
        } else {
            var score = this.scoreRule[cellCount];
            this.score += score;
        }
        document.getElementById('score').innerText = this.score;
        $("#score").text(this.score);

        if (adjacentCells.directions > 1) {
            ++this.anyWhereMoves;
            $("#anywhere-moves").text(this.anyWhereMoves);
        }
    };

    Game.prototype.cellClicked = function($cell) {
        this.graph = new Graph(this.grid);
        var x = $cell.attr('x'),
            y = $cell.attr('y');
        if (!this.$startCell) {
            if ($cell.attr('wall')) {
                $cell.addClass('selected');
                this.$startCell = $cell;
            }
        } else {
            var startX = this.$startCell.attr('x'),
                startY = this.$startCell.attr('y');
            var startSet = this.graph.grid[startX][startY];
            var endSet = this.graph.grid[x][y];
            this.$startCell.removeClass('selected');
            var path = astar.search(this.graph, startSet, endSet);
            if (!$cell.attr('wall') && (path.length > 0 || this.anyWhereMovesChecked) && !(x == startX && y == startY)) {
                $cell.css('background-color', this.$startCell.css('background-color')).attr('wall', 'wall');
                this.grid[x][y] = GraphNodeType.WALL;

                this.$startCell.css('background-color', '#ddd').removeAttr('wall');
                this.grid[startX][startY] = GraphNodeType.OPEN;

                var adjacentCells = this.getAdjacentCells($cell);
                if (adjacentCells.cells.length >= 4) {
                    this.combo++;
                    this.turns++;
                    this.clearAway(adjacentCells.cells);
                    this.updateScore(adjacentCells);

                    --this.leftMovesToNextLevel;
                    if (this.leftMovesToNextLevel === 0) {
                        ++this.level;
                        $("#level").text(this.level);
                        this.leftMovesToNextLevel = this.opts.movesPerLevel;
                    }
                    $("#movesToNextLevel").text(this.leftMovesToNextLevel);
                } else {
                    this.combo = 0;
                    this.fillCells();
                }
                $("#combo").text(this.combo);

                if (this.anyWhereMovesChecked) {
                    --this.anyWhereMoves;
                    $("#anywhere-moves").text(this.anyWhereMoves);
                    $('img.on').hide();
                    $('img.off').show();
                    this.anyWhereMovesChecked = false;
                }
            }
            this.$startCell = null;
        }
    };

    Game.prototype.nodeFromElement = function($cell) {
        return this.graph.nodes[parseInt($cell.attr("x"))][parseInt($cell.attr("y"))];
    };

    window.Game = Game;
})();

(function() {
    var dataForWeixin = {
        appId: "wxa9826dac1b1390c4",
        MsgImg: "http://www.zoneky.com/studio/games/7X7/7X7.png",
        TLImg: "http://www.zoneky.com/studio/games/7X7/7X7.png",
        url: "http://www.zoneky.com/studio/games/7X7/?from=share",
        title: document.title,
        desc: document.title,
        fakeid: "",
        callback: function() {}
    };

    var mebtnopenurl = 'http://mp.weixin.qq.com/s?__biz=MzA5OTg3MTcyOA==&mid=200360286&idx=1&sn=d744e54a4cfe69fc749707c5ea00f4a7#rd';

    function wexin_share(type) {
        dataForWeixin.title = document.title;
        dataForWeixin.desc = document.title;
        if (type === 2) {
            WeixinJSBridge.invoke('sendAppMessage', {
                "img_url": dataForWeixin.MsgImg,
                "img_width": "120",
                "img_height": "120",
                "link": dataForWeixin.url,
                "desc": dataForWeixin.desc,
                "title": dataForWeixin.title
            }, function(res) {
                // document.location.href = mebtnopenurl;
            });
        } else {
            WeixinJSBridge.invoke('shareTimeline', {
                "img_url": dataForWeixin.TLImg,
                "img_width": "120",
                "img_height": "120",
                "link": dataForWeixin.url,
                "desc": dataForWeixin.desc,
                "title": dataForWeixin.title
            }, function(res) {
                // document.location.href = mebtnopenurl;
            });
        }
    }

    (function() {

        var onBridgeReady = function() {

            WeixinJSBridge.on('menu:share:appmessage', function(argv) {
                wexin_share(2);
            });

            WeixinJSBridge.on('menu:share:timeline', function(argv) {
                wexin_share(1);
            });

            WeixinJSBridge.on('menu:share:weibo', function(argv) {
                dataForWeixin.title = document.title;
                dataForWeixin.desc = document.title;
                WeixinJSBridge.invoke('shareWeibo', {
                    "img_url": dataForWeixin.TLImg,
                    "img_width": "120",
                    "img_height": "120",
                    "content": dataForWeixin.title,
                    "url": dataForWeixin.url

                }, function(res) {
                    (dataForWeixin.callback)();
                });

            });

            WeixinJSBridge.on('menu:share:facebook', function(argv) {
                (dataForWeixin.callback)();

                WeixinJSBridge.invoke('shareFB', {
                    "img_url": dataForWeixin.TLImg,
                    "img_width": "120",
                    "img_height": "120",
                    "link": dataForWeixin.url,
                    "desc": dataForWeixin.desc,

                    "title": dataForWeixin.title
                }, function(res) {});
            });
        };

        if (document.addEventListener) {
            document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);

        } else if (document.attachEvent) {

            document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
            document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
        }
    })();
})();