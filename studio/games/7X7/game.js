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
    var colors = ['red', 'purple', 'yellow', 'green', 'blue'];

    var GraphNodeType = {
        OPEN: 1,
        WALL: 0
    };

    function Game($graph, options, implementation) {
        this.$graph = $graph;
        this.$comingCells = $('#coming-cells');
        this.search = implementation;
        this.comingCount = 5;
        this.opts = $.extend({
            wallFrequency: .1,
            debug: true,
            gridSize: 7
        }, options);
        this.initialize();
    }
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
    };

    Game.prototype.makeComingColors = function() {
        this.comingCells = [];
        for (var i = 0; i < this.comingCount; i++) {
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
                    x: --x,
                    y: y
                };
            },
            function(x, y) {
                return {
                    x: ++x,
                    y: y
                };
            },
            function(x, y) {
                return {
                    x: x,
                    y: --y
                };
            },
            function(x, y) {
                return {
                    x: x,
                    y: ++y
                };
            },
            function(x, y) {
                return {
                    x: --x,
                    y: --y
                };
            },
            function(x, y) {
                return {
                    x: --x,
                    y: ++y
                };
            },
            function(x, y) {
                return {
                    x: ++x,
                    y: --y
                };
            },
            function(x, y) {
                return {
                    x: ++x,
                    y: ++y
                };
            }
        ];
        var cells = [$cell];
        //up
        var x = $cell.attr('x'),
            y = $cell.attr('y');
        for (var i = 0; i < actions.length; i++) {
            var cord = actions[i](x, y);
            var cx = cord.x,
                cy = cord.y;
            var $target = $(format('[x={0}][y={1}]', cx, cy), this.$graph);
            var search = [];
            while ($target.css('background-color') == $cell.css('background-color')) {
                search.push($target);
                cord = actions[i](cx, cy);
                cx = cord.x;
                cy = cord.y;
                $target = $(format('[x={0}][y={1}]', cx, cy), this.$graph);
            }
            if (search.length >= 3) {
                cells = cells.concat(search);
            }
        }
        return cells;
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
            var cell = $(selector, this.$graph);
            cell.css('background-color', this.comingCells[i]);
            cell.attr('wall', 'wall');
        }
        this.makeComingColors();
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
            if (!$cell.attr('wall') && path.length > 0 && !(x == startX && y == startY)) {
                $cell.css('background-color', this.$startCell.css('background-color')).attr('wall', 'wall');
                this.grid[x][y] = GraphNodeType.WALL;
                var adjacentCells = this.getAdjacentCells($cell);
                if (adjacentCells.length >= 4) {
                    for (var i = 0; i < adjacentCells.length; i++) {
                        adjacentCells[i].css('background-color', '#ddd').removeAttr('wall');
                        this.grid[adjacentCells[i].attr('x')][adjacentCells[i].attr('y')] = GraphNodeType.OPEN;
                    }
                } else {
                    this.fillCells();
                }
                console.log(adjacentCells);
            }
            this.$startCell = null;
        }
    };

    Game.prototype.nodeFromElement = function($cell) {
        return this.graph.nodes[parseInt($cell.attr("x"))][parseInt($cell.attr("y"))];
    };

    window.Game = Game;
})();