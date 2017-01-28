$(function() {
  'use strict';

  var D = {};

  var cubeNos = C.cubeDefs.cubeNos;
  var transform = C.cubeDefs.transform;

  D.setCubes = function(cubes) {
    D.cubes = cubes;
  }

  D.rotate = function(mark) {
    var previousCubes = $.extend(true, {}, D.cubes);
    $.each(transform[mark], function(index, toNo) {
      var cubeNo = cubeNos[mark][index];
      var z = cubeNo % 3;
      var y = parseInt(cubeNo / 3) % 3;
      var x = parseInt(cubeNo / 9);

      var zz = toNo % 3;
      var yy = parseInt(toNo / 3) % 3;
      var xx = parseInt(toNo / 9);

      D.cubes[xx][yy][zz] = previousCubes[x][y][z];
    });
  };

  D.setup = function(scramble, rotateFunc) {
    var r = /[UDRLFB]w?'?2?|[MSExyz]'?2?|\([urf]'?2?\)/g;
    var m;
    var mark;
    var isDouble;

    while ((m = r.exec(scramble)) != null) {
      mark = m[0];

      isDouble = mark.indexOf('2') !== -1;
      if (isDouble) {
        mark = mark.replace('2', '');
        rotateFunc(mark);
        rotateFunc(mark);
      } else {
        rotateFunc(mark);
      }
    }
  }

  D.reverseScrambleMarks = function(scramble) {
    var r = /[UDRLFB]w?'?2?|[MSExyz]'?2?|\([urf]'?2?\)/g;
    var m;
    var mark;
    var reverseMark;
    var marks = [];
    var isDouble;
    var isReverse;
    var isURF;
    var isWithW;
    var i;

    while ((m = r.exec(scramble)) != null) {
      marks.push(m[0]);
    }
    marks.reverse();

    for (i = 0; i < marks.length; i++) {
      mark = marks[i];
      isDouble = mark.indexOf("2") !== -1;
      isReverse = mark.indexOf("'") !== -1;
      isWithW = mark.indexOf("w") !== -1;
      isURF = mark.indexOf("(") !== -1;

      reverseMark = ""
      if (isURF) {
        reverseMark += "(" + mark[1];
        if (!isReverse) reverseMark += "'";
        if (isDouble) reverseMark += "2";
        reverseMark += ")";
      } else {
        if (isWithW) reverseMark += mark.substring(0, 2);
        if (!isWithW) reverseMark += mark[0];
        if (!isReverse) reverseMark += "'";
        if (isDouble) reverseMark += "2";
      }

      marks[i] = reverseMark;
    }

    return marks;
  }

  C.cube = D;
});
