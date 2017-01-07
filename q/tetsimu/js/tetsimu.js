/**
 * Tetsimu
 * Copyright (c) 2015 cuboktahedron
 * This software is released under the MIT License.
 * https://github.com/cuboktahedron/tetsimu/blob/master/MIT-LICENSE.txt
 */
var C = {
  Random: new MersenneTwister()
};

(function() {
  var Constants = {};

  Constants.Version = 0.97;
  Constants.ConfigVersion = 0.97;

  Constants.Action = {
    Config: {
      CancelConfig: 'config-cancelConfig',
      StoreConfig: 'config-storeKeyConfig',
    },

    Controller: {
      KeyDown: 'controller-KeyDown',
      KeyUp: 'controller-KeyUp',
    },

    Edit: {
      BackNext: 'edit-backNext',
      BeginSetCell: 'edit-beginSetCell',
      BuildDownField: 'edit-buildDownField',
      BuildUpField: 'edit-buildUpField',
      Cancel: 'edit-cancel',
      ChangeModeToSimu: 'edit-changeModeToSimu',
      CreateUrlParameters: 'edit-createUrlParameters',
      Clear: 'edit-clear',
      DeleteNext: 'edit-deleteNext',
      EndSetCell: 'edit-endSetCell',
      ForwardNext: 'edit-forwardNext',
      Initialize: 'edit-initialize',
      InsertNext: 'edit-insertNext',
      SelectType: 'edit-selectType',
      SetCell: 'edit-setCell',
      SetHold: 'edit-setHold',
      SetNext: 'edit-setNext',
    },

    Mouse: {
      Down: 'mouse-KeyDown',
      Up: 'mouse-KeyUp',
    },

    Simu: {
      Back: 'simu-back',
      BackToEditMode: 'simu-backToEditMode',
      BackToHead: 'simu-backToHead',
      ChangeModeToEdit: 'simu-changeModeToEdit',
      ChangeModeToSimu: 'simu-changeModeToSimu',
      ChangeModeToReplay: 'simu-changeModeToReplay',
      Clear: 'simu-clear',
      CreateUrlParameters: 'simu-createUrlParameters',
      Forward: 'simu-forward',
      HardDrop: 'simu-hardDrop',
      Hold: 'simu-hold',
      Initialize: 'simu-initialize',
      Move: 'simu-move',
      ToggleNextVisible: 'simu-toggleNextVisible',
      TurnRight: 'simu-turnRight',
      TurnLeft: 'simu-turnLeft',
      Retry: 'simu-retry'
    },

    Replay: {
      Back: 'replay-back',
      BackToHead: 'replay-backToHead',
      CancelConfig: 'replay-cancelConfig',
      ChangeModeToSimu: 'replay-changeModeToSimu',
      CreateUrlParameters: 'replay-createUrlParameters',
      Forward: 'replay-forward',
      Initialize: 'replay-initialize',
    },
  };

  Constants.Event = {
    Cancel: 'cancel',
    Change: 'change',
    ChangeMode: 'changeMode',
    SetUrl: 'setUrl',
    Key: 'Key'
  };

  Constants.Mode = {
    Simu: '0',
    Replay: '1',
    Edit: '2'
  };

  Constants.KeyNames = [
    'shift',
    'ctrl',
    'caps',
    'esc',
    'space',
    'left',
    'up',
    'right',
    'down',
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z',
    'cmd',
    'num_0',
    'num_1',
    'num_2',
    'num_3',
    'num_4',
    'num_5',
    'num_6',
    'num_7',
    'num_8',
    'num_9',
    'num_multiply',
    'num_add',
    'num_enter',
    'num_subtract',
    'num_decimal',
    'num_divide',
    ';',
    '=',
    ',',
    '-',
    '.',
    '/',
    '`',
    '[',
    '\\',
    ']',
    '\'',
    '`',
    '-',
    "?",
    ">",
    "<",
    "\"",
    ":",
    "{",
    "}",
    "|",
    "~",
    "+",
    "_",
    "!",
    "@",
    "#",
    "$",
    "%",
    "^",
    "&",
    "*",
    "(",
    ")"
  ];

  // keypress.jsは英語配列準拠のようなので「@」などが入っている
  Constants.ShiftedKeys = [
    "?",  //"/"
    ">",  //"."
    "<",  //","
    "\"", //"\'"
    ":",  //";"
    "{",  //"["
    "}",  //"]"
    "|",  //"\\"
    "~",  //"`"
    "+",  //"="
    "_",  //"-"
    "!",  //"1"
    "@",  //"2"
    "#",  //"3"
    "$",  //"4"
    "%",  //"5"
    "^",  //"6"
    "&",  //"7"
    "*",  //"8"
    "(",  //"9"
    ")"   //"0"
  ];

  Constants.MouseButton = {
    Left: 1,
  };

  Constants.SpinType = {
    None: '0',
    TSpin: '1',
    TSpinMini: '2'
  };

  Constants.Trick = {
    None: '0',
    Single: '1',
    Double: '2',
    Triple: '3',
    Tetris: '4',
    TSSM: '5',
    TSS: '6',
    TSD: '7',
    TST: '8',
    TSM: '9',
    TS: '10',
    OverTetris: '11',
  };

  Constants.StepType = {
    None: '0',
    HardDrop: '1',
    SoftDrop: '2',
    Hold: '3',
    Ojama: '4'
    // 5～15：reserved
  };

  C.Constants = Constants;
})();

(function() {
  'use strict';

  var Dispatcher = function() {
    this._id = 0;
    this._callbacks = {};
  };

  Dispatcher.prototype = {
    _ID_PREFIX: 'id_',

    register: function(callback) {
      var id = this._ID_PREFIX + (this._id++);
      this._callbacks[id] = callback;
      return id;
    },

    unregister: function(id) {
      delete this._callbacks[id];
    },

    dispatch: function(payload) {
      var id;
      for (id in this._callbacks) {
        this._callbacks[id](payload);
      }
    }
  };

  C.Dispatcher = Dispatcher;
})();

(function() {
  'use strict';

  var AppDispatcher = function() {
    C.Dispatcher.call(this);
  };

  AppDispatcher.prototype = $.extend({
    handleViewAction: function(action) {
      this.dispatch({
        source: 'VIEW_ACTION',
        action: action
      });
    }
  }, C.Dispatcher.prototype);

  C.AppDispatcher = new AppDispatcher();
})();

(function() {
  'use strict';

  var Direction = {
    Up   : 1,
    Left : 2,
    Down : 4,
    Right: 8,

    turnLeft: function(dir) {
      switch (dir) {
        case Direction.Up: return Direction.Left;
        case Direction.Left: return Direction.Down;
        case Direction.Down: return Direction.Right;
        case Direction.Right: return Direction.Up;
        default: throw new Error('invalid direction(' + dir + ')'); 
      }
    },

    turnRight: function(dir) {
      switch (dir) {
        case Direction.Up: return Direction.Right;
        case Direction.Left: return Direction.Up;
        case Direction.Down: return Direction.Left;
        case Direction.Right: return Direction.Down;
        default: throw new Error('invalid direction(' + dir + ')'); 
      }
    }
  };

  C.Direction = Direction;
})();

(function() {
  'use strict';

  var Tetrimino = function(type, pivot, direction) {
    this.type(type);
    this.pivot(pivot || { x: 0, y: 0 });
    this.direction(direction || C.Direction.Up);
  };

  Tetrimino._SuperRotations = (function() {

    var srss = {
      left: {},
      right: {}
    };

    srss.left[C.Direction.Up] = [
      { x:  1, y:  0 },
      { x:  1, y:  1 },
      { x:  0, y: -2 },
      { x:  1, y: -2 }
    ];

    srss.left[C.Direction.Left] = [
      { x: -1, y:  0 },
      { x: -1, y: -1 },
      { x:  0, y:  2 },
      { x: -1, y:  2 }
    ];

    srss.left[C.Direction.Down] = [
      { x: -1, y:  0 },
      { x: -1, y:  1 },
      { x:  0, y: -2 },
      { x: -1, y: -2 }
    ];

    srss.left[C.Direction.Right] = [
      { x: 1, y:  0 },
      { x: 1, y: -1 },
      { x: 0, y:  2 },
      { x: 1, y:  2 }
    ];

    srss.right[C.Direction.Up] = [
      { x: -1, y:  0 },
      { x: -1, y:  1 },
      { x:  0, y: -2 },
      { x: -1, y: -2 }
    ];

    srss.right[C.Direction.Left] = [
      { x: -1, y:  0 },
      { x: -1, y: -1 },
      { x:  0, y:  2 },
      { x: -1, y:  2 }
    ];

    srss.right[C.Direction.Down] = [
      { x:  1, y:  0 },
      { x:  1, y:  1 },
      { x:  0, y: -2 },
      { x:  1, y: -2 }
    ];

    srss.right[C.Direction.Right] = [
      { x:  1, y:  0 },
      { x:  1, y: -1 },
      { x:  0, y:  2 },
      { x:  1, y:  2 }
    ];

    return srss;
  })();

  Tetrimino.prototype = {
    SuperRotationsLeft: function() {
      return Tetrimino._SuperRotations.left[this.direction()];
    },

    SuperRotationsRight: function() {
      return Tetrimino._SuperRotations.right[this.direction()];
    },

    pivot: function(pivot) {
      if (pivot === undefined) {
        // get
        return this._pivot;
      } else {
        // set
        this._pivot = pivot;
      }
    },

    direction: function(dir) {
      if (dir === undefined) {
        // get
        return this._direction;
      } else {
        // set
        this._direction = dir;
      }
    },

    type: function(type) {
      if (type === undefined) {
        // get
        return this._type;
      } else {
        // set
        this._type = type;
      }
    },

    turnLeft: function() {
      this.direction(C.Direction.turnLeft(this.direction()));
    },

    turnRight: function() {
      this.direction(C.Direction.turnRight(this.direction()));
    },

    blocks: function() {
      var that = this
        , shape = this.Shape();
      return shape.map(function(pt, i) {
        return {
          x: pt.x + that.pivot().x,
          y: pt.y + that.pivot().y
        };
      });
    },

    copy: function() {
      return $.extend(true, {}, this);
    },

    hardDrop: function(field) {
      var i = 0;
      var pivot;
      while (!field.isGround(this)) {
        pivot = this.pivot();
        pivot.y--;
        this.pivot(pivot);
        i++;

        if (i > 100) break;
      }
    },

    move: function(movement) {
      var pivot = this.pivot();
      pivot.x += movement.x;
      pivot.y += movement.y;
      this.pivot(pivot);
    },

    canMove: function(field, movement) {
      var copied = this.copy()
        , blocks
        , block
        , p;

      copied.move(movement);

      blocks = copied.blocks();
      for (p in blocks) {
        block = blocks[p];
        if (C.CellType.isBlock(field.type(block.x, block.y))) {
          return false;
        }
      }

      return true;
    },

    turnLeftIfPossible: function(field, specialInfo) {
      this._initSpecialInfo(specialInfo);
      this.turnLeft();

      if (this._isOverwrap(field)) {
        // undo
        this.turnRight();
        return false;
      }

      return true;
    },

    _isOverwrap: function(field) {
      var blocks = this.blocks()
        , block
        , p;

      for (p in blocks) {
        block = blocks[p];
        if (C.CellType.isBlock(field.type(block.x, block.y))) {
          return true;
        }
      }

      return false;
    },

    turnLeftSuperlyIfPossible: function(field, specialInfo) {
      this._initSpecialInfo(specialInfo);

      var sr = this.SuperRotationsLeft()
        , i
        , len
        , conditions;

      if (this._turnLeftSuperlyIfPossible(field, sr, specialInfo)) {
        return true;
      }

      return false;
    },

    _turnLeftSuperlyIfPossible: function(field, sr, specialInfo) {
      var i
        , len
        , pivot = this.pivot();

      this.turnLeft();
      for (i = 0, len = sr.length; i < len; i++) {
        this.pivot({ x: pivot.x + sr[i].x, y: pivot.y + sr[i].y});

        if (!this._isOverwrap(field)) {
          specialInfo._option = sr.option || {};
          return true;
        }

        // undo
        this.pivot(pivot);
      }

      // undo
      this.turnRight();
      return false;
    },

    turnRightIfPossible: function(field, specialInfo) {
      this._initSpecialInfo(specialInfo);
      this.turnRight();

      if (this._isOverwrap(field)) {
        // undo
        this.turnLeft();
        return false;
      }

      return true;
    },

    turnRightSuperlyIfPossible: function(field, specialInfo) {
      this._initSpecialInfo(specialInfo);

      var sr = this.SuperRotationsRight()
        , i
        , len
        , conditions;

      if (this._turnRightSuperlyIfPossible(field, sr, specialInfo)) {
        return true;
      }

      return false;
    },

    _turnRightSuperlyIfPossible: function(field, sr, specialInfo) {
      var i
        , len
        , pivot = this.pivot();

      this.turnRight();
      for (i = 0, len = sr.length; i < len; i++) {
        this.pivot({ x: pivot.x + sr[i].x, y: pivot.y + sr[i].y});

        if (!this._isOverwrap(field)) {
          specialInfo._option = sr.option || {};
          return true;
        }

        // undo
        this.pivot(pivot);
      }

      // undo
      this.turnLeft();
      return false;
    },

    _initSpecialInfo: function(specialInfo) {
      $.extend(specialInfo, {
        spinType: C.Constants.SpinType.None
      });
    }
  };

  Tetrimino.makeRotationPattern = function(base, direction) {
    // x' = x・cos - y・sin
    // y' = x・sin + y・cos

    var cos
      , sin
      , newSr = $.extend(true, [], base)
      , i, srLen
      , sr
      , j, conditionLen
      , condition
      , movement;

    switch (direction) {
      case C.Direction.Up:
        cos = 1; sin = 0; break;
      case C.Direction.Left:
        cos = 0; sin = 1; break;
      case C.Direction.Down:
        cos = -1; sin = 0; break;
      case C.Direction.Right:
        cos = 0; sin = -1; break;
    }

    for (i = newSr.length - 1; i >= 0; i--) {
      // パターン生成対象の方向ではない場合、要素を削除していくので処理しやすいように逆順に回す
      sr = newSr[i];
      if (sr.targets.indexOf(direction) != -1) {
        for (j = 0, conditionLen = sr.conditions.length; j < conditionLen; j++) {
          sr.conditions[j] = {
            x: sr.conditions[j].x * cos - sr.conditions[j].y * sin,
            y: sr.conditions[j].x * sin + sr.conditions[j].y * cos
          };
        }

        sr.movement = {
          x: sr.movement.x * cos - sr.movement.y * sin,
          y: sr.movement.x * sin + sr.movement.y * cos
        };
      } else {
        newSr.splice(i, 1);
      }
    }

    return newSr;
  };

  Tetrimino.makeFlipHorizonPattern = function(base) {
    var srss = $.extend(true, {}, base)
      , srs
      , sr
      , swap
      , p
      , i, iLen
      , j, conditionLen;

    swap = srss[C.Direction.Left];
    srss[C.Direction.Left] = srss[C.Direction.Right];
    srss[C.Direction.Right] = swap;

    for (p in srss) {
      srs = srss[p];
      for (i = 0, iLen = srs.length; i < iLen; i++) {
        sr = srs[i];
        for (j = 0, conditionLen = sr.conditions.length; j < conditionLen; j++) {
          sr.conditions[j] = {
            x: -sr.conditions[j].x,
            y: sr.conditions[j].y
          };
        }

        sr.movement = {
          x: -sr.movement.x,
          y: sr.movement.y
        };
      }
    }

    return srss;
  };

  C.Tetrimino = Tetrimino;
})();

(function() {
  var TetriminoFactory = {
    create: function(type, pivot, direction) {
      switch (type) {
        case C.CellType.I:
          return new C.TetriminoI(pivot, direction);
        case C.CellType.J:
          return new C.TetriminoJ(pivot, direction);
        case C.CellType.L:
          return new C.TetriminoL(pivot, direction);
        case C.CellType.O:
          return new C.TetriminoO(pivot, direction);
        case C.CellType.S:
          return new C.TetriminoS(pivot, direction);
        case C.CellType.T:
          return new C.TetriminoT(pivot, direction);
        case C.CellType.Z:
          return new C.TetriminoZ(pivot, direction);
        default:
          throw new Error('invalid tetrimino type(' + type + ')');
      }
    }
  };

  C.TetriminoFactory = TetriminoFactory;
})();

(function() {
  'use strict';

  var CellType = {
    None: '0',
    I: '1',
    J: '2',
    L: '3',
    O: '4',
    S: '5',
    T: '6',
    Z: '7',
    Ojama: '8',
    Wall: '9',

    isBlock: function(type) {
      return type >= C.CellType.I && type <= C.CellType.Wall;
    }
  };

  C.CellType = CellType;
})();

(function() {
  'use strict';

  var ContextBuilder = {
    build: function(params) {
      var context = {};

      context.initialMode = this._buildInitialMode(params);
      context.field = this._buildField(params);
      context.hold = this._buildHold(params);
      context.nexts = this._buildNexts(params);
      context.nextsVisibled = this._buildNextsVisibled(params);
      context.prevs = this._buildPrevs(params);
      context.steps = this._buildSteps(params);
      context.seed = this._buildSeed(params);

      return context;
    },

    _buildInitialMode: function(params) {
      return params.m == null ? C.Constants.Mode.Simu : params.m;
    },

    _buildField: function(params) {
      return params.f || '';
    },

    _buildHold: function(params) {
      return params.h || '';
    },

    _buildNexts: function(params) {
      return params.ns || '';
    },

    _buildNextsVisibled: function(params) {
      return params.nv || 'v';
    },

    _buildPrevs: function(params) {
      return params.ps || '';
    },

    _buildSteps: function(params) {
      return params.ss || '';
    },

    _buildSeed: function(params) {
      return params.s == null ? null : Number(params.s);
    }
  };

  C.ContextBuilder = ContextBuilder;
})();

(function() {
  'use strict';

  var Description = function() {
    this.current({
      ren: 0,
      clearLineNum: 0,
      spinType: C.Constants.SpinType.None,
      perfectCleared: false,
      prevTrick: C.Constants.Trick.None
    });
  };

  Description.prototype = {
    ren: function(ren) {
      if (ren === undefined) {
        // get
        return this._ren;
      } else {
        // set
        this._ren = ren;
      }
    },

    clearLineNum: function(num) {
      if (num === undefined) {
        // get
        return this._clearLineNum;
      } else {
        // set
        this._clearLineNum = num;
      }
    },

    spinType: function(type) {
      if (type === undefined) {
        // get
        return this._spinType;
      } else {
        // set
        this._spinType = type;
      }
    },

    perfectCleared: function(value) {
      if (value === undefined) {
        // get
        return this._perfectCleared;
      } else {
        // set
        this._perfectCleared = value;
      }
    },

    fixData: function() {
      var data = {}
        , spinType = this.spinType()
        , line = this.clearLineNum()
        , SpinType = C.Constants.SpinType;

      data.ren = this.ren();
      data.perfectCleared = this.perfectCleared();

      switch (true) {
        case line === 0 && spinType === SpinType.TSpin:
          data.trick = C.Constants.Trick.TS;
          break;
        case line === 0 && spinType === SpinType.TSpinMini:
          data.trick = C.Constants.Trick.TSM;
          break;
        case line === 0:
          data.trick = C.Constants.Trick.None;
          break;
        case line === 1 && spinType === SpinType.None:
          data.trick = C.Constants.Trick.Single;
          break;
        case line === 1 && spinType === SpinType.TSpin:
          data.trick = C.Constants.Trick.TSS;
          break;
        case line === 1 && spinType === SpinType.TSpinMini:
          data.trick = C.Constants.Trick.TSSM;
          break;
        case line === 2 && (spinType === SpinType.None):
          data.trick = C.Constants.Trick.Double;
          break;
        case line === 2 && (spinType === SpinType.TSpinMini || spinType === SpinType.TSpin):
          data.trick = C.Constants.Trick.TSD;
          break;
        case line === 3 && (spinType === SpinType.None):
          data.trick = C.Constants.Trick.Triple;
          break;
        case line === 3 && (spinType === SpinType.TSpinMini || spinType === SpinType.TSpin):
          data.trick = C.Constants.Trick.TST;
          break;
        case line === 4:
          data.trick = C.Constants.Trick.Tetris;
          break;
        case line > 4:
          data.trick = C.Constants.Trick.OverTetris;
          break;
      }

      if (this.data()) {
        data.b2b = this._isB2b(data.trick);
      } else {
        data.b2b = false;
      }

      if (line > 0) {
        this._prevTrick = data.trick;
      }
      this._data = data;
    },

    _isB2b: function(trick) {
      return this._isB2bTrick(this._prevTrick) && this._isB2bTrick(trick)
    },

    _isB2bTrick: function(trick) {
      return trick === C.Constants.Trick.Tetris
        || trick === C.Constants.Trick.TSSM
        || trick === C.Constants.Trick.TSS
        || trick === C.Constants.Trick.TSD
        || trick === C.Constants.Trick.TST;
    },

    current: function(value) {
      if (value === undefined) {
        // get
        return {
          ren: this._ren,
          clearLineNum: this._clearLineNum,
          spinType: this._spinType,
          perfectCleared: this._perfectCleared,
          prevTrick: this._prevTrick
        };
      } else {
        // set
        this._ren = value.ren;
        this._clearLineNum = value.clearLineNum;
        this._spinType = value.spinType;
        this._perfectCleared = value.perfectCleared;
        this._prevTrick = value.prevTrick;

        this.fixData();
      }
    },

    data: function() {
      return $.extend({}, this._data);
    }
  };

  C.Description = Description;
})();

(function() {
  'use strict';

  var FieldDeserializer = {
    deserialize: function(typesValue) {
      // フィールド固定サイズのみの対応とする
      typesValue = typesValue || ''
      var types = []
        , lackOfCharacterNum = C.Field.DEFAULT_HEIGHT * 7 - typesValue.length
        , i, j
        , lineValue
        , modValue
        , radixConverter = new C.RadixConverter(64);

      for (i = 0; i < lackOfCharacterNum; i++) {
        typesValue = '0' + typesValue;
      }

      for (i = C.Field.DEFAULT_HEIGHT - 1; i >= 0; i--) {
        types[i] = [];

        lineValue = radixConverter.convertToDecimal(typesValue.substring(0, 7));
        typesValue = typesValue.substring(7);

        for (j = C.Field.DEFAULT_WIDTH - 1; j >= 0 ; j--) {
          modValue = lineValue % (1 << 4);
          types[i][j] = '' + modValue;
          lineValue = (lineValue - modValue) / (1 << 4);
        }
      }

      return types;
    }
  };

  C.FieldDeserializer = FieldDeserializer;
})();

