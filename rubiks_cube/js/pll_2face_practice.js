$(function() {
  'use strict';

  var D = {};
  D.params = {
    width: 320,
    height: 320,
    backgroundColor: 0x404040,
  };

  var analyzeUrlParameters = function() {
    var params = {};
    var pair;
    var urlParams = decodeURI(location.search).substring(1).split('&');
    var i;
    for(i = 0; i < urlParams.length; i++) {
      pair = urlParams[i].split('=');
      params[pair[0]] = pair[1];
    }

    return $.extend({}, {
      x: -50,
      y: 30,
      z: -50,
      zoom: 100,
    }, params);
  };

  var initScene = function() {
    var scene;
    var light;
    var camera;
    var renderer;

    scene = new THREE.Scene();

    // light
    light = new THREE.AmbientLight(0xffffff);
    scene.add(light);

    // camera
    camera = new THREE.PerspectiveCamera(45, D.params.width / D.params.height, 1, 1000);
    camera.position.set(D.initialParams.x, D.initialParams.y, D.initialParams.z);
    camera.lookAt({x:0, y:0, z:0});

    //renderer
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true,
    });
    renderer.setSize(D.params.width, D.params.height);
    renderer.setClearColor(D.params.backgroundColor);
    renderer.setPixelRatio(window.devicePixelRatio);

    $('#stage').append(renderer.domElement);

    D.scene = scene;
    D.camera = camera;
    D.light = light;
    D.renderer = renderer;
  }

  var rotateForSetup = function(mark) {
    var cubeNos = C.cubeDefs.cubeNos;
    var rotDef = C.cubeDefs.rotDefs[mark];
    $.each(cubeNos[mark], function(j, cubeNo) {
      var z = cubeNo % 3;
      var y = parseInt(cubeNo / 3) % 3;
      var x = parseInt(cubeNo / 9);
      var cube = C.cube.cubes[x][y][z];
      var rotation = new THREE.Matrix4().makeRotationAxis(rotDef, Math.PI / 2);
      cube.applyMatrix(rotation);
    });

    C.cube.rotate(mark);
  }

  var resetCubes = function() {
    var colors = C.cubeDefs.colors;

    var x, y, z, i;
    var cube;
    var cubes = [];
    var size = 10;
    var materials;

    rotateStack = [];
    currentRot = null;
    rest = 0;

    for (x = 0; x < 3; x++) {
      cubes[x] = []
        for (y = 0; y < 3; y++) {
          cubes[x][y] = [];
          for (z = 0; z < 3; z++) {
            materials = [];

            for (i = 0; i < 6; i++) {
              materials.push(new THREE.MeshLambertMaterial({ color: colors[C.cubeDefs.origin[x][y][z][i]]}));
            }

            cube = new THREE.Mesh(
                new THREE.BoxGeometry(size, size, size),
                new THREE.MultiMaterial(materials)
                );

            cube.position.set(
                (x - 1) * (size + 1),
                (y - 1) * (size + 1),
                (z - 1) * (size + 1)
                );

            D.scene.add(cube);
            cubes[x][y][z] = cube;
          }
        }
    }

    return cubes;
  }

  var action = function() {
    var cubeNos = C.cubeDefs.cubeNos;
    var i;
    var rot;

    if (rotateStack.length === 0) {
      return;
    }

    $.each(rotateStack, function(i, rot) {
      var rotDef = C.cubeDefs.rotDefs[rot];
      $.each(cubeNos[rot], function(j, cubeNo) {
        var z = cubeNo % 3;
        var y = parseInt(cubeNo / 3) % 3;
        var x = parseInt(cubeNo / 9);
        var cube = C.cube.cubes[x][y][z];
        var rotation = new THREE.Matrix4().makeRotationAxis(rotDef, angularVelocity);
        cube.applyMatrix(rotation);
      });

      C.cube.rotate(rot);
    });

    rotateStack.clear();
  }

  var render = function() {
    requestAnimationFrame(render);
    D.renderer.render(D.scene, D.camera);
  }

  D.initialParams = analyzeUrlParameters();

  var rotateStack = [];
  var currentRot;
  var rest;
  var velocity = D.initialParams.velocity;
  var angularVelocity = Math.PI / 2;

  initScene();
  C.cube.setCubes(resetCubes());
  velocity = D.initialParams.velocity;
  render();

  var stepss = [
    "RU'RURURU'R'U'R2",
    "L'UL'U'L'U'L'ULUL2",
    "R'2(r)U2R'D'RU'2(f')U'RU'(f)(r')",
    "(r')RU'RD2R'URD2R2(r)",
    "UR'U'RU'RURU'R'URUR2U'R'U",
    "M'2UM'2U2M'2UM'2",
    "(r')RU'R'DRUR'D2L'ULUw(u')L'U'L(r)",
    "RUR'U'R'FR2U'R'U'RUR'F'",
    "R'UR'U'(u)(r2)R'UR'U'R2(u)(r)R'U'RUR(r)",
    "U'R'URU'R'2F'(f)R'FRD(f')(r)UR'U'R2(r')",
    "R'U2RU'2R'FRUR'U'R'F'R2U'",
    "F'R'U'RF'R'U(u')R'U'R'URBR2(u)",
    "RUR'F'RUR'U'R'FR2U'R'U'",
    "R'U'RBR'U'RU(r')RU'R'2FRF(r)",
    "(r')R'2FwR2U'RU(r')RU'(u)(r)R'UFU'R'(r)",
    "R2Uw'RU'RUR'UwR'2(u)RU'R'(u')",
    "(r')(u')URU'(u)(r)R2Uw'RU'R'UR'UwR2",
    "R'U'(u)FR2UwR'URU'RUw'R'2(u')",
    "Rw2U(r')(u)U'RU'R'URw'U2B'RB(f')",
    "(f)U'RD'R2UR'DU'RD'R2UR'DR(f')",
    "LU'RU'2L'UR'LU'RU'2L'UR'U'",
  ];

  var yturns = ["", "(u)", "(u2)", "(u')" ];
  var rotU = ["", "U", "U2", "U'" ];

  var createNext = function() {
    if (filters.isAllOff) {
      setTimeout(createNext, 1000);
      return;
    }

    var next = filters.next();
    var j = Math.floor(Math.random() * 4);
    var k = Math.floor(Math.random() * 4);

    var promise = $.Deferred().resolve().promise();
    promise = promise.then((function() {
      var steps = yturns[j] + rotU[k] + stepss[next.no] + rotU[next.typeNo];

      return function() {
        var d = $.Deferred();
        setup(d, steps);
        setupDesc(next);
        return d.promise();
      };
    })(next)).then(function() {
      var d = $.Deferred();
      var timerId;
      var answerTime = $('#txt-time-to-answer').val();
      $('#perm img').on('click', function() {
        $('#desc-header').show();
        $(this).off('click');
        clearTimeout(timerId);
        d.resolve();
      });
      timerId = setTimeout(function() {
        $('#desc-header').show();
        $(this).off('click');
        d.resolve();
      }, answerTime);
      return d.promise();
    }).then(function() {
      var d = $.Deferred();
      var timerId;
      var nextTime = $('#txt-time-to-next').val();
      $('#perm img').on('click', function() {
        $('#desc-header').hide();
        $(this).off('click');
        clearTimeout(timerId);
        d.resolve();
      });
      timerId = setTimeout(function() {
        $('#desc-header').hide();
        $(this).off('click');
        d.resolve();
      }, nextTime);
      return d.promise();
    }).then((function() {
      var steps = yturns[j] + rotU[k] + stepss[next.no] + rotU[next.typeNo];

      return function() {
        var d = $.Deferred();
        reverseSetup(d, steps);
        return d.promise();
      };
    })()).then(createNext);
  };

  var setup = function(d, steps) {
    var $img = $('#perm img');
    var canvas = $('#stage canvas')[0];
    var imageData;

    C.cube.setup(steps, rotateForSetup);
    setTimeout(function() {
      var imageData = canvas.toDataURL('image/png');
      $img.attr('src', imageData);
      d.resolve();
    }, 100);
  }

  var setupDesc = function(next) {
    $('#desc-header').text('n' + (next.no + 1) + '-' + (next.typeNo + 1) + '/' + next.perm + '-perm');
  };

  var reverseSetup = function(d, steps) {
    var rsteps = C.cube.reverseScrambleMarks(steps);
    C.cube.setup(rsteps, rotateForSetup);
    d.resolve();
  };

  $('#txt-time-to-answer, #txt-time-to-next').change(function() {
    var val = $(this).val();
    if (isNaN(val)) {
      val = 0;
    } else if(val <= 0) {
      val = 0;
    } else if(val >= 60000) {
      val = 60000;
    }

    $(this).val(val);
  });

  var initFilter = function() {
    var $filter = $('#filter');
    $filter.append('<p class="type-num"></p>');
    var $permFilter = $('<div class="perm-filters"></div>');
    var $formFilter = $('<div class="formfilters"></div>');
    $filter.append($permFilter);
    $filter.append($formFilter);
    var perms = ['U', 'A', 'Z', 'H', 'E', 'T', 'V', 'F', 'R', 'J', 'Y', 'G', 'N'];
    perms.forEach(function(perm) {
      $permFilter.append('<a class="check on">' + perm + '</a>');

      var permData = Pll2Face.filter(function(pll) {
        return pll.perm === perm;
      });
      var $perm = $('<div class="perm cf"><div class="perm-line" data-perm="' + perm + '"><p class="name">' + perm + '-perm</p></div></div>');

      permData.forEach(function(permData) {
        var $pll = $('<div class="pll"></div>');
        $pll.append('<div class="pll-line"><p class="no">n' + permData.no + '</p><a class="check on">&nbsp;</a></div>');
        permData.types.forEach(function(type) {
          var $check = $(
            '<a class="type check on" data-form-f="' + type.formF + '"'
            + ' data-form-r="' + type.formR + '"'
            + ' data-perm="' + perm + '"'
            + ' data-type="' + type.type + '"'
            + ' data-pll-no="' + permData.no + '"'
            + '>' + type.type + '</a>');
          $pll.append($check);
        });
        $perm.append($pll);
      });

      $filter.append($perm);
    });

    $filter.find('.perm-filters a.check').click(function() {
      var $this = $(this);
      var isOn = $this.removeClass('partOn').toggleClass('on').hasClass('on');
      var perm = $this.text();
      var $permLine = $filter.find('.perm-line[data-perm=' + perm + ']');
      if (isOn) {
        $permLine.parent().find('a.check').addClass('on');
      } else {
        $permLine.parent().find('a.check').removeClass('on');
      }

      filters.refresh();
    }).on('update', function() {
      var $this = $(this);
      var perm = $this.text();
      var $types = $filter.find('.perm-line[data-perm=' + perm + ']').parent().find('a.type.check');
      var $typesWithOn = $types.filter('.on');
      if ($typesWithOn.length === 0) {
        $this.removeClass('on').removeClass('partOn');
      } else if ($typesWithOn.length < $types.length) {
        $this.removeClass('on').addClass('partOn');
      } else {
        $this.removeClass('partOn').addClass('on');
      }
    });

    $filter.find('.pll-line > a.check').click(function() {
      var $this = $(this);
      var isOn = $this.removeClass('partOn').toggleClass('on').hasClass('on');
      if (isOn) {
        $this.closest('.pll').find('a.type.check').addClass('on');
      } else {
        $this.closest('.pll').find('a.type.check').removeClass('on');
      }

      filters.refresh();
    }).on('update', function() {
      var $this = $(this);
      var $typesWithOn = $this.closest('.pll').find('a.type.check.on');
      if ($typesWithOn.length === 0) {
        $this.removeClass('on').removeClass('partOn');
      } else if ($typesWithOn.length < 4) {
        $this.removeClass('on').addClass('partOn');
      } else {
        $this.removeClass('partOn').addClass('on');
      }
    });

    $filter.find('a.type.check').click(function() {
      $(this).toggleClass('on');
      filters.refresh();
    });

    ['F', 'R'].forEach(function(dir) {
      var $dir = $('<div class="dir" data-dir="' + dir + '"><p>' + dir + '</p></dir>');
      ['AAA', 'AAB', 'ABA', 'ABB', 'ABC'].forEach(function(form) {
        var $form = $('<a class="check wide on">' + form + '</a>');
        $dir.append($form);
      });
      $formFilter.append($dir);
    });

    $formFilter.find('.dir a.check').click(function() {
      var $this = $(this);
      var isOn = $this.removeClass('partOn').toggleClass('on').hasClass('on');
      var dir = $this.parent().find('p').text();
      var form = $this.text();
      var dataName = 'data-form-' + dir.toLowerCase();
      var findTarget = 'a.type.check[' + dataName + '="' + Forms[form] + '"]';
      if (isOn) {
        $filter.find(findTarget).addClass('on');
      } else {
        $filter.find(findTarget).removeClass('on');
      }

      filters.refresh();
    }).on('update', function() {
      var $this = $(this);
      var dir = $this.parent().find('p').text();
      var form = $this.text();
      var dataName = 'data-form-' + dir.toLowerCase();
      var findTarget = 'a.type.check[' + dataName + '="' + Forms[form] + '"]';
      var $types = $filter.find(findTarget);
      var $typesWithOn = $types.filter('.on');
      if ($typesWithOn.length === 0) {
        $this.removeClass('on').removeClass('partOn');
      } else if ($typesWithOn.length < $types.length) {
        $this.removeClass('on').addClass('partOn');
      } else {
        $this.removeClass('partOn').addClass('on');
      }
    });

    filters.refresh();
  };

  var typeToIndex = {
    'a': 0,
    'b': 1,
    'c': 2,
    'd': 3,
  };

  var filters = {
    get isAllOff() {
      return !$('#filter a.type.check').hasClass('on');
    },

    refresh: function() {
      var $types = $('#filter a.type.check');
      var types = [];
      var onNum;

      $types.each(function() {
        var $type = $(this);
        var no = $type.data('pll-no') - 1;
        var type = $type.data('type');
        if (!types[no]) {
          types[no] = [];
        }
        types[no][typeToIndex[type]] = $type;
      });

      this.types = types;
      $('#filter .pll-line > a.check').trigger('update');
      $('#filter .dir a.check').trigger('update');
      $('#filter .perm-filters a.check').trigger('update');

      onNum = $('#filter a.type.check.on').length;

      $('#filter .type-num').text(onNum + '/84');
    },

    next: function(no) {
      var no;
      var perm;
      var type;
      var $type;

      do {
        no = Math.floor(Math.random() * 84);
        perm = Math.floor(no / 4);
        type = no % 4;
        $type = this.types[perm][type];
      } while (!$type.hasClass('on'));

      return {
        no: perm,
        perm: $type.data('perm'),
        typeNo: typeToIndex[$type.data('type')]
      };
    }
  };

  initFilter();
  createNext();
});

