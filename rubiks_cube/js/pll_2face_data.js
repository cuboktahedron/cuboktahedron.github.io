var Forms = {
  AAA: 'a:a:a',
  AAB: 'a:a:b',
  ABA: 'a:b:a',
  ABB: 'a:b:b',
  ABC: 'a:b:c'
};

var Pll2Face = [
  {
    no: 1,
    perm: 'U',
    types: [
      { type: 'a', formF: Forms.ABA, formR: Forms.ABA },
      { type: 'b', formF: Forms.ABA, formR: Forms.AAA },
      { type: 'c', formF: Forms.AAA, formR: Forms.ABA },
      { type: 'd', formF: Forms.ABA, formR: Forms.ABA },
    ],
  }, {
    no: 2,
    perm: 'U',
    types: [
      { type: 'a', formF: Forms.ABA, formR: Forms.ABA },
      { type: 'b', formF: Forms.ABA, formR: Forms.AAA },
      { type: 'c', formF: Forms.AAA, formR: Forms.ABA },
      { type: 'd', formF: Forms.ABA, formR: Forms.ABA },
    ],
  }, {
    no: 3,
    perm: 'A',
    types: [
      { type: 'a', formF: Forms.ABA, formR: Forms.ABC },
      { type: 'b', formF: Forms.ABC, formR: Forms.ABB },
      { type: 'c', formF: Forms.ABB, formR: Forms.AAB },
      { type: 'd', formF: Forms.AAB, formR: Forms.ABA },
    ],
  }, {
    no: 4,
    perm: 'A',
    types: [
      { type: 'a', formF: Forms.ABC, formR: Forms.ABA },
      { type: 'b', formF: Forms.ABA, formR: Forms.ABB },
      { type: 'c', formF: Forms.ABB, formR: Forms.AAB },
      { type: 'd', formF: Forms.AAB, formR: Forms.ABC },
    ],
  }, {
    no: 5,
    perm: 'Z',
    types: [
      { type: 'a', formF: Forms.ABA, formR: Forms.ABA },
      { type: 'b', formF: Forms.ABA, formR: Forms.ABA },
      { type: 'c', formF: Forms.ABA, formR: Forms.ABA },
      { type: 'd', formF: Forms.ABA, formR: Forms.ABA },
    ],
  }, {
    no: 6,
    perm: 'H',
    types: [
      { type: 'a', formF: Forms.ABA, formR: Forms.ABA },
      { type: 'b', formF: Forms.ABA, formR: Forms.ABA },
      { type: 'c', formF: Forms.ABA, formR: Forms.ABA },
      { type: 'd', formF: Forms.ABA, formR: Forms.ABA },
    ],
  }, {
    no: 7,
    perm: 'E',
    types: [
      { type: 'a', formF: Forms.ABC, formR: Forms.ABC },
      { type: 'b', formF: Forms.ABC, formR: Forms.ABC },
      { type: 'c', formF: Forms.ABC, formR: Forms.ABC },
      { type: 'd', formF: Forms.ABC, formR: Forms.ABC },
    ],
  }, {
    no: 8,
    perm: 'T',
    types: [
      { type: 'a', formF: Forms.AAB, formR: Forms.ABC },
      { type: 'b', formF: Forms.ABC, formR: Forms.ABB },
      { type: 'c', formF: Forms.ABB, formR: Forms.ABA },
      { type: 'd', formF: Forms.ABA, formR: Forms.AAB },
    ],
  }, {
    no: 9,
    perm: 'V',
    types: [
      { type: 'a', formF: Forms.AAB, formR: Forms.ABC },
      { type: 'b', formF: Forms.ABC, formR: Forms.ABC },
      { type: 'c', formF: Forms.ABC, formR: Forms.ABB },
      { type: 'd', formF: Forms.ABB, formR: Forms.AAB },
    ],
  }, {
    no: 10,
    perm: 'F',
    types: [
      { type: 'a', formF: Forms.ABC, formR: Forms.ABC },
      { type: 'b', formF: Forms.ABC, formR: Forms.ABC },
      { type: 'c', formF: Forms.ABC, formR: Forms.AAA },
      { type: 'd', formF: Forms.AAA, formR: Forms.ABC },
    ],
  }, {
    no: 11,
    perm: 'R',
    types: [
      { type: 'a', formF: Forms.ABA, formR: Forms.ABC },
      { type: 'b', formF: Forms.ABC, formR: Forms.ABC },
      { type: 'c', formF: Forms.ABC, formR: Forms.ABB },
      { type: 'd', formF: Forms.ABB, formR: Forms.ABA },
    ],
  }, {
    no: 12,
    perm: 'R',
    types: [
      { type: 'a', formF: Forms.ABA, formR: Forms.AAB },
      { type: 'b', formF: Forms.AAB, formR: Forms.ABC },
      { type: 'c', formF: Forms.ABC, formR: Forms.ABC },
      { type: 'd', formF: Forms.ABC, formR: Forms.ABA },
    ],
  }, {
    no: 13,
    perm: 'J',
    types: [
      { type: 'a', formF: Forms.ABB, formR: Forms.ABB },
      { type: 'b', formF: Forms.ABB, formR: Forms.ABB },
      { type: 'c', formF: Forms.ABB, formR: Forms.AAA },
      { type: 'd', formF: Forms.AAA, formR: Forms.ABB },
    ],
  }, {
    no: 14,
    perm: 'J',
    types: [
      { type: 'a', formF: Forms.AAB, formR: Forms.AAB },
      { type: 'b', formF: Forms.AAB, formR: Forms.AAB },
      { type: 'c', formF: Forms.AAB, formR: Forms.AAA },
      { type: 'd', formF: Forms.AAA, formR: Forms.AAB },
    ],
  }, {
    no: 15,
    perm: 'Y',
    types: [
      { type: 'a', formF: Forms.ABC, formR: Forms.AAB },
      { type: 'b', formF: Forms.AAB, formR: Forms.ABB },
      { type: 'c', formF: Forms.ABB, formR: Forms.ABC },
      { type: 'd', formF: Forms.ABC, formR: Forms.ABC },
    ],
  }, {
    no: 16,
    perm: 'G',
    types: [
      { type: 'a', formF: Forms.ABA, formR: Forms.ABC },
      { type: 'b', formF: Forms.ABC, formR: Forms.AAB },
      { type: 'c', formF: Forms.AAB, formR: Forms.ABC },
      { type: 'd', formF: Forms.ABC, formR: Forms.ABA },
    ],
  }, {
    no: 17,
    perm: 'G',
    types: [
      { type: 'a', formF: Forms.ABC, formR: Forms.ABC },
      { type: 'b', formF: Forms.ABC, formR: Forms.AAB },
      { type: 'c', formF: Forms.AAB, formR: Forms.ABA },
      { type: 'd', formF: Forms.ABA, formR: Forms.ABC },
    ],
  }, {
    no: 18,
    perm: 'G',
    types: [
      { type: 'a', formF: Forms.ABA, formR: Forms.ABB },
      { type: 'b', formF: Forms.ABB, formR: Forms.ABC },
      { type: 'c', formF: Forms.ABC, formR: Forms.ABC },
      { type: 'd', formF: Forms.ABC, formR: Forms.ABA },
    ],
  }, {
    no: 19,
    perm: 'G',
    types: [
      { type: 'a', formF: Forms.ABA, formR: Forms.ABC },
      { type: 'b', formF: Forms.ABC, formR: Forms.ABB },
      { type: 'c', formF: Forms.ABB, formR: Forms.ABC },
      { type: 'd', formF: Forms.ABC, formR: Forms.ABA },
    ],
  }, {
    no: 20,
    perm: 'N',
    types: [
      { type: 'a', formF: Forms.AAB, formR: Forms.AAB },
      { type: 'b', formF: Forms.AAB, formR: Forms.AAB },
      { type: 'c', formF: Forms.AAB, formR: Forms.AAB },
      { type: 'd', formF: Forms.AAB, formR: Forms.AAB },
    ],
  }, {
    no: 21,
    perm: 'N',
    types: [
      { type: 'a', formF: Forms.ABB, formR: Forms.ABB },
      { type: 'b', formF: Forms.ABB, formR: Forms.ABB },
      { type: 'c', formF: Forms.ABB, formR: Forms.ABB },
      { type: 'd', formF: Forms.ABB, formR: Forms.ABB },
    ],
  }
];