(function() {
  'use strict';

  var FieldSerializer = {
    serialize: function(types) {
      // フィールド固定サイズのみの対応とする
      var x, y
        , isBeginning = true
        , lineValue
        , lineStr
        , result = ''
        , radixConverter = new C.RadixConverter(64);

      for (y = C.Field.DEFAULT_HEIGHT - 1; y >= 0; y--) {
        lineValue = 0;
        lineStr = '';
        for (x = 0; x < C.Field.DEFAULT_WIDTH; x++) {
          lineValue = lineValue * (1 << 4);
          lineValue += (Number(types[y][x]));
        }

        if (isBeginning && lineValue !== 0) {
          isBeginning = false;
          lineStr = radixConverter.convertFromDecimal(lineValue);
        } else if (!isBeginning) {
          lineStr = radixConverter.convertFromDecimal(lineValue);
        }

        while (lineStr.length % 7 > 0) {
          lineStr = '0' + lineStr;
        }

        result += lineStr;
      }

      return result;
    }
  };

  C.FieldSerializer = FieldSerializer;
})();

(function() {
  'use strict';

  var Field = function() {
    var that = this;
    this._width = Field.DEFAULT_WIDTH;
    this._height = Field.DEFAULT_HEIGHT;
    this._innerHeight = Field.DEFAULT_INNER_HEIGHT;
    this._types = [];

    this.deserialize();

    this._EmptyLine = (function() {
      var emptyLine = []
        , x;
      for (x = 0; x <= that._maxWidth(); x++) {
        emptyLine.push(C.CellType.None);
      }

      return emptyLine;
    })();
  };

  Field.DEFAULT_HEIGHT = 25;
  Field.DEFAULT_INNER_HEIGHT = 21;
  Field.DEFAULT_WIDTH = 10;

  Field.prototype = {
    innerTypes: function() {
      var types = this.types().concat();
      types.splice(this._innerHeight, this._height - this._innerHeight);
      return types;
    },

    types: function() {
      return this._types;
    },

    deserialize: function(param) {
      this._types = C.FieldDeserializer.deserialize(param);
    },

    serialize: function() {
      return C.FieldSerializer.serialize(this.types());
    },

    type: function(x, y, v) {
      if (v === undefined) {
        // get
        if (this._isOutOfField(x, y)) {
          return C.CellType.Wall;
        } else {
          return this._types[y][x];
        }

      } else {
        // set

        if (!this._isOutOfField(x, y)) {
          this._types[y][x] = v;
        }
      }
    },

    _isOutOfField: function(x, y) {
      return x < 0 || x > this._maxWidth() || y < 0 || y > this._maxHeight();
    },

    _maxWidth: function() {
      return this._width - 1;
    },

    _maxHeight: function() {
      return this._height - 1;
    },

    isGround: function(tetrimino) {
      var p
        , block
        , blocks = tetrimino.blocks();
      for (p in blocks) {
        block = blocks[p];
        if (C.CellType.isBlock(this.type(block.x, block.y - 1))) {
          return true;
        }
      }

      return false;
    },

    settle: function(tetrimino) {
      var blocks = tetrimino.blocks()
        , block
        , p;
      for (p in blocks) {
        block = blocks[p];
        this.type(block.x, block.y, tetrimino.type());
      }
    },

    clearLine: function() {
      var clearLineNum = 0
        , x, y
        , isLineClear;

      for (y = 0; y <= this._maxHeight(); y++) {
        isLineClear = true;
        for (x = 0; x <= this._maxWidth(); x++) {
          if (!C.CellType.isBlock(this.type(x, y))) {
            isLineClear = false;
            break;
          }
        }

        if (isLineClear) {
          clearLineNum++;
          this._types.splice(y, 1);
          this._types.push(this._EmptyLine.concat());
          y--;
        }
      }

      return clearLineNum;
    },

    startPivot: function() {
      return {
        x: this._width / 2 - 1,
        y: this._innerHeight - 2,
      };
    },

    isPerfectCleared: function() {
      var x, y;
      for (y = 0; y <= this._maxHeight(); y++) {
        for (x = 0; x <= this._maxWidth(); x++) {
          if (C.CellType.isBlock(this.type(x, y))) {
            return false;
          }
        }
      }

      return true;
    },
  };

  C.Field = Field;
})();

(function() {
  'use strict';

  var Histories = function(options) {
    options = $.extend({}, {
      maxHistoryNum: Histories.DEFAULT_MAX_HISTORY_NUM
    }, options);

    this._histories = [];
    this._p = -1;
    this._maxHistoryNum = options.maxHistoryNum;
  };

  Histories.DEFAULT_MAX_HISTORY_NUM = 1000;

  Histories.prototype = {
    push: function(current, field, nexts, hold, description) {
      var c = current == null ? C.CellType.None : current.type()
        , f = field.serialize()
        , ns = nexts.no()
        , h = hold.serialize()
        , d = description.current()
        , history = new C.History(c, f, ns, h, d)

      // back後に追加する際は以前の履歴を削除する
      this._histories.length = (this._p + 1);

      this._push(c, f, ns, h, d);
    },

    _push: function (current, field, nextNo, hold, description) {
      this._histories.push(new C.History(current, field, nextNo, hold, description));
      if (this._p + 1 === this._maxHistoryNum) {
        this._histories.shift();
      } else {
        this._p++;
      }
    },

    length: function() {
      return this._histories.length;
    },

    canBack: function() {
      return this._p > 0;
    },

    back: function() {
      if (this.canBack()) {
        this._p--;
      }
    },

    canForward: function() {
      return this._p < this.length() - 1
    },

    forward: function() {
      if (this.canForward()) {
        this._p++;
      }
    },

    current: function() {
      return this._histories[this._p];
    }
  };

  C.Histories = Histories;
})();

(function() {
  'use strict';

  var sequence = (function() {
    var id = 0;
    return function() {
      return ++id;
    }
  });

  var History = function(current, field, nextNo, hold, description) {
    this._id = sequence();
    this._current = current;
    this._field = field;
    this._nextNo = nextNo;
    this._hold = hold;
    this._description = description;
  };

  History.prototype = {
    id: function() {
      return this._id;
    },

    current: function() {
      return this._current;
    },

    field: function() {
      return this._field;
    },

    nextNo: function() {
      return this._nextNo;
    },

    hold: function() {
      return this._hold;
    },

    description: function() {
      return $.extend({}, this._description);
    },
  };

  C.History = History;
})();

(function() {
  'use strict';

  var Hold = function() {
    this._type = C.CellType.None;
    this._canExchange = true;
  };

  Hold.prototype = {
    type: function(v) {
      if (v === undefined) {
        // get
        return this._type;
      } else {
        // set
        this._type = v;
      }
    },

    exchange: function(next) {
      if (!this._canExchange) {
        throw new Error('Cannot exchange');
      }

      var prev = this.type();
      this.type(next);
      this._canExchange = false;
      return prev;
    },

    canExchange: function() {
      return this._canExchange;
    },

    release: function() {
      this._canExchange = true;
    },

    deserialize: function(param) {
      var radixConverter = new C.RadixConverter(64)
        , value;
      param = param || '0';

      value = radixConverter.convertToDecimal(param);
      this.type('' + ((value & 14) >> 1)); // 14 = 0b1110
      this._canExchange = ((value & 1) === 0); // 1 = 0b0001
    },

    serialize: function() {
      var radixConverter = new C.RadixConverter(64)
        , value;

      value = Number(this.type()) << 1;
      value += (this.canExchange() ? 0 : 1);

      return radixConverter.convertFromDecimal(value);
    }
  };

  C.Hold = Hold;
})();

(function() {
  'use strict';

  var KeyButton = function() {
    this._configure = {
        interval1: 0.1,
        interval2: 0.02
    };
    this._prev = false;
    this._current = false;
    this._intervalDown = false;

    this._prevDate = null;
    this._currentInterval = -1;
  };

  KeyButton.prototype = {
    keyDown: function() {
      var currentDate;

      this._prev = this._current;
      this._current = true;

      if (this._prevDate != null) {
        currentDate = new Date();
        if (currentDate - this._prevDate >= this._currentInterval * 1000) {
          this._prevDate = currentDate;
          this._intervalDown = true;
          this._currentInterval = this._configure.interval2;
        } else {
          this._intervalDown = false;
        }
      } else {
        this._intervalDown = true;
        this._prevDate = new Date();
        this._currentInterval = this._configure.interval1;
      }
    },

    keyUp: function() {
      this._prev = this._current;
      this._current = false;
        this._intervalDown = false;
      this._prevDate = null;
    },

    state: function() {
      return {
        active: this._current,
        down: !this._prev && this._current,
        up: this._prev && !this._current,
        intervalDown: this._intervalDown
      }
    },

    configure: function(option) {
      this._configure = $.extend({
        interval1: 0.3,
        interval2: 0.1
      }, option);
    }
  };

  C.KeyButton = KeyButton;
})();

(function() {
  'use strict';

  var NextGenerator = function() {
    this.reset();
  };

  NextGenerator.Types = [
    C.CellType.I,
    C.CellType.J,
    C.CellType.L,
    C.CellType.O,
    C.CellType.S,
    C.CellType.T,
    C.CellType.Z
  ];

  NextGenerator.prototype = {
    next: function() {
      var index, type;

      if (this._currentSet.length == 0) {
        this._currentSet = NextGenerator.Types.concat();
      }

      index = C.Random.nextInt(this._currentSet.length);
      type = this._currentSet[index];
      this._currentSet.splice(index, 1);

      return type;
    },

    removeTypes: function(removeTypes) {
      this._currentSet = this._currentSet.filter(function(type) {
        return removeTypes.indexOf(type) === -1;
      });
    },

    reset: function() {
      this._currentSet = NextGenerator.Types.concat();
    }
  };

  C.NextGenerator = NextGenerator;
})();

(function() {
  'use strict';

  var NextsDeserializer = {
    deserialize: function(param) {
      var i, len
        , value
        , radixConverter = new C.RadixConverter(64)
        , types = [];

      for (i = 0, len = param.length; i < len; i++) {
        value = radixConverter.convertToDecimal(param[i]);
        types.push('' + parseInt(value >> 3));
        types.push('' + (value & 7)); // 7 = 0x000111
      }

      if (types.length > 0 && types[types.length - 1] === C.CellType.None) {
        types.pop();
      }

      return types;
    }
  };

  C.NextsDeserializer = NextsDeserializer;
})();

(function() {
  'use strict';

  var NextsSerializer = {
    serialize: function(types) {
      var i, len
        , value
        , result = ''
        , radixConverter = new C.RadixConverter(64);

      if (types.length % 2 != 0) {
        types.push(C.CellType.None);
      }

      for (i = 0, len = types.length; i < len; i += 2) {
        value = Number(types[i]) << 3;
        value += Number(types[i + 1]);
        result += radixConverter.convertFromDecimal(value);
      }

      return result;
    },
  };

  C.NextsSerializer = NextsSerializer;
})();

(function() {
  'use strict';

  var NextsVisibledDeserializer = {
    deserialize: function(param) {
      var radixConverter = new C.RadixConverter(64)
        , value = radixConverter.convertToDecimal(param)
        , visibled = [];

      visibled[0] = (value & 0x01) > 0;
      visibled[1] = (value & 0x02) > 0;
      visibled[2] = (value & 0x04) > 0;
      visibled[3] = (value & 0x08) > 0;
      visibled[4] = (value & 0x10) > 0;

      return visibled;
    }
  };

  C.NextsVisibledDeserializer = NextsVisibledDeserializer;
})();
(function() {
  'use strict';

  var NextsVisibledSerializer = {
    serialize: function(visibledValue) {
      var radixConverter = new C.RadixConverter(64)
        , value = 0;

      value += (visibledValue[0] ? 0x01 : 0);
      value += (visibledValue[1] ? 0x02 : 0);
      value += (visibledValue[2] ? 0x04 : 0);
      value += (visibledValue[3] ? 0x08 : 0);
      value += (visibledValue[4] ? 0x10 : 0);

      return radixConverter.convertFromDecimal(value);
    }
  };

  C.NextsVisibledSerializer = NextsVisibledSerializer;
})();
(function() {
  'use strict';

  var NextsVisibled = function() {
    this._visibled = [true, true, true, true, true];
  };

  NextsVisibled.prototype = {
    status: function() {
      return this._visibled.concat();
    },

    toggleVisible: function(index) {
      if (index < 0 || index >= 5) {
        throw new Error('out of bounds index(' + index + ')');
      }

      this._visibled[index] = !this._visibled[index];
    },

    serialize: function() {
      return C.NextsVisibledSerializer.serialize(this._visibled);
    },

    deserialize: function(param) {
      this._visibled = C.NextsVisibledDeserializer.deserialize(param);
    }
  };

  C.NextsVisibled = NextsVisibled;
})();

(function() {
  'use strict';

  var NextsVisibledSerializer = {
    serialize: function(visibledValue) {
      var radixConverter = new C.RadixConverter(64)
        , value = 0;

      value += (visibledValue[0] ? 0x01 : 0);
      value += (visibledValue[1] ? 0x02 : 0);
      value += (visibledValue[2] ? 0x04 : 0);
      value += (visibledValue[3] ? 0x08 : 0);
      value += (visibledValue[4] ? 0x10 : 0);

      return radixConverter.convertFromDecimal(value);
    }
  };

  C.NextsVisibledSerializer = NextsVisibledSerializer;
})();

(function() {
  'use strict';

  var NextsVisibledDeserializer = {
    deserialize: function(param) {
      var radixConverter = new C.RadixConverter(64)
        , value = radixConverter.convertToDecimal(param)
        , visibled = [];

      visibled[0] = (value & 0x01) > 0;
      visibled[1] = (value & 0x02) > 0;
      visibled[2] = (value & 0x04) > 0;
      visibled[3] = (value & 0x08) > 0;
      visibled[4] = (value & 0x10) > 0;

      return visibled;
    }
  };

  C.NextsVisibledDeserializer = NextsVisibledDeserializer;
})();

(function() {
  'use strict';

  var Nexts = function() {
    this._p = -1;
    this._types = [];
    this._typesFixed = [];
  };

  Nexts.prototype = {
    push: function(type) {
      this._types.push(type);
    },

    no: function(v) {
      if (v === undefined) {
        // get
        return this._p;
      } else {
        // set
        this._p = v;
      }
    },

    next: function() {
      this._p++;
      return this._types[this._p];
    },

    types: function(v) {
      if (v === undefined) {
        // get
        return this._types.concat();
      } else {
        // set
        this._types = v.concat();
        this._p = -1;
      }
    },

    setAndComplementTypes: function(types, prevTypes, generator) {
      var complementedTypes = []
        , mergeTypes = prevTypes.reverse().concat(types)
        , removeTypes
        , type
        , i, len
        , nextTypesSet

      this._typesFixed = types.map(function(type) {
        return type !== C.CellType.None;
      });

      while((nextTypesSet = this._nextTypesSet(mergeTypes)).length > 0) {
        generator.reset();
        removeTypes = nextTypesSet.filter(function(type) {
          return type !== C.CellType.None;
        });
        generator.removeTypes(removeTypes);

        for (i = 0, len = nextTypesSet.length; i < len; i++) {
          type = nextTypesSet[i];
          if (type === C.CellType.None) {
            type = generator.next();
          }

          complementedTypes.push(type);
        }

        mergeTypes = mergeTypes.slice(nextTypesSet.length);
      }

      this.types(complementedTypes.slice(prevTypes.length));
    },

    _nextTypesSet: function(types) {
      var i
        , len = types.length
        , type
        , typeSet = {};

      if (len > 7) {
        len = 7;
      }

      for (i = 0; i < len; i++) {
        type = types[i];
        if ((type in typeSet) && type !== C.CellType.None) {
          return types.slice(0, i);
        }
        typeSet[type] = true;
      }

      return types.slice(0, 7);
    },

    nextTypes: function() {
      var types = this._types.concat();
      types.splice(0, this._p + 1);
      return types;
    },

    nextTypesFixed: function() {
      var typesFixed = this._typesFixed.concat();
      typesFixed.splice(0, this._p + 1);
      return typesFixed;
    },

    length: function() {
      return this._types.length;
    },

    nextsLength: function() {
      return this._types.length - (this._p + 1);
    },

    typeAt: function(index, v) {
      var i, len
        , type
        , lastIndexOfNotNone = -1;

      if (v === undefined) {
        // get
        return this._types[index] || C.CellType.None;
      } else {
        // set
        this._types[index] = v;

        // 飛び飛びになっているかもしれないので間はNoneで埋める
        for (i = this._types.length - 1; i >= 0; i--) {
          type = this._types[i];
          if (type === undefined) {
            this._types[i] = C.CellType.None;
          } else if (type !== C.CellType.None && lastIndexOfNotNone === -1) {
            lastIndexOfNotNone = i;
          }
        }

        if (this._types.length !== lastIndexOfNotNone + 1) {
          // 末尾のNone要素を削除する
          this._types.length = lastIndexOfNotNone + 1;

          // 範囲外になるとまずいのでとりあえず初期化しておく
          this._p = -1;
        }
      }
    },

    insertAt: function(index, v) {
      this._types.splice(index, 0, C.CellType.None);
      this.typeAt(index, v);
    },

    deleteAt: function(index) {
      this._types.splice(index, 1);
    },

    serialize: function() {
      return C.NextsSerializer.serialize(this._types);
    },

    deserialize: function(param) {
      var types = C.NextsDeserializer.deserialize(param);

      this._p = -1;
      this.types(types);
    }
  };

  C.Nexts = Nexts;
})();

(function() {
  var RadixConverter = function (base) {
    this._base = base;
  };

  RadixConverter._BaseChars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_';
  RadixConverter._BaseChars2NumMap = (function() {
    var c
      , i
      , len
      , map = {};

    for (i = 0, len = RadixConverter._BaseChars.length; i < len; i++) {
      c = RadixConverter._BaseChars.charAt(i);
      map[c] = i;
    }

    return map;
  })();

  RadixConverter.prototype = {
    convertFromDecimal: function(decimal) {
      var str = ''
        , p
        , q;
      do {
        p = Math.floor(decimal / this._base);
        q = decimal % this._base;
        str = RadixConverter._BaseChars.charAt(q) + str;
        decimal = p;
      } while (decimal > 0);

      return str;
    },

    convertToDecimal: function(str) {
      var sum = 0
        , i
        , len;
      for (i = 0, len = str.length; i < len; i++) {
        if (i !== 0) {
          sum *= this._base;
        }
        var c = str.charAt(i);
        sum += RadixConverter._BaseChars2NumMap[c];
      }
      return sum;
    }
  };

  C.RadixConverter = RadixConverter;
})();

(function() {
  'use strict';

  var Steps = function() {
    this._p = -1;
    this._steps = [];
  };

  Steps.GroupMaxBit = 52; // javascriptで問題なく扱える整数の最大値は53bit未満

  Steps.prototype = {
    pushTetrimino: function(tetrimino, spinType, canHardDrop) {
      this._steps.push(this._makeTetriminoStep(tetrimino, spinType, canHardDrop));
    },

    _makeTetriminoStep: function(tetrimino, spinType, canHardDrop) {
      var step
        , isTSpin = false;

      if (spinType === C.Constants.SpinType.TSpin || spinType === C.Constants.SpinType.TSpinMini) {
        isTSpin = true;
      }

      // ハードドロップ可能な条件の場合でもTSpinの場合はソフトドロップとする
      if (canHardDrop && !isTSpin) {
        return new C.Step({
          stepType: C.Constants.StepType.HardDrop,
          pos: tetrimino.pivot().x,
          direction: tetrimino.direction(),
        });
      } else {
        return new C.Step({
          stepType: C.Constants.StepType.SoftDrop,
          pivot: tetrimino.pivot(),
          direction: tetrimino.direction(),
          isTSpin: isTSpin
        });
      }
    },

    pushHold: function() {
      this._steps.push(this._makeHoldStep());
    },

    _makeHoldStep: function(type) {
      return new C.Step({
        stepType: C.Constants.StepType.Hold,
      });
    },

    steps: function() {
      return this._steps;
    },

    length: function() {
      return this._steps.length;
    },

    serialize: function() {
      var i, len
        , steps = this.steps()
        , step
        , value4Step
        , totalBit = 0
        , value = 0
        , result = ''
        , radixConverter = new C.RadixConverter(64);

      len = this._steps.length;
      if (len === 0) {
        return '';
      }

      for (i = 0; i < len; i++) {
        step = this._steps[i];

        if (step.stepType === C.Constants.StepType.Hold) {
          value4Step = this._serialize4Hold();
        } else if (step.stepType === C.Constants.StepType.Ojama) {
          throw new Error('not implemented stepType(' + step.stepType + ')');
        } else if (step.stepType === C.Constants.StepType.HardDrop){
          value4Step = this._serialize4HardDrop(step);
        } else if (step.stepType === C.Constants.StepType.SoftDrop) {
          value4Step = this._serialize4SoftDrop(step);
        } else {
          throw new Error('invalid stepType(' + step.stepType + ')');
        }

        if (totalBit + value4Step.bitNum > Steps.GroupMaxBit) {
          // Steps.GroupMaxBitのbit数に足りない分は0を埋める
          value = this._shiftBit(value, (Steps.GroupMaxBit - totalBit));

          result += radixConverter.convertFromDecimal(value);
          value = value4Step.value;
          totalBit = value4Step.bitNum;
        } else {
          value = this._shiftBit(value, value4Step.bitNum);
          value += value4Step.value;
          totalBit += value4Step.bitNum;
        }
      }

      // 残ったグループを処理
      value = this._shiftBit(value, (Steps.GroupMaxBit - totalBit));
      result += radixConverter.convertFromDecimal(value);

      return result;
    },

    _shiftBit: function(value, shiftNum) {
      // bit演算は32bitまでしか使用できないので自力でbitシフトさせる
      if (shiftNum >= 0) {
        while (shiftNum > 0) {
          value *= 2;
          shiftNum--;
        }
      } else {
        while (shiftNum < 0) {
          value /= 2;
          shiftNum++
        }
      }

      return value;
    },

    _serialize4Hold: function() {
      return {
        bitNum: 4,
        value: Number(C.Constants.StepType.Hold)
      };
    },

    _serialize4HardDrop: function(step) {
      var bitNum
        , value
        , directionValue;

      switch (step.direction) {
        case C.Direction.Up   : directionValue = 0; break;
        case C.Direction.Left : directionValue = 1; break;
        case C.Direction.Down : directionValue = 2; break;
        case C.Direction.Right: directionValue = 3; break;
      }

      bitNum = 10;

      // ステップ種別
      value = Number(step.stepType);

      // 横位置
      // +1するのは、右向きのIミノの場合負値をとることがあり都合が悪いため
      value <<= 4;
      value += (step.pos + 1);

      // 向き
      value <<= 2;
      value += directionValue;

      return {
        bitNum: bitNum,
        value: value
      };
    },

    _serialize4SoftDrop: function(step) {
      var bitNum
        , value
        , directionValue;

      switch (step.direction) {
        case C.Direction.Up   : directionValue = 0; break;
        case C.Direction.Left : directionValue = 1; break;
        case C.Direction.Down : directionValue = 2; break;
        case C.Direction.Right: directionValue = 3; break;
      }

      // ステップ種別
      value = Number(step.stepType);

      bitNum = 15;

      // 座標
      // Xを+1するのは、右向きのIミノの場合負値をとることがあり都合が悪いため
      value <<= 8;
      value += (step.pivot.y * C.Field.DEFAULT_WIDTH + step.pivot.x + 1);

      // 向き
      value <<= 2;
      value += directionValue;

      // 向き
      value <<= 1;
      value += step.isTSpin ? 1 : 0;

      return {
        bitNum: bitNum,
        value: value
      };
    },

    deserialize: function(param) {
      var i, len
        , value
        , radixConverter = new C.RadixConverter(64)
        , restBit
        , stepType
        , step
        , steps = [];

      while (param.length > 0) {
        value = radixConverter.convertToDecimal(param.substring(0, 9));
        param = param.substring(9);
        restBit = 52;

        while(restBit > 0) {
          stepType = String(this._shiftBit(value, -(restBit - 4)) & 0xF);
          if (stepType === C.Constants.StepType.Hold) {
            step = this._deserialize4Hold();
            restBit -= 4;
          } else if (stepType === C.Constants.StepType.Ojama) {
            throw new Error('not implemented stepType(' + stepType + ')');
          } else if (stepType === C.Constants.StepType.HardDrop) {
            step = this._deserialize4HardDrop(value, restBit);
            restBit -= 10;
          } else if (stepType === C.Constants.StepType.SoftDrop) {
            step = this._deserialize4SoftDrop(value, restBit);
            restBit -= 15;
          } else if (stepType === C.Constants.StepType.None) {
            break;
          } else {
            throw new Error('invalid stepType(' + stepType + ')');
          }

          steps.push(step);
        }
      }

      this._steps = steps;
    },

    _deserialize4Hold: function() {
      return {
        stepType: C.Constants.StepType.Hold,
      };
    },

    _deserialize4HardDrop: function(value, restBit) {
      var shiftedValue = this._shiftBit(value, -(restBit - 10)) & 0x3FF
        , stepType
        , pos
        , directionValue
        , directions = [ C.Direction.Up, C.Direction.Left, C.Direction.Down, C.Direction.Right ];

      // ここまでビット数が確定するので、対象となるビット列を取り出す
      stepType = C.Constants.StepType.HardDrop;
      pos = ((shiftedValue >> 2) & 0xF) - 1;
      directionValue = shiftedValue & 0x3

      return {
        stepType: stepType,
        pos: pos,
        direction: directions[directionValue]
      };
    },

    _deserialize4SoftDrop: function(value, restBit) {
        var shiftedValue = this._shiftBit(value, -(restBit - 15)) & 0x7FF
        , stepType
        , pos
        , directionValue
        , directions = [ C.Direction.Up, C.Direction.Left, C.Direction.Down, C.Direction.Right ]
        , isTSpin;

      stepType = C.Constants.StepType.SoftDrop;
      pos = ((shiftedValue >> 3) & 0xFF) -1;
      directionValue = (shiftedValue >> 1) & 0x3
      isTSpin = (shiftedValue & 0x1) == 1;

      return {
        stepType: stepType,
        pivot: { x: pos % C.Field.DEFAULT_WIDTH, y: Math.floor(pos / C.Field.DEFAULT_WIDTH) },
        direction: directions[directionValue],
        isTSpin: isTSpin
      };
    },

    forward: function() {
      var length = this.length();
      if (this._p === length) {
        return null;
      } else if (this._p === length - 1) {
        ++this._p;
        return null;
      } else {
        return this._steps[++this._p];
      }
    },

    back: function() {
      if (this._p < 0) {
        return null;
      } else if (this._p === 0) {
        --this._p;
        return null;
      } else {
        return this._steps[--this._p];
      }
    },

    forgetAfter: function() {
      this._steps.length = (this._p + 1);
    }
  };

  C.Steps = Steps;
})();

