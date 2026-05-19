import { a as useNavigate, f as useParams, e as useSearch, r as reactExports, j as jsxRuntimeExports, S as Skeleton } from "./index-Blf-A8DR.js";
import { B as Badge } from "./badge-BrNtKZcv.js";
import { B as Button } from "./button-DCGMFvti.js";
import { L as Label, I as Input } from "./index-CVvtv_EE.js";
import { S as Switch } from "./switch-w5TrVpW9.js";
import { T as Textarea } from "./textarea-1rE5PUZ-.js";
import { u as useActor, b as useAuth, d as useQuery, I as InvoiceStatus, f as InvoicePositionTyp, c as createActor } from "./useAuthStore-Cbv7GIMf.js";
import { q as useMutation, L as Layout } from "./Layout-ClH0znk9.js";
import { A as ArrowLeft } from "./arrow-left-94BJxSRC.js";
import { F as FileText } from "./users-DUrIKgtR.js";
import { P as Plus } from "./plus-DRvlFs_3.js";
import { T as Trash2 } from "./trash-2-XtlFfpOd.js";
import { S as Save } from "./save-Bo101srK.js";
import { S as Send } from "./send-ZOqThWmv.js";
import { P as Printer } from "./printer-Gnw4umDg.js";
import "./index-Dv8dTxpA.js";
import "./createLucideIcon-BzNCDVU7.js";
var browser = {};
var canPromise$1 = function() {
  return typeof Promise === "function" && Promise.prototype && Promise.prototype.then;
};
var qrcode = {};
var utils$1 = {};
let toSJISFunction;
const CODEWORDS_COUNT = [
  0,
  // Not used
  26,
  44,
  70,
  100,
  134,
  172,
  196,
  242,
  292,
  346,
  404,
  466,
  532,
  581,
  655,
  733,
  815,
  901,
  991,
  1085,
  1156,
  1258,
  1364,
  1474,
  1588,
  1706,
  1828,
  1921,
  2051,
  2185,
  2323,
  2465,
  2611,
  2761,
  2876,
  3034,
  3196,
  3362,
  3532,
  3706
];
utils$1.getSymbolSize = function getSymbolSize(version2) {
  if (!version2) throw new Error('"version" cannot be null or undefined');
  if (version2 < 1 || version2 > 40) throw new Error('"version" should be in range from 1 to 40');
  return version2 * 4 + 17;
};
utils$1.getSymbolTotalCodewords = function getSymbolTotalCodewords(version2) {
  return CODEWORDS_COUNT[version2];
};
utils$1.getBCHDigit = function(data) {
  let digit = 0;
  while (data !== 0) {
    digit++;
    data >>>= 1;
  }
  return digit;
};
utils$1.setToSJISFunction = function setToSJISFunction(f) {
  if (typeof f !== "function") {
    throw new Error('"toSJISFunc" is not a valid function.');
  }
  toSJISFunction = f;
};
utils$1.isKanjiModeEnabled = function() {
  return typeof toSJISFunction !== "undefined";
};
utils$1.toSJIS = function toSJIS(kanji2) {
  return toSJISFunction(kanji2);
};
var errorCorrectionLevel = {};
(function(exports$1) {
  exports$1.L = { bit: 1 };
  exports$1.M = { bit: 0 };
  exports$1.Q = { bit: 3 };
  exports$1.H = { bit: 2 };
  function fromString(string) {
    if (typeof string !== "string") {
      throw new Error("Param is not a string");
    }
    const lcStr = string.toLowerCase();
    switch (lcStr) {
      case "l":
      case "low":
        return exports$1.L;
      case "m":
      case "medium":
        return exports$1.M;
      case "q":
      case "quartile":
        return exports$1.Q;
      case "h":
      case "high":
        return exports$1.H;
      default:
        throw new Error("Unknown EC Level: " + string);
    }
  }
  exports$1.isValid = function isValid2(level) {
    return level && typeof level.bit !== "undefined" && level.bit >= 0 && level.bit < 4;
  };
  exports$1.from = function from(value, defaultValue) {
    if (exports$1.isValid(value)) {
      return value;
    }
    try {
      return fromString(value);
    } catch (e) {
      return defaultValue;
    }
  };
})(errorCorrectionLevel);
function BitBuffer$1() {
  this.buffer = [];
  this.length = 0;
}
BitBuffer$1.prototype = {
  get: function(index) {
    const bufIndex = Math.floor(index / 8);
    return (this.buffer[bufIndex] >>> 7 - index % 8 & 1) === 1;
  },
  put: function(num, length) {
    for (let i = 0; i < length; i++) {
      this.putBit((num >>> length - i - 1 & 1) === 1);
    }
  },
  getLengthInBits: function() {
    return this.length;
  },
  putBit: function(bit) {
    const bufIndex = Math.floor(this.length / 8);
    if (this.buffer.length <= bufIndex) {
      this.buffer.push(0);
    }
    if (bit) {
      this.buffer[bufIndex] |= 128 >>> this.length % 8;
    }
    this.length++;
  }
};
var bitBuffer = BitBuffer$1;
function BitMatrix$1(size) {
  if (!size || size < 1) {
    throw new Error("BitMatrix size must be defined and greater than 0");
  }
  this.size = size;
  this.data = new Uint8Array(size * size);
  this.reservedBit = new Uint8Array(size * size);
}
BitMatrix$1.prototype.set = function(row, col, value, reserved) {
  const index = row * this.size + col;
  this.data[index] = value;
  if (reserved) this.reservedBit[index] = true;
};
BitMatrix$1.prototype.get = function(row, col) {
  return this.data[row * this.size + col];
};
BitMatrix$1.prototype.xor = function(row, col, value) {
  this.data[row * this.size + col] ^= value;
};
BitMatrix$1.prototype.isReserved = function(row, col) {
  return this.reservedBit[row * this.size + col];
};
var bitMatrix = BitMatrix$1;
var alignmentPattern = {};
(function(exports$1) {
  const getSymbolSize3 = utils$1.getSymbolSize;
  exports$1.getRowColCoords = function getRowColCoords(version2) {
    if (version2 === 1) return [];
    const posCount = Math.floor(version2 / 7) + 2;
    const size = getSymbolSize3(version2);
    const intervals = size === 145 ? 26 : Math.ceil((size - 13) / (2 * posCount - 2)) * 2;
    const positions = [size - 7];
    for (let i = 1; i < posCount - 1; i++) {
      positions[i] = positions[i - 1] - intervals;
    }
    positions.push(6);
    return positions.reverse();
  };
  exports$1.getPositions = function getPositions2(version2) {
    const coords = [];
    const pos = exports$1.getRowColCoords(version2);
    const posLength = pos.length;
    for (let i = 0; i < posLength; i++) {
      for (let j = 0; j < posLength; j++) {
        if (i === 0 && j === 0 || // top-left
        i === 0 && j === posLength - 1 || // bottom-left
        i === posLength - 1 && j === 0) {
          continue;
        }
        coords.push([pos[i], pos[j]]);
      }
    }
    return coords;
  };
})(alignmentPattern);
var finderPattern = {};
const getSymbolSize2 = utils$1.getSymbolSize;
const FINDER_PATTERN_SIZE = 7;
finderPattern.getPositions = function getPositions(version2) {
  const size = getSymbolSize2(version2);
  return [
    // top-left
    [0, 0],
    // top-right
    [size - FINDER_PATTERN_SIZE, 0],
    // bottom-left
    [0, size - FINDER_PATTERN_SIZE]
  ];
};
var maskPattern = {};
(function(exports$1) {
  exports$1.Patterns = {
    PATTERN000: 0,
    PATTERN001: 1,
    PATTERN010: 2,
    PATTERN011: 3,
    PATTERN100: 4,
    PATTERN101: 5,
    PATTERN110: 6,
    PATTERN111: 7
  };
  const PenaltyScores = {
    N1: 3,
    N2: 3,
    N3: 40,
    N4: 10
  };
  exports$1.isValid = function isValid2(mask) {
    return mask != null && mask !== "" && !isNaN(mask) && mask >= 0 && mask <= 7;
  };
  exports$1.from = function from(value) {
    return exports$1.isValid(value) ? parseInt(value, 10) : void 0;
  };
  exports$1.getPenaltyN1 = function getPenaltyN1(data) {
    const size = data.size;
    let points = 0;
    let sameCountCol = 0;
    let sameCountRow = 0;
    let lastCol = null;
    let lastRow = null;
    for (let row = 0; row < size; row++) {
      sameCountCol = sameCountRow = 0;
      lastCol = lastRow = null;
      for (let col = 0; col < size; col++) {
        let module = data.get(row, col);
        if (module === lastCol) {
          sameCountCol++;
        } else {
          if (sameCountCol >= 5) points += PenaltyScores.N1 + (sameCountCol - 5);
          lastCol = module;
          sameCountCol = 1;
        }
        module = data.get(col, row);
        if (module === lastRow) {
          sameCountRow++;
        } else {
          if (sameCountRow >= 5) points += PenaltyScores.N1 + (sameCountRow - 5);
          lastRow = module;
          sameCountRow = 1;
        }
      }
      if (sameCountCol >= 5) points += PenaltyScores.N1 + (sameCountCol - 5);
      if (sameCountRow >= 5) points += PenaltyScores.N1 + (sameCountRow - 5);
    }
    return points;
  };
  exports$1.getPenaltyN2 = function getPenaltyN2(data) {
    const size = data.size;
    let points = 0;
    for (let row = 0; row < size - 1; row++) {
      for (let col = 0; col < size - 1; col++) {
        const last = data.get(row, col) + data.get(row, col + 1) + data.get(row + 1, col) + data.get(row + 1, col + 1);
        if (last === 4 || last === 0) points++;
      }
    }
    return points * PenaltyScores.N2;
  };
  exports$1.getPenaltyN3 = function getPenaltyN3(data) {
    const size = data.size;
    let points = 0;
    let bitsCol = 0;
    let bitsRow = 0;
    for (let row = 0; row < size; row++) {
      bitsCol = bitsRow = 0;
      for (let col = 0; col < size; col++) {
        bitsCol = bitsCol << 1 & 2047 | data.get(row, col);
        if (col >= 10 && (bitsCol === 1488 || bitsCol === 93)) points++;
        bitsRow = bitsRow << 1 & 2047 | data.get(col, row);
        if (col >= 10 && (bitsRow === 1488 || bitsRow === 93)) points++;
      }
    }
    return points * PenaltyScores.N3;
  };
  exports$1.getPenaltyN4 = function getPenaltyN4(data) {
    let darkCount = 0;
    const modulesCount = data.data.length;
    for (let i = 0; i < modulesCount; i++) darkCount += data.data[i];
    const k = Math.abs(Math.ceil(darkCount * 100 / modulesCount / 5) - 10);
    return k * PenaltyScores.N4;
  };
  function getMaskAt(maskPattern2, i, j) {
    switch (maskPattern2) {
      case exports$1.Patterns.PATTERN000:
        return (i + j) % 2 === 0;
      case exports$1.Patterns.PATTERN001:
        return i % 2 === 0;
      case exports$1.Patterns.PATTERN010:
        return j % 3 === 0;
      case exports$1.Patterns.PATTERN011:
        return (i + j) % 3 === 0;
      case exports$1.Patterns.PATTERN100:
        return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0;
      case exports$1.Patterns.PATTERN101:
        return i * j % 2 + i * j % 3 === 0;
      case exports$1.Patterns.PATTERN110:
        return (i * j % 2 + i * j % 3) % 2 === 0;
      case exports$1.Patterns.PATTERN111:
        return (i * j % 3 + (i + j) % 2) % 2 === 0;
      default:
        throw new Error("bad maskPattern:" + maskPattern2);
    }
  }
  exports$1.applyMask = function applyMask(pattern, data) {
    const size = data.size;
    for (let col = 0; col < size; col++) {
      for (let row = 0; row < size; row++) {
        if (data.isReserved(row, col)) continue;
        data.xor(row, col, getMaskAt(pattern, row, col));
      }
    }
  };
  exports$1.getBestMask = function getBestMask(data, setupFormatFunc) {
    const numPatterns = Object.keys(exports$1.Patterns).length;
    let bestPattern = 0;
    let lowerPenalty = Infinity;
    for (let p = 0; p < numPatterns; p++) {
      setupFormatFunc(p);
      exports$1.applyMask(p, data);
      const penalty = exports$1.getPenaltyN1(data) + exports$1.getPenaltyN2(data) + exports$1.getPenaltyN3(data) + exports$1.getPenaltyN4(data);
      exports$1.applyMask(p, data);
      if (penalty < lowerPenalty) {
        lowerPenalty = penalty;
        bestPattern = p;
      }
    }
    return bestPattern;
  };
})(maskPattern);
var errorCorrectionCode = {};
const ECLevel$1 = errorCorrectionLevel;
const EC_BLOCKS_TABLE = [
  // L  M  Q  H
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  2,
  2,
  1,
  2,
  2,
  4,
  1,
  2,
  4,
  4,
  2,
  4,
  4,
  4,
  2,
  4,
  6,
  5,
  2,
  4,
  6,
  6,
  2,
  5,
  8,
  8,
  4,
  5,
  8,
  8,
  4,
  5,
  8,
  11,
  4,
  8,
  10,
  11,
  4,
  9,
  12,
  16,
  4,
  9,
  16,
  16,
  6,
  10,
  12,
  18,
  6,
  10,
  17,
  16,
  6,
  11,
  16,
  19,
  6,
  13,
  18,
  21,
  7,
  14,
  21,
  25,
  8,
  16,
  20,
  25,
  8,
  17,
  23,
  25,
  9,
  17,
  23,
  34,
  9,
  18,
  25,
  30,
  10,
  20,
  27,
  32,
  12,
  21,
  29,
  35,
  12,
  23,
  34,
  37,
  12,
  25,
  34,
  40,
  13,
  26,
  35,
  42,
  14,
  28,
  38,
  45,
  15,
  29,
  40,
  48,
  16,
  31,
  43,
  51,
  17,
  33,
  45,
  54,
  18,
  35,
  48,
  57,
  19,
  37,
  51,
  60,
  19,
  38,
  53,
  63,
  20,
  40,
  56,
  66,
  21,
  43,
  59,
  70,
  22,
  45,
  62,
  74,
  24,
  47,
  65,
  77,
  25,
  49,
  68,
  81
];
const EC_CODEWORDS_TABLE = [
  // L  M  Q  H
  7,
  10,
  13,
  17,
  10,
  16,
  22,
  28,
  15,
  26,
  36,
  44,
  20,
  36,
  52,
  64,
  26,
  48,
  72,
  88,
  36,
  64,
  96,
  112,
  40,
  72,
  108,
  130,
  48,
  88,
  132,
  156,
  60,
  110,
  160,
  192,
  72,
  130,
  192,
  224,
  80,
  150,
  224,
  264,
  96,
  176,
  260,
  308,
  104,
  198,
  288,
  352,
  120,
  216,
  320,
  384,
  132,
  240,
  360,
  432,
  144,
  280,
  408,
  480,
  168,
  308,
  448,
  532,
  180,
  338,
  504,
  588,
  196,
  364,
  546,
  650,
  224,
  416,
  600,
  700,
  224,
  442,
  644,
  750,
  252,
  476,
  690,
  816,
  270,
  504,
  750,
  900,
  300,
  560,
  810,
  960,
  312,
  588,
  870,
  1050,
  336,
  644,
  952,
  1110,
  360,
  700,
  1020,
  1200,
  390,
  728,
  1050,
  1260,
  420,
  784,
  1140,
  1350,
  450,
  812,
  1200,
  1440,
  480,
  868,
  1290,
  1530,
  510,
  924,
  1350,
  1620,
  540,
  980,
  1440,
  1710,
  570,
  1036,
  1530,
  1800,
  570,
  1064,
  1590,
  1890,
  600,
  1120,
  1680,
  1980,
  630,
  1204,
  1770,
  2100,
  660,
  1260,
  1860,
  2220,
  720,
  1316,
  1950,
  2310,
  750,
  1372,
  2040,
  2430
];
errorCorrectionCode.getBlocksCount = function getBlocksCount(version2, errorCorrectionLevel2) {
  switch (errorCorrectionLevel2) {
    case ECLevel$1.L:
      return EC_BLOCKS_TABLE[(version2 - 1) * 4 + 0];
    case ECLevel$1.M:
      return EC_BLOCKS_TABLE[(version2 - 1) * 4 + 1];
    case ECLevel$1.Q:
      return EC_BLOCKS_TABLE[(version2 - 1) * 4 + 2];
    case ECLevel$1.H:
      return EC_BLOCKS_TABLE[(version2 - 1) * 4 + 3];
    default:
      return void 0;
  }
};
errorCorrectionCode.getTotalCodewordsCount = function getTotalCodewordsCount(version2, errorCorrectionLevel2) {
  switch (errorCorrectionLevel2) {
    case ECLevel$1.L:
      return EC_CODEWORDS_TABLE[(version2 - 1) * 4 + 0];
    case ECLevel$1.M:
      return EC_CODEWORDS_TABLE[(version2 - 1) * 4 + 1];
    case ECLevel$1.Q:
      return EC_CODEWORDS_TABLE[(version2 - 1) * 4 + 2];
    case ECLevel$1.H:
      return EC_CODEWORDS_TABLE[(version2 - 1) * 4 + 3];
    default:
      return void 0;
  }
};
var polynomial = {};
var galoisField = {};
const EXP_TABLE = new Uint8Array(512);
const LOG_TABLE = new Uint8Array(256);
(function initTables() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP_TABLE[i] = x;
    LOG_TABLE[x] = i;
    x <<= 1;
    if (x & 256) {
      x ^= 285;
    }
  }
  for (let i = 255; i < 512; i++) {
    EXP_TABLE[i] = EXP_TABLE[i - 255];
  }
})();
galoisField.log = function log(n) {
  if (n < 1) throw new Error("log(" + n + ")");
  return LOG_TABLE[n];
};
galoisField.exp = function exp(n) {
  return EXP_TABLE[n];
};
galoisField.mul = function mul(x, y) {
  if (x === 0 || y === 0) return 0;
  return EXP_TABLE[LOG_TABLE[x] + LOG_TABLE[y]];
};
(function(exports$1) {
  const GF = galoisField;
  exports$1.mul = function mul2(p1, p2) {
    const coeff = new Uint8Array(p1.length + p2.length - 1);
    for (let i = 0; i < p1.length; i++) {
      for (let j = 0; j < p2.length; j++) {
        coeff[i + j] ^= GF.mul(p1[i], p2[j]);
      }
    }
    return coeff;
  };
  exports$1.mod = function mod(divident, divisor) {
    let result = new Uint8Array(divident);
    while (result.length - divisor.length >= 0) {
      const coeff = result[0];
      for (let i = 0; i < divisor.length; i++) {
        result[i] ^= GF.mul(divisor[i], coeff);
      }
      let offset = 0;
      while (offset < result.length && result[offset] === 0) offset++;
      result = result.slice(offset);
    }
    return result;
  };
  exports$1.generateECPolynomial = function generateECPolynomial(degree) {
    let poly = new Uint8Array([1]);
    for (let i = 0; i < degree; i++) {
      poly = exports$1.mul(poly, new Uint8Array([1, GF.exp(i)]));
    }
    return poly;
  };
})(polynomial);
const Polynomial = polynomial;
function ReedSolomonEncoder$1(degree) {
  this.genPoly = void 0;
  this.degree = degree;
  if (this.degree) this.initialize(this.degree);
}
ReedSolomonEncoder$1.prototype.initialize = function initialize(degree) {
  this.degree = degree;
  this.genPoly = Polynomial.generateECPolynomial(this.degree);
};
ReedSolomonEncoder$1.prototype.encode = function encode(data) {
  if (!this.genPoly) {
    throw new Error("Encoder not initialized");
  }
  const paddedData = new Uint8Array(data.length + this.degree);
  paddedData.set(data);
  const remainder = Polynomial.mod(paddedData, this.genPoly);
  const start = this.degree - remainder.length;
  if (start > 0) {
    const buff = new Uint8Array(this.degree);
    buff.set(remainder, start);
    return buff;
  }
  return remainder;
};
var reedSolomonEncoder = ReedSolomonEncoder$1;
var version = {};
var mode = {};
var versionCheck = {};
versionCheck.isValid = function isValid(version2) {
  return !isNaN(version2) && version2 >= 1 && version2 <= 40;
};
var regex = {};
const numeric = "[0-9]+";
const alphanumeric = "[A-Z $%*+\\-./:]+";
let kanji = "(?:[u3000-u303F]|[u3040-u309F]|[u30A0-u30FF]|[uFF00-uFFEF]|[u4E00-u9FAF]|[u2605-u2606]|[u2190-u2195]|u203B|[u2010u2015u2018u2019u2025u2026u201Cu201Du2225u2260]|[u0391-u0451]|[u00A7u00A8u00B1u00B4u00D7u00F7])+";
kanji = kanji.replace(/u/g, "\\u");
const byte = "(?:(?![A-Z0-9 $%*+\\-./:]|" + kanji + ")(?:.|[\r\n]))+";
regex.KANJI = new RegExp(kanji, "g");
regex.BYTE_KANJI = new RegExp("[^A-Z0-9 $%*+\\-./:]+", "g");
regex.BYTE = new RegExp(byte, "g");
regex.NUMERIC = new RegExp(numeric, "g");
regex.ALPHANUMERIC = new RegExp(alphanumeric, "g");
const TEST_KANJI = new RegExp("^" + kanji + "$");
const TEST_NUMERIC = new RegExp("^" + numeric + "$");
const TEST_ALPHANUMERIC = new RegExp("^[A-Z0-9 $%*+\\-./:]+$");
regex.testKanji = function testKanji(str) {
  return TEST_KANJI.test(str);
};
regex.testNumeric = function testNumeric(str) {
  return TEST_NUMERIC.test(str);
};
regex.testAlphanumeric = function testAlphanumeric(str) {
  return TEST_ALPHANUMERIC.test(str);
};
(function(exports$1) {
  const VersionCheck = versionCheck;
  const Regex = regex;
  exports$1.NUMERIC = {
    id: "Numeric",
    bit: 1 << 0,
    ccBits: [10, 12, 14]
  };
  exports$1.ALPHANUMERIC = {
    id: "Alphanumeric",
    bit: 1 << 1,
    ccBits: [9, 11, 13]
  };
  exports$1.BYTE = {
    id: "Byte",
    bit: 1 << 2,
    ccBits: [8, 16, 16]
  };
  exports$1.KANJI = {
    id: "Kanji",
    bit: 1 << 3,
    ccBits: [8, 10, 12]
  };
  exports$1.MIXED = {
    bit: -1
  };
  exports$1.getCharCountIndicator = function getCharCountIndicator(mode2, version2) {
    if (!mode2.ccBits) throw new Error("Invalid mode: " + mode2);
    if (!VersionCheck.isValid(version2)) {
      throw new Error("Invalid version: " + version2);
    }
    if (version2 >= 1 && version2 < 10) return mode2.ccBits[0];
    else if (version2 < 27) return mode2.ccBits[1];
    return mode2.ccBits[2];
  };
  exports$1.getBestModeForData = function getBestModeForData(dataStr) {
    if (Regex.testNumeric(dataStr)) return exports$1.NUMERIC;
    else if (Regex.testAlphanumeric(dataStr)) return exports$1.ALPHANUMERIC;
    else if (Regex.testKanji(dataStr)) return exports$1.KANJI;
    else return exports$1.BYTE;
  };
  exports$1.toString = function toString(mode2) {
    if (mode2 && mode2.id) return mode2.id;
    throw new Error("Invalid mode");
  };
  exports$1.isValid = function isValid2(mode2) {
    return mode2 && mode2.bit && mode2.ccBits;
  };
  function fromString(string) {
    if (typeof string !== "string") {
      throw new Error("Param is not a string");
    }
    const lcStr = string.toLowerCase();
    switch (lcStr) {
      case "numeric":
        return exports$1.NUMERIC;
      case "alphanumeric":
        return exports$1.ALPHANUMERIC;
      case "kanji":
        return exports$1.KANJI;
      case "byte":
        return exports$1.BYTE;
      default:
        throw new Error("Unknown mode: " + string);
    }
  }
  exports$1.from = function from(value, defaultValue) {
    if (exports$1.isValid(value)) {
      return value;
    }
    try {
      return fromString(value);
    } catch (e) {
      return defaultValue;
    }
  };
})(mode);
(function(exports$1) {
  const Utils2 = utils$1;
  const ECCode2 = errorCorrectionCode;
  const ECLevel2 = errorCorrectionLevel;
  const Mode2 = mode;
  const VersionCheck = versionCheck;
  const G18 = 1 << 12 | 1 << 11 | 1 << 10 | 1 << 9 | 1 << 8 | 1 << 5 | 1 << 2 | 1 << 0;
  const G18_BCH = Utils2.getBCHDigit(G18);
  function getBestVersionForDataLength(mode2, length, errorCorrectionLevel2) {
    for (let currentVersion = 1; currentVersion <= 40; currentVersion++) {
      if (length <= exports$1.getCapacity(currentVersion, errorCorrectionLevel2, mode2)) {
        return currentVersion;
      }
    }
    return void 0;
  }
  function getReservedBitsCount(mode2, version2) {
    return Mode2.getCharCountIndicator(mode2, version2) + 4;
  }
  function getTotalBitsFromDataArray(segments2, version2) {
    let totalBits = 0;
    segments2.forEach(function(data) {
      const reservedBits = getReservedBitsCount(data.mode, version2);
      totalBits += reservedBits + data.getBitsLength();
    });
    return totalBits;
  }
  function getBestVersionForMixedData(segments2, errorCorrectionLevel2) {
    for (let currentVersion = 1; currentVersion <= 40; currentVersion++) {
      const length = getTotalBitsFromDataArray(segments2, currentVersion);
      if (length <= exports$1.getCapacity(currentVersion, errorCorrectionLevel2, Mode2.MIXED)) {
        return currentVersion;
      }
    }
    return void 0;
  }
  exports$1.from = function from(value, defaultValue) {
    if (VersionCheck.isValid(value)) {
      return parseInt(value, 10);
    }
    return defaultValue;
  };
  exports$1.getCapacity = function getCapacity(version2, errorCorrectionLevel2, mode2) {
    if (!VersionCheck.isValid(version2)) {
      throw new Error("Invalid QR Code version");
    }
    if (typeof mode2 === "undefined") mode2 = Mode2.BYTE;
    const totalCodewords = Utils2.getSymbolTotalCodewords(version2);
    const ecTotalCodewords = ECCode2.getTotalCodewordsCount(version2, errorCorrectionLevel2);
    const dataTotalCodewordsBits = (totalCodewords - ecTotalCodewords) * 8;
    if (mode2 === Mode2.MIXED) return dataTotalCodewordsBits;
    const usableBits = dataTotalCodewordsBits - getReservedBitsCount(mode2, version2);
    switch (mode2) {
      case Mode2.NUMERIC:
        return Math.floor(usableBits / 10 * 3);
      case Mode2.ALPHANUMERIC:
        return Math.floor(usableBits / 11 * 2);
      case Mode2.KANJI:
        return Math.floor(usableBits / 13);
      case Mode2.BYTE:
      default:
        return Math.floor(usableBits / 8);
    }
  };
  exports$1.getBestVersionForData = function getBestVersionForData(data, errorCorrectionLevel2) {
    let seg;
    const ecl = ECLevel2.from(errorCorrectionLevel2, ECLevel2.M);
    if (Array.isArray(data)) {
      if (data.length > 1) {
        return getBestVersionForMixedData(data, ecl);
      }
      if (data.length === 0) {
        return 1;
      }
      seg = data[0];
    } else {
      seg = data;
    }
    return getBestVersionForDataLength(seg.mode, seg.getLength(), ecl);
  };
  exports$1.getEncodedBits = function getEncodedBits2(version2) {
    if (!VersionCheck.isValid(version2) || version2 < 7) {
      throw new Error("Invalid QR Code version");
    }
    let d = version2 << 12;
    while (Utils2.getBCHDigit(d) - G18_BCH >= 0) {
      d ^= G18 << Utils2.getBCHDigit(d) - G18_BCH;
    }
    return version2 << 12 | d;
  };
})(version);
var formatInfo = {};
const Utils$3 = utils$1;
const G15 = 1 << 10 | 1 << 8 | 1 << 5 | 1 << 4 | 1 << 2 | 1 << 1 | 1 << 0;
const G15_MASK = 1 << 14 | 1 << 12 | 1 << 10 | 1 << 4 | 1 << 1;
const G15_BCH = Utils$3.getBCHDigit(G15);
formatInfo.getEncodedBits = function getEncodedBits(errorCorrectionLevel2, mask) {
  const data = errorCorrectionLevel2.bit << 3 | mask;
  let d = data << 10;
  while (Utils$3.getBCHDigit(d) - G15_BCH >= 0) {
    d ^= G15 << Utils$3.getBCHDigit(d) - G15_BCH;
  }
  return (data << 10 | d) ^ G15_MASK;
};
var segments = {};
const Mode$4 = mode;
function NumericData(data) {
  this.mode = Mode$4.NUMERIC;
  this.data = data.toString();
}
NumericData.getBitsLength = function getBitsLength(length) {
  return 10 * Math.floor(length / 3) + (length % 3 ? length % 3 * 3 + 1 : 0);
};
NumericData.prototype.getLength = function getLength() {
  return this.data.length;
};
NumericData.prototype.getBitsLength = function getBitsLength2() {
  return NumericData.getBitsLength(this.data.length);
};
NumericData.prototype.write = function write(bitBuffer2) {
  let i, group, value;
  for (i = 0; i + 3 <= this.data.length; i += 3) {
    group = this.data.substr(i, 3);
    value = parseInt(group, 10);
    bitBuffer2.put(value, 10);
  }
  const remainingNum = this.data.length - i;
  if (remainingNum > 0) {
    group = this.data.substr(i);
    value = parseInt(group, 10);
    bitBuffer2.put(value, remainingNum * 3 + 1);
  }
};
var numericData = NumericData;
const Mode$3 = mode;
const ALPHA_NUM_CHARS = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
  " ",
  "$",
  "%",
  "*",
  "+",
  "-",
  ".",
  "/",
  ":"
];
function AlphanumericData(data) {
  this.mode = Mode$3.ALPHANUMERIC;
  this.data = data;
}
AlphanumericData.getBitsLength = function getBitsLength3(length) {
  return 11 * Math.floor(length / 2) + 6 * (length % 2);
};
AlphanumericData.prototype.getLength = function getLength2() {
  return this.data.length;
};
AlphanumericData.prototype.getBitsLength = function getBitsLength4() {
  return AlphanumericData.getBitsLength(this.data.length);
};
AlphanumericData.prototype.write = function write2(bitBuffer2) {
  let i;
  for (i = 0; i + 2 <= this.data.length; i += 2) {
    let value = ALPHA_NUM_CHARS.indexOf(this.data[i]) * 45;
    value += ALPHA_NUM_CHARS.indexOf(this.data[i + 1]);
    bitBuffer2.put(value, 11);
  }
  if (this.data.length % 2) {
    bitBuffer2.put(ALPHA_NUM_CHARS.indexOf(this.data[i]), 6);
  }
};
var alphanumericData = AlphanumericData;
const Mode$2 = mode;
function ByteData(data) {
  this.mode = Mode$2.BYTE;
  if (typeof data === "string") {
    this.data = new TextEncoder().encode(data);
  } else {
    this.data = new Uint8Array(data);
  }
}
ByteData.getBitsLength = function getBitsLength5(length) {
  return length * 8;
};
ByteData.prototype.getLength = function getLength3() {
  return this.data.length;
};
ByteData.prototype.getBitsLength = function getBitsLength6() {
  return ByteData.getBitsLength(this.data.length);
};
ByteData.prototype.write = function(bitBuffer2) {
  for (let i = 0, l = this.data.length; i < l; i++) {
    bitBuffer2.put(this.data[i], 8);
  }
};
var byteData = ByteData;
const Mode$1 = mode;
const Utils$2 = utils$1;
function KanjiData(data) {
  this.mode = Mode$1.KANJI;
  this.data = data;
}
KanjiData.getBitsLength = function getBitsLength7(length) {
  return length * 13;
};
KanjiData.prototype.getLength = function getLength4() {
  return this.data.length;
};
KanjiData.prototype.getBitsLength = function getBitsLength8() {
  return KanjiData.getBitsLength(this.data.length);
};
KanjiData.prototype.write = function(bitBuffer2) {
  let i;
  for (i = 0; i < this.data.length; i++) {
    let value = Utils$2.toSJIS(this.data[i]);
    if (value >= 33088 && value <= 40956) {
      value -= 33088;
    } else if (value >= 57408 && value <= 60351) {
      value -= 49472;
    } else {
      throw new Error(
        "Invalid SJIS character: " + this.data[i] + "\nMake sure your charset is UTF-8"
      );
    }
    value = (value >>> 8 & 255) * 192 + (value & 255);
    bitBuffer2.put(value, 13);
  }
};
var kanjiData = KanjiData;
var dijkstra = { exports: {} };
(function(module) {
  var dijkstra2 = {
    single_source_shortest_paths: function(graph, s, d) {
      var predecessors = {};
      var costs = {};
      costs[s] = 0;
      var open = dijkstra2.PriorityQueue.make();
      open.push(s, 0);
      var closest, u, v, cost_of_s_to_u, adjacent_nodes, cost_of_e, cost_of_s_to_u_plus_cost_of_e, cost_of_s_to_v, first_visit;
      while (!open.empty()) {
        closest = open.pop();
        u = closest.value;
        cost_of_s_to_u = closest.cost;
        adjacent_nodes = graph[u] || {};
        for (v in adjacent_nodes) {
          if (adjacent_nodes.hasOwnProperty(v)) {
            cost_of_e = adjacent_nodes[v];
            cost_of_s_to_u_plus_cost_of_e = cost_of_s_to_u + cost_of_e;
            cost_of_s_to_v = costs[v];
            first_visit = typeof costs[v] === "undefined";
            if (first_visit || cost_of_s_to_v > cost_of_s_to_u_plus_cost_of_e) {
              costs[v] = cost_of_s_to_u_plus_cost_of_e;
              open.push(v, cost_of_s_to_u_plus_cost_of_e);
              predecessors[v] = u;
            }
          }
        }
      }
      if (typeof d !== "undefined" && typeof costs[d] === "undefined") {
        var msg = ["Could not find a path from ", s, " to ", d, "."].join("");
        throw new Error(msg);
      }
      return predecessors;
    },
    extract_shortest_path_from_predecessor_list: function(predecessors, d) {
      var nodes = [];
      var u = d;
      while (u) {
        nodes.push(u);
        predecessors[u];
        u = predecessors[u];
      }
      nodes.reverse();
      return nodes;
    },
    find_path: function(graph, s, d) {
      var predecessors = dijkstra2.single_source_shortest_paths(graph, s, d);
      return dijkstra2.extract_shortest_path_from_predecessor_list(
        predecessors,
        d
      );
    },
    /**
     * A very naive priority queue implementation.
     */
    PriorityQueue: {
      make: function(opts) {
        var T = dijkstra2.PriorityQueue, t = {}, key;
        opts = opts || {};
        for (key in T) {
          if (T.hasOwnProperty(key)) {
            t[key] = T[key];
          }
        }
        t.queue = [];
        t.sorter = opts.sorter || T.default_sorter;
        return t;
      },
      default_sorter: function(a, b) {
        return a.cost - b.cost;
      },
      /**
       * Add a new item to the queue and ensure the highest priority element
       * is at the front of the queue.
       */
      push: function(value, cost) {
        var item = { value, cost };
        this.queue.push(item);
        this.queue.sort(this.sorter);
      },
      /**
       * Return the highest priority element in the queue.
       */
      pop: function() {
        return this.queue.shift();
      },
      empty: function() {
        return this.queue.length === 0;
      }
    }
  };
  {
    module.exports = dijkstra2;
  }
})(dijkstra);
var dijkstraExports = dijkstra.exports;
(function(exports$1) {
  const Mode2 = mode;
  const NumericData2 = numericData;
  const AlphanumericData2 = alphanumericData;
  const ByteData2 = byteData;
  const KanjiData2 = kanjiData;
  const Regex = regex;
  const Utils2 = utils$1;
  const dijkstra2 = dijkstraExports;
  function getStringByteLength(str) {
    return unescape(encodeURIComponent(str)).length;
  }
  function getSegments(regex2, mode2, str) {
    const segments2 = [];
    let result;
    while ((result = regex2.exec(str)) !== null) {
      segments2.push({
        data: result[0],
        index: result.index,
        mode: mode2,
        length: result[0].length
      });
    }
    return segments2;
  }
  function getSegmentsFromString(dataStr) {
    const numSegs = getSegments(Regex.NUMERIC, Mode2.NUMERIC, dataStr);
    const alphaNumSegs = getSegments(Regex.ALPHANUMERIC, Mode2.ALPHANUMERIC, dataStr);
    let byteSegs;
    let kanjiSegs;
    if (Utils2.isKanjiModeEnabled()) {
      byteSegs = getSegments(Regex.BYTE, Mode2.BYTE, dataStr);
      kanjiSegs = getSegments(Regex.KANJI, Mode2.KANJI, dataStr);
    } else {
      byteSegs = getSegments(Regex.BYTE_KANJI, Mode2.BYTE, dataStr);
      kanjiSegs = [];
    }
    const segs = numSegs.concat(alphaNumSegs, byteSegs, kanjiSegs);
    return segs.sort(function(s1, s2) {
      return s1.index - s2.index;
    }).map(function(obj) {
      return {
        data: obj.data,
        mode: obj.mode,
        length: obj.length
      };
    });
  }
  function getSegmentBitsLength(length, mode2) {
    switch (mode2) {
      case Mode2.NUMERIC:
        return NumericData2.getBitsLength(length);
      case Mode2.ALPHANUMERIC:
        return AlphanumericData2.getBitsLength(length);
      case Mode2.KANJI:
        return KanjiData2.getBitsLength(length);
      case Mode2.BYTE:
        return ByteData2.getBitsLength(length);
    }
  }
  function mergeSegments(segs) {
    return segs.reduce(function(acc, curr) {
      const prevSeg = acc.length - 1 >= 0 ? acc[acc.length - 1] : null;
      if (prevSeg && prevSeg.mode === curr.mode) {
        acc[acc.length - 1].data += curr.data;
        return acc;
      }
      acc.push(curr);
      return acc;
    }, []);
  }
  function buildNodes(segs) {
    const nodes = [];
    for (let i = 0; i < segs.length; i++) {
      const seg = segs[i];
      switch (seg.mode) {
        case Mode2.NUMERIC:
          nodes.push([
            seg,
            { data: seg.data, mode: Mode2.ALPHANUMERIC, length: seg.length },
            { data: seg.data, mode: Mode2.BYTE, length: seg.length }
          ]);
          break;
        case Mode2.ALPHANUMERIC:
          nodes.push([
            seg,
            { data: seg.data, mode: Mode2.BYTE, length: seg.length }
          ]);
          break;
        case Mode2.KANJI:
          nodes.push([
            seg,
            { data: seg.data, mode: Mode2.BYTE, length: getStringByteLength(seg.data) }
          ]);
          break;
        case Mode2.BYTE:
          nodes.push([
            { data: seg.data, mode: Mode2.BYTE, length: getStringByteLength(seg.data) }
          ]);
      }
    }
    return nodes;
  }
  function buildGraph(nodes, version2) {
    const table = {};
    const graph = { start: {} };
    let prevNodeIds = ["start"];
    for (let i = 0; i < nodes.length; i++) {
      const nodeGroup = nodes[i];
      const currentNodeIds = [];
      for (let j = 0; j < nodeGroup.length; j++) {
        const node = nodeGroup[j];
        const key = "" + i + j;
        currentNodeIds.push(key);
        table[key] = { node, lastCount: 0 };
        graph[key] = {};
        for (let n = 0; n < prevNodeIds.length; n++) {
          const prevNodeId = prevNodeIds[n];
          if (table[prevNodeId] && table[prevNodeId].node.mode === node.mode) {
            graph[prevNodeId][key] = getSegmentBitsLength(table[prevNodeId].lastCount + node.length, node.mode) - getSegmentBitsLength(table[prevNodeId].lastCount, node.mode);
            table[prevNodeId].lastCount += node.length;
          } else {
            if (table[prevNodeId]) table[prevNodeId].lastCount = node.length;
            graph[prevNodeId][key] = getSegmentBitsLength(node.length, node.mode) + 4 + Mode2.getCharCountIndicator(node.mode, version2);
          }
        }
      }
      prevNodeIds = currentNodeIds;
    }
    for (let n = 0; n < prevNodeIds.length; n++) {
      graph[prevNodeIds[n]].end = 0;
    }
    return { map: graph, table };
  }
  function buildSingleSegment(data, modesHint) {
    let mode2;
    const bestMode = Mode2.getBestModeForData(data);
    mode2 = Mode2.from(modesHint, bestMode);
    if (mode2 !== Mode2.BYTE && mode2.bit < bestMode.bit) {
      throw new Error('"' + data + '" cannot be encoded with mode ' + Mode2.toString(mode2) + ".\n Suggested mode is: " + Mode2.toString(bestMode));
    }
    if (mode2 === Mode2.KANJI && !Utils2.isKanjiModeEnabled()) {
      mode2 = Mode2.BYTE;
    }
    switch (mode2) {
      case Mode2.NUMERIC:
        return new NumericData2(data);
      case Mode2.ALPHANUMERIC:
        return new AlphanumericData2(data);
      case Mode2.KANJI:
        return new KanjiData2(data);
      case Mode2.BYTE:
        return new ByteData2(data);
    }
  }
  exports$1.fromArray = function fromArray(array) {
    return array.reduce(function(acc, seg) {
      if (typeof seg === "string") {
        acc.push(buildSingleSegment(seg, null));
      } else if (seg.data) {
        acc.push(buildSingleSegment(seg.data, seg.mode));
      }
      return acc;
    }, []);
  };
  exports$1.fromString = function fromString(data, version2) {
    const segs = getSegmentsFromString(data, Utils2.isKanjiModeEnabled());
    const nodes = buildNodes(segs);
    const graph = buildGraph(nodes, version2);
    const path = dijkstra2.find_path(graph.map, "start", "end");
    const optimizedSegs = [];
    for (let i = 1; i < path.length - 1; i++) {
      optimizedSegs.push(graph.table[path[i]].node);
    }
    return exports$1.fromArray(mergeSegments(optimizedSegs));
  };
  exports$1.rawSplit = function rawSplit(data) {
    return exports$1.fromArray(
      getSegmentsFromString(data, Utils2.isKanjiModeEnabled())
    );
  };
})(segments);
const Utils$1 = utils$1;
const ECLevel = errorCorrectionLevel;
const BitBuffer = bitBuffer;
const BitMatrix = bitMatrix;
const AlignmentPattern = alignmentPattern;
const FinderPattern = finderPattern;
const MaskPattern = maskPattern;
const ECCode = errorCorrectionCode;
const ReedSolomonEncoder = reedSolomonEncoder;
const Version = version;
const FormatInfo = formatInfo;
const Mode = mode;
const Segments = segments;
function setupFinderPattern(matrix, version2) {
  const size = matrix.size;
  const pos = FinderPattern.getPositions(version2);
  for (let i = 0; i < pos.length; i++) {
    const row = pos[i][0];
    const col = pos[i][1];
    for (let r = -1; r <= 7; r++) {
      if (row + r <= -1 || size <= row + r) continue;
      for (let c = -1; c <= 7; c++) {
        if (col + c <= -1 || size <= col + c) continue;
        if (r >= 0 && r <= 6 && (c === 0 || c === 6) || c >= 0 && c <= 6 && (r === 0 || r === 6) || r >= 2 && r <= 4 && c >= 2 && c <= 4) {
          matrix.set(row + r, col + c, true, true);
        } else {
          matrix.set(row + r, col + c, false, true);
        }
      }
    }
  }
}
function setupTimingPattern(matrix) {
  const size = matrix.size;
  for (let r = 8; r < size - 8; r++) {
    const value = r % 2 === 0;
    matrix.set(r, 6, value, true);
    matrix.set(6, r, value, true);
  }
}
function setupAlignmentPattern(matrix, version2) {
  const pos = AlignmentPattern.getPositions(version2);
  for (let i = 0; i < pos.length; i++) {
    const row = pos[i][0];
    const col = pos[i][1];
    for (let r = -2; r <= 2; r++) {
      for (let c = -2; c <= 2; c++) {
        if (r === -2 || r === 2 || c === -2 || c === 2 || r === 0 && c === 0) {
          matrix.set(row + r, col + c, true, true);
        } else {
          matrix.set(row + r, col + c, false, true);
        }
      }
    }
  }
}
function setupVersionInfo(matrix, version2) {
  const size = matrix.size;
  const bits = Version.getEncodedBits(version2);
  let row, col, mod;
  for (let i = 0; i < 18; i++) {
    row = Math.floor(i / 3);
    col = i % 3 + size - 8 - 3;
    mod = (bits >> i & 1) === 1;
    matrix.set(row, col, mod, true);
    matrix.set(col, row, mod, true);
  }
}
function setupFormatInfo(matrix, errorCorrectionLevel2, maskPattern2) {
  const size = matrix.size;
  const bits = FormatInfo.getEncodedBits(errorCorrectionLevel2, maskPattern2);
  let i, mod;
  for (i = 0; i < 15; i++) {
    mod = (bits >> i & 1) === 1;
    if (i < 6) {
      matrix.set(i, 8, mod, true);
    } else if (i < 8) {
      matrix.set(i + 1, 8, mod, true);
    } else {
      matrix.set(size - 15 + i, 8, mod, true);
    }
    if (i < 8) {
      matrix.set(8, size - i - 1, mod, true);
    } else if (i < 9) {
      matrix.set(8, 15 - i - 1 + 1, mod, true);
    } else {
      matrix.set(8, 15 - i - 1, mod, true);
    }
  }
  matrix.set(size - 8, 8, 1, true);
}
function setupData(matrix, data) {
  const size = matrix.size;
  let inc = -1;
  let row = size - 1;
  let bitIndex = 7;
  let byteIndex = 0;
  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) col--;
    while (true) {
      for (let c = 0; c < 2; c++) {
        if (!matrix.isReserved(row, col - c)) {
          let dark = false;
          if (byteIndex < data.length) {
            dark = (data[byteIndex] >>> bitIndex & 1) === 1;
          }
          matrix.set(row, col - c, dark);
          bitIndex--;
          if (bitIndex === -1) {
            byteIndex++;
            bitIndex = 7;
          }
        }
      }
      row += inc;
      if (row < 0 || size <= row) {
        row -= inc;
        inc = -inc;
        break;
      }
    }
  }
}
function createData(version2, errorCorrectionLevel2, segments2) {
  const buffer = new BitBuffer();
  segments2.forEach(function(data) {
    buffer.put(data.mode.bit, 4);
    buffer.put(data.getLength(), Mode.getCharCountIndicator(data.mode, version2));
    data.write(buffer);
  });
  const totalCodewords = Utils$1.getSymbolTotalCodewords(version2);
  const ecTotalCodewords = ECCode.getTotalCodewordsCount(version2, errorCorrectionLevel2);
  const dataTotalCodewordsBits = (totalCodewords - ecTotalCodewords) * 8;
  if (buffer.getLengthInBits() + 4 <= dataTotalCodewordsBits) {
    buffer.put(0, 4);
  }
  while (buffer.getLengthInBits() % 8 !== 0) {
    buffer.putBit(0);
  }
  const remainingByte = (dataTotalCodewordsBits - buffer.getLengthInBits()) / 8;
  for (let i = 0; i < remainingByte; i++) {
    buffer.put(i % 2 ? 17 : 236, 8);
  }
  return createCodewords(buffer, version2, errorCorrectionLevel2);
}
function createCodewords(bitBuffer2, version2, errorCorrectionLevel2) {
  const totalCodewords = Utils$1.getSymbolTotalCodewords(version2);
  const ecTotalCodewords = ECCode.getTotalCodewordsCount(version2, errorCorrectionLevel2);
  const dataTotalCodewords = totalCodewords - ecTotalCodewords;
  const ecTotalBlocks = ECCode.getBlocksCount(version2, errorCorrectionLevel2);
  const blocksInGroup2 = totalCodewords % ecTotalBlocks;
  const blocksInGroup1 = ecTotalBlocks - blocksInGroup2;
  const totalCodewordsInGroup1 = Math.floor(totalCodewords / ecTotalBlocks);
  const dataCodewordsInGroup1 = Math.floor(dataTotalCodewords / ecTotalBlocks);
  const dataCodewordsInGroup2 = dataCodewordsInGroup1 + 1;
  const ecCount = totalCodewordsInGroup1 - dataCodewordsInGroup1;
  const rs = new ReedSolomonEncoder(ecCount);
  let offset = 0;
  const dcData = new Array(ecTotalBlocks);
  const ecData = new Array(ecTotalBlocks);
  let maxDataSize = 0;
  const buffer = new Uint8Array(bitBuffer2.buffer);
  for (let b = 0; b < ecTotalBlocks; b++) {
    const dataSize = b < blocksInGroup1 ? dataCodewordsInGroup1 : dataCodewordsInGroup2;
    dcData[b] = buffer.slice(offset, offset + dataSize);
    ecData[b] = rs.encode(dcData[b]);
    offset += dataSize;
    maxDataSize = Math.max(maxDataSize, dataSize);
  }
  const data = new Uint8Array(totalCodewords);
  let index = 0;
  let i, r;
  for (i = 0; i < maxDataSize; i++) {
    for (r = 0; r < ecTotalBlocks; r++) {
      if (i < dcData[r].length) {
        data[index++] = dcData[r][i];
      }
    }
  }
  for (i = 0; i < ecCount; i++) {
    for (r = 0; r < ecTotalBlocks; r++) {
      data[index++] = ecData[r][i];
    }
  }
  return data;
}
function createSymbol(data, version2, errorCorrectionLevel2, maskPattern2) {
  let segments2;
  if (Array.isArray(data)) {
    segments2 = Segments.fromArray(data);
  } else if (typeof data === "string") {
    let estimatedVersion = version2;
    if (!estimatedVersion) {
      const rawSegments = Segments.rawSplit(data);
      estimatedVersion = Version.getBestVersionForData(rawSegments, errorCorrectionLevel2);
    }
    segments2 = Segments.fromString(data, estimatedVersion || 40);
  } else {
    throw new Error("Invalid data");
  }
  const bestVersion = Version.getBestVersionForData(segments2, errorCorrectionLevel2);
  if (!bestVersion) {
    throw new Error("The amount of data is too big to be stored in a QR Code");
  }
  if (!version2) {
    version2 = bestVersion;
  } else if (version2 < bestVersion) {
    throw new Error(
      "\nThe chosen QR Code version cannot contain this amount of data.\nMinimum version required to store current data is: " + bestVersion + ".\n"
    );
  }
  const dataBits = createData(version2, errorCorrectionLevel2, segments2);
  const moduleCount = Utils$1.getSymbolSize(version2);
  const modules = new BitMatrix(moduleCount);
  setupFinderPattern(modules, version2);
  setupTimingPattern(modules);
  setupAlignmentPattern(modules, version2);
  setupFormatInfo(modules, errorCorrectionLevel2, 0);
  if (version2 >= 7) {
    setupVersionInfo(modules, version2);
  }
  setupData(modules, dataBits);
  if (isNaN(maskPattern2)) {
    maskPattern2 = MaskPattern.getBestMask(
      modules,
      setupFormatInfo.bind(null, modules, errorCorrectionLevel2)
    );
  }
  MaskPattern.applyMask(maskPattern2, modules);
  setupFormatInfo(modules, errorCorrectionLevel2, maskPattern2);
  return {
    modules,
    version: version2,
    errorCorrectionLevel: errorCorrectionLevel2,
    maskPattern: maskPattern2,
    segments: segments2
  };
}
qrcode.create = function create(data, options) {
  if (typeof data === "undefined" || data === "") {
    throw new Error("No input text");
  }
  let errorCorrectionLevel2 = ECLevel.M;
  let version2;
  let mask;
  if (typeof options !== "undefined") {
    errorCorrectionLevel2 = ECLevel.from(options.errorCorrectionLevel, ECLevel.M);
    version2 = Version.from(options.version);
    mask = MaskPattern.from(options.maskPattern);
    if (options.toSJISFunc) {
      Utils$1.setToSJISFunction(options.toSJISFunc);
    }
  }
  return createSymbol(data, version2, errorCorrectionLevel2, mask);
};
var canvas = {};
var utils = {};
(function(exports$1) {
  function hex2rgba(hex) {
    if (typeof hex === "number") {
      hex = hex.toString();
    }
    if (typeof hex !== "string") {
      throw new Error("Color should be defined as hex string");
    }
    let hexCode = hex.slice().replace("#", "").split("");
    if (hexCode.length < 3 || hexCode.length === 5 || hexCode.length > 8) {
      throw new Error("Invalid hex color: " + hex);
    }
    if (hexCode.length === 3 || hexCode.length === 4) {
      hexCode = Array.prototype.concat.apply([], hexCode.map(function(c) {
        return [c, c];
      }));
    }
    if (hexCode.length === 6) hexCode.push("F", "F");
    const hexValue = parseInt(hexCode.join(""), 16);
    return {
      r: hexValue >> 24 & 255,
      g: hexValue >> 16 & 255,
      b: hexValue >> 8 & 255,
      a: hexValue & 255,
      hex: "#" + hexCode.slice(0, 6).join("")
    };
  }
  exports$1.getOptions = function getOptions(options) {
    if (!options) options = {};
    if (!options.color) options.color = {};
    const margin = typeof options.margin === "undefined" || options.margin === null || options.margin < 0 ? 4 : options.margin;
    const width = options.width && options.width >= 21 ? options.width : void 0;
    const scale = options.scale || 4;
    return {
      width,
      scale: width ? 4 : scale,
      margin,
      color: {
        dark: hex2rgba(options.color.dark || "#000000ff"),
        light: hex2rgba(options.color.light || "#ffffffff")
      },
      type: options.type,
      rendererOpts: options.rendererOpts || {}
    };
  };
  exports$1.getScale = function getScale(qrSize, opts) {
    return opts.width && opts.width >= qrSize + opts.margin * 2 ? opts.width / (qrSize + opts.margin * 2) : opts.scale;
  };
  exports$1.getImageWidth = function getImageWidth(qrSize, opts) {
    const scale = exports$1.getScale(qrSize, opts);
    return Math.floor((qrSize + opts.margin * 2) * scale);
  };
  exports$1.qrToImageData = function qrToImageData(imgData, qr, opts) {
    const size = qr.modules.size;
    const data = qr.modules.data;
    const scale = exports$1.getScale(size, opts);
    const symbolSize = Math.floor((size + opts.margin * 2) * scale);
    const scaledMargin = opts.margin * scale;
    const palette = [opts.color.light, opts.color.dark];
    for (let i = 0; i < symbolSize; i++) {
      for (let j = 0; j < symbolSize; j++) {
        let posDst = (i * symbolSize + j) * 4;
        let pxColor = opts.color.light;
        if (i >= scaledMargin && j >= scaledMargin && i < symbolSize - scaledMargin && j < symbolSize - scaledMargin) {
          const iSrc = Math.floor((i - scaledMargin) / scale);
          const jSrc = Math.floor((j - scaledMargin) / scale);
          pxColor = palette[data[iSrc * size + jSrc] ? 1 : 0];
        }
        imgData[posDst++] = pxColor.r;
        imgData[posDst++] = pxColor.g;
        imgData[posDst++] = pxColor.b;
        imgData[posDst] = pxColor.a;
      }
    }
  };
})(utils);
(function(exports$1) {
  const Utils2 = utils;
  function clearCanvas(ctx, canvas2, size) {
    ctx.clearRect(0, 0, canvas2.width, canvas2.height);
    if (!canvas2.style) canvas2.style = {};
    canvas2.height = size;
    canvas2.width = size;
    canvas2.style.height = size + "px";
    canvas2.style.width = size + "px";
  }
  function getCanvasElement() {
    try {
      return document.createElement("canvas");
    } catch (e) {
      throw new Error("You need to specify a canvas element");
    }
  }
  exports$1.render = function render2(qrData, canvas2, options) {
    let opts = options;
    let canvasEl = canvas2;
    if (typeof opts === "undefined" && (!canvas2 || !canvas2.getContext)) {
      opts = canvas2;
      canvas2 = void 0;
    }
    if (!canvas2) {
      canvasEl = getCanvasElement();
    }
    opts = Utils2.getOptions(opts);
    const size = Utils2.getImageWidth(qrData.modules.size, opts);
    const ctx = canvasEl.getContext("2d");
    const image = ctx.createImageData(size, size);
    Utils2.qrToImageData(image.data, qrData, opts);
    clearCanvas(ctx, canvasEl, size);
    ctx.putImageData(image, 0, 0);
    return canvasEl;
  };
  exports$1.renderToDataURL = function renderToDataURL(qrData, canvas2, options) {
    let opts = options;
    if (typeof opts === "undefined" && (!canvas2 || !canvas2.getContext)) {
      opts = canvas2;
      canvas2 = void 0;
    }
    if (!opts) opts = {};
    const canvasEl = exports$1.render(qrData, canvas2, opts);
    const type = opts.type || "image/png";
    const rendererOpts = opts.rendererOpts || {};
    return canvasEl.toDataURL(type, rendererOpts.quality);
  };
})(canvas);
var svgTag = {};
const Utils = utils;
function getColorAttrib(color, attrib) {
  const alpha = color.a / 255;
  const str = attrib + '="' + color.hex + '"';
  return alpha < 1 ? str + " " + attrib + '-opacity="' + alpha.toFixed(2).slice(1) + '"' : str;
}
function svgCmd(cmd, x, y) {
  let str = cmd + x;
  if (typeof y !== "undefined") str += " " + y;
  return str;
}
function qrToPath(data, size, margin) {
  let path = "";
  let moveBy = 0;
  let newRow = false;
  let lineLength = 0;
  for (let i = 0; i < data.length; i++) {
    const col = Math.floor(i % size);
    const row = Math.floor(i / size);
    if (!col && !newRow) newRow = true;
    if (data[i]) {
      lineLength++;
      if (!(i > 0 && col > 0 && data[i - 1])) {
        path += newRow ? svgCmd("M", col + margin, 0.5 + row + margin) : svgCmd("m", moveBy, 0);
        moveBy = 0;
        newRow = false;
      }
      if (!(col + 1 < size && data[i + 1])) {
        path += svgCmd("h", lineLength);
        lineLength = 0;
      }
    } else {
      moveBy++;
    }
  }
  return path;
}
svgTag.render = function render(qrData, options, cb) {
  const opts = Utils.getOptions(options);
  const size = qrData.modules.size;
  const data = qrData.modules.data;
  const qrcodesize = size + opts.margin * 2;
  const bg = !opts.color.light.a ? "" : "<path " + getColorAttrib(opts.color.light, "fill") + ' d="M0 0h' + qrcodesize + "v" + qrcodesize + 'H0z"/>';
  const path = "<path " + getColorAttrib(opts.color.dark, "stroke") + ' d="' + qrToPath(data, size, opts.margin) + '"/>';
  const viewBox = 'viewBox="0 0 ' + qrcodesize + " " + qrcodesize + '"';
  const width = !opts.width ? "" : 'width="' + opts.width + '" height="' + opts.width + '" ';
  const svgTag2 = '<svg xmlns="http://www.w3.org/2000/svg" ' + width + viewBox + ' shape-rendering="crispEdges">' + bg + path + "</svg>\n";
  if (typeof cb === "function") {
    cb(null, svgTag2);
  }
  return svgTag2;
};
const canPromise = canPromise$1;
const QRCode = qrcode;
const CanvasRenderer = canvas;
const SvgRenderer = svgTag;
function renderCanvas(renderFunc, canvas2, text, opts, cb) {
  const args = [].slice.call(arguments, 1);
  const argsNum = args.length;
  const isLastArgCb = typeof args[argsNum - 1] === "function";
  if (!isLastArgCb && !canPromise()) {
    throw new Error("Callback required as last argument");
  }
  if (isLastArgCb) {
    if (argsNum < 2) {
      throw new Error("Too few arguments provided");
    }
    if (argsNum === 2) {
      cb = text;
      text = canvas2;
      canvas2 = opts = void 0;
    } else if (argsNum === 3) {
      if (canvas2.getContext && typeof cb === "undefined") {
        cb = opts;
        opts = void 0;
      } else {
        cb = opts;
        opts = text;
        text = canvas2;
        canvas2 = void 0;
      }
    }
  } else {
    if (argsNum < 1) {
      throw new Error("Too few arguments provided");
    }
    if (argsNum === 1) {
      text = canvas2;
      canvas2 = opts = void 0;
    } else if (argsNum === 2 && !canvas2.getContext) {
      opts = text;
      text = canvas2;
      canvas2 = void 0;
    }
    return new Promise(function(resolve, reject) {
      try {
        const data = QRCode.create(text, opts);
        resolve(renderFunc(data, canvas2, opts));
      } catch (e) {
        reject(e);
      }
    });
  }
  try {
    const data = QRCode.create(text, opts);
    cb(null, renderFunc(data, canvas2, opts));
  } catch (e) {
    cb(e);
  }
}
browser.create = QRCode.create;
browser.toCanvas = renderCanvas.bind(null, CanvasRenderer.render);
browser.toDataURL = renderCanvas.bind(null, CanvasRenderer.renderToDataURL);
browser.toString = renderCanvas.bind(null, function(data, _, opts) {
  return SvgRenderer.render(data, opts);
});
const toAny = (a) => a;
function todayISO() {
  return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
}
function isoToDisplay(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}
function displayToISO(display) {
  if (!display) return "";
  const parts = display.split(".");
  if (parts.length !== 3) return display;
  const [d, m, y] = parts;
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}
function addDays(isoDate, days) {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
function formatAmount(n, currency = "CHF") {
  return `${currency} ${n.toLocaleString("de-CH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function formatHoursHHMM(hours) {
  const totalMins = Math.round(hours * 60);
  const hh = Math.floor(totalMins / 60);
  const mm = totalMins % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}
function alignClass(pos) {
  if (pos === "center" || pos === "zentriert") return "text-center";
  if (pos === "right" || pos === "rechts") return "text-right";
  return "text-left";
}
function imgAlignClass(pos) {
  if (pos === "center" || pos === "zentriert") return "mx-auto";
  if (pos === "right" || pos === "rechts") return "ml-auto";
  return "";
}
const STATUS_LABELS = {
  entwurf: "Entwurf",
  versendet: "Versendet",
  bezahlt: "Bezahlt",
  storniert: "Storniert",
  ueberfaellig: "Überfällig"
};
const STATUS_COLORS = {
  entwurf: "secondary",
  versendet: "default",
  bezahlt: "outline",
  storniert: "destructive",
  ueberfaellig: "orange"
};
function posToInput(p) {
  const storedBezeichnung = p.typ !== InvoicePositionTyp.spese && p.leistungsart ? p.bezeichnung ? `${p.leistungsart} - ${p.bezeichnung}` : p.leistungsart : p.bezeichnung;
  return {
    typ: p.typ,
    referenzId: p.referenzId,
    bezeichnung: storedBezeichnung,
    menge: p.menge,
    einheit: p.einheit,
    preis: p.preis
  };
}
function invoicePositionToEditable(p, idx) {
  var _a;
  let leistungsart;
  let bezeichnung = p.bezeichnung;
  if (p.typ !== InvoicePositionTyp.spese && ((_a = p.bezeichnung) == null ? void 0 : _a.includes(" - "))) {
    const sepIdx = p.bezeichnung.indexOf(" - ");
    leistungsart = p.bezeichnung.slice(0, sepIdx);
    bezeichnung = p.bezeichnung.slice(sepIdx + 3);
  }
  return {
    id: `existing-${String(p.id)}-${idx}`,
    typ: p.typ,
    referenzId: p.referenzId,
    bezeichnung,
    leistungsart,
    // datum: not stored in backend — will be enriched by the time-entries query for edit mode
    menge: p.menge,
    einheit: p.einheit,
    preis: p.preis
  };
}
let _localIdCounter = 0;
function newLocalId() {
  return `new-${++_localIdCounter}`;
}
function useQRCode(data) {
  const [dataUrl, setDataUrl] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (!data) {
      setDataUrl(null);
      return;
    }
    browser.toDataURL(data, {
      errorCorrectionLevel: "M",
      width: 256,
      margin: 1
    }).then(setDataUrl).catch(() => setDataUrl(null));
  }, [data]);
  return dataUrl;
}
function buildSwissQRData(params) {
  const rawIban = params.iban.replace(/\s/g, "");
  const roundedBetrag = params.betrag.toFixed(2);
  const reftyp = (params.referenztyp || "NON").toUpperCase();
  const refNr = reftyp !== "NON" ? params.referenz || "" : "";
  const addrParts = params.kontoinhaberAdresse.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
  const creditorStreet = addrParts[0] || "";
  const creditorCity = addrParts.slice(1).join(" ").trim() || "";
  const debtorParts = params.kundeAdresse.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
  const debtorStreet = debtorParts[0] || "";
  const debtorCity = debtorParts.slice(1).join(" ").trim() || "";
  const lines = [
    "SPC",
    // 1  – QR Type (literal)
    "0200",
    // 2  – Version (literal)
    "1",
    // 3  – Coding Type (1 = UTF-8)
    rawIban,
    // 4  – IBAN (no spaces)
    "K",
    // 5  – Creditor address type (K = combined)
    params.kontoinhaber,
    // 6  – Creditor name
    creditorStreet,
    // 7  – Creditor street + number
    creditorCity,
    // 8  – Creditor PLZ + city
    "",
    // 9  – (empty for K type)
    "",
    // 10 – (empty for K type)
    "CH",
    // 11 – Creditor country (ISO 3166-1 alpha-2)
    "",
    // 12 – Ultimate creditor type (always empty)
    "",
    // 13 – Ultimate creditor name (always empty)
    "",
    // 14 – Ultimate creditor street (always empty)
    "",
    // 15 – Ultimate creditor house nr (always empty)
    "",
    // 16 – Ultimate creditor PLZ (always empty)
    "",
    // 17 – Ultimate creditor city (always empty)
    "",
    // 18 – Ultimate creditor country (always empty)
    roundedBetrag,
    // 19 – Amount (2 decimal places, no separator)
    params.waehrung,
    // 20 – Currency (CHF or EUR)
    "K",
    // 21 – Debtor address type (K = combined)
    params.kundeNamen,
    // 22 – Debtor name
    debtorStreet,
    // 23 – Debtor street + number
    debtorCity,
    // 24 – Debtor PLZ + city
    "",
    // 25 – (empty for K type)
    "",
    // 26 – (empty for K type)
    "CH",
    // 27 – Debtor country
    reftyp,
    // 28 – Reference type (NON / QRR / SCOR)
    refNr,
    // 29 – Reference number (empty if NON)
    params.zusatz || "",
    // 30 – Unstructured message (Rechnungsnummer)
    "EPD",
    // 31 – End Payment Data (literal)
    ""
    // 32 – Bill information (optional, empty)
  ];
  return lines.join("\r\n");
}
function replacePlaceholders(text, ctx) {
  if (!text) return "";
  let result = text;
  if (ctx.projektName)
    result = result.replace(/\{\{projekt_name\}\}/g, ctx.projektName);
  if (ctx.projektKuerzel)
    result = result.replace(/\{\{projekt_kuerzel\}\}/g, ctx.projektKuerzel);
  if (ctx.bank) result = result.replace(/\[bank\]/g, ctx.bank);
  if (ctx.iban) result = result.replace(/\[iban\]/g, ctx.iban);
  if (ctx.mwstNummer) result = result.replace(/\[mwst_nr\]/g, ctx.mwstNummer);
  if (ctx.kontoInhaber)
    result = result.replace(/\[konto_inhaber\]/g, ctx.kontoInhaber);
  if (ctx.kontoAdresse)
    result = result.replace(/\[konto_adresse\]/g, ctx.kontoAdresse);
  if (ctx.kundenname) {
    result = result.replace(/\{\{kunde_name\}\}/g, ctx.kundenname).replace(/\{\{kundenname\}\}/g, ctx.kundenname).replace(/\[kundenname\]/g, ctx.kundenname);
  }
  if (ctx.rechnungsnummer) {
    result = result.replace(/\{\{rechnungsnummer\}\}/g, ctx.rechnungsnummer).replace(/\[rechnungsnummer\]/g, ctx.rechnungsnummer);
  }
  if (ctx.datum) {
    result = result.replace(/\{\{rechnungsdatum\}\}/g, ctx.datum).replace(/\[datum\]/g, ctx.datum);
  }
  if (ctx.faelligkeitsdatum) {
    result = result.replace(/\{\{faelligkeitsdatum\}\}/g, ctx.faelligkeitsdatum).replace(/\[faelligkeitsdatum\]/g, ctx.faelligkeitsdatum);
  }
  result = result.replace(/\{\{mitarbeiter_name\}\}/g, ctx.mitarbeiterName ?? "").replace(/\{\{mitarbeiter_kuerzel\}\}/g, ctx.mitarbeiterKuerzel ?? "").replace(/\{\{leistungsart\}\}/g, ctx.leistungsart ?? "").replace(/\{\{zeitraum_von\}\}/g, ctx.zeitraumVon ?? "").replace(/\{\{zeitraum_bis\}\}/g, ctx.zeitraumBis ?? "").replace(/\{\{total_stunden\}\}/g, ctx.totalStunden ?? "");
  return result;
}
function InvoiceEditorPage() {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m;
  const { actor, isFetching: actorFetching } = useActor(createActor);
  const { isAuthenticated, companyId, companyLogoUrl, companyName } = useAuth();
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const invoiceId = params == null ? void 0 : params.id;
  const isEditMode = !!invoiceId && invoiceId !== "neu";
  const search = useSearch({ strict: false });
  const preSelectedTimeIds = reactExports.useMemo(() => {
    if (!(search == null ? void 0 : search.zeitIds)) return [];
    return String(search.zeitIds).split(",").filter(Boolean).map((s) => BigInt(s));
  }, [search == null ? void 0 : search.zeitIds]);
  const preSelectedExpenseIds = reactExports.useMemo(() => {
    if (!(search == null ? void 0 : search.speseIds)) return [];
    return String(search.speseIds).split(",").filter(Boolean).map((s) => BigInt(s));
  }, [search == null ? void 0 : search.speseIds]);
  const urlKundeId = (search == null ? void 0 : search.kundeId) ? String(search.kundeId) : "";
  const { data: customers = [], isLoading: customersLoading } = useQuery({
    queryKey: ["customers", companyId],
    queryFn: async () => {
      if (!actor) return [];
      const res = await toAny(actor).listCustomers();
      if (Array.isArray(res)) return res;
      if (res && "ok" in res && res.ok) return res.ok;
      return [];
    },
    enabled: !!actor && !actorFetching && isAuthenticated
  });
  const { data: template, isLoading: templateLoading } = useQuery({
    queryKey: ["invoiceTemplate", companyId],
    queryFn: async () => {
      if (!actor) return null;
      const res = await toAny(actor).getInvoiceTemplate();
      if ("ok" in res) return res.ok ?? null;
      return null;
    },
    enabled: !!actor && !actorFetching && isAuthenticated
  });
  const { data: existingInvoice, isLoading: invoiceLoading } = useQuery({
    queryKey: ["invoice", invoiceId],
    queryFn: async () => {
      if (!actor || !invoiceId) return null;
      const res = await toAny(actor).getInvoiceById(BigInt(invoiceId));
      if ("ok" in res) return res.ok ?? null;
      return null;
    },
    enabled: !!actor && !actorFetching && isAuthenticated && isEditMode
  });
  const { data: unbilledData } = useQuery({
    queryKey: [
      "unbilledForEditor",
      preSelectedTimeIds.join(","),
      preSelectedExpenseIds.join(",")
    ],
    queryFn: async () => {
      if (!actor) return null;
      const res = await toAny(actor).getUnbilledEntries(null);
      if ("ok" in res) return res.ok;
      return null;
    },
    enabled: !!actor && !actorFetching && isAuthenticated && !isEditMode && (preSelectedTimeIds.length > 0 || preSelectedExpenseIds.length > 0)
  });
  const {
    data: projectMembersMap = /* @__PURE__ */ new Map()
  } = useQuery({
    queryKey: ["projectMembersForEditor", companyId],
    queryFn: async () => {
      if (!actor) return /* @__PURE__ */ new Map();
      const projectIds = [
        ...(unbilledData == null ? void 0 : unbilledData.zeiteintraege.map((z) => z.projectId)) ?? []
      ];
      const unique = [...new Set(projectIds.map(String))];
      const result = /* @__PURE__ */ new Map();
      await Promise.all(
        unique.map(async (pid) => {
          try {
            const res = await toAny(actor).getProjectMembers(BigInt(pid));
            if (res.__kind__ === "ok" && res.ok) result.set(pid, res.ok);
          } catch {
          }
        })
      );
      return result;
    },
    enabled: !!actor && !actorFetching && isAuthenticated && !isEditMode && !!unbilledData
  });
  const { data: allServiceTypes = [] } = useQuery({
    queryKey: ["serviceTypesForEditor", companyId],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const res = await toAny(actor).listServiceTypes();
        if (Array.isArray(res)) return res;
        if (res && "ok" in res && res.ok) return res.ok;
      } catch {
      }
      return [];
    },
    enabled: !!actor && !actorFetching && isAuthenticated
  });
  const { data: allExpenseTypes = [] } = useQuery({
    queryKey: ["expenseTypesForEditor", companyId],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const res = await toAny(actor).listExpenseTypes();
        if (Array.isArray(res)) return res;
        if (res && "ok" in res && res.ok) return res.ok;
      } catch {
        try {
          const res2 = await toAny(actor).listSpesenarten();
          if (Array.isArray(res2)) return res2;
          if (res2 && "ok" in res2 && res2.ok) return res2.ok;
        } catch {
        }
      }
      return [];
    },
    enabled: !!actor && !actorFetching && isAuthenticated
  });
  const { data: editModeTimeEntries = [] } = useQuery({
    queryKey: ["editModeTimeEntries", companyId, invoiceId],
    queryFn: async () => {
      if (!actor || !isEditMode) return [];
      try {
        const res = await toAny(actor).listTimeEntries({});
        if (Array.isArray(res)) return res;
      } catch {
        return [];
      }
      return [];
    },
    enabled: !!actor && !actorFetching && isAuthenticated && isEditMode
  });
  const [kundeId, setKundeId] = reactExports.useState("");
  const [rechnungsnummer, setRechnungsnummer] = reactExports.useState("");
  const [datum, setDatum] = reactExports.useState(isoToDisplay(todayISO()));
  const [faelligkeitsdatum, setFaelligkeitsdatum] = reactExports.useState("");
  const [status, setStatus] = reactExports.useState(InvoiceStatus.entwurf);
  const [positions, setPositions] = reactExports.useState([]);
  const [rabatt, setRabatt] = reactExports.useState("0");
  const [skonto, setSkonto] = reactExports.useState("0");
  const [mwstSatz, setMwstSatz] = reactExports.useState("7.7");
  const [kopftext, setKopftext] = reactExports.useState("");
  const [fusstext, setFusstext] = reactExports.useState("");
  const [qrAktiv, setQrAktiv] = reactExports.useState(false);
  const [isSaving, setIsSaving] = reactExports.useState(false);
  const [isMarkingVersendet, setIsMarkingVersendet] = reactExports.useState(false);
  const [errorMsg, setErrorMsg] = reactExports.useState(null);
  const initializedRef = reactExports.useRef(false);
  const isMountedRef = reactExports.useRef(false);
  reactExports.useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  reactExports.useEffect(() => {
    const originalTitle = document.title;
    if (rechnungsnummer) {
      document.title = `Rechnung ${rechnungsnummer}`;
    }
    return () => {
      document.title = originalTitle;
    };
  }, [rechnungsnummer]);
  const selectedCustomer = customers.find((c) => String(c.id) === kundeId);
  const waehrung = (selectedCustomer == null ? void 0 : selectedCustomer.waehrung) ?? "CHF";
  const computedRechnungsnummer = reactExports.useMemo(() => {
    if (!template) return "RE-0001";
    const num = String(template.naechsteNummer).padStart(4, "0");
    const praefix = template.praefix || "RE-";
    return `${praefix}${num}`;
  }, [template]);
  reactExports.useEffect(() => {
    if (initializedRef.current) return;
    if (templateLoading || customersLoading) return;
    if (isEditMode && invoiceLoading) return;
    if (isEditMode && !existingInvoice) return;
    initializedRef.current = true;
    if (isEditMode && existingInvoice) {
      setKundeId(String(existingInvoice.kundeId));
      setRechnungsnummer(existingInvoice.rechnungsnummer);
      setDatum(isoToDisplay(existingInvoice.datum));
      setFaelligkeitsdatum(isoToDisplay(existingInvoice.faelligkeitsdatum));
      setStatus(existingInvoice.status);
      setPositions(existingInvoice.positionen.map(invoicePositionToEditable));
      setRabatt(String(existingInvoice.rabatt));
      setSkonto(String(existingInvoice.skonto));
      setMwstSatz(String(existingInvoice.mwstSatz));
      setKopftext(existingInvoice.kopftext);
      setFusstext(existingInvoice.fusstext);
      setQrAktiv((template == null ? void 0 : template.qrAktivStandard) ?? false);
    } else {
      setRechnungsnummer(computedRechnungsnummer);
      if (urlKundeId) setKundeId(urlKundeId);
      if (template) {
        setKopftext(template.kopftext || "");
        setFusstext(template.fusstext || "");
        setQrAktiv(template.qrAktivStandard ?? false);
        try {
          const savedMwst = localStorage.getItem("rv_mwst_satz_standard");
          if (savedMwst) setMwstSatz(savedMwst);
        } catch {
        }
        const days = Number(template.zahlungszielTage) || 30;
        setFaelligkeitsdatum(isoToDisplay(addDays(todayISO(), days)));
      } else {
        setFaelligkeitsdatum(isoToDisplay(addDays(todayISO(), 30)));
      }
    }
  }, [
    isEditMode,
    existingInvoice,
    template,
    templateLoading,
    customersLoading,
    invoiceLoading,
    computedRechnungsnummer,
    urlKundeId
  ]);
  reactExports.useEffect(() => {
    if (isEditMode) return;
    if (!unbilledData) return;
    if (preSelectedTimeIds.length === 0 && preSelectedExpenseIds.length === 0)
      return;
    const newPositions = [];
    for (const te of (unbilledData == null ? void 0 : unbilledData.zeiteintraege) ?? []) {
      if (!preSelectedTimeIds.includes(te.id)) continue;
      const members = projectMembersMap.get(String(te.projectId)) ?? [];
      const assignment = members.find(
        (m) => String(m.serviceTypeId) === String(te.serviceTypeId)
      );
      const stundensatz = (assignment == null ? void 0 : assignment.stundensatz) ?? 0;
      const serviceType = allServiceTypes.find(
        (st) => String(st.id) === String(te.serviceTypeId)
      );
      newPositions.push({
        id: newLocalId(),
        typ: InvoicePositionTyp.leistung,
        referenzId: te.id,
        bezeichnung: te.description || "",
        leistungsart: (serviceType == null ? void 0 : serviceType.name) || "",
        datum: te.date || "",
        von: te.von || void 0,
        bis: te.bis || void 0,
        menge: te.hours,
        einheit: "Std.",
        preis: stundensatz
      });
    }
    for (const ex of (unbilledData == null ? void 0 : unbilledData.spesen) ?? []) {
      if (!preSelectedExpenseIds.includes(ex.id)) continue;
      const betrag = ex.billableCHF ?? ex.reimbursementCHF ?? 0;
      const expenseType = allExpenseTypes.find(
        (et) => String(et.id) === String(ex.expenseTypeId)
      );
      const spesenartName = (expenseType == null ? void 0 : expenseType.name) || "";
      const spesenBezeichnung = spesenartName ? ex.description ? `${spesenartName} - ${ex.description}` : spesenartName : ex.description || "Spese";
      newPositions.push({
        id: newLocalId(),
        typ: InvoicePositionTyp.spese,
        referenzId: ex.id,
        bezeichnung: spesenBezeichnung,
        datum: ex.date || "",
        menge: 1,
        einheit: "Pauschal",
        preis: betrag
      });
    }
    if (newPositions.length > 0 && isMountedRef.current)
      setPositions(newPositions);
  }, [
    unbilledData,
    projectMembersMap,
    allServiceTypes,
    allExpenseTypes,
    isEditMode,
    preSelectedTimeIds,
    preSelectedExpenseIds
  ]);
  reactExports.useEffect(() => {
    if (!isEditMode) return;
    if (editModeTimeEntries.length === 0) return;
    setPositions((prev) => {
      if (prev.length === 0) return prev;
      return prev.map((p) => {
        if (p.typ === InvoicePositionTyp.spese) return p;
        if (!p.referenzId) return p;
        const te = editModeTimeEntries.find(
          (e) => String(e.id) === String(p.referenzId)
        );
        if (!te) return p;
        const serviceType = allServiceTypes.find(
          (st) => String(st.id) === String(te.serviceTypeId)
        );
        return {
          ...p,
          datum: p.datum || te.date || "",
          von: p.von || te.von || void 0,
          bis: p.bis || te.bis || void 0,
          leistungsart: p.leistungsart || (serviceType == null ? void 0 : serviceType.name) || ""
        };
      });
    });
  }, [editModeTimeEntries, allServiceTypes, isEditMode]);
  const { data: editModeExpenseEntries = [] } = useQuery({
    queryKey: ["editModeExpenseEntries", companyId, invoiceId],
    queryFn: async () => {
      if (!actor || !isEditMode) return [];
      try {
        const res = await toAny(actor).listExpenses({});
        if (Array.isArray(res)) return res;
      } catch {
        try {
          const res2 = await toAny(actor).listSpesen({});
          if (Array.isArray(res2)) return res2;
        } catch {
          return [];
        }
      }
      return [];
    },
    enabled: !!actor && !actorFetching && isAuthenticated && isEditMode
  });
  reactExports.useEffect(() => {
    if (!isEditMode) return;
    if (allExpenseTypes.length === 0 && editModeExpenseEntries.length === 0)
      return;
    setPositions((prev) => {
      if (prev.length === 0) return prev;
      let changed = false;
      const next = prev.map((p) => {
        var _a2;
        if (p.typ !== InvoicePositionTyp.spese) return p;
        if (!p.referenzId) return p;
        const expEntry = editModeExpenseEntries.find(
          (e) => String(e.id) === String(p.referenzId)
        );
        const typeId = (expEntry == null ? void 0 : expEntry.expenseTypeId) ?? (expEntry == null ? void 0 : expEntry.spesenartId);
        const newDatum = p.datum || (expEntry == null ? void 0 : expEntry.date) || "";
        const datumChanged = newDatum !== p.datum;
        const alreadyEnriched = (_a2 = p.bezeichnung) == null ? void 0 : _a2.includes(" - ");
        if (alreadyEnriched && !datumChanged) return p;
        if (alreadyEnriched && datumChanged) {
          changed = true;
          return { ...p, datum: newDatum };
        }
        if (!typeId) {
          if (datumChanged) {
            changed = true;
            return { ...p, datum: newDatum };
          }
          return p;
        }
        const expenseType = allExpenseTypes.find(
          (et) => String(et.id) === String(typeId)
        );
        if (!expenseType) {
          if (datumChanged) {
            changed = true;
            return { ...p, datum: newDatum };
          }
          return p;
        }
        const enriched = {
          ...p,
          bezeichnung: p.bezeichnung ? `${expenseType.name} - ${p.bezeichnung}` : expenseType.name,
          datum: newDatum
        };
        changed = true;
        return enriched;
      });
      return changed ? next : prev;
    });
  }, [editModeExpenseEntries, allExpenseTypes, isEditMode]);
  const zwischensumme = positions.reduce((s, p) => s + p.menge * p.preis, 0);
  const rabattNum = Number.parseFloat(rabatt) || 0;
  const skontoNum = Number.parseFloat(skonto) || 0;
  const mwstNum = Number.parseFloat(mwstSatz) || 0;
  const nettoBase = zwischensumme - rabattNum - skontoNum;
  const mwstBetrag = nettoBase * mwstNum / 100;
  const total = nettoBase + mwstBetrag;
  const totalRounded = Math.round(total * 100) / 100;
  const [companyData, setCompanyData] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (!actor || actorFetching) return;
    toAny(actor).getMyCompany().then((res) => {
      if (!isMountedRef.current) return;
      const r = res;
      if ("ok" in r && r.ok) setCompanyData(r.ok);
    }).catch(() => {
    });
  }, [actor, actorFetching]);
  const { data: allEmployees = [] } = useQuery({
    queryKey: ["employeesForEditor", companyId],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const res = await toAny(actor).listEmployees();
        if (Array.isArray(res)) return res;
      } catch {
      }
      return [];
    },
    enabled: !!actor && !actorFetching && isAuthenticated
  });
  const { data: allProjects = [] } = useQuery({
    queryKey: ["projectsForPlaceholders", companyId],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const res = await toAny(actor).listProjects();
        if (Array.isArray(res)) return res;
        if (res && "ok" in res && res.ok) return res.ok;
      } catch {
      }
      return [];
    },
    enabled: !!actor && !actorFetching && isAuthenticated
  });
  const firstProjektId = reactExports.useMemo(() => {
    if (isEditMode) {
      const firstLeistungPos = positions.find(
        (p) => p.typ !== InvoicePositionTyp.spese && p.referenzId
      );
      if (firstLeistungPos == null ? void 0 : firstLeistungPos.referenzId) {
        const te = editModeTimeEntries.find(
          (e) => String(e.id) === String(firstLeistungPos.referenzId)
        );
        if (te) return String(te.projectId);
      }
      return "";
    }
    const firstTime = ((unbilledData == null ? void 0 : unbilledData.zeiteintraege) ?? []).find(
      (z) => preSelectedTimeIds.includes(z.id)
    );
    if (firstTime) return String(firstTime.projectId);
    const firstSpese = ((unbilledData == null ? void 0 : unbilledData.spesen) ?? []).find(
      (s) => preSelectedExpenseIds.includes(s.id) && s.projektId
    );
    if (firstSpese == null ? void 0 : firstSpese.projektId) return String(firstSpese.projektId);
    return "";
  }, [
    unbilledData,
    preSelectedTimeIds,
    preSelectedExpenseIds,
    isEditMode,
    positions,
    editModeTimeEntries
  ]);
  const firstProject = reactExports.useMemo(
    () => allProjects.find((p) => String(p.id) === firstProjektId),
    [allProjects, firstProjektId]
  );
  const placeholderCtx = reactExports.useMemo(() => {
    var _a2;
    const leistungPositions = positions.filter(
      (p) => p.typ === InvoicePositionTyp.leistung
    );
    const firstLeistungsart = ((_a2 = leistungPositions[0]) == null ? void 0 : _a2.leistungsart) ?? "";
    const positionDates = leistungPositions.map((p) => p.datum).filter(Boolean);
    const zeitraumVonISO = positionDates.length > 0 ? [...positionDates].sort()[0] : "";
    const zeitraumBisISO = positionDates.length > 0 ? [...positionDates].sort().reverse()[0] : "";
    const totalMins = leistungPositions.reduce(
      (s, p) => s + Math.round(p.menge * 60),
      0
    );
    const totalStunden = totalMins > 0 ? `${Math.floor(totalMins / 60)}:${String(totalMins % 60).padStart(2, "0")}` : "";
    const employeeIds = /* @__PURE__ */ new Set();
    if (!isEditMode) {
      for (const pos of leistungPositions) {
        if (!pos.referenzId) continue;
        const ze = ((unbilledData == null ? void 0 : unbilledData.zeiteintraege) ?? []).find(
          (z) => String(z.id) === String(pos.referenzId)
        );
        if (!ze) continue;
        const members = projectMembersMap.get(String(ze.projectId)) ?? [];
        const match = members.find(
          (m) => String(m.serviceTypeId) === String(ze.serviceTypeId)
        );
        if (match == null ? void 0 : match.employeeId) employeeIds.add(String(match.employeeId));
      }
    } else {
      for (const pos of leistungPositions) {
        if (!pos.referenzId) continue;
        const te = editModeTimeEntries.find(
          (e) => String(e.id) === String(pos.referenzId)
        );
        if (te && "employeeId" in te) {
          employeeIds.add(String(te.employeeId));
        }
      }
    }
    const mitarbeiterNames = allEmployees.filter((e) => employeeIds.has(String(e.id))).map((e) => `${e.firstName} ${e.lastName}`);
    const mitarbeiterKuerzels = allEmployees.filter((e) => employeeIds.has(String(e.id))).map(
      (e) => e.kuerzel ?? `${e.firstName.charAt(0)}${e.lastName.charAt(0)}`
    );
    const mitarbeiterName = mitarbeiterNames.length > 0 ? mitarbeiterNames.join(", ") : "";
    const mitarbeiterKuerzel = mitarbeiterKuerzels.length > 0 ? mitarbeiterKuerzels.join(", ") : "";
    return {
      projektName: (firstProject == null ? void 0 : firstProject.name) ?? "",
      projektKuerzel: (firstProject == null ? void 0 : firstProject.kuerzel) ?? (firstProject == null ? void 0 : firstProject.kurzbezeichnung) ?? "",
      bank: (template == null ? void 0 : template.bank) ?? "",
      iban: (template == null ? void 0 : template.iban) ?? "",
      mwstNummer: (template == null ? void 0 : template.mwstNummer) ?? (companyData == null ? void 0 : companyData.taxId) ?? "",
      kontoInhaber: (template == null ? void 0 : template.qrKontoinhaber) ?? companyName ?? "",
      kontoAdresse: (template == null ? void 0 : template.qrKontoinhaberAdresse) ?? (companyData == null ? void 0 : companyData.address) ?? "",
      rechnungsnummer,
      datum,
      faelligkeitsdatum,
      kundenname: (selectedCustomer == null ? void 0 : selectedCustomer.name) ?? "",
      mitarbeiterName,
      mitarbeiterKuerzel,
      leistungsart: firstLeistungsart,
      zeitraumVon: zeitraumVonISO ? isoToDisplay(zeitraumVonISO) : "",
      zeitraumBis: zeitraumBisISO ? isoToDisplay(zeitraumBisISO) : "",
      totalStunden
    };
  }, [
    firstProject,
    template,
    rechnungsnummer,
    datum,
    faelligkeitsdatum,
    selectedCustomer,
    companyData,
    companyName,
    positions,
    allEmployees,
    isEditMode,
    unbilledData,
    projectMembersMap,
    editModeTimeEntries
  ]);
  const qrData = reactExports.useMemo(() => {
    if (!qrAktiv || !(template == null ? void 0 : template.qrIban)) return null;
    return buildSwissQRData({
      iban: template.qrIban ?? "",
      kontoinhaber: template.qrKontoinhaber ?? companyName ?? "",
      kontoinhaberAdresse: template.qrKontoinhaberAdresse ?? "",
      kundeNamen: (selectedCustomer == null ? void 0 : selectedCustomer.name) ?? "",
      kundeAdresse: (selectedCustomer == null ? void 0 : selectedCustomer.rechnungsadresse) ? `${selectedCustomer.rechnungsadresse.strasse ?? ""}, ${selectedCustomer.rechnungsadresse.plz ?? ""} ${selectedCustomer.rechnungsadresse.ort ?? ""}`.trim() : "",
      betrag: totalRounded,
      waehrung: "CHF",
      // Swiss Payment Standards: QR-Zahlschein always CHF
      referenztyp: template.qrReferenztyp ?? "NON",
      referenz: template.qrReferenzPraefix ? `${template.qrReferenzPraefix}${rechnungsnummer}` : rechnungsnummer,
      zusatz: rechnungsnummer
    });
  }, [
    qrAktiv,
    template,
    selectedCustomer,
    totalRounded,
    rechnungsnummer,
    companyName
  ]);
  const qrDataUrl = useQRCode(qrData);
  const kundenadresseAbstandOben = reactExports.useMemo(() => {
    if ((template == null ? void 0 : template.kundenadresseAbstandOben) != null) {
      return Number(template.kundenadresseAbstandOben);
    }
    try {
      const saved = localStorage.getItem("rv_kundenadresse_abstand_oben");
      if (saved) return Number(saved);
    } catch {
    }
    return 45;
  }, [template]);
  const kundenadresseEinrueckungZeichen = reactExports.useMemo(() => {
    if ((template == null ? void 0 : template.kundenadresseEinrueckungZeichen) != null) {
      return Number(template.kundenadresseEinrueckungZeichen);
    }
    try {
      const saved = localStorage.getItem(
        "rv_kundenadresse_einrueckung_zeichen"
      );
      if (saved) return Number(saved);
    } catch {
    }
    return 0;
  }, [template]);
  const kundenadressePosition = reactExports.useMemo(() => {
    try {
      const saved = localStorage.getItem("rv_kundenadresse_position");
      if (saved === "links" || saved === "rechts" || saved === "zentriert")
        return saved;
    } catch {
    }
    return "links";
  }, []);
  const kundenadresseAbstandNach = reactExports.useMemo(() => {
    if ((template == null ? void 0 : template.kundenadresseAbstandNach) != null) {
      return Number(template.kundenadresseAbstandNach);
    }
    try {
      const saved = localStorage.getItem("rv_kundenadresse_abstand_nach");
      if (saved) return Number(saved);
    } catch {
    }
    return 10;
  }, [template]);
  const saveInvoice = useMutation({
    mutationFn: async (targetStatus) => {
      if (!actor) throw new Error("Kein Actor verfügbar");
      const posInputs = positions.map(posToInput);
      const isoD = displayToISO(datum) || todayISO();
      const isoF = displayToISO(faelligkeitsdatum) || addDays(isoD, 30);
      if (isEditMode && invoiceId) {
        const res = await toAny(actor).updateInvoice(BigInt(invoiceId), {
          status: targetStatus,
          fusstext,
          positionen: posInputs,
          faelligkeitsdatum: isoF,
          mwstSatz: mwstNum,
          rabatt: rabattNum,
          kopftext,
          kundeId: kundeId ? BigInt(kundeId) : void 0,
          datum: isoD,
          skonto: skontoNum
        });
        if (res.__kind__ === "err") throw new Error(res.err ?? "Fehler");
        return res;
      }
      if (!kundeId) throw new Error("Kein Kunde gesetzt");
      const createRes = await toAny(actor).createInvoice({
        kundeId: BigInt(kundeId),
        fusstext,
        positionen: posInputs,
        mwstSatz: mwstNum,
        rabatt: rabattNum,
        kopftext,
        skonto: skontoNum
      });
      if (createRes.__kind__ === "err")
        throw new Error(createRes.err ?? "Fehler");
      return createRes;
    }
  });
  const markVersendet = useMutation({
    mutationFn: async (targetInvoiceIdOverride) => {
      if (!actor) throw new Error("Kein Actor verfügbar");
      const targetInvoiceId = targetInvoiceIdOverride ?? (isEditMode && invoiceId ? BigInt(invoiceId) : null);
      if (!targetInvoiceId) throw new Error("Keine Rechnungs-ID");
      const timeRefIds = positions.filter((p) => p.typ === InvoicePositionTyp.leistung && p.referenzId).map((p) => p.referenzId);
      const expRefIds = positions.filter((p) => p.typ === InvoicePositionTyp.spese && p.referenzId).map((p) => p.referenzId);
      const res = await toAny(actor).markFakturiert(
        targetInvoiceId,
        timeRefIds,
        expRefIds
      );
      if (res.__kind__ === "err") throw new Error(res.err ?? "Fehler");
    }
  });
  const handleSaveEntwurf = async () => {
    setErrorMsg(null);
    setIsSaving(true);
    try {
      await saveInvoice.mutateAsync(InvoiceStatus.entwurf);
      navigate({
        to: "/fakturierung",
        search: { tab: "rechnungen", filterStatus: "entwurf" }
      });
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Unbekannter Fehler");
    } finally {
      setIsSaving(false);
    }
  };
  const handleVersendet = async () => {
    setErrorMsg(null);
    setIsMarkingVersendet(true);
    try {
      const saveRes = await saveInvoice.mutateAsync(InvoiceStatus.versendet);
      if (isEditMode && invoiceId) {
        await markVersendet.mutateAsync(void 0);
      } else {
        const newInvoice = saveRes.ok;
        if (newInvoice == null ? void 0 : newInvoice.id) {
          await markVersendet.mutateAsync(newInvoice.id);
        }
      }
      navigate({ to: "/fakturierung", search: { tab: "rechnungen" } });
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Unbekannter Fehler");
    } finally {
      setIsMarkingVersendet(false);
    }
  };
  const handleBack = () => {
    navigate({
      to: "/fakturierung",
      search: { tab: "rechnungen", filterStatus: "entwurf" }
    });
  };
  const handlePrint = () => window.print();
  const addPosition = () => {
    setPositions((prev) => [
      ...prev,
      {
        id: newLocalId(),
        typ: InvoicePositionTyp.freitext,
        bezeichnung: "",
        menge: 1,
        einheit: "Std.",
        preis: 0
      }
    ]);
  };
  const removePosition = (id) => setPositions((prev) => prev.filter((p) => p.id !== id));
  const updatePosition = (id, field, value) => {
    setPositions(
      (prev) => prev.map((p) => p.id === id ? { ...p, [field]: value } : p)
    );
  };
  const isLoading = customersLoading || templateLoading || isEditMode && invoiceLoading;
  const hasQrIban = !!(template == null ? void 0 : template.qrIban);
  const headerLogoUrl = (template == null ? void 0 : template.kopfzeileLogoQuelle) === "upload" ? template.kopfzeileBildUrl ?? companyLogoUrl ?? "" : companyLogoUrl ?? "";
  const logoHeightMap = {
    small: 30,
    medium: 60,
    large: 90
  };
  const logoHeight = logoHeightMap[(template == null ? void 0 : template.kopfzeileLogoGroesse) ?? "medium"] ?? 60;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Layout, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
        @media print {
          /* Hide everything except the invoice preview */
          .invoice-editor-section { display: none !important; }
          nav, header, aside, footer,
          [data-ocid="support-chat"], .stopwatch-widget,
          .no-print { display: none !important; }
          body, html {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            height: auto !important;
          }

          /* ── Override ALL Layout overflow constraints ── */
          /* h-screen overflow-hidden wrapper */
          .h-screen {
            height: auto !important;
            overflow: visible !important;
          }
          /* flex overflow-hidden wrappers */
          .overflow-hidden {
            overflow: visible !important;
          }
          /* main overflow-y-auto */
          main {
            overflow: visible !important;
            height: auto !important;
            flex: none !important;
          }

          /* Reset Tailwind layout wrappers */
          .p-4, .md\\:p-6, .max-w-screen-2xl {
            display: block !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            height: auto !important;
          }

          /* Flex row becomes block so preview is full width */
          .flex.flex-col.lg\\:flex-row,
          .flex-col.lg\\:flex-row {
            display: block !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
          }

          /* Invoice preview section: full A4 width, NO overflow clipping */
          .invoice-preview-section,
          #invoice-print-root {
            display: block !important;
            position: static !important;
            width: 100% !important;
            max-width: 210mm !important;
            margin: 0 auto !important;
            padding: 0 !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            overflow: visible !important;
            overflow-y: visible !important;
            overflow-x: visible !important;
            box-shadow: none !important;
            border: none !important;
            flex: none !important;
            flex-shrink: 0 !important;
          }

          /* Inner invoice card: remove fixed sizing */
          .invoice-preview-section > div,
          #invoice-print-root > div {
            width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            overflow: visible !important;
            overflow-y: visible !important;
            box-shadow: none !important;
            border: none !important;
            padding: 8mm !important;
            border-radius: 0 !important;
          }

          /* Table multipage rules */
          table { page-break-inside: auto !important; width: 100% !important; }
          thead { display: table-header-group !important; }
          tfoot { display: table-footer-group !important; }
          tbody tr { page-break-inside: avoid !important; page-break-after: auto !important; }

          /* QR Zahlschein always on its own page — DO NOT REMOVE */
          .qr-zahlschein {
            page-break-before: always !important;
            break-before: page !important;
            margin-top: 0 !important;
            padding-top: 24px !important;
          }
        }
        @page { size: A4; margin: 15mm; }
      ` }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 md:p-6 max-w-screen-2xl mx-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "invoice-editor-section flex items-center gap-3 mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "ghost",
            size: "sm",
            "data-ocid": "invoice-editor.back_button",
            onClick: handleBack,
            className: "gap-1.5",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "w-4 h-4" }),
              "Zurück"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 ml-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-5 h-5 text-primary" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-display font-semibold text-foreground leading-tight", children: isEditMode ? "Rechnung bearbeiten" : "Neue Rechnung" }),
            rechnungsnummer && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: rechnungsnummer })
          ] })
        ] }),
        isEditMode && (status === InvoiceStatus.ueberfaellig ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 border border-orange-200", children: STATUS_LABELS[status] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
          Badge,
          {
            variant: STATUS_COLORS[status],
            className: "ml-auto",
            children: STATUS_LABELS[status]
          }
        ))
      ] }),
      isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-12 w-full" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-48 w-full" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-32 w-full" })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col lg:flex-row gap-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "invoice-editor-section flex-1 space-y-5",
            "data-ocid": "invoice-editor.panel",
            children: [
              errorMsg && /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  "data-ocid": "invoice-editor.error_state",
                  className: "p-3 rounded-md bg-destructive/10 border border-destructive/30 text-sm text-destructive",
                  children: errorMsg
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card border border-border rounded-lg p-5 space-y-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold text-foreground uppercase tracking-wide", children: "Rechnungskopf" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "inv-kunde", children: "Kunde" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        id: "inv-kunde",
                        "data-ocid": "invoice-editor.kunde_field",
                        value: (selectedCustomer == null ? void 0 : selectedCustomer.name) ?? (kundeId ? `Kunde #${kundeId}` : "–"),
                        readOnly: true,
                        className: "bg-muted/40"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "inv-nr", children: "Rechnungsnummer" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        id: "inv-nr",
                        "data-ocid": "invoice-editor.rechnungsnummer_input",
                        value: rechnungsnummer,
                        readOnly: true,
                        className: "bg-muted/40"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "inv-datum", children: "Rechnungsdatum (TT.MM.JJJJ)" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        id: "inv-datum",
                        "data-ocid": "invoice-editor.datum_input",
                        type: "text",
                        placeholder: "TT.MM.JJJJ",
                        value: datum,
                        onChange: (e) => setDatum(e.target.value)
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "inv-faelligkeit", children: "Fälligkeitsdatum (TT.MM.JJJJ)" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        id: "inv-faelligkeit",
                        "data-ocid": "invoice-editor.faelligkeitsdatum_input",
                        type: "text",
                        placeholder: "TT.MM.JJJJ",
                        value: faelligkeitsdatum,
                        onChange: (e) => setFaelligkeitsdatum(e.target.value)
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "inv-waehrung", children: "Währung" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        id: "inv-waehrung",
                        value: waehrung,
                        readOnly: true,
                        className: "bg-muted/40"
                      }
                    )
                  ] }),
                  isEditMode && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "inv-status", children: "Status" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "select",
                      {
                        id: "inv-status",
                        "data-ocid": "invoice-editor.status_select",
                        value: status,
                        onChange: (e) => setStatus(e.target.value),
                        className: "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                        children: Object.entries(STATUS_LABELS).map(([val, label]) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: val, children: label }, val))
                      }
                    )
                  ] })
                ] }),
                hasQrIban && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 pt-2 border-t border-border", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Switch,
                    {
                      id: "qr-toggle",
                      "data-ocid": "invoice-editor.qr_toggle",
                      checked: qrAktiv,
                      onCheckedChange: setQrAktiv
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "qr-toggle", className: "cursor-pointer", children: "Rechnung mit QR-Code (Zahlschein) drucken" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card border border-border rounded-lg p-5 space-y-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold text-foreground uppercase tracking-wide", children: "Positionen" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Button,
                    {
                      type: "button",
                      variant: "outline",
                      size: "sm",
                      "data-ocid": "invoice-editor.add_position_button",
                      onClick: addPosition,
                      className: "gap-1.5",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3.5 h-3.5" }),
                        "Position hinzufügen"
                      ]
                    }
                  )
                ] }),
                positions.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    "data-ocid": "invoice-editor.positions.empty_state",
                    className: "py-8 flex flex-col items-center justify-center gap-2 text-muted-foreground",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-8 h-8 opacity-30" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "Noch keine Positionen. Klicke auf «Position hinzufügen»." })
                    ]
                  }
                ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto -mx-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left pb-2 px-1 font-medium text-muted-foreground w-[40%]", children: "Bezeichnung" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right pb-2 px-1 font-medium text-muted-foreground w-[10%]", children: "Menge" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left pb-2 px-1 font-medium text-muted-foreground w-[10%]", children: "Einheit" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right pb-2 px-1 font-medium text-muted-foreground w-[15%]", children: "Preis" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right pb-2 px-1 font-medium text-muted-foreground w-[15%]", children: "Total" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 px-1 w-[5%]" })
                  ] }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: positions.map((p, idx) => {
                    const lineTotal = p.menge * p.preis;
                    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "tr",
                      {
                        "data-ocid": `invoice-editor.position.item.${idx + 1}`,
                        className: "border-b border-border/50 last:border-0",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1.5 px-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Input,
                            {
                              "data-ocid": `invoice-editor.position.bezeichnung.${idx + 1}`,
                              value: p.bezeichnung,
                              onChange: (e) => updatePosition(
                                p.id,
                                "bezeichnung",
                                e.target.value
                              ),
                              placeholder: "Bezeichnung",
                              className: "h-8 text-sm"
                            }
                          ) }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1.5 px-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Input,
                            {
                              "data-ocid": `invoice-editor.position.menge.${idx + 1}`,
                              type: "number",
                              value: p.menge,
                              onChange: (e) => updatePosition(
                                p.id,
                                "menge",
                                Number.parseFloat(e.target.value) || 0
                              ),
                              className: "h-8 text-sm text-right",
                              min: 0,
                              step: 0.25
                            }
                          ) }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1.5 px-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Input,
                            {
                              "data-ocid": `invoice-editor.position.einheit.${idx + 1}`,
                              value: p.einheit,
                              onChange: (e) => updatePosition(
                                p.id,
                                "einheit",
                                e.target.value
                              ),
                              placeholder: "Std.",
                              className: "h-8 text-sm"
                            }
                          ) }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1.5 px-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Input,
                            {
                              "data-ocid": `invoice-editor.position.preis.${idx + 1}`,
                              type: "number",
                              value: p.preis,
                              onChange: (e) => updatePosition(
                                p.id,
                                "preis",
                                Number.parseFloat(e.target.value) || 0
                              ),
                              className: "h-8 text-sm text-right",
                              min: 0,
                              step: 0.01
                            }
                          ) }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-1.5 px-1 text-right tabular-nums font-medium", children: [
                            waehrung,
                            " ",
                            lineTotal.toLocaleString("de-CH", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1.5 px-1 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Button,
                            {
                              type: "button",
                              variant: "ghost",
                              size: "sm",
                              "data-ocid": `invoice-editor.position.delete_button.${idx + 1}`,
                              onClick: () => removePosition(p.id),
                              className: "h-8 w-8 p-0 text-muted-foreground hover:text-destructive",
                              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" })
                            }
                          ) })
                        ]
                      },
                      p.id
                    );
                  }) })
                ] }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card border border-border rounded-lg p-5 space-y-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold text-foreground uppercase tracking-wide", children: "Beträge" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-xs ml-auto space-y-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Zwischensumme" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tabular-nums", children: formatAmount(zwischensumme, waehrung) })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      Label,
                      {
                        htmlFor: "inv-rabatt",
                        className: "text-sm text-muted-foreground whitespace-nowrap",
                        children: [
                          "Rabatt (",
                          waehrung,
                          ")"
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        id: "inv-rabatt",
                        "data-ocid": "invoice-editor.rabatt_input",
                        type: "number",
                        value: rabatt,
                        onChange: (e) => setRabatt(e.target.value),
                        className: "h-8 text-sm text-right w-28",
                        min: 0,
                        step: 0.01
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      Label,
                      {
                        htmlFor: "inv-skonto",
                        className: "text-sm text-muted-foreground whitespace-nowrap",
                        children: [
                          "Skonto (",
                          waehrung,
                          ")"
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        id: "inv-skonto",
                        "data-ocid": "invoice-editor.skonto_input",
                        type: "number",
                        value: skonto,
                        onChange: (e) => setSkonto(e.target.value),
                        className: "h-8 text-sm text-right w-28",
                        min: 0,
                        step: 0.01
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Label,
                      {
                        htmlFor: "inv-mwst",
                        className: "text-sm text-muted-foreground whitespace-nowrap",
                        children: "MwSt-Satz (%)"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        id: "inv-mwst",
                        "data-ocid": "invoice-editor.mwst_input",
                        type: "number",
                        value: mwstSatz,
                        onChange: (e) => setMwstSatz(e.target.value),
                        className: "h-8 text-sm text-right w-28",
                        min: 0,
                        step: 0.1
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "MwSt-Betrag" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tabular-nums", children: formatAmount(mwstBetrag, waehrung) })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-t border-border pt-3", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-foreground", children: "Total" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-lg text-primary tabular-nums", children: formatAmount(total, waehrung) })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card border border-border rounded-lg p-5 space-y-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold text-foreground uppercase tracking-wide", children: "Texte" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "inv-kopftext", children: "Kopftext" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Textarea,
                      {
                        id: "inv-kopftext",
                        "data-ocid": "invoice-editor.kopftext_textarea",
                        value: kopftext,
                        onChange: (e) => setKopftext(e.target.value),
                        rows: 3,
                        placeholder: "Kopftext der Rechnung…"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "inv-fusstext", children: "Fusstext" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Textarea,
                      {
                        id: "inv-fusstext",
                        "data-ocid": "invoice-editor.fusstext_textarea",
                        value: fusstext,
                        onChange: (e) => setFusstext(e.target.value),
                        rows: 4,
                        placeholder: "Zahlungsinformationen, Bankverbindung…"
                      }
                    )
                  ] })
                ] })
              ] }),
              ((template == null ? void 0 : template.iban) || (template == null ? void 0 : template.bank) || (template == null ? void 0 : template.mwstNummer)) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted/30 border border-border rounded-lg p-4 space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2", children: "Bankverbindung (aus Vorlage)" }),
                template.bank && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground", children: template.bank }),
                template.iban && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-foreground font-mono", children: [
                  "IBAN: ",
                  template.iban
                ] }),
                template.mwstNummer && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
                  "MwSt-Nr: ",
                  template.mwstNummer
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-card border border-border rounded-lg p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Button,
                  {
                    type: "button",
                    "data-ocid": "invoice-editor.save_entwurf_button",
                    onClick: handleSaveEntwurf,
                    disabled: isSaving || isMarkingVersendet,
                    className: "gap-2",
                    children: [
                      isSaving ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "w-4 h-4" }),
                      "Entwurf speichern"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Button,
                  {
                    type: "button",
                    variant: "secondary",
                    "data-ocid": "invoice-editor.versendet_button",
                    onClick: handleVersendet,
                    disabled: isSaving || isMarkingVersendet,
                    className: "gap-2",
                    children: [
                      isMarkingVersendet ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-4 h-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "w-4 h-4" }),
                      "Als versendet markieren"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Button,
                  {
                    type: "button",
                    variant: "outline",
                    "data-ocid": "invoice-editor.print_button",
                    onClick: handlePrint,
                    className: "gap-2",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-4 h-4" }),
                      "PDF drucken"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    type: "button",
                    variant: "ghost",
                    "data-ocid": "invoice-editor.cancel_button",
                    onClick: handleBack,
                    className: "ml-auto",
                    children: "Abbrechen"
                  }
                )
              ] }) })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            id: "invoice-print-root",
            className: "invoice-preview-section lg:w-[580px] xl:w-[640px] shrink-0",
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "bg-white shadow-lg rounded-lg border border-border/50 text-sm text-[#222] font-body",
                style: { padding: "2rem" },
                children: [
                  (template == null ? void 0 : template.kopfzeileLogoQuelle) !== "upload" && (template == null ? void 0 : template.kopfzeileBildUrl) && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: `mb-3 ${imgAlignClass(template.kopfzeileBildPosition)}`,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "img",
                        {
                          src: template.kopfzeileBildUrl,
                          alt: "Kopfzeile",
                          className: "max-h-16 max-w-full object-contain"
                        }
                      )
                    }
                  ),
                  (() => {
                    if ((template == null ? void 0 : template.kopfzeileLayout) === "uebereinander") {
                      return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "div",
                          {
                            className: `flex ${imgAlignClass(template == null ? void 0 : template.kopfzeileAdressePosition) ? `justify-${template == null ? void 0 : template.kopfzeileAdressePosition}` : "justify-start"}`,
                            children: headerLogoUrl && /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "img",
                              {
                                src: headerLogoUrl,
                                alt: "Firmenlogo",
                                style: { height: `${logoHeight}px` },
                                className: "object-contain"
                              }
                            )
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "div",
                          {
                            className: alignClass(
                              template == null ? void 0 : template.kopfzeileAdressePosition
                            ),
                            children: (template == null ? void 0 : template.kopfzeileAdresse) ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-[#555] whitespace-pre-line", children: template.kopfzeileAdresse }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-base", children: companyName ?? "Firmenname" }),
                              (companyData == null ? void 0 : companyData.address) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-[#555] whitespace-pre-line", children: companyData.address })
                            ] })
                          }
                        )
                      ] }) });
                    }
                    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 max-w-[55%]", children: [
                      headerLogoUrl && /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "img",
                        {
                          src: headerLogoUrl,
                          alt: "Firmenlogo",
                          style: {
                            height: `${Math.round(logoHeight * 0.75)}px`
                          },
                          className: "object-contain mb-2"
                        }
                      ),
                      (template == null ? void 0 : template.kopfzeileAdresse) ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-[#555] whitespace-pre-line", children: template.kopfzeileAdresse }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-base", children: companyName ?? "Firmenname" }),
                        (companyData == null ? void 0 : companyData.address) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-[#555] whitespace-pre-line", children: companyData.address })
                      ] }),
                      (template == null ? void 0 : template.mwstNummer) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-[#666]", children: [
                        "MwSt-Nr: ",
                        template.mwstNummer
                      ] }),
                      (template == null ? void 0 : template.iban) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-[#666]", children: [
                        template.bank && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                          template.bank,
                          " · "
                        ] }),
                        "IBAN:",
                        " ",
                        template.iban
                      ] })
                    ] }) });
                  })(),
                  selectedCustomer && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "div",
                    {
                      style: {
                        marginTop: `${kundenadresseAbstandOben}px`,
                        marginBottom: `${kundenadresseAbstandNach}px`,
                        ...kundenadressePosition === "rechts" ? { textAlign: "right" } : kundenadressePosition === "zentriert" ? { textAlign: "center" } : {
                          paddingLeft: `${kundenadresseEinrueckungZeichen}px`,
                          textAlign: "left"
                        }
                      },
                      className: "text-xs space-y-0.5",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-sm", children: selectedCustomer.name }),
                        ((_a = selectedCustomer.rechnungsadresse) == null ? void 0 : _a.zusatz1) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: selectedCustomer.rechnungsadresse.zusatz1 }),
                        ((_b = selectedCustomer.rechnungsadresse) == null ? void 0 : _b.zusatz2) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: selectedCustomer.rechnungsadresse.zusatz2 }),
                        ((_c = selectedCustomer.rechnungsadresse) == null ? void 0 : _c.strasse) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: selectedCustomer.rechnungsadresse.strasse }),
                        ((_d = selectedCustomer.rechnungsadresse) == null ? void 0 : _d.postfach) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: selectedCustomer.rechnungsadresse.postfach }),
                        (((_e = selectedCustomer.rechnungsadresse) == null ? void 0 : _e.plz) || ((_f = selectedCustomer.rechnungsadresse) == null ? void 0 : _f.ort)) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                          selectedCustomer.rechnungsadresse.plz,
                          " ",
                          selectedCustomer.rechnungsadresse.ort
                        ] }),
                        ((_g = selectedCustomer.rechnungsadresse) == null ? void 0 : _g.land) && selectedCustomer.rechnungsadresse.land !== "Schweiz" && selectedCustomer.rechnungsadresse.land !== "CH" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: selectedCustomer.rechnungsadresse.land })
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6 space-y-1 border-b border-[#e0e0e0] pb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-8", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-[#888] block", children: "Rechnungsnummer" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: rechnungsnummer || "RE-0001" })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-[#888] block", children: "Datum" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: datum || isoToDisplay(todayISO()) })
                    ] }),
                    faelligkeitsdatum && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-[#888] block", children: "Fällig am" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: faelligkeitsdatum })
                    ] })
                  ] }) }),
                  kopftext && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: `mb-5 text-xs whitespace-pre-line leading-relaxed ${alignClass(template == null ? void 0 : template.kopfzeilePosition)}`,
                      children: replacePlaceholders(kopftext, placeholderCtx)
                    }
                  ),
                  (() => {
                    const leistungen = positions.filter(
                      (p) => p.typ !== InvoicePositionTyp.spese
                    );
                    const spesen = positions.filter(
                      (p) => p.typ === InvoicePositionTyp.spese
                    );
                    const leistungenTotal = leistungen.reduce(
                      (s, p) => s + p.menge * p.preis,
                      0
                    );
                    const spesenTotal = spesen.reduce(
                      (s, p) => s + p.menge * p.preis,
                      0
                    );
                    const accentColor = (template == null ? void 0 : template.farbe) || "#006066";
                    const renderLeistungenSection = (rows, sectionTotal) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "div",
                        {
                          className: "font-semibold text-xs mb-1 uppercase tracking-wide",
                          style: { color: accentColor },
                          children: "Leistungen"
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs border-collapse", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "tr",
                          {
                            className: "border-b-2",
                            style: { borderBottomColor: accentColor },
                            children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-1 pr-2 font-semibold w-20", children: "Datum" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-1 pr-2 font-semibold", children: "Bezeichnung" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right py-1 pr-2 font-semibold w-14", children: "Menge" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-1 pr-2 font-semibold w-12", children: "Einheit" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsxs("th", { className: "text-right py-1 pr-2 font-semibold w-20", children: [
                                "Preis ",
                                waehrung
                              ] }),
                              /* @__PURE__ */ jsxRuntimeExports.jsxs("th", { className: "text-right py-1 font-semibold w-20", children: [
                                "Total ",
                                waehrung
                              ] })
                            ]
                          }
                        ) }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
                          rows.map((p) => {
                            const bezeichnungDisplay = p.leistungsart ? p.bezeichnung ? `${p.leistungsart} - ${p.bezeichnung}` : p.leistungsart : p.bezeichnung || "";
                            const datumDisplay = p.datum ? isoToDisplay(p.datum) : "";
                            const vonBis = p.von && p.bis ? `${p.von} – ${p.bis}` : null;
                            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                              "tr",
                              {
                                className: "border-b border-[#f0f0f0]",
                                children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1 pr-2 text-[#888] tabular-nums whitespace-nowrap", children: datumDisplay }),
                                  /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-1 pr-2", children: [
                                    bezeichnungDisplay || /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#bbb] italic", children: "—" }),
                                    vonBis && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#666] text-[10px] mt-0.5", children: vonBis })
                                  ] }),
                                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1 pr-2 text-right tabular-nums", children: formatHoursHHMM(p.menge) }),
                                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1 pr-2", children: p.einheit }),
                                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1 pr-2 text-right tabular-nums", children: p.preis.toLocaleString("de-CH", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                  }) }),
                                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1 text-right tabular-nums", children: (p.menge * p.preis).toLocaleString("de-CH", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                  }) })
                                ]
                              },
                              p.id
                            );
                          }),
                          rows.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "td",
                            {
                              colSpan: 6,
                              className: "py-3 text-center text-[#ccc] italic",
                              children: "Keine Positionen"
                            }
                          ) }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(
                            "tr",
                            {
                              className: "font-semibold",
                              style: { borderTop: `1px solid ${accentColor}4D` },
                              children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx(
                                  "td",
                                  {
                                    colSpan: 5,
                                    className: "py-1 pr-2 text-right text-[#555] text-xs",
                                    children: "Total Leistungen"
                                  }
                                ),
                                /* @__PURE__ */ jsxRuntimeExports.jsx(
                                  "td",
                                  {
                                    className: "py-1 text-right tabular-nums",
                                    style: { color: accentColor },
                                    children: sectionTotal.toLocaleString("de-CH", {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2
                                    })
                                  }
                                )
                              ]
                            }
                          )
                        ] })
                      ] })
                    ] }, "leistungen");
                    const renderSpesenSection = (rows, sectionTotal) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "div",
                        {
                          className: "font-semibold text-xs mb-1 uppercase tracking-wide",
                          style: { color: accentColor },
                          children: "Spesen"
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs border-collapse", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "tr",
                          {
                            className: "border-b-2",
                            style: { borderBottomColor: accentColor },
                            children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-1 pr-2 font-semibold w-20", children: "Datum" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-1 pr-2 font-semibold", children: "Bezeichnung" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsxs("th", { className: "text-right py-1 font-semibold w-24", children: [
                                "Betrag ",
                                waehrung
                              ] })
                            ]
                          }
                        ) }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
                          rows.map((p) => {
                            const datumDisplay = p.datum ? isoToDisplay(p.datum) : "";
                            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                              "tr",
                              {
                                className: "border-b border-[#f0f0f0]",
                                children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1 pr-2 text-[#888] tabular-nums whitespace-nowrap", children: datumDisplay }),
                                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1 pr-2", children: p.bezeichnung || /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#bbb] italic", children: "—" }) }),
                                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1 text-right tabular-nums", children: p.preis.toLocaleString("de-CH", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                  }) })
                                ]
                              },
                              p.id
                            );
                          }),
                          rows.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "td",
                            {
                              colSpan: 3,
                              className: "py-3 text-center text-[#ccc] italic",
                              children: "Keine Positionen"
                            }
                          ) }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(
                            "tr",
                            {
                              className: "font-semibold",
                              style: { borderTop: `1px solid ${accentColor}4D` },
                              children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx(
                                  "td",
                                  {
                                    colSpan: 2,
                                    className: "py-1 pr-2 text-right text-[#555] text-xs",
                                    children: "Total Spesen"
                                  }
                                ),
                                /* @__PURE__ */ jsxRuntimeExports.jsx(
                                  "td",
                                  {
                                    className: "py-1 text-right tabular-nums",
                                    style: { color: accentColor },
                                    children: sectionTotal.toLocaleString("de-CH", {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2
                                    })
                                  }
                                )
                              ]
                            }
                          )
                        ] })
                      ] })
                    ] }, "spesen");
                    if (leistungen.length === 0 && spesen.length === 0) {
                      return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-5 py-4 text-center text-xs text-[#ccc] italic border border-[#f0f0f0] rounded", children: "Keine Positionen" });
                    }
                    return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                      leistungen.length > 0 && renderLeistungenSection(leistungen, leistungenTotal),
                      spesen.length > 0 && renderSpesenSection(spesen, spesenTotal)
                    ] });
                  })(),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-56 space-y-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#666]", children: "Zwischensumme" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tabular-nums", children: zwischensumme.toLocaleString("de-CH", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      }) })
                    ] }),
                    rabattNum !== 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#666]", children: "Rabatt" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "tabular-nums text-red-600", children: [
                        "-",
                        rabattNum.toLocaleString("de-CH", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })
                      ] })
                    ] }),
                    skontoNum !== 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#666]", children: "Skonto" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "tabular-nums text-red-600", children: [
                        "-",
                        skontoNum.toLocaleString("de-CH", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[#666]", children: [
                        "MwSt ",
                        mwstNum,
                        "%"
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tabular-nums", children: mwstBetrag.toLocaleString("de-CH", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      }) })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "div",
                      {
                        className: "flex justify-between border-t-2 pt-1.5 font-bold",
                        style: { borderTopColor: (template == null ? void 0 : template.farbe) || "#006066" },
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                            "Total ",
                            waehrung
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "span",
                            {
                              className: "tabular-nums",
                              style: { color: (template == null ? void 0 : template.farbe) || "#006066" },
                              children: totalRounded.toLocaleString("de-CH", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })
                            }
                          )
                        ]
                      }
                    )
                  ] }) }),
                  fusstext && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: `text-xs whitespace-pre-line leading-relaxed text-[#555] border-t border-[#e0e0e0] pt-4 ${alignClass(template == null ? void 0 : template.fusszeilePosition)}`,
                      children: replacePlaceholders(fusstext, placeholderCtx)
                    }
                  ),
                  (template == null ? void 0 : template.fusszeileBildUrl) && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: `mt-3 ${imgAlignClass(template.fusszeileBildPosition)}`,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "img",
                        {
                          src: template.fusszeileBildUrl,
                          alt: "Fusszeile",
                          className: "max-h-16 max-w-full object-contain"
                        }
                      )
                    }
                  ),
                  qrAktiv && (template == null ? void 0 : template.qrIban) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "qr-zahlschein mt-12 pt-6 border-t-2 border-dashed border-[#aaa]", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-[10px] text-[#888] mb-4 tracking-widest", children: "✂ Hier abtrennen" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-0 text-[10px]", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-1/3 border-r border-[#ccc] pr-3 space-y-2", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-xs", children: "Empfangsschein" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#888] text-[9px]", children: "Konto / Zahlbar an" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-[9px] break-all", children: template.qrIban }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px]", children: template.qrKontoinhaber }),
                          template.qrKontoinhaberAdresse && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px]", children: template.qrKontoinhaberAdresse })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#888] text-[9px]", children: "Zahlbar durch" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px]", children: selectedCustomer == null ? void 0 : selectedCustomer.name }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px]", children: (_h = selectedCustomer == null ? void 0 : selectedCustomer.rechnungsadresse) == null ? void 0 : _h.strasse }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[9px]", children: [
                            (_i = selectedCustomer == null ? void 0 : selectedCustomer.rechnungsadresse) == null ? void 0 : _i.plz,
                            " ",
                            (_j = selectedCustomer == null ? void 0 : selectedCustomer.rechnungsadresse) == null ? void 0 : _j.ort
                          ] })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#888] text-[9px]", children: "Währung / Betrag" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-semibold text-[9px]", children: [
                            "CHF ",
                            totalRounded.toLocaleString("de-CH", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })
                          ] })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#888] text-[9px] mt-1", children: "Annahmestelle" })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-2/3 pl-4 space-y-2", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-xs", children: "Zahlteil" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 items-start", children: [
                          qrDataUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "img",
                            {
                              src: qrDataUrl,
                              alt: "QR Code",
                              className: "w-28 h-28 shrink-0"
                            }
                          ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-28 h-28 border-2 border-dashed border-[#ccc] flex items-center justify-center text-[#ccc] text-[9px] shrink-0", children: "QR Code" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 flex-1", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#888] text-[9px]", children: "Währung" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-[9px]", children: "CHF" })
                            ] }),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#888] text-[9px]", children: "Betrag" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-[9px]", children: totalRounded.toLocaleString("de-CH", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              }) })
                            ] })
                          ] })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#888] text-[9px]", children: "Zahlbar an" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-[9px] break-all", children: template.qrIban }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px]", children: template.qrKontoinhaber }),
                          template.qrKontoinhaberAdresse && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px]", children: template.qrKontoinhaberAdresse })
                        ] }),
                        template.qrReferenztyp && template.qrReferenztyp !== "NON" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#888] text-[9px]", children: "Referenz" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-mono text-[9px]", children: [
                            template.qrReferenzPraefix,
                            rechnungsnummer
                          ] })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#888] text-[9px]", children: "Zahlbar durch" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px]", children: selectedCustomer == null ? void 0 : selectedCustomer.name }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px]", children: (_k = selectedCustomer == null ? void 0 : selectedCustomer.rechnungsadresse) == null ? void 0 : _k.strasse }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[9px]", children: [
                            (_l = selectedCustomer == null ? void 0 : selectedCustomer.rechnungsadresse) == null ? void 0 : _l.plz,
                            " ",
                            (_m = selectedCustomer == null ? void 0 : selectedCustomer.rechnungsadresse) == null ? void 0 : _m.ort
                          ] })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#888] text-[9px]", children: "Zusätzliche Informationen" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px]", children: rechnungsnummer })
                        ] })
                      ] })
                    ] })
                  ] })
                ]
              }
            )
          }
        )
      ] })
    ] })
  ] });
}
export {
  InvoiceEditorPage as default
};
