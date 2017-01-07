define('app/client/domain/model/Stone',['require'],function(require) {
  "use strict";

  /**
   * @param {Number} color
   */
  var Stone = function(color) {
    if (color !== 0 && color !== 1) {
      throw new Error("Color must be Black(1) or White(2).");
    }

    this._color = color;
  };

  Stone.prototype = {};

  Object.defineProperties(Stone.prototype, {
    color: {
      get: function() { return this._color;  },
      configurable: false,
    },
  });

  Stone.prototype.equals = function(o) {
    if (!(o instanceof Stone)) {
      return false;
    }

    return this.color === o.color;
  }

  Stone.Black = new Stone(0);
  Stone.White = new Stone(1);

  return Stone;
});


define('app/client/domain/model/Board',['require','app/client/domain/model/Stone'],function(require) {
  "use strict";

  var Stone = require('app/client/domain/model/Stone');

  /**
   * @param {Number} size
   */
  var Board = function(size) {
    var x, y;

    if (Math.round(size) !== size) {
      throw new Error("Size must be integer");
    }

    if (size < 5 && size > 19) {
      throw new Error("Size must be between 5 and 19");
    }

    this._size = size;
    this._coordinates = [];
    this._lastCoordinates = null;
    this._secondLastCoordinates = null;
    for (x = 0; x < size; x++) {
      this._coordinates[x] = [];
      for (y = 0; y < size; y++) {
        this._coordinates[x][y] = null;
      }
    }
  };

  Board.prototype = {};

  Object.defineProperties(Board.prototype, {
    size: {
      get: function() { return this._size; },
      configurable: false,
    },
  });

  Board.prototype.getStone = function(x, y) {
    return this._coordinates[x][y];
  };

  Board.prototype.putStone = function(x, y, stone) {
    var coords;

    if (!this.canPutStone(x, y, stone)) {
      return -1;
    }

    this._rotateLastCoordinates();
    this._coordinates[x][y] = stone;

    coords = this._capture(x, y, stone);
    return coords.length;
  };

  Board.prototype._rotateLastCoordinates = function() {
    var x, y;

    // the first step
    if (this._lastCoordinates == null) {
      this._lastCoordinates = [];

      for (x = 0; x < this.size; x++) {
        this._lastCoordinates[x] = [];
        for (y = 0; y < this.size; y++) {
          this._lastCoordinates[x][y] = this._coordinates[x][y];
        }
      }

      return;
    }

    // the second step
    if (this._secondLastCoordinates == null) {
      this._secondLastCoordinates = [];
      for (x = 0; x < this.size; x++) {
        this._secondLastCoordinates[x] = [];
        for (y = 0; y < this.size; y++) {
          this._secondLastCoordinates[x][y] = this._lastCoordinates[x][y];
          this._lastCoordinates[x][y] = this._coordinates[x][y];
        }
      }

      return;
    }

    // the second step or later
    for (x = 0; x < this.size; x++) {
      for (y = 0; y < this.size; y++) {
        this._secondLastCoordinates[x][y] = this._lastCoordinates[x][y];
        this._lastCoordinates[x][y] = this._coordinates[x][y];
      }
    }
  };

  Board.prototype.canPutStone = function(x, y, stone) {
    if (this.isOuterField(x, y)) {
      return false;
    }

    if (this.isBanPoint(x, y, stone)) {
      return false;
    }

    return true;
  };

  Board.prototype.isOuterField = function(x, y) {
    return x < 0 || x >= this.size || y < 0 || y >= this.size;
  };

  Board.prototype.existsStone = function(x, y) {
    return this._coordinates[x][y] != null;
  };

  Board.prototype.isBanPoint = function(x, y, stone) {
    if (this.existsStone(x, y)) {
      return false;
    }

    if (this.dryPutStone(x, y, stone) === -1) {
      return true;
    }

    return false;
  };

  Board.prototype.dryPutStone = function(x, y, stone) {
    var coords;
    var dryBoard = this._copy();

    dryBoard._rotateLastCoordinates();
    dryBoard._coordinates[x][y] = stone;

    coords = dryBoard._capture(x, y, stone);
    if (coords.length === 0) {
      if(dryBoard._isSurroundedByEnemy(x, y, stone)) {
        return -1;
      }
    }

    if (dryBoard._isRecapturingKoimmediately()) {
      return -1;
    }

    return coords.length;
  };

  Board.prototype._copy = function() {
    var dryBoard = new Board(this.size);
    var xi, yi;
    var existsLast = (this._lastCoordinates != null);
    var existsSecondLast = (this._secondLastCoordinates != null);

    if (existsLast) {
      dryBoard._lastCoordinates = [];
      for (xi = 0; xi < dryBoard.size; xi++) {
        dryBoard._lastCoordinates[xi] = [];
      }
    }

    if (existsSecondLast) {
      dryBoard._secondLastCoordinates = [];
      for (xi = 0; xi < dryBoard.size; xi++) {
        dryBoard._secondLastCoordinates[xi] = [];
      }
    }

    for (xi = 0; xi < dryBoard.size; xi++) {
      for (yi = 0; yi < dryBoard.size; yi++) {
        if (existsSecondLast) {
          dryBoard._secondLastCoordinates[xi][yi] = this._secondLastCoordinates[xi][yi];
        }
        if (existsLast) {
          dryBoard._lastCoordinates[xi][yi] = this._lastCoordinates[xi][yi];
        }

        dryBoard._coordinates[xi][yi] = this._coordinates[xi][yi];
      }
    }

    return dryBoard;
  };

  Board.prototype._isRecapturingKoimmediately = function() {
    var x, y;

    if (this._secondLastCoordinates == null) {
      return false;
    }

    for (x = 0; x < this.size; x++) {
      for (y = 0; y < this.size; y++) {
        if (this._coordinates[x][y] !== this._secondLastCoordinates[x][y]) {
          return false;
        }
      }
    }

    return true;
  };

  Board.prototype._capture = function(x, y, myStone) {
    var stone;
    var searched = [];
    var xi, yi;
    var coords = [],
      coords1 = [],
      coords2 = [],
      coords3 = [],
      coords4 = [];
    var coord;
    var i;

    if (myStone.equals(Stone.Black)) {
      stone = Stone.White;
    } else {
      stone = Stone.Black;
    }

    for (xi = 0; xi < this.size; xi++) {
      searched[xi] = [];
      for (yi = 0; yi < this.size; yi++) {
        searched[xi][yi] = false;
      }
    }

    if (!this.searchSpace(this._correctCoordinate(x - 1), y, stone, searched, coords1)) {
      coords = coords1.concat();
    }
    if (!this.searchSpace(x, this._correctCoordinate(y - 1), stone, searched, coords2)) {
      coords = coords.concat(coords2);
    }
    if (!this.searchSpace(this._correctCoordinate(x + 1), y, stone, searched, coords3)) {
      coords = coords.concat(coords3);
    }
    if (!this.searchSpace(x, this._correctCoordinate(y + 1), stone, searched, coords4)) {
      coords = coords.concat(coords4);
    }

    for (i = 0; i < coords.length; i++) {
      coord = coords[i];
      this._coordinates[coord.x][coord.y] = null;
    }

    return coords;
  };

  Board.prototype.searchSpace = function(xx, yy, myStone, searched, coords) {
    if (searched[xx][yy]) {
      return false;
    }

    if (this._coordinates[xx][yy] == null) {
      return true;
    }

    searched[xx][yy] = true;

    if (this._coordinates[xx][yy].equals(myStone)) {
      coords.push({x: xx, y: yy});
      if (this.searchSpace(this._correctCoordinate(xx - 1), yy, myStone, searched, coords)) return true;
      if (this.searchSpace(xx, this._correctCoordinate(yy - 1), myStone, searched, coords)) return true;
      if (this.searchSpace(this._correctCoordinate(xx + 1), yy, myStone, searched, coords)) return true;
      if (this.searchSpace(xx, this._correctCoordinate(yy + 1), myStone, searched, coords)) return true;
    }

    return false;
  };

  Board.prototype._isSurroundedByEnemy = function(x, y, myStone) {
    var searched = [];
    var xi, yi;
    var coords = [];

    for (xi = 0; xi < this.size; xi++) {
      searched[xi] = [];
      for (yi = 0; yi < this.size; yi++) {
        searched[xi][yi] = false;
      }
    }

    return !this.searchSpace(x, y, myStone, searched, coords);
  };

  Board.prototype._correctCoordinate = function(n) {
    while (n < 0) {
      n = n + this.size;
    }

    if (n >= this.size) {
      n = n % this.size;
    }

    return n;
  };

  Board.prototype.getState = function() {
    return this;
  };

  return Board;
});


define('app/client/domain/model/Game',['require','app/client/domain/model/Board','app/client/domain/model/Stone'],function(require) {
  "use strict";

  var Board = require('app/client/domain/model/Board');
  var Stone = require('app/client/domain/model/Stone');

  /**
   * @param {GameId} id
   * @param {GameCondition} condition
   */
  var Game = function(id, condition) {
    this._id = id;
    this._condition = condition;
    this._board = new Board(condition.boardSize);
    this._phase = Stone.Black;
  };

  Game.prototype = {};

  Object.defineProperties(Game.prototype, {
    id: {
      get: function() { return this._id;  },
    },

    phase: {
      get: function() { return this._phase;  },
    },
  });

  Game.prototype.putNextStone = function(x, y) {
    if (this._board.putStone(x, y, this.phase) === -1) {
      return false;
    }

    this._switchPhase();
    return true
  };

  Game.prototype.pass = function(x, y) {
    this._switchPhase();
  };

  Game.prototype._switchPhase = function() {
    if (this._phase.equals(Stone.Black)) {
      this._phase = Stone.White;
    } else {
      this._phase = Stone.Black;
    }
  };

  Game.prototype.getState = function() {
    return {
      phase: this.phase,
      board: this._board.getState(),
    }
  };

  return Game;
});


define('app/client/domain/model/GameId',['require'],function(require) {
  "use strict";

  /**
   * @param {String} id
   */
  var GameId = function(id) {
    this._id = id;
  };

  GameId.prototype = {};

  Object.defineProperties(GameId.prototype, {
    id: {
      get: function() { return this._id;  },
      configurable: false,
    },
  });

  GameId.prototype.equals = function(o) {
    if (!(o instanceof GameId)) {
      return false;
    }

    return this.id === o.id;
  }

  return GameId;
});


define('app/client/domain/model/GameCondition',['require'],function(require) {
  "use strict";

  var GameCondition = function(condition) {
    this._boardSize = condition.boardSize;
  };

  GameCondition.prototype = {};

  Object.defineProperties(GameCondition.prototype, {
    boardSize: {
      get: function() { return this._boardSize; },
      configurable: false,
    },
  });

  GameCondition.prototype.equals = function(o) {
    if (!(o instanceof GameCondition)) {
      return false;
    }

    return this.boardSize === o.boardSize;
  }

  return GameCondition;
});


define('app/client/infra/GameRepository',['require'],function(require) {
  "use strict";

  var GameRepository = {};

  Object.defineProperties(GameRepository, {
    currentGame: {
      get: function() { return this._currentGame; },
      set: function(value) { this._currentGame = value; }
    },
  });

  var id = 0;
  GameRepository.nextGameId = function() {
    id++;
    return "" + id;
  };

  return GameRepository;
});


define('app/client/app/service/GameService',['require','app/client/domain/model/Game','app/client/domain/model/GameId','app/client/domain/model/GameCondition','app/client/infra/GameRepository'],function(require) {
  "use strict";

  var Game = require('app/client/domain/model/Game');
  var GameId = require('app/client/domain/model/GameId');
  var GameCondition = require('app/client/domain/model/GameCondition'); 

  var GameService = function() {
    // TODO: ここはファクトリメソッドを用意して、差し替えられるようにする
    this._gameRepository = require('app/client/infra/GameRepository');
  };

  GameService.prototype = {};

  GameService.prototype.newGame = function(condition) {
    var newGameId = this._gameRepository.nextGameId();
    var gameCondition = new GameCondition({
      boardSize: condition.board.size,
    });
    var game = new Game(newGameId, gameCondition);
    this._gameRepository.currentGame = game;

    return game.getState();
  };

  /**
   * @param {String} id
   * @param {Number} x
   * @param {Number} y
   */
  GameService.prototype.putNextStone = function(x, y) {
    var game = this._gameRepository.currentGame;
    if (!game.putNextStone(x, y)) {
      return null;
    }

    return game.getState();
  };

  /**
   * @param {String} id
   */
  GameService.prototype.pass = function() {
    var game = this._gameRepository.currentGame
    game.pass();

    return game.getState();
  };

  return GameService;
});