(function() {
  'use strict';

  var Step = function(data) {
    var p;
    for (p in data) {
      this[p] = data[p];
    }
  };

  C.Step = Step;
})();

(function() {
  'use strict';

  var TetriminoI = function(pivot, direction) {
    C.Tetrimino.call(this, C.CellType.I, pivot, direction);
  };

  TetriminoI._Shape = {};
  TetriminoI._Shape[C.Direction.Up] = [
    { x:  0, y: 0 },
    { x: -1, y: 0 },
    { x:  1, y: 0 },
    { x:  2, y: 0 }
  ];

  TetriminoI._Shape[C.Direction.Left] = [
    { x: 0, y: -1 },
    { x: 0, y: -2 },
    { x: 0, y:  0 },
    { x: 0, y:  1 }
  ];

  TetriminoI._Shape[C.Direction.Down] = [
    { x:  1, y: -1 },
    { x:  2, y: -1 },
    { x:  0, y: -1 },
    { x: -1, y: -1 }
  ];

  TetriminoI._Shape[C.Direction.Right] = [
    { x: 1, y:  0 },
    { x: 1, y:  1 },
    { x: 1, y: -1 },
    { x: 1, y: -2 }
  ];

  TetriminoI._SuperRotations = (function() {

    var srss = {
      left: {},
      right: {}
    };

    srss.left[C.Direction.Up] = [
      { x: -1, y:  0 },
      { x:  2, y:  0 },
      { x: -1, y:  2 },
      { x:  2, y: -1 }
    ];

    srss.left[C.Direction.Left] = [
      { x:  1, y:  0 },
      { x: -2, y:  0 },
      { x: -2, y: -1 },
      { x:  1, y:  2 }
    ];

    srss.left[C.Direction.Down] = [
      { x:  1, y:  0 },
      { x: -2, y:  0 },
      { x:  1, y: -2 },
      { x: -2, y:  1 }
    ];

    srss.left[C.Direction.Right] = [
      { x:  2, y:  0 },
      { x: -1, y:  0 },
      { x:  2, y:  1 },
      { x: -1, y: -2 }
    ];

    srss.right[C.Direction.Up] = [
      { x: -2, y:  0 },
      { x:  1, y:  0 },
      { x: -2, y: -1 },
      { x:  1, y:  2 }
    ];

    srss.right[C.Direction.Left] = [
      { x: -2, y:  0 },
      { x:  1, y:  0 },
      { x:  1, y: -2 },
      { x: -2, y:  1 }
    ];

    srss.right[C.Direction.Down] = [
      { x:  2, y:  0 },
      { x: -1, y:  0 },
      { x:  2, y:  1 },
      { x: -1, y: -2 }
    ];

    srss.right[C.Direction.Right] = [
      { x: -1, y:  0 },
      { x:  2, y:  0 },
      { x: -1, y:  2 },
      { x:  2, y: -1 }
    ];

    return srss;
  })();

  TetriminoI.prototype = $.extend({}, C.Tetrimino.prototype, {
    Shape: function() {
      return TetriminoI._Shape[this.direction()];
    },

    SuperRotationsLeft: function() {
      return TetriminoI._SuperRotations.left[this.direction()];
    },

    SuperRotationsRight: function() {
      return TetriminoI._SuperRotations.right[this.direction()];
    }
  });

  C.TetriminoI = TetriminoI;
})();

(function() {
  'use strict';

  var TetriminoJ = function(pivot, direction) {
    C.Tetrimino.call(this, C.CellType.J, pivot, direction);
  };

  TetriminoJ._Shape = {};
  TetriminoJ._Shape[C.Direction.Up] = [
    { x:  0, y: 0 },
    { x: -1, y: 0 },
    { x:  1, y: 0 },
    { x: -1, y: 1 }
  ];

  TetriminoJ._Shape[C.Direction.Left] = [
    { x:  0, y:  0 },
    { x:  0, y: -1 },
    { x:  0, y:  1 },
    { x: -1, y: -1 }
  ];

  TetriminoJ._Shape[C.Direction.Down] = [
    { x:  0, y:  0 },
    { x:  1, y:  0 },
    { x: -1, y:  0 },
    { x:  1, y: -1 }
  ];

  TetriminoJ._Shape[C.Direction.Right] = [
    { x: 0, y:  0 },
    { x: 0, y:  1 },
    { x: 0, y: -1 },
    { x: 1, y:  1 }
  ];

  TetriminoJ.prototype = $.extend({}, C.Tetrimino.prototype, {
    Shape: function() {
      return TetriminoJ._Shape[this.direction()];
    }
  });

  C.TetriminoJ = TetriminoJ;
})();

(function() {
  'use strict';

  var TetriminoL = function(pivot, direction) {
    C.Tetrimino.call(this, C.CellType.L, pivot, direction);
  };

  TetriminoL._Shape = {};
  TetriminoL._Shape[C.Direction.Up] = [
    { x:  0, y: 0 },
    { x: -1, y: 0 },
    { x:  1, y: 0 },
    { x:  1, y: 1 }
  ];

  TetriminoL._Shape[C.Direction.Left] = [
    { x:  0, y:  0 },
    { x:  0, y: -1 },
    { x:  0, y:  1 },
    { x: -1, y:  1 }
  ];

  TetriminoL._Shape[C.Direction.Down] = [
    { x:  0, y:  0 },
    { x:  1, y:  0 },
    { x: -1, y:  0 },
    { x: -1, y: -1 }
  ];

  TetriminoL._Shape[C.Direction.Right] = [
    { x: 0, y:  0 },
    { x: 0, y:  1 },
    { x: 0, y: -1 },
    { x: 1, y: -1 }
  ];

  TetriminoL.prototype = $.extend({}, C.Tetrimino.prototype, {
    Shape: function() {
      return TetriminoL._Shape[this.direction()];
    }
  });

  C.TetriminoL = TetriminoL;
})();

