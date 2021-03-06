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
      rotation: '',
      velocity: 30,
      visibles: '',
      zoom: '100',
      x: -50,
      y: 30,
      z: -50,
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
    renderer.setSize(
      D.initialParams.zoom * (320 / 100),
      D.initialParams.zoom * (320 / 100)
    );

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

  var setupping = false;
  var setup = function() {
    if (setupping) {
      return false;
    }
    C.cube.setCubes(resetCubes(D.initialParams.visibles));
    setupping = true;
    preRecess = 60;
    postRecess = 0;

    setTimeout(function() {
      C.cube.setup(D.initialParams.setup, rotateForSetup);
      setupping = false;
      dirty = false;

      var x, y, z;
      var cube;
      for (x = 0; x < 3; x++) {
        for (y = 0; y < 3; y++) {
          for (z = 0; z < 3; z++) {
            cube = C.cube.cubes[x][y][z];
            cube.visible = true;
          }
        }
      }
    }, 100);
  };

  var resetCubes = function(visibless) {
    var visibleFaces = visibless.split(',').map(function(face) {
      var faceOfPiece = function(face) {
        switch(face[0]) {
          case 'l': return 0;
          case 'r': return 1;
          case 'u': return 2;
          case 'd': return 3;
          case 'b': return 4;
          case 'f': return 5;
          default: return -1;
        }
      }

      var sortedFace = face.split('').sort();
      var color = sortedFace.shift();

      switch (sortedFace.join('')) {
        case 'dfr': return { piece: 0, face: faceOfPiece(face), color: color };
        case 'dr': return { piece: 1, face: faceOfPiece(face), color: color };
        case 'bdr': return { piece: 2, face: faceOfPiece(face), color: color };
        case 'fr': return { piece: 3, face: faceOfPiece(face), color: color };
        case 'r': return { piece: 4, face: faceOfPiece(face), color: color };
        case 'br': return { piece: 5, face: faceOfPiece(face), color: color };
        case 'fru': return { piece: 6, face: faceOfPiece(face), color: color };
        case 'ru': return { piece: 7, face: faceOfPiece(face), color: color };
        case 'bru': return { piece: 8, face: faceOfPiece(face), color: color };
        case 'df': return { piece: 9, face: faceOfPiece(face), color: color };
        case 'd': return { piece: 10, face: faceOfPiece(face), color: color };
        case 'bd': return { piece: 11, face: faceOfPiece(face), color: color };
        case 'f': return { piece: 12, face: faceOfPiece(face), color: color };
        case '': return { piece: 13, face: faceOfPiece(face), color: color };
        case 'b': return { piece: 14, face: faceOfPiece(face), color: color };
        case 'fu': return { piece: 15, face: faceOfPiece(face), color: color };
        case 'u': return { piece: 16, face: faceOfPiece(face), color: color };
        case 'bu': return { piece: 17, face: faceOfPiece(face), color: color };
        case 'dfl': return { piece: 18, face: faceOfPiece(face), color: color };
        case 'dl': return { piece: 19, face: faceOfPiece(face), color: color };
        case 'bdl': return { piece: 20, face: faceOfPiece(face), color: color };
        case 'fl': return { piece: 21, face: faceOfPiece(face), color: color };
        case 'l': return { piece: 22, face: faceOfPiece(face), color: color };
        case 'bl': return { piece: 23, face: faceOfPiece(face), color: color };
        case 'flu': return { piece: 24, face: faceOfPiece(face), color: color };
        case 'lu': return { piece: 25, face: faceOfPiece(face), color: color };
        case 'blu': return { piece: 26, face: faceOfPiece(face), color: color };
        default: return {piece: -1, face: -1, color: -1 };
      }
    });

    var visibleOrigin = $.extend(true, {}, C.cubeDefs.origin);

    for (x = 0; x < 3; x++) {
      for (y = 0; y < 3; y++) {
        for (z = 0; z < 3; z++) {
          var pieceNo = x * 9 + y * 3 + z;

          for (i = 0; i < 6; i++) {
            var visible = visibleFaces.find(function(visibleFace) {
              return visibleFace.piece === pieceNo && visibleFace.face === i;
            });
            if (visibless && !visible) {
              visibleOrigin[x][y][z][i] = null;
            } else if (visible) {
              visibleOrigin[x][y][z][i] = visible.color;
            }
          }
        }
      }
    }

    var x, y, z, i;
    var cube;
    var cubes = [];
    var size = 10;
    var materials;

    rotateStack = [];
    currentRot = null;
    rest = 0;
    postRecess = 0;

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
              if (visibleOrigin[x][y][z][i] != null) {
                materials.push(new THREE.MeshLambertMaterial({ color: C.cubeDefs.colors[visibleOrigin[x][y][z][i]], side: THREE.DoubleSide}));
              } else {
                materials.push(new THREE.MeshLambertMaterial({ color: 0x000000, transparent: true, opacity: 0.15}));
              }
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
            cube.visible = false;
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

    if (preRecess > 0) {
      preRecess--;
      return;
    }

    if (postRecess > 0) {
      postRecess--;
      if (postRecess === 0) {
        setup();

        if ($('#chk-repeat').hasClass('checked')) {
          C.cube.setup(D.initialParams.rotation, rotate);
        }
      }

      return;
    }

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
      if (rotateStack.length === 0) {
        postRecess = 90;
      }
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

    D.renderer.render(D.scene, D.camera);
  }

  D.initialParams = analyzeUrlParameters();

  var rotateStack = [];
  var currentRot;
  var rest;
  var preRecess;
  var postRecess;
  var velocity = D.initialParams.velocity;
  var angularVelocity = ((Math.PI / 2) / velocity);

  initScene();
  setup();
  C.cube.setCubes(resetCubes(D.initialParams.visibles))
  render();

  velocity = D.initialParams.velocity;
  var canvasWidth = $('#stage canvas').width();
  $('#lc').css('width', canvasWidth + 'px');

  var rotate = function(mark) {
    rotateStack.push(mark);
  };

  $('.velocity-changer').click(function() {
    var $this = $(this);

    var v = $this.data('diff');
    velocity += v;
    if (velocity < 1) {
      velocity = 1;
    } else if (velocity > 180) {
      velocity = 180;
    }
  });

  $('#repeat-wrapper').click(function() {
    $('#chk-repeat').toggleClass('checked');
  });

  var dirty = false;
  $('#stage canvas').click(function() {
    if (setupping) {
      return;
    }

    if (dirty) {
      setup();
    } else {
      dirty = true;
      C.cube.setup(D.initialParams.rotation, rotate);
    }
  });
});

