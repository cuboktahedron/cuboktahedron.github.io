var C = {};

$(function() {
  'use strict';

  var W = 0, B = 1, O = 2, G = 3, R = 4, Y = 5, K = -1;

  C.cubeDefs = {
    colors: (function() {
      var colors = [];
      colors[W] = 0xffffff;
      colors[Y] = 0xffff00;
      colors[O] = 0xff8c00;
      colors[G] = 0x00ff00;
      colors[R] = 0xff0000;
      colors[B] = 0x0000ff;
      colors[K] = 0x000000;

      return colors;
    })(),

    origin:
    [
      [
        [
          [K, G, K, W, K, R],
          [K, G, K, W, K, K],
          [K, G, K, W, O, K],
        ], [
          [K, G, K, K, K, R],
          [K, G, K, K, K, K],
          [K, G, K, K, O, K],
        ], [
          [K, G, Y, K, K, R],
          [K, G, Y, K, K, K],
          [K, G, Y, K, O, K],
        ]
      ], [
        [
          [K, K, K, W, K, R],
          [K, K, K, W, K, K],
          [K, K, K, W, O, K],
        ], [
          [K, K, K, K, K, R],
          [K, K, K, K, K, K],
          [K, K, K, K, O, K],
        ], [
          [K, K, Y, K, K, R],
          [K, K, Y, K, K, K],
          [K, K, Y, K, O, K],
        ]
      ], [
        [
          [B, K, K, W, K, R],
          [B, K, K, W, K, K],
          [B, K, K, W, O, K],
        ], [
          [B, K, K, K, K, R],
          [B, K, K, K, K, K],
          [B, K, K, K, O, K],
        ], [
          [B, K, Y, K, K, R],
          [B, K, Y, K, K, K],
          [B, K, Y, K, O, K],
        ]
      ],
    ],

    cubeNos: {
      'U': [  6,  7,  8, 15, 16, 17, 24, 25, 26 ],
      'D': [  0,  1,  2,  9, 10, 11, 18, 19, 20 ],
      'R': [  0,  1,  2,  3,  4,  5,  6,  7,  8 ],
      'L': [ 18, 19, 20, 21, 22, 23, 24, 25, 26 ],
      'F': [  0,  3,  6,  9, 12, 15, 18, 21, 24 ],
      'B': [  2,  5,  8, 11, 14, 17, 20, 23, 26 ],
      'E': [  3,  4,  5, 12, 13, 14, 21, 22, 23 ],
      'M': [  9, 10, 11, 12, 13, 14, 15, 16, 17 ],
      'S': [  1,  4,  7, 10, 13, 16, 19, 22, 25 ],
    },

    rotDefs: {
      "U":  new THREE.Vector3( 0, -1,  0),
      "D":  new THREE.Vector3( 0,  1,  0),
      "R":  new THREE.Vector3( 1,  0,  0),
      "L":  new THREE.Vector3(-1,  0,  0),
      "F":  new THREE.Vector3( 0,  0,  1),
      "B":  new THREE.Vector3( 0,  0, -1),
      "E":  new THREE.Vector3( 0,  1,  0),
      "M":  new THREE.Vector3(-1,  0,  0),
      "S":  new THREE.Vector3( 0,  0,  1),
    },

    transform: {
      "U":  [ 24, 15,  6, 25, 16,  7, 26, 17,  8 ],
      "D":  [  2, 11, 20,  1, 10, 19,  0,  9, 18 ],
      "R":  [  6,  3,  0,  7,  4,  1,  8,  5,  2 ],
      "L":  [ 20, 23, 26, 19, 22, 25, 18, 21, 24 ],
      "F":  [ 18,  9,  0, 21, 12,  3, 24, 15,  6 ],
      "B":  [  8, 17, 26,  5, 14, 23,  2, 11, 20 ],
      "E":  [  5, 14, 23,  4, 13, 22,  3, 12, 21 ],
      "M":  [ 11, 14, 17, 10, 13, 16,  9, 12, 15 ],
      "S":  [ 19, 10,  1, 22, 13,  4, 25, 16,  7 ],
    }
  };

  var rot;

  var cb = C.cubeDefs.cubeNos;
  cb["Uw"] = cb["U"].concat(cb["E"]);
  cb["Dw"] = cb["D"].concat(cb["E"]);
  cb["Rw"] = cb["R"].concat(cb["M"]);
  cb["Lw"] = cb["L"].concat(cb["M"]);
  cb["Fw"] = cb["F"].concat(cb["S"]);
  cb["Bw"] = cb["B"].concat(cb["S"]);
  cb["x"]  = cb["Rw"].concat(cb["L"]);
  cb["y"]  = cb["Uw"].concat(cb["D"]);
  cb["z"]  = cb["Fw"].concat(cb["B"]);

  for (rot in cb) {
    cb[rot + "'"] = cb[rot];
  }

  cb["(r)"]  = cb["x"];
  cb["(r')"] = cb["x'"];
  cb["(u)"]  = cb["y"];
  cb["(u')"] = cb["y'"];
  cb["(f)"]  = cb["z"];
  cb["(f')"] = cb["z'"];

  var rd = C.cubeDefs.rotDefs;
  rd["Uw"] = rd["U"];
  rd["Dw"] = rd["D"];
  rd["Rw"] = rd["R"];
  rd["Lw"] = rd["L"];
  rd["Fw"] = rd["F"];
  rd["Bw"] = rd["B"];
  rd["x"]  = rd["R"];
  rd["y"]  = rd["U"];
  rd["z"]  = rd["F"];

  for (rot in rd) {
    rd[rot + "'"] = rd[rot].clone().multiplyScalar(-1);
  }

  rd["(r)"]  = rd["x"];
  rd["(r')"] = rd["x'"];
  rd["(u)"]  = rd["y"];
  rd["(u')"] = rd["y'"];
  rd["(f)"]  = rd["z"];
  rd["(f')"] = rd["z'"];

  var tf = C.cubeDefs.transform;

  for (rot in tf) {
    tf[rot + "'"] = tf[rot].concat().reverse();
  }

  var mixedTf = [];
  mixedTf["Uw"] = tf.U.concat(tf["E'"]);
  mixedTf["Dw"] = tf.D.concat(tf["E"]);
  mixedTf["Rw"] = tf.R.concat(tf["M'"]);
  mixedTf["Lw"] = tf.L.concat(tf["M"]);
  mixedTf["Fw"] = tf.F.concat(tf["S"]);
  mixedTf["Bw"] = tf.B.concat(tf["S'"]);
  mixedTf['x']  = mixedTf["Rw"].concat(tf["L'"]);
  mixedTf['y']  = mixedTf["Uw"].concat(tf["D'"]);
  mixedTf['z']  = mixedTf["Fw"].concat(tf["B'"]);

  for (rot in mixedTf) {
    tf[rot] = mixedTf[rot];
    tf[rot + "'"] = [];
    for (var n = 0; n < mixedTf[rot].length / 9; n++) {
      tf[rot + "'"] = tf[rot + "'"].concat(mixedTf[rot].slice(9 * n, 9 * (n + 1)).reverse());
    }
  }

  tf["(r)"]  = tf["x"];
  tf["(r')"] = tf["x'"];
  tf["(u)"]  = tf["y"];
  tf["(u')"] = tf["y'"];
  tf["(f)"]  = tf["z"];
  tf["(f')"] = tf["z'"];
});


