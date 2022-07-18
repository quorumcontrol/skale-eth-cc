

export const playOffVerbs = [
  'poetry slam',
  'stare off',
  'round of pictionary',
  'dice game',
  'three legged race'
]

export function randomPlayoffVerb() {
  return playOffVerbs[Math.floor(Math.random()*playOffVerbs.length)];
}

export const verbs:Record<number, Record<number, string>> = {
  0: {
    2: "smashes",
    3: "crushes",
    5: "shatters",
    7: "pulps",
    8: "shatters"
  },
  1: {
    0: "covers",
    4: "disproves",
    8: "covers",
    11: "wraps",
  },
  2: {
    1: "cut",
    3: "decapitates",
    7: "shreds",
    9: "minces"
  },
  3: {
    1: "eats",
    4: "poisons",
    9: "consumes",
    11: "swallows",
  },
  4: {
    0: "vaporizes",
    5: "ignores",
    6: "extinguishes",
    9: "nerve pinches",
  },
  5: {
    2: "tricks",
    6: "reflects",
    8: "reflects on",
    10: "sees around",
  },
  6: {
    1: "burns",
    3: "fries",
    7: "cooks",
    9: "grills"
  },
  7: {
    2: "infects",
    4: "burns",
    9: "hearburns",
  },
  8: {
    2: "lands on",
    4: "enchants",
    6: "douses",
    7: "freezes",
    10: "upstages",
  },
  9: {
    0: "acquires",
    3: "chokes",
    5: "loves",
    11: "seduces",
  },
  10: {
    1: "outshines",
    4: "stymies",
    6: "obscures",
    9: "breaks"
  },
  11: {
    0: "drills",
    5: "cracks",
    6: "shreds",
    8: "magnifys at",
    10: "blinds",
  }
}
