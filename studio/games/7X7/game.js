;(function() {
    function format() {
        if(arguments.length === 0) {
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

    var GraphNodeType = { OPEN: 0, WALL: 1 };

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
            self.cellClicked($(this))
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
        };
    }

    Game.prototype.fillCells = function() {
        this.comingCells = this.comingCells || [];
        this.filledMap = this.filledMap || {};
        var grid = this.grid;
        var size = this.opts.gridSize;
        var openList = [];
        for(var row = 0; row < size; row++) {
            for(var col = 0; col < size; col++) {
                if(grid[row][col] == GraphNodeType.OPEN) {
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
        };
        this.makeComingColors();
        this.graph = new Graph(grid);
    }

    Game.prototype.cellClicked = function($end) {

        var end = this.nodeFromElement($end);

        // if ($end.hasClass(css.wall) || $end.hasClass(css.start)) {
        //     log("clicked on wall or start...", $end);
        //     return;
        // }
        this.fillCells();

        // this.$cells.removeClass(css.finish);
        // $end.addClass("finish");
        // var $start = this.$cells.filter("." + css.start);
        // var start = this.nodeFromElement($start);

        // var sTime = new Date();
        // var path = this.search(this.graph.nodes, start, end);
        // var fTime = new Date();

        // if (!path || path.length == 0) {
        //     $("#message").text("couldn't find a path (" + (fTime - sTime) + "ms)");
        //     this.animateNoPath();
        // } else {
        //     $("#message").text("search took " + (fTime - sTime) + "ms.");
        //     this.drawDebugInfo(this.opts.debug);
        //     this.animatePath(path);
        // }
    };
    Game.prototype.nodeFromElement = function($cell) {
        return this.graph.nodes[parseInt($cell.attr("x"))][parseInt($cell.attr("y"))];
    };

    window.Game = Game;
})();