define('app/client/mediator/GameMediator.js',['require','app/client/app/service/GameService','lib/eventemitter2'],function(require) {
  "use strict";

  var GameService = require('app/client/app/service/GameService');
  var EventEmitter = require('lib/eventemitter2');

  var GameMediator = function() {
    EventEmitter.call(this);

    // TODO: ファクトリメソッドを使うようにする
    this._gameService = new GameService();
  };

  GameMediator.prototype = Object.create(EventEmitter.prototype);

  GameMediator.prototype.startGame= function(condition) {
    var gameState = this._gameService.newGame(condition);

    this.emit('refreshAll', gameState);
  };

  GameMediator.prototype.putStone = function(x, y) {
    var gameState = this._gameService.putNextStone(x, y);
    if (gameState != null) {
      this.emit('refreshAll', gameState);
    }
  };

  GameMediator.prototype.mouseUpLeftOnBoard = function(data) {

  };

  GameMediator.prototype.pass = function() {
    var gameState = this._gameService.pass();
  };

  return GameMediator;
});


define('app/client/view/BoardView',['require','app/client/domain/model/Stone','app/client/mediator/GameMediator.js'],function(require) {
  "use strict";

  // Constants
  var MouseButton = {
    Left: 1,
    Middle: 2,
    Right: 3,
  };
  var Stone = require('app/client/domain/model/Stone');

  // Mediator
  var GameMediator = require('app/client/mediator/GameMediator.js');

  var BoardView = function(mediator, size) {
    this._mediator = mediator;
    this._cachedGameState = null;

    this._size = size;
    this._defaultCenter = {
      x: Math.floor(size / 2),
      y: Math.floor(size / 2),
    };

    this._center = {
      x: this._defaultCenter.x,
      y: this._defaultCenter.y,
    };

    this._init();
  };

  BoardView.prototype._init = function() {
    this._$canvas = $('#board');
    this._canvas = $('#board')[0];
    this._$backCanvas = $('#back-board');
    this._backCanvas = $('#back-board')[0];
    this._ctx = this._canvas.getContext('2d');
    this._backCtx = this._backCanvas.getContext('2d');
    this._baseCanvasSize = { x: 748, y: 748 };
    this._height = this._canvas.width;
    this._width = this._canvas.height;

    var that = this;
    this._mediator.on('refreshAll', function(gameState) {
      that._cachedGameState = gameState;
      that._refreshAll(gameState);
    });

    (function() {
      var unit = 44;
      var mouseDownOriginalOffset = null;
      var grabCenter = null;

      var previousMouseMove = Date.now();
      that._$canvas.mousemove(function(e) {
        if (Date.now() - previousMouseMove > 50) {
          if (that._$canvas.hasClass('grabbing')) {
            moveCenter.call(that, e.offsetX, e.offsetY);
          } else {
            hoverOnBoard.call(that, e.offsetX, e.offsetY);
          }

          previousMouseMove = Date.now();
        }
      });

      var moveCenter = function(offsetX, offsetY) {
        var unit = 44;
        var dx = Math.floor(offsetX / this._canvasRatio) - mouseDownOriginalOffset.x;
        var dy = Math.floor(offsetY / this._canvasRatio) - mouseDownOriginalOffset.y;
        if (dx < 0) {
          dx = Math.ceil(dx / unit);
        } else if (dx > 0) {
          dx = Math.floor(dx / unit);
        } else {
          dx = 0;
        }

        if (dy < 0) {
          dy = Math.ceil(dy / unit);
        } else if (dy > 0) {
          dy = Math.floor(dy / unit);
        } else {
          dy = 0;
        }

        this._center.x = (this._size + grabCenter.x - dx) % this._size;
        this._center.y = (this._size + grabCenter.y - dy) % this._size;

        this._refreshAll(this._cachedGameState);
      };

      var hoverOnBoard = function(offsetX, offsetY) {
        var localPos = that._calculateLocalPosition(offsetX, offsetY);
        var cgs = that._cachedGameState;
        if (cgs.board.existsStone(localPos.x, localPos.y)) {
          that._$canvas.removeClass('grabbing');
          that._$canvas.addClass('grabbable');
        } else {
          that._$canvas.removeClass('grabbable');
          that._$canvas.removeClass('grabbing');
        }
      };

      that._$canvas.mousedown(function(e) {
        if (e.which !== MouseButton.Left) {
          return;
        }

        mouseDownOriginalOffset = {
          x: Math.floor(e.offsetX / that._canvasRatio),
          y: Math.floor(e.offsetY / that._canvasRatio),
        }

        var localPos = that._calculateLocalPosition(e.offsetX, e.offsetY);
        var cgs = that._cachedGameState;
        if (cgs.board.existsStone(localPos.x, localPos.y)) {
          grabBoard.call(that);
        }
      });

      that._$canvas.mouseup(function(e) {
        if (e.which !== MouseButton.Left) {
          return;
        }

        e.stopPropagation();

        if (grabCancel.call(that)) {
          mouseDownOriginalOffset = null;
          return;
        }

        var offset = {
          x: Math.floor(e.offsetX / that._canvasRatio),
          y: Math.floor(e.offsetY / that._canvasRatio),
        };
        if (!isStrictSamePos.call(that, offset, mouseDownOriginalOffset)) {
          return;
        }

        var localPos = that._calculateLocalPosition(e.offsetX, e.offsetY);
        var cgs = that._cachedGameState;

        that._mediator.putStone(localPos.x, localPos.y);

        mouseDownOriginalOffset = null;
      });

      $(document).mouseup(function(e) {
        if (e.which !== MouseButton.Left) {
          return;
        }

        grabCancel.call(that);
      });

      var grabCancel = function() {
        if (this._$canvas.hasClass('grabbing')) {
          this._$canvas.removeClass('grabbing');
          mouseDownOriginalOffset = null;
          return true;
        } else {
          return false;
        }
      };

      var isStrictSamePos = function(pos1, pos2) {
        var unit = 44;
        var halfUnit = unit / 2;
        var x1 = Math.round((pos1.x - halfUnit) / unit);
        var y1 = Math.round((pos1.y - halfUnit) / unit);
        var x2 = Math.round((pos2.x - halfUnit) / unit);
        var y2 = Math.round((pos2.y - halfUnit) / unit);

        return x1 === x2 && y1 === y2;
      };

      var grabBoard = function() {
        this._$canvas.removeClass('grabbable');
        this._$canvas.addClass('grabbing');
        grabCenter = {
          x: this._center.x,
          y: this._center.y,
        };
      };

    })();

    $(window).resize(function(e) {
      var rect = that._canvas.getBoundingClientRect();
      that._canvasRatio = rect.width / that._baseCanvasSize.x;
    }).trigger('resize');
  };

  BoardView.prototype._calculateLocalPosition = function(cx, cy) {
    var unit = 44;
    var halfUnit = unit / 2;
    var margin = 176;
    var x, y;
    var cgs = this._cachedGameState;
    var block = unit * cgs.board.size;

    // to canvas coord
    x = Math.floor(cx / this._canvasRatio);
    y = Math.floor(cy / this._canvasRatio);

    // to main board coord
    x = (x - margin + block) % block;
    y = (y - margin + block) % block;

    // to local coord
    x = Math.round((x - halfUnit) / unit);
    y = Math.round((y - halfUnit) / unit);

    // slide center
    x = (this._center.x - this._defaultCenter.x + x + this._size) % this._size;
    y = (this._center.y - this._defaultCenter.y + y + this._size) % this._size;

    return {
      x: x,
      y: y,
    };
  };

  BoardView.prototype._refreshAll = function(gs) {
    this._clearBoard(this._backCtx);
    this._clearBoard(this._ctx);
    this._writeBoard(gs);
    this._writeStars(gs);
    this._writeStones(gs);

    var unit = 44;
    var halfUnit = unit / 2;
    var margin = 198;
    var unit4 = unit * 4;
    var unit5 = unit * 5;
    var unit8 = unit * 8;
    var unit9 = unit * 9;

    this._ctx.save();
    this._ctx.globalAlpha = 0.4;
    this._ctx.fillStyle = 'rgb(0, 255, 255)';
    this._ctx.fillRect(0, 0, this._width, this._height);
    this._ctx.restore();

    this._ctx.save();
    this._ctx.globalAlpha = 0.7;

    // left-up
    this._ctx.drawImage(this._backCanvas, margin + unit5 - halfUnit, margin + unit5 - halfUnit, unit4, unit4, 0, 0, unit4, unit4);

    // right-up
    this._ctx.drawImage(this._backCanvas, margin - halfUnit, margin + unit5 - halfUnit, unit4, unit4, margin + unit8 + halfUnit, 0, unit4, unit4);

    // left-down
    this._ctx.drawImage(this._backCanvas, margin + unit5 - halfUnit, margin - halfUnit, unit4, unit4, 0, margin + unit8 + halfUnit, unit4, unit4);

    // right-down
    this._ctx.drawImage(this._backCanvas, margin - halfUnit, margin - halfUnit, unit4, unit4, margin + unit8 + halfUnit, margin + unit8 + halfUnit, unit4, unit4);

    // up
    this._ctx.drawImage(this._backCanvas, margin - halfUnit, margin + unit5 - halfUnit, unit9, unit4, margin - halfUnit, 0, unit9, unit4);

    // left
    this._ctx.drawImage(this._backCanvas, margin + unit5 - halfUnit, margin - halfUnit, unit4, unit9, 0, margin - halfUnit, unit4, unit9);

    // down
    this._ctx.drawImage(this._backCanvas, margin - halfUnit, margin - halfUnit, unit9, unit4, margin - halfUnit, margin + unit8 + halfUnit, unit9, unit4);

    // right
    this._ctx.drawImage(this._backCanvas, margin - halfUnit, margin - halfUnit, unit4, unit9, margin + unit8 + halfUnit, margin - halfUnit, unit4, unit9);

    this._ctx.restore();
    this._ctx.drawImage(this._backCanvas, margin - halfUnit, margin - halfUnit, unit9, unit9, margin - halfUnit, margin - halfUnit, unit9, unit9);
  };

  BoardView.prototype._clearBoard = function(ctx) {
    ctx.fillStyle = 'rgb(64, 64, 64)';
    ctx.fillRect(0, 0, this._width, this._height);
  };

  BoardView.prototype._writeBoard = function(gs) {
    var c = this._backCtx;
    var x, y;
    var unit = 44;
    var halfUnit = unit / 2;
    var margin = 176;

    c.beginPath();
    c.strokeStyle = 'rgb(255, 255, 255)';
    c.lineWidth = 3;
    for (x = 0; x < gs.board.size; x++) {
      c.moveTo(unit * x + halfUnit + margin, margin - halfUnit);
      c.lineTo(unit * x + halfUnit + margin, this._height - margin + halfUnit);
    }

    for (y = 0; y < gs.board.size; y++) {
      c.moveTo(margin - halfUnit,               unit * y + halfUnit + margin);
      c.lineTo(this._width - margin + halfUnit, unit * y + halfUnit + margin);
    }

    c.closePath();
    c.stroke();
  };

  BoardView.prototype._writeStars = function(gs) {
    var c = this._backCtx;
    var i;
    var x, y;
    var xx, yy;
    var unit = 44;
    var halfUnit = unit / 2;
    var margin = 176;
    var stars = [
      { x: 2, y:2 },
      { x: 4, y:4 },
      { x: 6, y:2 },
      { x: 4, y:4 },
      { x: 2, y:6 },
      { x: 6, y:6 },
    ]

    c.fillStyle = 'rgb(255, 255, 255)';
    for (i = 0; i < stars.length; i++) {
      x = stars[i].x;
      y = stars[i].y;
      xx = (this._size + this._defaultCenter.x + x - this._center.x) % this._size;
      yy = (this._size + this._defaultCenter.y + y - this._center.y) % this._size;

      c.beginPath();
      c.arc(xx * unit + halfUnit + margin, yy * unit + halfUnit + margin, 6, 0, Math.PI * 2, true);
      c.fill();
      c.closePath();
    }
  };

  BoardView.prototype._writeStones = function(gs) {
    var c = this._backCtx;
    var x, y;
    var xx, yy;
    var unit = 44;
    var halfUnit = unit / 2;
    var margin = 176;

    c.lineWidth = 3;

    for (x = 0; x < gs.board.size; x++) {
      for (y = 0; y < gs.board.size; y++) {
        xx = (this._size + this._defaultCenter.x + x - this._center.x) % this._size;
        yy = (this._size + this._defaultCenter.y + y - this._center.y) % this._size;

        if (gs.board.getStone(x, y) === Stone.Black) {
          c.beginPath();
          c.strokeStyle = 'rgb(255, 255, 255)';
          c.fillStyle = 'rgb(0, 0, 0)';
          c.arc(xx * unit + halfUnit + margin, yy * unit + halfUnit + margin, 20, 0, Math.PI * 2, true);
          c.stroke();
          c.fill();
          c.closePath();
        } else if (gs.board.getStone(x, y) === Stone.White) {
          c.beginPath();
          c.strokeStyle = 'rgb(0, 0, 0)';
          c.fillStyle = 'rgb(255, 255, 255)';
          c.arc(xx * unit + halfUnit + margin, yy * unit + halfUnit + margin, 20, 0, Math.PI * 2, true);
          c.stroke();
          c.fill();
          c.closePath();
        }
      }
    }
  };

  return BoardView;
});


