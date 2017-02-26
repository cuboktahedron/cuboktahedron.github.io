$(function() {
  $('.pattern p.steps').each(function() {
    var $this = $(this);
    var pattern = $(this).text();
    var r = /[UDRLFB]w?'?2?|[MSE]'?2?|\([ruf]'?2?\)/ig

    $this.text('');
    while ((m = r.exec(pattern)) != null) {
      $(this).append('<span>' + m[0] + '</span>');
    }
  });

  $('.pattern img').click(function() {
    var $type = $(this).closest('.type');
    var rotation;
    // TODO: ここはレイアウトの移行が完了留守まで暫定的な対処
    if ($type.length === 0) {
      rotation = $(this).closest('.pattern').find('.steps').text();
    } else {
      rotation = $type.find('.steps').text();
    }
    var params = [
      'setup=' + setupRotation() + reverseSetup(rotation) + reverseScrambleMarks(rotation),
      'rotation=' + rotation,
    ];

    var url = '/q/cube/i333Simu/?' + params.join('&');

    $('#modal').remove();
    $('body').append('<div id="modal">');
    $('#modal').empty().iziModal({
      iframe: true,
      width: 320,
      iframeHeight: 356,
      iframeURL: url,
    });

    $('#modal').iziModal('open', this);
  });

  /**
   * 逆手回し手順を生成する。
   */
  function reverseScrambleMarks(scramble) {
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

    return marks.join('');
  }

  /**
   * F-R面が毎回変わるようにランダムでy軸回転させる手順を生成する。
   */
  function setupRotation() {
    var headRotation = '';
    var n = Math.floor((Math.random() * 4));
    var i;
    for (i = 0; i < n; i++) {
      headRotation += 'y';
    }
    return headRotation;
  }

  // 持ち替え手順の補正用テーブルの定義
  var rotTable = (function() {
    var table = [];
    table["Uw"] = "y";
    table["Dw"] = "y'";
    table["Rw"] = "x";
    table["Lw"] = "x'";
    table["Fw"] = "z";
    table["Bw"] = "z'";
    table["u"]  = "y";
    table["r"]  = "x";
    table["f"]  = "z";
    table["x"]  = table["r"];
    table["y"]  = table["u"];
    table["z"]  = table["f"];

    for (mark in table) {
      if(table[mark].indexOf("'") !== -1) {
        table[mark + "'"] = table[mark].replace("'", "");
      } else {
        table[mark + "'"] = table[mark] + "'";
      }
      table[mark + "2"] = table[mark] + "2";
      table[mark + "'2"] = table[mark] + "'2";
    }

    return table;
  })();

  /**
   * セットアップ手順の持ち替え補正を行う。
   *
   * シミュレータの基準面はU(黄)-F(赤)-R(緑)だが、
   * reverseScrambleMarks関数で生成したセットアップ手順では
   * 生成元となった手順に持ち替え手順があった場合、
   * 基準面が変わってしまっているので補正手順を入れる。
   */
  function reverseSetup(scramble) {
    var r = /[UDRLFB]w'?2?|[xyz]'?2?|\(([urf]'?2?)\)/g;
    var mark;
    var m;
    var headSetup = "";

    while ((m = r.exec(scramble)) != null) {
      if (m[1] == null) {
        mark = m[0];
      } else {
        mark = m[1];
      }

      headSetup += rotTable[mark];
    }

    return headSetup;
  };
});

