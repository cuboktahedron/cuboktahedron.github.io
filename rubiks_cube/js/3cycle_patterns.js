$(function() {

  const makeDom = () => {
    const froms = [];

    const keyComparator = (key1, key2) => {
      return steckers[key1] < steckers[key2] ? -1 : 1;
    }

    const solves = $.extend(true, {}, solvesDef);
    Object.keys(solvesDef).forEach(function(fromKey) {
      solves[fromKey] = solves[fromKey] || {}

      Object.keys(solvesDef[fromKey]).forEach(function(toKey) {
        if (!solvesDef[fromKey][toKey]) {
          return;
        }

        solves[fromKey][toKey] = solvesDef[fromKey][toKey];
        solves[toKey][fromKey] = $.extend({}, solvesDef[fromKey][toKey], { insertFirst: false });
      });
    });

    Object.keys(solves).sort(keyComparator).forEach(function (fromKey) {
      const fromSolve = solves[fromKey];
      const fromData = {};
      fromData.part = fromKey;
      fromData.tos = []

      Object.keys(fromSolve).sort(keyComparator).forEach(function(toKey) {
        const toSolve = fromSolve[toKey];
        if (!toSolve) {
          return;
        }

        const toData = {};
        toData.part = toKey;
        toData.visibles = `${fromKey}3,${toKey}0,drf4`;

        const setup = toSolve.s;
        const insert = insertSteps[toSolve.ins];
        const interchange = toSolve.ic;
        const invSetup =  reverseScrambleMarks(setup);
        const invInsert = reverseScrambleMarks(insert);
        const invInterchange = reverseScrambleMarks(interchange);
        let a1, b1, a2, b2
        if (toSolve.insertFirst) {
          a1 = insert;
          b1 = interchange;
          a2 = invInsert;
          b2 = invInterchange;
        } else {
          a1 = interchange;
          b1 = insert;
          a2 = invInterchange;
          b2 = invInsert;
        }

        console.log(`${setup}${a1}${b1}${a2}${b2}${invSetup}`, optimizeSteps(`${setup}${a1}${b1}${a2}${b2}${invSetup}`));
        toData.steps = optimizeSteps(`${setup}${a1}${b1}${a2}${b2}${invSetup}`);
        toData.steps2 = `[${setup}:${a1},${b1}]`;
        fromData.tos.push(toData);
      });

      froms.push(fromData);
    });

    $patterns = $('#patterns');
    froms.forEach(function(from) {
      const fromPart = from.part.toUpperCase();
      const fromStecker = steckers[from.part];

      const $from = $('<div class="form" />');
      const $fromHead = $(`<h4>${fromPart}(${fromStecker})</h4>`);
      $patterns.append($fromHead);

      from.tos.forEach(function(to) {
        const toPart = to.part.toUpperCase();
        const toStecker = steckers[to.part];

        $to = $(`<div class="to"
                      data-from="${from.part}" data-to="${to.part}"
                      data-steps="${to.steps}" data-visibles="${to.visibles}" />`);
        $to.append(`<span>${fromPart} -> ${toPart}(${fromStecker}${toStecker})</span>`);
        $to.append(`<span>${to.steps2}</span>`);

        $patterns.append($to);
      });
    });
  }

  $(document).on('click', '.to', function() {
    let $this = $(this);
    let rotation = $this.data('steps');
    let visibles = $this.data('visibles');
    let params = [
      'rotation=' + rotation,
      'visibles=' + visibles
    ];

   let url = '/q/cube/i333Simu/?' + params.join('&');

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

  function optimizeSteps(steps) {
    const r = /[UDRLFB]w?'?2?|[MSExyz]'?2?|\([urf]'?2?\)/g;
    const marks = [];

    let m;
    while ((m = r.exec(steps)) != null) {
      let step = m[0];
      let mark = step[0];
      let isDouble = step.indexOf("2") !== -1;
      let isReverse = step.indexOf("'") !== -1;
      let isWithW = step.indexOf("w") !== -1;
      let isURF = step.indexOf("(") !== -1;

      if (isWithW) {
        mark += "w";
      }
      if (isURF) {
        mark = step[1];
      }

      let rotNum;
      if (isDouble) {
        rotNum = 2;
      } else if (isReverse) {
        rotNum = 3;
      } else {
        rotNum = 1;
      }

      marks.push({
        mark,
        rotNum
      });
    }

    const optimizedMarks = [];
    while (marks.length >= 2) {
      let option1 = marks.shift();
      let option2 = marks.shift();

      if (option1.mark !== option2.mark) {
        optimizedMarks.push(option1);
        marks.unshift(option2);
      } else {
        option2.rotNum = (option1.rotNum + option2.rotNum) % 4;
        marks.unshift(option2);
      }
    }

    if (marks.length == 1) {
      optimizedMarks.push(marks.shift());
    }

    return optimizedMarks.map(option => {
      if (option.mark.match(/[urf]/)) {
        if(option.rotNum === 1) {
          return "(" + option.mark+ ")";
        } else if (option.rotNum === 2) {
          return "(" + option.mark + "2)";
        } else if (option.rotNum === 3) {
          return "(" + option.mark+ "')";
        }
      } else {
        if (option.rotNum === 1) {
          return option.mark;
        } else if (option.rotNum === 2) {
          return option.mark + "2";
        } else if (option.rotNum === 3) {
          return option.mark + "'";
        }
      }
      return "";
    }).join("");
  }

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

  let steckers = {
    ubl: "あ",
    dlb: "い",
    dfl: "う",
    ulf: "え",
    blu: "か",
    bdl: "き",
    fld: "く",
    ful: "け",
    bur: "さ",
    brd: "し",
    fdr: "す",
    fru: "せ",
    urb: "た",
    dbr: "ち",
    drf: "つ",
    ufr: "て",
    lub: "な",
    lbd: "に",
    ldf: "ぬ",
    lfu: "ね",
    rbu: "ら",
    rdb: "り",
    rfd: "る",
    ruf: "れ",
  };

  let insertSteps = {
    "D-a": "RUR'",
    "D-b": "RU'R'",
    "D-c": "RU2R'",
    "D-d": "(u)L'U'L(u')",
    "D-e": "(u)L'UL(u')",
    "D-f": "F'U2F",
    "D-g": "RU'R'U2RUR'",
    "U-a": "R'F'R2FR",
    "U-b": "L'D2L",
    "U-c": "R'D'R",
    "U-d": "L'U2RU2L",
    "L-a": "U'RU",
    "L-b": "RU'R'URU'R'URU'R'U",
    "L-c": "UR2U'",
    "B-a": "UL'U'",
    "B-b": "RU'R'U2RUR'",
    "B-c": "U'L2U",
  };

  const solvesDef = {
    ubl: {  // あ
        dfl: { s: "", ins: "L-c", ic: "L2", insertFirst: true },
        ulf: { s: "U2", ins: "U-a", ic: "U", insertFirst: true },
        bdl: { s: "", ins: "L-c", ic: "L", insertFirst: true },
        ful: { s: "", ins: "L-c", ic: "L'", insertFirst: true },
        bur: { s: "L2U", ins: "D-a", ic: "D", insertFirst: true },
        brd: { s: "LBU'", ins: "U-c", ic: "U2", insertFirst: true },
        fru: { s: "L2", ins: "D-d", ic: "D", insertFirst: true },
        urb: { s: "L2U", ins: "D-g", ic: "D", insertFirst: true },
        dbr: { s: "(u)", ins: "B-c", ic: "R2", insertFirst: true },
        ufr: { s: "U2", ins: "U-a", ic: "U2", insertFirst: true },
        lbd: { s: "(u)", ins: "B-c", ic: "R'", insertFirst: true },
        ldf: { s: "BL2", ins: "L-a", ic: "L", insertFirst: true },
        lfu: { s: "BL2", ins: "L-a", ic: "L2", insertFirst: true },
        rbu: { s: "(u)", ins: "B-c", ic: "R", insertFirst: true },
        rdb: { s: "U'BU'", ins: "U-a", ic: "U2", insertFirst: true },
        ruf: { s: "L2", ins: "D-a", ic: "D", insertFirst: true },
      },
    dlb: {  // い
        ubl: { s: "U2", ins: "D-g", ic: "D2", insertFirst: true },
        ulf: { s: "U'", ins: "D-g", ic: "D2", insertFirst: true },
        blu: { s: "", ins: "D-c", ic: "D2", insertFirst: true },
        ful: { s: "U'", ins: "D-a", ic: "D2", insertFirst: true },
        bur: { s: "", ins: "D-e", ic: "D2", insertFirst: true },
        brd: { s: "L(u)R'", ins: "B-a", ic: "R2", insertFirst: true },
        fru: { s: "", ins: "D-d", ic: "D2", insertFirst: true },
        urb: { s: "U", ins: "D-g", ic: "D2", insertFirst: true },
        ufr: { s: "", ins: "D-g", ic: "D2", insertFirst: true },
        lub: { s: "", ins: "D-f", ic: "D2", insertFirst: true },
        ldf: { s: "B'L", ins: "L-a", ic: "L2", insertFirst: true },
        lfu: { s: "", ins: "D-b", ic: "D2", insertFirst: true },
        rbu: { s: "U2", ins: "D-b", ic: "D2", insertFirst: true },
        ruf: { s: "", ins: "D-a", ic: "D2", insertFirst: true },
    },
    dfl: {  // う
        ulf: { s: "U'", ins: "D-g", ic: "D", insertFirst: true },
        dlb: { s: "B2U", ins: "D-g", ic: "D", insertFirst: true },
        blu: { s: "", ins: "D-c", ic: "D", insertFirst: true },
        ful: { s: "U'", ins: "D-a", ic: "D", insertFirst: true },
        bur: { s: "", ins: "D-e", ic: "D", insertFirst: true },
        brd: { s: "BU", ins: "D-a", ic: "D", insertFirst: true },
        fru: { s: "", ins: "D-d", ic: "D", insertFirst: true },
        urb: { s: "U", ins: "D-g", ic: "D", insertFirst: true },
        dbr: { s: "BU", ins: "D-d", ic: "D", insertFirst: true },
        ufr: { s: "", ins: "D-g", ic: "D", insertFirst: true },
        lub: { s: "", ins: "D-f", ic: "D", insertFirst: true },
        lfu: { s: "", ins: "D-b", ic: "D", insertFirst: true },
        rbu: { s: "U2", ins: "D-b", ic: "D", insertFirst: true },
        rdb: { s: "BU", ins: "D-g", ic: "D", insertFirst: true },
        ruf: { s: "", ins: "D-a", ic: "D", insertFirst: true },
    },
    ulf: {  // え
        blu: { s: "", ins: "L-b", ic: "L", insertFirst: true },
        bdl: { s: "B'", ins: "L-b", ic: "L", insertFirst: true },
        fld: { s: "", ins: "L-b", ic: "L'", insertFirst: true },
        bur: { s: "B", ins: "L-b", ic: "L", insertFirst: true },
        brd: { s: "B2", ins: "L-b", ic: "L", insertFirst: true },
        fru: { s: "L'", ins: "U-b", ic: "U2", insertFirst: true },
        urb: { s: "U'", ins: "U-a", ic: "U2", insertFirst: true },
        ufr: { s: "U'", ins: "U-a", ic: "U", insertFirst: true },
        lbd: { s: "B'U'", ins: "U-a", ic: "U'", insertFirst: true },
        ldf: { s: "UBL2", ins: "L-a", ic: "L", insertFirst: true },
        rbu: { s: "BU'", ins: "U-a", ic: "U'", insertFirst: true },
        rdb: { s: "BU'", ins: "U-a", ic: "U2", insertFirst: true },
        ruf: { s: "L2", ins: "D-a", ic: "D2", insertFirst: true },
      },
    blu: {  // か
        bdl: { s: "(u)R'", ins: "B-a", ic: "R'", insertFirst: true },
        fld: { s: "L", ins: "L-b", ic: "L2", insertFirst: true },
        brd: { s: "(u)R'", ins: "B-a", ic: "R2", insertFirst: true },
        fru: { s: "", ins: "U-b", ic: "U2", insertFirst: true },
        urb: { s: "L'U", ins: "D-g", ic: "D2", insertFirst: true },
        lbd: { s: "U'", ins: "L-a", ic: "L2", insertFirst: true },
        ldf: { s: "U'", ins: "L-a", ic: "L'", insertFirst: true },
        lfu: { s: "", ins: "U-b", ic: "U", insertFirst: true },
        rbu: { s: "", ins: "U-b", ic: "U'", insertFirst: true },
        ruf: { s: "L'", ins: "D-a", ic: "D2", insertFirst: true },
      },
    bdl: {  // き
        dfl: { s: "L", ins: "L-c", ic: "L", insertFirst: true },
        fld: { s: "L'U'", ins: "D-g", ic: "D", insertFirst: true },
        urb: { s: "LU2", ins: "U-a", ic: "U'", insertFirst: true },
        ufr: { s: "L'", ins: "D-g", ic: "D", insertFirst: true },
        lub: { s: "U'L", ins: "L-c", ic: "L2", insertFirst: true },
        ldf: { s: "L'U'", ins: "D-d", ic: "D", insertFirst: true },
        lfu: { s: "L'U2", ins: "D-a", ic: "D", insertFirst: true },
        rbu: { s: "L'U", ins: "D-d", ic: "D", insertFirst: true },
        ruf: { s: "L'", ins: "D-a", ic: "D", insertFirst: true },
      },
    fld: {  // く
        ubl: { s: "LU'", ins: "D-a", ic: "D2", insertFirst: true },
        dlb: { s: "L'", ins: "L-b", ic: "L'", insertFirst: true },
        ful: { s: "L'U'", ins: "U-a", ic: "U'", insertFirst: true },
        bur: { s: "LU", ins: "D-a", ic: "D2", insertFirst: true },
        brd: { s: "L2(u)R'", ins: "B-a", ic: "R2", insertFirst: true },
        fru: { s: "L", ins: "D-d", ic: "D2", insertFirst: true },
        urb: { s: "L'U'", ins: "U-a", ic: "U2", insertFirst: true },
        ufr: { s: "L'U'", ins: "U-a", ic: "U", insertFirst: true },
        lub: { s: "LU'", ins: "D-d", ic: "D2", insertFirst: true },
        lbd: { s: "LU2", ins: "D-a", ic: "D2", insertFirst: true },
        lfu: { s: "UL'", ins: "L-b", ic: "L2", insertFirst: true },
        rbu: { s: "LU", ins: "D-d", ic: "D2", insertFirst: true },
        rdb: { s: "L'BU'", ins: "U-a", ic: "U2", insertFirst: true },
        ruf: { s: "L", ins: "D-a", ic: "D2", insertFirst: true },
      },
    ful: {  // け
        blu: { s: "LU'", ins: "D-g", ic: "D", insertFirst: true },
        bdl: { s: "L'", ins: "L-c", ic: "L2", insertFirst: true },
        bur: { s: "U'", ins: "U-c", ic: "U2", insertFirst: true },
        brd: { s: "L2(u)R2", ins: "B-a", ic: "R'", insertFirst: true },
        fru: { s: "L", ins: "D-d", ic: "D", insertFirst: true },
        urb: { s: "LU", ins: "D-g", ic: "D", insertFirst: true },
        ufr: { s: "L", ins: "D-g", ic: "D", insertFirst: true },
        lub: { s: "U'", ins: "U-c", ic: "U'", insertFirst: true },
        lbd: { s: "UL", ins: "L-a", ic: "L", insertFirst: true },
        ldf: { s: "UL", ins: "L-a", ic: "L2", insertFirst: true },
        rbu: { s: "LU", ins: "D-d", ic: "D", insertFirst: true },
        rdb: { s: "LBU", ins: "D-g", ic: "D", insertFirst: true },
        ruf: { s: "U'", ins: "U-c", ic: "U", insertFirst: true },
    },
    bur: {  // さ
        blu: { s: "(u)", ins: "B-a", ic: "R'", insertFirst: true },
        bdl: { s: "(u)", ins: "B-a", ic: "R2", insertFirst: true },
        brd: { s: "(u)", ins: "B-a", ic: "R", insertFirst: true },
        fru: { s: "B", ins: "U-b", ic: "U2", insertFirst: true },
        ufr: { s: "BL'", ins: "D-g", ic: "D2", insertFirst: true },
        lub: { s: "U", ins: "U-c", ic: "U", insertFirst: true },
        ldf: { s: "L2(u)", ins: "B-a", ic: "R'", insertFirst: true },
        lfu: { s: "B", ins: "U-b", ic: "U", insertFirst: true },
        rdb: { s: "BLU'", ins: "U-a", ic: "U2", insertFirst: true },
      },
    brd: {  // し
        bdl: { s: "(u)R", ins: "B-a", ic: "R", insertFirst: true },
        fru: { s: "B2", ins: "U-b", ic: "U2", insertFirst: true },
        ldf: { s: "L'U(u)R", ins: "B-a", ic: "R2", insertFirst: true },
        lfu: { s: "B2", ins: "U-b", ic: "U", insertFirst: true },
        rbu: { s: "U'(u)R", ins: "B-a", ic: "R2", insertFirst: true },
      },
    fru: {  // せ
        bdl: { s: "U2(u)R'", ins: "B-a", ic: "R'", insertFirst: true },
        rbu: { s: "U2", ins: "U-b", ic: "U", insertFirst: true },
      },
    urb: {  // た
        brd: { s: "U2B2", ins: "L-b", ic: "L", insertFirst: true },
        fru: { s: "B2", ins: "D-d", ic: "D2", insertFirst: true },
        ldf: { s: "BL", ins: "L-a", ic: "L2", insertFirst: true },
        lfu: { s: "BL", ins: "L-a", ic: "L'", insertFirst: true },
        ruf: { s: "B2", ins: "D-a", ic: "D2", insertFirst: true },
      },
    dbr: {  // ち
        dlb: { s: "L2U'", ins: "D-g", ic: "D'", insertFirst: true },
        ulf: { s: "U'", ins: "D-g", ic: "D'", insertFirst: true },
        blu: { s: "", ins: "D-c", ic: "D'", insertFirst: true },
        bdl: { s: "LU2", ins: "D-g", ic: "D'", insertFirst: true },
        fld: { s: "L'U'", ins: "D-g", ic: "D'", insertFirst: true },
        ful: { s: "U'", ins: "D-a", ic: "D'", insertFirst: true },
        bur: { s: "", ins: "D-e", ic: "D'", insertFirst: true },
        fru: { s: "", ins: "D-d", ic: "D'", insertFirst: true },
        urb: { s: "U", ins: "D-g", ic: "D'", insertFirst: true },
        ufr: { s: "", ins: "D-g", ic: "D'", insertFirst: true },
        lub: { s: "", ins: "D-f", ic: "D'", insertFirst: true },
        ldf: { s: "L'U'", ins: "D-d", ic: "D'", insertFirst: true },
        lfu: { s: "", ins: "D-b", ic: "D'", insertFirst: true },
        rbu: { s: "U2", ins: "D-b", ic: "D'", insertFirst: true },
        ruf: { s: "", ins: "D-a", ic: "D'", insertFirst: true },
    },
    ufr: {  // て
        blu: { s: "L", ins: "U-a", ic: "U'", insertFirst: true },
        brd: { s: "B2L", ins: "U-a", ic: "U'", insertFirst: true },
        urb: { s: "", ins: "U-a", ic: "U", insertFirst: true },
        lub: { s: "B'", ins: "U-a", ic: "U", insertFirst: true },
        lbd: { s: "B'", ins: "U-a", ic: "U2", insertFirst: true },
        lfu: { s: "L'B'", ins: "U-a", ic: "U", insertFirst: true },
        rbu: { s: "B", ins: "U-a", ic: "U2", insertFirst: true },
        rdb: { s: "B", ins: "U-a", ic: "U", insertFirst: true },
    },
    lub: {  // な
        ulf: { s: "BU'", ins: "D-g", ic: "D2", insertFirst: true },
        brd: { s: "BU", ins: "D-a", ic: "D2", insertFirst: true },
        fru: { s: "B", ins: "D-d", ic: "D2", insertFirst: true },
        urb: { s: "BU2", ins: "D-a", ic: "D2", insertFirst: true },
        lbd: { s: "L", ins: "L-a", ic: "L", insertFirst: true },
        ldf: { s: "L", ins: "L-a", ic: "L2", insertFirst: true },
        rbu: { s: "BU2", ins: "D-g", ic: "D2", insertFirst: true },
    },
    lbd: {  // に
        dfl: { s: "B'", ins: "L-c", ic: "L2", insertFirst: true },
        bur: { s: "BU2", ins: "D-d", ic: "D'", insertFirst: true },
        brd: { s: "BU", ins: "D-a", ic: "D'", insertFirst: true },
        fru: { s: "B", ins: "D-d", ic: "D'", insertFirst: true },
        urb: { s: "BU2", ins: "D-a", ic: "D'", insertFirst: true },
        dbr: { s: "(u)R'", ins: "B-c", ic: "R'", insertFirst: true },
        rbu: { s: "(u)R'", ins: "B-c", ic: "R2", insertFirst: true },
        rdb: { s: "BU", ins: "D-g", ic: "D'", insertFirst: true },
        ruf: { s: "B", ins: "D-a", ic: "D'", insertFirst: true },
      },
    ldf: {  // ぬ
        fru: { s: "L'U", ins: "U-b", ic: "U", insertFirst: true },
        ufr: { s: "LB", ins: "D-g", ic: "D'", insertFirst: true },
        lbd: { s: "L'", ins: "L-a", ic: "L'", insertFirst: true },
        rbu: { s: "L'U", ins: "U-b", ic: "U2", insertFirst: true },
      },
    lfu: {  // ね
        fru: { s: "U", ins: "U-b", ic: "U", insertFirst: true },
        lub: { s: "", ins: "L-a", ic: "L", insertFirst: true },
        lbd: { s: "", ins: "L-a", ic: "L2", insertFirst: true },
        ldf: { s: "", ins: "L-a", ic: "L'", insertFirst: true },
        rbu: { s: "U", ins: "U-b", ic: "U2", insertFirst: true },
        ruf: { s: "L'B", ins: "D-a", ic: "D2", insertFirst: true },
      },
    rbu: {  // ら
        ruf: { s: "B'", ins: "D-a", ic: "D'", insertFirst: true },
      },
    rdb: {  // り
        dlb: { s: "(r)", ins: "B-b", ic: "D", insertFirst: true },
        blu: { s: "B'U", ins: "D-a", ic: "D2", insertFirst: true },
        bdl: { s: "B'U2", ins: "D-d", ic: "D2", insertFirst: true },
        fru: { s: "B'", ins: "D-d", ic: "D2", insertFirst: true },
        urb: { s: "(r)", ins: "B-b", ic: "D'", insertFirst: true },
        lub: { s: "(r)", ins: "B-b", ic: "D2", insertFirst: true },
        ldf: { s: "L'B'U'", ins: "D-d", ic: "D2", insertFirst: true },
        lfu: { s: "U'B'", ins: "D-d", ic: "D2", insertFirst: true },
        rbu: { s: "BU", ins: "U-a", ic: "U", insertFirst: true },
        ruf: { s: "B'", ins: "D-a", ic: "D2", insertFirst: true },
      },
    ruf: {  // れ
        bur: { s: "", ins: "U-c", ic: "U", insertFirst: true },
        brd: { s: "B", ins: "U-c", ic: "U", insertFirst: true },
        lub: { s: "", ins: "U-c", ic: "U2", insertFirst: true },
        ldf: { s: "L2", ins: "U-c", ic: "U2", insertFirst: true },
      },
  }

  makeDom();
});

function optimizeSteps(steps) {
  const r = /[UDRLFB]w?'?2?|[MSExyz]'?2?|\([urf]'?2?\)/g;
  const marks = [];

  let m;
  while ((m = r.exec(steps)) != null) {
    let step = m[0];
    let mark = step[0];
    let isDouble = step.indexOf("2") !== -1;
    let isReverse = step.indexOf("'") !== -1;
    let isWithW = step.indexOf("w") !== -1;
    let isURF = step.indexOf("(") !== -1;

    if (isWithW) {
      mark += "w";
    }
    if (isURF) {
      mark = step[1];
    }

    console.log(step, isDouble, isReverse, isWithW, isURF);
    let rotNum;
    if (isDouble) {
      rotNum = 2;
    } else if (isReverse) {
      rotNum = 3;
    } else {
      rotNum = 1;
    }

    marks.push({
      mark,
      rotNum
    });
  }

  const optimizedMarks = [];
  while (marks.length >= 2) {
    let option1 = marks.shift();
    let option2 = marks.shift();

    if (option1.mark !== option2.mark) {
      optimizedMarks.push(option1);
      marks.unshift(option2);
    } else {
      option2.rotNum = (option1.rotNum + option2.rotNum) % 4;
      marks.unshift(option2);
    }
  }

  if (marks.length == 1) {
    optimizedMarks.push(marks.shift());
  }

  return optimizedMarks.map(option => {
    if (option.mark.match(/[urf]/)) {
      if(option.rotNum === 1) {
        return "(" + option.mark+ ")";
      } else if (option.rotNum === 2) {
        return "(" + option.mark + "2)";
      } else if (option.rotNum === 3) {
        return "(" + option.mark+ "')";
      }
    } else {
      if (option.rotNum === 1) {
        return option.mark;
      } else if (option.rotNum === 2) {
        return option.mark + "2";
      } else if (option.rotNum === 3) {
        return option.mark + "'";
      }
    }
    return "";
  }).join("");
}
