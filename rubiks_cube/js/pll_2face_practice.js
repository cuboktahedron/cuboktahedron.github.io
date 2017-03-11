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
    "L'UL'U'L'U'L'ULUL2",
    "RU'RURURU'R'U'R2",
    "(r')RU'RD2R'URD2R2(r)",
    "R'2(r)U2R'D'RU'2(f')U'RU'(f)(r')",
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
    "(r')(u')URU'(u)(r)R2Uw'RU'R'UR'UwR2",
    "R2Uw'RU'RUR'UwR'2(u)RU'R'(u')",
    "Rw2U(r')(u)U'RU'R'URw'U2B'RB(f')",
    "R'U'(u)FR2UwR'URU'RUw'R'2(u')",
    "(f)U'RD'R2UR'DU'RD'R2UR'DR(f')",
    "LU'RU'2L'UR'LU'RU'2L'UR'U'",
  ];

  var permDescs = [
    'n2/U-perm',
    'n1/U-perm',
    'n4/A-perm',
    'n3/A-perm',
    'n5/Z-perm',
    'n6/H-perm',
    'n7/E-perm',
    'n8/T-perm',
    'n9/V-perm',
    'n10/F-perm',
    'n11/R-perm',
    'n12/R-perm',
    'n13/J-perm',
    'n14/J-perm',
    'n15/Y-perm',
    'n17/G-perm',
    'n16/G-perm',
    'n19/G-perm',
    'n18/G-perm',
    'n20/N-perm',
    'n21/N-perm',
  ];

  var yturns = ["", "(u)", "(u2)", "(u')" ];
  var rotU = ["", "U", "U2", "U'" ];

  var createNext = function() {
    var i = Math.floor(Math.random() * 21);
    var j = Math.floor(Math.random() * 4);
    var k = Math.floor(Math.random() * 4);
    var l = Math.floor(Math.random() * 4);

    var promise = $.Deferred().resolve().promise();
    promise = promise.then((function(number) {
      var steps = yturns[j] + rotU[l] + stepss[number] + yturns[k];

      return function() {
        var d = $.Deferred();
        setup(d, steps);
        setupDesc(i, j, k, l)
        return d.promise();
      };
    })(i)).then(function() {
      var d = $.Deferred();
      $('#perm img').on('click', function() {
        $(this).off('click');
        d.resolve();
      });
      return d.promise();
    }).then((function(number) {
      var steps = yturns[j] + rotU[l] + stepss[number] + yturns[k];

      return function() {
        var d = $.Deferred();
        reverseSetup(d, steps);
        return d.promise();
      };
    })(i)).then(createNext);
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

  var setupDesc = function(i, j, k, l) {
    $('#desc-header').text(permDescs[i]);
  };

  var reverseSetup = function(d, steps) {
    var rsteps = C.cube.reverseScrambleMarks(steps);
    C.cube.setup(rsteps, rotateForSetup);
    d.resolve();
  }

  $('#chk-answer-visible').change(function() {
    if ($(this).prop('checked')) {
      $('#desc-header').show();
    } else {
      $('#desc-header').hide();
    }
  });

  createNext();
});

