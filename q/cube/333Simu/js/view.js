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
      setup: '',
      velocity: 30,
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
    var controls;

    //var gridHelper = new THREE.GridHelper(200, 50);
    var axisHelper = new THREE.AxisHelper(1000);

    scene = new THREE.Scene();
    // scene.add(gridHelper);
    scene.add(axisHelper);

    // light
    light = new THREE.AmbientLight(0xffffff);
    scene.add(light);

    // camera
    camera = new THREE.PerspectiveCamera(45, D.params.width / D.params.height, 1, 1000);
    camera.position.set(D.initialParams.x, D.initialParams.y, D.initialParams.z);

    //renderer
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true,
    });
    renderer.setSize(D.params.width, D.params.height);
    renderer.setClearColor(D.params.backgroundColor);
    renderer.setPixelRatio(window.devicePixelRatio);

    $('#stage').append(renderer.domElement);

    // controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.rotateSpeed = 0.5;
    controls.enablePan = false;

    D.scene = scene;
    D.camera = camera;
    D.light = light;
    D.controls = controls;
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

  var setupping = false;
  var setup = function() {
    if (setupping) {
      return false;
    }
    C.cube.setCubes(resetCubes());
    setupping = true;

    setTimeout(function() {
      C.cube.setup(D.initialParams.setup, rotateForSetup);
      setupping = false;
    }, 100);

    velocity = D.initialParams.velocity;
    $('#txt-velocity').val(velocity);
    $('#txt-zoom').val(D.initialParams.zoom);
  };

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

    // remove if already exists
    if (C.cube.cubes) {
      cleanUp();
    }

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

  var cleanUp = function() {
    var x, y, z;
    var cube;
    for (x = 0; x < 3; x++) {
      for (y = 0; y < 3; y++) {
        for (z = 0; z < 3; z++) {
          cube = C.cube.cubes[x][y][z];
          D.scene.remove(cube);
          cube.geometry.dispose();
          $.each(cube.material.materials, function(index, material) {
            material.dispose();
          });
        }
      }
    }
  }

  var action = function() {
    var cubeNos = C.cubeDefs.cubeNos;

    if (!currentRot && rotateStack.length === 0) {
      return;
    }

    if (!currentRot) {
      currentRot = rotateStack.shift();
      rest = velocity;
      angularVelocity = ((Math.PI / 2) / velocity);
    }

    var rotDef = C.cubeDefs.rotDefs[currentRot];
    $.each(cubeNos[currentRot], function(j, cubeNo) {
      var z = cubeNo % 3;
      var y = parseInt(cubeNo / 3) % 3;
      var x = parseInt(cubeNo / 9);
      var cube = C.cube.cubes[x][y][z];
      var rotation = new THREE.Matrix4().makeRotationAxis(rotDef, angularVelocity);
      cube.applyMatrix(rotation);
    });

    if (rest > 0) {
      rest--;
    }

    if (rest === 0) {
      C.cube.rotate(currentRot);
      currentRot = null;
    }
  }

  var setting = false;
  $('.param').focusin(function() {
    setting = true;
  });

  $('.param').focusout(function() {
    setting = false;
    var x = $('#txt-camera-x').val();
    var y = $('#txt-camera-y').val();
    var z = $('#txt-camera-z').val();

    D.camera.position.set(x, y, z);
  });

  var render = function() {
    requestAnimationFrame(render);

    action();

    if (!setting) {
      var cameraPos = D.camera.position;
      $('#txt-camera-x').val(Math.round(cameraPos.x));
      $('#txt-camera-y').val(Math.round(cameraPos.y));
      $('#txt-camera-z').val(Math.round(cameraPos.z));
    }

    D.controls.update();
    D.renderer.render(D.scene, D.camera);
  }

  D.initialParams = analyzeUrlParameters();

  var rotateStack = [];
  var currentRot;
  var rest;
  var velocity = D.initialParams.velocity;
  var angularVelocity = ((Math.PI / 2) / velocity);

  initScene();
  setup();
  C.cube.setCubes(resetCubes())
  render();

  var rotate = function(mark) {
    rotateStack.push(mark);
  };

  $('.rotation').click(function() {
    var $this = $(this);
    var rot = $this.data('rot');
    rotate(rot);
  });

  $('#btn-create-image').click(function() {
    var canvas = $('#stage canvas')[0];
    var imageData = canvas.toDataURL('image/png');
    $('#img-capture').attr('src', imageData);
  });

  $('#btn-home').click(function() {
    D.camera.position.set(D.initialParams.x, D.initialParams.y, D.initialParams.z);
    D.scene.position.set(0, 0, 0);
  });

  $('#btn-scramble').click(function() {
    var scramble = $('#txt-scramble').val();
    C.cube.setup(scramble, rotate);
  });

  $('#btn-reverse').click(function() {
    var scramble = $('#txt-scramble').val();
    var reverseScramble = C.cube.reverseScrambleMarks(scramble);
    $('#txt-reverse-scramble').val(reverseScramble.join(''));
  });

  $('#btn-init').click(function() {
    setup();
  });

  $('#btn-velocity-down').click(function() {
    var v = $('#txt-velocity').val();
    if (v < 180) {
      v++;
    } else {
      v = 180;
    }
    velocity = v;
    $('#txt-velocity').val(v);
  });

  $('#btn-velocity-up').click(function() {
    var v = $('#txt-velocity').val();
    if (v > 1) {
      v--;
    }
    velocity = v;
    $('#txt-velocity').val(v);
  });

  $('#txt-velocity').change(function() {
    var v = $('#txt-velocity').val();
    if (isNaN(v)) {
      v = D.initialParams.velocity;
    } else if (v < 1) {
      v = 1;
    } else if (v > 180) {
      v = 180;
    }
    velocity = v;
    $('#txt-velocity').val(v);
  });

  var reverseSetup = function(scramble) {
    var r = /[UDRLFB]w'?2?|[xyz]'?2?|\(([urf]'?2?)\)/g;
    var mark;
    var rotTable = [];
    var m;
    rotTable["Uw"] = "y";
    rotTable["Dw"] = "y'";
    rotTable["Rw"] = "x";
    rotTable["Lw"] = "x'";
    rotTable["Fw"] = "z";
    rotTable["Bw"] = "z'";
    rotTable["u"]  = "y";
    rotTable["r"]  = "x";
    rotTable["f"]  = "z";
    rotTable["x"]  = rotTable["r"];
    rotTable["y"]  = rotTable["u"];
    rotTable["z"]  = rotTable["f"];

    for (var mark in rotTable) {
      if(rotTable[mark].indexOf("'") !== -1) {
        rotTable[mark + "'"] = rotTable[mark].replace("'", "");
      } else {
        rotTable[mark + "'"] = rotTable[mark] + "'";
      }
      rotTable[mark + "2"] = rotTable[mark] + "2";
      rotTable[mark + "'2"] = rotTable[mark] + "'2";
    }

    var headSetup = "";
    while ((m = r.exec(scramble)) != null) {
      if (m[1] == null) {
        mark = m[0];
      } else {
        mark = m[1];
      }

      headSetup += rotTable[mark];
      console.log(headSetup);
    }

    return headSetup;
  };

  $('#btn-iframe-url').click(function() {
    var x = $('#txt-camera-x').val();
    var y = $('#txt-camera-y').val();
    var z = $('#txt-camera-z').val();
    var scramble = $('#txt-scramble').val();
    var reverseScramble = $('#txt-reverse-scramble').val();
    var velocity = $('#txt-velocity').val();
    var setupRotation = $('#txt-setup-rotation').val();
    var setupRotation2 = $('#txt-setup-rotation2').val();
    var setup = setupRotation + D.initialParams.setup + reverseSetup(scramble) + reverseScramble + setupRotation2;
    var zoom = $('#txt-zoom').val();

    var r = /[UDRLFB]w?'?2?|[xyz]'?2?|\([urf]'?2?\)/g;

    var param = {};
    if (x != -50) {
      param.x = x;
    }

    if (y != 30) {
      param.y = y;
    }

    if (z != -50) {
      param.z = z;
    }

    if (setup != '') {
      param.setup = setup;
    }

    if (scramble != '') {
      param.rotation = scramble;
    }

    if (velocity != 30) {
      param.velocity = velocity;
    }

    if (zoom != 100) {
      param.zoom = zoom;
    }

    var urlParams = [];
    for (var p in param) {
      urlParams.push('' + p + '=' + param[p]);
    }

    var width = Math.round((zoom / 100) * 320);
    var height = width + 64;
    var urlWithoutParam = location.href.replace(/\?.*$/,'').replace('333Simu', 'i333Simu');
    var url = urlWithoutParam + '?' + urlParams.join('&');
    var tag = '<iframe src="' + url + '" width="' + width + '" height="' + height + '" scrolling="no" marginwidth="0" marginheight="0" frameborder="0" style="border:none;"></iframe>';
    $('#txt-iframe-url').val(tag).select();
    $('#iframe').html(tag);
  });
});

