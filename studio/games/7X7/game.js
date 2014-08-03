;
(function() {
    function format() {
        if (arguments.length === 0) {
            return '';
        }
        var formatStr = arguments[0];
        var args = [].slice.call(arguments, 1);
        for (var i = 0; i < args.length; i++) {
            formatStr = formatStr.replace('{' + i + '}', args[i]);
        };
        return formatStr;
    }
    var css = {
        wall: 'wall',
        open: 'open'
    }
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
        this.opts = $.extend({
            bgColor: '#ddd',
            movesPerLevel: 40,
            wallFrequency: .1,
            debug: true,
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
        if (opt["debug"] || opt["debug"] == false) {
            this.drawDebugInfo(opt["debug"]);
        }
    };
    Game.prototype.initialize = function() {
        var self = this;
        var grid = this.grid = [];
        var $graph = this.$graph;
        $graph.empty();

        var cellWidth = ($graph.width() / this.opts.gridSize) - 2; // -2 for border
        var cellHeight = ($graph.height() / this.opts.gridSize) - 2;
        var $cellTemplate = $("<span />").addClass("grid_item").width(cellWidth).height(cellHeight);
        var startSet = false;

        for (var x = 0; x < this.opts.gridSize; x++) {
            var $row = $("<div class='clear' />");
            $graph.append($row);

            var row = [];

            for (var y = 0; y < this.opts.gridSize; y++) {
                var id = "cell_" + x + "_" + y;
                var $cell = $cellTemplate.clone();
                $cell.attr("id", id).attr("x", x).attr("y", y);
                $row.append($cell);
                row.push(GraphNodeType.OPEN);
            }
            grid.push(row);
        }

        // this.graph = new Graph(grid);

        // bind cell event, set start/wall positions
        this.$cells = $graph.find(".grid_item");
        this.$cells.click(function() {
            self.cellClicked($(this));
        });

        this.makeComingColors();
        this.fillCells();

        $(".move-anywhere img").click(function() {
            if (self.anyWhereMoves > 0 && !self.anyWhereMovesChecked) {
                this.src = 'move-anywhere-checked.png';
                self.anyWhereMovesChecked = true;
            } else if (self.anyWhereMovesChecked) {
                this.src = 'move-anywhere.png';
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
        if (openList.length === 0) {
            this.setGameOver();
            return;
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

            var adjacentCells = this.getAdjacentCells($cell);
            if (adjacentCells.cells.length >= 4) {
                this.clearAway(adjacentCells.cells);
                this.updateScore(adjacentCells);
            }
        }
        this.makeComingColors();
    };

    Game.prototype.clearAway = function(adjacentCells) {
        for (var i = 0; i < adjacentCells.length; i++) {
            adjacentCells[i].css('background-color', this.opts.bgColor).removeAttr('wall');
            this.grid[adjacentCells[i].attr('x')][adjacentCells[i].attr('y')] = GraphNodeType.OPEN;
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
                    $(".move-anywhere img").attr('src', 'move-anywhere.png');
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