define('app/client/main',['require','app/client/mediator/GameMediator.js','app/client/view/BoardView'],function(require) {
  "use strict";

  var GameMediator = require('app/client/mediator/GameMediator.js');
  var BoardView = require('app/client/view/BoardView');

  var main = function() {};
  main.prototype = {
    start: function() {
      var mediator = new GameMediator();

      var boardView = new BoardView(mediator, 9);

      mediator.startGame({
        board: {
          size: 9,
        },
      });
    }
  };

  return main;
});



//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJidW5kbGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiZGVmaW5lKCdhcHAvY2xpZW50L2RvbWFpbi9tb2RlbC9TdG9uZScsWydyZXF1aXJlJ10sZnVuY3Rpb24ocmVxdWlyZSkge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICAvKipcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGNvbG9yXG4gICAqL1xuICB2YXIgU3RvbmUgPSBmdW5jdGlvbihjb2xvcikge1xuICAgIGlmIChjb2xvciAhPT0gMCAmJiBjb2xvciAhPT0gMSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ29sb3IgbXVzdCBiZSBCbGFjaygxKSBvciBXaGl0ZSgyKS5cIik7XG4gICAgfVxuXG4gICAgdGhpcy5fY29sb3IgPSBjb2xvcjtcbiAgfTtcblxuICBTdG9uZS5wcm90b3R5cGUgPSB7fTtcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhTdG9uZS5wcm90b3R5cGUsIHtcbiAgICBjb2xvcjoge1xuICAgICAgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuX2NvbG9yOyAgfSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gICAgfSxcbiAgfSk7XG5cbiAgU3RvbmUucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uKG8pIHtcbiAgICBpZiAoIShvIGluc3RhbmNlb2YgU3RvbmUpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuY29sb3IgPT09IG8uY29sb3I7XG4gIH1cblxuICBTdG9uZS5CbGFjayA9IG5ldyBTdG9uZSgwKTtcbiAgU3RvbmUuV2hpdGUgPSBuZXcgU3RvbmUoMSk7XG5cbiAgcmV0dXJuIFN0b25lO1xufSk7XG5cblxuZGVmaW5lKCdhcHAvY2xpZW50L2RvbWFpbi9tb2RlbC9Cb2FyZCcsWydyZXF1aXJlJywnYXBwL2NsaWVudC9kb21haW4vbW9kZWwvU3RvbmUnXSxmdW5jdGlvbihyZXF1aXJlKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIHZhciBTdG9uZSA9IHJlcXVpcmUoJ2FwcC9jbGllbnQvZG9tYWluL21vZGVsL1N0b25lJyk7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBzaXplXG4gICAqL1xuICB2YXIgQm9hcmQgPSBmdW5jdGlvbihzaXplKSB7XG4gICAgdmFyIHgsIHk7XG5cbiAgICBpZiAoTWF0aC5yb3VuZChzaXplKSAhPT0gc2l6ZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2l6ZSBtdXN0IGJlIGludGVnZXJcIik7XG4gICAgfVxuXG4gICAgaWYgKHNpemUgPCA1ICYmIHNpemUgPiAxOSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2l6ZSBtdXN0IGJlIGJldHdlZW4gNSBhbmQgMTlcIik7XG4gICAgfVxuXG4gICAgdGhpcy5fc2l6ZSA9IHNpemU7XG4gICAgdGhpcy5fY29vcmRpbmF0ZXMgPSBbXTtcbiAgICB0aGlzLl9sYXN0Q29vcmRpbmF0ZXMgPSBudWxsO1xuICAgIHRoaXMuX3NlY29uZExhc3RDb29yZGluYXRlcyA9IG51bGw7XG4gICAgZm9yICh4ID0gMDsgeCA8IHNpemU7IHgrKykge1xuICAgICAgdGhpcy5fY29vcmRpbmF0ZXNbeF0gPSBbXTtcbiAgICAgIGZvciAoeSA9IDA7IHkgPCBzaXplOyB5KyspIHtcbiAgICAgICAgdGhpcy5fY29vcmRpbmF0ZXNbeF1beV0gPSBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBCb2FyZC5wcm90b3R5cGUgPSB7fTtcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhCb2FyZC5wcm90b3R5cGUsIHtcbiAgICBzaXplOiB7XG4gICAgICBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5fc2l6ZTsgfSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gICAgfSxcbiAgfSk7XG5cbiAgQm9hcmQucHJvdG90eXBlLmdldFN0b25lID0gZnVuY3Rpb24oeCwgeSkge1xuICAgIHJldHVybiB0aGlzLl9jb29yZGluYXRlc1t4XVt5XTtcbiAgfTtcblxuICBCb2FyZC5wcm90b3R5cGUucHV0U3RvbmUgPSBmdW5jdGlvbih4LCB5LCBzdG9uZSkge1xuICAgIHZhciBjb29yZHM7XG5cbiAgICBpZiAoIXRoaXMuY2FuUHV0U3RvbmUoeCwgeSwgc3RvbmUpKSB7XG4gICAgICByZXR1cm4gLTE7XG4gICAgfVxuXG4gICAgdGhpcy5fcm90YXRlTGFzdENvb3JkaW5hdGVzKCk7XG4gICAgdGhpcy5fY29vcmRpbmF0ZXNbeF1beV0gPSBzdG9uZTtcblxuICAgIGNvb3JkcyA9IHRoaXMuX2NhcHR1cmUoeCwgeSwgc3RvbmUpO1xuICAgIHJldHVybiBjb29yZHMubGVuZ3RoO1xuICB9O1xuXG4gIEJvYXJkLnByb3RvdHlwZS5fcm90YXRlTGFzdENvb3JkaW5hdGVzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHgsIHk7XG5cbiAgICAvLyB0aGUgZmlyc3Qgc3RlcFxuICAgIGlmICh0aGlzLl9sYXN0Q29vcmRpbmF0ZXMgPT0gbnVsbCkge1xuICAgICAgdGhpcy5fbGFzdENvb3JkaW5hdGVzID0gW107XG5cbiAgICAgIGZvciAoeCA9IDA7IHggPCB0aGlzLnNpemU7IHgrKykge1xuICAgICAgICB0aGlzLl9sYXN0Q29vcmRpbmF0ZXNbeF0gPSBbXTtcbiAgICAgICAgZm9yICh5ID0gMDsgeSA8IHRoaXMuc2l6ZTsgeSsrKSB7XG4gICAgICAgICAgdGhpcy5fbGFzdENvb3JkaW5hdGVzW3hdW3ldID0gdGhpcy5fY29vcmRpbmF0ZXNbeF1beV07XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIHRoZSBzZWNvbmQgc3RlcFxuICAgIGlmICh0aGlzLl9zZWNvbmRMYXN0Q29vcmRpbmF0ZXMgPT0gbnVsbCkge1xuICAgICAgdGhpcy5fc2Vjb25kTGFzdENvb3JkaW5hdGVzID0gW107XG4gICAgICBmb3IgKHggPSAwOyB4IDwgdGhpcy5zaXplOyB4KyspIHtcbiAgICAgICAgdGhpcy5fc2Vjb25kTGFzdENvb3JkaW5hdGVzW3hdID0gW107XG4gICAgICAgIGZvciAoeSA9IDA7IHkgPCB0aGlzLnNpemU7IHkrKykge1xuICAgICAgICAgIHRoaXMuX3NlY29uZExhc3RDb29yZGluYXRlc1t4XVt5XSA9IHRoaXMuX2xhc3RDb29yZGluYXRlc1t4XVt5XTtcbiAgICAgICAgICB0aGlzLl9sYXN0Q29vcmRpbmF0ZXNbeF1beV0gPSB0aGlzLl9jb29yZGluYXRlc1t4XVt5XTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gdGhlIHNlY29uZCBzdGVwIG9yIGxhdGVyXG4gICAgZm9yICh4ID0gMDsgeCA8IHRoaXMuc2l6ZTsgeCsrKSB7XG4gICAgICBmb3IgKHkgPSAwOyB5IDwgdGhpcy5zaXplOyB5KyspIHtcbiAgICAgICAgdGhpcy5fc2Vjb25kTGFzdENvb3JkaW5hdGVzW3hdW3ldID0gdGhpcy5fbGFzdENvb3JkaW5hdGVzW3hdW3ldO1xuICAgICAgICB0aGlzLl9sYXN0Q29vcmRpbmF0ZXNbeF1beV0gPSB0aGlzLl9jb29yZGluYXRlc1t4XVt5XTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgQm9hcmQucHJvdG90eXBlLmNhblB1dFN0b25lID0gZnVuY3Rpb24oeCwgeSwgc3RvbmUpIHtcbiAgICBpZiAodGhpcy5pc091dGVyRmllbGQoeCwgeSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5pc0JhblBvaW50KHgsIHksIHN0b25lKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG4gIEJvYXJkLnByb3RvdHlwZS5pc091dGVyRmllbGQgPSBmdW5jdGlvbih4LCB5KSB7XG4gICAgcmV0dXJuIHggPCAwIHx8IHggPj0gdGhpcy5zaXplIHx8IHkgPCAwIHx8IHkgPj0gdGhpcy5zaXplO1xuICB9O1xuXG4gIEJvYXJkLnByb3RvdHlwZS5leGlzdHNTdG9uZSA9IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICByZXR1cm4gdGhpcy5fY29vcmRpbmF0ZXNbeF1beV0gIT0gbnVsbDtcbiAgfTtcblxuICBCb2FyZC5wcm90b3R5cGUuaXNCYW5Qb2ludCA9IGZ1bmN0aW9uKHgsIHksIHN0b25lKSB7XG4gICAgaWYgKHRoaXMuZXhpc3RzU3RvbmUoeCwgeSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5kcnlQdXRTdG9uZSh4LCB5LCBzdG9uZSkgPT09IC0xKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH07XG5cbiAgQm9hcmQucHJvdG90eXBlLmRyeVB1dFN0b25lID0gZnVuY3Rpb24oeCwgeSwgc3RvbmUpIHtcbiAgICB2YXIgY29vcmRzO1xuICAgIHZhciBkcnlCb2FyZCA9IHRoaXMuX2NvcHkoKTtcblxuICAgIGRyeUJvYXJkLl9yb3RhdGVMYXN0Q29vcmRpbmF0ZXMoKTtcbiAgICBkcnlCb2FyZC5fY29vcmRpbmF0ZXNbeF1beV0gPSBzdG9uZTtcblxuICAgIGNvb3JkcyA9IGRyeUJvYXJkLl9jYXB0dXJlKHgsIHksIHN0b25lKTtcbiAgICBpZiAoY29vcmRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgaWYoZHJ5Qm9hcmQuX2lzU3Vycm91bmRlZEJ5RW5lbXkoeCwgeSwgc3RvbmUpKSB7XG4gICAgICAgIHJldHVybiAtMTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZHJ5Qm9hcmQuX2lzUmVjYXB0dXJpbmdLb2ltbWVkaWF0ZWx5KCkpIHtcbiAgICAgIHJldHVybiAtMTtcbiAgICB9XG5cbiAgICByZXR1cm4gY29vcmRzLmxlbmd0aDtcbiAgfTtcblxuICBCb2FyZC5wcm90b3R5cGUuX2NvcHkgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZHJ5Qm9hcmQgPSBuZXcgQm9hcmQodGhpcy5zaXplKTtcbiAgICB2YXIgeGksIHlpO1xuICAgIHZhciBleGlzdHNMYXN0ID0gKHRoaXMuX2xhc3RDb29yZGluYXRlcyAhPSBudWxsKTtcbiAgICB2YXIgZXhpc3RzU2Vjb25kTGFzdCA9ICh0aGlzLl9zZWNvbmRMYXN0Q29vcmRpbmF0ZXMgIT0gbnVsbCk7XG5cbiAgICBpZiAoZXhpc3RzTGFzdCkge1xuICAgICAgZHJ5Qm9hcmQuX2xhc3RDb29yZGluYXRlcyA9IFtdO1xuICAgICAgZm9yICh4aSA9IDA7IHhpIDwgZHJ5Qm9hcmQuc2l6ZTsgeGkrKykge1xuICAgICAgICBkcnlCb2FyZC5fbGFzdENvb3JkaW5hdGVzW3hpXSA9IFtdO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChleGlzdHNTZWNvbmRMYXN0KSB7XG4gICAgICBkcnlCb2FyZC5fc2Vjb25kTGFzdENvb3JkaW5hdGVzID0gW107XG4gICAgICBmb3IgKHhpID0gMDsgeGkgPCBkcnlCb2FyZC5zaXplOyB4aSsrKSB7XG4gICAgICAgIGRyeUJvYXJkLl9zZWNvbmRMYXN0Q29vcmRpbmF0ZXNbeGldID0gW107XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yICh4aSA9IDA7IHhpIDwgZHJ5Qm9hcmQuc2l6ZTsgeGkrKykge1xuICAgICAgZm9yICh5aSA9IDA7IHlpIDwgZHJ5Qm9hcmQuc2l6ZTsgeWkrKykge1xuICAgICAgICBpZiAoZXhpc3RzU2Vjb25kTGFzdCkge1xuICAgICAgICAgIGRyeUJvYXJkLl9zZWNvbmRMYXN0Q29vcmRpbmF0ZXNbeGldW3lpXSA9IHRoaXMuX3NlY29uZExhc3RDb29yZGluYXRlc1t4aV1beWldO1xuICAgICAgICB9XG4gICAgICAgIGlmIChleGlzdHNMYXN0KSB7XG4gICAgICAgICAgZHJ5Qm9hcmQuX2xhc3RDb29yZGluYXRlc1t4aV1beWldID0gdGhpcy5fbGFzdENvb3JkaW5hdGVzW3hpXVt5aV07XG4gICAgICAgIH1cblxuICAgICAgICBkcnlCb2FyZC5fY29vcmRpbmF0ZXNbeGldW3lpXSA9IHRoaXMuX2Nvb3JkaW5hdGVzW3hpXVt5aV07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGRyeUJvYXJkO1xuICB9O1xuXG4gIEJvYXJkLnByb3RvdHlwZS5faXNSZWNhcHR1cmluZ0tvaW1tZWRpYXRlbHkgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgeCwgeTtcblxuICAgIGlmICh0aGlzLl9zZWNvbmRMYXN0Q29vcmRpbmF0ZXMgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGZvciAoeCA9IDA7IHggPCB0aGlzLnNpemU7IHgrKykge1xuICAgICAgZm9yICh5ID0gMDsgeSA8IHRoaXMuc2l6ZTsgeSsrKSB7XG4gICAgICAgIGlmICh0aGlzLl9jb29yZGluYXRlc1t4XVt5XSAhPT0gdGhpcy5fc2Vjb25kTGFzdENvb3JkaW5hdGVzW3hdW3ldKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG5cbiAgQm9hcmQucHJvdG90eXBlLl9jYXB0dXJlID0gZnVuY3Rpb24oeCwgeSwgbXlTdG9uZSkge1xuICAgIHZhciBzdG9uZTtcbiAgICB2YXIgc2VhcmNoZWQgPSBbXTtcbiAgICB2YXIgeGksIHlpO1xuICAgIHZhciBjb29yZHMgPSBbXSxcbiAgICAgIGNvb3JkczEgPSBbXSxcbiAgICAgIGNvb3JkczIgPSBbXSxcbiAgICAgIGNvb3JkczMgPSBbXSxcbiAgICAgIGNvb3JkczQgPSBbXTtcbiAgICB2YXIgY29vcmQ7XG4gICAgdmFyIGk7XG5cbiAgICBpZiAobXlTdG9uZS5lcXVhbHMoU3RvbmUuQmxhY2spKSB7XG4gICAgICBzdG9uZSA9IFN0b25lLldoaXRlO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdG9uZSA9IFN0b25lLkJsYWNrO1xuICAgIH1cblxuICAgIGZvciAoeGkgPSAwOyB4aSA8IHRoaXMuc2l6ZTsgeGkrKykge1xuICAgICAgc2VhcmNoZWRbeGldID0gW107XG4gICAgICBmb3IgKHlpID0gMDsgeWkgPCB0aGlzLnNpemU7IHlpKyspIHtcbiAgICAgICAgc2VhcmNoZWRbeGldW3lpXSA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghdGhpcy5zZWFyY2hTcGFjZSh0aGlzLl9jb3JyZWN0Q29vcmRpbmF0ZSh4IC0gMSksIHksIHN0b25lLCBzZWFyY2hlZCwgY29vcmRzMSkpIHtcbiAgICAgIGNvb3JkcyA9IGNvb3JkczEuY29uY2F0KCk7XG4gICAgfVxuICAgIGlmICghdGhpcy5zZWFyY2hTcGFjZSh4LCB0aGlzLl9jb3JyZWN0Q29vcmRpbmF0ZSh5IC0gMSksIHN0b25lLCBzZWFyY2hlZCwgY29vcmRzMikpIHtcbiAgICAgIGNvb3JkcyA9IGNvb3Jkcy5jb25jYXQoY29vcmRzMik7XG4gICAgfVxuICAgIGlmICghdGhpcy5zZWFyY2hTcGFjZSh0aGlzLl9jb3JyZWN0Q29vcmRpbmF0ZSh4ICsgMSksIHksIHN0b25lLCBzZWFyY2hlZCwgY29vcmRzMykpIHtcbiAgICAgIGNvb3JkcyA9IGNvb3Jkcy5jb25jYXQoY29vcmRzMyk7XG4gICAgfVxuICAgIGlmICghdGhpcy5zZWFyY2hTcGFjZSh4LCB0aGlzLl9jb3JyZWN0Q29vcmRpbmF0ZSh5ICsgMSksIHN0b25lLCBzZWFyY2hlZCwgY29vcmRzNCkpIHtcbiAgICAgIGNvb3JkcyA9IGNvb3Jkcy5jb25jYXQoY29vcmRzNCk7XG4gICAgfVxuXG4gICAgZm9yIChpID0gMDsgaSA8IGNvb3Jkcy5sZW5ndGg7IGkrKykge1xuICAgICAgY29vcmQgPSBjb29yZHNbaV07XG4gICAgICB0aGlzLl9jb29yZGluYXRlc1tjb29yZC54XVtjb29yZC55XSA9IG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvb3JkcztcbiAgfTtcblxuICBCb2FyZC5wcm90b3R5cGUuc2VhcmNoU3BhY2UgPSBmdW5jdGlvbih4eCwgeXksIG15U3RvbmUsIHNlYXJjaGVkLCBjb29yZHMpIHtcbiAgICBpZiAoc2VhcmNoZWRbeHhdW3l5XSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9jb29yZGluYXRlc1t4eF1beXldID09IG51bGwpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHNlYXJjaGVkW3h4XVt5eV0gPSB0cnVlO1xuXG4gICAgaWYgKHRoaXMuX2Nvb3JkaW5hdGVzW3h4XVt5eV0uZXF1YWxzKG15U3RvbmUpKSB7XG4gICAgICBjb29yZHMucHVzaCh7eDogeHgsIHk6IHl5fSk7XG4gICAgICBpZiAodGhpcy5zZWFyY2hTcGFjZSh0aGlzLl9jb3JyZWN0Q29vcmRpbmF0ZSh4eCAtIDEpLCB5eSwgbXlTdG9uZSwgc2VhcmNoZWQsIGNvb3JkcykpIHJldHVybiB0cnVlO1xuICAgICAgaWYgKHRoaXMuc2VhcmNoU3BhY2UoeHgsIHRoaXMuX2NvcnJlY3RDb29yZGluYXRlKHl5IC0gMSksIG15U3RvbmUsIHNlYXJjaGVkLCBjb29yZHMpKSByZXR1cm4gdHJ1ZTtcbiAgICAgIGlmICh0aGlzLnNlYXJjaFNwYWNlKHRoaXMuX2NvcnJlY3RDb29yZGluYXRlKHh4ICsgMSksIHl5LCBteVN0b25lLCBzZWFyY2hlZCwgY29vcmRzKSkgcmV0dXJuIHRydWU7XG4gICAgICBpZiAodGhpcy5zZWFyY2hTcGFjZSh4eCwgdGhpcy5fY29ycmVjdENvb3JkaW5hdGUoeXkgKyAxKSwgbXlTdG9uZSwgc2VhcmNoZWQsIGNvb3JkcykpIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfTtcblxuICBCb2FyZC5wcm90b3R5cGUuX2lzU3Vycm91bmRlZEJ5RW5lbXkgPSBmdW5jdGlvbih4LCB5LCBteVN0b25lKSB7XG4gICAgdmFyIHNlYXJjaGVkID0gW107XG4gICAgdmFyIHhpLCB5aTtcbiAgICB2YXIgY29vcmRzID0gW107XG5cbiAgICBmb3IgKHhpID0gMDsgeGkgPCB0aGlzLnNpemU7IHhpKyspIHtcbiAgICAgIHNlYXJjaGVkW3hpXSA9IFtdO1xuICAgICAgZm9yICh5aSA9IDA7IHlpIDwgdGhpcy5zaXplOyB5aSsrKSB7XG4gICAgICAgIHNlYXJjaGVkW3hpXVt5aV0gPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gIXRoaXMuc2VhcmNoU3BhY2UoeCwgeSwgbXlTdG9uZSwgc2VhcmNoZWQsIGNvb3Jkcyk7XG4gIH07XG5cbiAgQm9hcmQucHJvdG90eXBlLl9jb3JyZWN0Q29vcmRpbmF0ZSA9IGZ1bmN0aW9uKG4pIHtcbiAgICB3aGlsZSAobiA8IDApIHtcbiAgICAgIG4gPSBuICsgdGhpcy5zaXplO1xuICAgIH1cblxuICAgIGlmIChuID49IHRoaXMuc2l6ZSkge1xuICAgICAgbiA9IG4gJSB0aGlzLnNpemU7XG4gICAgfVxuXG4gICAgcmV0dXJuIG47XG4gIH07XG5cbiAgQm9hcmQucHJvdG90eXBlLmdldFN0YXRlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgcmV0dXJuIEJvYXJkO1xufSk7XG5cblxuZGVmaW5lKCdhcHAvY2xpZW50L2RvbWFpbi9tb2RlbC9HYW1lJyxbJ3JlcXVpcmUnLCdhcHAvY2xpZW50L2RvbWFpbi9tb2RlbC9Cb2FyZCcsJ2FwcC9jbGllbnQvZG9tYWluL21vZGVsL1N0b25lJ10sZnVuY3Rpb24ocmVxdWlyZSkge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICB2YXIgQm9hcmQgPSByZXF1aXJlKCdhcHAvY2xpZW50L2RvbWFpbi9tb2RlbC9Cb2FyZCcpO1xuICB2YXIgU3RvbmUgPSByZXF1aXJlKCdhcHAvY2xpZW50L2RvbWFpbi9tb2RlbC9TdG9uZScpO1xuXG4gIC8qKlxuICAgKiBAcGFyYW0ge0dhbWVJZH0gaWRcbiAgICogQHBhcmFtIHtHYW1lQ29uZGl0aW9ufSBjb25kaXRpb25cbiAgICovXG4gIHZhciBHYW1lID0gZnVuY3Rpb24oaWQsIGNvbmRpdGlvbikge1xuICAgIHRoaXMuX2lkID0gaWQ7XG4gICAgdGhpcy5fY29uZGl0aW9uID0gY29uZGl0aW9uO1xuICAgIHRoaXMuX2JvYXJkID0gbmV3IEJvYXJkKGNvbmRpdGlvbi5ib2FyZFNpemUpO1xuICAgIHRoaXMuX3BoYXNlID0gU3RvbmUuQmxhY2s7XG4gIH07XG5cbiAgR2FtZS5wcm90b3R5cGUgPSB7fTtcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhHYW1lLnByb3RvdHlwZSwge1xuICAgIGlkOiB7XG4gICAgICBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5faWQ7ICB9LFxuICAgIH0sXG5cbiAgICBwaGFzZToge1xuICAgICAgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuX3BoYXNlOyAgfSxcbiAgICB9LFxuICB9KTtcblxuICBHYW1lLnByb3RvdHlwZS5wdXROZXh0U3RvbmUgPSBmdW5jdGlvbih4LCB5KSB7XG4gICAgaWYgKHRoaXMuX2JvYXJkLnB1dFN0b25lKHgsIHksIHRoaXMucGhhc2UpID09PSAtMSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHRoaXMuX3N3aXRjaFBoYXNlKCk7XG4gICAgcmV0dXJuIHRydWVcbiAgfTtcblxuICBHYW1lLnByb3RvdHlwZS5wYXNzID0gZnVuY3Rpb24oeCwgeSkge1xuICAgIHRoaXMuX3N3aXRjaFBoYXNlKCk7XG4gIH07XG5cbiAgR2FtZS5wcm90b3R5cGUuX3N3aXRjaFBoYXNlID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuX3BoYXNlLmVxdWFscyhTdG9uZS5CbGFjaykpIHtcbiAgICAgIHRoaXMuX3BoYXNlID0gU3RvbmUuV2hpdGU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3BoYXNlID0gU3RvbmUuQmxhY2s7XG4gICAgfVxuICB9O1xuXG4gIEdhbWUucHJvdG90eXBlLmdldFN0YXRlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHBoYXNlOiB0aGlzLnBoYXNlLFxuICAgICAgYm9hcmQ6IHRoaXMuX2JvYXJkLmdldFN0YXRlKCksXG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBHYW1lO1xufSk7XG5cblxuZGVmaW5lKCdhcHAvY2xpZW50L2RvbWFpbi9tb2RlbC9HYW1lSWQnLFsncmVxdWlyZSddLGZ1bmN0aW9uKHJlcXVpcmUpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBpZFxuICAgKi9cbiAgdmFyIEdhbWVJZCA9IGZ1bmN0aW9uKGlkKSB7XG4gICAgdGhpcy5faWQgPSBpZDtcbiAgfTtcblxuICBHYW1lSWQucHJvdG90eXBlID0ge307XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoR2FtZUlkLnByb3RvdHlwZSwge1xuICAgIGlkOiB7XG4gICAgICBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5faWQ7ICB9LFxuICAgICAgY29uZmlndXJhYmxlOiBmYWxzZSxcbiAgICB9LFxuICB9KTtcblxuICBHYW1lSWQucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uKG8pIHtcbiAgICBpZiAoIShvIGluc3RhbmNlb2YgR2FtZUlkKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmlkID09PSBvLmlkO1xuICB9XG5cbiAgcmV0dXJuIEdhbWVJZDtcbn0pO1xuXG5cbmRlZmluZSgnYXBwL2NsaWVudC9kb21haW4vbW9kZWwvR2FtZUNvbmRpdGlvbicsWydyZXF1aXJlJ10sZnVuY3Rpb24ocmVxdWlyZSkge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICB2YXIgR2FtZUNvbmRpdGlvbiA9IGZ1bmN0aW9uKGNvbmRpdGlvbikge1xuICAgIHRoaXMuX2JvYXJkU2l6ZSA9IGNvbmRpdGlvbi5ib2FyZFNpemU7XG4gIH07XG5cbiAgR2FtZUNvbmRpdGlvbi5wcm90b3R5cGUgPSB7fTtcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhHYW1lQ29uZGl0aW9uLnByb3RvdHlwZSwge1xuICAgIGJvYXJkU2l6ZToge1xuICAgICAgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuX2JvYXJkU2l6ZTsgfSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gICAgfSxcbiAgfSk7XG5cbiAgR2FtZUNvbmRpdGlvbi5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24obykge1xuICAgIGlmICghKG8gaW5zdGFuY2VvZiBHYW1lQ29uZGl0aW9uKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmJvYXJkU2l6ZSA9PT0gby5ib2FyZFNpemU7XG4gIH1cblxuICByZXR1cm4gR2FtZUNvbmRpdGlvbjtcbn0pO1xuXG5cbmRlZmluZSgnYXBwL2NsaWVudC9pbmZyYS9HYW1lUmVwb3NpdG9yeScsWydyZXF1aXJlJ10sZnVuY3Rpb24ocmVxdWlyZSkge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICB2YXIgR2FtZVJlcG9zaXRvcnkgPSB7fTtcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhHYW1lUmVwb3NpdG9yeSwge1xuICAgIGN1cnJlbnRHYW1lOiB7XG4gICAgICBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5fY3VycmVudEdhbWU7IH0sXG4gICAgICBzZXQ6IGZ1bmN0aW9uKHZhbHVlKSB7IHRoaXMuX2N1cnJlbnRHYW1lID0gdmFsdWU7IH1cbiAgICB9LFxuICB9KTtcblxuICB2YXIgaWQgPSAwO1xuICBHYW1lUmVwb3NpdG9yeS5uZXh0R2FtZUlkID0gZnVuY3Rpb24oKSB7XG4gICAgaWQrKztcbiAgICByZXR1cm4gXCJcIiArIGlkO1xuICB9O1xuXG4gIHJldHVybiBHYW1lUmVwb3NpdG9yeTtcbn0pO1xuXG5cbmRlZmluZSgnYXBwL2NsaWVudC9hcHAvc2VydmljZS9HYW1lU2VydmljZScsWydyZXF1aXJlJywnYXBwL2NsaWVudC9kb21haW4vbW9kZWwvR2FtZScsJ2FwcC9jbGllbnQvZG9tYWluL21vZGVsL0dhbWVJZCcsJ2FwcC9jbGllbnQvZG9tYWluL21vZGVsL0dhbWVDb25kaXRpb24nLCdhcHAvY2xpZW50L2luZnJhL0dhbWVSZXBvc2l0b3J5J10sZnVuY3Rpb24ocmVxdWlyZSkge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICB2YXIgR2FtZSA9IHJlcXVpcmUoJ2FwcC9jbGllbnQvZG9tYWluL21vZGVsL0dhbWUnKTtcbiAgdmFyIEdhbWVJZCA9IHJlcXVpcmUoJ2FwcC9jbGllbnQvZG9tYWluL21vZGVsL0dhbWVJZCcpO1xuICB2YXIgR2FtZUNvbmRpdGlvbiA9IHJlcXVpcmUoJ2FwcC9jbGllbnQvZG9tYWluL21vZGVsL0dhbWVDb25kaXRpb24nKTsgXG5cbiAgdmFyIEdhbWVTZXJ2aWNlID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gVE9ETzog44GT44GT44Gv44OV44Kh44Kv44OI44Oq44Oh44K944OD44OJ44KS55So5oSP44GX44Gm44CB5beu44GX5pu/44GI44KJ44KM44KL44KI44GG44Gr44GZ44KLXG4gICAgdGhpcy5fZ2FtZVJlcG9zaXRvcnkgPSByZXF1aXJlKCdhcHAvY2xpZW50L2luZnJhL0dhbWVSZXBvc2l0b3J5Jyk7XG4gIH07XG5cbiAgR2FtZVNlcnZpY2UucHJvdG90eXBlID0ge307XG5cbiAgR2FtZVNlcnZpY2UucHJvdG90eXBlLm5ld0dhbWUgPSBmdW5jdGlvbihjb25kaXRpb24pIHtcbiAgICB2YXIgbmV3R2FtZUlkID0gdGhpcy5fZ2FtZVJlcG9zaXRvcnkubmV4dEdhbWVJZCgpO1xuICAgIHZhciBnYW1lQ29uZGl0aW9uID0gbmV3IEdhbWVDb25kaXRpb24oe1xuICAgICAgYm9hcmRTaXplOiBjb25kaXRpb24uYm9hcmQuc2l6ZSxcbiAgICB9KTtcbiAgICB2YXIgZ2FtZSA9IG5ldyBHYW1lKG5ld0dhbWVJZCwgZ2FtZUNvbmRpdGlvbik7XG4gICAgdGhpcy5fZ2FtZVJlcG9zaXRvcnkuY3VycmVudEdhbWUgPSBnYW1lO1xuXG4gICAgcmV0dXJuIGdhbWUuZ2V0U3RhdGUoKTtcbiAgfTtcblxuICAvKipcbiAgICogQHBhcmFtIHtTdHJpbmd9IGlkXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB4XG4gICAqIEBwYXJhbSB7TnVtYmVyfSB5XG4gICAqL1xuICBHYW1lU2VydmljZS5wcm90b3R5cGUucHV0TmV4dFN0b25lID0gZnVuY3Rpb24oeCwgeSkge1xuICAgIHZhciBnYW1lID0gdGhpcy5fZ2FtZVJlcG9zaXRvcnkuY3VycmVudEdhbWU7XG4gICAgaWYgKCFnYW1lLnB1dE5leHRTdG9uZSh4LCB5KSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIGdhbWUuZ2V0U3RhdGUoKTtcbiAgfTtcblxuICAvKipcbiAgICogQHBhcmFtIHtTdHJpbmd9IGlkXG4gICAqL1xuICBHYW1lU2VydmljZS5wcm90b3R5cGUucGFzcyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBnYW1lID0gdGhpcy5fZ2FtZVJlcG9zaXRvcnkuY3VycmVudEdhbWVcbiAgICBnYW1lLnBhc3MoKTtcblxuICAgIHJldHVybiBnYW1lLmdldFN0YXRlKCk7XG4gIH07XG5cbiAgcmV0dXJuIEdhbWVTZXJ2aWNlO1xufSk7XG5cblxuZGVmaW5lKCdhcHAvY2xpZW50L21lZGlhdG9yL0dhbWVNZWRpYXRvci5qcycsWydyZXF1aXJlJywnYXBwL2NsaWVudC9hcHAvc2VydmljZS9HYW1lU2VydmljZScsJ2xpYi9ldmVudGVtaXR0ZXIyJ10sZnVuY3Rpb24ocmVxdWlyZSkge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICB2YXIgR2FtZVNlcnZpY2UgPSByZXF1aXJlKCdhcHAvY2xpZW50L2FwcC9zZXJ2aWNlL0dhbWVTZXJ2aWNlJyk7XG4gIHZhciBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdsaWIvZXZlbnRlbWl0dGVyMicpO1xuXG4gIHZhciBHYW1lTWVkaWF0b3IgPSBmdW5jdGlvbigpIHtcbiAgICBFdmVudEVtaXR0ZXIuY2FsbCh0aGlzKTtcblxuICAgIC8vIFRPRE86IOODleOCoeOCr+ODiOODquODoeOCveODg+ODieOCkuS9v+OBhuOCiOOBhuOBq+OBmeOCi1xuICAgIHRoaXMuX2dhbWVTZXJ2aWNlID0gbmV3IEdhbWVTZXJ2aWNlKCk7XG4gIH07XG5cbiAgR2FtZU1lZGlhdG9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRXZlbnRFbWl0dGVyLnByb3RvdHlwZSk7XG5cbiAgR2FtZU1lZGlhdG9yLnByb3RvdHlwZS5zdGFydEdhbWU9IGZ1bmN0aW9uKGNvbmRpdGlvbikge1xuICAgIHZhciBnYW1lU3RhdGUgPSB0aGlzLl9nYW1lU2VydmljZS5uZXdHYW1lKGNvbmRpdGlvbik7XG5cbiAgICB0aGlzLmVtaXQoJ3JlZnJlc2hBbGwnLCBnYW1lU3RhdGUpO1xuICB9O1xuXG4gIEdhbWVNZWRpYXRvci5wcm90b3R5cGUucHV0U3RvbmUgPSBmdW5jdGlvbih4LCB5KSB7XG4gICAgdmFyIGdhbWVTdGF0ZSA9IHRoaXMuX2dhbWVTZXJ2aWNlLnB1dE5leHRTdG9uZSh4LCB5KTtcbiAgICBpZiAoZ2FtZVN0YXRlICE9IG51bGwpIHtcbiAgICAgIHRoaXMuZW1pdCgncmVmcmVzaEFsbCcsIGdhbWVTdGF0ZSk7XG4gICAgfVxuICB9O1xuXG4gIEdhbWVNZWRpYXRvci5wcm90b3R5cGUubW91c2VVcExlZnRPbkJvYXJkID0gZnVuY3Rpb24oZGF0YSkge1xuXG4gIH07XG5cbiAgR2FtZU1lZGlhdG9yLnByb3RvdHlwZS5wYXNzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGdhbWVTdGF0ZSA9IHRoaXMuX2dhbWVTZXJ2aWNlLnBhc3MoKTtcbiAgfTtcblxuICByZXR1cm4gR2FtZU1lZGlhdG9yO1xufSk7XG5cblxuZGVmaW5lKCdhcHAvY2xpZW50L3ZpZXcvQm9hcmRWaWV3JyxbJ3JlcXVpcmUnLCdhcHAvY2xpZW50L2RvbWFpbi9tb2RlbC9TdG9uZScsJ2FwcC9jbGllbnQvbWVkaWF0b3IvR2FtZU1lZGlhdG9yLmpzJ10sZnVuY3Rpb24ocmVxdWlyZSkge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICAvLyBDb25zdGFudHNcbiAgdmFyIE1vdXNlQnV0dG9uID0ge1xuICAgIExlZnQ6IDEsXG4gICAgTWlkZGxlOiAyLFxuICAgIFJpZ2h0OiAzLFxuICB9O1xuICB2YXIgU3RvbmUgPSByZXF1aXJlKCdhcHAvY2xpZW50L2RvbWFpbi9tb2RlbC9TdG9uZScpO1xuXG4gIC8vIE1lZGlhdG9yXG4gIHZhciBHYW1lTWVkaWF0b3IgPSByZXF1aXJlKCdhcHAvY2xpZW50L21lZGlhdG9yL0dhbWVNZWRpYXRvci5qcycpO1xuXG4gIHZhciBCb2FyZFZpZXcgPSBmdW5jdGlvbihtZWRpYXRvciwgc2l6ZSkge1xuICAgIHRoaXMuX21lZGlhdG9yID0gbWVkaWF0b3I7XG4gICAgdGhpcy5fY2FjaGVkR2FtZVN0YXRlID0gbnVsbDtcblxuICAgIHRoaXMuX3NpemUgPSBzaXplO1xuICAgIHRoaXMuX2RlZmF1bHRDZW50ZXIgPSB7XG4gICAgICB4OiBNYXRoLmZsb29yKHNpemUgLyAyKSxcbiAgICAgIHk6IE1hdGguZmxvb3Ioc2l6ZSAvIDIpLFxuICAgIH07XG5cbiAgICB0aGlzLl9jZW50ZXIgPSB7XG4gICAgICB4OiB0aGlzLl9kZWZhdWx0Q2VudGVyLngsXG4gICAgICB5OiB0aGlzLl9kZWZhdWx0Q2VudGVyLnksXG4gICAgfTtcblxuICAgIHRoaXMuX2luaXQoKTtcbiAgfTtcblxuICBCb2FyZFZpZXcucHJvdG90eXBlLl9pbml0ID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fJGNhbnZhcyA9ICQoJyNib2FyZCcpO1xuICAgIHRoaXMuX2NhbnZhcyA9ICQoJyNib2FyZCcpWzBdO1xuICAgIHRoaXMuXyRiYWNrQ2FudmFzID0gJCgnI2JhY2stYm9hcmQnKTtcbiAgICB0aGlzLl9iYWNrQ2FudmFzID0gJCgnI2JhY2stYm9hcmQnKVswXTtcbiAgICB0aGlzLl9jdHggPSB0aGlzLl9jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICB0aGlzLl9iYWNrQ3R4ID0gdGhpcy5fYmFja0NhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgIHRoaXMuX2Jhc2VDYW52YXNTaXplID0geyB4OiA3NDgsIHk6IDc0OCB9O1xuICAgIHRoaXMuX2hlaWdodCA9IHRoaXMuX2NhbnZhcy53aWR0aDtcbiAgICB0aGlzLl93aWR0aCA9IHRoaXMuX2NhbnZhcy5oZWlnaHQ7XG5cbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgdGhpcy5fbWVkaWF0b3Iub24oJ3JlZnJlc2hBbGwnLCBmdW5jdGlvbihnYW1lU3RhdGUpIHtcbiAgICAgIHRoYXQuX2NhY2hlZEdhbWVTdGF0ZSA9IGdhbWVTdGF0ZTtcbiAgICAgIHRoYXQuX3JlZnJlc2hBbGwoZ2FtZVN0YXRlKTtcbiAgICB9KTtcblxuICAgIChmdW5jdGlvbigpIHtcbiAgICAgIHZhciB1bml0ID0gNDQ7XG4gICAgICB2YXIgbW91c2VEb3duT3JpZ2luYWxPZmZzZXQgPSBudWxsO1xuICAgICAgdmFyIGdyYWJDZW50ZXIgPSBudWxsO1xuXG4gICAgICB2YXIgcHJldmlvdXNNb3VzZU1vdmUgPSBEYXRlLm5vdygpO1xuICAgICAgdGhhdC5fJGNhbnZhcy5tb3VzZW1vdmUoZnVuY3Rpb24oZSkge1xuICAgICAgICBpZiAoRGF0ZS5ub3coKSAtIHByZXZpb3VzTW91c2VNb3ZlID4gNTApIHtcbiAgICAgICAgICBpZiAodGhhdC5fJGNhbnZhcy5oYXNDbGFzcygnZ3JhYmJpbmcnKSkge1xuICAgICAgICAgICAgbW92ZUNlbnRlci5jYWxsKHRoYXQsIGUub2Zmc2V0WCwgZS5vZmZzZXRZKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaG92ZXJPbkJvYXJkLmNhbGwodGhhdCwgZS5vZmZzZXRYLCBlLm9mZnNldFkpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHByZXZpb3VzTW91c2VNb3ZlID0gRGF0ZS5ub3coKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHZhciBtb3ZlQ2VudGVyID0gZnVuY3Rpb24ob2Zmc2V0WCwgb2Zmc2V0WSkge1xuICAgICAgICB2YXIgdW5pdCA9IDQ0O1xuICAgICAgICB2YXIgZHggPSBNYXRoLmZsb29yKG9mZnNldFggLyB0aGlzLl9jYW52YXNSYXRpbykgLSBtb3VzZURvd25PcmlnaW5hbE9mZnNldC54O1xuICAgICAgICB2YXIgZHkgPSBNYXRoLmZsb29yKG9mZnNldFkgLyB0aGlzLl9jYW52YXNSYXRpbykgLSBtb3VzZURvd25PcmlnaW5hbE9mZnNldC55O1xuICAgICAgICBpZiAoZHggPCAwKSB7XG4gICAgICAgICAgZHggPSBNYXRoLmNlaWwoZHggLyB1bml0KTtcbiAgICAgICAgfSBlbHNlIGlmIChkeCA+IDApIHtcbiAgICAgICAgICBkeCA9IE1hdGguZmxvb3IoZHggLyB1bml0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkeCA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZHkgPCAwKSB7XG4gICAgICAgICAgZHkgPSBNYXRoLmNlaWwoZHkgLyB1bml0KTtcbiAgICAgICAgfSBlbHNlIGlmIChkeSA+IDApIHtcbiAgICAgICAgICBkeSA9IE1hdGguZmxvb3IoZHkgLyB1bml0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkeSA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9jZW50ZXIueCA9ICh0aGlzLl9zaXplICsgZ3JhYkNlbnRlci54IC0gZHgpICUgdGhpcy5fc2l6ZTtcbiAgICAgICAgdGhpcy5fY2VudGVyLnkgPSAodGhpcy5fc2l6ZSArIGdyYWJDZW50ZXIueSAtIGR5KSAlIHRoaXMuX3NpemU7XG5cbiAgICAgICAgdGhpcy5fcmVmcmVzaEFsbCh0aGlzLl9jYWNoZWRHYW1lU3RhdGUpO1xuICAgICAgfTtcblxuICAgICAgdmFyIGhvdmVyT25Cb2FyZCA9IGZ1bmN0aW9uKG9mZnNldFgsIG9mZnNldFkpIHtcbiAgICAgICAgdmFyIGxvY2FsUG9zID0gdGhhdC5fY2FsY3VsYXRlTG9jYWxQb3NpdGlvbihvZmZzZXRYLCBvZmZzZXRZKTtcbiAgICAgICAgdmFyIGNncyA9IHRoYXQuX2NhY2hlZEdhbWVTdGF0ZTtcbiAgICAgICAgaWYgKGNncy5ib2FyZC5leGlzdHNTdG9uZShsb2NhbFBvcy54LCBsb2NhbFBvcy55KSkge1xuICAgICAgICAgIHRoYXQuXyRjYW52YXMucmVtb3ZlQ2xhc3MoJ2dyYWJiaW5nJyk7XG4gICAgICAgICAgdGhhdC5fJGNhbnZhcy5hZGRDbGFzcygnZ3JhYmJhYmxlJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhhdC5fJGNhbnZhcy5yZW1vdmVDbGFzcygnZ3JhYmJhYmxlJyk7XG4gICAgICAgICAgdGhhdC5fJGNhbnZhcy5yZW1vdmVDbGFzcygnZ3JhYmJpbmcnKTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgdGhhdC5fJGNhbnZhcy5tb3VzZWRvd24oZnVuY3Rpb24oZSkge1xuICAgICAgICBpZiAoZS53aGljaCAhPT0gTW91c2VCdXR0b24uTGVmdCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIG1vdXNlRG93bk9yaWdpbmFsT2Zmc2V0ID0ge1xuICAgICAgICAgIHg6IE1hdGguZmxvb3IoZS5vZmZzZXRYIC8gdGhhdC5fY2FudmFzUmF0aW8pLFxuICAgICAgICAgIHk6IE1hdGguZmxvb3IoZS5vZmZzZXRZIC8gdGhhdC5fY2FudmFzUmF0aW8pLFxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGxvY2FsUG9zID0gdGhhdC5fY2FsY3VsYXRlTG9jYWxQb3NpdGlvbihlLm9mZnNldFgsIGUub2Zmc2V0WSk7XG4gICAgICAgIHZhciBjZ3MgPSB0aGF0Ll9jYWNoZWRHYW1lU3RhdGU7XG4gICAgICAgIGlmIChjZ3MuYm9hcmQuZXhpc3RzU3RvbmUobG9jYWxQb3MueCwgbG9jYWxQb3MueSkpIHtcbiAgICAgICAgICBncmFiQm9hcmQuY2FsbCh0aGF0KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHRoYXQuXyRjYW52YXMubW91c2V1cChmdW5jdGlvbihlKSB7XG4gICAgICAgIGlmIChlLndoaWNoICE9PSBNb3VzZUJ1dHRvbi5MZWZ0KSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgICBpZiAoZ3JhYkNhbmNlbC5jYWxsKHRoYXQpKSB7XG4gICAgICAgICAgbW91c2VEb3duT3JpZ2luYWxPZmZzZXQgPSBudWxsO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBvZmZzZXQgPSB7XG4gICAgICAgICAgeDogTWF0aC5mbG9vcihlLm9mZnNldFggLyB0aGF0Ll9jYW52YXNSYXRpbyksXG4gICAgICAgICAgeTogTWF0aC5mbG9vcihlLm9mZnNldFkgLyB0aGF0Ll9jYW52YXNSYXRpbyksXG4gICAgICAgIH07XG4gICAgICAgIGlmICghaXNTdHJpY3RTYW1lUG9zLmNhbGwodGhhdCwgb2Zmc2V0LCBtb3VzZURvd25PcmlnaW5hbE9mZnNldCkpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgbG9jYWxQb3MgPSB0aGF0Ll9jYWxjdWxhdGVMb2NhbFBvc2l0aW9uKGUub2Zmc2V0WCwgZS5vZmZzZXRZKTtcbiAgICAgICAgdmFyIGNncyA9IHRoYXQuX2NhY2hlZEdhbWVTdGF0ZTtcblxuICAgICAgICB0aGF0Ll9tZWRpYXRvci5wdXRTdG9uZShsb2NhbFBvcy54LCBsb2NhbFBvcy55KTtcblxuICAgICAgICBtb3VzZURvd25PcmlnaW5hbE9mZnNldCA9IG51bGw7XG4gICAgICB9KTtcblxuICAgICAgJChkb2N1bWVudCkubW91c2V1cChmdW5jdGlvbihlKSB7XG4gICAgICAgIGlmIChlLndoaWNoICE9PSBNb3VzZUJ1dHRvbi5MZWZ0KSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgZ3JhYkNhbmNlbC5jYWxsKHRoYXQpO1xuICAgICAgfSk7XG5cbiAgICAgIHZhciBncmFiQ2FuY2VsID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLl8kY2FudmFzLmhhc0NsYXNzKCdncmFiYmluZycpKSB7XG4gICAgICAgICAgdGhpcy5fJGNhbnZhcy5yZW1vdmVDbGFzcygnZ3JhYmJpbmcnKTtcbiAgICAgICAgICBtb3VzZURvd25PcmlnaW5hbE9mZnNldCA9IG51bGw7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICB2YXIgaXNTdHJpY3RTYW1lUG9zID0gZnVuY3Rpb24ocG9zMSwgcG9zMikge1xuICAgICAgICB2YXIgdW5pdCA9IDQ0O1xuICAgICAgICB2YXIgaGFsZlVuaXQgPSB1bml0IC8gMjtcbiAgICAgICAgdmFyIHgxID0gTWF0aC5yb3VuZCgocG9zMS54IC0gaGFsZlVuaXQpIC8gdW5pdCk7XG4gICAgICAgIHZhciB5MSA9IE1hdGgucm91bmQoKHBvczEueSAtIGhhbGZVbml0KSAvIHVuaXQpO1xuICAgICAgICB2YXIgeDIgPSBNYXRoLnJvdW5kKChwb3MyLnggLSBoYWxmVW5pdCkgLyB1bml0KTtcbiAgICAgICAgdmFyIHkyID0gTWF0aC5yb3VuZCgocG9zMi55IC0gaGFsZlVuaXQpIC8gdW5pdCk7XG5cbiAgICAgICAgcmV0dXJuIHgxID09PSB4MiAmJiB5MSA9PT0geTI7XG4gICAgICB9O1xuXG4gICAgICB2YXIgZ3JhYkJvYXJkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuXyRjYW52YXMucmVtb3ZlQ2xhc3MoJ2dyYWJiYWJsZScpO1xuICAgICAgICB0aGlzLl8kY2FudmFzLmFkZENsYXNzKCdncmFiYmluZycpO1xuICAgICAgICBncmFiQ2VudGVyID0ge1xuICAgICAgICAgIHg6IHRoaXMuX2NlbnRlci54LFxuICAgICAgICAgIHk6IHRoaXMuX2NlbnRlci55LFxuICAgICAgICB9O1xuICAgICAgfTtcblxuICAgIH0pKCk7XG5cbiAgICAkKHdpbmRvdykucmVzaXplKGZ1bmN0aW9uKGUpIHtcbiAgICAgIHZhciByZWN0ID0gdGhhdC5fY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgdGhhdC5fY2FudmFzUmF0aW8gPSByZWN0LndpZHRoIC8gdGhhdC5fYmFzZUNhbnZhc1NpemUueDtcbiAgICB9KS50cmlnZ2VyKCdyZXNpemUnKTtcbiAgfTtcblxuICBCb2FyZFZpZXcucHJvdG90eXBlLl9jYWxjdWxhdGVMb2NhbFBvc2l0aW9uID0gZnVuY3Rpb24oY3gsIGN5KSB7XG4gICAgdmFyIHVuaXQgPSA0NDtcbiAgICB2YXIgaGFsZlVuaXQgPSB1bml0IC8gMjtcbiAgICB2YXIgbWFyZ2luID0gMTc2O1xuICAgIHZhciB4LCB5O1xuICAgIHZhciBjZ3MgPSB0aGlzLl9jYWNoZWRHYW1lU3RhdGU7XG4gICAgdmFyIGJsb2NrID0gdW5pdCAqIGNncy5ib2FyZC5zaXplO1xuXG4gICAgLy8gdG8gY2FudmFzIGNvb3JkXG4gICAgeCA9IE1hdGguZmxvb3IoY3ggLyB0aGlzLl9jYW52YXNSYXRpbyk7XG4gICAgeSA9IE1hdGguZmxvb3IoY3kgLyB0aGlzLl9jYW52YXNSYXRpbyk7XG5cbiAgICAvLyB0byBtYWluIGJvYXJkIGNvb3JkXG4gICAgeCA9ICh4IC0gbWFyZ2luICsgYmxvY2spICUgYmxvY2s7XG4gICAgeSA9ICh5IC0gbWFyZ2luICsgYmxvY2spICUgYmxvY2s7XG5cbiAgICAvLyB0byBsb2NhbCBjb29yZFxuICAgIHggPSBNYXRoLnJvdW5kKCh4IC0gaGFsZlVuaXQpIC8gdW5pdCk7XG4gICAgeSA9IE1hdGgucm91bmQoKHkgLSBoYWxmVW5pdCkgLyB1bml0KTtcblxuICAgIC8vIHNsaWRlIGNlbnRlclxuICAgIHggPSAodGhpcy5fY2VudGVyLnggLSB0aGlzLl9kZWZhdWx0Q2VudGVyLnggKyB4ICsgdGhpcy5fc2l6ZSkgJSB0aGlzLl9zaXplO1xuICAgIHkgPSAodGhpcy5fY2VudGVyLnkgLSB0aGlzLl9kZWZhdWx0Q2VudGVyLnkgKyB5ICsgdGhpcy5fc2l6ZSkgJSB0aGlzLl9zaXplO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHg6IHgsXG4gICAgICB5OiB5LFxuICAgIH07XG4gIH07XG5cbiAgQm9hcmRWaWV3LnByb3RvdHlwZS5fcmVmcmVzaEFsbCA9IGZ1bmN0aW9uKGdzKSB7XG4gICAgdGhpcy5fY2xlYXJCb2FyZCh0aGlzLl9iYWNrQ3R4KTtcbiAgICB0aGlzLl9jbGVhckJvYXJkKHRoaXMuX2N0eCk7XG4gICAgdGhpcy5fd3JpdGVCb2FyZChncyk7XG4gICAgdGhpcy5fd3JpdGVTdGFycyhncyk7XG4gICAgdGhpcy5fd3JpdGVTdG9uZXMoZ3MpO1xuXG4gICAgdmFyIHVuaXQgPSA0NDtcbiAgICB2YXIgaGFsZlVuaXQgPSB1bml0IC8gMjtcbiAgICB2YXIgbWFyZ2luID0gMTk4O1xuICAgIHZhciB1bml0NCA9IHVuaXQgKiA0O1xuICAgIHZhciB1bml0NSA9IHVuaXQgKiA1O1xuICAgIHZhciB1bml0OCA9IHVuaXQgKiA4O1xuICAgIHZhciB1bml0OSA9IHVuaXQgKiA5O1xuXG4gICAgdGhpcy5fY3R4LnNhdmUoKTtcbiAgICB0aGlzLl9jdHguZ2xvYmFsQWxwaGEgPSAwLjQ7XG4gICAgdGhpcy5fY3R4LmZpbGxTdHlsZSA9ICdyZ2IoMCwgMjU1LCAyNTUpJztcbiAgICB0aGlzLl9jdHguZmlsbFJlY3QoMCwgMCwgdGhpcy5fd2lkdGgsIHRoaXMuX2hlaWdodCk7XG4gICAgdGhpcy5fY3R4LnJlc3RvcmUoKTtcblxuICAgIHRoaXMuX2N0eC5zYXZlKCk7XG4gICAgdGhpcy5fY3R4Lmdsb2JhbEFscGhhID0gMC43O1xuXG4gICAgLy8gbGVmdC11cFxuICAgIHRoaXMuX2N0eC5kcmF3SW1hZ2UodGhpcy5fYmFja0NhbnZhcywgbWFyZ2luICsgdW5pdDUgLSBoYWxmVW5pdCwgbWFyZ2luICsgdW5pdDUgLSBoYWxmVW5pdCwgdW5pdDQsIHVuaXQ0LCAwLCAwLCB1bml0NCwgdW5pdDQpO1xuXG4gICAgLy8gcmlnaHQtdXBcbiAgICB0aGlzLl9jdHguZHJhd0ltYWdlKHRoaXMuX2JhY2tDYW52YXMsIG1hcmdpbiAtIGhhbGZVbml0LCBtYXJnaW4gKyB1bml0NSAtIGhhbGZVbml0LCB1bml0NCwgdW5pdDQsIG1hcmdpbiArIHVuaXQ4ICsgaGFsZlVuaXQsIDAsIHVuaXQ0LCB1bml0NCk7XG5cbiAgICAvLyBsZWZ0LWRvd25cbiAgICB0aGlzLl9jdHguZHJhd0ltYWdlKHRoaXMuX2JhY2tDYW52YXMsIG1hcmdpbiArIHVuaXQ1IC0gaGFsZlVuaXQsIG1hcmdpbiAtIGhhbGZVbml0LCB1bml0NCwgdW5pdDQsIDAsIG1hcmdpbiArIHVuaXQ4ICsgaGFsZlVuaXQsIHVuaXQ0LCB1bml0NCk7XG5cbiAgICAvLyByaWdodC1kb3duXG4gICAgdGhpcy5fY3R4LmRyYXdJbWFnZSh0aGlzLl9iYWNrQ2FudmFzLCBtYXJnaW4gLSBoYWxmVW5pdCwgbWFyZ2luIC0gaGFsZlVuaXQsIHVuaXQ0LCB1bml0NCwgbWFyZ2luICsgdW5pdDggKyBoYWxmVW5pdCwgbWFyZ2luICsgdW5pdDggKyBoYWxmVW5pdCwgdW5pdDQsIHVuaXQ0KTtcblxuICAgIC8vIHVwXG4gICAgdGhpcy5fY3R4LmRyYXdJbWFnZSh0aGlzLl9iYWNrQ2FudmFzLCBtYXJnaW4gLSBoYWxmVW5pdCwgbWFyZ2luICsgdW5pdDUgLSBoYWxmVW5pdCwgdW5pdDksIHVuaXQ0LCBtYXJnaW4gLSBoYWxmVW5pdCwgMCwgdW5pdDksIHVuaXQ0KTtcblxuICAgIC8vIGxlZnRcbiAgICB0aGlzLl9jdHguZHJhd0ltYWdlKHRoaXMuX2JhY2tDYW52YXMsIG1hcmdpbiArIHVuaXQ1IC0gaGFsZlVuaXQsIG1hcmdpbiAtIGhhbGZVbml0LCB1bml0NCwgdW5pdDksIDAsIG1hcmdpbiAtIGhhbGZVbml0LCB1bml0NCwgdW5pdDkpO1xuXG4gICAgLy8gZG93blxuICAgIHRoaXMuX2N0eC5kcmF3SW1hZ2UodGhpcy5fYmFja0NhbnZhcywgbWFyZ2luIC0gaGFsZlVuaXQsIG1hcmdpbiAtIGhhbGZVbml0LCB1bml0OSwgdW5pdDQsIG1hcmdpbiAtIGhhbGZVbml0LCBtYXJnaW4gKyB1bml0OCArIGhhbGZVbml0LCB1bml0OSwgdW5pdDQpO1xuXG4gICAgLy8gcmlnaHRcbiAgICB0aGlzLl9jdHguZHJhd0ltYWdlKHRoaXMuX2JhY2tDYW52YXMsIG1hcmdpbiAtIGhhbGZVbml0LCBtYXJnaW4gLSBoYWxmVW5pdCwgdW5pdDQsIHVuaXQ5LCBtYXJnaW4gKyB1bml0OCArIGhhbGZVbml0LCBtYXJnaW4gLSBoYWxmVW5pdCwgdW5pdDQsIHVuaXQ5KTtcblxuICAgIHRoaXMuX2N0eC5yZXN0b3JlKCk7XG4gICAgdGhpcy5fY3R4LmRyYXdJbWFnZSh0aGlzLl9iYWNrQ2FudmFzLCBtYXJnaW4gLSBoYWxmVW5pdCwgbWFyZ2luIC0gaGFsZlVuaXQsIHVuaXQ5LCB1bml0OSwgbWFyZ2luIC0gaGFsZlVuaXQsIG1hcmdpbiAtIGhhbGZVbml0LCB1bml0OSwgdW5pdDkpO1xuICB9O1xuXG4gIEJvYXJkVmlldy5wcm90b3R5cGUuX2NsZWFyQm9hcmQgPSBmdW5jdGlvbihjdHgpIHtcbiAgICBjdHguZmlsbFN0eWxlID0gJ3JnYig2NCwgNjQsIDY0KSc7XG4gICAgY3R4LmZpbGxSZWN0KDAsIDAsIHRoaXMuX3dpZHRoLCB0aGlzLl9oZWlnaHQpO1xuICB9O1xuXG4gIEJvYXJkVmlldy5wcm90b3R5cGUuX3dyaXRlQm9hcmQgPSBmdW5jdGlvbihncykge1xuICAgIHZhciBjID0gdGhpcy5fYmFja0N0eDtcbiAgICB2YXIgeCwgeTtcbiAgICB2YXIgdW5pdCA9IDQ0O1xuICAgIHZhciBoYWxmVW5pdCA9IHVuaXQgLyAyO1xuICAgIHZhciBtYXJnaW4gPSAxNzY7XG5cbiAgICBjLmJlZ2luUGF0aCgpO1xuICAgIGMuc3Ryb2tlU3R5bGUgPSAncmdiKDI1NSwgMjU1LCAyNTUpJztcbiAgICBjLmxpbmVXaWR0aCA9IDM7XG4gICAgZm9yICh4ID0gMDsgeCA8IGdzLmJvYXJkLnNpemU7IHgrKykge1xuICAgICAgYy5tb3ZlVG8odW5pdCAqIHggKyBoYWxmVW5pdCArIG1hcmdpbiwgbWFyZ2luIC0gaGFsZlVuaXQpO1xuICAgICAgYy5saW5lVG8odW5pdCAqIHggKyBoYWxmVW5pdCArIG1hcmdpbiwgdGhpcy5faGVpZ2h0IC0gbWFyZ2luICsgaGFsZlVuaXQpO1xuICAgIH1cblxuICAgIGZvciAoeSA9IDA7IHkgPCBncy5ib2FyZC5zaXplOyB5KyspIHtcbiAgICAgIGMubW92ZVRvKG1hcmdpbiAtIGhhbGZVbml0LCAgICAgICAgICAgICAgIHVuaXQgKiB5ICsgaGFsZlVuaXQgKyBtYXJnaW4pO1xuICAgICAgYy5saW5lVG8odGhpcy5fd2lkdGggLSBtYXJnaW4gKyBoYWxmVW5pdCwgdW5pdCAqIHkgKyBoYWxmVW5pdCArIG1hcmdpbik7XG4gICAgfVxuXG4gICAgYy5jbG9zZVBhdGgoKTtcbiAgICBjLnN0cm9rZSgpO1xuICB9O1xuXG4gIEJvYXJkVmlldy5wcm90b3R5cGUuX3dyaXRlU3RhcnMgPSBmdW5jdGlvbihncykge1xuICAgIHZhciBjID0gdGhpcy5fYmFja0N0eDtcbiAgICB2YXIgaTtcbiAgICB2YXIgeCwgeTtcbiAgICB2YXIgeHgsIHl5O1xuICAgIHZhciB1bml0ID0gNDQ7XG4gICAgdmFyIGhhbGZVbml0ID0gdW5pdCAvIDI7XG4gICAgdmFyIG1hcmdpbiA9IDE3NjtcbiAgICB2YXIgc3RhcnMgPSBbXG4gICAgICB7IHg6IDIsIHk6MiB9LFxuICAgICAgeyB4OiA0LCB5OjQgfSxcbiAgICAgIHsgeDogNiwgeToyIH0sXG4gICAgICB7IHg6IDQsIHk6NCB9LFxuICAgICAgeyB4OiAyLCB5OjYgfSxcbiAgICAgIHsgeDogNiwgeTo2IH0sXG4gICAgXVxuXG4gICAgYy5maWxsU3R5bGUgPSAncmdiKDI1NSwgMjU1LCAyNTUpJztcbiAgICBmb3IgKGkgPSAwOyBpIDwgc3RhcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHggPSBzdGFyc1tpXS54O1xuICAgICAgeSA9IHN0YXJzW2ldLnk7XG4gICAgICB4eCA9ICh0aGlzLl9zaXplICsgdGhpcy5fZGVmYXVsdENlbnRlci54ICsgeCAtIHRoaXMuX2NlbnRlci54KSAlIHRoaXMuX3NpemU7XG4gICAgICB5eSA9ICh0aGlzLl9zaXplICsgdGhpcy5fZGVmYXVsdENlbnRlci55ICsgeSAtIHRoaXMuX2NlbnRlci55KSAlIHRoaXMuX3NpemU7XG5cbiAgICAgIGMuYmVnaW5QYXRoKCk7XG4gICAgICBjLmFyYyh4eCAqIHVuaXQgKyBoYWxmVW5pdCArIG1hcmdpbiwgeXkgKiB1bml0ICsgaGFsZlVuaXQgKyBtYXJnaW4sIDYsIDAsIE1hdGguUEkgKiAyLCB0cnVlKTtcbiAgICAgIGMuZmlsbCgpO1xuICAgICAgYy5jbG9zZVBhdGgoKTtcbiAgICB9XG4gIH07XG5cbiAgQm9hcmRWaWV3LnByb3RvdHlwZS5fd3JpdGVTdG9uZXMgPSBmdW5jdGlvbihncykge1xuICAgIHZhciBjID0gdGhpcy5fYmFja0N0eDtcbiAgICB2YXIgeCwgeTtcbiAgICB2YXIgeHgsIHl5O1xuICAgIHZhciB1bml0ID0gNDQ7XG4gICAgdmFyIGhhbGZVbml0ID0gdW5pdCAvIDI7XG4gICAgdmFyIG1hcmdpbiA9IDE3NjtcblxuICAgIGMubGluZVdpZHRoID0gMztcblxuICAgIGZvciAoeCA9IDA7IHggPCBncy5ib2FyZC5zaXplOyB4KyspIHtcbiAgICAgIGZvciAoeSA9IDA7IHkgPCBncy5ib2FyZC5zaXplOyB5KyspIHtcbiAgICAgICAgeHggPSAodGhpcy5fc2l6ZSArIHRoaXMuX2RlZmF1bHRDZW50ZXIueCArIHggLSB0aGlzLl9jZW50ZXIueCkgJSB0aGlzLl9zaXplO1xuICAgICAgICB5eSA9ICh0aGlzLl9zaXplICsgdGhpcy5fZGVmYXVsdENlbnRlci55ICsgeSAtIHRoaXMuX2NlbnRlci55KSAlIHRoaXMuX3NpemU7XG5cbiAgICAgICAgaWYgKGdzLmJvYXJkLmdldFN0b25lKHgsIHkpID09PSBTdG9uZS5CbGFjaykge1xuICAgICAgICAgIGMuYmVnaW5QYXRoKCk7XG4gICAgICAgICAgYy5zdHJva2VTdHlsZSA9ICdyZ2IoMjU1LCAyNTUsIDI1NSknO1xuICAgICAgICAgIGMuZmlsbFN0eWxlID0gJ3JnYigwLCAwLCAwKSc7XG4gICAgICAgICAgYy5hcmMoeHggKiB1bml0ICsgaGFsZlVuaXQgKyBtYXJnaW4sIHl5ICogdW5pdCArIGhhbGZVbml0ICsgbWFyZ2luLCAyMCwgMCwgTWF0aC5QSSAqIDIsIHRydWUpO1xuICAgICAgICAgIGMuc3Ryb2tlKCk7XG4gICAgICAgICAgYy5maWxsKCk7XG4gICAgICAgICAgYy5jbG9zZVBhdGgoKTtcbiAgICAgICAgfSBlbHNlIGlmIChncy5ib2FyZC5nZXRTdG9uZSh4LCB5KSA9PT0gU3RvbmUuV2hpdGUpIHtcbiAgICAgICAgICBjLmJlZ2luUGF0aCgpO1xuICAgICAgICAgIGMuc3Ryb2tlU3R5bGUgPSAncmdiKDAsIDAsIDApJztcbiAgICAgICAgICBjLmZpbGxTdHlsZSA9ICdyZ2IoMjU1LCAyNTUsIDI1NSknO1xuICAgICAgICAgIGMuYXJjKHh4ICogdW5pdCArIGhhbGZVbml0ICsgbWFyZ2luLCB5eSAqIHVuaXQgKyBoYWxmVW5pdCArIG1hcmdpbiwgMjAsIDAsIE1hdGguUEkgKiAyLCB0cnVlKTtcbiAgICAgICAgICBjLnN0cm9rZSgpO1xuICAgICAgICAgIGMuZmlsbCgpO1xuICAgICAgICAgIGMuY2xvc2VQYXRoKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIEJvYXJkVmlldztcbn0pO1xuXG5cbmRlZmluZSgnYXBwL2NsaWVudC9tYWluJyxbJ3JlcXVpcmUnLCdhcHAvY2xpZW50L21lZGlhdG9yL0dhbWVNZWRpYXRvci5qcycsJ2FwcC9jbGllbnQvdmlldy9Cb2FyZFZpZXcnXSxmdW5jdGlvbihyZXF1aXJlKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIHZhciBHYW1lTWVkaWF0b3IgPSByZXF1aXJlKCdhcHAvY2xpZW50L21lZGlhdG9yL0dhbWVNZWRpYXRvci5qcycpO1xuICB2YXIgQm9hcmRWaWV3ID0gcmVxdWlyZSgnYXBwL2NsaWVudC92aWV3L0JvYXJkVmlldycpO1xuXG4gIHZhciBtYWluID0gZnVuY3Rpb24oKSB7fTtcbiAgbWFpbi5wcm90b3R5cGUgPSB7XG4gICAgc3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIG1lZGlhdG9yID0gbmV3IEdhbWVNZWRpYXRvcigpO1xuXG4gICAgICB2YXIgYm9hcmRWaWV3ID0gbmV3IEJvYXJkVmlldyhtZWRpYXRvciwgOSk7XG5cbiAgICAgIG1lZGlhdG9yLnN0YXJ0R2FtZSh7XG4gICAgICAgIGJvYXJkOiB7XG4gICAgICAgICAgc2l6ZTogOSxcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gbWFpbjtcbn0pO1xuXG5cbiJdLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