(function() {
  'use strict';

  var TetriminoO = function(pivot, direction) {
    C.Tetrimino.call(this, C.CellType.O, pivot, direction);
  };

  TetriminoO._Shape = {};
  TetriminoO._Shape[C.Direction.Up] = [
    { x: 0, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
    { x: 1, y: 0 }
  ];

  TetriminoO._Shape[C.Direction.Left] = TetriminoO._Shape[C.Direction.Up];
  TetriminoO._Shape[C.Direction.Down] = TetriminoO._Shape[C.Direction.Up];
  TetriminoO._Shape[C.Direction.Right] = TetriminoO._Shape[C.Direction.Up];

  TetriminoO.prototype = $.extend({}, C.Tetrimino.prototype, {
    Shape: function() {
      return TetriminoO._Shape[this.direction()];
    }
  });

  C.TetriminoO = TetriminoO;
})();

(function() {
  'use strict';

  var TetriminoS = function(pivot, direction) {
    C.Tetrimino.call(this, C.CellType.S, pivot, direction);
  };

  TetriminoS._Shape = {};
  TetriminoS._Shape[C.Direction.Up] = [
    { x:  0, y: 0 },
    { x: -1, y: 0 },
    { x:  0, y: 1 },
    { x:  1, y: 1 }
  ];

  TetriminoS._Shape[C.Direction.Left] = [
    { x:  0, y:  0 },
    { x:  0, y: -1 },
    { x: -1, y:  0 },
    { x: -1, y:  1 }
  ];

  TetriminoS._Shape[C.Direction.Down] = [
    { x:  0, y:  0 },
    { x:  1, y:  0 },
    { x:  0, y: -1 },
    { x: -1, y: -1 }
  ];

  TetriminoS._Shape[C.Direction.Right] = [
    { x: 0, y:  0 },
    { x: 0, y:  1 },
    { x: 1, y:  0 },
    { x: 1, y: -1 }
  ];

  TetriminoS.prototype = $.extend({}, C.Tetrimino.prototype, {
    Shape: function() {
      return TetriminoS._Shape[this.direction()];
    }
  });

  C.TetriminoS = TetriminoS;
})();

(function() {
  'use strict';

  var TetriminoT = function(pivot, direction) {
    C.Tetrimino.call(this, C.CellType.T, pivot, direction);
  };

  TetriminoT._Shape = {};
  TetriminoT._Shape[C.Direction.Up] = [
    { x:  0, y: 0 },
    { x: -1, y: 0 },
    { x:  1, y: 0 },
    { x:  0, y: 1 }
  ];

  TetriminoT._Shape[C.Direction.Left] = [
    { x:  0, y:  0 },
    { x: -1, y:  0 },
    { x:  0, y:  1 },
    { x:  0, y: -1 }
  ];

  TetriminoT._Shape[C.Direction.Down] = [
    { x:  0, y:  0 },
    { x: -1, y:  0 },
    { x:  1, y:  0 },
    { x:  0, y: -1 }
  ];

  TetriminoT._Shape[C.Direction.Right] = [
    { x: 0, y:  0 },
    { x: 1, y:  0 },
    { x: 0, y:  1 },
    { x: 0, y: -1 }
  ];

  TetriminoT.prototype = $.extend({}, C.Tetrimino.prototype, {
    Shape: function() {
      return TetriminoT._Shape[this.direction()];
    },

    turnLeftIfPossible: function(field, specialInfo) {
      if (!C.Tetrimino.prototype.turnLeftIfPossible.apply(this, arguments)) {
        return false;
      }

      if (this._metTSpin(field)) {
        specialInfo.spinType = C.Constants.SpinType.TSpin;
      }

      return true;
    },

    turnLeftSuperlyIfPossible: function(field, specialInfo) {
      if (!C.Tetrimino.prototype.turnLeftSuperlyIfPossible.apply(this, arguments)) {
        return false;
      }

      if (this._metTSpin(field)) {
        if (this.canTSpin(field)) {
          specialInfo.spinType = C.Constants.SpinType.TSpin;
        } else {
          specialInfo.spinType = C.Constants.SpinType.TSpinMini;
        }
      }

      return true;
    },

    turnRightIfPossible: function(field, specialInfo) {
      if (!C.Tetrimino.prototype.turnRightIfPossible.apply(this, arguments)) {
        return false;
      }

      if (this._metTSpin(field)) {
        specialInfo.spinType = C.Constants.SpinType.TSpin;
      }

      return true;
    },

    turnRightSuperlyIfPossible: function(field, specialInfo) {
      if (!C.Tetrimino.prototype.turnRightSuperlyIfPossible.apply(this, arguments)) {
        return false;
      }

      if (this._metTSpin(field)) {
        if (this.canTSpin(field)) {
          specialInfo.spinType = C.Constants.SpinType.TSpin;
        } else {
          specialInfo.spinType = C.Constants.SpinType.TSpinMini;
        }
      }

      return true;
    },

    _metTSpin: function(field) {
      var pivot = this.pivot()
        , count = 0;

      if (C.CellType.isBlock(field.type(pivot.x - 1, pivot.y - 1))) count++;
      if (C.CellType.isBlock(field.type(pivot.x + 1, pivot.y - 1))) count++;
      if (C.CellType.isBlock(field.type(pivot.x - 1, pivot.y + 1))) count++;
      if (C.CellType.isBlock(field.type(pivot.x + 1, pivot.y + 1))) count++;

      return count >= 3;
    },

    canTSpin: function(field) {
      var canTSpin
      this.turnRight();

      canTSpin = !this._isOverwrap(field);
      this.turnLeft();

      return canTSpin;
    }
  });

  C.TetriminoT = TetriminoT;
})();

(function() {
  'use strict';

  var TetriminoZ = function(pivot, direction) {
    C.Tetrimino.call(this, C.CellType.Z, pivot, direction);
  };

  TetriminoZ._Shape = {};
  TetriminoZ._Shape[C.Direction.Up] = [
    { x:  0, y: 0 },
    { x:  1, y: 0 },
    { x:  0, y: 1 },
    { x: -1, y: 1 }
  ];

  TetriminoZ._Shape[C.Direction.Left] = [
    { x:  0, y:  0 },
    { x:  0, y:  1 },
    { x: -1, y:  0 },
    { x: -1, y: -1 }
  ];

  TetriminoZ._Shape[C.Direction.Down] = [
    { x:  0, y:  0 },
    { x: -1, y:  0 },
    { x:  0, y: -1 },
    { x:  1, y: -1 }
  ];

  TetriminoZ._Shape[C.Direction.Right] = [
    { x: 0, y:  0 },
    { x: 0, y: -1 },
    { x: 1, y:  0 },
    { x: 1, y:  1 }
  ];

  TetriminoZ.prototype = $.extend({}, C.Tetrimino.prototype, {
    Shape: function() {
      return TetriminoZ._Shape[this.direction()];
    }
  });

  C.TetriminoZ = TetriminoZ;
})();

(function() {
  'use strict';

  var UrlParameter = {
    parse: function(url) {
      var params = {}
        , urlParts
        , paramsElements
        , paramElement
        , i
        , len;

      urlParts = url.split('?');
      if (urlParts.length < 2) {
        return params
      }

      paramsElements = urlParts[1].split('&');
      for (i = 0, len = paramsElements.length; i < len; i++) {
        paramElement = paramsElements[i].split('=');
        params[paramElement[0]] = paramElement[1];
      }

      return params;
    }
  };

  C.UrlParameter = UrlParameter;
})();

(function() {
  'use strict';

  var StoreBase = $.extend({
    addListener: function(eventType, callback) {
      this.on(eventType, callback);
    },

    removeListener: function(eventType, callback) {
      this.removeListener(eventType, callback);
    },
  }, EventEmitter.prototype);

  C.StoreBase = StoreBase;
})();

(function() {
  'use strict';

  var ConfigStore = $.extend({
    _config: null,
    _modeValues: [
      'simu',
      'replay',
      'edit',
    ],

    storeConfig: function(action) {
      this._config = action.config;
      this.emit(C.Constants.Event.Change);
    },

    config: function() {
      return this._config;
    },

    keyConfig: function(mode) {
      var modeName = this._modeValues[mode];

      if (this._config && (modeName in this._config.key)) {
        return this._reverseKeyValue(this._config.key[modeName]);
      } else {
        return null;
      }
    },

    _reverseKeyValue: function(obj) {
      var valueKey = {}
        , key;

      // バージョンの変わり目でキー重複も考えられるが
      // その場合は片方だけ有効になる
      for (key in obj) {
        valueKey[obj[key]] = key;
      }

      return valueKey;
    },

    defaultConfig: function(version) {
      return {
        version: C.Constants.ConfigVersion,

        key: {
          edit: {
            'cancel': 'esc',
            'changeModeToSimu': 'num_1',
            'clear': '',
            'configure': '?',
            'createUrlParameters': 'u',
            'fieldUp': 'shift + up',
            'fieldDown': 'shift + down',
            'nextUp': 'ctrl + up',
            'nextDown': 'ctrl + down',
            'selectTypeI': '1',
            'selectTypeJ': '2',
            'selectTypeL': '3',
            'selectTypeO': '4',
            'selectTypeS': '5',
            'selectTypeT': '6',
            'selectTypeZ': '7',
            'selectTypeOjama': '8',
            'selectTypeNone': '9',
            'setHold': 'h',
          },

          simu: {
            'backToEditMode': 'esc',
            'hardDrop': 'up',
            'leftMove': 'left',
            'softDrop': 'down',
            'rightMove': 'right',
            'turnLeft': 'z',
            'turnRight': 'x',
            'hold': 'c',
            'retry': 'r',
            'superRetry': 'shift + r',
            'back': 'b',
            'forward': 'shift + b',
            'clear': '',
            'createUrlParameters': 'u',
            'changeModeToReplay': 'num_1',
            'changeModeToEdit': 'num_2',
            'configure': '?'
          },

          replay: {
            'cancel': 'esc',
            'forward': 'right',
            'back': 'left',
            'backToHead': 'r',
            'createUrlParameters': 'u',
            'changeModeToSimu': 'num_1',
            'configure': '?'
          },
        }
      };
    },

    cancel: function(action) {
      this.emit(C.Constants.Event.Cancel);
    },

    addChangeListener: function(callback) {
      this.addListener(C.Constants.Event.Change, callback);
    },

    removeChangeListener: function(callback) {
      this.removeListener(C.Constants.Event.Change, callback);
    },

    addCancelListener: function(callback) {
      this.addListener(C.Constants.Event.Cancel, callback);
    },

    removeCancelListener: function(callback) {
      this.removeListener(C.Constants.Event.Cancel, callback);
    }
  }, C.StoreBase);

  C.AppDispatcher.register(function(payload) {
    var action = payload.action;

    switch (action.actionType) {
      case C.Constants.Action.Config.StoreConfig:
        ConfigStore.storeConfig(action);
        break;
      case C.Constants.Action.Config.CancelConfig:
        ConfigStore.cancel(action);
        break;
    }

    return true;
  });

  C.ConfigStore = ConfigStore;
})();

(function() {
  'use strict';

  var ControllerStore = $.extend({

    _ctrl: false,
    _cmd: false,
    _shift: false,

    _keyButtons: (function() {
        var keys = {}
          , i, len;

        for (i = 0, len = C.Constants.KeyNames.length; i < len; i++) {
          keys[C.Constants.KeyNames[i]] = new C.KeyButton();
        }
        return keys;
      })(),

    addKeyListener: function(callback) {
      this.addListener(C.Constants.Event.Key, callback);
    },

    removeKeyListener: function(callback) {
      this.removeListener(C.Constants.Event.Key, callback);
    },

    keyUp: function(action) {
      var keyButton = this._keyButtons[action.keyName]
        , state;

      this._updateSpecialKeys(action, false);

      keyButton.keyUp();
      state = keyButton.state();
      state.keyName = action.keyName;

      this.emit(C.Constants.Event.Key, state);
    },

    keyDown: function(action) {
      var keyButton = this._keyButtons[action.keyName]
        , state;

      this._updateSpecialKeys(action, true);

      keyButton.keyDown();
      state = keyButton.state();
      state.keyName = this._makeComboKeyName(action.keyName);

      this.emit(C.Constants.Event.Key, state);
    },

    _updateSpecialKeys: function(action, isDown) {
      // 複数ある修飾キーを同時押下した場合、一つのkeyUpで押下状態がクリアされる
      // ことになるがあまり問題にならないので放置する

      switch (action.keyName) {
        case 'shift':
          this._shift = isDown;
          break;
        case 'ctrl':
          this._ctrl = isDown;
          break;
        case 'cmd':
          this._cmd = isDown;
          break;
      }
    },

    _makeComboKeyName: function(keyName) {
      var keys = [];
      if (keyName != 'ctrl' && this._ctrl) {
        keys.push('ctrl');
      }

      if (keyName != 'shift' && this._shift && $.inArray(keyName, C.Constants.ShiftedKeys) === -1) {
        keys.push('shift');
      }

      if (keyName != 'cmd' && this._cmd) {
        keys.push('cmd');
      }

      keys.push(keyName);
      return keys.join(' + ');
    }
  }, C.StoreBase);

  C.AppDispatcher.register(function(payload) {
    var action = payload.action;

    switch (action.actionType) {
      case C.Constants.Action.Controller.KeyUp:
        ControllerStore.keyUp(action);
        break;
      case C.Constants.Action.Controller.KeyDown:
        ControllerStore.keyDown(action);
        break;
      default:
        break;
    }

    return true;
  });

  C.ControllerStore = ControllerStore;
})();

(function() {
  'use strict';

  var EditStore = $.extend({
    _initialized: false,
    _context: null,
    _field: new C.Field(),
    _hold: new C.Hold(),
    _nextIndex: 0,
    _nexts: new C.Nexts(), _prevs: new C.Nexts(),
    _nextGenerator: new C.NextGenerator(),
    _nextsVisibled: new C.NextsVisibled(),
    _selectedType: C.CellType.I,
    _urlParameters: '',

    initialize: function(action, force) {
      if (this._initialized && !action.context.force) {
        this._context.before = action.context.before;
        return;
      }

      this._initialized = true;
      this._context = action.context;
      this._nextsVisibled.deserialize(this._context.nextsVisibled);

      this._init(action.context);
      this.emit(C.Constants.Event.Change);
    },

    _init: function(context) {
      this._field = new C.Field(),
      this._nextIndex = 0,
      this._hold = new C.Hold(),
      this._nexts = new C.Nexts(),
      this._prevs = new C.Nexts(),
      this._nextGenerator = new C.NextGenerator(),

      this._field.deserialize(context.field);
      this._hold.deserialize(context.hold);
      this._nexts.deserialize(context.nexts);
      this._prevs.deserialize(context.prevs);
    },

    context: function() {
      return this._context;
    },

    fieldTypes: function() {
      return this._field.innerTypes();
    },

    holdType: function() {
      return this._hold.type();
    },

    nexts: function() {
      return {
        prevs: this._prevs.types().slice(0, 6),
        nexts: this._nexts.types(),
        index: 0
      }
    },

    NextIndex: function() {
      return this._nextIndex;
    },

    canHold: function() {
      return this._hold.canExchange();
    },

    selectedType: function() {
      return this._selectedType;
    },

    urlParameters: function() {
      return this._urlParameters;
    },

    createUrlParameters: function(action) {
      var parameters = []
        , f = this._field.serialize()
        , h = this._hold.serialize()
        , ns = this._nexts.serialize()
        , nv = this._nextsVisibled.serialize()
        , ps = this._prevs.serialize();

      if (!!f) {
        parameters.push('f=' + f);
      }

      if (!!ns) {
        parameters.push('ns=' + ns);
      }

      if (!!nv && nv != 'v') {
        parameters.push('nv=' + nv);
      }

      if (!!ps) {
        parameters.push('ps=' + ps);
      }

      if (!!h) {
        parameters.push('h=' + h);
      }

      parameters.push('v=' + C.Constants.Version);

      this._urlParameters = parameters.join('&');
      this.emit(C.Constants.Event.SetUrl);
    },

    cancel: function(action) {
      var mode = C.Constants.Mode.Simu
      this.emit(C.Constants.Event.ChangeMode, mode, {
        before: C.Constants.Mode.Edit
      });
    },

    changeModeToSimu: function(action) {
      var mode = C.Constants.Mode.Simu

      var params = {
        before: C.Constants.Mode.Edit,
        field: this._field.serialize(),
        force: true,
        hold: this._hold.serialize(),
        nexts: C.NextsSerializer.serialize(this._nexts.types()),
        nextsVisibled: this._nextsVisibled.serialize(),
        prevs: C.NextsSerializer.serialize(this._prevs.types()),
      };
      this.emit(C.Constants.Event.ChangeMode, mode, params);
    },

    clear: function(action) {
      var mode = C.Constants.Mode.Edit
        , params = {
        force: true,
        field: '',
        hold: '',
        nexts: '',
        nextsVisibled: this._nextsVisibled.serialize(),
        prevs: ''
      };

      this.emit(C.Constants.Event.ChangeMode, mode, params);
    },

    beginSetCell: function(action) {
      this._setCell(action.x, action.y, this._selectedType);
      this.emit(C.Constants.Event.Change);
    },

    setCell: function(action) {
      this._setCell(action.x, action.y, this._selectedType);
      this.emit(C.Constants.Event.Change);
    },

    _setCell: function(x, y, type) {
      this._field.type(x, y, type);
    },

    endSetCell: function(action) {
      this.emit(C.Constants.Event.Change);
    },

    setHold: function(action) {
      var selectedType = this._selectedType;
      if (selectedType === C.CellType.Ojama) {
        selectedType = C.CellType.None;
      }

      if (selectedType === C.CellType.None) {
        this._hold.type(C.CellType.None);
        this._hold.release();
      } else if (this._hold.type() === C.CellType.None) {
        this._hold.type(selectedType);
      } else if (this._hold.type() !== selectedType) {
        this._hold.type(selectedType);
      } else if (this._hold.canExchange()) {
        this._hold.exchange(selectedType);
      } else {
        this._hold.type(C.CellType.None);
        this._hold.release();
      }

      this.emit(C.Constants.Event.Change);
    },

    backNext: function(action) {
      if (this._nextIndex < -5) {
        return;
      }
      this._nextIndex--;
      this.emit(C.Constants.Event.Change);
    },

    forwardNext: function(action) {
      this._nextIndex++;
      this.emit(C.Constants.Event.Change);
    },

    deleteNext: function(action) {
      this._nexts.deleteAt(action.index);
      this.emit(C.Constants.Event.Change);
    },

    insertNext: function(action) {
      this._nexts.insertAt(action.index, C.CellType.None);
      this.emit(C.Constants.Event.Change);
    },

    setNext: function(action) {
      var selectedType = this._selectedType;
      if (selectedType === C.CellType.Ojama) {
        selectedType = C.CellType.None;
      }

      if (action.index < 0) {
        this._prevs.typeAt(-(action.index + 1), selectedType);
      } else {
        this._nexts.typeAt(action.index, selectedType);
      }

      this.emit(C.Constants.Event.Change);
    },

    buildDownField: function(action) {
      var types = this._field.types();
      types.splice(0, 1);
      types.push(types[0].map(function() {
        return C.CellType.None;
      }));
      this._field.types(types);

      this.emit(C.Constants.Event.Change);
    },

    buildUpField: function(action) {
      var types = this._field.types();
      types.splice(types.length - 1, 1);
      types.unshift(types[0].map(function() {
        return C.CellType.Ojama;
      }));
      this._field.types(types);

      this.emit(C.Constants.Event.Change);
    },

    selectType: function(action) {
      this._selectedType = action.type;
      this.emit(C.Constants.Event.Change);
    },

    addChangeListener: function(callback) {
      this.addListener(C.Constants.Event.Change, callback);
    },

    removeChangeListener: function(callback) {
      this.removeListener(C.Constants.Event.Change, callback);
    },

    addSetUrlListener: function(callback) {
      this.addListener(C.Constants.Event.SetUrl, callback);
    },

    removeSetUrlListener: function(callback) {
      this.removeListener(C.Constants.Event.SetUrl, callback);
    },

    addChangeModeListener: function(callback) {
      this.addListener(C.Constants.Event.ChangeMode, callback);
    },

    removeChangeModeListener: function(callback) {
      this.removeListener(C.Constants.Event.ChangeMode, callback);
    },
  }, C.StoreBase);

  C.AppDispatcher.register(function(payload) {
    var action = payload.action;

    switch (action.actionType) {
      case C.Constants.Action.Edit.Initialize:
        EditStore.initialize(action);
        break;
      case C.Constants.Action.Edit.BackNext:
        EditStore.backNext(action);
        break;
      case C.Constants.Action.Edit.BeginSetCell:
        EditStore.beginSetCell(action);
        break;
      case C.Constants.Action.Edit.BuildDownField:
        EditStore.buildDownField(action);
        break;
      case C.Constants.Action.Edit.BuildUpField:
        EditStore.buildUpField(action);
        break;
      case C.Constants.Action.Edit.Cancel:
        EditStore.cancel(action);
        break;
      case C.Constants.Action.Edit.Clear:
        EditStore.clear(action);
        break;
      case C.Constants.Action.Edit.CreateUrlParameters:
        EditStore.createUrlParameters(action);
        break;
      case C.Constants.Action.Edit.ChangeModeToSimu:
        EditStore.changeModeToSimu(action);
        break;
      case C.Constants.Action.Edit.DeleteNext:
        EditStore.deleteNext(action);
        break;
      case C.Constants.Action.Edit.EndSetCell:
        EditStore.endSetCell(action);
        break;
      case C.Constants.Action.Edit.ForwardNext:
        EditStore.forwardNext(action);
        break;
      case C.Constants.Action.Edit.InsertNext:
        EditStore.insertNext(action);
        break;
      case C.Constants.Action.Edit.SelectType:
        EditStore.selectType(action);
        break;
      case C.Constants.Action.Edit.SetCell:
        EditStore.setCell(action);
        break;
      case C.Constants.Action.Edit.SetHold:
        EditStore.setHold(action);
        break;
      case C.Constants.Action.Edit.SetNext:
        EditStore.setNext(action);
        break;

      default:
        break;
    }

    return true;
  });

  C.EditStore = EditStore;
})();

(function() {
  'use strict';

  var MouseStore = $.extend({

    _state: {
      lButtonDown: false,
    },

    state: function() {
      return $.extend(true, {}, this._state);
    },

    addMouseListener: function(callback) {
      this.addListener(C.Constants.Event.Mouse, callback);
    },

    removeMouseListener: function(callback) {
      this.removeListener(C.Constants.Event.Mouse, callback);
    },

    up: function(action) {
      var type = action.event.which;
      if (type === C.Constants.MouseButton.Left) {
        this._state.lButtonDown = false;
        this.emit(C.Constants.Event.Mouse);
      }
    },

    down: function(action) {
      var type = action.event.which;
      if (type === C.Constants.MouseButton.Left) {
        this._state.lButtonDown = true;
        this.emit(C.Constants.Event.Mouse);
      }
    },
  }, C.StoreBase);

  C.AppDispatcher.register(function(payload) {
    var action = payload.action;

    switch (action.actionType) {
      case C.Constants.Action.Mouse.Up:
        MouseStore.up(action);
        break;
      case C.Constants.Action.Mouse.Down:
        MouseStore.down(action);
        break;
      default:
        break;
    }

    return true;
  });

  C.MouseStore = MouseStore;
})();

(function() {
  'use strict';

  var ReplayStore = $.extend({
    _current: null,
    _context: null,
    _ghost: null,
    _field: new C.Field(),
    _hold: new C.Hold(),
    _histories: new C.Histories(),
    _nexts: new C.Nexts(),
    _nextsVisibled: new C.NextsVisibled(),
    _description: new C.Description(),
    _steps: new C.Steps(),
    _currentStep: null,
    _urlParameters: '',

    initialize: function(action) {
      this._context = action.context

      this._current = null;
      this._ghost = null;
      this._field = new C.Field();
      this._hold = new C.Hold();
      this._histories = new C.Histories();
      this._nexts = new C.Nexts();
      this._nextsVisibled.deserialize(this._context.nextsVisibled);
      this._description = new C.Description();
      this._steps = new C.Steps();
      this.__currentStep = null;
      this._urlParameters = '';

      this._init(this._context);
      this.emit(C.Constants.Event.Change);
    },

    _init: function(context) {
      var steps
        , step
        , nexts;

      this._hold.deserialize(context.hold);
      this._nexts.deserialize(context.nexts);
      this._steps.deserialize(context.steps);
      this._field.deserialize(context.field);

      this._currentStep = this._steps.forward();
      if (this._forwardCurrent()) {
        this._updateGhost();
        this._histories.push(this._current, this._field, this._nexts, this._hold, this._description);
      }
    },

    fieldTypes: function() {
      return this._field.innerTypes();
    },

    holdType: function() {
      return this._hold.type();
    },

    nexts: function() {
      return this._nexts.nextTypes();
    },

    nextsVisibled: function() {
      return this._nextsVisibled.status();
    },

    current: function() {
      return this._current;
    },

    ghost: function() {
      return this._ghost;
    },

    canHold: function() {
      return this._hold.canExchange();
    },

    descriptionData: function() {
      return this._description.data();
    },

    urlParameters: function() {
      return this._urlParameters;
    },

    _forwardCurrent: function() {
      if (this._nexts.length() === 0) {
        this._current = null;
        return false;
      } else {
        this._current = C.TetriminoFactory.create(this._nexts.next(), this._field.startPivot());
        return true;
      }
    },

    settle: function() {
      var clearLineNum
        , spinType = C.Constants.SpinType.None;

      if (this._currentStep.isTSpin) {
        if (this._ghost.canTSpin(this._field)) {
          spinType = C.Constants.SpinType.TSpin;
        } else {
          spinType = C.Constants.SpinType.TSpinMini;
        }
      }

      this._field.settle(this._ghost);
      var clearLineNum = this._field.clearLine()
      this._description.clearLineNum(clearLineNum);
      this._description.spinType(spinType);

      if (clearLineNum > 0) {
        this._description.ren(this._description.ren() + 1);
      } else {
        this._description.ren(0);
      }
      this._description.perfectCleared(this._field.isPerfectCleared());

      this._hold.release();
      this._forwardCurrent();
      this._histories.push(this._current, this._field, this._nexts, this._hold, this._description);

      this._description.fixData();
    },

    hold: function() {
      var current;

      current = this._hold.exchange(this._current.type());
      if (current == C.CellType.None) {
        this._forwardCurrent();
      } else {
        this._current = C.TetriminoFactory.create(current, this._field.startPivot());
      }
      this._histories.push(this._current, this._field, this._nexts, this._hold, this._description);

      this._description.spinType(C.Constants.SpinType.None);
    },

    back: function(action) {
      var history;

      if (!this._histories.canBack()) {
        return;
      }

      this._histories.back();
      this._currentStep = this._steps.back();
      history = this._histories.current();

      this._current = C.TetriminoFactory.create(history.current(), this._field.startPivot());
      this._field.deserialize(history.field());
      this._nexts.no(history.nextNo());
      this._hold.deserialize(history.hold());
      this._description.current(history.description());

      this._updateGhost();
      this.emit(C.Constants.Event.Change);
    },

    _updateGhost: function() {
      var pivot;
      if (this._currentStep == null) {
        this._ghost = null;
        return;
      }

      this._ghost = this._current.copy();
      if (this._currentStep.stepType === C.Constants.StepType.Hold) {
        this._ghost = null;
      } else if (this._currentStep.stepType === C.Constants.StepType.Ojama) {
        throw new Error('not implemented');
      } else if (this._currentStep.stepType === C.Constants.StepType.HardDrop) {
        pivot = this._ghost.pivot();
        pivot.x = this._currentStep.pos;
        this._ghost.pivot(pivot);
        this._ghost.direction(this._currentStep.direction);
        this._ghost.hardDrop(this._field);
      } else {
        this._ghost.pivot(this._currentStep.pivot);
        this._ghost.direction(this._currentStep.direction);
      }
    },

    forward: function(action) {
      if (this._currentStep == null) {
        return;
      }

      if (this._currentStep.stepType === C.Constants.StepType.Hold) {
        this.hold();
      } else if (this._currentStep.stepType === C.Constants.StepType.Ojama) {
        throw new Error('not implemented');
      } else {
        this.settle();
      }

      this._currentStep = this._steps.forward();
      this._updateGhost();

      this.emit(C.Constants.Event.Change);
    },

    backToHead: function(action) {
      this.initialize({ context: this._context });
    },

    createUrlParameters: function(action) {
      var context = this._context
        , parameters = []
        , f = context.field
        , ns = context.nexts
        , nv = this._nextsVisibled.serialize()
        , ss = context.steps
        , h = context.hold;

      if (!!f) {
        parameters.push('f=' + f);
      }

      if (!!ns) {
        parameters.push('ns=' + ns);
      }

      if (!!nv && nv != 'v') {
        parameters.push('nv=' + nv);
      }

      if (!!ss) {
        parameters.push('ss=' + ss);
      }

      if (!!h) {
        parameters.push('h=' + h);
      }

      parameters.push('m=' + C.Constants.Mode.Replay);
      parameters.push('v=' + C.Constants.Version);

      this._urlParameters = parameters.join('&');
      this.emit(C.Constants.Event.SetUrl);
    },

    changeModeToSimu: function(action) {
      var mode = C.Constants.Mode.Simu
        , context = this._context;

      // リプレイモード→プレイングモード切替時は、前回切替前の続きから再開
      // させるが、リプレイモードから開始している場合もあるので、その場合は
      // リプレイモードの初期状態を引き継ぐ
      var params = {
        field: context.field,
        nexts: context.nexts,
        nextsVisibled: this._nextsVisibled.serialize(),
        prevs: context.prevs,
        hold: context.hold
      };
      this.emit(C.Constants.Event.ChangeMode, mode, params);
    },

    toggleNextVisible: function(action) {
      this._nextsVisibled.toggleVisible(action.index);
      this.emit(C.Constants.Event.Change);
    },

    addChangeListener: function(callback) {
      this.addListener(C.Constants.Event.Change, callback);
    },

    removeChangeListener: function(callback) {
      this.removeListener(C.Constants.Event.Change, callback);
    },

    addSetUrlListener: function(callback) {
      this.addListener(C.Constants.Event.SetUrl, callback);
    },

    removeSetUrlListener: function(callback) {
      this.removeListener(C.Constants.Event.SetUrl, callback);
    },

    addChangeModeListener: function(callback) {
      this.addListener(C.Constants.Event.ChangeMode, callback);
    },

    removeChangeModeListener: function(callback) {
      this.removeListener(C.Constants.Event.ChangeMode, callback);
    },
  }, C.StoreBase);

  C.AppDispatcher.register(function(payload) {
    var action = payload.action;

    switch (action.actionType) {
      case C.Constants.Action.Replay.Initialize:
        ReplayStore.initialize(action);
        break;
      case C.Constants.Action.Replay.Forward:
        ReplayStore.forward(action);
        break;
      case C.Constants.Action.Replay.Back:
        ReplayStore.back(action);
        break;
      case C.Constants.Action.Replay.BackToHead:
        ReplayStore.backToHead(action);
        break;
      case C.Constants.Action.Replay.CreateUrlParameters:
        ReplayStore.createUrlParameters(action);
        break;
      case C.Constants.Action.Replay.ChangeModeToSimu:
        ReplayStore.changeModeToSimu(action);
        break;
    }

    return true;
  });

  C.ReplayStore = ReplayStore;
})();

(function() {
  'use strict';

  var SimuStore = $.extend({
    _initialized: false,
    _context: null,
    _current: null,
    _ghost: null,
    _field: new C.Field(),
    _hold: new C.Hold(),
    _histories: new C.Histories(),
    _nexts: new C.Nexts(),
    _nextsVisibled: new C.NextsVisibled(),
    _description: new C.Description(),
    _nextGenerator: new C.NextGenerator(),
    _steps: new C.Steps(),
    _seed: 0,
    _urlParameters: '',

    initialize: function(action, force) {
      if (this._initialized && !action.context.force) {
        this._context.before = action.context.before;
        return;
      }

      this._initialized = true;
      this._context = action.context
      this._seed = this._context.seed == null ? C.Random.nextInt(1000000) : this._context.seed;
      this._nextsVisibled.deserialize(this._context.nextsVisibled);

      this._init(action.context);
      this.emit(C.Constants.Event.Change);
    },

    _init: function(context) {
      var prevs;

      this._current = null,
      this._ghost = null,
      this._field = new C.Field(),
      this._hold = new C.Hold(),
      this._histories = new C.Histories(),
      this._nexts = new C.Nexts(),
      this._description = new C.Description(),
      this._nextGenerator = new C.NextGenerator(),
      this._steps = new C.Steps(),
      this._currentStep = null;

      C.Random.setSeed(this._seed);

      this._hold.deserialize(context.hold);
      this._field.deserialize(context.field);
      this._nexts.deserialize(context.nexts);

      prevs = C.NextsDeserializer.deserialize(context.prevs);
      this._nexts.setAndComplementTypes(this._nexts.types(), prevs, this._nextGenerator);
      while (this._nexts.nextsLength() < 5) {
        this._nexts.push(this._nextGenerator.next());
      }

      this._forwardCurrent();

      this._histories.push(this._current, this._field, this._nexts, this._hold, this._description);
    },

    context: function() {
      return this._context;
    },

    retry: function(action) {
      if (action.isSuperRetry) {
        this._seed = C.Random.nextInt(1000000);
      }

      this._init(this._context);
      this.emit(C.Constants.Event.Change);
    },

    fieldTypes: function() {
      return this._field.innerTypes();
    },

    holdType: function() {
      return this._hold.type();
    },

    nexts: function() {
      return this._nexts.nextTypes();
    },

    nextsFixed: function() {
      return this._nexts.nextTypesFixed();
    },

    nextsVisibled: function() {
      return this._nextsVisibled.status();
    },

    current: function() {
      return this._current;
    },

    ghost: function() {
      return this._ghost;
    },

    canHold: function() {
      return this._hold.canExchange();
    },

    descriptionData: function() {
      return this._description.data();
    },

    seed: function() {
      return this._seed;
    },

    urlParameters: function() {
      return this._urlParameters;
    },

    _forwardCurrent: function() {
      this._current = C.TetriminoFactory.create(this._nexts.next(), this._field.startPivot());
      if (this._nexts.nextsLength() < 5) {
        this._nexts.push(this._nextGenerator.next());
      }

      this._updateGhost();
    },

    hardDrop: function(action) {
      var clearLineNum
        , prevPivotY = this._current.pivot().y
        , canHardDropFromStart;

      this._current.hardDrop(this._field);
      canHardDropFromStart = this._canHardDropFromStart(this._current);
      this._field.settle(this._current);

      if (prevPivotY !== this._current.pivot().y) {
        // 落下があったのでスピン無しに戻す
        this._description.spinType(C.Constants.SpinType.None);
      }

      // 戻っているかもしれないので、その分を忘れてから次の譜を積む
      this._steps.forgetAfter();
      this._steps.pushTetrimino(this._current, this._description.spinType(), canHardDropFromStart);
      this._steps.forward();

      var clearLineNum = this._field.clearLine()
      this._description.clearLineNum(clearLineNum);

      if (clearLineNum > 0) {
        this._description.ren(this._description.ren() + 1);
      } else {
        this._description.ren(0);
      }
      this._description.perfectCleared(this._field.isPerfectCleared());

      this._forwardCurrent();
      this._hold.release();
      this._histories.push(this._current, this._field, this._nexts, this._hold, this._description);

      this._description.fixData();
      this.emit(C.Constants.Event.Change);
    },

    _canHardDropFromStart: function(current) {
      var testCurrent = current.copy()
        , pivot = testCurrent.pivot()
        , currentPivot = current.pivot()
        , hardDropPivot;

      // 開始Y座標からハードドロップでcurrentの座標に落とせるかどうかを判定する
      pivot.y = this._field.startPivot().y;
      testCurrent.pivot(pivot);
      testCurrent.hardDrop(this._field);
      hardDropPivot = testCurrent.pivot();

      return hardDropPivot.x === currentPivot.x && hardDropPivot.y === currentPivot.y;
    },

    softDrop: function(action) {
      if (!this._field.isGround(this._current)) {
        this._current.move({
          x: 0,
          y: -1
        });

        this._description.spinType(C.Constants.SpinType.None);
      }

      this.emit(C.Constants.Event.Change);
    },

    move: function(action) {
      if (this._current.canMove(this._field, { x: action.sign, y: 0 })) {
        this._current.move({
          x: action.sign,
          y: 0
        });

        this._description.spinType(C.Constants.SpinType.None);
        this._updateGhost();

        this.emit(C.Constants.Event.Change);
      }
    },

    hold: function(action) {
      var current;

      if (!this._hold.canExchange()) {
        return;
      }

      // 戻っているかもしれないので、その分を忘れてから次の譜を積む
      this._steps.forgetAfter();
      this._steps.pushHold(this._current.type());
      this._steps.forward();
      current = this._hold.exchange(this._current.type());
      if (current == C.CellType.None) {
        this._forwardCurrent();
      } else {
        this._current = C.TetriminoFactory.create(current, this._field.startPivot());
      }
      this._histories.push(this._current, this._field, this._nexts, this._hold, this._description);

      this._description.spinType(C.Constants.SpinType.None);
      this._updateGhost();
      this.emit(C.Constants.Event.Change);
    },

    turnLeft: function(action) {
      var specialInfo = {};

      if (this._current.turnLeftIfPossible(this._field, specialInfo)
        || this._current.turnLeftSuperlyIfPossible(this._field, specialInfo)) {

        this._description.spinType(specialInfo.spinType);
        this._updateGhost();
        this.emit(C.Constants.Event.Change);
      }
    },

    turnRight: function(action) {
      var specialInfo = {};

      if (this._current.turnRightIfPossible(this._field, specialInfo)
        || this._current.turnRightSuperlyIfPossible(this._field, specialInfo)) {

        this._description.spinType(specialInfo.spinType);
        this._updateGhost();
        this.emit(C.Constants.Event.Change);
      }
    },

    forward: function(action) {
      var history;

      if (!this._histories.canForward()) {
        return;
      }

      this._histories.forward();
      this._steps.forward();
      history = this._histories.current();

      this._current = C.TetriminoFactory.create(history.current(), this._field.startPivot());
      this._field.deserialize(history.field());
      this._nexts.no(history.nextNo());
      this._hold.deserialize(history.hold());
      this._description.current(history.description());

      this._updateGhost();
      this.emit(C.Constants.Event.Change);
    },

    back: function(action) {
      var history;

      if (!this._histories.canBack()) {
        return;
      }

      this._histories.back();
      this._steps.back();
      history = this._histories.current();

      this._current = C.TetriminoFactory.create(history.current(), this._field.startPivot());
      this._field.deserialize(history.field());
      this._nexts.no(history.nextNo());
      this._hold.deserialize(history.hold());
      this._description.current(history.description());

      this._updateGhost();
      this.emit(C.Constants.Event.Change);
    },

    _updateGhost: function() {
      this._ghost = this._current.copy();
      this._ghost.hardDrop(this._field);
    },

    createUrlParameters: function(action) {
      var context = this._context
        , parameters = []
        , f = context.field
        , ns = this._nexts.serialize()
        , nv = this._nextsVisibled.serialize()
        , ss = this._steps.serialize()
        , h = context.hold;

      if (!!f) {
        parameters.push('f=' + f);
      }

      if (!!ns) {
        parameters.push('ns=' + ns);
      }

      if (!!nv && nv != 'v') {
        parameters.push('nv=' + nv);
      }

      if (!!ss) {
        parameters.push('ss=' + ss);
      }

      if (!!h) {
        parameters.push('h=' + h);
      }

      parameters.push('m=' + C.Constants.Mode.Replay);
      parameters.push('v=' + C.Constants.Version);

      this._urlParameters = parameters.join('&');
      this.emit(C.Constants.Event.SetUrl);
    },

    changeModeToEdit: function(action) {
      var mode = C.Constants.Mode.Edit
        , nexts = new C.Nexts()
        , nextTypes = this.nexts();

      nextTypes.unshift(this._current.type());
      nexts.types(nextTypes);

      var params = {
        before: C.Constants.Mode.Simu,
        field: this._field.serialize(),
        force: true,
        hold: this._hold.serialize(),
        nexts: nexts.serialize(),
        nextsVisibled: this._nextsVisibled.serialize(),
        prevs: '',
      };
      this.emit(C.Constants.Event.ChangeMode, mode, params);
    },

    backToEditMode: function(action) {
      var mode = C.Constants.Mode.Edit
      this.emit(C.Constants.Event.ChangeMode, mode, {
        before: C.Constants.Mode.Simu
      });
    },

    changeModeToReplay: function(action) {
      var mode = C.Constants.Mode.Replay
        , allNextsTypes = this._nexts.types()
        , allNexts = new C.Nexts();

      allNexts.types(allNextsTypes);

      var params = {
        before: C.Constants.Mode.Simu,
        field: this._context.field,
        hold: this._context.hold,
        nexts: allNexts.serialize(),
        nextsVisibled: this._nextsVisibled.serialize(),
        prevs: '',
        steps: this._steps.serialize()
      };
      this.emit(C.Constants.Event.ChangeMode, mode, params);
    },

    clear: function(action) {
      var mode = C.Constants.Mode.Simu
        , params = {
        force: true,
        field: '',
        hold: '',
        nexts: '',
        nextsVisibled: this._nextsVisibled.serialize(),
        prevs: '',
        steps: ''
      };

      this.emit(C.Constants.Event.ChangeMode, mode, params);
    },

    toggleNextVisible: function(action) {
      this._nextsVisibled.toggleVisible(action.index);
      this.emit(C.Constants.Event.Change);
    },

    addChangeListener: function(callback) {
      this.addListener(C.Constants.Event.Change, callback);
    },

    removeChangeListener: function(callback) {
      this.removeListener(C.Constants.Event.Change, callback);
    },

    addSetUrlListener: function(callback) {
      this.addListener(C.Constants.Event.SetUrl, callback);
    },

    removeSetUrlListener: function(callback) {
      this.removeListener(C.Constants.Event.SetUrl, callback);
    },

    addChangeModeListener: function(callback) {
      this.addListener(C.Constants.Event.ChangeMode, callback);
    },

    removeChangeModeListener: function(callback) {
      this.removeListener(C.Constants.Event.ChangeMode, callback);
    },
  }, C.StoreBase);

  C.AppDispatcher.register(function(payload) {
    var action = payload.action;

    switch (action.actionType) {
      case C.Constants.Action.Simu.Initialize:
        SimuStore.initialize(action);
        break;
      case C.Constants.Action.Simu.HardDrop:
        SimuStore.hardDrop(action);
        break;
      case C.Constants.Action.Simu.SoftDrop:
        SimuStore.softDrop(action);
        break;
      case C.Constants.Action.Simu.Move:
        SimuStore.move(action);
        break;
      case C.Constants.Action.Simu.Hold:
        SimuStore.hold(action);
        break;
      case C.Constants.Action.Simu.TurnRight:
        SimuStore.turnRight(action);
        break;
      case C.Constants.Action.Simu.TurnLeft:
        SimuStore.turnLeft(action);
        break;
      case C.Constants.Action.Simu.Retry:
        SimuStore.retry(action);
        break;
      case C.Constants.Action.Simu.Forward:
        SimuStore.forward(action);
        break;
      case C.Constants.Action.Simu.Back:
        SimuStore.back(action);
        break;
      case C.Constants.Action.Simu.Clear:
        SimuStore.clear(action);
        break;
      case C.Constants.Action.Simu.CreateUrlParameters:
        SimuStore.createUrlParameters(action);
        break;
      case C.Constants.Action.Simu.ChangeModeToEdit:
        SimuStore.changeModeToEdit(action);
        break;
      case C.Constants.Action.Simu.ChangeModeToReplay:
        SimuStore.changeModeToReplay(action);
        break;
      case C.Constants.Action.Simu.BackToEditMode:
        SimuStore.backToEditMode(action);
        break;
      case C.Constants.Action.Simu.ToggleNextVisible:
        SimuStore.toggleNextVisible(action);
        break;

      default:
        break;
    }

    return true;
  });

  C.SimuStore = SimuStore;
})();

(function() {
  'use strict';

  var ConfigAction = {
    cancel: function() {
      C.AppDispatcher.handleViewAction({
        actionType: C.Constants.Action.Config.CancelConfig
      });
    },

    save: function(config) {
      C.AppDispatcher.handleViewAction({
        actionType: C.Constants.Action.Config.StoreConfig,
        config: config
      });
    }
  };

  C.ConfigAction = ConfigAction;
})();

(function() {
  'use strict';

  var ControllerAction = {
    keydown: function(keyName) {
      C.AppDispatcher.handleViewAction({
        actionType: C.Constants.Action.Controller.KeyDown,
        keyName: keyName
      })
    },

    keyup: function(keyName) {
      C.AppDispatcher.handleViewAction({
        actionType: C.Constants.Action.Controller.KeyUp,
        keyName: keyName
      })
    },
  };

  C.ControllerAction = ControllerAction;
})();

(function() {
  'use strict';

  var EditPanelAction = {
    initialize: function(context) {
      C.AppDispatcher.handleViewAction({
        actionType: C.Constants.Action.Edit.Initialize,
        context: context
      });
    },
  };

  C.EditPanelAction = EditPanelAction;
})();

(function() {
  'use strict';

  var FieldEditAction = {
    beginEdit: function(x, y) {
      C.AppDispatcher.handleViewAction({
        actionType: C.Constants.Action.Edit.BeginSetCell,
        x: x,
        y: y,
      })
    },

    buildDown: function() {
      C.AppDispatcher.handleViewAction({
        actionType: C.Constants.Action.Edit.BuildDownField,
      });
    },

    buildUp: function() {
      C.AppDispatcher.handleViewAction({
        actionType: C.Constants.Action.Edit.BuildUpField,
      });
    },

    setCell: function(x, y) {
      C.AppDispatcher.handleViewAction({
        actionType: C.Constants.Action.Edit.SetCell,
        x: x,
        y: y,
      })
    },

    endEdit: function() {
      C.AppDispatcher.handleViewAction({
        actionType: C.Constants.Action.Edit.EndSetCell,
      })
    },

  };

  C.FieldEditAction = FieldEditAction;
})();


(function() {
  'use strict';

  var HoldEditAction = {
    SetHold: function() {
      C.AppDispatcher.handleViewAction({
        actionType: C.Constants.Action.Edit.SetHold
      })
    }
  };

  C.HoldEditAction = HoldEditAction;
})();


(function() {
  'use strict';

  var MainPanelAction = {
    initialize: function(context) {
      C.AppDispatcher.handleViewAction({
        actionType: C.Constants.Action.Simu.Initialize,
        context: context
      });
    },

    storeConfig: function(config) {
      C.AppDispatcher.handleViewAction({
        actionType: C.Constants.Action.Config.StoreConfig,
        config: config
      });
    }
  };

  C.MainPanelAction = MainPanelAction;
})();

(function() {
  'use strict';

  var MouseAction = {
    down: function(e) {
      C.AppDispatcher.handleViewAction({
        actionType: C.Constants.Action.Mouse.Down,
        event: e
      });
    },

    up: function(e) {
      C.AppDispatcher.handleViewAction({
        actionType: C.Constants.Action.Mouse.Up,
        event: e
      });
    },
  };

  C.MouseAction = MouseAction;
})();

(function() {
  'use strict';

  var NextEditAction = {
    back: function() {
      C.AppDispatcher.handleViewAction({
        actionType: C.Constants.Action.Edit.BackNext,
      })
    },

    deleteNext: function(index) {
      C.AppDispatcher.handleViewAction({
        actionType: C.Constants.Action.Edit.DeleteNext,
        index: index,
      })
    },

    forward: function() {
      C.AppDispatcher.handleViewAction({
        actionType: C.Constants.Action.Edit.ForwardNext,
      })
    },

    insertNext: function(index) {
      C.AppDispatcher.handleViewAction({
        actionType: C.Constants.Action.Edit.InsertNext,
        index: index,
      })
    },

    setNext: function(index) {
      C.AppDispatcher.handleViewAction({
        actionType: C.Constants.Action.Edit.SetNext,
        index: index
      })
    }
  };

  C.NextEditAction = NextEditAction;
})();


(function() {
  'use strict';

  var NextReplayAction = {
  };

  C.NextReplayAction = NextReplayAction;
})();


(function() {
  'use strict';

  var NextSimuAction = {
    toggleNextVisible: function(index) {
      C.AppDispatcher.handleViewAction({
        actionType: C.Constants.Action.Simu.ToggleNextVisible,
        index: index,
      })
    },
  };

  C.NextSimuAction = NextSimuAction;
})();


(function() {
  'use strict';

  var OperationEditPanelAction = {
    cancel: function() {
      C.AppDispatcher.handleViewAction({
        actionType: C.Constants.Action.Edit.Cancel
      });
    },

    changeModeToSimu: function(context) {
      C.AppDispatcher.handleViewAction({
        actionType: C.Constants.Action.Edit.ChangeModeToSimu,
        context: context
      });
    },

    clear: function() {
      C.AppDispatcher.handleViewAction({
        actionType: C.Constants.Action.Edit.Clear
      });
    },

    createUrlParameters: function(context) {
      C.AppDispatcher.handleViewAction({
        actionType: C.Constants.Action.Edit.CreateUrlParameters,
        context: context
      });
    },

    fieldUp: function() {
      C.AppDispatcher.handleViewAction({
        actionType: C.Constants.Action.Edit.BuildUpField,
      });
    },

    fieldDown: function() {
      C.AppDispatcher.handleViewAction({
        actionType: C.Constants.Action.Edit.BuildDownField,
      });
    },

    nextUp: function() {
      C.AppDispatcher.handleViewAction({
        actionType: C.Constants.Action.Edit.BackNext,
      });
    },

    nextDown: function() {
      C.AppDispatcher.handleViewAction({
        actionType: C.Constants.Action.Edit.ForwardNext,
      });
    },

    selectType: function(type) {
      C.AppDispatcher.handleViewAction({
        actionType: C.Constants.Action.Edit.SelectType,
        type: type
      });
    },

    setHold: function() {
      C.AppDispatcher.handleViewAction({
        actionType: C.Constants.Action.Edit.SetHold,
      });
    },
  };

  C.OperationEditPanelAction = OperationEditPanelAction;
})();

(function() {
  'use strict';

  var OperationReplayPanelAction = {
    forward: function() {
      C.AppDispatcher.handleViewAction({
        actionType: C.Constants.Action.Replay.Forward
      });
    },

    back: function() {
      C.AppDispatcher.handleViewAction({
        actionType: C.Constants.Action.Replay.Back
      });
    },

    backToHead: function() {
      C.AppDispatcher.handleViewAction({
        actionType: C.Constants.Action.Replay.BackToHead,
      });
    },

    createUrlParameters: function() {
      C.AppDispatcher.handleViewAction({
        actionType: C.Constants.Action.Replay.CreateUrlParameters,
      });
    },

    changeModeToSimu: function() {
      C.AppDispatcher.handleViewAction({
        actionType: C.Constants.Action.Replay.ChangeModeToSimu,
      });
    }
  };

  C.OperationReplayPanelAction = OperationReplayPanelAction;
})();

(function() {
  'use strict';

  var OperationSimuPanelAction = {
    hardDrop: function() {
      C.AppDispatcher.handleViewAction({
        actionType: C.Constants.Action.Simu.HardDrop
      });
    },

    softDrop: function() {
      C.AppDispatcher.handleViewAction({
        actionType: C.Constants.Action.Simu.SoftDrop
      });
    },

    leftMove: function() {
      C.AppDispatcher.handleViewAction({
        actionType: C.Constants.Action.Simu.Move,
        sign: -1
      });
    },

    rightMove: function() {
      C.AppDispatcher.handleViewAction({
        actionType: C.Constants.Action.Simu.Move,
        sign: 1
      });
    },

    hold: function() {
      C.AppDispatcher.handleViewAction({
        actionType: C.Constants.Action.Simu.Hold
      });
    },

    turnRight: function() {
      C.AppDispatcher.handleViewAction({
        actionType: C.Constants.Action.Simu.TurnRight
      });
    },

    turnLeft: function() {
      C.AppDispatcher.handleViewAction({
        actionType: C.Constants.Action.Simu.TurnLeft
      });
    },

    retry: function(isSuperRetry) {
      C.AppDispatcher.handleViewAction({
        actionType: C.Constants.Action.Simu.Retry,
        isSuperRetry: isSuperRetry
      });
    },

    back: function() {
      C.AppDispatcher.handleViewAction({
        actionType: C.Constants.Action.Simu.Back
      });
    },

    forward: function() {
      C.AppDispatcher.handleViewAction({
        actionType: C.Constants.Action.Simu.Forward
      });
    },

    clear: function() {
      C.AppDispatcher.handleViewAction({
        actionType: C.Constants.Action.Simu.Clear
      });
    },

    createUrlParameters: function() {
      C.AppDispatcher.handleViewAction({
        actionType: C.Constants.Action.Simu.CreateUrlParameters
      });
    },

    changeModeToEdit: function() {
      C.AppDispatcher.handleViewAction({
        actionType: C.Constants.Action.Simu.ChangeModeToEdit,
      });
    },

    changeModeToReplay: function() {
      C.AppDispatcher.handleViewAction({
        actionType: C.Constants.Action.Simu.ChangeModeToReplay,
      });
    },

    backToEditMode: function() {
      C.AppDispatcher.handleViewAction({
        actionType: C.Constants.Action.Simu.BackToEditMode,
      });
    },
  };

  C.OperationSimuPanelAction = OperationSimuPanelAction;
})();

(function() {
  'use strict';

  var ReplayPanelAction = {
    initialize: function(context) {
      C.AppDispatcher.handleViewAction({
        actionType: C.Constants.Action.Replay.Initialize,
        context: context
      });
    },
  };

  C.ReplayPanelAction = ReplayPanelAction;
})();

(function() {
  'use strict';

  var SimuPanelAction = {
    initialize: function(context) {
      C.AppDispatcher.handleViewAction({
        actionType: C.Constants.Action.Simu.Initialize,
        context: context
      });
    },
  };

  C.SimuPanelAction = SimuPanelAction;
})();

/**
 * @jsx React.DOM
 */
var ConfigPanel = React.createClass({displayName: "ConfigPanel",
  _KeyCombos: [],

  getInitialState: function() {
    return {
      config: C.ConfigStore.config(),
      errorMessages: []
    };
  },

  componentWillMount: function() {
  },

  componentDidMount: function() {
    C.ControllerStore.addKeyListener(this.onKey);
  },

  componentWillUnmount: function() {
    C.ControllerStore.removeKeyListener(this.onKey);
  },

  render: function() {
    var simuKeyConfigItems = this._makeKeyConfigItems([
      { actionName: 'ハードドロップ', action: 'hardDrop'},
      { actionName: 'ソフトロップ', action: 'softDrop'},
      { actionName: '左移動', action: 'leftMove'},
      { actionName: '右移動', action: 'rightMove'},
      { actionName: '左回転', action: 'turnLeft'},
      { actionName: '右回転', action: 'turnRight'},
      { actionName: 'ホールド', action: 'hold'},
      { actionName: '１手進む', action: 'forward'},
      { actionName: '１手戻る', action: 'back'},
      { actionName: 'リトライ', action: 'retry'},
      { actionName: 'スーパーリトライ', action: 'superRetry'},
      { actionName: 'クリア', action: 'clear'},
      { actionName: 'モード切替(Replay)', action: 'changeModeToReplay'},
      { actionName: 'モード切替(Edit)', action: 'changeModeToEdit'},
      { actionName: '戻る', action: 'backToEditMode'},
      { actionName: 'URL出力', action: 'createUrlParameters'},
      { actionName: '設定', action: 'configure'}
    ], this.state.config.key.simu);

    var replayKeyConfigItems = this._makeKeyConfigItems([
      { actionName: '１手進む', action: 'forward'},
      { actionName: '１手戻る', action: 'back'},
      { actionName: '最初に戻る', action: 'backToHead'},
      { actionName: 'モード切替(Simu)', action: 'changeModeToSimu'},
      { actionName: '戻る', action: 'cancel'},
      { actionName: 'URL出力', action: 'createUrlParameters'},
      { actionName: '設定', action: 'configure'}
    ], this.state.config.key.replay);

    var editKeyConfigItems = this._makeKeyConfigItems([
      { actionName: 'Iを選択', action: 'selectTypeI'},
      { actionName: 'Jを選択', action: 'selectTypeJ'},
      { actionName: 'Lを選択', action: 'selectTypeL'},
      { actionName: 'Oを選択', action: 'selectTypeO'},
      { actionName: 'Sを選択', action: 'selectTypeS'},
      { actionName: 'Tを選択', action: 'selectTypeT'},
      { actionName: 'Zを選択', action: 'selectTypeZ'},
      { actionName: '白を選択', action: 'selectTypeOjama'},
      { actionName: '黒を選択', action: 'selectTypeNone'},
      { actionName: 'ホールドを設定', action: 'setHold'},
      { actionName: 'クリア', action: 'clear'},
      { actionName: 'モード切り替え(Simu)', action: 'changeModeToSimu'},
      { actionName: '戻る', action: 'cancel'},
      { actionName: 'URL出力', action: 'createUrlParameters'},
      { actionName: '設定', action: 'configure'}
    ], this.state.config.key.edit);

    return React.createElement("div", {className: "config-panel"}, 
        React.createElement("div", {className: "inner-config-panel"}, 
          React.createElement(ModeConfig, {prefixId: "simu", config: this.state.config.simu, title: "Simu", configItems: simuKeyConfigItems, ref: "simu"}), 
          React.createElement("hr", {style: {clear:'both'}}), 

          React.createElement(ModeConfig, {prefixId: "replay", config: this.state.config.replay, title: "Replay", configItems: replayKeyConfigItems, ref: "replay"}), 
          React.createElement("hr", {style: {clear:'both'}}), 

          React.createElement(ModeConfig, {prefixId: "edit", config: this.state.config.edit, title: "Edit", configItems: editKeyConfigItems, ref: "edit"}), 
          React.createElement("hr", {style: {clear:'both'}}), 

          React.createElement("div", {className: "config-button-area"}, 
            React.createElement("button", {onClick: this.onSave}, "保存"), 
            React.createElement("button", {onClick: this.onCancel}, "キャンセル"), 
            React.createElement("button", {onClick: this.onInitialize}, "初期設定に戻す")
          )
        ), 
        React.createElement("div", {className: "config-error"}, this.state.errorMessages.map(function(message) {
          return React.createElement("div", null, message);
        }))
      )
  },

  _makeKeyConfigItems: function(items, keyConfig) {
    var key
      , i, iLen
      , j, jLen
      , item
      , sck
      , token, tokens
      , keyConfigItem, keyConfigItems = [];

    for (i = 0, len = items.length; i < len; i++) {
      item = items[i];

      keyConfigItem = $.extend({}, {
        no: i,
        shift: false,
        ctrl: false,
        cmd: false,
        action: item.action,
        actionName: item.actionName
      });

      sck = keyConfig[item.action];
      tokens = sck.split('+');
      for (j = 0, jLen = tokens.length; j < jLen; j++) {
        token = tokens[j].trim();
        switch (token) {
          case 'shift': keyConfigItem.shift = true; break;
          case 'ctrl': keyConfigItem.ctrl = true; break;
          case 'cmd': keyConfigItem.cmd = true; break;
          default: keyConfigItem.keyName = token; break;
        }
      }

      keyConfigItems.push(keyConfigItem);
    }

    return keyConfigItems;
  },

  onKey: function(state) {
    if (state.keyName === 'esc') {
      this._closeConfig(state);
    }
  },

  _closeConfig: function(state) {
    if (state.down) {
      this.onCancel();
    }
  },

  onSave: function() {
    var validationState = { errorMessages: [] }
      , config;

    config = this._buildNewConfig(validationState);
    if (config) {
      this._save(config);
    } else {
      this.setState({ errorMessages: validationState.errorMessages });
    }
  },

  _save: function(config) {
    C.ConfigAction.save(config);
    localStorage.setItem('config', JSON.stringify(config));
  },

  _buildNewConfig: function(validationState) {
    var newConfig = {}
      , simu = this.refs.simu.buildConfig()
      , replay  = this.refs.replay.buildConfig()
      , edit  = this.refs.edit.buildConfig()

    this._validateConfig("Simu", simu.keysBeforeShifted, validationState);
    this._validateConfig("Replay", replay.keysBeforeShifted, validationState);
    this._validateConfig("Edit", edit.keysBeforeShifted, validationState);

    if (validationState.errorMessages.length > 0) {
      return null;
    }

    newConfig = {
      version: C.Constants.ConfigVersion,
      key: {
        simu: simu.keys,
        replay: replay.keys,
        edit: edit.keys,
      }
    };

    return newConfig;
  },

  _validateConfig: function(name, config, validationState) {
    var p, key
      , appearedKey = {}
      , duplicatekeys = {}
      , errorMessages = [];

    for (p in config) {
      key = config[p];
      if ((key !== '') && (key in appearedKey) && !(key in duplicatekeys)) {
        duplicatekeys[key] = true;
        errorMessages.push(key + 'が重複しています。');
      }

      appearedKey[key] = true;
    }

    if (errorMessages.length > 0) {
      errorMessages = [name, '-------------------------'].concat(errorMessages).concat([' ']);
      validationState.errorMessages = validationState.errorMessages.concat(errorMessages);
      return false;
    }

    return true;
  },

  _makeComboKeyName: function(keyName) {
    var keys = [];
  },

  onCancel: function() {
    C.ConfigAction.cancel();
  },

  onInitialize: function() {
    if (confirm('初期設定に戻します。よろしいですか？')) {
      this._save(C.ConfigStore.defaultConfig());
    }
  }
});

var KeyConfigItem = React.createClass({displayName: "KeyConfigItem",
  _KeyDefinitions: [
    { label: '設定なし', value: '' },
    { label: 'space', value: 'space' },
    { label: 'left' , value: 'left' },
    { label: 'up'   , value: 'up' },
    { label: 'right', value: 'right' },
    { label: 'down' , value: 'down' },
    { label: '0'    , value: '0', shift: ')' },
    { label: '1'    , value: '1', shift: '!' },
    { label: '2'    , value: '2', shift: '@' },
    { label: '3'    , value: '3', shift: '#' },
    { label: '4'    , value: '4', shift: '$' },
    { label: '5'    , value: '5', shift: '%' },
    { label: '6'    , value: '6', shift: '^' },
    { label: '7'    , value: '7', shift: '&' },
    { label: '8'    , value: '8', shift: '*' },
    { label: '9'    , value: '9', shift: '(' },
    { label: 'a'    , value: 'a' },
    { label: 'b'    , value: 'b' },
    { label: 'c'    , value: 'c' },
    { label: 'd'    , value: 'd' },
    { label: 'e'    , value: 'e' },
    { label: 'f'    , value: 'f' },
    { label: 'g'    , value: 'g' },
    { label: 'h'    , value: 'h' },
    { label: 'i'    , value: 'i' },
    { label: 'j'    , value: 'j' },
    { label: 'k'    , value: 'k' },
    { label: 'l'    , value: 'l' },
    { label: 'm'    , value: 'm' },
    { label: 'n'    , value: 'n' },
    { label: 'o'    , value: 'o' },
    { label: 'p'    , value: 'p' },
    { label: 'q'    , value: 'q' },
    { label: 'r'    , value: 'r' },
    { label: 's'    , value: 's' },
    { label: 't'    , value: 't' },
    { label: 'u'    , value: 'u' },
    { label: 'v'    , value: 'v' },
    { label: 'w'    , value: 'w' },
    { label: 'x'    , value: 'x' },
    { label: 'y'    , value: 'y' },
    { label: 'z'    , value: 'z' },
    { label: 'num_0', value: 'num_0' },
    { label: 'num_1', value: 'num_1' },
    { label: 'num_2', value: 'num_2' },
    { label: 'num_3', value: 'num_3' },
    { label: 'num_4', value: 'num_4' },
    { label: 'num_5', value: 'num_5' },
    { label: 'num_6', value: 'num_6' },
    { label: 'num_7', value: 'num_7' },
    { label: 'num_8', value: 'num_8' },
    { label: 'num_9', value: 'num_9' },
    { label: ';'    , value: ';', shift: ':' },
    { label: ','    , value: ',', shift: '<' },
    { label: '.'    , value: '.', shift: '>' },
    { label: '/'    , value: '/', shift: '?' },
    { label: 'Esc'  , value: 'esc' },
  ],

  render: function() {
    var value = this.props.value
      , no = this.props.value.no
      , keyId = this.props.prefixId + '-key-' + no
      , shiftId = this.props.prefixId + '-shift-' + no
      , ctrlId = this.props.prefixId + '-ctrl-' + no
      , cmdId = this.props.prefixId + '-cmd-' + no
      , shiftChecked = value.shift
      , selectedValue = value.keyName
      , shiftDefinition;

    shiftDefinition = $.grep(this._KeyDefinitions, function(definition){
      return definition.shift === value.keyName;
    });

    if (shiftDefinition.length !== 0) {
      selectedValue = shiftDefinition[0].value;
      shiftChecked = true;
    }

    return React.createElement("li", {className: "config-item", "data-no": no}, 
        React.createElement("div", {className: "title"}, value.actionName), 
        React.createElement("div", null, 
          React.createElement("select", {id: keyId, defaultValue: selectedValue}, 
            this._KeyDefinitions.map(function(definition, y) {
              if (definition.shift == null) {
                return React.createElement("option", {value: definition.value, key: definition.label}, definition.label)
              } else {
                return React.createElement("option", {value: definition.value, key: definition.label, "data-shift": definition.shift}, definition.label)
              }
            })
          ), 
          React.createElement("input", {id: shiftId, type: "checkbox", defaultChecked: shiftChecked}), React.createElement("label", {htmlFor: shiftId}, "shift"), 
          React.createElement("input", {id: ctrlId, type: "checkbox", defaultChecked: value.ctrl}), React.createElement("label", {htmlFor: ctrlId}, "ctrl"), 
          React.createElement("input", {id: cmdId, type: "checkbox", defaultChecked: value.cmd}), React.createElement("label", {htmlFor: cmdId}, "cmd")
        )
      )
  },

  buildConfig: function() {
    var value = this.props.value
      , no = this.props.value.no
      , keyId = '#' + this.props.prefixId + '-key-' + no
      , shiftId = '#' + this.props.prefixId + '-shift-' + no
      , ctrlId = '#'+ this.props.prefixId + '-ctrl-' + no
      , cmdId = '#' + this.props.prefixId + '-cmd-' + no
      , shift = $(shiftId).is(':checked')
      , ctrl = $(ctrlId).is(':checked')
      , cmd = $(cmdId).is(':checked')
      , keyName = $(keyId).val()
      , keyWithShift = $(keyId).find('option:selected').attr('data-shift')
      , key = []
      , keyBeforeShifted = []

    if (keyName === '') {
      // 未設定
      return {
        actionName: this.props.value.action,
        key: '',
        keyBeforeShifted: ''
      };
    }

    if (ctrl) {
      key.push('ctrl');
      keyBeforeShifted.push('ctrl');
    }

    if (shift && !keyWithShift) {
      key.push('shift');
      keyBeforeShifted.push('shift');
    } else if (shift) {
      keyBeforeShifted.push('shift');
    }

    if (cmd) {
      key.push('cmd');
      keyBeforeShifted.push('cmd');
    }

    keyBeforeShifted.push(keyName);
    if (shift && !!keyWithShift) {
      key.push(keyWithShift);
    } else {
      key.push(keyName);
    }

    return {
      actionName: this.props.value.action,
      key: key.join(' + '),
      keyBeforeShifted: keyBeforeShifted.join(' + ')
    };
  }
});

var ModeConfig = React.createClass({displayName: "ModeConfig",
  render: function() {
    var that = this;
    return React.createElement("div", {id: this.props.prefixId + '-config'}, 
        React.createElement("div", {className: "config-title"}, this.props.title), 
        React.createElement("ul", {className: "config-list"}, 
          this.props.configItems.map(function(keyConfigItem, i) {
            return React.createElement(KeyConfigItem, {prefixId: that.props.prefixId, no: i, value: keyConfigItem, ref: 'keyConfigItem' + i, key: keyConfigItem.action})
          })
        )
      )
  },

  buildConfig: function() {
    var i = 0
      , keyAction
      , config = {
        keys: {},
        keysBeforeShifted: {}
      };

    while (this.refs['keyConfigItem' + i] !== undefined) {
      keyAction = this.refs['keyConfigItem' + i].buildConfig();
      config.keys[keyAction.actionName] = keyAction.key;
      config.keysBeforeShifted[keyAction.actionName] = keyAction.keyBeforeShifted;
      i++;
    }

    return config;
  }
});

/**
 * @jsx React.DOM
 */
var DescriptionReplayPanel = React.createClass({displayName: "DescriptionReplayPanel",
  _TrickNames: (function() {
    var trickNames = {};
    trickNames[C.Constants.Trick.None] = '';
    trickNames[C.Constants.Trick.Single] = 'Single';
    trickNames[C.Constants.Trick.Double] = 'Double';
    trickNames[C.Constants.Trick.Triple] = 'Triple';
    trickNames[C.Constants.Trick.Tetris] = 'Tetris';
    trickNames[C.Constants.Trick.TSSM] = 'TSpin Single Mini';
    trickNames[C.Constants.Trick.TSS] = 'TSpin Single';
    trickNames[C.Constants.Trick.TSD] = 'TSpin Double';
    trickNames[C.Constants.Trick.TST] = 'TSpin Triple';
    trickNames[C.Constants.Trick.TSM] = 'TSpin Mini';
    trickNames[C.Constants.Trick.TS] = 'TSpin';
    trickNames[C.Constants.Trick.OverTetris] = 'Over Tetris';

    return trickNames;
  })(),

  getInitialState: function () {
    return {
      data: C.ReplayStore.descriptionData()
    };
  },

  componentDidMount: function() {
    C.ReplayStore.addChangeListener(this.onChange);
  },

  componentWillUnmount: function() {
    C.ReplayStore.removeChangeListener(this.onChange);
  },

  onChange: function() {
    this.setState({
      data: C.ReplayStore.descriptionData()
    });
  },

  render: function() {
    var texts = []
      , data = this.state.data
      , fqtn = '';

    texts.push(React.createElement("p", {key: "ren"}, 'REN: ' + data.ren));

    if (data.trick !== C.Constants.Trick.None) {
      fqtn = this._TrickNames[data.trick];
      if (data.b2b) {
        fqtn = 'BtoB ' + fqtn;
      }

      texts.push(React.createElement("p", {key: "trick"}, fqtn));
    }

    if (data.perfectCleared) {
      texts.push(React.createElement("p", {key: "pc"}, "Perfect Clear"));
    }

    return React.createElement("div", {className: "description-panel"}, 
             texts
           )
  }
});

/**
 * @jsx React.DOM
 */
var DescriptionSimuPanel = React.createClass({displayName: "DescriptionSimuPanel",
  _TrickNames: (function() {
    var trickNames = {};
    trickNames[C.Constants.Trick.None] = '';
    trickNames[C.Constants.Trick.Single] = 'Single';
    trickNames[C.Constants.Trick.Double] = 'Double';
    trickNames[C.Constants.Trick.Triple] = 'Triple';
    trickNames[C.Constants.Trick.Tetris] = 'Tetris';
    trickNames[C.Constants.Trick.TSSM] = 'TSpin Single Mini';
    trickNames[C.Constants.Trick.TSS] = 'TSpin Single';
    trickNames[C.Constants.Trick.TSD] = 'TSpin Double';
    trickNames[C.Constants.Trick.TST] = 'TSpin Triple';
    trickNames[C.Constants.Trick.TSM] = 'TSpin Mini';
    trickNames[C.Constants.Trick.TS] = 'TSpin';
    trickNames[C.Constants.Trick.OverTetris] = 'Over Tetris';

    return trickNames;
  })(),

  getInitialState: function () {
    return {
      data: C.SimuStore.descriptionData()
    };
  },

  componentDidMount: function() {
    C.SimuStore.addChangeListener(this.onChange);
  },

  componentWillUnmount: function() {
    C.SimuStore.removeChangeListener(this.onChange);
  },

  onChange: function() {
    this.setState({
      data: C.SimuStore.descriptionData()
    });
  },

  render: function() {
    var texts = []
      , data = this.state.data
      , fqtn = '';

    texts.push(React.createElement("p", {key: "ren"}, 'REN: ' + data.ren));

    if (data.trick !== C.Constants.Trick.None) {
      fqtn = this._TrickNames[data.trick];
      if (data.b2b) {
        fqtn = 'BtoB ' + fqtn;
      }

      texts.push(React.createElement("p", {key: "trick"}, fqtn));
    }

    if (data.perfectCleared) {
      texts.push(React.createElement("p", {key: "pc"}, "Perfect Clear"));
    }

    return React.createElement("div", {className: "description-panel"}, 
             texts
           )
  }
});

/**
 * @jsx React.DOM
 */
var EditPanel = React.createClass({displayName: "EditPanel",
  componentWillMount: function() {
    C.EditPanelAction.initialize(this.props.context);
  },

  componentWillReceiveProps: function(nextProps) {
    C.EditPanelAction.initialize(nextProps.context);
  },

  render: function() {
    return React.createElement("div", {className: "main-panel"}, 
             React.createElement(LeftEditPanel, null), 
             React.createElement(FieldEditPanel, null), 
             React.createElement(NextEditPanel, null), 
             React.createElement(OperationEditPanel, {context: this.props.context}), 
             React.createElement("div", {className: "status"}, 
               React.createElement("div", {className: "mode"}, "Edit"), 
               React.createElement("div", {className: "version"}, "Ver. ", C.Constants.Version)
             )
           )
  }
});

/**
 * @jsx React.DOM
 */
var FieldEditPanel = React.createClass({displayName: "FieldEditPanel",
  _CellTypeClass: (function() {
    var cellTypeClass = {};
    cellTypeClass[C.CellType.None] = 'type-none';
    cellTypeClass[C.CellType.I] = 'type-i';
    cellTypeClass[C.CellType.J] = 'type-j';
    cellTypeClass[C.CellType.L] = 'type-l';
    cellTypeClass[C.CellType.O] = 'type-o';
    cellTypeClass[C.CellType.S] = 'type-s';
    cellTypeClass[C.CellType.T] = 'type-t';
    cellTypeClass[C.CellType.Z] = 'type-z';
    cellTypeClass[C.CellType.Ojama] = 'type-ojama';
    cellTypeClass[C.CellType.Wall] = 'type-wall';

    return cellTypeClass;
  })(),

  getInitialState: function () {
    return {
      isEditing: C.MouseStore.state().lButtonDown,
      types: C.EditStore.fieldTypes(),
    };
  },

  componentDidMount: function() {
    C.EditStore.addChangeListener(this.onChange);
    C.MouseStore.addMouseListener(this.onMouseChange);
  },

  componentWillUnmount: function() {
    C.EditStore.removeChangeListener(this.onChange);
    C.MouseStore.removeMouseListener(this.onMouseChange);
  },

  onMouseChange: function() {
    this.setState({
      isEditing: C.MouseStore.state().lButtonDown,
    });
  },

  onChange: function() {
    this.setState({
      types: C.EditStore.fieldTypes(),
    });
  },

  onBeginEdit: function(x, y) {
    if (this.state.configuring) {
      return;
    }

    C.FieldEditAction.beginEdit(x, y);
  },

  onSetCell: function(x, y) {
    if (this.state.configuring || !this.state.isEditing) {
      return;
    }

    C.FieldEditAction.setCell(x, y);
  },

  onEndEdit: function(x, y) {
    if (this.state.configuring || this.state.isEditing) {
      return;
    }

    C.FieldEditAction.endEdit(x, y);
  },

  onBuildUp: function() {
    if (this.state.configuring) {
      return;
    }

    C.FieldEditAction.buildUp();
  },

  onBuildDown: function() {
    C.FieldEditAction.buildDown();
  },

  onScroll: function(deltaY) {
    if (deltaY < 0) {
      this.onBuildUp();
    } else {
      this.onBuildDown();
    }
  },

  render: function() {
    var that = this;

    return React.createElement("div", {className: "field-edit-panel"}, 
        React.createElement("table", {className: "field", onWheel:  function(e) { that.onScroll(e.deltaY); }}, 
          this.state.types.map(function(row, y) {
            return React.createElement("tr", {className: "field-line", key: y}, 
                row.map(function(type, x) {
                  var cellClass = "field-cell";
                    return React.createElement("td", {className: cellClass + " " + that._CellTypeClass[type], key: x, 
                               onMouseDown:  function() { that.onBeginEdit(x, y); }, 
                               onMouseOver:  function() { that.onSetCell(x, y); }, 
                               onMouseUp:  function() { that.onEndEdit(); }})
                })
              )
          }).reverse()
        ), 
        React.createElement("div", {className: "build-blocks"}, 
          React.createElement("div", {className: "arrow", onClick: this.onBuildUp}, "▲"), 
          React.createElement("div", {className: "arrow", onClick: this.onBuildDown}, "▼")
        )
      )
    }
});

/**
 * @jsx React.DOM
 */
var FieldReplayPanel = React.createClass({displayName: "FieldReplayPanel",
  _CellTypeClass: (function() {
    var cellTypeClass = {};
    cellTypeClass[C.CellType.None] = 'type-none';
    cellTypeClass[C.CellType.I] = 'type-i';
    cellTypeClass[C.CellType.J] = 'type-j';
    cellTypeClass[C.CellType.L] = 'type-l';
    cellTypeClass[C.CellType.O] = 'type-o';
    cellTypeClass[C.CellType.S] = 'type-s';
    cellTypeClass[C.CellType.T] = 'type-t';
    cellTypeClass[C.CellType.Z] = 'type-z';
    cellTypeClass[C.CellType.Ojama] = 'type-ojama';
    cellTypeClass[C.CellType.Wall] = 'type-wall';

    return cellTypeClass;
  })(),

  getInitialState: function () {
    return {
      types: C.ReplayStore.fieldTypes(),
      current: C.ReplayStore.current(),
      ghost: C.ReplayStore.ghost()
    };
  },

  componentDidMount: function() {
    C.ReplayStore.addChangeListener(this.onChange);
  },

  componentWillUnmount: function() {
    C.ReplayStore.removeChangeListener(this.onChange);
  },

  onChange: function() {
    this.setState({
      types: C.ReplayStore.fieldTypes(),
      current: C.ReplayStore.current(),
      ghost: C.ReplayStore.ghost()
    });
  },

  render: function() {
    var that = this
      , block
      , blocks
      , ghostBlocks
      , p
      , blocksXY = {}
      , ghostBlocksXY = {};

    if (this.state.current != null) {
      blocks = this.state.current.blocks();
      for (p in blocks) {
        block = blocks[p];
        blocksXY[block.x + ':' + block.y] = true;
      }
    }

    if (this.state.ghost != null) {
      ghostBlocks = this.state.ghost.blocks();
      for (p in ghostBlocks) {
        block = ghostBlocks[p];
        ghostBlocksXY[block.x + ':' + block.y] = true;
      }
    }

    return React.createElement("div", {className: "field-panel"}, 
        React.createElement("table", {className: "field"}, 
          this.state.types.map(function(row, y) {
            return React.createElement("tr", {className: "field-line", key: y}, 
                row.map(function(type, x) {
                  var xy = x + ':' + y
                    , cellClass = "field-cell";

                  if (blocksXY[xy]) {
                    return React.createElement("td", {className: cellClass + " " + that._CellTypeClass[that.state.current.type()], key: x})
                  } else if (ghostBlocksXY[xy]) {
                    return React.createElement("td", {className: cellClass + " ghost-cell " + that._CellTypeClass[that.state.current.type()], key: 'g' + x})
                  } else {
                    return React.createElement("td", {className: cellClass + " " + that._CellTypeClass[type], key: x})
                  }
                })
              )
          }).reverse()
        )
      )
    }
});

/**
 * @jsx React.DOM
 */
var FieldSimuPanel = React.createClass({displayName: "FieldSimuPanel",
  _CellTypeClass: (function() {
    var cellTypeClass = {};
    cellTypeClass[C.CellType.None] = 'type-none';
    cellTypeClass[C.CellType.I] = 'type-i';
    cellTypeClass[C.CellType.J] = 'type-j';
    cellTypeClass[C.CellType.L] = 'type-l';
    cellTypeClass[C.CellType.O] = 'type-o';
    cellTypeClass[C.CellType.S] = 'type-s';
    cellTypeClass[C.CellType.T] = 'type-t';
    cellTypeClass[C.CellType.Z] = 'type-z';
    cellTypeClass[C.CellType.Ojama] = 'type-ojama';
    cellTypeClass[C.CellType.Wall] = 'type-wall';

    return cellTypeClass;
  })(),

  getInitialState: function () {
    return {
      types: C.SimuStore.fieldTypes(),
      current: C.SimuStore.current(),
      ghost: C.SimuStore.ghost()
    };
  },

  componentDidMount: function() {
    C.SimuStore.addChangeListener(this.onChange);
  },

  componentWillUnmount: function() {
    C.SimuStore.removeChangeListener(this.onChange);
  },

  onChange: function() {
    this.setState({
      types: C.SimuStore.fieldTypes(),
      current: C.SimuStore.current(),
      ghost: C.SimuStore.ghost()
    });
  },

  render: function() {
    var that = this
      , block
      , blocks = this.state.current.blocks()
      , ghostBlocks = this.state.ghost.blocks()
      , p
      , blocksXY = {}
      , ghostBlocksXY = {};

    for (p in blocks) {
      block = blocks[p];
      blocksXY[block.x + ':' + block.y] = true;
    }

    for (p in ghostBlocks) {
      block = ghostBlocks[p];
      ghostBlocksXY[block.x + ':' + block.y] = true;
    }

    return React.createElement("div", {className: "field-panel"}, 
        React.createElement("table", {className: "field"}, 
          this.state.types.map(function(row, y) {
            return React.createElement("tr", {className: "field-line", key: y}, 
                row.map(function(type, x) {
                  var xy = x + ':' + y
                    , cellClass = "field-cell";

                    if (blocksXY[xy]) {
                      return React.createElement("td", {className: cellClass + " " + that._CellTypeClass[that.state.current.type()], key: x})
                    } else if (ghostBlocksXY[xy]) {
                      return React.createElement("td", {className: cellClass + " ghost-cell " + that._CellTypeClass[that.state.current.type()], key: 'g' + x})
                    } else {
                      return React.createElement("td", {className: cellClass + " " + that._CellTypeClass[type], key: x})
                    }
                })
              )
          }).reverse()
        )
      )
    }
});

/**
 * @jsx React.DOM
 */
var HoldEditPanel = React.createClass({displayName: "HoldEditPanel",
  getInitialState: function() {
    return {
      type: C.EditStore.holdType(),
      canHold: C.EditStore.canHold(),
    }
  },

  componentDidMount: function() {
    C.EditStore.addChangeListener(this.onChange);
  },

  componentWillUnmount: function() {
    C.EditStore.removeChangeListener(this.onChange);
  },

  onChange: function() {
    this.setState({
      type: C.EditStore.holdType(),
      canHold: C.EditStore.canHold(),
    });
  },

  onSetHold: function() {
    C.HoldEditAction.SetHold();
  },

  render: function() {
      var clazz;
      if (this.state.canHold) {
        clazz = "hold"
      } else {
        clazz = "hold cannot-hold";
      }

      return React.createElement("div", {className: "hold-edit-panel"}, 
               React.createElement("h1", null, "HOLD"), 
               React.createElement("div", {className: clazz, onClick: this.onSetHold}, 
                 React.createElement(Notices, {type: this.state.type})
               )
             )
  }
});
/**
 * @jsx React.DOM
 */
var HoldReplayPanel = React.createClass({displayName: "HoldReplayPanel",
  getInitialState: function() {
    return {
      type: C.ReplayStore.holdType(),
      canHold: C.ReplayStore.canHold()
    }
  },

  componentDidMount: function() {
    C.ReplayStore.addChangeListener(this.onChange);
  },

  componentWillUnmount: function() {
    C.ReplayStore.removeChangeListener(this.onChange);
  },

  onChange: function() {
    this.setState({
      type: C.ReplayStore.holdType(),
      canHold: C.ReplayStore.canHold()
    });
  },

  render: function() {
      var clazz;
      if (this.state.canHold) {
        clazz = "hold"
      } else {
        clazz = "hold cannot-hold";
      }

      return React.createElement("div", {className: "hold-panel"}, 
               React.createElement("h1", null, "HOLD"), 
               React.createElement("div", {className: clazz}, 
                 React.createElement(Notices, {type: this.state.type})
               )
             )
    }
});
/**
 * @jsx React.DOM
 */
var HoldSimuPanel = React.createClass({displayName: "HoldSimuPanel",
  getInitialState: function() {
    return {
      type: C.SimuStore.holdType(),
      canHold: C.SimuStore.canHold()
    }
  },

  componentDidMount: function() {
    C.SimuStore.addChangeListener(this.onChange);
  },

  componentWillUnmount: function() {
    C.SimuStore.removeChangeListener(this.onChange);
  },

  onChange: function() {
    this.setState({
      type: C.SimuStore.holdType(),
      canHold: C.SimuStore.canHold()
    });
  },

  render: function() {
      var clazz;
      if (this.state.canHold) {
        clazz = "hold"
      } else {
        clazz = "hold cannot-hold";
      }

      return React.createElement("div", {className: "hold-panel"}, 
               React.createElement("h1", null, "HOLD"), 
               React.createElement("div", {className: clazz}, 
                 React.createElement(Notices, {type: this.state.type})
               )
             )
  }
});
/**
 * @jsx React.DOM
 */
var LeftEditPanel = React.createClass({displayName: "LeftEditPanel",
    render: function() {
        return React.createElement("div", {className: "left-panel"}, 
                 React.createElement(HoldEditPanel, null), 
                 React.createElement("div", {className: "description-panel"})
               )
    }
});

/**
 * @jsx React.DOM
 */
var LeftReplayPanel = React.createClass({displayName: "LeftReplayPanel",
    render: function() {
        return React.createElement("div", {className: "left-panel"}, 
                 React.createElement(HoldReplayPanel, null), 
                 React.createElement(DescriptionReplayPanel, null)
               )
    }
});

/**
 * @jsx React.DOM
 */
var LeftSimuPanel = React.createClass({displayName: "LeftSimuPanel",
    render: function() {
        return React.createElement("div", {className: "left-panel"}, 
                 React.createElement(HoldSimuPanel, null), 
                 React.createElement(DescriptionSimuPanel, null)
               )
    }
});

/**
 * @jsx React.DOM
 */
var MainPanel = React.createClass({displayName: "MainPanel",
  _KeyCombos: [],

  onChangeMode: function(mode, context) { this.setState({
      context: context,
      mode: mode
    });
  },

  componentWillMount: function() {
    var context;
    C.keyListener = new keypress.Listener();

    var urlParameters = C.UrlParameter.parse(location.href);
    context = C.ContextBuilder.build(urlParameters);

    this.setState({
      context: context,
      mode: context.initialMode
    });
  },

  componentDidMount: function() {
    this._initController();
    this._initMouse();

    this._restoreConfig();

    C.SimuStore.addChangeModeListener(this.onChangeMode);
    C.ReplayStore.addChangeModeListener(this.onChangeMode);
    C.EditStore.addChangeModeListener(this.onChangeMode);
  },

  _initController: function() {
    var keys = C.Constants.KeyNames
      , i, len;

    for (i = 0, len = keys.length; i < len; i++) {
      this._KeyCombos.push((function() {
        var keyName = keys[i];
        return {
          keys: keyName,

          on_keydown: function() {
            C.ControllerAction.keydown(keyName);
            return true;
          },

          on_keyup: function() {
            C.ControllerAction.keyup(keyName);
            return true;
          }
        };
      })());
    }

    C.keyListener.register_many(this._KeyCombos);
  },

  _initMouse: function() {
    $(document).mousedown(function(e) {
      C.MouseAction.down(e);
    });

    $(document).mouseup(function(e) {
      C.MouseAction.up(e);
    });
  },

  _restoreConfig: function() {
    var configJson
      , config = null
      , defaultConfig = C.ConfigStore.defaultConfig();

    // 設定情報をローカルストレージより取得（なければデフォルトを使用）
    try {
      configJson = localStorage.getItem('config');
      if (configJson != null) {
        config = JSON.parse(configJson);
        config.version = C.Constants.ConfigVersion;
        config.key.simu = this._mergeKeys(defaultConfig.key.simu, config.key.simu);
        config.key.replay = this._mergeKeys(defaultConfig.key.replay, config.key.replay);
        config.key.edit = this._mergeKeys(defaultConfig.key.edit, config.key.edit);
      }
    } catch (e) {
      console.error(e);
    }

    if (!config) {
        config = C.ConfigStore.defaultConfig();
    }
    localStorage.setItem('config', JSON.stringify(config));

    C.MainPanelAction.storeConfig(config);
  },

  _mergeKeys: function(defaultConfig, config) {
    var p;

    // 最新バージョンで削除されたり名称が変更になっているアクションが
    // 残らないように削除する
    for (p in ($.extend({}, config))) {
      if (!(p in defaultConfig)) {
        delete config[p];
      }
    }

    return $.extend({}, defaultConfig, config);
  },

  componentWillUnmount: function() {
    C.keyListener.unregister_many(this._KeyCombos);
    C.SimuStore.addChangeModeListener(this.onChangeMode);
    C.ReplayStore.addChangeModeListener(this.onChangeMode);
    C.EditStore.addChangeModeListener(this.onChangeMode);
  },

  render: function() {
    // IEでモード切り替え後にショートカットキーがきかなくなる問題を回避する
    $('body').focus();

    if (this.state.mode === C.Constants.Mode.Simu) {
      return React.createElement(SimuPanel, {context: this.state.context})
    }

    if (this.state.mode === C.Constants.Mode.Replay) {
      return React.createElement(ReplayPanel, {context: this.state.context})
    }

    if (this.state.mode === C.Constants.Mode.Edit) {
      return React.createElement(EditPanel, {context: this.state.context})
    }

    return React.createElement("div", null)
  }
});

/**
 * @jsx React.DOM
 */
var NextEditPanel = React.createClass({displayName: "NextEditPanel",
  getInitialState: function () {
    return {
      index: C.EditStore.NextIndex(),
      prevs: C.EditStore.nexts().prevs,
      nexts: C.EditStore.nexts().nexts,
    };
  },

  componentDidMount: function() {
    C.EditStore.addChangeListener(this.onChange);
  },

  componentWillUnmount: function() {
    C.EditStore.removeChangeListener(this.onChange);
  },

  onChange: function() {
    this.setState({
      index: C.EditStore.NextIndex(),
      prevs: C.EditStore.nexts().prevs,
      nexts: C.EditStore.nexts().nexts
    });
  },

  onBack: function() {
    if (this.state.index < -5) {
      return;
    }

    C.NextEditAction.back();
  },

  onForward: function() {
    C.NextEditAction.forward();
  },

  onScroll: function(deltaY) {
    if (deltaY < 0) {
      this.onBack();
    } else {
      this.onForward();
    }
  },

  render: function() {
    var that = this
      , index = this.state.index
      , i
      , nexts = []
      , begin, end;

    if (index < 0) {
      // prevsが見えている状態(prevs + nextsの混在の可能性があるため2段階に分けて処理する）

      // prevsの処理
      begin = -(index + 5);
      if (begin < 0) {
        begin = 0;
      }
      end = -(index + 1);

      for(i = begin, count = 0; i <= end; i++, count++) {
        nexts.push(React.createElement(NextEditItem, {type: this.state.prevs[i], index: -(i + 1), isPrev: true}));
      }

      // prevsのデータ形式は表示と逆順になっているので反転
      nexts = nexts.reverse();

      // nextsの処理
      begin = 0;
      end = (index + 5 - 1);
      for(i = begin; i <= end; i++) {
        nexts.push(React.createElement(NextEditItem, {type: this.state.nexts[i], index: i, isPrev: false}));
      }
    } else {
      // prevsが見えていない状態

      for(i = index; i < index + 5; i++) {
        nexts.push(React.createElement(NextEditItem, {type: this.state.nexts[i], index: i, isPrev: false}));
      }
    }

    return React.createElement("div", {className: "next-panel", onWheel:  function(e) { that.onScroll(e.deltaY); }}, 
        React.createElement("h1", null, "NEXT"), 
        React.createElement("a", {href: "javascript:void(0)", className: "arrow" + ((this.state.index < -5) ? " invisible" : ""), onClick: this.onBack}, "▲"), 
          nexts, 
        React.createElement("a", {href: "javascript:void(0)", className: "arrow", onClick: this.onForward}, "▼")
      )
  }
});

var NextEditItem = React.createClass({displayName: "NextEditItem",
  getInitialState: function() {
    return {
      menuExpanded: false,
    };
  },

  componentWillReceiveProps: function(nextProps) {
    this.setState({
      menuExpanded: false,
    });
  },

  setNext: function(index) {
    C.NextEditAction.setNext(index);
  },

  onMenuExpand: function() {
    this.setState({
      menuExpanded: true
    });
  },

  onMenuContraction: function() {
    this.setState({
      menuExpanded: false
    });
  },

  onInsert: function(index) {
    C.NextEditAction.insertNext(index);
  },

  onDelete: function(index) {
    C.NextEditAction.deleteNext(index);
  },

  render: function() {
    var that = this;
    return React.createElement("div", {className: "next-edit"}, 
             this.props.isPrev ?
               React.createElement("div", {className: "prev-index"}, -this.props.index)
               :
               React.createElement("div", {className: "index", onClick: this.onMenuExpand, onMouseLeave: this.onMenuContraction}, 
                 this.props.index + 1, 
                 React.createElement("div", {className: 'menu' + (that.state.menuExpanded ? '' : ' none')}, 
                   React.createElement("div", {className: "menuItem", onClick:  function() { that.onInsert(that.props.index); }}, "＋"), 
                   React.createElement("div", {className: "menuItem", onClick:  function() { that.onDelete(that.props.index); }}, "－")
                 )
               ), 
             
             React.createElement("div", {className: "next", onClick:  function() { that.setNext(that.props.index); }}, 
               React.createElement(Notices, {type: this.props.type})
             )
           )
  }
});

/**
 * @jsx React.DOM
 */
var NextItem = React.createClass({displayName: "NextItem",
  onToggleVisible: function() {
    C.NextItemAction.toggleNextVisible(this.props.index);
  },

  render: function() {
    var that = this;

    if (this.props.visible) {
      return React.createElement("div", {className: "next" + (this.props.fixed ? " fixed" : ""), onClick:  that.onToggleVisible}, 
              React.createElement(Notices, {type: this.props.type})
             )
    } else {
      return React.createElement("div", {className: "next-hidden", onClick:  that.onToggleVisible})
    }
  }
});
/**
 * @jsx React.DOM
 */
var NextReplayPanel = React.createClass({displayName: "NextReplayPanel",
  getInitialState: function () {
    return {
      nexts: C.ReplayStore.nexts(),
      nextsVisibled: C.ReplayStore.nextsVisibled(),
    };
  },

  componentDidMount: function() {
    C.ReplayStore.addChangeListener(this.onChange);
  },

  componentWillUnmount: function() {
    C.ReplayStore.removeChangeListener(this.onChange);
  },

  onChange: function() {
    this.setState({
      nexts: C.ReplayStore.nexts(),
      nextsVisibled: C.ReplayStore.nextsVisibled(),
    });
  },

  render: function() {
    return React.createElement("div", {className: "next-panel"}, 
        React.createElement("h1", null, "NEXT"), 
          React.createElement(NextItemReplay, {type: this.state.nexts[0], index: "0", visible: !!this.state.nextsVisibled[0]}), 
          React.createElement(NextItemReplay, {type: this.state.nexts[1], index: "1", visible: !!this.state.nextsVisibled[1]}), 
          React.createElement(NextItemReplay, {type: this.state.nexts[2], index: "2", visible: !!this.state.nextsVisibled[2]}), 
          React.createElement(NextItemReplay, {type: this.state.nexts[3], index: "3", visible: !!this.state.nextsVisibled[3]}), 
          React.createElement(NextItemReplay, {type: this.state.nexts[4], index: "4", visible: !!this.state.nextsVisibled[4]})
      )
  }
});

var NextItemReplay = React.createClass({displayName: "NextItemReplay",
  render: function() {
    var that = this;

    if (this.props.visible) {
      return React.createElement("div", {className: "next-replay"}, 
               React.createElement("div", {className: "next" + (this.props.fixed ? " fixed" : "")}, 
                 React.createElement(Notices, {type: this.props.type})
               )
             )
    } else {
      return React.createElement("div", {className: "next-replay"}, 
               React.createElement("div", {className: "next-hidden"})
             )
    }
  }
});


/**
 * @jsx React.DOM
 */
var NextSimuPanel = React.createClass({displayName: "NextSimuPanel",
  getInitialState: function () {
    return {
      nexts: C.SimuStore.nexts(),
      nextsFixed: C.SimuStore.nextsFixed(),
      nextsVisibled: C.SimuStore.nextsVisibled(),
    };
  },

  componentDidMount: function() {
    C.SimuStore.addChangeListener(this.onChange);
  },

  componentWillUnmount: function() {
    C.SimuStore.removeChangeListener(this.onChange);
  },

  onChange: function() {
    this.setState({
      nexts: C.SimuStore.nexts(),
      nextsFixed: C.SimuStore.nextsFixed(),
      nextsVisibled: C.SimuStore.nextsVisibled(),
    });
  },

  render: function() {
    return React.createElement("div", {className: "next-panel"}, 
    React.createElement("h1", null, "NEXT"), 
    React.createElement(NextItemSimu, {type: this.state.nexts[0], fixed: !!this.state.nextsFixed[0], index: "0", visible: !!this.state.nextsVisibled[0]}), 
    React.createElement(NextItemSimu, {type: this.state.nexts[1], fixed: !!this.state.nextsFixed[1], index: "1", visible: !!this.state.nextsVisibled[1]}), 
    React.createElement(NextItemSimu, {type: this.state.nexts[2], fixed: !!this.state.nextsFixed[2], index: "2", visible: !!this.state.nextsVisibled[2]}), 
    React.createElement(NextItemSimu, {type: this.state.nexts[3], fixed: !!this.state.nextsFixed[3], index: "3", visible: !!this.state.nextsVisibled[3]}), 
    React.createElement(NextItemSimu, {type: this.state.nexts[4], fixed: !!this.state.nextsFixed[4], index: "4", visible: !!this.state.nextsVisibled[4]})
    )
  }
});

var NextItemSimu = React.createClass({displayName: "NextItemSimu",
  onToggleVisible: function() {
    C.NextSimuAction.toggleNextVisible(this.props.index);
  },

  render: function() {
    var that = this;

    if (this.props.visible) {
      return React.createElement("div", {className: "next-simu"}, 
               React.createElement("div", {className: "next" + (this.props.fixed ? " fixed" : ""), onClick:  that.onToggleVisible}, 
                 React.createElement(Notices, {type: this.props.type})
               )
             )
    } else {
      return React.createElement("div", {className: "next-simu"}, 
               React.createElement("div", {className: "next-hidden", onClick:  that.onToggleVisible})
             )
    }
  }
});

/**
 * @jsx React.DOM
 */
var Notices = React.createClass({displayName: "Notices",
  render: function() {
    switch (this.props.type) {
      case undefined:
        return React.createElement(NoticeNone, null)
      case C.CellType.None:
        return React.createElement(NoticeNone, null)
      case C.CellType.I:
        return React.createElement(NoticeI, null)
      case C.CellType.J:
        return React.createElement(NoticeJ, null)
      case C.CellType.L:
        return React.createElement(NoticeL, null)
      case C.CellType.O:
        return React.createElement(NoticeO, null)
      case C.CellType.S:
        return React.createElement(NoticeS, null)
      case C.CellType.T:
        return React.createElement(NoticeT, null)
      case C.CellType.Z:
        return React.createElement(NoticeZ, null)
      default:
        throw new Error('invalid type(' + this.props.type + ')');
      }
  }
});

var NoticeNone = React.createClass({displayName: "NoticeNone",
  render: function() {
    return React.createElement("table", {className: "notice-none", key: "none"})
  }
});

var NoticeI = React.createClass({displayName: "NoticeI",
  render: function() {
    return React.createElement("table", {className: "notice-i", key: "i"}, 
             React.createElement("tr", null, 
               React.createElement("td", {className: "notice-cell type-i"}), 
               React.createElement("td", {className: "notice-cell type-i"}), 
               React.createElement("td", {className: "notice-cell type-i"}), 
               React.createElement("td", {className: "notice-cell type-i"})
             )
           )
  }
});

var NoticeJ = React.createClass({displayName: "NoticeJ",
  render: function() {
    return React.createElement("table", {className: "notice-j", key: "j"}, 
             React.createElement("tr", null, 
               React.createElement("td", {className: "notice-cell type-j"}), 
               React.createElement("td", {className: "notice-cell"}), 
               React.createElement("td", {className: "notice-cell"})
             ), 
             React.createElement("tr", null, 
               React.createElement("td", {className: "notice-cell type-j"}), 
               React.createElement("td", {className: "notice-cell type-j"}), 
               React.createElement("td", {className: "notice-cell type-j"})
             )
           )
  }
});

var NoticeL = React.createClass({displayName: "NoticeL",
  render: function() {
    return React.createElement("table", {className: "notice-l", key: "l"}, 
             React.createElement("tr", null, 
               React.createElement("td", {className: "notice-cell"}), 
               React.createElement("td", {className: "notice-cell"}), 
               React.createElement("td", {className: "notice-cell type-l"})
             ), 
             React.createElement("tr", null, 
               React.createElement("td", {className: "notice-cell type-l"}), 
               React.createElement("td", {className: "notice-cell type-l"}), 
               React.createElement("td", {className: "notice-cell type-l"})
             )
           )
  }
});

var NoticeO = React.createClass({displayName: "NoticeO",
  render: function() {
    return React.createElement("table", {className: "notice-o", key: "o"}, 
             React.createElement("tr", null, 
               React.createElement("td", {className: "notice-cell type-o"}), 
               React.createElement("td", {className: "notice-cell type-o"})
             ), 
             React.createElement("tr", null, 
               React.createElement("td", {className: "notice-cell type-o"}), 
               React.createElement("td", {className: "notice-cell type-o"})
             )
           )
  }
});

var NoticeS = React.createClass({displayName: "NoticeS",
  render: function() {
    return React.createElement("table", {className: "notice-s", key: "s"}, 
             React.createElement("tr", null, 
               React.createElement("td", {className: "notice-cell"}), 
               React.createElement("td", {className: "notice-cell type-s"}), 
               React.createElement("td", {className: "notice-cell type-s"})
             ), 
             React.createElement("tr", null, 
               React.createElement("td", {className: "notice-cell type-s"}), 
               React.createElement("td", {className: "notice-cell type-s"}), 
               React.createElement("td", {className: "notice-cell"})
             )
           )
  }
});

var NoticeT = React.createClass({displayName: "NoticeT",
  render: function() {
    return React.createElement("table", {className: "notice-t", key: "t"}, 
             React.createElement("tr", null, 
               React.createElement("td", {className: "notice-cell"}), 
               React.createElement("td", {className: "notice-cell type-t"}), 
               React.createElement("td", {className: "notice-cell"})
             ), 
             React.createElement("tr", null, 
               React.createElement("td", {className: "notice-cell type-t"}), 
               React.createElement("td", {className: "notice-cell type-t"}), 
               React.createElement("td", {className: "notice-cell type-t"})
             )
           )
  }
});

var NoticeZ = React.createClass({displayName: "NoticeZ",
  render: function() {
    return React.createElement("table", {className: "notice-z", key: "z"}, 
             React.createElement("tr", null, 
               React.createElement("td", {className: "notice-cell type-z"}), 
               React.createElement("td", {className: "notice-cell type-z"}), 
               React.createElement("td", {className: "notice-cell"})
             ), 
             React.createElement("tr", null, 
               React.createElement("td", {className: "notice-cell"}), 
               React.createElement("td", {className: "notice-cell type-z"}), 
               React.createElement("td", {className: "notice-cell type-z"})
             )
           )
  }
});

/**
 * @jsx React.DOM
 */
var OperationEditPanel = React.createClass({displayName: "OperationEditPanel",
  getInitialState: function() {
    return {
      before: C.EditStore.context().before,
      configuring: false,
      context: C.EditStore.context(),
      keyConfig: C.ConfigStore.keyConfig(C.Constants.Mode.Edit),
      selectedType: C.EditStore.selectedType(),
      urlParameters: C.EditStore.urlParameters()
    };
  },

  componentDidMount: function() {
    C.ControllerStore.addKeyListener(this.onKey);
    C.EditStore.addChangeListener(this.onChange);
    C.EditStore.addSetUrlListener(this.onSetUrl);
    C.ConfigStore.addChangeListener(this.onConfigChange);
    C.ConfigStore.addCancelListener(this.onConfigCancel);
  },

  componentWillUnmount: function() {
    C.ControllerStore.removeKeyListener(this.onKey);
    C.EditStore.removeChangeListener(this.onChange);
    C.EditStore.removeSetUrlListener(this.onSetUrl);
    C.ConfigStore.removeChangeListener(this.onConfigChange);
    C.ConfigStore.removeCancelListener(this.onConfigCancel);
  },

  onChange: function() {
    this.setState({
      selectedType: C.EditStore.selectedType(),
    });
  },

  onKey: function(state) {
    if (this.state.configuring) {
      return;
    }

    var action = this.state.keyConfig[state.keyName];
    if (action == null) {
      return;
    }

    // キーに対応するアクションを実行
    this['_' + action](state);
  },

  _clear: function(state) {
    if (state.down) {
      this.onClear();
    }
  },

  onClear: function() {
    if (this.state.configuring) {
      return;
    }

    C.OperationEditPanelAction.clear();
  },

  _back: function(state) {
    if (state.intervalDown) {
      this.onBack();
    }
  },

  onBack: function() {
    if (this.state.configuring) {
      return;
    }
    C.OperationEditPanelAction.back();
  },

  _forward: function(state) {
    if (state.intervalDown) {
      this.onForward();
    }
  },

  onForward: function() {
    if (this.state.configuring) {
      return;
    }
    C.OperationEditPanelAction.forward();
  },

  _configure: function(state) {
    if (state.down) {
      this.setState({
        configuring: true
      });
    }
  },

  _createUrlParameters: function(state) {
    if (state.down) {
      this.onCreateUrlParameters();
    }
  },

  onCreateUrlParameters: function() {
    if (this.state.configuring) {
      return;
    }
    C.OperationEditPanelAction.createUrlParameters();
  },

  onConfigure: function() {
    if (this.state.configuring) {
      return;
    }

    this.setState({ configuring: true });
  },

  onSetUrl: function() {
    this.setState({
      urlParameters: C.EditStore.urlParameters()
    });

    setTimeout(function() {
      $('#url-output').select();
    }, 0);
  },

  _changeModeToSimu: function(state) {
    if (state.down) {
      this.onChangeModeToSimu();
    }
  },

  onChangeModeToSimu: function() {
    if (this.state.configuring) {
      return;
    }
    C.OperationEditPanelAction.changeModeToSimu();
  },

  _cancel: function(state) {
    if (state.down) {
      this.onCancel();
    }
  },

  onCancel: function() {
    if (this.state.configuring || !this.state.before) {
      return;
    }
    C.OperationEditPanelAction.cancel();
  },

  onConfigChange: function() {
    this.setState({
      configuring: false,
      keyConfig: C.ConfigStore.keyConfig(C.Constants.Mode.Edit)
    });
  },

  onConfigCancel: function() {
    this.setState({
      configuring: false
    });
  },

  onSelectType: function(type) {
    if (this.state.configuring || type === this.state.selectedType) {
      return;
    }
    C.OperationEditPanelAction.selectType(type);
  },

  _selectTypeI: function(state) {
    if (state.down) {
      this.onSelectType(C.CellType.I);
    }
  },

  _selectTypeJ: function(state) {
    if (state.down) {
      this.onSelectType(C.CellType.J);
    }
  },

  _selectTypeL: function(state) {
    if (state.down) {
      this.onSelectType(C.CellType.L);
    }
  },

  _selectTypeO: function(state) {
    if (state.down) {
      this.onSelectType(C.CellType.O);
    }
  },

  _selectTypeS: function(state) {
    if (state.down) {
      this.onSelectType(C.CellType.S);
    }
  },

  _selectTypeT: function(state) {
    if (state.down) {
      this.onSelectType(C.CellType.T);
    }
  },

  _selectTypeZ: function(state) {
    if (state.down) {
      this.onSelectType(C.CellType.Z);
    }
  },

  _selectTypeOjama: function(state) {
    if (state.down) {
      this.onSelectType(C.CellType.Ojama);
    }
  },

  _selectTypeNone: function(state) {
    if (state.down) {
      this.onSelectType(C.CellType.None);
    }
  },

  _fieldUp: function(state) {
    if (state.intervalDown) {
      this.onFieldUp()
    }
  },

  onFieldUp: function() {
    if (this.state.configuring) {
      return;
    }

    C.OperationEditPanelAction.fieldUp();
  },

  _fieldDown: function(state) {
    if (state.intervalDown) {
      this.onFieldDown()
    }
  },

  onFieldDown: function() {
    if (this.state.configuring) {
      return;
    }

    C.OperationEditPanelAction.fieldDown();
  },

  _nextUp: function(state) {
    if (state.intervalDown) {
      this.onNextUp()
    }
  },

  onNextUp: function() {
    if (this.state.configuring) {
      return;
    }

    C.OperationEditPanelAction.nextUp();
  },

  _nextDown: function(state) {
    if (state.intervalDown) {
      this.onNextDown()
    }
  },

  onNextDown: function() {
    if (this.state.configuring) {
      return;
    }

    C.OperationEditPanelAction.nextDown();
  },

  _setHold: function(state) {
    if (state.down) {
      this.onSetHold();
    }
  },

  onSetHold: function() {
    if (this.state.configuring) {
      return;
    }

    C.OperationEditPanelAction.setHold();
  },

  render: function() {
    var url = ''
      , st = this.state.selectedType;

    if (!!this.state.urlParameters) {
      url = location.href.split('?')[0] + '?' + this.state.urlParameters;
    }

    return React.createElement("div", {className: "operation-panel"}, 
        React.createElement("h1", null, "OPERATION"), 
        React.createElement("div", {className: "operation-mode-panel"}, 
          React.createElement("div", {className: "operation-simu-panel"}, 
            React.createElement("a", {className: "operation-btn", href: "javascript:void(0)", onClick: this.onClear}, "クリア"), 

            React.createElement("div", {className: "operation-sub-title"}, "MODE"), 
            React.createElement("a", {className: "operation-btn", href: "javascript:void(0)", onClick: this.onChangeModeToSimu}, "Simu"), 
            (!!this.state.before) ?
              React.createElement("a", {className: "operation-btn", href: "javascript:void(0)", onClick: this.onCancel}, "戻る")
              : "", 

            React.createElement("div", {className: "operation-sub-title"}, "TOOL"), 
            React.createElement("div", {className: "color-pallet"}, 
              this._renderColorPalletItem(C.CellType.I,     "type-i",     "I"), 
              this._renderColorPalletItem(C.CellType.J,     "type-j",     "J"), 
              this._renderColorPalletItem(C.CellType.L,     "type-l",     "L"), 
              this._renderColorPalletItem(C.CellType.O,     "type-o",     "O"), 
              this._renderColorPalletItem(C.CellType.S,     "type-s",     "S"), 
              this._renderColorPalletItem(C.CellType.T,     "type-t",     "T"), 
              this._renderColorPalletItem(C.CellType.Z,     "type-z",     "Z"), 
              this._renderColorPalletItem(C.CellType.Ojama, "type-ojama", ""), 
              this._renderColorPalletItem(C.CellType.None,  "type-none",  "")
            ), 

            React.createElement("a", {className: "operation-btn", href: "javascript:void(0)", onClick: this.onCreateUrlParameters}, "URL出力"), 
            React.createElement("a", {className: "operation-btn", href: "javascript:void(0)", onClick: this.onConfigure}, "設定"), 
            React.createElement("textarea", {id: "url-output", className: "url", readOnly: "true", value: url})
          ), 
          this.state.configuring ? React.createElement(ConfigPanel, null) : false
        )
      )
  },

  _renderColorPalletItem: function(type, typeClass, label) {
    var that = this;
    return React.createElement("a", {href: "javascript:void(0)", className: typeClass + ((this.state.selectedType == type) ? " selected": ""), 
               onClick:  function() { that.onSelectType(type) }}, label)

  }

});

/**
 * @jsx React.DOM
 */
var OperationReplayPanel = React.createClass({displayName: "OperationReplayPanel",
  getInitialState: function() { return {
      before: this.props.context.before,
      configuring: false,
      keyConfig: C.ConfigStore.keyConfig(C.Constants.Mode.Replay),
      urlParameters: C.ReplayStore.urlParameters()
    };
  },

  componentWillMount: function() {
  },

  componentDidMount: function() {
    C.ControllerStore.addKeyListener(this.onKey);
    C.ReplayStore.addSetUrlListener(this.onSetUrl);
    C.ConfigStore.addChangeListener(this.onConfigChange);
    C.ConfigStore.addCancelListener(this.onConfigCancel);
  },

  componentWillUnmount: function() {
    C.ControllerStore.removeKeyListener(this.onKey);
    C.ReplayStore.removeSetUrlListener(this.onSetUrl);
    C.ConfigStore.removeChangeListener(this.onConfigChange);
    C.ConfigStore.removeCancelListener(this.onConfigCancel);
  },

  onKey: function(state) {
    if (this.state.configuring) {
      return;
    }

    var action = this.state.keyConfig[state.keyName];
    if (action == null) {
      return;
    }

    // キーに対応するアクションを実行
    this['_' + action](state);
  },

  _forward: function(state) {
    if (state.intervalDown) {
      this.onForward();
    }
  },

  onForward: function() {
    if (this.state.configuring) {
      return;
    }
    C.OperationReplayPanelAction.forward();
  },

  _back: function(state) {
    if (state.intervalDown) {
      this.onBack();
    }
  },

  onBack: function() {
    if (this.state.configuring) {
      return;
    }
    C.OperationReplayPanelAction.back();
  },

  _backToHead: function(state) {
    if (state.down) {
      this.onBackToHead();
    }
  },

  onBackToHead: function() {
    if (this.state.configuring) {
      return;
    }
    C.OperationReplayPanelAction.backToHead();
  },

  onSetUrl: function() {
    this.setState({
      urlParameters: C.ReplayStore.urlParameters()
    });

    setTimeout(function() {
      $('#url-output').select();
    }, 0);
  },

  _createUrlParameters: function(state) {
    if (state.down) {
      this.onCreateUrlParameters();
    }
  },

  onCreateUrlParameters: function() {
    if (this.state.configuring) {
      return;
    }
    C.OperationReplayPanelAction.createUrlParameters();
  },

  _changeModeToSimu: function(state) {
    if (state.down) {
      this.onChangeModeToSimu();
    }
  },

  onChangeModeToSimu: function() {
    if (this.state.configuring) {
      return;
    }
    C.OperationReplayPanelAction.changeModeToSimu();
  },

  _cancel: function(state) {
    if (state.down) {
      this.onCancel();
    }
  },

  onCancel: function() {
    if (this.state.configuring || !this.state.before) {
      return;
    }
    this.onChangeModeToSimu();
  },

  _configure: function(state) {
    if (state.down) {
      this.setState({
        configuring: true
      });
    }
  },

  onConfigure: function() {
    if (this.state.configuring) {
      return;
    }

    this.setState({ configuring: true });
  },

  onConfigChange: function() {
    this.setState({
      configuring: false,
      keyConfig: C.ConfigStore.keyConfig(C.Constants.Mode.Replay)
    });
  },

  onConfigCancel: function() {
    this.setState({
      configuring: false
    });
  },

  render: function() {
    var url = '';
    if (!!this.state.urlParameters) {
      url = location.href.split('?')[0] + '?' + this.state.urlParameters;
    }

    return React.createElement("div", {className: "operation-panel"}, 
        React.createElement("h1", null, "OPERATION"), 
        React.createElement("div", {className: "operation-mode-panel"}, 
          React.createElement("div", {className: "operation-replay-panel"}, 
            React.createElement("a", {className: "operation-btn", href: "javascript:void(0)", onClick: this.onBack}, "<"), 
            React.createElement("a", {className: "operation-btn", href: "javascript:void(0)", onClick: this.onForward}, ">"), 
            React.createElement("a", {className: "operation-btn", href: "javascript:void(0)", onClick: this.onBackToHead}, "□"), 

            React.createElement("div", {className: "operation-sub-title"}, "MODE"), 
            React.createElement("a", {className: "operation-btn", href: "javascript:void(0)", onClick: this.onChangeModeToSimu}, 
              (!!this.state.before) ? '戻る' : 'Simu'
            ), 

            React.createElement("div", {className: "operation-sub-title"}, "TOOL"), 
            React.createElement("a", {className: "operation-btn", href: "javascript:void(0)", onClick: this.onCreateUrlParameters}, "URL出力"), 
            React.createElement("a", {className: "operation-btn", href: "javascript:void(0)", onClick: this.onConfigure}, "設定"), 
            React.createElement("textarea", {id: "url-output", className: "url", readOnly: "true", value: url})
          ), 
          this.state.configuring ? React.createElement(ConfigPanel, null) : false
        )
      )
  }
});

/**
 * @jsx React.DOM
 */
var OperationSimuPanel = React.createClass({displayName: "OperationSimuPanel",
  getInitialState: function() {
    return {
      before: C.SimuStore.context().before,
      configuring: false,
      keyConfig: C.ConfigStore.keyConfig(C.Constants.Mode.Simu),
      seed: C.SimuStore.seed(),
      urlParameters: C.SimuStore.urlParameters()
    };
  },

  componentDidMount: function() {
    C.ControllerStore.addKeyListener(this.onKey);
    C.SimuStore.addChangeListener(this.onChange);
    C.SimuStore.addSetUrlListener(this.onSetUrl);
    C.ConfigStore.addChangeListener(this.onConfigChange);
    C.ConfigStore.addCancelListener(this.onConfigCancel);
  },

  componentWillUnmount: function() {
    C.ControllerStore.removeKeyListener(this.onKey);
    C.SimuStore.removeChangeListener(this.onChange);
    C.SimuStore.removeSetUrlListener(this.onSetUrl);
    C.ConfigStore.removeChangeListener(this.onConfigChange);
    C.ConfigStore.removeCancelListener(this.onConfigCancel);
  },

  onKey: function(state) {
    if (this.state.configuring) {
      return;
    }

    var action = this.state.keyConfig[state.keyName];
    if (action == null) {
      return;
    }

    // キーに対応するアクションを実行
    this['_' + action](state);
  },

  _hardDrop: function(state) {
    if (state.down) {
      this.onHardDrop();
    }
  },

  onHardDrop: function() {
    if (this.state.configuring) {
      return;
    }
    C.OperationSimuPanelAction.hardDrop();
  },

  _softDrop: function(state) {
    if (state.intervalDown) {
      this.onSoftDrop();
    }
  },

  onSoftDrop: function() {
    if (this.state.configuring) {
      return;
    }
    C.OperationSimuPanelAction.softDrop();
  },

  _leftMove: function(state) {
    if (state.intervalDown) {
      this.onLeftMove();
    }
  },

  onLeftMove: function() {
    if (this.state.configuring) {
      return;
    }
    C.OperationSimuPanelAction.leftMove();
  },

  _rightMove: function(state) {
    if (state.intervalDown) {
      this.onRightMove();
    }
  },

  onRightMove: function() {
    if (this.state.configuring) {
      return;
    }
    C.OperationSimuPanelAction.rightMove();
  },

  _turnLeft: function(state) {
    if (state.down) {
      this.onTurnLeft();
    }
  },

  onTurnLeft: function() {
    if (this.state.configuring) {
      return;
    }
    C.OperationSimuPanelAction.turnLeft();
  },

  _turnRight: function(state) {
    if (state.down) {
      this.onTurnRight();
    }
  },

  onTurnRight: function() {
    if (this.state.configuring) {
      return;
    }
    C.OperationSimuPanelAction.turnRight();
  },

  _hold: function(state) {
    if (state.down) {
      this.onHold();
    }
  },

  onHold: function() {
    if (this.state.configuring) {
      return;
    }
    C.OperationSimuPanelAction.hold();
  },

  _retry: function(state) {
    if (state.intervalDown) {
      this.onRetry();
    }
  },

  onRetry: function() {
    if (this.state.configuring) {
      return;
    }
    C.OperationSimuPanelAction.retry(false);
  },

  _superRetry: function(state) {
    if (state.intervalDown) {
      this.onSuperRetry();
    }
  },

  onSuperRetry: function() {
    if (this.state.configuring) {
      return;
    }
    C.OperationSimuPanelAction.retry(true);
  },

  _clear: function(state) {
    if (state.down) {
      this.onClear();
    }
  },

  onClear: function() {
    if (this.state.configuring) {
      return;
    }

    C.OperationSimuPanelAction.clear();
  },

  _back: function(state) {
    if (state.intervalDown) {
      this.onBack();
    }
  },

  onBack: function() {
    if (this.state.configuring) {
      return;
    }
    C.OperationSimuPanelAction.back();
  },

  _forward: function(state) {
    if (state.intervalDown) {
      this.onForward();
    }
  },

  onForward: function() {
    if (this.state.configuring) {
      return;
    }
    C.OperationSimuPanelAction.forward();
  },

  _configure: function(state) {
    if (state.down) {
      this.setState({
        configuring: true
      });
    }
  },

  _createUrlParameters: function(state) {
    if (state.down) {
      this.onCreateUrlParameters();
    }
  },

  onCreateUrlParameters: function() {
    if (this.state.configuring) {
      return;
    }
    C.OperationSimuPanelAction.createUrlParameters();
  },

  onConfigure: function() {
    if (this.state.configuring) {
      return;
    }

    this.setState({ configuring: true });
  },

  onChange: function() {
    this.setState({
      seed: C.SimuStore.seed()
    });
  },

  onSetUrl: function() {
    this.setState({
      urlParameters: C.SimuStore.urlParameters()
    });

    setTimeout(function() {
      $('#url-output').select();
    }, 0);
  },

  _changeModeToEdit: function(state) {
    if (state.down) {
      this.onChangeModeToEdit();
    }
  },

  onChangeModeToEdit: function() {
    if (this.state.configuring) {
      return;
    }
    C.OperationSimuPanelAction.changeModeToEdit();
  },

  _changeModeToReplay: function(state) {
    if (state.down) {
      this.onChangeModeToReplay();
    }
  },

  onChangeModeToReplay: function() {
    if (this.state.configuring) {
      return;
    }
    C.OperationSimuPanelAction.changeModeToReplay();
  },

  _backToEditMode: function(state) {
    if (state.down) {
      this.onBackToEditMode();
    }
  },

  onBackToEditMode: function() {
    if (this.state.configuring || !this.state.before) {
      return;
    }
    C.OperationSimuPanelAction.backToEditMode();
  },

  onConfigChange: function() {
    this.setState({
      configuring: false,
      keyConfig: C.ConfigStore.keyConfig(C.Constants.Mode.Simu)
    });
  },

  onConfigCancel: function() {
    this.setState({
      configuring: false
    });
  },

  render: function() {
    var url = '';
    if (!!this.state.urlParameters) {
      url = location.href.split('?')[0] + '?' + this.state.urlParameters;
    }

    return React.createElement("div", {className: "operation-panel"}, 
        React.createElement("h1", null, "OPERATION"), 
        React.createElement("div", {className: "operation-mode-panel"}, 
          React.createElement("div", {className: "operation-simu-panel"}, 
            React.createElement("a", {className: "operation-btn", href: "javascript:void(0)", onClick: this.onBack}, "<"), 
            React.createElement("a", {className: "operation-btn", href: "javascript:void(0)", onClick: this.onForward}, ">"), 
            React.createElement("a", {className: "operation-btn", href: "javascript:void(0)", onClick: this.onRetry}, "リトライ"), 
            React.createElement("a", {className: "operation-btn", href: "javascript:void(0)", onClick: this.onSuperRetry}, "スーパーリトライ"), 
            React.createElement("a", {className: "operation-btn", href: "javascript:void(0)", onClick: this.onClear}, "クリア"), 

            React.createElement("div", {className: "operation-sub-title"}, "MODE"), 
            React.createElement("a", {className: "operation-btn", href: "javascript:void(0)", onClick: this.onChangeModeToReplay}, "Replay"), 
            React.createElement("a", {className: "operation-btn", href: "javascript:void(0)", onClick: this.onChangeModeToEdit}, "Edit"), 
            (!!this.state.before) ?
              React.createElement("a", {className: "operation-btn", href: "javascript:void(0)", onClick: this.onBackToEditMode}, "戻る")
              : "", 

            React.createElement("div", {className: "operation-sub-title"}, "TOOL"), 
            React.createElement("a", {className: "operation-btn", href: "javascript:void(0)", onClick: this.onCreateUrlParameters}, "URL出力"), 
            React.createElement("a", {className: "operation-btn", href: "javascript:void(0)", onClick: this.onConfigure}, "設定"), 
            React.createElement("textarea", {id: "url-output", className: "url", readOnly: "true", value: url}), 

            React.createElement("div", {className: "bottom"}, 
              React.createElement("span", {className: "seed"}, "seed: ", ('000000' + this.state.seed).slice(-6))
            )
          ), 
          this.state.configuring ? React.createElement(ConfigPanel, null) : false
        )
      )
  }
});


/**
 * @jsx React.DOM
 */
var ReplayPanel = React.createClass({displayName: "ReplayPanel",
  componentWillMount: function() {
    C.ReplayPanelAction.initialize(this.props.context);
  },

  render: function() {
    return React.createElement("div", {className: "main-panel"}, 
             React.createElement(LeftReplayPanel, null), 
             React.createElement(FieldReplayPanel, null), 
             React.createElement(NextReplayPanel, null), 
             React.createElement(OperationReplayPanel, {context: this.props.context}), 
             React.createElement("div", {className: "status"}, 
               React.createElement("div", {className: "mode"}, "Replay"), 
               React.createElement("div", {className: "version"}, "Ver. ", C.Constants.Version)
             )
           )
  }
});


/**
 * @jsx React.DOM
 */
var SimuPanel = React.createClass({displayName: "SimuPanel",
  componentWillMount: function() {
    C.SimuPanelAction.initialize(this.props.context);
  },

  componentWillReceiveProps: function(nextProps) {
    C.SimuPanelAction.initialize(nextProps.context);
  },

  render: function() {
    return React.createElement("div", {className: "main-panel"}, 
             React.createElement(LeftSimuPanel, null), 
             React.createElement(FieldSimuPanel, null), 
             React.createElement(NextSimuPanel, null), 
             React.createElement(OperationSimuPanel, {context: this.props.context}), 
             React.createElement("div", {className: "status"}, 
               React.createElement("div", {className: "mode"}, "Simu"), 
               React.createElement("div", {className: "version"}, "Ver. ", C.Constants.Version)
             )
           )
  }
});
