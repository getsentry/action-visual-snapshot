require('./sourcemap-register.js');/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 857:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
/* eslint-env node */
const path_1 = __importDefault(__nccwpck_require__(17));
const multiCompareODiff_1 = __nccwpck_require__(654);
const getDiffODiff_1 = __nccwpck_require__(524);
const worker_threads_1 = __nccwpck_require__(267);
const isMultiDiffMessage = (message) => 'snapshotName' in message;
if (worker_threads_1.parentPort) {
    worker_threads_1.parentPort.on('message', (message) => __awaiter(void 0, void 0, void 0, function* () {
        let result;
        const outputDiffPath = path_1.default.resolve(message.outputDiffPath, message.file);
        try {
            if (isMultiDiffMessage(message)) {
                result = yield multiCompareODiff_1.multiCompareODiff({
                    branchBase: message.branchBase,
                    baseHead: message.baseHead,
                    branchHead: message.branchHead,
                    outputDiffPath,
                    outputMergedPath: message.outputMergedPath,
                    diffOptions: message.diffOptions,
                });
            }
            else {
                result = yield getDiffODiff_1.getDiffODiff(message.baseHead, message.branchHead, outputDiffPath, message.diffOptions);
            }
            const outboundMessage = {
                taskId: message.taskId,
                result,
            };
            if (worker_threads_1.parentPort) {
                worker_threads_1.parentPort.postMessage(outboundMessage);
            }
            else {
                throw new Error('Failed to post to postMessage to parentPort.');
            }
        }
        catch (e) {
            console.log('Diffing errored with', e);
            const outboundMessage = {
                taskId: message.taskId,
            };
            if (worker_threads_1.parentPort) {
                worker_threads_1.parentPort.postMessage(outboundMessage);
            }
            else {
                throw new Error('Failed to post to postMessage to parentPort.');
            }
        }
    }));
}
else {
    throw new Error("Can't find parent port");
}


/***/ }),

/***/ 524:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getDiffODiff = void 0;
const odiff_bin_1 = __nccwpck_require__(586);
const fs_1 = __nccwpck_require__(147);
const path_1 = __importDefault(__nccwpck_require__(17));
function getDiffODiff(file1, file2, diffPath, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!fs_1.existsSync(file1)) {
            throw new Error('File does not exist: ' + file1);
        }
        if (!fs_1.existsSync(file2)) {
            throw new Error('File does not exist: ' + file1);
        }
        const __binaryPath = process.env.NODE_ENV === 'test'
            ? undefined
            : path_1.default.resolve(__dirname, './odiff');
        console.log('Using binary path', __binaryPath, __dirname);
        const diff = yield odiff_bin_1.compare(file1, file2, diffPath, Object.assign(Object.assign({ antialiasing: false, failOnLayoutDiff: false, outputDiffMask: false, threshold: 0.1 }, options), { 
            // @ts-ignore
            __binaryPath }));
        if ('diffCount' in diff) {
            return diff.diffCount;
        }
        return 0;
    });
}
exports.getDiffODiff = getDiffODiff;


/***/ }),

/***/ 654:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.multiCompareODiff = void 0;
const sharp_1 = __importDefault(__nccwpck_require__(185));
const fs_1 = __nccwpck_require__(147);
const path_1 = __importDefault(__nccwpck_require__(17));
const getDiffODiff_1 = __nccwpck_require__(524);
function multiCompareODiff({ baseHead, branchBase, branchHead, outputDiffPath, outputMergedPath, diffOptions = {}, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const fileBaseName = path_1.default.basename(outputDiffPath);
        const outputMergedMaskPathA = path_1.default.resolve(outputMergedPath, fileBaseName.replace('.png', '.a.png'));
        const outputMergedMaskPathB = path_1.default.resolve(outputMergedPath, fileBaseName.replace('.png', '.b.png'));
        const diffB = yield getDiffODiff_1.getDiffODiff(baseHead, branchHead, outputMergedMaskPathB, Object.assign({ outputDiffMask: true, antialiasing: false }, diffOptions));
        // Hot path for when baseHead and branchBase do not have any respective changes,
        // we can indue that there is nothing to merge and we can skip the 2nd image diff operation
        if (diffB === 0) {
            fs_1.unlinkSync(outputMergedMaskPathB);
            return 0;
        }
        if (!fs_1.existsSync(branchBase)) {
            yield sharp_1.default(fs_1.readFileSync(baseHead))
                .composite([{ input: outputMergedMaskPathB, blend: 'over' }])
                .toFile(outputMergedPath);
            return diffB;
        }
        const diffA = yield getDiffODiff_1.getDiffODiff(baseHead, branchBase, outputMergedMaskPathA, Object.assign({ outputDiffMask: true, antialiasing: false }, diffOptions));
        const maskA = fs_1.readFileSync(outputMergedMaskPathA);
        const maskB = fs_1.readFileSync(outputMergedMaskPathB);
        const finalMask = yield sharp_1.default(maskA)
            .composite([{ input: maskB, blend: 'xor' }])
            .toBuffer();
        fs_1.unlinkSync(outputMergedMaskPathA);
        fs_1.unlinkSync(outputMergedMaskPathB);
        const result = Math.abs(diffB - diffA);
        if (result > 0) {
            const final = sharp_1.default(fs_1.readFileSync(baseHead)).composite([
                { input: finalMask, blend: 'over' },
            ]);
            yield final.toFile(outputDiffPath);
        }
        return result;
    });
}
exports.multiCompareODiff = multiCompareODiff;


/***/ }),

/***/ 391:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

/* MIT license */
/* eslint-disable no-mixed-operators */
const cssKeywords = __nccwpck_require__(510);

// NOTE: conversions should only return primitive values (i.e. arrays, or
//       values that give correct `typeof` results).
//       do not use box values types (i.e. Number(), String(), etc.)

const reverseKeywords = {};
for (const key of Object.keys(cssKeywords)) {
	reverseKeywords[cssKeywords[key]] = key;
}

const convert = {
	rgb: {channels: 3, labels: 'rgb'},
	hsl: {channels: 3, labels: 'hsl'},
	hsv: {channels: 3, labels: 'hsv'},
	hwb: {channels: 3, labels: 'hwb'},
	cmyk: {channels: 4, labels: 'cmyk'},
	xyz: {channels: 3, labels: 'xyz'},
	lab: {channels: 3, labels: 'lab'},
	lch: {channels: 3, labels: 'lch'},
	hex: {channels: 1, labels: ['hex']},
	keyword: {channels: 1, labels: ['keyword']},
	ansi16: {channels: 1, labels: ['ansi16']},
	ansi256: {channels: 1, labels: ['ansi256']},
	hcg: {channels: 3, labels: ['h', 'c', 'g']},
	apple: {channels: 3, labels: ['r16', 'g16', 'b16']},
	gray: {channels: 1, labels: ['gray']}
};

module.exports = convert;

// Hide .channels and .labels properties
for (const model of Object.keys(convert)) {
	if (!('channels' in convert[model])) {
		throw new Error('missing channels property: ' + model);
	}

	if (!('labels' in convert[model])) {
		throw new Error('missing channel labels property: ' + model);
	}

	if (convert[model].labels.length !== convert[model].channels) {
		throw new Error('channel and label counts mismatch: ' + model);
	}

	const {channels, labels} = convert[model];
	delete convert[model].channels;
	delete convert[model].labels;
	Object.defineProperty(convert[model], 'channels', {value: channels});
	Object.defineProperty(convert[model], 'labels', {value: labels});
}

convert.rgb.hsl = function (rgb) {
	const r = rgb[0] / 255;
	const g = rgb[1] / 255;
	const b = rgb[2] / 255;
	const min = Math.min(r, g, b);
	const max = Math.max(r, g, b);
	const delta = max - min;
	let h;
	let s;

	if (max === min) {
		h = 0;
	} else if (r === max) {
		h = (g - b) / delta;
	} else if (g === max) {
		h = 2 + (b - r) / delta;
	} else if (b === max) {
		h = 4 + (r - g) / delta;
	}

	h = Math.min(h * 60, 360);

	if (h < 0) {
		h += 360;
	}

	const l = (min + max) / 2;

	if (max === min) {
		s = 0;
	} else if (l <= 0.5) {
		s = delta / (max + min);
	} else {
		s = delta / (2 - max - min);
	}

	return [h, s * 100, l * 100];
};

convert.rgb.hsv = function (rgb) {
	let rdif;
	let gdif;
	let bdif;
	let h;
	let s;

	const r = rgb[0] / 255;
	const g = rgb[1] / 255;
	const b = rgb[2] / 255;
	const v = Math.max(r, g, b);
	const diff = v - Math.min(r, g, b);
	const diffc = function (c) {
		return (v - c) / 6 / diff + 1 / 2;
	};

	if (diff === 0) {
		h = 0;
		s = 0;
	} else {
		s = diff / v;
		rdif = diffc(r);
		gdif = diffc(g);
		bdif = diffc(b);

		if (r === v) {
			h = bdif - gdif;
		} else if (g === v) {
			h = (1 / 3) + rdif - bdif;
		} else if (b === v) {
			h = (2 / 3) + gdif - rdif;
		}

		if (h < 0) {
			h += 1;
		} else if (h > 1) {
			h -= 1;
		}
	}

	return [
		h * 360,
		s * 100,
		v * 100
	];
};

convert.rgb.hwb = function (rgb) {
	const r = rgb[0];
	const g = rgb[1];
	let b = rgb[2];
	const h = convert.rgb.hsl(rgb)[0];
	const w = 1 / 255 * Math.min(r, Math.min(g, b));

	b = 1 - 1 / 255 * Math.max(r, Math.max(g, b));

	return [h, w * 100, b * 100];
};

convert.rgb.cmyk = function (rgb) {
	const r = rgb[0] / 255;
	const g = rgb[1] / 255;
	const b = rgb[2] / 255;

	const k = Math.min(1 - r, 1 - g, 1 - b);
	const c = (1 - r - k) / (1 - k) || 0;
	const m = (1 - g - k) / (1 - k) || 0;
	const y = (1 - b - k) / (1 - k) || 0;

	return [c * 100, m * 100, y * 100, k * 100];
};

function comparativeDistance(x, y) {
	/*
		See https://en.m.wikipedia.org/wiki/Euclidean_distance#Squared_Euclidean_distance
	*/
	return (
		((x[0] - y[0]) ** 2) +
		((x[1] - y[1]) ** 2) +
		((x[2] - y[2]) ** 2)
	);
}

convert.rgb.keyword = function (rgb) {
	const reversed = reverseKeywords[rgb];
	if (reversed) {
		return reversed;
	}

	let currentClosestDistance = Infinity;
	let currentClosestKeyword;

	for (const keyword of Object.keys(cssKeywords)) {
		const value = cssKeywords[keyword];

		// Compute comparative distance
		const distance = comparativeDistance(rgb, value);

		// Check if its less, if so set as closest
		if (distance < currentClosestDistance) {
			currentClosestDistance = distance;
			currentClosestKeyword = keyword;
		}
	}

	return currentClosestKeyword;
};

convert.keyword.rgb = function (keyword) {
	return cssKeywords[keyword];
};

convert.rgb.xyz = function (rgb) {
	let r = rgb[0] / 255;
	let g = rgb[1] / 255;
	let b = rgb[2] / 255;

	// Assume sRGB
	r = r > 0.04045 ? (((r + 0.055) / 1.055) ** 2.4) : (r / 12.92);
	g = g > 0.04045 ? (((g + 0.055) / 1.055) ** 2.4) : (g / 12.92);
	b = b > 0.04045 ? (((b + 0.055) / 1.055) ** 2.4) : (b / 12.92);

	const x = (r * 0.4124) + (g * 0.3576) + (b * 0.1805);
	const y = (r * 0.2126) + (g * 0.7152) + (b * 0.0722);
	const z = (r * 0.0193) + (g * 0.1192) + (b * 0.9505);

	return [x * 100, y * 100, z * 100];
};

convert.rgb.lab = function (rgb) {
	const xyz = convert.rgb.xyz(rgb);
	let x = xyz[0];
	let y = xyz[1];
	let z = xyz[2];

	x /= 95.047;
	y /= 100;
	z /= 108.883;

	x = x > 0.008856 ? (x ** (1 / 3)) : (7.787 * x) + (16 / 116);
	y = y > 0.008856 ? (y ** (1 / 3)) : (7.787 * y) + (16 / 116);
	z = z > 0.008856 ? (z ** (1 / 3)) : (7.787 * z) + (16 / 116);

	const l = (116 * y) - 16;
	const a = 500 * (x - y);
	const b = 200 * (y - z);

	return [l, a, b];
};

convert.hsl.rgb = function (hsl) {
	const h = hsl[0] / 360;
	const s = hsl[1] / 100;
	const l = hsl[2] / 100;
	let t2;
	let t3;
	let val;

	if (s === 0) {
		val = l * 255;
		return [val, val, val];
	}

	if (l < 0.5) {
		t2 = l * (1 + s);
	} else {
		t2 = l + s - l * s;
	}

	const t1 = 2 * l - t2;

	const rgb = [0, 0, 0];
	for (let i = 0; i < 3; i++) {
		t3 = h + 1 / 3 * -(i - 1);
		if (t3 < 0) {
			t3++;
		}

		if (t3 > 1) {
			t3--;
		}

		if (6 * t3 < 1) {
			val = t1 + (t2 - t1) * 6 * t3;
		} else if (2 * t3 < 1) {
			val = t2;
		} else if (3 * t3 < 2) {
			val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
		} else {
			val = t1;
		}

		rgb[i] = val * 255;
	}

	return rgb;
};

convert.hsl.hsv = function (hsl) {
	const h = hsl[0];
	let s = hsl[1] / 100;
	let l = hsl[2] / 100;
	let smin = s;
	const lmin = Math.max(l, 0.01);

	l *= 2;
	s *= (l <= 1) ? l : 2 - l;
	smin *= lmin <= 1 ? lmin : 2 - lmin;
	const v = (l + s) / 2;
	const sv = l === 0 ? (2 * smin) / (lmin + smin) : (2 * s) / (l + s);

	return [h, sv * 100, v * 100];
};

convert.hsv.rgb = function (hsv) {
	const h = hsv[0] / 60;
	const s = hsv[1] / 100;
	let v = hsv[2] / 100;
	const hi = Math.floor(h) % 6;

	const f = h - Math.floor(h);
	const p = 255 * v * (1 - s);
	const q = 255 * v * (1 - (s * f));
	const t = 255 * v * (1 - (s * (1 - f)));
	v *= 255;

	switch (hi) {
		case 0:
			return [v, t, p];
		case 1:
			return [q, v, p];
		case 2:
			return [p, v, t];
		case 3:
			return [p, q, v];
		case 4:
			return [t, p, v];
		case 5:
			return [v, p, q];
	}
};

convert.hsv.hsl = function (hsv) {
	const h = hsv[0];
	const s = hsv[1] / 100;
	const v = hsv[2] / 100;
	const vmin = Math.max(v, 0.01);
	let sl;
	let l;

	l = (2 - s) * v;
	const lmin = (2 - s) * vmin;
	sl = s * vmin;
	sl /= (lmin <= 1) ? lmin : 2 - lmin;
	sl = sl || 0;
	l /= 2;

	return [h, sl * 100, l * 100];
};

// http://dev.w3.org/csswg/css-color/#hwb-to-rgb
convert.hwb.rgb = function (hwb) {
	const h = hwb[0] / 360;
	let wh = hwb[1] / 100;
	let bl = hwb[2] / 100;
	const ratio = wh + bl;
	let f;

	// Wh + bl cant be > 1
	if (ratio > 1) {
		wh /= ratio;
		bl /= ratio;
	}

	const i = Math.floor(6 * h);
	const v = 1 - bl;
	f = 6 * h - i;

	if ((i & 0x01) !== 0) {
		f = 1 - f;
	}

	const n = wh + f * (v - wh); // Linear interpolation

	let r;
	let g;
	let b;
	/* eslint-disable max-statements-per-line,no-multi-spaces */
	switch (i) {
		default:
		case 6:
		case 0: r = v;  g = n;  b = wh; break;
		case 1: r = n;  g = v;  b = wh; break;
		case 2: r = wh; g = v;  b = n; break;
		case 3: r = wh; g = n;  b = v; break;
		case 4: r = n;  g = wh; b = v; break;
		case 5: r = v;  g = wh; b = n; break;
	}
	/* eslint-enable max-statements-per-line,no-multi-spaces */

	return [r * 255, g * 255, b * 255];
};

convert.cmyk.rgb = function (cmyk) {
	const c = cmyk[0] / 100;
	const m = cmyk[1] / 100;
	const y = cmyk[2] / 100;
	const k = cmyk[3] / 100;

	const r = 1 - Math.min(1, c * (1 - k) + k);
	const g = 1 - Math.min(1, m * (1 - k) + k);
	const b = 1 - Math.min(1, y * (1 - k) + k);

	return [r * 255, g * 255, b * 255];
};

convert.xyz.rgb = function (xyz) {
	const x = xyz[0] / 100;
	const y = xyz[1] / 100;
	const z = xyz[2] / 100;
	let r;
	let g;
	let b;

	r = (x * 3.2406) + (y * -1.5372) + (z * -0.4986);
	g = (x * -0.9689) + (y * 1.8758) + (z * 0.0415);
	b = (x * 0.0557) + (y * -0.2040) + (z * 1.0570);

	// Assume sRGB
	r = r > 0.0031308
		? ((1.055 * (r ** (1.0 / 2.4))) - 0.055)
		: r * 12.92;

	g = g > 0.0031308
		? ((1.055 * (g ** (1.0 / 2.4))) - 0.055)
		: g * 12.92;

	b = b > 0.0031308
		? ((1.055 * (b ** (1.0 / 2.4))) - 0.055)
		: b * 12.92;

	r = Math.min(Math.max(0, r), 1);
	g = Math.min(Math.max(0, g), 1);
	b = Math.min(Math.max(0, b), 1);

	return [r * 255, g * 255, b * 255];
};

convert.xyz.lab = function (xyz) {
	let x = xyz[0];
	let y = xyz[1];
	let z = xyz[2];

	x /= 95.047;
	y /= 100;
	z /= 108.883;

	x = x > 0.008856 ? (x ** (1 / 3)) : (7.787 * x) + (16 / 116);
	y = y > 0.008856 ? (y ** (1 / 3)) : (7.787 * y) + (16 / 116);
	z = z > 0.008856 ? (z ** (1 / 3)) : (7.787 * z) + (16 / 116);

	const l = (116 * y) - 16;
	const a = 500 * (x - y);
	const b = 200 * (y - z);

	return [l, a, b];
};

convert.lab.xyz = function (lab) {
	const l = lab[0];
	const a = lab[1];
	const b = lab[2];
	let x;
	let y;
	let z;

	y = (l + 16) / 116;
	x = a / 500 + y;
	z = y - b / 200;

	const y2 = y ** 3;
	const x2 = x ** 3;
	const z2 = z ** 3;
	y = y2 > 0.008856 ? y2 : (y - 16 / 116) / 7.787;
	x = x2 > 0.008856 ? x2 : (x - 16 / 116) / 7.787;
	z = z2 > 0.008856 ? z2 : (z - 16 / 116) / 7.787;

	x *= 95.047;
	y *= 100;
	z *= 108.883;

	return [x, y, z];
};

convert.lab.lch = function (lab) {
	const l = lab[0];
	const a = lab[1];
	const b = lab[2];
	let h;

	const hr = Math.atan2(b, a);
	h = hr * 360 / 2 / Math.PI;

	if (h < 0) {
		h += 360;
	}

	const c = Math.sqrt(a * a + b * b);

	return [l, c, h];
};

convert.lch.lab = function (lch) {
	const l = lch[0];
	const c = lch[1];
	const h = lch[2];

	const hr = h / 360 * 2 * Math.PI;
	const a = c * Math.cos(hr);
	const b = c * Math.sin(hr);

	return [l, a, b];
};

convert.rgb.ansi16 = function (args, saturation = null) {
	const [r, g, b] = args;
	let value = saturation === null ? convert.rgb.hsv(args)[2] : saturation; // Hsv -> ansi16 optimization

	value = Math.round(value / 50);

	if (value === 0) {
		return 30;
	}

	let ansi = 30
		+ ((Math.round(b / 255) << 2)
		| (Math.round(g / 255) << 1)
		| Math.round(r / 255));

	if (value === 2) {
		ansi += 60;
	}

	return ansi;
};

convert.hsv.ansi16 = function (args) {
	// Optimization here; we already know the value and don't need to get
	// it converted for us.
	return convert.rgb.ansi16(convert.hsv.rgb(args), args[2]);
};

convert.rgb.ansi256 = function (args) {
	const r = args[0];
	const g = args[1];
	const b = args[2];

	// We use the extended greyscale palette here, with the exception of
	// black and white. normal palette only has 4 greyscale shades.
	if (r === g && g === b) {
		if (r < 8) {
			return 16;
		}

		if (r > 248) {
			return 231;
		}

		return Math.round(((r - 8) / 247) * 24) + 232;
	}

	const ansi = 16
		+ (36 * Math.round(r / 255 * 5))
		+ (6 * Math.round(g / 255 * 5))
		+ Math.round(b / 255 * 5);

	return ansi;
};

convert.ansi16.rgb = function (args) {
	let color = args % 10;

	// Handle greyscale
	if (color === 0 || color === 7) {
		if (args > 50) {
			color += 3.5;
		}

		color = color / 10.5 * 255;

		return [color, color, color];
	}

	const mult = (~~(args > 50) + 1) * 0.5;
	const r = ((color & 1) * mult) * 255;
	const g = (((color >> 1) & 1) * mult) * 255;
	const b = (((color >> 2) & 1) * mult) * 255;

	return [r, g, b];
};

convert.ansi256.rgb = function (args) {
	// Handle greyscale
	if (args >= 232) {
		const c = (args - 232) * 10 + 8;
		return [c, c, c];
	}

	args -= 16;

	let rem;
	const r = Math.floor(args / 36) / 5 * 255;
	const g = Math.floor((rem = args % 36) / 6) / 5 * 255;
	const b = (rem % 6) / 5 * 255;

	return [r, g, b];
};

convert.rgb.hex = function (args) {
	const integer = ((Math.round(args[0]) & 0xFF) << 16)
		+ ((Math.round(args[1]) & 0xFF) << 8)
		+ (Math.round(args[2]) & 0xFF);

	const string = integer.toString(16).toUpperCase();
	return '000000'.substring(string.length) + string;
};

convert.hex.rgb = function (args) {
	const match = args.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i);
	if (!match) {
		return [0, 0, 0];
	}

	let colorString = match[0];

	if (match[0].length === 3) {
		colorString = colorString.split('').map(char => {
			return char + char;
		}).join('');
	}

	const integer = parseInt(colorString, 16);
	const r = (integer >> 16) & 0xFF;
	const g = (integer >> 8) & 0xFF;
	const b = integer & 0xFF;

	return [r, g, b];
};

convert.rgb.hcg = function (rgb) {
	const r = rgb[0] / 255;
	const g = rgb[1] / 255;
	const b = rgb[2] / 255;
	const max = Math.max(Math.max(r, g), b);
	const min = Math.min(Math.min(r, g), b);
	const chroma = (max - min);
	let grayscale;
	let hue;

	if (chroma < 1) {
		grayscale = min / (1 - chroma);
	} else {
		grayscale = 0;
	}

	if (chroma <= 0) {
		hue = 0;
	} else
	if (max === r) {
		hue = ((g - b) / chroma) % 6;
	} else
	if (max === g) {
		hue = 2 + (b - r) / chroma;
	} else {
		hue = 4 + (r - g) / chroma;
	}

	hue /= 6;
	hue %= 1;

	return [hue * 360, chroma * 100, grayscale * 100];
};

convert.hsl.hcg = function (hsl) {
	const s = hsl[1] / 100;
	const l = hsl[2] / 100;

	const c = l < 0.5 ? (2.0 * s * l) : (2.0 * s * (1.0 - l));

	let f = 0;
	if (c < 1.0) {
		f = (l - 0.5 * c) / (1.0 - c);
	}

	return [hsl[0], c * 100, f * 100];
};

convert.hsv.hcg = function (hsv) {
	const s = hsv[1] / 100;
	const v = hsv[2] / 100;

	const c = s * v;
	let f = 0;

	if (c < 1.0) {
		f = (v - c) / (1 - c);
	}

	return [hsv[0], c * 100, f * 100];
};

convert.hcg.rgb = function (hcg) {
	const h = hcg[0] / 360;
	const c = hcg[1] / 100;
	const g = hcg[2] / 100;

	if (c === 0.0) {
		return [g * 255, g * 255, g * 255];
	}

	const pure = [0, 0, 0];
	const hi = (h % 1) * 6;
	const v = hi % 1;
	const w = 1 - v;
	let mg = 0;

	/* eslint-disable max-statements-per-line */
	switch (Math.floor(hi)) {
		case 0:
			pure[0] = 1; pure[1] = v; pure[2] = 0; break;
		case 1:
			pure[0] = w; pure[1] = 1; pure[2] = 0; break;
		case 2:
			pure[0] = 0; pure[1] = 1; pure[2] = v; break;
		case 3:
			pure[0] = 0; pure[1] = w; pure[2] = 1; break;
		case 4:
			pure[0] = v; pure[1] = 0; pure[2] = 1; break;
		default:
			pure[0] = 1; pure[1] = 0; pure[2] = w;
	}
	/* eslint-enable max-statements-per-line */

	mg = (1.0 - c) * g;

	return [
		(c * pure[0] + mg) * 255,
		(c * pure[1] + mg) * 255,
		(c * pure[2] + mg) * 255
	];
};

convert.hcg.hsv = function (hcg) {
	const c = hcg[1] / 100;
	const g = hcg[2] / 100;

	const v = c + g * (1.0 - c);
	let f = 0;

	if (v > 0.0) {
		f = c / v;
	}

	return [hcg[0], f * 100, v * 100];
};

convert.hcg.hsl = function (hcg) {
	const c = hcg[1] / 100;
	const g = hcg[2] / 100;

	const l = g * (1.0 - c) + 0.5 * c;
	let s = 0;

	if (l > 0.0 && l < 0.5) {
		s = c / (2 * l);
	} else
	if (l >= 0.5 && l < 1.0) {
		s = c / (2 * (1 - l));
	}

	return [hcg[0], s * 100, l * 100];
};

convert.hcg.hwb = function (hcg) {
	const c = hcg[1] / 100;
	const g = hcg[2] / 100;
	const v = c + g * (1.0 - c);
	return [hcg[0], (v - c) * 100, (1 - v) * 100];
};

convert.hwb.hcg = function (hwb) {
	const w = hwb[1] / 100;
	const b = hwb[2] / 100;
	const v = 1 - b;
	const c = v - w;
	let g = 0;

	if (c < 1) {
		g = (v - c) / (1 - c);
	}

	return [hwb[0], c * 100, g * 100];
};

convert.apple.rgb = function (apple) {
	return [(apple[0] / 65535) * 255, (apple[1] / 65535) * 255, (apple[2] / 65535) * 255];
};

convert.rgb.apple = function (rgb) {
	return [(rgb[0] / 255) * 65535, (rgb[1] / 255) * 65535, (rgb[2] / 255) * 65535];
};

convert.gray.rgb = function (args) {
	return [args[0] / 100 * 255, args[0] / 100 * 255, args[0] / 100 * 255];
};

convert.gray.hsl = function (args) {
	return [0, 0, args[0]];
};

convert.gray.hsv = convert.gray.hsl;

convert.gray.hwb = function (gray) {
	return [0, 100, gray[0]];
};

convert.gray.cmyk = function (gray) {
	return [0, 0, 0, gray[0]];
};

convert.gray.lab = function (gray) {
	return [gray[0], 0, 0];
};

convert.gray.hex = function (gray) {
	const val = Math.round(gray[0] / 100 * 255) & 0xFF;
	const integer = (val << 16) + (val << 8) + val;

	const string = integer.toString(16).toUpperCase();
	return '000000'.substring(string.length) + string;
};

convert.rgb.gray = function (rgb) {
	const val = (rgb[0] + rgb[1] + rgb[2]) / 3;
	return [val / 255 * 100];
};


/***/ }),

/***/ 931:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const conversions = __nccwpck_require__(391);
const route = __nccwpck_require__(880);

const convert = {};

const models = Object.keys(conversions);

function wrapRaw(fn) {
	const wrappedFn = function (...args) {
		const arg0 = args[0];
		if (arg0 === undefined || arg0 === null) {
			return arg0;
		}

		if (arg0.length > 1) {
			args = arg0;
		}

		return fn(args);
	};

	// Preserve .conversion property if there is one
	if ('conversion' in fn) {
		wrappedFn.conversion = fn.conversion;
	}

	return wrappedFn;
}

function wrapRounded(fn) {
	const wrappedFn = function (...args) {
		const arg0 = args[0];

		if (arg0 === undefined || arg0 === null) {
			return arg0;
		}

		if (arg0.length > 1) {
			args = arg0;
		}

		const result = fn(args);

		// We're assuming the result is an array here.
		// see notice in conversions.js; don't use box types
		// in conversion functions.
		if (typeof result === 'object') {
			for (let len = result.length, i = 0; i < len; i++) {
				result[i] = Math.round(result[i]);
			}
		}

		return result;
	};

	// Preserve .conversion property if there is one
	if ('conversion' in fn) {
		wrappedFn.conversion = fn.conversion;
	}

	return wrappedFn;
}

models.forEach(fromModel => {
	convert[fromModel] = {};

	Object.defineProperty(convert[fromModel], 'channels', {value: conversions[fromModel].channels});
	Object.defineProperty(convert[fromModel], 'labels', {value: conversions[fromModel].labels});

	const routes = route(fromModel);
	const routeModels = Object.keys(routes);

	routeModels.forEach(toModel => {
		const fn = routes[toModel];

		convert[fromModel][toModel] = wrapRounded(fn);
		convert[fromModel][toModel].raw = wrapRaw(fn);
	});
});

module.exports = convert;


/***/ }),

/***/ 880:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const conversions = __nccwpck_require__(391);

/*
	This function routes a model to all other models.

	all functions that are routed have a property `.conversion` attached
	to the returned synthetic function. This property is an array
	of strings, each with the steps in between the 'from' and 'to'
	color models (inclusive).

	conversions that are not possible simply are not included.
*/

function buildGraph() {
	const graph = {};
	// https://jsperf.com/object-keys-vs-for-in-with-closure/3
	const models = Object.keys(conversions);

	for (let len = models.length, i = 0; i < len; i++) {
		graph[models[i]] = {
			// http://jsperf.com/1-vs-infinity
			// micro-opt, but this is simple.
			distance: -1,
			parent: null
		};
	}

	return graph;
}

// https://en.wikipedia.org/wiki/Breadth-first_search
function deriveBFS(fromModel) {
	const graph = buildGraph();
	const queue = [fromModel]; // Unshift -> queue -> pop

	graph[fromModel].distance = 0;

	while (queue.length) {
		const current = queue.pop();
		const adjacents = Object.keys(conversions[current]);

		for (let len = adjacents.length, i = 0; i < len; i++) {
			const adjacent = adjacents[i];
			const node = graph[adjacent];

			if (node.distance === -1) {
				node.distance = graph[current].distance + 1;
				node.parent = current;
				queue.unshift(adjacent);
			}
		}
	}

	return graph;
}

function link(from, to) {
	return function (args) {
		return to(from(args));
	};
}

function wrapConversion(toModel, graph) {
	const path = [graph[toModel].parent, toModel];
	let fn = conversions[graph[toModel].parent][toModel];

	let cur = graph[toModel].parent;
	while (graph[cur].parent) {
		path.unshift(graph[cur].parent);
		fn = link(conversions[graph[cur].parent][cur], fn);
		cur = graph[cur].parent;
	}

	fn.conversion = path;
	return fn;
}

module.exports = function (fromModel) {
	const graph = deriveBFS(fromModel);
	const conversion = {};

	const models = Object.keys(graph);
	for (let len = models.length, i = 0; i < len; i++) {
		const toModel = models[i];
		const node = graph[toModel];

		if (node.parent === null) {
			// No possible conversion, or this node is the source model.
			continue;
		}

		conversion[toModel] = wrapConversion(toModel, graph);
	}

	return conversion;
};



/***/ }),

/***/ 510:
/***/ ((module) => {

"use strict";


module.exports = {
	"aliceblue": [240, 248, 255],
	"antiquewhite": [250, 235, 215],
	"aqua": [0, 255, 255],
	"aquamarine": [127, 255, 212],
	"azure": [240, 255, 255],
	"beige": [245, 245, 220],
	"bisque": [255, 228, 196],
	"black": [0, 0, 0],
	"blanchedalmond": [255, 235, 205],
	"blue": [0, 0, 255],
	"blueviolet": [138, 43, 226],
	"brown": [165, 42, 42],
	"burlywood": [222, 184, 135],
	"cadetblue": [95, 158, 160],
	"chartreuse": [127, 255, 0],
	"chocolate": [210, 105, 30],
	"coral": [255, 127, 80],
	"cornflowerblue": [100, 149, 237],
	"cornsilk": [255, 248, 220],
	"crimson": [220, 20, 60],
	"cyan": [0, 255, 255],
	"darkblue": [0, 0, 139],
	"darkcyan": [0, 139, 139],
	"darkgoldenrod": [184, 134, 11],
	"darkgray": [169, 169, 169],
	"darkgreen": [0, 100, 0],
	"darkgrey": [169, 169, 169],
	"darkkhaki": [189, 183, 107],
	"darkmagenta": [139, 0, 139],
	"darkolivegreen": [85, 107, 47],
	"darkorange": [255, 140, 0],
	"darkorchid": [153, 50, 204],
	"darkred": [139, 0, 0],
	"darksalmon": [233, 150, 122],
	"darkseagreen": [143, 188, 143],
	"darkslateblue": [72, 61, 139],
	"darkslategray": [47, 79, 79],
	"darkslategrey": [47, 79, 79],
	"darkturquoise": [0, 206, 209],
	"darkviolet": [148, 0, 211],
	"deeppink": [255, 20, 147],
	"deepskyblue": [0, 191, 255],
	"dimgray": [105, 105, 105],
	"dimgrey": [105, 105, 105],
	"dodgerblue": [30, 144, 255],
	"firebrick": [178, 34, 34],
	"floralwhite": [255, 250, 240],
	"forestgreen": [34, 139, 34],
	"fuchsia": [255, 0, 255],
	"gainsboro": [220, 220, 220],
	"ghostwhite": [248, 248, 255],
	"gold": [255, 215, 0],
	"goldenrod": [218, 165, 32],
	"gray": [128, 128, 128],
	"green": [0, 128, 0],
	"greenyellow": [173, 255, 47],
	"grey": [128, 128, 128],
	"honeydew": [240, 255, 240],
	"hotpink": [255, 105, 180],
	"indianred": [205, 92, 92],
	"indigo": [75, 0, 130],
	"ivory": [255, 255, 240],
	"khaki": [240, 230, 140],
	"lavender": [230, 230, 250],
	"lavenderblush": [255, 240, 245],
	"lawngreen": [124, 252, 0],
	"lemonchiffon": [255, 250, 205],
	"lightblue": [173, 216, 230],
	"lightcoral": [240, 128, 128],
	"lightcyan": [224, 255, 255],
	"lightgoldenrodyellow": [250, 250, 210],
	"lightgray": [211, 211, 211],
	"lightgreen": [144, 238, 144],
	"lightgrey": [211, 211, 211],
	"lightpink": [255, 182, 193],
	"lightsalmon": [255, 160, 122],
	"lightseagreen": [32, 178, 170],
	"lightskyblue": [135, 206, 250],
	"lightslategray": [119, 136, 153],
	"lightslategrey": [119, 136, 153],
	"lightsteelblue": [176, 196, 222],
	"lightyellow": [255, 255, 224],
	"lime": [0, 255, 0],
	"limegreen": [50, 205, 50],
	"linen": [250, 240, 230],
	"magenta": [255, 0, 255],
	"maroon": [128, 0, 0],
	"mediumaquamarine": [102, 205, 170],
	"mediumblue": [0, 0, 205],
	"mediumorchid": [186, 85, 211],
	"mediumpurple": [147, 112, 219],
	"mediumseagreen": [60, 179, 113],
	"mediumslateblue": [123, 104, 238],
	"mediumspringgreen": [0, 250, 154],
	"mediumturquoise": [72, 209, 204],
	"mediumvioletred": [199, 21, 133],
	"midnightblue": [25, 25, 112],
	"mintcream": [245, 255, 250],
	"mistyrose": [255, 228, 225],
	"moccasin": [255, 228, 181],
	"navajowhite": [255, 222, 173],
	"navy": [0, 0, 128],
	"oldlace": [253, 245, 230],
	"olive": [128, 128, 0],
	"olivedrab": [107, 142, 35],
	"orange": [255, 165, 0],
	"orangered": [255, 69, 0],
	"orchid": [218, 112, 214],
	"palegoldenrod": [238, 232, 170],
	"palegreen": [152, 251, 152],
	"paleturquoise": [175, 238, 238],
	"palevioletred": [219, 112, 147],
	"papayawhip": [255, 239, 213],
	"peachpuff": [255, 218, 185],
	"peru": [205, 133, 63],
	"pink": [255, 192, 203],
	"plum": [221, 160, 221],
	"powderblue": [176, 224, 230],
	"purple": [128, 0, 128],
	"rebeccapurple": [102, 51, 153],
	"red": [255, 0, 0],
	"rosybrown": [188, 143, 143],
	"royalblue": [65, 105, 225],
	"saddlebrown": [139, 69, 19],
	"salmon": [250, 128, 114],
	"sandybrown": [244, 164, 96],
	"seagreen": [46, 139, 87],
	"seashell": [255, 245, 238],
	"sienna": [160, 82, 45],
	"silver": [192, 192, 192],
	"skyblue": [135, 206, 235],
	"slateblue": [106, 90, 205],
	"slategray": [112, 128, 144],
	"slategrey": [112, 128, 144],
	"snow": [255, 250, 250],
	"springgreen": [0, 255, 127],
	"steelblue": [70, 130, 180],
	"tan": [210, 180, 140],
	"teal": [0, 128, 128],
	"thistle": [216, 191, 216],
	"tomato": [255, 99, 71],
	"turquoise": [64, 224, 208],
	"violet": [238, 130, 238],
	"wheat": [245, 222, 179],
	"white": [255, 255, 255],
	"whitesmoke": [245, 245, 245],
	"yellow": [255, 255, 0],
	"yellowgreen": [154, 205, 50]
};


/***/ }),

/***/ 69:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

/* MIT license */
var colorNames = __nccwpck_require__(510);
var swizzle = __nccwpck_require__(679);
var hasOwnProperty = Object.hasOwnProperty;

var reverseNames = Object.create(null);

// create a list of reverse color names
for (var name in colorNames) {
	if (hasOwnProperty.call(colorNames, name)) {
		reverseNames[colorNames[name]] = name;
	}
}

var cs = module.exports = {
	to: {},
	get: {}
};

cs.get = function (string) {
	var prefix = string.substring(0, 3).toLowerCase();
	var val;
	var model;
	switch (prefix) {
		case 'hsl':
			val = cs.get.hsl(string);
			model = 'hsl';
			break;
		case 'hwb':
			val = cs.get.hwb(string);
			model = 'hwb';
			break;
		default:
			val = cs.get.rgb(string);
			model = 'rgb';
			break;
	}

	if (!val) {
		return null;
	}

	return {model: model, value: val};
};

cs.get.rgb = function (string) {
	if (!string) {
		return null;
	}

	var abbr = /^#([a-f0-9]{3,4})$/i;
	var hex = /^#([a-f0-9]{6})([a-f0-9]{2})?$/i;
	var rgba = /^rgba?\(\s*([+-]?\d+)(?=[\s,])\s*(?:,\s*)?([+-]?\d+)(?=[\s,])\s*(?:,\s*)?([+-]?\d+)\s*(?:[,|\/]\s*([+-]?[\d\.]+)(%?)\s*)?\)$/;
	var per = /^rgba?\(\s*([+-]?[\d\.]+)\%\s*,?\s*([+-]?[\d\.]+)\%\s*,?\s*([+-]?[\d\.]+)\%\s*(?:[,|\/]\s*([+-]?[\d\.]+)(%?)\s*)?\)$/;
	var keyword = /^(\w+)$/;

	var rgb = [0, 0, 0, 1];
	var match;
	var i;
	var hexAlpha;

	if (match = string.match(hex)) {
		hexAlpha = match[2];
		match = match[1];

		for (i = 0; i < 3; i++) {
			// https://jsperf.com/slice-vs-substr-vs-substring-methods-long-string/19
			var i2 = i * 2;
			rgb[i] = parseInt(match.slice(i2, i2 + 2), 16);
		}

		if (hexAlpha) {
			rgb[3] = parseInt(hexAlpha, 16) / 255;
		}
	} else if (match = string.match(abbr)) {
		match = match[1];
		hexAlpha = match[3];

		for (i = 0; i < 3; i++) {
			rgb[i] = parseInt(match[i] + match[i], 16);
		}

		if (hexAlpha) {
			rgb[3] = parseInt(hexAlpha + hexAlpha, 16) / 255;
		}
	} else if (match = string.match(rgba)) {
		for (i = 0; i < 3; i++) {
			rgb[i] = parseInt(match[i + 1], 0);
		}

		if (match[4]) {
			if (match[5]) {
				rgb[3] = parseFloat(match[4]) * 0.01;
			} else {
				rgb[3] = parseFloat(match[4]);
			}
		}
	} else if (match = string.match(per)) {
		for (i = 0; i < 3; i++) {
			rgb[i] = Math.round(parseFloat(match[i + 1]) * 2.55);
		}

		if (match[4]) {
			if (match[5]) {
				rgb[3] = parseFloat(match[4]) * 0.01;
			} else {
				rgb[3] = parseFloat(match[4]);
			}
		}
	} else if (match = string.match(keyword)) {
		if (match[1] === 'transparent') {
			return [0, 0, 0, 0];
		}

		if (!hasOwnProperty.call(colorNames, match[1])) {
			return null;
		}

		rgb = colorNames[match[1]];
		rgb[3] = 1;

		return rgb;
	} else {
		return null;
	}

	for (i = 0; i < 3; i++) {
		rgb[i] = clamp(rgb[i], 0, 255);
	}
	rgb[3] = clamp(rgb[3], 0, 1);

	return rgb;
};

cs.get.hsl = function (string) {
	if (!string) {
		return null;
	}

	var hsl = /^hsla?\(\s*([+-]?(?:\d{0,3}\.)?\d+)(?:deg)?\s*,?\s*([+-]?[\d\.]+)%\s*,?\s*([+-]?[\d\.]+)%\s*(?:[,|\/]\s*([+-]?(?=\.\d|\d)(?:0|[1-9]\d*)?(?:\.\d*)?(?:[eE][+-]?\d+)?)\s*)?\)$/;
	var match = string.match(hsl);

	if (match) {
		var alpha = parseFloat(match[4]);
		var h = ((parseFloat(match[1]) % 360) + 360) % 360;
		var s = clamp(parseFloat(match[2]), 0, 100);
		var l = clamp(parseFloat(match[3]), 0, 100);
		var a = clamp(isNaN(alpha) ? 1 : alpha, 0, 1);

		return [h, s, l, a];
	}

	return null;
};

cs.get.hwb = function (string) {
	if (!string) {
		return null;
	}

	var hwb = /^hwb\(\s*([+-]?\d{0,3}(?:\.\d+)?)(?:deg)?\s*,\s*([+-]?[\d\.]+)%\s*,\s*([+-]?[\d\.]+)%\s*(?:,\s*([+-]?(?=\.\d|\d)(?:0|[1-9]\d*)?(?:\.\d*)?(?:[eE][+-]?\d+)?)\s*)?\)$/;
	var match = string.match(hwb);

	if (match) {
		var alpha = parseFloat(match[4]);
		var h = ((parseFloat(match[1]) % 360) + 360) % 360;
		var w = clamp(parseFloat(match[2]), 0, 100);
		var b = clamp(parseFloat(match[3]), 0, 100);
		var a = clamp(isNaN(alpha) ? 1 : alpha, 0, 1);
		return [h, w, b, a];
	}

	return null;
};

cs.to.hex = function () {
	var rgba = swizzle(arguments);

	return (
		'#' +
		hexDouble(rgba[0]) +
		hexDouble(rgba[1]) +
		hexDouble(rgba[2]) +
		(rgba[3] < 1
			? (hexDouble(Math.round(rgba[3] * 255)))
			: '')
	);
};

cs.to.rgb = function () {
	var rgba = swizzle(arguments);

	return rgba.length < 4 || rgba[3] === 1
		? 'rgb(' + Math.round(rgba[0]) + ', ' + Math.round(rgba[1]) + ', ' + Math.round(rgba[2]) + ')'
		: 'rgba(' + Math.round(rgba[0]) + ', ' + Math.round(rgba[1]) + ', ' + Math.round(rgba[2]) + ', ' + rgba[3] + ')';
};

cs.to.rgb.percent = function () {
	var rgba = swizzle(arguments);

	var r = Math.round(rgba[0] / 255 * 100);
	var g = Math.round(rgba[1] / 255 * 100);
	var b = Math.round(rgba[2] / 255 * 100);

	return rgba.length < 4 || rgba[3] === 1
		? 'rgb(' + r + '%, ' + g + '%, ' + b + '%)'
		: 'rgba(' + r + '%, ' + g + '%, ' + b + '%, ' + rgba[3] + ')';
};

cs.to.hsl = function () {
	var hsla = swizzle(arguments);
	return hsla.length < 4 || hsla[3] === 1
		? 'hsl(' + hsla[0] + ', ' + hsla[1] + '%, ' + hsla[2] + '%)'
		: 'hsla(' + hsla[0] + ', ' + hsla[1] + '%, ' + hsla[2] + '%, ' + hsla[3] + ')';
};

// hwb is a bit different than rgb(a) & hsl(a) since there is no alpha specific syntax
// (hwb have alpha optional & 1 is default value)
cs.to.hwb = function () {
	var hwba = swizzle(arguments);

	var a = '';
	if (hwba.length >= 4 && hwba[3] !== 1) {
		a = ', ' + hwba[3];
	}

	return 'hwb(' + hwba[0] + ', ' + hwba[1] + '%, ' + hwba[2] + '%' + a + ')';
};

cs.to.keyword = function (rgb) {
	return reverseNames[rgb.slice(0, 3)];
};

// helpers
function clamp(num, min, max) {
	return Math.min(Math.max(min, num), max);
}

function hexDouble(num) {
	var str = Math.round(num).toString(16).toUpperCase();
	return (str.length < 2) ? '0' + str : str;
}


/***/ }),

/***/ 177:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const colorString = __nccwpck_require__(69);
const convert = __nccwpck_require__(931);

const skippedModels = [
	// To be honest, I don't really feel like keyword belongs in color convert, but eh.
	'keyword',

	// Gray conflicts with some method names, and has its own method defined.
	'gray',

	// Shouldn't really be in color-convert either...
	'hex',
];

const hashedModelKeys = {};
for (const model of Object.keys(convert)) {
	hashedModelKeys[[...convert[model].labels].sort().join('')] = model;
}

const limiters = {};

function Color(object, model) {
	if (!(this instanceof Color)) {
		return new Color(object, model);
	}

	if (model && model in skippedModels) {
		model = null;
	}

	if (model && !(model in convert)) {
		throw new Error('Unknown model: ' + model);
	}

	let i;
	let channels;

	if (object == null) { // eslint-disable-line no-eq-null,eqeqeq
		this.model = 'rgb';
		this.color = [0, 0, 0];
		this.valpha = 1;
	} else if (object instanceof Color) {
		this.model = object.model;
		this.color = [...object.color];
		this.valpha = object.valpha;
	} else if (typeof object === 'string') {
		const result = colorString.get(object);
		if (result === null) {
			throw new Error('Unable to parse color from string: ' + object);
		}

		this.model = result.model;
		channels = convert[this.model].channels;
		this.color = result.value.slice(0, channels);
		this.valpha = typeof result.value[channels] === 'number' ? result.value[channels] : 1;
	} else if (object.length > 0) {
		this.model = model || 'rgb';
		channels = convert[this.model].channels;
		const newArray = Array.prototype.slice.call(object, 0, channels);
		this.color = zeroArray(newArray, channels);
		this.valpha = typeof object[channels] === 'number' ? object[channels] : 1;
	} else if (typeof object === 'number') {
		// This is always RGB - can be converted later on.
		this.model = 'rgb';
		this.color = [
			(object >> 16) & 0xFF,
			(object >> 8) & 0xFF,
			object & 0xFF,
		];
		this.valpha = 1;
	} else {
		this.valpha = 1;

		const keys = Object.keys(object);
		if ('alpha' in object) {
			keys.splice(keys.indexOf('alpha'), 1);
			this.valpha = typeof object.alpha === 'number' ? object.alpha : 0;
		}

		const hashedKeys = keys.sort().join('');
		if (!(hashedKeys in hashedModelKeys)) {
			throw new Error('Unable to parse color from object: ' + JSON.stringify(object));
		}

		this.model = hashedModelKeys[hashedKeys];

		const {labels} = convert[this.model];
		const color = [];
		for (i = 0; i < labels.length; i++) {
			color.push(object[labels[i]]);
		}

		this.color = zeroArray(color);
	}

	// Perform limitations (clamping, etc.)
	if (limiters[this.model]) {
		channels = convert[this.model].channels;
		for (i = 0; i < channels; i++) {
			const limit = limiters[this.model][i];
			if (limit) {
				this.color[i] = limit(this.color[i]);
			}
		}
	}

	this.valpha = Math.max(0, Math.min(1, this.valpha));

	if (Object.freeze) {
		Object.freeze(this);
	}
}

Color.prototype = {
	toString() {
		return this.string();
	},

	toJSON() {
		return this[this.model]();
	},

	string(places) {
		let self = this.model in colorString.to ? this : this.rgb();
		self = self.round(typeof places === 'number' ? places : 1);
		const args = self.valpha === 1 ? self.color : [...self.color, this.valpha];
		return colorString.to[self.model](args);
	},

	percentString(places) {
		const self = this.rgb().round(typeof places === 'number' ? places : 1);
		const args = self.valpha === 1 ? self.color : [...self.color, this.valpha];
		return colorString.to.rgb.percent(args);
	},

	array() {
		return this.valpha === 1 ? [...this.color] : [...this.color, this.valpha];
	},

	object() {
		const result = {};
		const {channels} = convert[this.model];
		const {labels} = convert[this.model];

		for (let i = 0; i < channels; i++) {
			result[labels[i]] = this.color[i];
		}

		if (this.valpha !== 1) {
			result.alpha = this.valpha;
		}

		return result;
	},

	unitArray() {
		const rgb = this.rgb().color;
		rgb[0] /= 255;
		rgb[1] /= 255;
		rgb[2] /= 255;

		if (this.valpha !== 1) {
			rgb.push(this.valpha);
		}

		return rgb;
	},

	unitObject() {
		const rgb = this.rgb().object();
		rgb.r /= 255;
		rgb.g /= 255;
		rgb.b /= 255;

		if (this.valpha !== 1) {
			rgb.alpha = this.valpha;
		}

		return rgb;
	},

	round(places) {
		places = Math.max(places || 0, 0);
		return new Color([...this.color.map(roundToPlace(places)), this.valpha], this.model);
	},

	alpha(value) {
		if (value !== undefined) {
			return new Color([...this.color, Math.max(0, Math.min(1, value))], this.model);
		}

		return this.valpha;
	},

	// Rgb
	red: getset('rgb', 0, maxfn(255)),
	green: getset('rgb', 1, maxfn(255)),
	blue: getset('rgb', 2, maxfn(255)),

	hue: getset(['hsl', 'hsv', 'hsl', 'hwb', 'hcg'], 0, value => ((value % 360) + 360) % 360),

	saturationl: getset('hsl', 1, maxfn(100)),
	lightness: getset('hsl', 2, maxfn(100)),

	saturationv: getset('hsv', 1, maxfn(100)),
	value: getset('hsv', 2, maxfn(100)),

	chroma: getset('hcg', 1, maxfn(100)),
	gray: getset('hcg', 2, maxfn(100)),

	white: getset('hwb', 1, maxfn(100)),
	wblack: getset('hwb', 2, maxfn(100)),

	cyan: getset('cmyk', 0, maxfn(100)),
	magenta: getset('cmyk', 1, maxfn(100)),
	yellow: getset('cmyk', 2, maxfn(100)),
	black: getset('cmyk', 3, maxfn(100)),

	x: getset('xyz', 0, maxfn(95.047)),
	y: getset('xyz', 1, maxfn(100)),
	z: getset('xyz', 2, maxfn(108.833)),

	l: getset('lab', 0, maxfn(100)),
	a: getset('lab', 1),
	b: getset('lab', 2),

	keyword(value) {
		if (value !== undefined) {
			return new Color(value);
		}

		return convert[this.model].keyword(this.color);
	},

	hex(value) {
		if (value !== undefined) {
			return new Color(value);
		}

		return colorString.to.hex(this.rgb().round().color);
	},

	hexa(value) {
		if (value !== undefined) {
			return new Color(value);
		}

		const rgbArray = this.rgb().round().color;

		let alphaHex = Math.round(this.valpha * 255).toString(16).toUpperCase();
		if (alphaHex.length === 1) {
			alphaHex = '0' + alphaHex;
		}

		return colorString.to.hex(rgbArray) + alphaHex;
	},

	rgbNumber() {
		const rgb = this.rgb().color;
		return ((rgb[0] & 0xFF) << 16) | ((rgb[1] & 0xFF) << 8) | (rgb[2] & 0xFF);
	},

	luminosity() {
		// http://www.w3.org/TR/WCAG20/#relativeluminancedef
		const rgb = this.rgb().color;

		const lum = [];
		for (const [i, element] of rgb.entries()) {
			const chan = element / 255;
			lum[i] = (chan <= 0.04045) ? chan / 12.92 : ((chan + 0.055) / 1.055) ** 2.4;
		}

		return 0.2126 * lum[0] + 0.7152 * lum[1] + 0.0722 * lum[2];
	},

	contrast(color2) {
		// http://www.w3.org/TR/WCAG20/#contrast-ratiodef
		const lum1 = this.luminosity();
		const lum2 = color2.luminosity();

		if (lum1 > lum2) {
			return (lum1 + 0.05) / (lum2 + 0.05);
		}

		return (lum2 + 0.05) / (lum1 + 0.05);
	},

	level(color2) {
		// https://www.w3.org/TR/WCAG/#contrast-enhanced
		const contrastRatio = this.contrast(color2);
		if (contrastRatio >= 7) {
			return 'AAA';
		}

		return (contrastRatio >= 4.5) ? 'AA' : '';
	},

	isDark() {
		// YIQ equation from http://24ways.org/2010/calculating-color-contrast
		const rgb = this.rgb().color;
		const yiq = (rgb[0] * 2126 + rgb[1] * 7152 + rgb[2] * 722) / 10000;
		return yiq < 128;
	},

	isLight() {
		return !this.isDark();
	},

	negate() {
		const rgb = this.rgb();
		for (let i = 0; i < 3; i++) {
			rgb.color[i] = 255 - rgb.color[i];
		}

		return rgb;
	},

	lighten(ratio) {
		const hsl = this.hsl();
		hsl.color[2] += hsl.color[2] * ratio;
		return hsl;
	},

	darken(ratio) {
		const hsl = this.hsl();
		hsl.color[2] -= hsl.color[2] * ratio;
		return hsl;
	},

	saturate(ratio) {
		const hsl = this.hsl();
		hsl.color[1] += hsl.color[1] * ratio;
		return hsl;
	},

	desaturate(ratio) {
		const hsl = this.hsl();
		hsl.color[1] -= hsl.color[1] * ratio;
		return hsl;
	},

	whiten(ratio) {
		const hwb = this.hwb();
		hwb.color[1] += hwb.color[1] * ratio;
		return hwb;
	},

	blacken(ratio) {
		const hwb = this.hwb();
		hwb.color[2] += hwb.color[2] * ratio;
		return hwb;
	},

	grayscale() {
		// http://en.wikipedia.org/wiki/Grayscale#Converting_color_to_grayscale
		const rgb = this.rgb().color;
		const value = rgb[0] * 0.3 + rgb[1] * 0.59 + rgb[2] * 0.11;
		return Color.rgb(value, value, value);
	},

	fade(ratio) {
		return this.alpha(this.valpha - (this.valpha * ratio));
	},

	opaquer(ratio) {
		return this.alpha(this.valpha + (this.valpha * ratio));
	},

	rotate(degrees) {
		const hsl = this.hsl();
		let hue = hsl.color[0];
		hue = (hue + degrees) % 360;
		hue = hue < 0 ? 360 + hue : hue;
		hsl.color[0] = hue;
		return hsl;
	},

	mix(mixinColor, weight) {
		// Ported from sass implementation in C
		// https://github.com/sass/libsass/blob/0e6b4a2850092356aa3ece07c6b249f0221caced/functions.cpp#L209
		if (!mixinColor || !mixinColor.rgb) {
			throw new Error('Argument to "mix" was not a Color instance, but rather an instance of ' + typeof mixinColor);
		}

		const color1 = mixinColor.rgb();
		const color2 = this.rgb();
		const p = weight === undefined ? 0.5 : weight;

		const w = 2 * p - 1;
		const a = color1.alpha() - color2.alpha();

		const w1 = (((w * a === -1) ? w : (w + a) / (1 + w * a)) + 1) / 2;
		const w2 = 1 - w1;

		return Color.rgb(
			w1 * color1.red() + w2 * color2.red(),
			w1 * color1.green() + w2 * color2.green(),
			w1 * color1.blue() + w2 * color2.blue(),
			color1.alpha() * p + color2.alpha() * (1 - p));
	},
};

// Model conversion methods and static constructors
for (const model of Object.keys(convert)) {
	if (skippedModels.includes(model)) {
		continue;
	}

	const {channels} = convert[model];

	// Conversion methods
	Color.prototype[model] = function (...args) {
		if (this.model === model) {
			return new Color(this);
		}

		if (args.length > 0) {
			return new Color(args, model);
		}

		return new Color([...assertArray(convert[this.model][model].raw(this.color)), this.valpha], model);
	};

	// 'static' construction methods
	Color[model] = function (...args) {
		let color = args[0];
		if (typeof color === 'number') {
			color = zeroArray(args, channels);
		}

		return new Color(color, model);
	};
}

function roundTo(number, places) {
	return Number(number.toFixed(places));
}

function roundToPlace(places) {
	return function (number) {
		return roundTo(number, places);
	};
}

function getset(model, channel, modifier) {
	model = Array.isArray(model) ? model : [model];

	for (const m of model) {
		(limiters[m] || (limiters[m] = []))[channel] = modifier;
	}

	model = model[0];

	return function (value) {
		let result;

		if (value !== undefined) {
			if (modifier) {
				value = modifier(value);
			}

			result = this[model]();
			result.color[channel] = value;
			return result;
		}

		result = this[model]().color[channel];
		if (modifier) {
			result = modifier(result);
		}

		return result;
	};
}

function maxfn(max) {
	return function (v) {
		return Math.max(0, Math.min(max, v));
	};
}

function assertArray(value) {
	return Array.isArray(value) ? value : [value];
}

function zeroArray(array, length) {
	for (let i = 0; i < length; i++) {
		if (typeof array[i] !== 'number') {
			array[i] = 0;
		}
	}

	return array;
}

module.exports = Color;


/***/ }),

/***/ 889:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


const childProcess = __nccwpck_require__(81);
const { isLinux, getReport } = __nccwpck_require__(555);

const command = 'getconf GNU_LIBC_VERSION 2>&1 || true; ldd --version 2>&1 || true';
let commandOut = '';

const safeCommand = () => {
  if (!commandOut) {
    return new Promise((resolve) => {
      childProcess.exec(command, (err, out) => {
        commandOut = err ? ' ' : out;
        resolve(commandOut);
      });
    });
  }
  return commandOut;
};

const safeCommandSync = () => {
  if (!commandOut) {
    try {
      commandOut = childProcess.execSync(command, { encoding: 'utf8' });
    } catch (_err) {
      commandOut = ' ';
    }
  }
  return commandOut;
};

/**
 * A String constant containing the value `glibc`.
 * @type {string}
 * @public
 */
const GLIBC = 'glibc';

/**
 * A String constant containing the value `musl`.
 * @type {string}
 * @public
 */
const MUSL = 'musl';

const isFileMusl = (f) => f.includes('libc.musl-') || f.includes('ld-musl-');

const familyFromReport = () => {
  const report = getReport();
  if (report.header && report.header.glibcVersionRuntime) {
    return GLIBC;
  }
  if (Array.isArray(report.sharedObjects)) {
    if (report.sharedObjects.some(isFileMusl)) {
      return MUSL;
    }
  }
  return null;
};

const familyFromCommand = (out) => {
  const [getconf, ldd1] = out.split(/[\r\n]+/);
  if (getconf && getconf.includes(GLIBC)) {
    return GLIBC;
  }
  if (ldd1 && ldd1.includes(MUSL)) {
    return MUSL;
  }
  return null;
};

/**
 * Resolves with the libc family when it can be determined, `null` otherwise.
 * @returns {Promise<?string>}
 */
const family = async () => {
  let family = null;
  if (isLinux()) {
    family = familyFromReport();
    if (!family) {
      const out = await safeCommand();
      family = familyFromCommand(out);
    }
  }
  return family;
};

/**
 * Returns the libc family when it can be determined, `null` otherwise.
 * @returns {?string}
 */
const familySync = () => {
  let family = null;
  if (isLinux()) {
    family = familyFromReport();
    if (!family) {
      const out = safeCommandSync();
      family = familyFromCommand(out);
    }
  }
  return family;
};

/**
 * Resolves `true` only when the platform is Linux and the libc family is not `glibc`.
 * @returns {Promise<boolean>}
 */
const isNonGlibcLinux = async () => isLinux() && await family() !== GLIBC;

/**
 * Returns `true` only when the platform is Linux and the libc family is not `glibc`.
 * @returns {boolean}
 */
const isNonGlibcLinuxSync = () => isLinux() && familySync() !== GLIBC;

const versionFromReport = () => {
  const report = getReport();
  if (report.header && report.header.glibcVersionRuntime) {
    return report.header.glibcVersionRuntime;
  }
  return null;
};

const versionSuffix = (s) => s.trim().split(/\s+/)[1];

const versionFromCommand = (out) => {
  const [getconf, ldd1, ldd2] = out.split(/[\r\n]+/);
  if (getconf && getconf.includes(GLIBC)) {
    return versionSuffix(getconf);
  }
  if (ldd1 && ldd2 && ldd1.includes(MUSL)) {
    return versionSuffix(ldd2);
  }
  return null;
};

/**
 * Resolves with the libc version when it can be determined, `null` otherwise.
 * @returns {Promise<?string>}
 */
const version = async () => {
  let version = null;
  if (isLinux()) {
    version = versionFromReport();
    if (!version) {
      const out = await safeCommand();
      version = versionFromCommand(out);
    }
  }
  return version;
};

/**
 * Returns the libc version when it can be determined, `null` otherwise.
 * @returns {?string}
 */
const versionSync = () => {
  let version = null;
  if (isLinux()) {
    version = versionFromReport();
    if (!version) {
      const out = safeCommandSync();
      version = versionFromCommand(out);
    }
  }
  return version;
};

module.exports = {
  GLIBC,
  MUSL,
  family,
  familySync,
  isNonGlibcLinux,
  isNonGlibcLinuxSync,
  version,
  versionSync
};


/***/ }),

/***/ 555:
/***/ ((module) => {

"use strict";


const isLinux = () => process.platform === 'linux';

let report = null;
const getReport = () => {
  if (!report) {
    /* istanbul ignore next */
    report = isLinux() && process.report
      ? process.report.getReport()
      : {};
  }
  return report;
};

module.exports = { isLinux, getReport };


/***/ }),

/***/ 586:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

// @ts-check
const path = __nccwpck_require__(17);
const { execFile } = __nccwpck_require__(81);

function optionsToArgs(options) {
  let argArray = ["--parsable-stdout"];

  if (!options) {
    return argArray;
  }

  const setArgWithValue = (name, value) => {
    argArray.push(`--${name}=${value.toString()}`);
  };

  const setFlag = (name, value) => {
    if (value) {
      argArray.push(`--${name}`);
    }
  };

  Object.entries(options).forEach((optionEntry) => {
    /**
     * @type {[keyof import('./odiff').ODiffOptions, unknown]}
     * @ts-expect-error */
    const [option, value] = optionEntry;

    switch (option) {
      case "failOnLayoutDiff":
        setFlag("fail-on-layout", value);
        break;

      case "outputDiffMask":
        setFlag("diff-mask", value);
        break;

      case "threshold":
        setArgWithValue("threshold", value);
        break;

      case "diffColor":
        setArgWithValue("diff-color", value);
        break;

      case "antialiasing":
        setFlag("antialiasing", value);
        break;

      case "ignoreRegions": {
        const regions = value
          .map(
            (region) => `${region.x1}:${region.y1}-${region.x2}:${region.y2}`
          )
          .join(",");

        setArgWithValue("ignore", regions);
        break;
      }
    }
  });

  return argArray;
}

/** @type {(stdout: string) => Partial<{ diffCount: number, diffPercentage: number }>} */
function parsePixelDiffStdout(stdout) {
  try {
    const parts = stdout.split(";");

    if (parts.length === 2) {
      const [diffCount, diffPercentage] = parts;

      return {
        diffCount: parseInt(diffCount),
        diffPercentage: parseFloat(diffPercentage),
      };
    } else {
      throw new Error(`Weird pixel diff stdout: ${stdout}`);
    }
  } catch (e) {
    console.warn(
      "Can't parse output from internal process. Please submit an issue at https://github.com/dmtrKovalenko/odiff/issues/new with the following stacktrace:",
      e
    );
  }

  return {};
}

const CMD_BIN_HELPER_MSG =
  "Usage: odiff [OPTION]... [BASE] [COMPARING] [DIFF]\nTry `odiff --help' for more information.\n";

async function compare(basePath, comparePath, diffOutput, options = {}) {
  return new Promise((resolve, reject) => {
    let producedStdout, producedStdError;

    const binaryPath =
      options && options.__binaryPath
        ? options.__binaryPath
        : __nccwpck_require__.ab + "odiff";

    execFile(
      binaryPath,
      [basePath, comparePath, diffOutput, ...optionsToArgs(options)],
      (_, stdout, stderr) => {
        producedStdout = stdout;
        producedStdError = stderr;
      }
    ).on("close", (code) => {
      switch (code) {
        case 0:
          resolve({ match: true });
          break;
        case 21:
          resolve({ match: false, reason: "layout-diff" });
          break;
        case 22:
          resolve({
            match: false,
            reason: "pixel-diff",
            ...parsePixelDiffStdout(producedStdout),
          });
          break;
        case 124:
          /** @type string */
          const originalErrorMessage = (
            producedStdError || "Invalid Argument Exception"
          ).replace(CMD_BIN_HELPER_MSG, "");

          const noFileOrDirectoryMatches = originalErrorMessage.match(
            /no\n\s*`(.*)'\sfile or\n\s*directory/
          );

          if (options.noFailOnFsErrors && noFileOrDirectoryMatches[1]) {
            resolve({
              match: false,
              reason: "file-not-exists",
              file: noFileOrDirectoryMatches[1],
            });
          } else {
            reject(new TypeError(originalErrorMessage));
          }
          break;

        default:
          reject(
            new Error(
              (producedStdError || producedStdout).replace(
                CMD_BIN_HELPER_MSG,
                ""
              )
            )
          );
          break;
      }
    });
  });
}

module.exports = {
  compare,
};


/***/ }),

/***/ 193:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


const is = __nccwpck_require__(768);

/**
 * Boolean operations for bandbool.
 * @private
 */
const bool = {
  and: 'and',
  or: 'or',
  eor: 'eor'
};

/**
 * Remove alpha channel, if any. This is a no-op if the image does not have an alpha channel.
 *
 * See also {@link /api-operation#flatten|flatten}.
 *
 * @example
 * sharp('rgba.png')
 *   .removeAlpha()
 *   .toFile('rgb.png', function(err, info) {
 *     // rgb.png is a 3 channel image without an alpha channel
 *   });
 *
 * @returns {Sharp}
 */
function removeAlpha () {
  this.options.removeAlpha = true;
  return this;
}

/**
 * Ensure the output image has an alpha transparency channel.
 * If missing, the added alpha channel will have the specified
 * transparency level, defaulting to fully-opaque (1).
 * This is a no-op if the image already has an alpha channel.
 *
 * @since 0.21.2
 *
 * @example
 * // rgba.png will be a 4 channel image with a fully-opaque alpha channel
 * await sharp('rgb.jpg')
 *   .ensureAlpha()
 *   .toFile('rgba.png')
 *
 * @example
 * // rgba is a 4 channel image with a fully-transparent alpha channel
 * const rgba = await sharp(rgb)
 *   .ensureAlpha(0)
 *   .toBuffer();
 *
 * @param {number} [alpha=1] - alpha transparency level (0=fully-transparent, 1=fully-opaque)
 * @returns {Sharp}
 * @throws {Error} Invalid alpha transparency level
 */
function ensureAlpha (alpha) {
  if (is.defined(alpha)) {
    if (is.number(alpha) && is.inRange(alpha, 0, 1)) {
      this.options.ensureAlpha = alpha;
    } else {
      throw is.invalidParameterError('alpha', 'number between 0 and 1', alpha);
    }
  } else {
    this.options.ensureAlpha = 1;
  }
  return this;
}

/**
 * Extract a single channel from a multi-channel image.
 *
 * @example
 * // green.jpg is a greyscale image containing the green channel of the input
 * await sharp(input)
 *   .extractChannel('green')
 *   .toFile('green.jpg');
 *
 * @example
 * // red1 is the red value of the first pixel, red2 the second pixel etc.
 * const [red1, red2, ...] = await sharp(input)
 *   .extractChannel(0)
 *   .raw()
 *   .toBuffer();
 *
 * @param {number|string} channel - zero-indexed channel/band number to extract, or `red`, `green`, `blue` or `alpha`.
 * @returns {Sharp}
 * @throws {Error} Invalid channel
 */
function extractChannel (channel) {
  const channelMap = { red: 0, green: 1, blue: 2, alpha: 3 };
  if (Object.keys(channelMap).includes(channel)) {
    channel = channelMap[channel];
  }
  if (is.integer(channel) && is.inRange(channel, 0, 4)) {
    this.options.extractChannel = channel;
  } else {
    throw is.invalidParameterError('channel', 'integer or one of: red, green, blue, alpha', channel);
  }
  return this.toColourspace('b-w');
}

/**
 * Join one or more channels to the image.
 * The meaning of the added channels depends on the output colourspace, set with `toColourspace()`.
 * By default the output image will be web-friendly sRGB, with additional channels interpreted as alpha channels.
 * Channel ordering follows vips convention:
 * - sRGB: 0: Red, 1: Green, 2: Blue, 3: Alpha.
 * - CMYK: 0: Magenta, 1: Cyan, 2: Yellow, 3: Black, 4: Alpha.
 *
 * Buffers may be any of the image formats supported by sharp.
 * For raw pixel input, the `options` object should contain a `raw` attribute, which follows the format of the attribute of the same name in the `sharp()` constructor.
 *
 * @param {Array<string|Buffer>|string|Buffer} images - one or more images (file paths, Buffers).
 * @param {Object} options - image options, see `sharp()` constructor.
 * @returns {Sharp}
 * @throws {Error} Invalid parameters
 */
function joinChannel (images, options) {
  if (Array.isArray(images)) {
    images.forEach(function (image) {
      this.options.joinChannelIn.push(this._createInputDescriptor(image, options));
    }, this);
  } else {
    this.options.joinChannelIn.push(this._createInputDescriptor(images, options));
  }
  return this;
}

/**
 * Perform a bitwise boolean operation on all input image channels (bands) to produce a single channel output image.
 *
 * @example
 * sharp('3-channel-rgb-input.png')
 *   .bandbool(sharp.bool.and)
 *   .toFile('1-channel-output.png', function (err, info) {
 *     // The output will be a single channel image where each pixel `P = R & G & B`.
 *     // If `I(1,1) = [247, 170, 14] = [0b11110111, 0b10101010, 0b00001111]`
 *     // then `O(1,1) = 0b11110111 & 0b10101010 & 0b00001111 = 0b00000010 = 2`.
 *   });
 *
 * @param {string} boolOp - one of `and`, `or` or `eor` to perform that bitwise operation, like the C logic operators `&`, `|` and `^` respectively.
 * @returns {Sharp}
 * @throws {Error} Invalid parameters
 */
function bandbool (boolOp) {
  if (is.string(boolOp) && is.inArray(boolOp, ['and', 'or', 'eor'])) {
    this.options.bandBoolOp = boolOp;
  } else {
    throw is.invalidParameterError('boolOp', 'one of: and, or, eor', boolOp);
  }
  return this;
}

/**
 * Decorate the Sharp prototype with channel-related functions.
 * @private
 */
module.exports = function (Sharp) {
  Object.assign(Sharp.prototype, {
    // Public instance functions
    removeAlpha,
    ensureAlpha,
    extractChannel,
    joinChannel,
    bandbool
  });
  // Class attributes
  Sharp.bool = bool;
};


/***/ }),

/***/ 144:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


const color = __nccwpck_require__(177);
const is = __nccwpck_require__(768);

/**
 * Colourspaces.
 * @private
 */
const colourspace = {
  multiband: 'multiband',
  'b-w': 'b-w',
  bw: 'b-w',
  cmyk: 'cmyk',
  srgb: 'srgb'
};

/**
 * Tint the image using the provided chroma while preserving the image luminance.
 * An alpha channel may be present and will be unchanged by the operation.
 *
 * @example
 * const output = await sharp(input)
 *   .tint({ r: 255, g: 240, b: 16 })
 *   .toBuffer();
 *
 * @param {string|Object} rgb - parsed by the [color](https://www.npmjs.org/package/color) module to extract chroma values.
 * @returns {Sharp}
 * @throws {Error} Invalid parameter
 */
function tint (rgb) {
  const colour = color(rgb);
  this.options.tintA = colour.a();
  this.options.tintB = colour.b();
  return this;
}

/**
 * Convert to 8-bit greyscale; 256 shades of grey.
 * This is a linear operation. If the input image is in a non-linear colour space such as sRGB, use `gamma()` with `greyscale()` for the best results.
 * By default the output image will be web-friendly sRGB and contain three (identical) color channels.
 * This may be overridden by other sharp operations such as `toColourspace('b-w')`,
 * which will produce an output image containing one color channel.
 * An alpha channel may be present, and will be unchanged by the operation.
 *
 * @example
 * const output = await sharp(input).greyscale().toBuffer();
 *
 * @param {Boolean} [greyscale=true]
 * @returns {Sharp}
 */
function greyscale (greyscale) {
  this.options.greyscale = is.bool(greyscale) ? greyscale : true;
  return this;
}

/**
 * Alternative spelling of `greyscale`.
 * @param {Boolean} [grayscale=true]
 * @returns {Sharp}
 */
function grayscale (grayscale) {
  return this.greyscale(grayscale);
}

/**
 * Set the pipeline colourspace.
 *
 * The input image will be converted to the provided colourspace at the start of the pipeline.
 * All operations will use this colourspace before converting to the output colourspace, as defined by {@link toColourspace}.
 *
 * This feature is experimental and has not yet been fully-tested with all operations.
 *
 * @since 0.29.0
 *
 * @example
 * // Run pipeline in 16 bits per channel RGB while converting final result to 8 bits per channel sRGB.
 * await sharp(input)
 *  .pipelineColourspace('rgb16')
 *  .toColourspace('srgb')
 *  .toFile('16bpc-pipeline-to-8bpc-output.png')
 *
 * @param {string} [colourspace] - pipeline colourspace e.g. `rgb16`, `scrgb`, `lab`, `grey16` [...](https://github.com/libvips/libvips/blob/41cff4e9d0838498487a00623462204eb10ee5b8/libvips/iofuncs/enumtypes.c#L774)
 * @returns {Sharp}
 * @throws {Error} Invalid parameters
 */
function pipelineColourspace (colourspace) {
  if (!is.string(colourspace)) {
    throw is.invalidParameterError('colourspace', 'string', colourspace);
  }
  this.options.colourspaceInput = colourspace;
  return this;
}

/**
 * Alternative spelling of `pipelineColourspace`.
 * @param {string} [colorspace] - pipeline colorspace.
 * @returns {Sharp}
 * @throws {Error} Invalid parameters
 */
function pipelineColorspace (colorspace) {
  return this.pipelineColourspace(colorspace);
}

/**
 * Set the output colourspace.
 * By default output image will be web-friendly sRGB, with additional channels interpreted as alpha channels.
 *
 * @example
 * // Output 16 bits per pixel RGB
 * await sharp(input)
 *  .toColourspace('rgb16')
 *  .toFile('16-bpp.png')
 *
 * @param {string} [colourspace] - output colourspace e.g. `srgb`, `rgb`, `cmyk`, `lab`, `b-w` [...](https://github.com/libvips/libvips/blob/3c0bfdf74ce1dc37a6429bed47fa76f16e2cd70a/libvips/iofuncs/enumtypes.c#L777-L794)
 * @returns {Sharp}
 * @throws {Error} Invalid parameters
 */
function toColourspace (colourspace) {
  if (!is.string(colourspace)) {
    throw is.invalidParameterError('colourspace', 'string', colourspace);
  }
  this.options.colourspace = colourspace;
  return this;
}

/**
 * Alternative spelling of `toColourspace`.
 * @param {string} [colorspace] - output colorspace.
 * @returns {Sharp}
 * @throws {Error} Invalid parameters
 */
function toColorspace (colorspace) {
  return this.toColourspace(colorspace);
}

/**
 * Update a colour attribute of the this.options Object.
 * @private
 * @param {string} key
 * @param {string|Object} value
 * @throws {Error} Invalid value
 */
function _setBackgroundColourOption (key, value) {
  if (is.defined(value)) {
    if (is.object(value) || is.string(value)) {
      const colour = color(value);
      this.options[key] = [
        colour.red(),
        colour.green(),
        colour.blue(),
        Math.round(colour.alpha() * 255)
      ];
    } else {
      throw is.invalidParameterError('background', 'object or string', value);
    }
  }
}

/**
 * Decorate the Sharp prototype with colour-related functions.
 * @private
 */
module.exports = function (Sharp) {
  Object.assign(Sharp.prototype, {
    // Public
    tint,
    greyscale,
    grayscale,
    pipelineColourspace,
    pipelineColorspace,
    toColourspace,
    toColorspace,
    // Private
    _setBackgroundColourOption
  });
  // Class attributes
  Sharp.colourspace = colourspace;
  Sharp.colorspace = colourspace;
};


/***/ }),

/***/ 5:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


const is = __nccwpck_require__(768);

/**
 * Blend modes.
 * @member
 * @private
 */
const blend = {
  clear: 'clear',
  source: 'source',
  over: 'over',
  in: 'in',
  out: 'out',
  atop: 'atop',
  dest: 'dest',
  'dest-over': 'dest-over',
  'dest-in': 'dest-in',
  'dest-out': 'dest-out',
  'dest-atop': 'dest-atop',
  xor: 'xor',
  add: 'add',
  saturate: 'saturate',
  multiply: 'multiply',
  screen: 'screen',
  overlay: 'overlay',
  darken: 'darken',
  lighten: 'lighten',
  'colour-dodge': 'colour-dodge',
  'color-dodge': 'colour-dodge',
  'colour-burn': 'colour-burn',
  'color-burn': 'colour-burn',
  'hard-light': 'hard-light',
  'soft-light': 'soft-light',
  difference: 'difference',
  exclusion: 'exclusion'
};

/**
 * Composite image(s) over the processed (resized, extracted etc.) image.
 *
 * The images to composite must be the same size or smaller than the processed image.
 * If both `top` and `left` options are provided, they take precedence over `gravity`.
 *
 * The `blend` option can be one of `clear`, `source`, `over`, `in`, `out`, `atop`,
 * `dest`, `dest-over`, `dest-in`, `dest-out`, `dest-atop`,
 * `xor`, `add`, `saturate`, `multiply`, `screen`, `overlay`, `darken`, `lighten`,
 * `colour-dodge`, `color-dodge`, `colour-burn`,`color-burn`,
 * `hard-light`, `soft-light`, `difference`, `exclusion`.
 *
 * More information about blend modes can be found at
 * https://www.libvips.org/API/current/libvips-conversion.html#VipsBlendMode
 * and https://www.cairographics.org/operators/
 *
 * @since 0.22.0
 *
 * @example
 * await sharp(background)
 *   .composite([
 *     { input: layer1, gravity: 'northwest' },
 *     { input: layer2, gravity: 'southeast' },
 *   ])
 *   .toFile('combined.png');
 *
 * @example
 * const output = await sharp('input.gif', { animated: true })
 *   .composite([
 *     { input: 'overlay.png', tile: true, blend: 'saturate' }
 *   ])
 *   .toBuffer();
 *
 * @example
 * sharp('input.png')
 *   .rotate(180)
 *   .resize(300)
 *   .flatten( { background: '#ff6600' } )
 *   .composite([{ input: 'overlay.png', gravity: 'southeast' }])
 *   .sharpen()
 *   .withMetadata()
 *   .webp( { quality: 90 } )
 *   .toBuffer()
 *   .then(function(outputBuffer) {
 *     // outputBuffer contains upside down, 300px wide, alpha channel flattened
 *     // onto orange background, composited with overlay.png with SE gravity,
 *     // sharpened, with metadata, 90% quality WebP image data. Phew!
 *   });
 *
 * @param {Object[]} images - Ordered list of images to composite
 * @param {Buffer|String} [images[].input] - Buffer containing image data, String containing the path to an image file, or Create object (see below)
 * @param {Object} [images[].input.create] - describes a blank overlay to be created.
 * @param {Number} [images[].input.create.width]
 * @param {Number} [images[].input.create.height]
 * @param {Number} [images[].input.create.channels] - 3-4
 * @param {String|Object} [images[].input.create.background] - parsed by the [color](https://www.npmjs.org/package/color) module to extract values for red, green, blue and alpha.
 * @param {String} [images[].blend='over'] - how to blend this image with the image below.
 * @param {String} [images[].gravity='centre'] - gravity at which to place the overlay.
 * @param {Number} [images[].top] - the pixel offset from the top edge.
 * @param {Number} [images[].left] - the pixel offset from the left edge.
 * @param {Boolean} [images[].tile=false] - set to true to repeat the overlay image across the entire image with the given `gravity`.
 * @param {Boolean} [images[].premultiplied=false] - set to true to avoid premultipling the image below. Equivalent to the `--premultiplied` vips option.
 * @param {Number} [images[].density=72] - number representing the DPI for vector overlay image.
 * @param {Object} [images[].raw] - describes overlay when using raw pixel data.
 * @param {Number} [images[].raw.width]
 * @param {Number} [images[].raw.height]
 * @param {Number} [images[].raw.channels]
 * @param {boolean} [images[].animated=false] - Set to `true` to read all frames/pages of an animated image.
 * @param {string} [images[].failOn='warning'] - @see {@link /api-constructor#parameters|constructor parameters}
 * @param {number|boolean} [images[].limitInputPixels=268402689] - @see {@link /api-constructor#parameters|constructor parameters}
 * @returns {Sharp}
 * @throws {Error} Invalid parameters
 */
function composite (images) {
  if (!Array.isArray(images)) {
    throw is.invalidParameterError('images to composite', 'array', images);
  }
  this.options.composite = images.map(image => {
    if (!is.object(image)) {
      throw is.invalidParameterError('image to composite', 'object', image);
    }
    const inputOptions = this._inputOptionsFromObject(image);
    const composite = {
      input: this._createInputDescriptor(image.input, inputOptions, { allowStream: false }),
      blend: 'over',
      tile: false,
      left: 0,
      top: 0,
      hasOffset: false,
      gravity: 0,
      premultiplied: false
    };
    if (is.defined(image.blend)) {
      if (is.string(blend[image.blend])) {
        composite.blend = blend[image.blend];
      } else {
        throw is.invalidParameterError('blend', 'valid blend name', image.blend);
      }
    }
    if (is.defined(image.tile)) {
      if (is.bool(image.tile)) {
        composite.tile = image.tile;
      } else {
        throw is.invalidParameterError('tile', 'boolean', image.tile);
      }
    }
    if (is.defined(image.left)) {
      if (is.integer(image.left)) {
        composite.left = image.left;
      } else {
        throw is.invalidParameterError('left', 'integer', image.left);
      }
    }
    if (is.defined(image.top)) {
      if (is.integer(image.top)) {
        composite.top = image.top;
      } else {
        throw is.invalidParameterError('top', 'integer', image.top);
      }
    }
    if (is.defined(image.top) !== is.defined(image.left)) {
      throw new Error('Expected both left and top to be set');
    } else {
      composite.hasOffset = is.integer(image.top) && is.integer(image.left);
    }
    if (is.defined(image.gravity)) {
      if (is.integer(image.gravity) && is.inRange(image.gravity, 0, 8)) {
        composite.gravity = image.gravity;
      } else if (is.string(image.gravity) && is.integer(this.constructor.gravity[image.gravity])) {
        composite.gravity = this.constructor.gravity[image.gravity];
      } else {
        throw is.invalidParameterError('gravity', 'valid gravity', image.gravity);
      }
    }
    if (is.defined(image.premultiplied)) {
      if (is.bool(image.premultiplied)) {
        composite.premultiplied = image.premultiplied;
      } else {
        throw is.invalidParameterError('premultiplied', 'boolean', image.premultiplied);
      }
    }
    return composite;
  });
  return this;
}

/**
 * Decorate the Sharp prototype with composite-related functions.
 * @private
 */
module.exports = function (Sharp) {
  Sharp.prototype.composite = composite;
  Sharp.blend = blend;
};


/***/ }),

/***/ 156:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


const util = __nccwpck_require__(837);
const stream = __nccwpck_require__(781);
const is = __nccwpck_require__(768);

(__nccwpck_require__(701).hasVendoredLibvips)();
__nccwpck_require__(382);

// Use NODE_DEBUG=sharp to enable libvips warnings
const debuglog = util.debuglog('sharp');

/**
 * Constructor factory to create an instance of `sharp`, to which further methods are chained.
 *
 * JPEG, PNG, WebP, GIF, AVIF or TIFF format image data can be streamed out from this object.
 * When using Stream based output, derived attributes are available from the `info` event.
 *
 * Non-critical problems encountered during processing are emitted as `warning` events.
 *
 * Implements the [stream.Duplex](http://nodejs.org/api/stream.html#stream_class_stream_duplex) class.
 *
 * @constructs Sharp
 *
 * @emits Sharp#info
 * @emits Sharp#warning
 *
 * @example
 * sharp('input.jpg')
 *   .resize(300, 200)
 *   .toFile('output.jpg', function(err) {
 *     // output.jpg is a 300 pixels wide and 200 pixels high image
 *     // containing a scaled and cropped version of input.jpg
 *   });
 *
 * @example
 * // Read image data from readableStream,
 * // resize to 300 pixels wide,
 * // emit an 'info' event with calculated dimensions
 * // and finally write image data to writableStream
 * var transformer = sharp()
 *   .resize(300)
 *   .on('info', function(info) {
 *     console.log('Image height is ' + info.height);
 *   });
 * readableStream.pipe(transformer).pipe(writableStream);
 *
 * @example
 * // Create a blank 300x200 PNG image of semi-transluent red pixels
 * sharp({
 *   create: {
 *     width: 300,
 *     height: 200,
 *     channels: 4,
 *     background: { r: 255, g: 0, b: 0, alpha: 0.5 }
 *   }
 * })
 * .png()
 * .toBuffer()
 * .then( ... );
 *
 * @example
 * // Convert an animated GIF to an animated WebP
 * await sharp('in.gif', { animated: true }).toFile('out.webp');
 *
 * @example
 * // Read a raw array of pixels and save it to a png
 * const input = Uint8Array.from([255, 255, 255, 0, 0, 0]); // or Uint8ClampedArray
 * const image = sharp(input, {
 *   // because the input does not contain its dimensions or how many channels it has
 *   // we need to specify it in the constructor options
 *   raw: {
 *     width: 2,
 *     height: 1,
 *     channels: 3
 *   }
 * });
 * await image.toFile('my-two-pixels.png');
 *
 * @example
 * // Generate RGB Gaussian noise
 * await sharp({
 *   create: {
 *     width: 300,
 *     height: 200,
 *     channels: 3,
 *     noise: {
 *       type: 'gaussian',
 *       mean: 128,
 *       sigma: 30
 *     }
 *  }
 * }).toFile('noise.png');
 *
 * @param {(Buffer|Uint8Array|Uint8ClampedArray|Int8Array|Uint16Array|Int16Array|Uint32Array|Int32Array|Float32Array|Float64Array|string)} [input] - if present, can be
 *  a Buffer / Uint8Array / Uint8ClampedArray containing JPEG, PNG, WebP, AVIF, GIF, SVG or TIFF image data, or
 *  a TypedArray containing raw pixel image data, or
 *  a String containing the filesystem path to an JPEG, PNG, WebP, AVIF, GIF, SVG or TIFF image file.
 *  JPEG, PNG, WebP, AVIF, GIF, SVG, TIFF or raw pixel image data can be streamed into the object when not present.
 * @param {Object} [options] - if present, is an Object with optional attributes.
 * @param {string} [options.failOn='warning'] - level of sensitivity to invalid images, one of (in order of sensitivity): 'none' (least), 'truncated', 'error' or 'warning' (most), highers level imply lower levels.
 * @param {number|boolean} [options.limitInputPixels=268402689] - Do not process input images where the number of pixels
 *  (width x height) exceeds this limit. Assumes image dimensions contained in the input metadata can be trusted.
 *  An integral Number of pixels, zero or false to remove limit, true to use default limit of 268402689 (0x3FFF x 0x3FFF).
 * @param {boolean} [options.unlimited=false] - Set this to `true` to remove safety features that help prevent memory exhaustion (SVG, PNG).
 * @param {boolean} [options.sequentialRead=false] - Set this to `true` to use sequential rather than random access where possible.
 *  This can reduce memory usage and might improve performance on some systems.
 * @param {number} [options.density=72] - number representing the DPI for vector images in the range 1 to 100000.
 * @param {number} [options.pages=1] - number of pages to extract for multi-page input (GIF, WebP, AVIF, TIFF, PDF), use -1 for all pages.
 * @param {number} [options.page=0] - page number to start extracting from for multi-page input (GIF, WebP, AVIF, TIFF, PDF), zero based.
 * @param {number} [options.subifd=-1] - subIFD (Sub Image File Directory) to extract for OME-TIFF, defaults to main image.
 * @param {number} [options.level=0] - level to extract from a multi-level input (OpenSlide), zero based.
 * @param {boolean} [options.animated=false] - Set to `true` to read all frames/pages of an animated image (equivalent of setting `pages` to `-1`).
 * @param {Object} [options.raw] - describes raw pixel input image data. See `raw()` for pixel ordering.
 * @param {number} [options.raw.width] - integral number of pixels wide.
 * @param {number} [options.raw.height] - integral number of pixels high.
 * @param {number} [options.raw.channels] - integral number of channels, between 1 and 4.
 * @param {boolean} [options.raw.premultiplied] - specifies that the raw input has already been premultiplied, set to `true`
 *  to avoid sharp premultiplying the image. (optional, default `false`)
 * @param {Object} [options.create] - describes a new image to be created.
 * @param {number} [options.create.width] - integral number of pixels wide.
 * @param {number} [options.create.height] - integral number of pixels high.
 * @param {number} [options.create.channels] - integral number of channels, either 3 (RGB) or 4 (RGBA).
 * @param {string|Object} [options.create.background] - parsed by the [color](https://www.npmjs.org/package/color) module to extract values for red, green, blue and alpha.
 * @param {Object} [options.create.noise] - describes a noise to be created.
 * @param {string} [options.create.noise.type] - type of generated noise, currently only `gaussian` is supported.
 * @param {number} [options.create.noise.mean] - mean of pixels in generated noise.
 * @param {number} [options.create.noise.sigma] - standard deviation of pixels in generated noise.
 * @returns {Sharp}
 * @throws {Error} Invalid parameters
 */
const Sharp = function (input, options) {
  if (arguments.length === 1 && !is.defined(input)) {
    throw new Error('Invalid input');
  }
  if (!(this instanceof Sharp)) {
    return new Sharp(input, options);
  }
  stream.Duplex.call(this);
  this.options = {
    // resize options
    topOffsetPre: -1,
    leftOffsetPre: -1,
    widthPre: -1,
    heightPre: -1,
    topOffsetPost: -1,
    leftOffsetPost: -1,
    widthPost: -1,
    heightPost: -1,
    width: -1,
    height: -1,
    canvas: 'crop',
    position: 0,
    resizeBackground: [0, 0, 0, 255],
    useExifOrientation: false,
    angle: 0,
    rotationAngle: 0,
    rotationBackground: [0, 0, 0, 255],
    rotateBeforePreExtract: false,
    flip: false,
    flop: false,
    extendTop: 0,
    extendBottom: 0,
    extendLeft: 0,
    extendRight: 0,
    extendBackground: [0, 0, 0, 255],
    withoutEnlargement: false,
    withoutReduction: false,
    affineMatrix: [],
    affineBackground: [0, 0, 0, 255],
    affineIdx: 0,
    affineIdy: 0,
    affineOdx: 0,
    affineOdy: 0,
    affineInterpolator: this.constructor.interpolators.bilinear,
    kernel: 'lanczos3',
    fastShrinkOnLoad: true,
    // operations
    tintA: 128,
    tintB: 128,
    flatten: false,
    flattenBackground: [0, 0, 0],
    negate: false,
    negateAlpha: true,
    medianSize: 0,
    blurSigma: 0,
    sharpenSigma: 0,
    sharpenM1: 1,
    sharpenM2: 2,
    sharpenX1: 2,
    sharpenY2: 10,
    sharpenY3: 20,
    threshold: 0,
    thresholdGrayscale: true,
    trimThreshold: 0,
    gamma: 0,
    gammaOut: 0,
    greyscale: false,
    normalise: false,
    claheWidth: 0,
    claheHeight: 0,
    claheMaxSlope: 3,
    brightness: 1,
    saturation: 1,
    hue: 0,
    lightness: 0,
    booleanBufferIn: null,
    booleanFileIn: '',
    joinChannelIn: [],
    extractChannel: -1,
    removeAlpha: false,
    ensureAlpha: -1,
    colourspace: 'srgb',
    colourspaceInput: 'last',
    composite: [],
    // output
    fileOut: '',
    formatOut: 'input',
    streamOut: false,
    withMetadata: false,
    withMetadataOrientation: -1,
    withMetadataDensity: 0,
    withMetadataIcc: '',
    withMetadataStrs: {},
    resolveWithObject: false,
    // output format
    jpegQuality: 80,
    jpegProgressive: false,
    jpegChromaSubsampling: '4:2:0',
    jpegTrellisQuantisation: false,
    jpegOvershootDeringing: false,
    jpegOptimiseScans: false,
    jpegOptimiseCoding: true,
    jpegQuantisationTable: 0,
    pngProgressive: false,
    pngCompressionLevel: 6,
    pngAdaptiveFiltering: false,
    pngPalette: false,
    pngQuality: 100,
    pngEffort: 7,
    pngBitdepth: 8,
    pngDither: 1,
    jp2Quality: 80,
    jp2TileHeight: 512,
    jp2TileWidth: 512,
    jp2Lossless: false,
    jp2ChromaSubsampling: '4:4:4',
    webpQuality: 80,
    webpAlphaQuality: 100,
    webpLossless: false,
    webpNearLossless: false,
    webpSmartSubsample: false,
    webpEffort: 4,
    gifBitdepth: 8,
    gifEffort: 7,
    gifDither: 1,
    tiffQuality: 80,
    tiffCompression: 'jpeg',
    tiffPredictor: 'horizontal',
    tiffPyramid: false,
    tiffBitdepth: 8,
    tiffTile: false,
    tiffTileHeight: 256,
    tiffTileWidth: 256,
    tiffXres: 1.0,
    tiffYres: 1.0,
    tiffResolutionUnit: 'inch',
    heifQuality: 50,
    heifLossless: false,
    heifCompression: 'av1',
    heifEffort: 4,
    heifChromaSubsampling: '4:4:4',
    rawDepth: 'uchar',
    tileSize: 256,
    tileOverlap: 0,
    tileContainer: 'fs',
    tileLayout: 'dz',
    tileFormat: 'last',
    tileDepth: 'last',
    tileAngle: 0,
    tileSkipBlanks: -1,
    tileBackground: [255, 255, 255, 255],
    tileCentre: false,
    tileId: 'https://example.com/iiif',
    timeoutSeconds: 0,
    linearA: 1,
    linearB: 0,
    // Function to notify of libvips warnings
    debuglog: warning => {
      this.emit('warning', warning);
      debuglog(warning);
    },
    // Function to notify of queue length changes
    queueListener: function (queueLength) {
      Sharp.queue.emit('change', queueLength);
    }
  };
  this.options.input = this._createInputDescriptor(input, options, { allowStream: true });
  return this;
};
Object.setPrototypeOf(Sharp.prototype, stream.Duplex.prototype);
Object.setPrototypeOf(Sharp, stream.Duplex);

/**
 * Take a "snapshot" of the Sharp instance, returning a new instance.
 * Cloned instances inherit the input of their parent instance.
 * This allows multiple output Streams and therefore multiple processing pipelines to share a single input Stream.
 *
 * @example
 * const pipeline = sharp().rotate();
 * pipeline.clone().resize(800, 600).pipe(firstWritableStream);
 * pipeline.clone().extract({ left: 20, top: 20, width: 100, height: 100 }).pipe(secondWritableStream);
 * readableStream.pipe(pipeline);
 * // firstWritableStream receives auto-rotated, resized readableStream
 * // secondWritableStream receives auto-rotated, extracted region of readableStream
 *
 * @example
 * // Create a pipeline that will download an image, resize it and format it to different files
 * // Using Promises to know when the pipeline is complete
 * const fs = require("fs");
 * const got = require("got");
 * const sharpStream = sharp({ failOn: 'none' });
 *
 * const promises = [];
 *
 * promises.push(
 *   sharpStream
 *     .clone()
 *     .jpeg({ quality: 100 })
 *     .toFile("originalFile.jpg")
 * );
 *
 * promises.push(
 *   sharpStream
 *     .clone()
 *     .resize({ width: 500 })
 *     .jpeg({ quality: 80 })
 *     .toFile("optimized-500.jpg")
 * );
 *
 * promises.push(
 *   sharpStream
 *     .clone()
 *     .resize({ width: 500 })
 *     .webp({ quality: 80 })
 *     .toFile("optimized-500.webp")
 * );
 *
 * // https://github.com/sindresorhus/got#gotstreamurl-options
 * got.stream("https://www.example.com/some-file.jpg").pipe(sharpStream);
 *
 * Promise.all(promises)
 *   .then(res => { console.log("Done!", res); })
 *   .catch(err => {
 *     console.error("Error processing files, let's clean it up", err);
 *     try {
 *       fs.unlinkSync("originalFile.jpg");
 *       fs.unlinkSync("optimized-500.jpg");
 *       fs.unlinkSync("optimized-500.webp");
 *     } catch (e) {}
 *   });
 *
 * @returns {Sharp}
 */
function clone () {
  // Clone existing options
  const clone = this.constructor.call();
  clone.options = Object.assign({}, this.options);
  // Pass 'finish' event to clone for Stream-based input
  if (this._isStreamInput()) {
    this.on('finish', () => {
      // Clone inherits input data
      this._flattenBufferIn();
      clone.options.bufferIn = this.options.bufferIn;
      clone.emit('finish');
    });
  }
  return clone;
}
Object.assign(Sharp.prototype, { clone });

/**
 * Export constructor.
 * @private
 */
module.exports = Sharp;


/***/ }),

/***/ 185:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


const Sharp = __nccwpck_require__(156);
__nccwpck_require__(869)(Sharp);
__nccwpck_require__(932)(Sharp);
__nccwpck_require__(5)(Sharp);
__nccwpck_require__(946)(Sharp);
__nccwpck_require__(144)(Sharp);
__nccwpck_require__(193)(Sharp);
__nccwpck_require__(280)(Sharp);
__nccwpck_require__(927)(Sharp);

module.exports = Sharp;


/***/ }),

/***/ 869:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


const color = __nccwpck_require__(177);
const is = __nccwpck_require__(768);
const sharp = __nccwpck_require__(382);

/**
 * Extract input options, if any, from an object.
 * @private
 */
function _inputOptionsFromObject (obj) {
  const { raw, density, limitInputPixels, unlimited, sequentialRead, failOn, failOnError, animated, page, pages, subifd } = obj;
  return [raw, density, limitInputPixels, unlimited, sequentialRead, failOn, failOnError, animated, page, pages, subifd].some(is.defined)
    ? { raw, density, limitInputPixels, unlimited, sequentialRead, failOn, failOnError, animated, page, pages, subifd }
    : undefined;
}

/**
 * Create Object containing input and input-related options.
 * @private
 */
function _createInputDescriptor (input, inputOptions, containerOptions) {
  const inputDescriptor = {
    failOn: 'warning',
    limitInputPixels: Math.pow(0x3FFF, 2),
    unlimited: false,
    sequentialRead: false
  };
  if (is.string(input)) {
    // filesystem
    inputDescriptor.file = input;
  } else if (is.buffer(input)) {
    // Buffer
    if (input.length === 0) {
      throw Error('Input Buffer is empty');
    }
    inputDescriptor.buffer = input;
  } else if (is.typedArray(input)) {
    if (input.length === 0) {
      throw Error('Input Bit Array is empty');
    }
    inputDescriptor.buffer = Buffer.from(input.buffer, input.byteOffset, input.byteLength);
  } else if (is.plainObject(input) && !is.defined(inputOptions)) {
    // Plain Object descriptor, e.g. create
    inputOptions = input;
    if (_inputOptionsFromObject(inputOptions)) {
      // Stream with options
      inputDescriptor.buffer = [];
    }
  } else if (!is.defined(input) && !is.defined(inputOptions) && is.object(containerOptions) && containerOptions.allowStream) {
    // Stream without options
    inputDescriptor.buffer = [];
  } else {
    throw new Error(`Unsupported input '${input}' of type ${typeof input}${
      is.defined(inputOptions) ? ` when also providing options of type ${typeof inputOptions}` : ''
    }`);
  }
  if (is.object(inputOptions)) {
    // Deprecated: failOnError
    if (is.defined(inputOptions.failOnError)) {
      if (is.bool(inputOptions.failOnError)) {
        inputDescriptor.failOn = inputOptions.failOnError ? 'warning' : 'none';
      } else {
        throw is.invalidParameterError('failOnError', 'boolean', inputOptions.failOnError);
      }
    }
    // failOn
    if (is.defined(inputOptions.failOn)) {
      if (is.string(inputOptions.failOn) && is.inArray(inputOptions.failOn, ['none', 'truncated', 'error', 'warning'])) {
        inputDescriptor.failOn = inputOptions.failOn;
      } else {
        throw is.invalidParameterError('failOn', 'one of: none, truncated, error, warning', inputOptions.failOn);
      }
    }
    // Density
    if (is.defined(inputOptions.density)) {
      if (is.inRange(inputOptions.density, 1, 100000)) {
        inputDescriptor.density = inputOptions.density;
      } else {
        throw is.invalidParameterError('density', 'number between 1 and 100000', inputOptions.density);
      }
    }
    // limitInputPixels
    if (is.defined(inputOptions.limitInputPixels)) {
      if (is.bool(inputOptions.limitInputPixels)) {
        inputDescriptor.limitInputPixels = inputOptions.limitInputPixels
          ? Math.pow(0x3FFF, 2)
          : 0;
      } else if (is.integer(inputOptions.limitInputPixels) && is.inRange(inputOptions.limitInputPixels, 0, Number.MAX_SAFE_INTEGER)) {
        inputDescriptor.limitInputPixels = inputOptions.limitInputPixels;
      } else {
        throw is.invalidParameterError('limitInputPixels', 'positive integer', inputOptions.limitInputPixels);
      }
    }
    // unlimited
    if (is.defined(inputOptions.unlimited)) {
      if (is.bool(inputOptions.unlimited)) {
        inputDescriptor.unlimited = inputOptions.unlimited;
      } else {
        throw is.invalidParameterError('unlimited', 'boolean', inputOptions.unlimited);
      }
    }
    // sequentialRead
    if (is.defined(inputOptions.sequentialRead)) {
      if (is.bool(inputOptions.sequentialRead)) {
        inputDescriptor.sequentialRead = inputOptions.sequentialRead;
      } else {
        throw is.invalidParameterError('sequentialRead', 'boolean', inputOptions.sequentialRead);
      }
    }
    // Raw pixel input
    if (is.defined(inputOptions.raw)) {
      if (
        is.object(inputOptions.raw) &&
        is.integer(inputOptions.raw.width) && inputOptions.raw.width > 0 &&
        is.integer(inputOptions.raw.height) && inputOptions.raw.height > 0 &&
        is.integer(inputOptions.raw.channels) && is.inRange(inputOptions.raw.channels, 1, 4)
      ) {
        inputDescriptor.rawWidth = inputOptions.raw.width;
        inputDescriptor.rawHeight = inputOptions.raw.height;
        inputDescriptor.rawChannels = inputOptions.raw.channels;
        inputDescriptor.rawPremultiplied = !!inputOptions.raw.premultiplied;

        switch (input.constructor) {
          case Uint8Array:
          case Uint8ClampedArray:
            inputDescriptor.rawDepth = 'uchar';
            break;
          case Int8Array:
            inputDescriptor.rawDepth = 'char';
            break;
          case Uint16Array:
            inputDescriptor.rawDepth = 'ushort';
            break;
          case Int16Array:
            inputDescriptor.rawDepth = 'short';
            break;
          case Uint32Array:
            inputDescriptor.rawDepth = 'uint';
            break;
          case Int32Array:
            inputDescriptor.rawDepth = 'int';
            break;
          case Float32Array:
            inputDescriptor.rawDepth = 'float';
            break;
          case Float64Array:
            inputDescriptor.rawDepth = 'double';
            break;
          default:
            inputDescriptor.rawDepth = 'uchar';
            break;
        }
      } else {
        throw new Error('Expected width, height and channels for raw pixel input');
      }
    }
    // Multi-page input (GIF, TIFF, PDF)
    if (is.defined(inputOptions.animated)) {
      if (is.bool(inputOptions.animated)) {
        inputDescriptor.pages = inputOptions.animated ? -1 : 1;
      } else {
        throw is.invalidParameterError('animated', 'boolean', inputOptions.animated);
      }
    }
    if (is.defined(inputOptions.pages)) {
      if (is.integer(inputOptions.pages) && is.inRange(inputOptions.pages, -1, 100000)) {
        inputDescriptor.pages = inputOptions.pages;
      } else {
        throw is.invalidParameterError('pages', 'integer between -1 and 100000', inputOptions.pages);
      }
    }
    if (is.defined(inputOptions.page)) {
      if (is.integer(inputOptions.page) && is.inRange(inputOptions.page, 0, 100000)) {
        inputDescriptor.page = inputOptions.page;
      } else {
        throw is.invalidParameterError('page', 'integer between 0 and 100000', inputOptions.page);
      }
    }
    // Multi-level input (OpenSlide)
    if (is.defined(inputOptions.level)) {
      if (is.integer(inputOptions.level) && is.inRange(inputOptions.level, 0, 256)) {
        inputDescriptor.level = inputOptions.level;
      } else {
        throw is.invalidParameterError('level', 'integer between 0 and 256', inputOptions.level);
      }
    }
    // Sub Image File Directory (TIFF)
    if (is.defined(inputOptions.subifd)) {
      if (is.integer(inputOptions.subifd) && is.inRange(inputOptions.subifd, -1, 100000)) {
        inputDescriptor.subifd = inputOptions.subifd;
      } else {
        throw is.invalidParameterError('subifd', 'integer between -1 and 100000', inputOptions.subifd);
      }
    }
    // Create new image
    if (is.defined(inputOptions.create)) {
      if (
        is.object(inputOptions.create) &&
        is.integer(inputOptions.create.width) && inputOptions.create.width > 0 &&
        is.integer(inputOptions.create.height) && inputOptions.create.height > 0 &&
        is.integer(inputOptions.create.channels)
      ) {
        inputDescriptor.createWidth = inputOptions.create.width;
        inputDescriptor.createHeight = inputOptions.create.height;
        inputDescriptor.createChannels = inputOptions.create.channels;
        // Noise
        if (is.defined(inputOptions.create.noise)) {
          if (!is.object(inputOptions.create.noise)) {
            throw new Error('Expected noise to be an object');
          }
          if (!is.inArray(inputOptions.create.noise.type, ['gaussian'])) {
            throw new Error('Only gaussian noise is supported at the moment');
          }
          if (!is.inRange(inputOptions.create.channels, 1, 4)) {
            throw is.invalidParameterError('create.channels', 'number between 1 and 4', inputOptions.create.channels);
          }
          inputDescriptor.createNoiseType = inputOptions.create.noise.type;
          if (is.number(inputOptions.create.noise.mean) && is.inRange(inputOptions.create.noise.mean, 0, 10000)) {
            inputDescriptor.createNoiseMean = inputOptions.create.noise.mean;
          } else {
            throw is.invalidParameterError('create.noise.mean', 'number between 0 and 10000', inputOptions.create.noise.mean);
          }
          if (is.number(inputOptions.create.noise.sigma) && is.inRange(inputOptions.create.noise.sigma, 0, 10000)) {
            inputDescriptor.createNoiseSigma = inputOptions.create.noise.sigma;
          } else {
            throw is.invalidParameterError('create.noise.sigma', 'number between 0 and 10000', inputOptions.create.noise.sigma);
          }
        } else if (is.defined(inputOptions.create.background)) {
          if (!is.inRange(inputOptions.create.channels, 3, 4)) {
            throw is.invalidParameterError('create.channels', 'number between 3 and 4', inputOptions.create.channels);
          }
          const background = color(inputOptions.create.background);
          inputDescriptor.createBackground = [
            background.red(),
            background.green(),
            background.blue(),
            Math.round(background.alpha() * 255)
          ];
        } else {
          throw new Error('Expected valid noise or background to create a new input image');
        }
        delete inputDescriptor.buffer;
      } else {
        throw new Error('Expected valid width, height and channels to create a new input image');
      }
    }
  } else if (is.defined(inputOptions)) {
    throw new Error('Invalid input options ' + inputOptions);
  }
  return inputDescriptor;
}

/**
 * Handle incoming Buffer chunk on Writable Stream.
 * @private
 * @param {Buffer} chunk
 * @param {string} encoding - unused
 * @param {Function} callback
 */
function _write (chunk, encoding, callback) {
  /* istanbul ignore else */
  if (Array.isArray(this.options.input.buffer)) {
    /* istanbul ignore else */
    if (is.buffer(chunk)) {
      if (this.options.input.buffer.length === 0) {
        this.on('finish', () => {
          this.streamInFinished = true;
        });
      }
      this.options.input.buffer.push(chunk);
      callback();
    } else {
      callback(new Error('Non-Buffer data on Writable Stream'));
    }
  } else {
    callback(new Error('Unexpected data on Writable Stream'));
  }
}

/**
 * Flattens the array of chunks accumulated in input.buffer.
 * @private
 */
function _flattenBufferIn () {
  if (this._isStreamInput()) {
    this.options.input.buffer = Buffer.concat(this.options.input.buffer);
  }
}

/**
 * Are we expecting Stream-based input?
 * @private
 * @returns {boolean}
 */
function _isStreamInput () {
  return Array.isArray(this.options.input.buffer);
}

/**
 * Fast access to (uncached) image metadata without decoding any compressed pixel data.
 *
 * This is taken from the header of the input image.
 * It does not include operations, such as resize, to be applied to the output image.
 *
 * A `Promise` is returned when `callback` is not provided.
 *
 * - `format`: Name of decoder used to decompress image data e.g. `jpeg`, `png`, `webp`, `gif`, `svg`
 * - `size`: Total size of image in bytes, for Stream and Buffer input only
 * - `width`: Number of pixels wide (EXIF orientation is not taken into consideration, see example below)
 * - `height`: Number of pixels high (EXIF orientation is not taken into consideration, see example below)
 * - `space`: Name of colour space interpretation e.g. `srgb`, `rgb`, `cmyk`, `lab`, `b-w` [...](https://www.libvips.org/API/current/VipsImage.html#VipsInterpretation)
 * - `channels`: Number of bands e.g. `3` for sRGB, `4` for CMYK
 * - `depth`: Name of pixel depth format e.g. `uchar`, `char`, `ushort`, `float` [...](https://www.libvips.org/API/current/VipsImage.html#VipsBandFormat)
 * - `density`: Number of pixels per inch (DPI), if present
 * - `chromaSubsampling`: String containing JPEG chroma subsampling, `4:2:0` or `4:4:4` for RGB, `4:2:0:4` or `4:4:4:4` for CMYK
 * - `isProgressive`: Boolean indicating whether the image is interlaced using a progressive scan
 * - `pages`: Number of pages/frames contained within the image, with support for TIFF, HEIF, PDF, animated GIF and animated WebP
 * - `pageHeight`: Number of pixels high each page in a multi-page image will be.
 * - `loop`: Number of times to loop an animated image, zero refers to a continuous loop.
 * - `delay`: Delay in ms between each page in an animated image, provided as an array of integers.
 * - `pagePrimary`: Number of the primary page in a HEIF image
 * - `levels`: Details of each level in a multi-level image provided as an array of objects, requires libvips compiled with support for OpenSlide
 * - `subifds`: Number of Sub Image File Directories in an OME-TIFF image
 * - `background`: Default background colour, if present, for PNG (bKGD) and GIF images, either an RGB Object or a single greyscale value
 * - `compression`: The encoder used to compress an HEIF file, `av1` (AVIF) or `hevc` (HEIC)
 * - `resolutionUnit`: The unit of resolution (density), either `inch` or `cm`, if present
 * - `hasProfile`: Boolean indicating the presence of an embedded ICC profile
 * - `hasAlpha`: Boolean indicating the presence of an alpha transparency channel
 * - `orientation`: Number value of the EXIF Orientation header, if present
 * - `exif`: Buffer containing raw EXIF data, if present
 * - `icc`: Buffer containing raw [ICC](https://www.npmjs.com/package/icc) profile data, if present
 * - `iptc`: Buffer containing raw IPTC data, if present
 * - `xmp`: Buffer containing raw XMP data, if present
 * - `tifftagPhotoshop`: Buffer containing raw TIFFTAG_PHOTOSHOP data, if present
 *
 * @example
 * const metadata = await sharp(input).metadata();
 *
 * @example
 * const image = sharp(inputJpg);
 * image
 *   .metadata()
 *   .then(function(metadata) {
 *     return image
 *       .resize(Math.round(metadata.width / 2))
 *       .webp()
 *       .toBuffer();
 *   })
 *   .then(function(data) {
 *     // data contains a WebP image half the width and height of the original JPEG
 *   });
 *
 * @example
 * // Based on EXIF rotation metadata, get the right-side-up width and height:
 *
 * const size = getNormalSize(await sharp(input).metadata());
 *
 * function getNormalSize({ width, height, orientation }) {
 *   return orientation || 0 >= 5
 *     ? { width: height, height: width }
 *     : { width, height };
 * }
 *
 * @param {Function} [callback] - called with the arguments `(err, metadata)`
 * @returns {Promise<Object>|Sharp}
 */
function metadata (callback) {
  if (is.fn(callback)) {
    if (this._isStreamInput()) {
      this.on('finish', () => {
        this._flattenBufferIn();
        sharp.metadata(this.options, callback);
      });
    } else {
      sharp.metadata(this.options, callback);
    }
    return this;
  } else {
    if (this._isStreamInput()) {
      return new Promise((resolve, reject) => {
        this.on('finish', () => {
          this._flattenBufferIn();
          sharp.metadata(this.options, (err, metadata) => {
            if (err) {
              reject(err);
            } else {
              resolve(metadata);
            }
          });
        });
      });
    } else {
      return new Promise((resolve, reject) => {
        sharp.metadata(this.options, (err, metadata) => {
          if (err) {
            reject(err);
          } else {
            resolve(metadata);
          }
        });
      });
    }
  }
}

/**
 * Access to pixel-derived image statistics for every channel in the image.
 * A `Promise` is returned when `callback` is not provided.
 *
 * - `channels`: Array of channel statistics for each channel in the image. Each channel statistic contains
 *     - `min` (minimum value in the channel)
 *     - `max` (maximum value in the channel)
 *     - `sum` (sum of all values in a channel)
 *     - `squaresSum` (sum of squared values in a channel)
 *     - `mean` (mean of the values in a channel)
 *     - `stdev` (standard deviation for the values in a channel)
 *     - `minX` (x-coordinate of one of the pixel where the minimum lies)
 *     - `minY` (y-coordinate of one of the pixel where the minimum lies)
 *     - `maxX` (x-coordinate of one of the pixel where the maximum lies)
 *     - `maxY` (y-coordinate of one of the pixel where the maximum lies)
 * - `isOpaque`: Is the image fully opaque? Will be `true` if the image has no alpha channel or if every pixel is fully opaque.
 * - `entropy`: Histogram-based estimation of greyscale entropy, discarding alpha channel if any.
 * - `sharpness`: Estimation of greyscale sharpness based on the standard deviation of a Laplacian convolution, discarding alpha channel if any.
 * - `dominant`: Object containing most dominant sRGB colour based on a 4096-bin 3D histogram.
 *
 * **Note**: Statistics are derived from the original input image. Any operations performed on the image must first be
 * written to a buffer in order to run `stats` on the result (see third example).
 *
 * @example
 * const image = sharp(inputJpg);
 * image
 *   .stats()
 *   .then(function(stats) {
 *      // stats contains the channel-wise statistics array and the isOpaque value
 *   });
 *
 * @example
 * const { entropy, sharpness, dominant } = await sharp(input).stats();
 * const { r, g, b } = dominant;
 *
 * @example
 * const image = sharp(input);
 * // store intermediate result
 * const part = await image.extract(region).toBuffer();
 * // create new instance to obtain statistics of extracted region
 * const stats = await sharp(part).stats();
 *
 * @param {Function} [callback] - called with the arguments `(err, stats)`
 * @returns {Promise<Object>}
 */
function stats (callback) {
  if (is.fn(callback)) {
    if (this._isStreamInput()) {
      this.on('finish', () => {
        this._flattenBufferIn();
        sharp.stats(this.options, callback);
      });
    } else {
      sharp.stats(this.options, callback);
    }
    return this;
  } else {
    if (this._isStreamInput()) {
      return new Promise((resolve, reject) => {
        this.on('finish', function () {
          this._flattenBufferIn();
          sharp.stats(this.options, (err, stats) => {
            if (err) {
              reject(err);
            } else {
              resolve(stats);
            }
          });
        });
      });
    } else {
      return new Promise((resolve, reject) => {
        sharp.stats(this.options, (err, stats) => {
          if (err) {
            reject(err);
          } else {
            resolve(stats);
          }
        });
      });
    }
  }
}

/**
 * Decorate the Sharp prototype with input-related functions.
 * @private
 */
module.exports = function (Sharp) {
  Object.assign(Sharp.prototype, {
    // Private
    _inputOptionsFromObject,
    _createInputDescriptor,
    _write,
    _flattenBufferIn,
    _isStreamInput,
    // Public
    metadata,
    stats
  });
};


/***/ }),

/***/ 768:
/***/ ((module) => {

"use strict";


/**
 * Is this value defined and not null?
 * @private
 */
const defined = function (val) {
  return typeof val !== 'undefined' && val !== null;
};

/**
 * Is this value an object?
 * @private
 */
const object = function (val) {
  return typeof val === 'object';
};

/**
 * Is this value a plain object?
 * @private
 */
const plainObject = function (val) {
  return Object.prototype.toString.call(val) === '[object Object]';
};

/**
 * Is this value a function?
 * @private
 */
const fn = function (val) {
  return typeof val === 'function';
};

/**
 * Is this value a boolean?
 * @private
 */
const bool = function (val) {
  return typeof val === 'boolean';
};

/**
 * Is this value a Buffer object?
 * @private
 */
const buffer = function (val) {
  return val instanceof Buffer;
};

/**
 * Is this value a typed array object?. E.g. Uint8Array or Uint8ClampedArray?
 * @private
 */
const typedArray = function (val) {
  if (defined(val)) {
    switch (val.constructor) {
      case Uint8Array:
      case Uint8ClampedArray:
      case Int8Array:
      case Uint16Array:
      case Int16Array:
      case Uint32Array:
      case Int32Array:
      case Float32Array:
      case Float64Array:
        return true;
    }
  }

  return false;
};

/**
 * Is this value a non-empty string?
 * @private
 */
const string = function (val) {
  return typeof val === 'string' && val.length > 0;
};

/**
 * Is this value a real number?
 * @private
 */
const number = function (val) {
  return typeof val === 'number' && !Number.isNaN(val);
};

/**
 * Is this value an integer?
 * @private
 */
const integer = function (val) {
  return Number.isInteger(val);
};

/**
 * Is this value within an inclusive given range?
 * @private
 */
const inRange = function (val, min, max) {
  return val >= min && val <= max;
};

/**
 * Is this value within the elements of an array?
 * @private
 */
const inArray = function (val, list) {
  return list.includes(val);
};

/**
 * Create an Error with a message relating to an invalid parameter.
 *
 * @param {string} name - parameter name.
 * @param {string} expected - description of the type/value/range expected.
 * @param {*} actual - the value received.
 * @returns {Error} Containing the formatted message.
 * @private
 */
const invalidParameterError = function (name, expected, actual) {
  return new Error(
    `Expected ${expected} for ${name} but received ${actual} of type ${typeof actual}`
  );
};

module.exports = {
  defined: defined,
  object: object,
  plainObject: plainObject,
  fn: fn,
  bool: bool,
  buffer: buffer,
  typedArray: typedArray,
  string: string,
  number: number,
  integer: integer,
  inRange: inRange,
  inArray: inArray,
  invalidParameterError: invalidParameterError
};


/***/ }),

/***/ 701:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


const fs = __nccwpck_require__(147);
const os = __nccwpck_require__(37);
const path = __nccwpck_require__(17);
const spawnSync = (__nccwpck_require__(81).spawnSync);
const semverCoerce = __nccwpck_require__(73);
const semverGreaterThanOrEqualTo = __nccwpck_require__(343);

const platform = __nccwpck_require__(998);
const { config } = __nccwpck_require__(598);

const env = process.env;
const minimumLibvipsVersionLabelled = env.npm_package_config_libvips || /* istanbul ignore next */
  config.libvips;
const minimumLibvipsVersion = semverCoerce(minimumLibvipsVersionLabelled).version;

const spawnSyncOptions = {
  encoding: 'utf8',
  shell: true
};

const vendorPath = __nccwpck_require__.ab + "vendor/" + minimumLibvipsVersion + '/' + platform();

const mkdirSync = function (dirPath) {
  try {
    fs.mkdirSync(dirPath, { recursive: true });
  } catch (err) {
    /* istanbul ignore next */
    if (err.code !== 'EEXIST') {
      throw err;
    }
  }
};

const cachePath = function () {
  const npmCachePath = env.npm_config_cache || /* istanbul ignore next */
    (env.APPDATA ? path.join(env.APPDATA, 'npm-cache') : path.join(os.homedir(), '.npm'));
  mkdirSync(npmCachePath);
  const libvipsCachePath = path.join(npmCachePath, '_libvips');
  mkdirSync(libvipsCachePath);
  return libvipsCachePath;
};

const integrity = function (platformAndArch) {
  return env[`npm_package_config_integrity_${platformAndArch.replace('-', '_')}`] || config.integrity[platformAndArch];
};

const log = function (item) {
  if (item instanceof Error) {
    console.error(`sharp: Installation error: ${item.message}`);
  } else {
    console.log(`sharp: ${item}`);
  }
};

const isRosetta = function () {
  /* istanbul ignore next */
  if (process.platform === 'darwin' && process.arch === 'x64') {
    const translated = spawnSync('sysctl sysctl.proc_translated', spawnSyncOptions).stdout;
    return (translated || '').trim() === 'sysctl.proc_translated: 1';
  }
  return false;
};

const globalLibvipsVersion = function () {
  if (process.platform !== 'win32') {
    const globalLibvipsVersion = spawnSync('pkg-config --modversion vips-cpp', {
      ...spawnSyncOptions,
      env: {
        ...env,
        PKG_CONFIG_PATH: pkgConfigPath()
      }
    }).stdout;
    /* istanbul ignore next */
    return (globalLibvipsVersion || '').trim();
  } else {
    return '';
  }
};

const hasVendoredLibvips = function () {
  return fs.existsSync(vendorPath);
};

/* istanbul ignore next */
const removeVendoredLibvips = function () {
  const rm = fs.rmSync ? fs.rmSync : fs.rmdirSync;
  rm(vendorPath, { recursive: true, maxRetries: 3, force: true });
};

const pkgConfigPath = function () {
  if (process.platform !== 'win32') {
    const brewPkgConfigPath = spawnSync(
      'which brew >/dev/null 2>&1 && brew environment --plain | grep PKG_CONFIG_LIBDIR | cut -d" " -f2',
      spawnSyncOptions
    ).stdout || '';
    return [
      brewPkgConfigPath.trim(),
      env.PKG_CONFIG_PATH,
      '/usr/local/lib/pkgconfig',
      '/usr/lib/pkgconfig',
      '/usr/local/libdata/pkgconfig',
      '/usr/libdata/pkgconfig'
    ].filter(Boolean).join(':');
  } else {
    return '';
  }
};

const useGlobalLibvips = function () {
  if (Boolean(env.SHARP_IGNORE_GLOBAL_LIBVIPS) === true) {
    return false;
  }
  /* istanbul ignore next */
  if (isRosetta()) {
    return false;
  }
  const globalVipsVersion = globalLibvipsVersion();
  return !!globalVipsVersion && /* istanbul ignore next */
    semverGreaterThanOrEqualTo(globalVipsVersion, minimumLibvipsVersion);
};

module.exports = {
  minimumLibvipsVersion,
  minimumLibvipsVersionLabelled,
  cachePath,
  integrity,
  log,
  globalLibvipsVersion,
  hasVendoredLibvips,
  removeVendoredLibvips,
  pkgConfigPath,
  useGlobalLibvips,
  mkdirSync
};


/***/ }),

/***/ 946:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


const color = __nccwpck_require__(177);
const is = __nccwpck_require__(768);

/**
 * Rotate the output image by either an explicit angle
 * or auto-orient based on the EXIF `Orientation` tag.
 *
 * If an angle is provided, it is converted to a valid positive degree rotation.
 * For example, `-450` will produce a 270deg rotation.
 *
 * When rotating by an angle other than a multiple of 90,
 * the background colour can be provided with the `background` option.
 *
 * If no angle is provided, it is determined from the EXIF data.
 * Mirroring is supported and may infer the use of a flip operation.
 *
 * The use of `rotate` implies the removal of the EXIF `Orientation` tag, if any.
 *
 * Method order is important when both rotating and extracting regions,
 * for example `rotate(x).extract(y)` will produce a different result to `extract(y).rotate(x)`.
 *
 * @example
 * const pipeline = sharp()
 *   .rotate()
 *   .resize(null, 200)
 *   .toBuffer(function (err, outputBuffer, info) {
 *     // outputBuffer contains 200px high JPEG image data,
 *     // auto-rotated using EXIF Orientation tag
 *     // info.width and info.height contain the dimensions of the resized image
 *   });
 * readableStream.pipe(pipeline);
 *
 * @param {number} [angle=auto] angle of rotation.
 * @param {Object} [options] - if present, is an Object with optional attributes.
 * @param {string|Object} [options.background="#000000"] parsed by the [color](https://www.npmjs.org/package/color) module to extract values for red, green, blue and alpha.
 * @returns {Sharp}
 * @throws {Error} Invalid parameters
 */
function rotate (angle, options) {
  if (!is.defined(angle)) {
    this.options.useExifOrientation = true;
  } else if (is.integer(angle) && !(angle % 90)) {
    this.options.angle = angle;
  } else if (is.number(angle)) {
    this.options.rotationAngle = angle;
    if (is.object(options) && options.background) {
      const backgroundColour = color(options.background);
      this.options.rotationBackground = [
        backgroundColour.red(),
        backgroundColour.green(),
        backgroundColour.blue(),
        Math.round(backgroundColour.alpha() * 255)
      ];
    }
  } else {
    throw is.invalidParameterError('angle', 'numeric', angle);
  }
  return this;
}

/**
 * Flip the image about the vertical Y axis. This always occurs after rotation, if any.
 * The use of `flip` implies the removal of the EXIF `Orientation` tag, if any.
 *
 * @example
 * const output = await sharp(input).flip().toBuffer();
 *
 * @param {Boolean} [flip=true]
 * @returns {Sharp}
 */
function flip (flip) {
  this.options.flip = is.bool(flip) ? flip : true;
  return this;
}

/**
 * Flop the image about the horizontal X axis. This always occurs after rotation, if any.
 * The use of `flop` implies the removal of the EXIF `Orientation` tag, if any.
 *
 * @example
 * const output = await sharp(input).flop().toBuffer();
 *
 * @param {Boolean} [flop=true]
 * @returns {Sharp}
 */
function flop (flop) {
  this.options.flop = is.bool(flop) ? flop : true;
  return this;
}

/**
 * Perform an affine transform on an image. This operation will always occur after resizing, extraction and rotation, if any.
 *
 * You must provide an array of length 4 or a 2x2 affine transformation matrix.
 * By default, new pixels are filled with a black background. You can provide a background color with the `background` option.
 * A particular interpolator may also be specified. Set the `interpolator` option to an attribute of the `sharp.interpolator` Object e.g. `sharp.interpolator.nohalo`.
 *
 * In the case of a 2x2 matrix, the transform is:
 * - X = `matrix[0, 0]` \* (x + `idx`) + `matrix[0, 1]` \* (y + `idy`) + `odx`
 * - Y = `matrix[1, 0]` \* (x + `idx`) + `matrix[1, 1]` \* (y + `idy`) + `ody`
 *
 * where:
 * - x and y are the coordinates in input image.
 * - X and Y are the coordinates in output image.
 * - (0,0) is the upper left corner.
 *
 * @since 0.27.0
 *
 * @example
 * const pipeline = sharp()
 *   .affine([[1, 0.3], [0.1, 0.7]], {
 *      background: 'white',
 *      interpolate: sharp.interpolators.nohalo
 *   })
 *   .toBuffer((err, outputBuffer, info) => {
 *      // outputBuffer contains the transformed image
 *      // info.width and info.height contain the new dimensions
 *   });
 *
 * inputStream
 *   .pipe(pipeline);
 *
 * @param {Array<Array<number>>|Array<number>} matrix - affine transformation matrix
 * @param {Object} [options] - if present, is an Object with optional attributes.
 * @param {String|Object} [options.background="#000000"] - parsed by the [color](https://www.npmjs.org/package/color) module to extract values for red, green, blue and alpha.
 * @param {Number} [options.idx=0] - input horizontal offset
 * @param {Number} [options.idy=0] - input vertical offset
 * @param {Number} [options.odx=0] - output horizontal offset
 * @param {Number} [options.ody=0] - output vertical offset
 * @param {String} [options.interpolator=sharp.interpolators.bicubic] - interpolator
 * @returns {Sharp}
 * @throws {Error} Invalid parameters
 */
function affine (matrix, options) {
  const flatMatrix = [].concat(...matrix);
  if (flatMatrix.length === 4 && flatMatrix.every(is.number)) {
    this.options.affineMatrix = flatMatrix;
  } else {
    throw is.invalidParameterError('matrix', '1x4 or 2x2 array', matrix);
  }

  if (is.defined(options)) {
    if (is.object(options)) {
      this._setBackgroundColourOption('affineBackground', options.background);
      if (is.defined(options.idx)) {
        if (is.number(options.idx)) {
          this.options.affineIdx = options.idx;
        } else {
          throw is.invalidParameterError('options.idx', 'number', options.idx);
        }
      }
      if (is.defined(options.idy)) {
        if (is.number(options.idy)) {
          this.options.affineIdy = options.idy;
        } else {
          throw is.invalidParameterError('options.idy', 'number', options.idy);
        }
      }
      if (is.defined(options.odx)) {
        if (is.number(options.odx)) {
          this.options.affineOdx = options.odx;
        } else {
          throw is.invalidParameterError('options.odx', 'number', options.odx);
        }
      }
      if (is.defined(options.ody)) {
        if (is.number(options.ody)) {
          this.options.affineOdy = options.ody;
        } else {
          throw is.invalidParameterError('options.ody', 'number', options.ody);
        }
      }
      if (is.defined(options.interpolator)) {
        if (is.inArray(options.interpolator, Object.values(this.constructor.interpolators))) {
          this.options.affineInterpolator = options.interpolator;
        } else {
          throw is.invalidParameterError('options.interpolator', 'valid interpolator name', options.interpolator);
        }
      }
    } else {
      throw is.invalidParameterError('options', 'object', options);
    }
  }

  return this;
}

/**
 * Sharpen the image.
 * When used without parameters, performs a fast, mild sharpen of the output image.
 * When a `sigma` is provided, performs a slower, more accurate sharpen of the L channel in the LAB colour space.
 * Separate control over the level of sharpening in "flat" and "jagged" areas is available.
 *
 * See {@link https://www.libvips.org/API/current/libvips-convolution.html#vips-sharpen|libvips sharpen} operation.
 *
 * @example
 * const data = await sharp(input).sharpen().toBuffer();
 *
 * @example
 * const data = await sharp(input).sharpen({ sigma: 2 }).toBuffer();
 *
 * @example
 * const data = await sharp(input)
 *   .sharpen({
 *     sigma: 2,
 *     m1: 0
 *     m2: 3,
 *     x1: 3,
 *     y2: 15,
 *     y3: 15,
 *   })
 *   .toBuffer();
 *
 * @param {Object|number} [options] - if present, is an Object with attributes or (deprecated) a number for `options.sigma`.
 * @param {number} [options.sigma] - the sigma of the Gaussian mask, where `sigma = 1 + radius / 2`.
 * @param {number} [options.m1=1.0] - the level of sharpening to apply to "flat" areas.
 * @param {number} [options.m2=2.0] - the level of sharpening to apply to "jagged" areas.
 * @param {number} [options.x1=2.0] - threshold between "flat" and "jagged"
 * @param {number} [options.y2=10.0] - maximum amount of brightening.
 * @param {number} [options.y3=20.0] - maximum amount of darkening.
 * @param {number} [flat] - (deprecated) see `options.m1`.
 * @param {number} [jagged] - (deprecated) see `options.m2`.
 * @returns {Sharp}
 * @throws {Error} Invalid parameters
 */
function sharpen (options, flat, jagged) {
  if (!is.defined(options)) {
    // No arguments: default to mild sharpen
    this.options.sharpenSigma = -1;
  } else if (is.bool(options)) {
    // Deprecated boolean argument: apply mild sharpen?
    this.options.sharpenSigma = options ? -1 : 0;
  } else if (is.number(options) && is.inRange(options, 0.01, 10000)) {
    // Deprecated numeric argument: specific sigma
    this.options.sharpenSigma = options;
    // Deprecated control over flat areas
    if (is.defined(flat)) {
      if (is.number(flat) && is.inRange(flat, 0, 10000)) {
        this.options.sharpenM1 = flat;
      } else {
        throw is.invalidParameterError('flat', 'number between 0 and 10000', flat);
      }
    }
    // Deprecated control over jagged areas
    if (is.defined(jagged)) {
      if (is.number(jagged) && is.inRange(jagged, 0, 10000)) {
        this.options.sharpenM2 = jagged;
      } else {
        throw is.invalidParameterError('jagged', 'number between 0 and 10000', jagged);
      }
    }
  } else if (is.plainObject(options)) {
    if (is.number(options.sigma) && is.inRange(options.sigma, 0.01, 10000)) {
      this.options.sharpenSigma = options.sigma;
    } else {
      throw is.invalidParameterError('options.sigma', 'number between 0.01 and 10000', options.sigma);
    }
    if (is.defined(options.m1)) {
      if (is.number(options.m1) && is.inRange(options.m1, 0, 10000)) {
        this.options.sharpenM1 = options.m1;
      } else {
        throw is.invalidParameterError('options.m1', 'number between 0 and 10000', options.m1);
      }
    }
    if (is.defined(options.m2)) {
      if (is.number(options.m2) && is.inRange(options.m2, 0, 10000)) {
        this.options.sharpenM2 = options.m2;
      } else {
        throw is.invalidParameterError('options.m2', 'number between 0 and 10000', options.m2);
      }
    }
    if (is.defined(options.x1)) {
      if (is.number(options.x1) && is.inRange(options.x1, 0, 10000)) {
        this.options.sharpenX1 = options.x1;
      } else {
        throw is.invalidParameterError('options.x1', 'number between 0 and 10000', options.x1);
      }
    }
    if (is.defined(options.y2)) {
      if (is.number(options.y2) && is.inRange(options.y2, 0, 10000)) {
        this.options.sharpenY2 = options.y2;
      } else {
        throw is.invalidParameterError('options.y2', 'number between 0 and 10000', options.y2);
      }
    }
    if (is.defined(options.y3)) {
      if (is.number(options.y3) && is.inRange(options.y3, 0, 10000)) {
        this.options.sharpenY3 = options.y3;
      } else {
        throw is.invalidParameterError('options.y3', 'number between 0 and 10000', options.y3);
      }
    }
  } else {
    throw is.invalidParameterError('sigma', 'number between 0.01 and 10000', options);
  }
  return this;
}

/**
 * Apply median filter.
 * When used without parameters the default window is 3x3.
 *
 * @example
 * const output = await sharp(input).median().toBuffer();
 *
 * @example
 * const output = await sharp(input).median(5).toBuffer();
 *
 * @param {number} [size=3] square mask size: size x size
 * @returns {Sharp}
 * @throws {Error} Invalid parameters
 */
function median (size) {
  if (!is.defined(size)) {
    // No arguments: default to 3x3
    this.options.medianSize = 3;
  } else if (is.integer(size) && is.inRange(size, 1, 1000)) {
    // Numeric argument: specific sigma
    this.options.medianSize = size;
  } else {
    throw is.invalidParameterError('size', 'integer between 1 and 1000', size);
  }
  return this;
}

/**
 * Blur the image.
 *
 * When used without parameters, performs a fast 3x3 box blur (equivalent to a box linear filter).
 *
 * When a `sigma` is provided, performs a slower, more accurate Gaussian blur.
 *
 * @example
 * const boxBlurred = await sharp(input)
 *   .blur()
 *   .toBuffer();
 *
 * @example
 * const gaussianBlurred = await sharp(input)
 *   .blur(5)
 *   .toBuffer();
 *
 * @param {number} [sigma] a value between 0.3 and 1000 representing the sigma of the Gaussian mask, where `sigma = 1 + radius / 2`.
 * @returns {Sharp}
 * @throws {Error} Invalid parameters
 */
function blur (sigma) {
  if (!is.defined(sigma)) {
    // No arguments: default to mild blur
    this.options.blurSigma = -1;
  } else if (is.bool(sigma)) {
    // Boolean argument: apply mild blur?
    this.options.blurSigma = sigma ? -1 : 0;
  } else if (is.number(sigma) && is.inRange(sigma, 0.3, 1000)) {
    // Numeric argument: specific sigma
    this.options.blurSigma = sigma;
  } else {
    throw is.invalidParameterError('sigma', 'number between 0.3 and 1000', sigma);
  }
  return this;
}

/**
 * Merge alpha transparency channel, if any, with a background, then remove the alpha channel.
 *
 * See also {@link /api-channel#removealpha|removeAlpha}.
 *
 * @example
 * await sharp(rgbaInput)
 *   .flatten({ background: '#F0A703' })
 *   .toBuffer();
 *
 * @param {Object} [options]
 * @param {string|Object} [options.background={r: 0, g: 0, b: 0}] - background colour, parsed by the [color](https://www.npmjs.org/package/color) module, defaults to black.
 * @returns {Sharp}
 */
function flatten (options) {
  this.options.flatten = is.bool(options) ? options : true;
  if (is.object(options)) {
    this._setBackgroundColourOption('flattenBackground', options.background);
  }
  return this;
}

/**
 * Apply a gamma correction by reducing the encoding (darken) pre-resize at a factor of `1/gamma`
 * then increasing the encoding (brighten) post-resize at a factor of `gamma`.
 * This can improve the perceived brightness of a resized image in non-linear colour spaces.
 * JPEG and WebP input images will not take advantage of the shrink-on-load performance optimisation
 * when applying a gamma correction.
 *
 * Supply a second argument to use a different output gamma value, otherwise the first value is used in both cases.
 *
 * @param {number} [gamma=2.2] value between 1.0 and 3.0.
 * @param {number} [gammaOut] value between 1.0 and 3.0. (optional, defaults to same as `gamma`)
 * @returns {Sharp}
 * @throws {Error} Invalid parameters
 */
function gamma (gamma, gammaOut) {
  if (!is.defined(gamma)) {
    // Default gamma correction of 2.2 (sRGB)
    this.options.gamma = 2.2;
  } else if (is.number(gamma) && is.inRange(gamma, 1, 3)) {
    this.options.gamma = gamma;
  } else {
    throw is.invalidParameterError('gamma', 'number between 1.0 and 3.0', gamma);
  }
  if (!is.defined(gammaOut)) {
    // Default gamma correction for output is same as input
    this.options.gammaOut = this.options.gamma;
  } else if (is.number(gammaOut) && is.inRange(gammaOut, 1, 3)) {
    this.options.gammaOut = gammaOut;
  } else {
    throw is.invalidParameterError('gammaOut', 'number between 1.0 and 3.0', gammaOut);
  }
  return this;
}

/**
 * Produce the "negative" of the image.
 *
 * @example
 * const output = await sharp(input)
 *   .negate()
 *   .toBuffer();
 *
 * @example
 * const output = await sharp(input)
 *   .negate({ alpha: false })
 *   .toBuffer();
 *
 * @param {Object} [options]
 * @param {Boolean} [options.alpha=true] Whether or not to negate any alpha channel
 * @returns {Sharp}
 */
function negate (options) {
  this.options.negate = is.bool(options) ? options : true;
  if (is.plainObject(options) && 'alpha' in options) {
    if (!is.bool(options.alpha)) {
      throw is.invalidParameterError('alpha', 'should be boolean value', options.alpha);
    } else {
      this.options.negateAlpha = options.alpha;
    }
  }
  return this;
}

/**
 * Enhance output image contrast by stretching its luminance to cover the full dynamic range.
 *
 * @example
 * const output = await sharp(input).normalise().toBuffer();
 *
 * @param {Boolean} [normalise=true]
 * @returns {Sharp}
 */
function normalise (normalise) {
  this.options.normalise = is.bool(normalise) ? normalise : true;
  return this;
}

/**
 * Alternative spelling of normalise.
 *
 * @example
 * const output = await sharp(input).normalize().toBuffer();
 *
 * @param {Boolean} [normalize=true]
 * @returns {Sharp}
 */
function normalize (normalize) {
  return this.normalise(normalize);
}

/**
 * Perform contrast limiting adaptive histogram equalization
 * {@link https://en.wikipedia.org/wiki/Adaptive_histogram_equalization#Contrast_Limited_AHE|CLAHE}.
 *
 * This will, in general, enhance the clarity of the image by bringing out darker details.
 *
 * @since 0.28.3
 *
 * @example
 * const output = await sharp(input)
 *   .clahe({
 *     width: 3,
 *     height: 3,
 *   })
 *   .toBuffer();
 *
 * @param {Object} options
 * @param {number} options.width - integer width of the region in pixels.
 * @param {number} options.height - integer height of the region in pixels.
 * @param {number} [options.maxSlope=3] - maximum value for the slope of the
 *  cumulative histogram. A value of 0 disables contrast limiting. Valid values
 *  are integers in the range 0-100 (inclusive)
 * @returns {Sharp}
 * @throws {Error} Invalid parameters
 */
function clahe (options) {
  if (!is.plainObject(options)) {
    throw is.invalidParameterError('options', 'plain object', options);
  }
  if (!('width' in options) || !is.integer(options.width) || options.width <= 0) {
    throw is.invalidParameterError('width', 'integer above zero', options.width);
  } else {
    this.options.claheWidth = options.width;
  }
  if (!('height' in options) || !is.integer(options.height) || options.height <= 0) {
    throw is.invalidParameterError('height', 'integer above zero', options.height);
  } else {
    this.options.claheHeight = options.height;
  }
  if (!is.defined(options.maxSlope)) {
    this.options.claheMaxSlope = 3;
  } else if (!is.integer(options.maxSlope) || options.maxSlope < 0 || options.maxSlope > 100) {
    throw is.invalidParameterError('maxSlope', 'integer 0-100', options.maxSlope);
  } else {
    this.options.claheMaxSlope = options.maxSlope;
  }
  return this;
}

/**
 * Convolve the image with the specified kernel.
 *
 * @example
 * sharp(input)
 *   .convolve({
 *     width: 3,
 *     height: 3,
 *     kernel: [-1, 0, 1, -2, 0, 2, -1, 0, 1]
 *   })
 *   .raw()
 *   .toBuffer(function(err, data, info) {
 *     // data contains the raw pixel data representing the convolution
 *     // of the input image with the horizontal Sobel operator
 *   });
 *
 * @param {Object} kernel
 * @param {number} kernel.width - width of the kernel in pixels.
 * @param {number} kernel.height - height of the kernel in pixels.
 * @param {Array<number>} kernel.kernel - Array of length `width*height` containing the kernel values.
 * @param {number} [kernel.scale=sum] - the scale of the kernel in pixels.
 * @param {number} [kernel.offset=0] - the offset of the kernel in pixels.
 * @returns {Sharp}
 * @throws {Error} Invalid parameters
 */
function convolve (kernel) {
  if (!is.object(kernel) || !Array.isArray(kernel.kernel) ||
      !is.integer(kernel.width) || !is.integer(kernel.height) ||
      !is.inRange(kernel.width, 3, 1001) || !is.inRange(kernel.height, 3, 1001) ||
      kernel.height * kernel.width !== kernel.kernel.length
  ) {
    // must pass in a kernel
    throw new Error('Invalid convolution kernel');
  }
  // Default scale is sum of kernel values
  if (!is.integer(kernel.scale)) {
    kernel.scale = kernel.kernel.reduce(function (a, b) {
      return a + b;
    }, 0);
  }
  // Clip scale to a minimum value of 1
  if (kernel.scale < 1) {
    kernel.scale = 1;
  }
  if (!is.integer(kernel.offset)) {
    kernel.offset = 0;
  }
  this.options.convKernel = kernel;
  return this;
}

/**
 * Any pixel value greater than or equal to the threshold value will be set to 255, otherwise it will be set to 0.
 * @param {number} [threshold=128] - a value in the range 0-255 representing the level at which the threshold will be applied.
 * @param {Object} [options]
 * @param {Boolean} [options.greyscale=true] - convert to single channel greyscale.
 * @param {Boolean} [options.grayscale=true] - alternative spelling for greyscale.
 * @returns {Sharp}
 * @throws {Error} Invalid parameters
 */
function threshold (threshold, options) {
  if (!is.defined(threshold)) {
    this.options.threshold = 128;
  } else if (is.bool(threshold)) {
    this.options.threshold = threshold ? 128 : 0;
  } else if (is.integer(threshold) && is.inRange(threshold, 0, 255)) {
    this.options.threshold = threshold;
  } else {
    throw is.invalidParameterError('threshold', 'integer between 0 and 255', threshold);
  }
  if (!is.object(options) || options.greyscale === true || options.grayscale === true) {
    this.options.thresholdGrayscale = true;
  } else {
    this.options.thresholdGrayscale = false;
  }
  return this;
}

/**
 * Perform a bitwise boolean operation with operand image.
 *
 * This operation creates an output image where each pixel is the result of
 * the selected bitwise boolean `operation` between the corresponding pixels of the input images.
 *
 * @param {Buffer|string} operand - Buffer containing image data or string containing the path to an image file.
 * @param {string} operator - one of `and`, `or` or `eor` to perform that bitwise operation, like the C logic operators `&`, `|` and `^` respectively.
 * @param {Object} [options]
 * @param {Object} [options.raw] - describes operand when using raw pixel data.
 * @param {number} [options.raw.width]
 * @param {number} [options.raw.height]
 * @param {number} [options.raw.channels]
 * @returns {Sharp}
 * @throws {Error} Invalid parameters
 */
function boolean (operand, operator, options) {
  this.options.boolean = this._createInputDescriptor(operand, options);
  if (is.string(operator) && is.inArray(operator, ['and', 'or', 'eor'])) {
    this.options.booleanOp = operator;
  } else {
    throw is.invalidParameterError('operator', 'one of: and, or, eor', operator);
  }
  return this;
}

/**
 * Apply the linear formula a * input + b to the image (levels adjustment)
 * @param {number} [a=1.0] multiplier
 * @param {number} [b=0.0] offset
 * @returns {Sharp}
 * @throws {Error} Invalid parameters
 */
function linear (a, b) {
  if (!is.defined(a)) {
    this.options.linearA = 1.0;
  } else if (is.number(a)) {
    this.options.linearA = a;
  } else {
    throw is.invalidParameterError('a', 'numeric', a);
  }
  if (!is.defined(b)) {
    this.options.linearB = 0.0;
  } else if (is.number(b)) {
    this.options.linearB = b;
  } else {
    throw is.invalidParameterError('b', 'numeric', b);
  }
  return this;
}

/**
 * Recomb the image with the specified matrix.
 *
 * @since 0.21.1
 *
 * @example
 * sharp(input)
 *   .recomb([
 *    [0.3588, 0.7044, 0.1368],
 *    [0.2990, 0.5870, 0.1140],
 *    [0.2392, 0.4696, 0.0912],
 *   ])
 *   .raw()
 *   .toBuffer(function(err, data, info) {
 *     // data contains the raw pixel data after applying the recomb
 *     // With this example input, a sepia filter has been applied
 *   });
 *
 * @param {Array<Array<number>>} inputMatrix - 3x3 Recombination matrix
 * @returns {Sharp}
 * @throws {Error} Invalid parameters
 */
function recomb (inputMatrix) {
  if (!Array.isArray(inputMatrix) || inputMatrix.length !== 3 ||
      inputMatrix[0].length !== 3 ||
      inputMatrix[1].length !== 3 ||
      inputMatrix[2].length !== 3
  ) {
    // must pass in a kernel
    throw new Error('Invalid recombination matrix');
  }
  this.options.recombMatrix = [
    inputMatrix[0][0], inputMatrix[0][1], inputMatrix[0][2],
    inputMatrix[1][0], inputMatrix[1][1], inputMatrix[1][2],
    inputMatrix[2][0], inputMatrix[2][1], inputMatrix[2][2]
  ].map(Number);
  return this;
}

/**
 * Transforms the image using brightness, saturation, hue rotation, and lightness.
 * Brightness and lightness both operate on luminance, with the difference being that
 * brightness is multiplicative whereas lightness is additive.
 *
 * @since 0.22.1
 *
 * @example
 * // increase brightness by a factor of 2
 * const output = await sharp(input)
 *   .modulate({
 *     brightness: 2
 *   })
 *   .toBuffer();
 *
 * @example
 * // hue-rotate by 180 degrees
 * const output = await sharp(input)
 *   .modulate({
 *     hue: 180
 *   })
 *   .toBuffer();
 *
 * @example
 * // increase lightness by +50
 * const output = await sharp(input)
 *   .modulate({
 *     lightness: 50
 *   })
 *   .toBuffer();
 *
 * @example
 * // decreate brightness and saturation while also hue-rotating by 90 degrees
 * const output = await sharp(input)
 *   .modulate({
 *     brightness: 0.5,
 *     saturation: 0.5,
 *     hue: 90,
 *   })
 *   .toBuffer();
 *
 * @param {Object} [options]
 * @param {number} [options.brightness] Brightness multiplier
 * @param {number} [options.saturation] Saturation multiplier
 * @param {number} [options.hue] Degrees for hue rotation
 * @param {number} [options.lightness] Lightness addend
 * @returns {Sharp}
 */
function modulate (options) {
  if (!is.plainObject(options)) {
    throw is.invalidParameterError('options', 'plain object', options);
  }
  if ('brightness' in options) {
    if (is.number(options.brightness) && options.brightness >= 0) {
      this.options.brightness = options.brightness;
    } else {
      throw is.invalidParameterError('brightness', 'number above zero', options.brightness);
    }
  }
  if ('saturation' in options) {
    if (is.number(options.saturation) && options.saturation >= 0) {
      this.options.saturation = options.saturation;
    } else {
      throw is.invalidParameterError('saturation', 'number above zero', options.saturation);
    }
  }
  if ('hue' in options) {
    if (is.integer(options.hue)) {
      this.options.hue = options.hue % 360;
    } else {
      throw is.invalidParameterError('hue', 'number', options.hue);
    }
  }
  if ('lightness' in options) {
    if (is.number(options.lightness)) {
      this.options.lightness = options.lightness;
    } else {
      throw is.invalidParameterError('lightness', 'number', options.lightness);
    }
  }
  return this;
}

/**
 * Decorate the Sharp prototype with operation-related functions.
 * @private
 */
module.exports = function (Sharp) {
  Object.assign(Sharp.prototype, {
    rotate,
    flip,
    flop,
    affine,
    sharpen,
    median,
    blur,
    flatten,
    gamma,
    negate,
    normalise,
    normalize,
    clahe,
    convolve,
    threshold,
    boolean,
    linear,
    recomb,
    modulate
  });
};


/***/ }),

/***/ 280:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


const path = __nccwpck_require__(17);
const is = __nccwpck_require__(768);
const sharp = __nccwpck_require__(382);

const formats = new Map([
  ['heic', 'heif'],
  ['heif', 'heif'],
  ['avif', 'avif'],
  ['jpeg', 'jpeg'],
  ['jpg', 'jpeg'],
  ['png', 'png'],
  ['raw', 'raw'],
  ['tiff', 'tiff'],
  ['tif', 'tiff'],
  ['webp', 'webp'],
  ['gif', 'gif'],
  ['jp2', 'jp2'],
  ['jpx', 'jp2'],
  ['j2k', 'jp2'],
  ['j2c', 'jp2']
]);

const errJp2Save = new Error('JP2 output requires libvips with support for OpenJPEG');

const bitdepthFromColourCount = (colours) => 1 << 31 - Math.clz32(Math.ceil(Math.log2(colours)));

/**
 * Write output image data to a file.
 *
 * If an explicit output format is not selected, it will be inferred from the extension,
 * with JPEG, PNG, WebP, AVIF, TIFF, GIF, DZI, and libvips' V format supported.
 * Note that raw pixel data is only supported for buffer output.
 *
 * By default all metadata will be removed, which includes EXIF-based orientation.
 * See {@link withMetadata} for control over this.
 *
 * The caller is responsible for ensuring directory structures and permissions exist.
 *
 * A `Promise` is returned when `callback` is not provided.
 *
 * @example
 * sharp(input)
 *   .toFile('output.png', (err, info) => { ... });
 *
 * @example
 * sharp(input)
 *   .toFile('output.png')
 *   .then(info => { ... })
 *   .catch(err => { ... });
 *
 * @param {string} fileOut - the path to write the image data to.
 * @param {Function} [callback] - called on completion with two arguments `(err, info)`.
 * `info` contains the output image `format`, `size` (bytes), `width`, `height`,
 * `channels` and `premultiplied` (indicating if premultiplication was used).
 * When using a crop strategy also contains `cropOffsetLeft` and `cropOffsetTop`.
 * @returns {Promise<Object>} - when no callback is provided
 * @throws {Error} Invalid parameters
 */
function toFile (fileOut, callback) {
  let err;
  if (!is.string(fileOut)) {
    err = new Error('Missing output file path');
  } else if (is.string(this.options.input.file) && path.resolve(this.options.input.file) === path.resolve(fileOut)) {
    err = new Error('Cannot use same file for input and output');
  }
  if (err) {
    if (is.fn(callback)) {
      callback(err);
    } else {
      return Promise.reject(err);
    }
  } else {
    this.options.fileOut = fileOut;
    return this._pipeline(callback);
  }
  return this;
}

/**
 * Write output to a Buffer.
 * JPEG, PNG, WebP, AVIF, TIFF, GIF and raw pixel data output are supported.
 *
 * Use {@link toFormat} or one of the format-specific functions such as {@link jpeg}, {@link png} etc. to set the output format.
 *
 * If no explicit format is set, the output format will match the input image, except SVG input which becomes PNG output.
 *
 * By default all metadata will be removed, which includes EXIF-based orientation.
 * See {@link withMetadata} for control over this.
 *
 * `callback`, if present, gets three arguments `(err, data, info)` where:
 * - `err` is an error, if any.
 * - `data` is the output image data.
 * - `info` contains the output image `format`, `size` (bytes), `width`, `height`,
 * `channels` and `premultiplied` (indicating if premultiplication was used).
 * When using a crop strategy also contains `cropOffsetLeft` and `cropOffsetTop`.
 *
 * A `Promise` is returned when `callback` is not provided.
 *
 * @example
 * sharp(input)
 *   .toBuffer((err, data, info) => { ... });
 *
 * @example
 * sharp(input)
 *   .toBuffer()
 *   .then(data => { ... })
 *   .catch(err => { ... });
 *
 * @example
 * sharp(input)
 *   .png()
 *   .toBuffer({ resolveWithObject: true })
 *   .then(({ data, info }) => { ... })
 *   .catch(err => { ... });
 *
 * @example
 * const { data, info } = await sharp('my-image.jpg')
 *   // output the raw pixels
 *   .raw()
 *   .toBuffer({ resolveWithObject: true });
 *
 * // create a more type safe way to work with the raw pixel data
 * // this will not copy the data, instead it will change `data`s underlying ArrayBuffer
 * // so `data` and `pixelArray` point to the same memory location
 * const pixelArray = new Uint8ClampedArray(data.buffer);
 *
 * // When you are done changing the pixelArray, sharp takes the `pixelArray` as an input
 * const { width, height, channels } = info;
 * await sharp(pixelArray, { raw: { width, height, channels } })
 *   .toFile('my-changed-image.jpg');
 *
 * @param {Object} [options]
 * @param {boolean} [options.resolveWithObject] Resolve the Promise with an Object containing `data` and `info` properties instead of resolving only with `data`.
 * @param {Function} [callback]
 * @returns {Promise<Buffer>} - when no callback is provided
 */
function toBuffer (options, callback) {
  if (is.object(options)) {
    this._setBooleanOption('resolveWithObject', options.resolveWithObject);
  } else if (this.options.resolveWithObject) {
    this.options.resolveWithObject = false;
  }
  this.options.fileOut = '';
  return this._pipeline(is.fn(options) ? options : callback);
}

/**
 * Include all metadata (EXIF, XMP, IPTC) from the input image in the output image.
 * This will also convert to and add a web-friendly sRGB ICC profile unless a custom
 * output profile is provided.
 *
 * The default behaviour, when `withMetadata` is not used, is to convert to the device-independent
 * sRGB colour space and strip all metadata, including the removal of any ICC profile.
 *
 * EXIF metadata is unsupported for TIFF output.
 *
 * @example
 * sharp('input.jpg')
 *   .withMetadata()
 *   .toFile('output-with-metadata.jpg')
 *   .then(info => { ... });
 *
 * @example
 * // Set "IFD0-Copyright" in output EXIF metadata
 * const data = await sharp(input)
 *   .withMetadata({
 *     exif: {
 *       IFD0: {
 *         Copyright: 'Wernham Hogg'
 *       }
 *     }
 *   })
 *   .toBuffer();
 *
 * @example
 * // Set output metadata to 96 DPI
 * const data = await sharp(input)
 *   .withMetadata({ density: 96 })
 *   .toBuffer();
 *
 * @param {Object} [options]
 * @param {number} [options.orientation] value between 1 and 8, used to update the EXIF `Orientation` tag.
 * @param {string} [options.icc] filesystem path to output ICC profile, defaults to sRGB.
 * @param {Object<Object>} [options.exif={}] Object keyed by IFD0, IFD1 etc. of key/value string pairs to write as EXIF data.
 * @param {number} [options.density] Number of pixels per inch (DPI).
 * @returns {Sharp}
 * @throws {Error} Invalid parameters
 */
function withMetadata (options) {
  this.options.withMetadata = is.bool(options) ? options : true;
  if (is.object(options)) {
    if (is.defined(options.orientation)) {
      if (is.integer(options.orientation) && is.inRange(options.orientation, 1, 8)) {
        this.options.withMetadataOrientation = options.orientation;
      } else {
        throw is.invalidParameterError('orientation', 'integer between 1 and 8', options.orientation);
      }
    }
    if (is.defined(options.density)) {
      if (is.number(options.density) && options.density > 0) {
        this.options.withMetadataDensity = options.density;
      } else {
        throw is.invalidParameterError('density', 'positive number', options.density);
      }
    }
    if (is.defined(options.icc)) {
      if (is.string(options.icc)) {
        this.options.withMetadataIcc = options.icc;
      } else {
        throw is.invalidParameterError('icc', 'string filesystem path to ICC profile', options.icc);
      }
    }
    if (is.defined(options.exif)) {
      if (is.object(options.exif)) {
        for (const [ifd, entries] of Object.entries(options.exif)) {
          if (is.object(entries)) {
            for (const [k, v] of Object.entries(entries)) {
              if (is.string(v)) {
                this.options.withMetadataStrs[`exif-${ifd.toLowerCase()}-${k}`] = v;
              } else {
                throw is.invalidParameterError(`exif.${ifd}.${k}`, 'string', v);
              }
            }
          } else {
            throw is.invalidParameterError(`exif.${ifd}`, 'object', entries);
          }
        }
      } else {
        throw is.invalidParameterError('exif', 'object', options.exif);
      }
    }
  }
  return this;
}

/**
 * Force output to a given format.
 *
 * @example
 * // Convert any input to PNG output
 * const data = await sharp(input)
 *   .toFormat('png')
 *   .toBuffer();
 *
 * @param {(string|Object)} format - as a string or an Object with an 'id' attribute
 * @param {Object} options - output options
 * @returns {Sharp}
 * @throws {Error} unsupported format or options
 */
function toFormat (format, options) {
  const actualFormat = formats.get((is.object(format) && is.string(format.id) ? format.id : format).toLowerCase());
  if (!actualFormat) {
    throw is.invalidParameterError('format', `one of: ${[...formats.keys()].join(', ')}`, format);
  }
  return this[actualFormat](options);
}

/**
 * Use these JPEG options for output image.
 *
 * @example
 * // Convert any input to very high quality JPEG output
 * const data = await sharp(input)
 *   .jpeg({
 *     quality: 100,
 *     chromaSubsampling: '4:4:4'
 *   })
 *   .toBuffer();
 *
 * @example
 * // Use mozjpeg to reduce output JPEG file size (slower)
 * const data = await sharp(input)
 *   .jpeg({ mozjpeg: true })
 *   .toBuffer();
 *
 * @param {Object} [options] - output options
 * @param {number} [options.quality=80] - quality, integer 1-100
 * @param {boolean} [options.progressive=false] - use progressive (interlace) scan
 * @param {string} [options.chromaSubsampling='4:2:0'] - set to '4:4:4' to prevent chroma subsampling otherwise defaults to '4:2:0' chroma subsampling
 * @param {boolean} [options.optimiseCoding=true] - optimise Huffman coding tables
 * @param {boolean} [options.optimizeCoding=true] - alternative spelling of optimiseCoding
 * @param {boolean} [options.mozjpeg=false] - use mozjpeg defaults, equivalent to `{ trellisQuantisation: true, overshootDeringing: true, optimiseScans: true, quantisationTable: 3 }`
 * @param {boolean} [options.trellisQuantisation=false] - apply trellis quantisation
 * @param {boolean} [options.overshootDeringing=false] - apply overshoot deringing
 * @param {boolean} [options.optimiseScans=false] - optimise progressive scans, forces progressive
 * @param {boolean} [options.optimizeScans=false] - alternative spelling of optimiseScans
 * @param {number} [options.quantisationTable=0] - quantization table to use, integer 0-8
 * @param {number} [options.quantizationTable=0] - alternative spelling of quantisationTable
 * @param {boolean} [options.force=true] - force JPEG output, otherwise attempt to use input format
 * @returns {Sharp}
 * @throws {Error} Invalid options
 */
function jpeg (options) {
  if (is.object(options)) {
    if (is.defined(options.quality)) {
      if (is.integer(options.quality) && is.inRange(options.quality, 1, 100)) {
        this.options.jpegQuality = options.quality;
      } else {
        throw is.invalidParameterError('quality', 'integer between 1 and 100', options.quality);
      }
    }
    if (is.defined(options.progressive)) {
      this._setBooleanOption('jpegProgressive', options.progressive);
    }
    if (is.defined(options.chromaSubsampling)) {
      if (is.string(options.chromaSubsampling) && is.inArray(options.chromaSubsampling, ['4:2:0', '4:4:4'])) {
        this.options.jpegChromaSubsampling = options.chromaSubsampling;
      } else {
        throw is.invalidParameterError('chromaSubsampling', 'one of: 4:2:0, 4:4:4', options.chromaSubsampling);
      }
    }
    const optimiseCoding = is.bool(options.optimizeCoding) ? options.optimizeCoding : options.optimiseCoding;
    if (is.defined(optimiseCoding)) {
      this._setBooleanOption('jpegOptimiseCoding', optimiseCoding);
    }
    if (is.defined(options.mozjpeg)) {
      if (is.bool(options.mozjpeg)) {
        if (options.mozjpeg) {
          this.options.jpegTrellisQuantisation = true;
          this.options.jpegOvershootDeringing = true;
          this.options.jpegOptimiseScans = true;
          this.options.jpegProgressive = true;
          this.options.jpegQuantisationTable = 3;
        }
      } else {
        throw is.invalidParameterError('mozjpeg', 'boolean', options.mozjpeg);
      }
    }
    const trellisQuantisation = is.bool(options.trellisQuantization) ? options.trellisQuantization : options.trellisQuantisation;
    if (is.defined(trellisQuantisation)) {
      this._setBooleanOption('jpegTrellisQuantisation', trellisQuantisation);
    }
    if (is.defined(options.overshootDeringing)) {
      this._setBooleanOption('jpegOvershootDeringing', options.overshootDeringing);
    }
    const optimiseScans = is.bool(options.optimizeScans) ? options.optimizeScans : options.optimiseScans;
    if (is.defined(optimiseScans)) {
      this._setBooleanOption('jpegOptimiseScans', optimiseScans);
      if (optimiseScans) {
        this.options.jpegProgressive = true;
      }
    }
    const quantisationTable = is.number(options.quantizationTable) ? options.quantizationTable : options.quantisationTable;
    if (is.defined(quantisationTable)) {
      if (is.integer(quantisationTable) && is.inRange(quantisationTable, 0, 8)) {
        this.options.jpegQuantisationTable = quantisationTable;
      } else {
        throw is.invalidParameterError('quantisationTable', 'integer between 0 and 8', quantisationTable);
      }
    }
  }
  return this._updateFormatOut('jpeg', options);
}

/**
 * Use these PNG options for output image.
 *
 * By default, PNG output is full colour at 8 or 16 bits per pixel.
 * Indexed PNG input at 1, 2 or 4 bits per pixel is converted to 8 bits per pixel.
 * Set `palette` to `true` for slower, indexed PNG output.
 *
 * @example
 * // Convert any input to full colour PNG output
 * const data = await sharp(input)
 *   .png()
 *   .toBuffer();
 *
 * @example
 * // Convert any input to indexed PNG output (slower)
 * const data = await sharp(input)
 *   .png({ palette: true })
 *   .toBuffer();
 *
 * @param {Object} [options]
 * @param {boolean} [options.progressive=false] - use progressive (interlace) scan
 * @param {number} [options.compressionLevel=6] - zlib compression level, 0 (fastest, largest) to 9 (slowest, smallest)
 * @param {boolean} [options.adaptiveFiltering=false] - use adaptive row filtering
 * @param {boolean} [options.palette=false] - quantise to a palette-based image with alpha transparency support
 * @param {number} [options.quality=100] - use the lowest number of colours needed to achieve given quality, sets `palette` to `true`
 * @param {number} [options.effort=7] - CPU effort, between 1 (fastest) and 10 (slowest), sets `palette` to `true`
 * @param {number} [options.colours=256] - maximum number of palette entries, sets `palette` to `true`
 * @param {number} [options.colors=256] - alternative spelling of `options.colours`, sets `palette` to `true`
 * @param {number} [options.dither=1.0] - level of Floyd-Steinberg error diffusion, sets `palette` to `true`
 * @param {boolean} [options.force=true] - force PNG output, otherwise attempt to use input format
 * @returns {Sharp}
 * @throws {Error} Invalid options
 */
function png (options) {
  if (is.object(options)) {
    if (is.defined(options.progressive)) {
      this._setBooleanOption('pngProgressive', options.progressive);
    }
    if (is.defined(options.compressionLevel)) {
      if (is.integer(options.compressionLevel) && is.inRange(options.compressionLevel, 0, 9)) {
        this.options.pngCompressionLevel = options.compressionLevel;
      } else {
        throw is.invalidParameterError('compressionLevel', 'integer between 0 and 9', options.compressionLevel);
      }
    }
    if (is.defined(options.adaptiveFiltering)) {
      this._setBooleanOption('pngAdaptiveFiltering', options.adaptiveFiltering);
    }
    if (is.defined(options.palette)) {
      this._setBooleanOption('pngPalette', options.palette);
    } else if ([options.quality, options.effort, options.colours, options.colors, options.dither].some(is.defined)) {
      this._setBooleanOption('pngPalette', true);
    }
    if (this.options.pngPalette) {
      if (is.defined(options.quality)) {
        if (is.integer(options.quality) && is.inRange(options.quality, 0, 100)) {
          this.options.pngQuality = options.quality;
        } else {
          throw is.invalidParameterError('quality', 'integer between 0 and 100', options.quality);
        }
      }
      if (is.defined(options.effort)) {
        if (is.integer(options.effort) && is.inRange(options.effort, 1, 10)) {
          this.options.pngEffort = options.effort;
        } else {
          throw is.invalidParameterError('effort', 'integer between 1 and 10', options.effort);
        }
      }
      const colours = options.colours || options.colors;
      if (is.defined(colours)) {
        if (is.integer(colours) && is.inRange(colours, 2, 256)) {
          this.options.pngBitdepth = bitdepthFromColourCount(colours);
        } else {
          throw is.invalidParameterError('colours', 'integer between 2 and 256', colours);
        }
      }
      if (is.defined(options.dither)) {
        if (is.number(options.dither) && is.inRange(options.dither, 0, 1)) {
          this.options.pngDither = options.dither;
        } else {
          throw is.invalidParameterError('dither', 'number between 0.0 and 1.0', options.dither);
        }
      }
    }
  }
  return this._updateFormatOut('png', options);
}

/**
 * Use these WebP options for output image.
 *
 * @example
 * // Convert any input to lossless WebP output
 * const data = await sharp(input)
 *   .webp({ lossless: true })
 *   .toBuffer();
 *
 * @example
 * // Optimise the file size of an animated WebP
 * const outputWebp = await sharp(inputWebp, { animated: true })
 *   .webp({ effort: 6 })
 *   .toBuffer();
 *
 * @param {Object} [options] - output options
 * @param {number} [options.quality=80] - quality, integer 1-100
 * @param {number} [options.alphaQuality=100] - quality of alpha layer, integer 0-100
 * @param {boolean} [options.lossless=false] - use lossless compression mode
 * @param {boolean} [options.nearLossless=false] - use near_lossless compression mode
 * @param {boolean} [options.smartSubsample=false] - use high quality chroma subsampling
 * @param {number} [options.effort=4] - CPU effort, between 0 (fastest) and 6 (slowest)
 * @param {number} [options.loop=0] - number of animation iterations, use 0 for infinite animation
 * @param {number|number[]} [options.delay] - delay(s) between animation frames (in milliseconds)
 * @param {boolean} [options.force=true] - force WebP output, otherwise attempt to use input format
 * @returns {Sharp}
 * @throws {Error} Invalid options
 */
function webp (options) {
  if (is.object(options)) {
    if (is.defined(options.quality)) {
      if (is.integer(options.quality) && is.inRange(options.quality, 1, 100)) {
        this.options.webpQuality = options.quality;
      } else {
        throw is.invalidParameterError('quality', 'integer between 1 and 100', options.quality);
      }
    }
    if (is.defined(options.alphaQuality)) {
      if (is.integer(options.alphaQuality) && is.inRange(options.alphaQuality, 0, 100)) {
        this.options.webpAlphaQuality = options.alphaQuality;
      } else {
        throw is.invalidParameterError('alphaQuality', 'integer between 0 and 100', options.alphaQuality);
      }
    }
    if (is.defined(options.lossless)) {
      this._setBooleanOption('webpLossless', options.lossless);
    }
    if (is.defined(options.nearLossless)) {
      this._setBooleanOption('webpNearLossless', options.nearLossless);
    }
    if (is.defined(options.smartSubsample)) {
      this._setBooleanOption('webpSmartSubsample', options.smartSubsample);
    }
    const effort = options.effort || options.reductionEffort;
    if (is.defined(effort)) {
      if (is.integer(effort) && is.inRange(effort, 0, 6)) {
        this.options.webpEffort = effort;
      } else {
        throw is.invalidParameterError('effort', 'integer between 0 and 6', effort);
      }
    }
  }
  trySetAnimationOptions(options, this.options);
  return this._updateFormatOut('webp', options);
}

/**
 * Use these GIF options for the output image.
 *
 * The first entry in the palette is reserved for transparency.
 *
 * @since 0.30.0
 *
 * @example
 * // Convert PNG to GIF
 * await sharp(pngBuffer)
 *   .gif()
 *   .toBuffer();
 *
 * @example
 * // Convert animated WebP to animated GIF
 * await sharp('animated.webp', { animated: true })
 *   .toFile('animated.gif');
 *
 * @example
 * // Create a 128x128, cropped, non-dithered, animated thumbnail of an animated GIF
 * const out = await sharp('in.gif', { animated: true })
 *   .resize({ width: 128, height: 128 })
 *   .gif({ dither: 0 })
 *   .toBuffer();
 *
 * @param {Object} [options] - output options
 * @param {number} [options.colours=256] - maximum number of palette entries, including transparency, between 2 and 256
 * @param {number} [options.colors=256] - alternative spelling of `options.colours`
 * @param {number} [options.effort=7] - CPU effort, between 1 (fastest) and 10 (slowest)
 * @param {number} [options.dither=1.0] - level of Floyd-Steinberg error diffusion, between 0 (least) and 1 (most)
 * @param {number} [options.loop=0] - number of animation iterations, use 0 for infinite animation
 * @param {number|number[]} [options.delay] - delay(s) between animation frames (in milliseconds)
 * @param {boolean} [options.force=true] - force GIF output, otherwise attempt to use input format
 * @returns {Sharp}
 * @throws {Error} Invalid options
 */
function gif (options) {
  if (is.object(options)) {
    const colours = options.colours || options.colors;
    if (is.defined(colours)) {
      if (is.integer(colours) && is.inRange(colours, 2, 256)) {
        this.options.gifBitdepth = bitdepthFromColourCount(colours);
      } else {
        throw is.invalidParameterError('colours', 'integer between 2 and 256', colours);
      }
    }
    if (is.defined(options.effort)) {
      if (is.number(options.effort) && is.inRange(options.effort, 1, 10)) {
        this.options.gifEffort = options.effort;
      } else {
        throw is.invalidParameterError('effort', 'integer between 1 and 10', options.effort);
      }
    }
    if (is.defined(options.dither)) {
      if (is.number(options.dither) && is.inRange(options.dither, 0, 1)) {
        this.options.gifDither = options.dither;
      } else {
        throw is.invalidParameterError('dither', 'number between 0.0 and 1.0', options.dither);
      }
    }
  }
  trySetAnimationOptions(options, this.options);
  return this._updateFormatOut('gif', options);
}

/**
 * Use these JP2 options for output image.
 *
 * Requires libvips compiled with support for OpenJPEG.
 * The prebuilt binaries do not include this - see
 * {@link https://sharp.pixelplumbing.com/install#custom-libvips installing a custom libvips}.
 *
 * @example
 * // Convert any input to lossless JP2 output
 * const data = await sharp(input)
 *   .jp2({ lossless: true })
 *   .toBuffer();
 *
 * @example
 * // Convert any input to very high quality JP2 output
 * const data = await sharp(input)
 *   .jp2({
 *     quality: 100,
 *     chromaSubsampling: '4:4:4'
 *   })
 *   .toBuffer();
 *
 * @since 0.29.1
 *
 * @param {Object} [options] - output options
 * @param {number} [options.quality=80] - quality, integer 1-100
 * @param {boolean} [options.lossless=false] - use lossless compression mode
 * @param {number} [options.tileWidth=512] - horizontal tile size
 * @param {number} [options.tileHeight=512] - vertical tile size
 * @param {string} [options.chromaSubsampling='4:4:4'] - set to '4:2:0' to use chroma subsampling
 * @returns {Sharp}
 * @throws {Error} Invalid options
 */
/* istanbul ignore next */
function jp2 (options) {
  if (!this.constructor.format.jp2k.output.buffer) {
    throw errJp2Save;
  }
  if (is.object(options)) {
    if (is.defined(options.quality)) {
      if (is.integer(options.quality) && is.inRange(options.quality, 1, 100)) {
        this.options.jp2Quality = options.quality;
      } else {
        throw is.invalidParameterError('quality', 'integer between 1 and 100', options.quality);
      }
    }
    if (is.defined(options.lossless)) {
      if (is.bool(options.lossless)) {
        this.options.jp2Lossless = options.lossless;
      } else {
        throw is.invalidParameterError('lossless', 'boolean', options.lossless);
      }
    }
    if (is.defined(options.tileWidth)) {
      if (is.integer(options.tileWidth) && is.inRange(options.tileWidth, 1, 32768)) {
        this.options.jp2TileWidth = options.tileWidth;
      } else {
        throw is.invalidParameterError('tileWidth', 'integer between 1 and 32768', options.tileWidth);
      }
    }
    if (is.defined(options.tileHeight)) {
      if (is.integer(options.tileHeight) && is.inRange(options.tileHeight, 1, 32768)) {
        this.options.jp2TileHeight = options.tileHeight;
      } else {
        throw is.invalidParameterError('tileHeight', 'integer between 1 and 32768', options.tileHeight);
      }
    }
    if (is.defined(options.chromaSubsampling)) {
      if (is.string(options.chromaSubsampling) && is.inArray(options.chromaSubsampling, ['4:2:0', '4:4:4'])) {
        this.options.heifChromaSubsampling = options.chromaSubsampling;
      } else {
        throw is.invalidParameterError('chromaSubsampling', 'one of: 4:2:0, 4:4:4', options.chromaSubsampling);
      }
    }
  }
  return this._updateFormatOut('jp2', options);
}

/**
 * Set animation options if available.
 * @private
 *
 * @param {Object} [source] - output options
 * @param {number} [source.loop=0] - number of animation iterations, use 0 for infinite animation
 * @param {number[]} [source.delay] - list of delays between animation frames (in milliseconds)
 * @param {Object} [target] - target object for valid options
 * @throws {Error} Invalid options
 */
function trySetAnimationOptions (source, target) {
  if (is.object(source) && is.defined(source.loop)) {
    if (is.integer(source.loop) && is.inRange(source.loop, 0, 65535)) {
      target.loop = source.loop;
    } else {
      throw is.invalidParameterError('loop', 'integer between 0 and 65535', source.loop);
    }
  }
  if (is.object(source) && is.defined(source.delay)) {
    // We allow singular values as well
    if (is.integer(source.delay) && is.inRange(source.delay, 0, 65535)) {
      target.delay = [source.delay];
    } else if (
      Array.isArray(source.delay) &&
      source.delay.every(is.integer) &&
      source.delay.every(v => is.inRange(v, 0, 65535))) {
      target.delay = source.delay;
    } else {
      throw is.invalidParameterError('delay', 'integer or an array of integers between 0 and 65535', source.delay);
    }
  }
}

/**
 * Use these TIFF options for output image.
 *
 * The `density` can be set in pixels/inch via {@link withMetadata} instead of providing `xres` and `yres` in pixels/mm.
 *
 * @example
 * // Convert SVG input to LZW-compressed, 1 bit per pixel TIFF output
 * sharp('input.svg')
 *   .tiff({
 *     compression: 'lzw',
 *     bitdepth: 1
 *   })
 *   .toFile('1-bpp-output.tiff')
 *   .then(info => { ... });
 *
 * @param {Object} [options] - output options
 * @param {number} [options.quality=80] - quality, integer 1-100
 * @param {boolean} [options.force=true] - force TIFF output, otherwise attempt to use input format
 * @param {string} [options.compression='jpeg'] - compression options: lzw, deflate, jpeg, ccittfax4
 * @param {string} [options.predictor='horizontal'] - compression predictor options: none, horizontal, float
 * @param {boolean} [options.pyramid=false] - write an image pyramid
 * @param {boolean} [options.tile=false] - write a tiled tiff
 * @param {number} [options.tileWidth=256] - horizontal tile size
 * @param {number} [options.tileHeight=256] - vertical tile size
 * @param {number} [options.xres=1.0] - horizontal resolution in pixels/mm
 * @param {number} [options.yres=1.0] - vertical resolution in pixels/mm
 * @param {string} [options.resolutionUnit='inch'] - resolution unit options: inch, cm
 * @param {number} [options.bitdepth=8] - reduce bitdepth to 1, 2 or 4 bit
 * @returns {Sharp}
 * @throws {Error} Invalid options
 */
function tiff (options) {
  if (is.object(options)) {
    if (is.defined(options.quality)) {
      if (is.integer(options.quality) && is.inRange(options.quality, 1, 100)) {
        this.options.tiffQuality = options.quality;
      } else {
        throw is.invalidParameterError('quality', 'integer between 1 and 100', options.quality);
      }
    }
    if (is.defined(options.bitdepth)) {
      if (is.integer(options.bitdepth) && is.inArray(options.bitdepth, [1, 2, 4, 8])) {
        this.options.tiffBitdepth = options.bitdepth;
      } else {
        throw is.invalidParameterError('bitdepth', '1, 2, 4 or 8', options.bitdepth);
      }
    }
    // tiling
    if (is.defined(options.tile)) {
      this._setBooleanOption('tiffTile', options.tile);
    }
    if (is.defined(options.tileWidth)) {
      if (is.integer(options.tileWidth) && options.tileWidth > 0) {
        this.options.tiffTileWidth = options.tileWidth;
      } else {
        throw is.invalidParameterError('tileWidth', 'integer greater than zero', options.tileWidth);
      }
    }
    if (is.defined(options.tileHeight)) {
      if (is.integer(options.tileHeight) && options.tileHeight > 0) {
        this.options.tiffTileHeight = options.tileHeight;
      } else {
        throw is.invalidParameterError('tileHeight', 'integer greater than zero', options.tileHeight);
      }
    }
    // pyramid
    if (is.defined(options.pyramid)) {
      this._setBooleanOption('tiffPyramid', options.pyramid);
    }
    // resolution
    if (is.defined(options.xres)) {
      if (is.number(options.xres) && options.xres > 0) {
        this.options.tiffXres = options.xres;
      } else {
        throw is.invalidParameterError('xres', 'number greater than zero', options.xres);
      }
    }
    if (is.defined(options.yres)) {
      if (is.number(options.yres) && options.yres > 0) {
        this.options.tiffYres = options.yres;
      } else {
        throw is.invalidParameterError('yres', 'number greater than zero', options.yres);
      }
    }
    // compression
    if (is.defined(options.compression)) {
      if (is.string(options.compression) && is.inArray(options.compression, ['lzw', 'deflate', 'jpeg', 'ccittfax4', 'none'])) {
        this.options.tiffCompression = options.compression;
      } else {
        throw is.invalidParameterError('compression', 'one of: lzw, deflate, jpeg, ccittfax4, none', options.compression);
      }
    }
    // predictor
    if (is.defined(options.predictor)) {
      if (is.string(options.predictor) && is.inArray(options.predictor, ['none', 'horizontal', 'float'])) {
        this.options.tiffPredictor = options.predictor;
      } else {
        throw is.invalidParameterError('predictor', 'one of: none, horizontal, float', options.predictor);
      }
    }
    // resolutionUnit
    if (is.defined(options.resolutionUnit)) {
      if (is.string(options.resolutionUnit) && is.inArray(options.resolutionUnit, ['inch', 'cm'])) {
        this.options.tiffResolutionUnit = options.resolutionUnit;
      } else {
        throw is.invalidParameterError('resolutionUnit', 'one of: inch, cm', options.resolutionUnit);
      }
    }
  }
  return this._updateFormatOut('tiff', options);
}

/**
 * Use these AVIF options for output image.
 *
 * Whilst it is possible to create AVIF images smaller than 16x16 pixels,
 * most web browsers do not display these properly.
 *
 * AVIF image sequences are not supported.
 *
 * @since 0.27.0
 *
 * @param {Object} [options] - output options
 * @param {number} [options.quality=50] - quality, integer 1-100
 * @param {boolean} [options.lossless=false] - use lossless compression
 * @param {number} [options.effort=4] - CPU effort, between 0 (fastest) and 9 (slowest)
 * @param {string} [options.chromaSubsampling='4:4:4'] - set to '4:2:0' to use chroma subsampling
 * @returns {Sharp}
 * @throws {Error} Invalid options
 */
function avif (options) {
  return this.heif({ ...options, compression: 'av1' });
}

/**
 * Use these HEIF options for output image.
 *
 * Support for patent-encumbered HEIC images requires the use of a
 * globally-installed libvips compiled with support for libheif, libde265 and x265.
 *
 * @since 0.23.0
 *
 * @param {Object} [options] - output options
 * @param {number} [options.quality=50] - quality, integer 1-100
 * @param {string} [options.compression='av1'] - compression format: av1, hevc
 * @param {boolean} [options.lossless=false] - use lossless compression
 * @param {number} [options.effort=4] - CPU effort, between 0 (fastest) and 9 (slowest)
 * @param {string} [options.chromaSubsampling='4:4:4'] - set to '4:2:0' to use chroma subsampling
 * @returns {Sharp}
 * @throws {Error} Invalid options
 */
function heif (options) {
  if (is.object(options)) {
    if (is.defined(options.quality)) {
      if (is.integer(options.quality) && is.inRange(options.quality, 1, 100)) {
        this.options.heifQuality = options.quality;
      } else {
        throw is.invalidParameterError('quality', 'integer between 1 and 100', options.quality);
      }
    }
    if (is.defined(options.lossless)) {
      if (is.bool(options.lossless)) {
        this.options.heifLossless = options.lossless;
      } else {
        throw is.invalidParameterError('lossless', 'boolean', options.lossless);
      }
    }
    if (is.defined(options.compression)) {
      if (is.string(options.compression) && is.inArray(options.compression, ['av1', 'hevc'])) {
        this.options.heifCompression = options.compression;
      } else {
        throw is.invalidParameterError('compression', 'one of: av1, hevc', options.compression);
      }
    }
    if (is.defined(options.effort)) {
      if (is.integer(options.effort) && is.inRange(options.effort, 0, 9)) {
        this.options.heifEffort = options.effort;
      } else {
        throw is.invalidParameterError('effort', 'integer between 0 and 9', options.effort);
      }
    } else if (is.defined(options.speed)) {
      if (is.integer(options.speed) && is.inRange(options.speed, 0, 9)) {
        this.options.heifEffort = 9 - options.speed;
      } else {
        throw is.invalidParameterError('speed', 'integer between 0 and 9', options.speed);
      }
    }
    if (is.defined(options.chromaSubsampling)) {
      if (is.string(options.chromaSubsampling) && is.inArray(options.chromaSubsampling, ['4:2:0', '4:4:4'])) {
        this.options.heifChromaSubsampling = options.chromaSubsampling;
      } else {
        throw is.invalidParameterError('chromaSubsampling', 'one of: 4:2:0, 4:4:4', options.chromaSubsampling);
      }
    }
  }
  return this._updateFormatOut('heif', options);
}

/**
 * Force output to be raw, uncompressed pixel data.
 * Pixel ordering is left-to-right, top-to-bottom, without padding.
 * Channel ordering will be RGB or RGBA for non-greyscale colourspaces.
 *
 * @example
 * // Extract raw, unsigned 8-bit RGB pixel data from JPEG input
 * const { data, info } = await sharp('input.jpg')
 *   .raw()
 *   .toBuffer({ resolveWithObject: true });
 *
 * @example
 * // Extract alpha channel as raw, unsigned 16-bit pixel data from PNG input
 * const data = await sharp('input.png')
 *   .ensureAlpha()
 *   .extractChannel(3)
 *   .toColourspace('b-w')
 *   .raw({ depth: 'ushort' })
 *   .toBuffer();
 *
 * @param {Object} [options] - output options
 * @param {string} [options.depth='uchar'] - bit depth, one of: char, uchar (default), short, ushort, int, uint, float, complex, double, dpcomplex
 * @throws {Error} Invalid options
 */
function raw (options) {
  if (is.object(options)) {
    if (is.defined(options.depth)) {
      if (is.string(options.depth) && is.inArray(options.depth,
        ['char', 'uchar', 'short', 'ushort', 'int', 'uint', 'float', 'complex', 'double', 'dpcomplex']
      )) {
        this.options.rawDepth = options.depth;
      } else {
        throw is.invalidParameterError('depth', 'one of: char, uchar, short, ushort, int, uint, float, complex, double, dpcomplex', options.depth);
      }
    }
  }
  return this._updateFormatOut('raw');
}

/**
 * Use tile-based deep zoom (image pyramid) output.
 * Set the format and options for tile images via the `toFormat`, `jpeg`, `png` or `webp` functions.
 * Use a `.zip` or `.szi` file extension with `toFile` to write to a compressed archive file format.
 *
 * @example
 *  sharp('input.tiff')
 *   .png()
 *   .tile({
 *     size: 512
 *   })
 *   .toFile('output.dz', function(err, info) {
 *     // output.dzi is the Deep Zoom XML definition
 *     // output_files contains 512x512 tiles grouped by zoom level
 *   });
 *
 * @param {Object} [options]
 * @param {number} [options.size=256] tile size in pixels, a value between 1 and 8192.
 * @param {number} [options.overlap=0] tile overlap in pixels, a value between 0 and 8192.
 * @param {number} [options.angle=0] tile angle of rotation, must be a multiple of 90.
 * @param {string|Object} [options.background={r: 255, g: 255, b: 255, alpha: 1}] - background colour, parsed by the [color](https://www.npmjs.org/package/color) module, defaults to white without transparency.
 * @param {string} [options.depth] how deep to make the pyramid, possible values are `onepixel`, `onetile` or `one`, default based on layout.
 * @param {number} [options.skipBlanks=-1] threshold to skip tile generation, a value 0 - 255 for 8-bit images or 0 - 65535 for 16-bit images
 * @param {string} [options.container='fs'] tile container, with value `fs` (filesystem) or `zip` (compressed file).
 * @param {string} [options.layout='dz'] filesystem layout, possible values are `dz`, `iiif`, `iiif3`, `zoomify` or `google`.
 * @param {boolean} [options.centre=false] centre image in tile.
 * @param {boolean} [options.center=false] alternative spelling of centre.
 * @param {string} [options.id='https://example.com/iiif'] when `layout` is `iiif`/`iiif3`, sets the `@id`/`id` attribute of `info.json`
 * @returns {Sharp}
 * @throws {Error} Invalid parameters
 */
function tile (options) {
  if (is.object(options)) {
    // Size of square tiles, in pixels
    if (is.defined(options.size)) {
      if (is.integer(options.size) && is.inRange(options.size, 1, 8192)) {
        this.options.tileSize = options.size;
      } else {
        throw is.invalidParameterError('size', 'integer between 1 and 8192', options.size);
      }
    }
    // Overlap of tiles, in pixels
    if (is.defined(options.overlap)) {
      if (is.integer(options.overlap) && is.inRange(options.overlap, 0, 8192)) {
        if (options.overlap > this.options.tileSize) {
          throw is.invalidParameterError('overlap', `<= size (${this.options.tileSize})`, options.overlap);
        }
        this.options.tileOverlap = options.overlap;
      } else {
        throw is.invalidParameterError('overlap', 'integer between 0 and 8192', options.overlap);
      }
    }
    // Container
    if (is.defined(options.container)) {
      if (is.string(options.container) && is.inArray(options.container, ['fs', 'zip'])) {
        this.options.tileContainer = options.container;
      } else {
        throw is.invalidParameterError('container', 'one of: fs, zip', options.container);
      }
    }
    // Layout
    if (is.defined(options.layout)) {
      if (is.string(options.layout) && is.inArray(options.layout, ['dz', 'google', 'iiif', 'iiif3', 'zoomify'])) {
        this.options.tileLayout = options.layout;
      } else {
        throw is.invalidParameterError('layout', 'one of: dz, google, iiif, iiif3, zoomify', options.layout);
      }
    }
    // Angle of rotation,
    if (is.defined(options.angle)) {
      if (is.integer(options.angle) && !(options.angle % 90)) {
        this.options.tileAngle = options.angle;
      } else {
        throw is.invalidParameterError('angle', 'positive/negative multiple of 90', options.angle);
      }
    }
    // Background colour
    this._setBackgroundColourOption('tileBackground', options.background);
    // Depth of tiles
    if (is.defined(options.depth)) {
      if (is.string(options.depth) && is.inArray(options.depth, ['onepixel', 'onetile', 'one'])) {
        this.options.tileDepth = options.depth;
      } else {
        throw is.invalidParameterError('depth', 'one of: onepixel, onetile, one', options.depth);
      }
    }
    // Threshold to skip blank tiles
    if (is.defined(options.skipBlanks)) {
      if (is.integer(options.skipBlanks) && is.inRange(options.skipBlanks, -1, 65535)) {
        this.options.tileSkipBlanks = options.skipBlanks;
      } else {
        throw is.invalidParameterError('skipBlanks', 'integer between -1 and 255/65535', options.skipBlanks);
      }
    } else if (is.defined(options.layout) && options.layout === 'google') {
      this.options.tileSkipBlanks = 5;
    }
    // Center image in tile
    const centre = is.bool(options.center) ? options.center : options.centre;
    if (is.defined(centre)) {
      this._setBooleanOption('tileCentre', centre);
    }
    // @id attribute for IIIF layout
    if (is.defined(options.id)) {
      if (is.string(options.id)) {
        this.options.tileId = options.id;
      } else {
        throw is.invalidParameterError('id', 'string', options.id);
      }
    }
  }
  // Format
  if (is.inArray(this.options.formatOut, ['jpeg', 'png', 'webp'])) {
    this.options.tileFormat = this.options.formatOut;
  } else if (this.options.formatOut !== 'input') {
    throw is.invalidParameterError('format', 'one of: jpeg, png, webp', this.options.formatOut);
  }
  return this._updateFormatOut('dz');
}

/**
 * Set a timeout for processing, in seconds.
 * Use a value of zero to continue processing indefinitely, the default behaviour.
 *
 * The clock starts when libvips opens an input image for processing.
 * Time spent waiting for a libuv thread to become available is not included.
 *
 * @since 0.29.2
 *
 * @param {Object} options
 * @param {number} options.seconds - Number of seconds after which processing will be stopped
 * @returns {Sharp}
 */
function timeout (options) {
  if (!is.plainObject(options)) {
    throw is.invalidParameterError('options', 'object', options);
  }
  if (is.integer(options.seconds) && is.inRange(options.seconds, 0, 3600)) {
    this.options.timeoutSeconds = options.seconds;
  } else {
    throw is.invalidParameterError('seconds', 'integer between 0 and 3600', options.seconds);
  }
  return this;
}

/**
 * Update the output format unless options.force is false,
 * in which case revert to input format.
 * @private
 * @param {string} formatOut
 * @param {Object} [options]
 * @param {boolean} [options.force=true] - force output format, otherwise attempt to use input format
 * @returns {Sharp}
 */
function _updateFormatOut (formatOut, options) {
  if (!(is.object(options) && options.force === false)) {
    this.options.formatOut = formatOut;
  }
  return this;
}

/**
 * Update a boolean attribute of the this.options Object.
 * @private
 * @param {string} key
 * @param {boolean} val
 * @throws {Error} Invalid key
 */
function _setBooleanOption (key, val) {
  if (is.bool(val)) {
    this.options[key] = val;
  } else {
    throw is.invalidParameterError(key, 'boolean', val);
  }
}

/**
 * Called by a WriteableStream to notify us it is ready for data.
 * @private
 */
function _read () {
  /* istanbul ignore else */
  if (!this.options.streamOut) {
    this.options.streamOut = true;
    this._pipeline();
  }
}

/**
 * Invoke the C++ image processing pipeline
 * Supports callback, stream and promise variants
 * @private
 */
function _pipeline (callback) {
  if (typeof callback === 'function') {
    // output=file/buffer
    if (this._isStreamInput()) {
      // output=file/buffer, input=stream
      this.on('finish', () => {
        this._flattenBufferIn();
        sharp.pipeline(this.options, callback);
      });
    } else {
      // output=file/buffer, input=file/buffer
      sharp.pipeline(this.options, callback);
    }
    return this;
  } else if (this.options.streamOut) {
    // output=stream
    if (this._isStreamInput()) {
      // output=stream, input=stream
      this.once('finish', () => {
        this._flattenBufferIn();
        sharp.pipeline(this.options, (err, data, info) => {
          if (err) {
            this.emit('error', err);
          } else {
            this.emit('info', info);
            this.push(data);
          }
          this.push(null);
          this.emit('close');
        });
      });
      if (this.streamInFinished) {
        this.emit('finish');
      }
    } else {
      // output=stream, input=file/buffer
      sharp.pipeline(this.options, (err, data, info) => {
        if (err) {
          this.emit('error', err);
        } else {
          this.emit('info', info);
          this.push(data);
        }
        this.push(null);
        this.emit('close');
      });
    }
    return this;
  } else {
    // output=promise
    if (this._isStreamInput()) {
      // output=promise, input=stream
      return new Promise((resolve, reject) => {
        this.once('finish', () => {
          this._flattenBufferIn();
          sharp.pipeline(this.options, (err, data, info) => {
            if (err) {
              reject(err);
            } else {
              if (this.options.resolveWithObject) {
                resolve({ data, info });
              } else {
                resolve(data);
              }
            }
          });
        });
      });
    } else {
      // output=promise, input=file/buffer
      return new Promise((resolve, reject) => {
        sharp.pipeline(this.options, (err, data, info) => {
          if (err) {
            reject(err);
          } else {
            if (this.options.resolveWithObject) {
              resolve({ data: data, info: info });
            } else {
              resolve(data);
            }
          }
        });
      });
    }
  }
}

/**
 * Decorate the Sharp prototype with output-related functions.
 * @private
 */
module.exports = function (Sharp) {
  Object.assign(Sharp.prototype, {
    // Public
    toFile,
    toBuffer,
    withMetadata,
    toFormat,
    jpeg,
    jp2,
    png,
    webp,
    tiff,
    avif,
    heif,
    gif,
    raw,
    tile,
    timeout,
    // Private
    _updateFormatOut,
    _setBooleanOption,
    _read,
    _pipeline
  });
};


/***/ }),

/***/ 998:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


const detectLibc = __nccwpck_require__(889);

const env = process.env;

module.exports = function () {
  const arch = env.npm_config_arch || process.arch;
  const platform = env.npm_config_platform || process.platform;
  const libc = process.env.npm_config_libc ||
    /* istanbul ignore next */
    (detectLibc.isNonGlibcLinuxSync() ? detectLibc.familySync() : '');
  const libcId = platform !== 'linux' || libc === detectLibc.GLIBC ? '' : libc;

  const platformId = [`${platform}${libcId}`];

  if (arch === 'arm') {
    const fallback = process.versions.electron ? '7' : '6';
    platformId.push(`armv${env.npm_config_arm_version || process.config.variables.arm_version || fallback}`);
  } else if (arch === 'arm64') {
    platformId.push(`arm64v${env.npm_config_arm_version || '8'}`);
  } else {
    platformId.push(arch);
  }

  return platformId.join('-');
};


/***/ }),

/***/ 932:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


const is = __nccwpck_require__(768);

/**
 * Weighting to apply when using contain/cover fit.
 * @member
 * @private
 */
const gravity = {
  center: 0,
  centre: 0,
  north: 1,
  east: 2,
  south: 3,
  west: 4,
  northeast: 5,
  southeast: 6,
  southwest: 7,
  northwest: 8
};

/**
 * Position to apply when using contain/cover fit.
 * @member
 * @private
 */
const position = {
  top: 1,
  right: 2,
  bottom: 3,
  left: 4,
  'right top': 5,
  'right bottom': 6,
  'left bottom': 7,
  'left top': 8
};

/**
 * Strategies for automagic cover behaviour.
 * @member
 * @private
 */
const strategy = {
  entropy: 16,
  attention: 17
};

/**
 * Reduction kernels.
 * @member
 * @private
 */
const kernel = {
  nearest: 'nearest',
  cubic: 'cubic',
  mitchell: 'mitchell',
  lanczos2: 'lanczos2',
  lanczos3: 'lanczos3'
};

/**
 * Methods by which an image can be resized to fit the provided dimensions.
 * @member
 * @private
 */
const fit = {
  contain: 'contain',
  cover: 'cover',
  fill: 'fill',
  inside: 'inside',
  outside: 'outside'
};

/**
 * Map external fit property to internal canvas property.
 * @member
 * @private
 */
const mapFitToCanvas = {
  contain: 'embed',
  cover: 'crop',
  fill: 'ignore_aspect',
  inside: 'max',
  outside: 'min'
};

/**
 * @private
 */
function isRotationExpected (options) {
  return (options.angle % 360) !== 0 || options.useExifOrientation === true || options.rotationAngle !== 0;
}

/**
 * Resize image to `width`, `height` or `width x height`.
 *
 * When both a `width` and `height` are provided, the possible methods by which the image should **fit** these are:
 * - `cover`: (default) Preserving aspect ratio, ensure the image covers both provided dimensions by cropping/clipping to fit.
 * - `contain`: Preserving aspect ratio, contain within both provided dimensions using "letterboxing" where necessary.
 * - `fill`: Ignore the aspect ratio of the input and stretch to both provided dimensions.
 * - `inside`: Preserving aspect ratio, resize the image to be as large as possible while ensuring its dimensions are less than or equal to both those specified.
 * - `outside`: Preserving aspect ratio, resize the image to be as small as possible while ensuring its dimensions are greater than or equal to both those specified.
 *
 * Some of these values are based on the [object-fit](https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit) CSS property.
 *
 * When using a `fit` of `cover` or `contain`, the default **position** is `centre`. Other options are:
 * - `sharp.position`: `top`, `right top`, `right`, `right bottom`, `bottom`, `left bottom`, `left`, `left top`.
 * - `sharp.gravity`: `north`, `northeast`, `east`, `southeast`, `south`, `southwest`, `west`, `northwest`, `center` or `centre`.
 * - `sharp.strategy`: `cover` only, dynamically crop using either the `entropy` or `attention` strategy.
 *
 * Some of these values are based on the [object-position](https://developer.mozilla.org/en-US/docs/Web/CSS/object-position) CSS property.
 *
 * The experimental strategy-based approach resizes so one dimension is at its target length
 * then repeatedly ranks edge regions, discarding the edge with the lowest score based on the selected strategy.
 * - `entropy`: focus on the region with the highest [Shannon entropy](https://en.wikipedia.org/wiki/Entropy_%28information_theory%29).
 * - `attention`: focus on the region with the highest luminance frequency, colour saturation and presence of skin tones.
 *
 * Possible interpolation kernels are:
 * - `nearest`: Use [nearest neighbour interpolation](http://en.wikipedia.org/wiki/Nearest-neighbor_interpolation).
 * - `cubic`: Use a [Catmull-Rom spline](https://en.wikipedia.org/wiki/Centripetal_Catmull%E2%80%93Rom_spline).
 * - `mitchell`: Use a [Mitchell-Netravali spline](https://www.cs.utexas.edu/~fussell/courses/cs384g-fall2013/lectures/mitchell/Mitchell.pdf).
 * - `lanczos2`: Use a [Lanczos kernel](https://en.wikipedia.org/wiki/Lanczos_resampling#Lanczos_kernel) with `a=2`.
 * - `lanczos3`: Use a Lanczos kernel with `a=3` (the default).
 *
 * @example
 * sharp(input)
 *   .resize({ width: 100 })
 *   .toBuffer()
 *   .then(data => {
 *     // 100 pixels wide, auto-scaled height
 *   });
 *
 * @example
 * sharp(input)
 *   .resize({ height: 100 })
 *   .toBuffer()
 *   .then(data => {
 *     // 100 pixels high, auto-scaled width
 *   });
 *
 * @example
 * sharp(input)
 *   .resize(200, 300, {
 *     kernel: sharp.kernel.nearest,
 *     fit: 'contain',
 *     position: 'right top',
 *     background: { r: 255, g: 255, b: 255, alpha: 0.5 }
 *   })
 *   .toFile('output.png')
 *   .then(() => {
 *     // output.png is a 200 pixels wide and 300 pixels high image
 *     // containing a nearest-neighbour scaled version
 *     // contained within the north-east corner of a semi-transparent white canvas
 *   });
 *
 * @example
 * const transformer = sharp()
 *   .resize({
 *     width: 200,
 *     height: 200,
 *     fit: sharp.fit.cover,
 *     position: sharp.strategy.entropy
 *   });
 * // Read image data from readableStream
 * // Write 200px square auto-cropped image data to writableStream
 * readableStream
 *   .pipe(transformer)
 *   .pipe(writableStream);
 *
 * @example
 * sharp(input)
 *   .resize(200, 200, {
 *     fit: sharp.fit.inside,
 *     withoutEnlargement: true
 *   })
 *   .toFormat('jpeg')
 *   .toBuffer()
 *   .then(function(outputBuffer) {
 *     // outputBuffer contains JPEG image data
 *     // no wider and no higher than 200 pixels
 *     // and no larger than the input image
 *   });
 *
 * @example
 * sharp(input)
 *   .resize(200, 200, {
 *     fit: sharp.fit.outside,
 *     withoutReduction: true
 *   })
 *   .toFormat('jpeg')
 *   .toBuffer()
 *   .then(function(outputBuffer) {
 *     // outputBuffer contains JPEG image data
 *     // of at least 200 pixels wide and 200 pixels high while maintaining aspect ratio
 *     // and no smaller than the input image
 *   });
 *
 * @example
 * const scaleByHalf = await sharp(input)
 *   .metadata()
 *   .then(({ width }) => sharp(input)
 *     .resize(Math.round(width * 0.5))
 *     .toBuffer()
 *   );
 *
 * @param {number} [width] - pixels wide the resultant image should be. Use `null` or `undefined` to auto-scale the width to match the height.
 * @param {number} [height] - pixels high the resultant image should be. Use `null` or `undefined` to auto-scale the height to match the width.
 * @param {Object} [options]
 * @param {String} [options.width] - alternative means of specifying `width`. If both are present this take priority.
 * @param {String} [options.height] - alternative means of specifying `height`. If both are present this take priority.
 * @param {String} [options.fit='cover'] - how the image should be resized to fit both provided dimensions, one of `cover`, `contain`, `fill`, `inside` or `outside`.
 * @param {String} [options.position='centre'] - position, gravity or strategy to use when `fit` is `cover` or `contain`.
 * @param {String|Object} [options.background={r: 0, g: 0, b: 0, alpha: 1}] - background colour when using a `fit` of `contain`, parsed by the [color](https://www.npmjs.org/package/color) module, defaults to black without transparency.
 * @param {String} [options.kernel='lanczos3'] - the kernel to use for image reduction.
 * @param {Boolean} [options.withoutEnlargement=false] - do not enlarge if the width *or* height are already less than the specified dimensions, equivalent to GraphicsMagick's `>` geometry option.
 * @param {Boolean} [options.withoutReduction=false] - do not reduce if the width *or* height are already greater than the specified dimensions, equivalent to GraphicsMagick's `<` geometry option.
 * @param {Boolean} [options.fastShrinkOnLoad=true] - take greater advantage of the JPEG and WebP shrink-on-load feature, which can lead to a slight moiré pattern on some images.
 * @returns {Sharp}
 * @throws {Error} Invalid parameters
 */
function resize (width, height, options) {
  if (is.defined(width)) {
    if (is.object(width) && !is.defined(options)) {
      options = width;
    } else if (is.integer(width) && width > 0) {
      this.options.width = width;
    } else {
      throw is.invalidParameterError('width', 'positive integer', width);
    }
  } else {
    this.options.width = -1;
  }
  if (is.defined(height)) {
    if (is.integer(height) && height > 0) {
      this.options.height = height;
    } else {
      throw is.invalidParameterError('height', 'positive integer', height);
    }
  } else {
    this.options.height = -1;
  }
  if (is.object(options)) {
    // Width
    if (is.defined(options.width)) {
      if (is.integer(options.width) && options.width > 0) {
        this.options.width = options.width;
      } else {
        throw is.invalidParameterError('width', 'positive integer', options.width);
      }
    }
    // Height
    if (is.defined(options.height)) {
      if (is.integer(options.height) && options.height > 0) {
        this.options.height = options.height;
      } else {
        throw is.invalidParameterError('height', 'positive integer', options.height);
      }
    }
    // Fit
    if (is.defined(options.fit)) {
      const canvas = mapFitToCanvas[options.fit];
      if (is.string(canvas)) {
        this.options.canvas = canvas;
      } else {
        throw is.invalidParameterError('fit', 'valid fit', options.fit);
      }
    }
    // Position
    if (is.defined(options.position)) {
      const pos = is.integer(options.position)
        ? options.position
        : strategy[options.position] || position[options.position] || gravity[options.position];
      if (is.integer(pos) && (is.inRange(pos, 0, 8) || is.inRange(pos, 16, 17))) {
        this.options.position = pos;
      } else {
        throw is.invalidParameterError('position', 'valid position/gravity/strategy', options.position);
      }
    }
    // Background
    this._setBackgroundColourOption('resizeBackground', options.background);
    // Kernel
    if (is.defined(options.kernel)) {
      if (is.string(kernel[options.kernel])) {
        this.options.kernel = kernel[options.kernel];
      } else {
        throw is.invalidParameterError('kernel', 'valid kernel name', options.kernel);
      }
    }
    // Without enlargement
    if (is.defined(options.withoutEnlargement)) {
      this._setBooleanOption('withoutEnlargement', options.withoutEnlargement);
    }
    // Without reduction
    if (is.defined(options.withoutReduction)) {
      this._setBooleanOption('withoutReduction', options.withoutReduction);
    }
    // Shrink on load
    if (is.defined(options.fastShrinkOnLoad)) {
      this._setBooleanOption('fastShrinkOnLoad', options.fastShrinkOnLoad);
    }
  }
  return this;
}

/**
 * Extends/pads the edges of the image with the provided background colour.
 * This operation will always occur after resizing and extraction, if any.
 *
 * @example
 * // Resize to 140 pixels wide, then add 10 transparent pixels
 * // to the top, left and right edges and 20 to the bottom edge
 * sharp(input)
 *   .resize(140)
 *   .extend({
 *     top: 10,
 *     bottom: 20,
 *     left: 10,
 *     right: 10,
 *     background: { r: 0, g: 0, b: 0, alpha: 0 }
 *   })
 *   ...
 *
* @example
 * // Add a row of 10 red pixels to the bottom
 * sharp(input)
 *   .extend({
 *     bottom: 10,
 *     background: 'red'
 *   })
 *   ...
 *
 * @param {(number|Object)} extend - single pixel count to add to all edges or an Object with per-edge counts
 * @param {number} [extend.top=0]
 * @param {number} [extend.left=0]
 * @param {number} [extend.bottom=0]
 * @param {number} [extend.right=0]
 * @param {String|Object} [extend.background={r: 0, g: 0, b: 0, alpha: 1}] - background colour, parsed by the [color](https://www.npmjs.org/package/color) module, defaults to black without transparency.
 * @returns {Sharp}
 * @throws {Error} Invalid parameters
*/
function extend (extend) {
  if (is.integer(extend) && extend > 0) {
    this.options.extendTop = extend;
    this.options.extendBottom = extend;
    this.options.extendLeft = extend;
    this.options.extendRight = extend;
  } else if (is.object(extend)) {
    if (is.defined(extend.top)) {
      if (is.integer(extend.top) && extend.top >= 0) {
        this.options.extendTop = extend.top;
      } else {
        throw is.invalidParameterError('top', 'positive integer', extend.top);
      }
    }
    if (is.defined(extend.bottom)) {
      if (is.integer(extend.bottom) && extend.bottom >= 0) {
        this.options.extendBottom = extend.bottom;
      } else {
        throw is.invalidParameterError('bottom', 'positive integer', extend.bottom);
      }
    }
    if (is.defined(extend.left)) {
      if (is.integer(extend.left) && extend.left >= 0) {
        this.options.extendLeft = extend.left;
      } else {
        throw is.invalidParameterError('left', 'positive integer', extend.left);
      }
    }
    if (is.defined(extend.right)) {
      if (is.integer(extend.right) && extend.right >= 0) {
        this.options.extendRight = extend.right;
      } else {
        throw is.invalidParameterError('right', 'positive integer', extend.right);
      }
    }
    this._setBackgroundColourOption('extendBackground', extend.background);
  } else {
    throw is.invalidParameterError('extend', 'integer or object', extend);
  }
  return this;
}

/**
 * Extract/crop a region of the image.
 *
 * - Use `extract` before `resize` for pre-resize extraction.
 * - Use `extract` after `resize` for post-resize extraction.
 * - Use `extract` before and after for both.
 *
 * @example
 * sharp(input)
 *   .extract({ left: left, top: top, width: width, height: height })
 *   .toFile(output, function(err) {
 *     // Extract a region of the input image, saving in the same format.
 *   });
 * @example
 * sharp(input)
 *   .extract({ left: leftOffsetPre, top: topOffsetPre, width: widthPre, height: heightPre })
 *   .resize(width, height)
 *   .extract({ left: leftOffsetPost, top: topOffsetPost, width: widthPost, height: heightPost })
 *   .toFile(output, function(err) {
 *     // Extract a region, resize, then extract from the resized image
 *   });
 *
 * @param {Object} options - describes the region to extract using integral pixel values
 * @param {number} options.left - zero-indexed offset from left edge
 * @param {number} options.top - zero-indexed offset from top edge
 * @param {number} options.width - width of region to extract
 * @param {number} options.height - height of region to extract
 * @returns {Sharp}
 * @throws {Error} Invalid parameters
 */
function extract (options) {
  const suffix = this.options.width === -1 && this.options.height === -1 ? 'Pre' : 'Post';
  ['left', 'top', 'width', 'height'].forEach(function (name) {
    const value = options[name];
    if (is.integer(value) && value >= 0) {
      this.options[name + (name === 'left' || name === 'top' ? 'Offset' : '') + suffix] = value;
    } else {
      throw is.invalidParameterError(name, 'integer', value);
    }
  }, this);
  // Ensure existing rotation occurs before pre-resize extraction
  if (suffix === 'Pre' && isRotationExpected(this.options)) {
    this.options.rotateBeforePreExtract = true;
  }
  return this;
}

/**
 * Trim "boring" pixels from all edges that contain values similar to the top-left pixel.
 * Images consisting entirely of a single colour will calculate "boring" using the alpha channel, if any.
 *
 * The `info` response Object, obtained from callback of `.toFile()` or `.toBuffer()`,
 * will contain `trimOffsetLeft` and `trimOffsetTop` properties.
 *
 * @param {number} [threshold=10] the allowed difference from the top-left pixel, a number greater than zero.
 * @returns {Sharp}
 * @throws {Error} Invalid parameters
 */
function trim (threshold) {
  if (!is.defined(threshold)) {
    this.options.trimThreshold = 10;
  } else if (is.number(threshold) && threshold > 0) {
    this.options.trimThreshold = threshold;
  } else {
    throw is.invalidParameterError('threshold', 'number greater than zero', threshold);
  }
  if (this.options.trimThreshold && isRotationExpected(this.options)) {
    this.options.rotateBeforePreExtract = true;
  }
  return this;
}

/**
 * Decorate the Sharp prototype with resize-related functions.
 * @private
 */
module.exports = function (Sharp) {
  Object.assign(Sharp.prototype, {
    resize,
    extend,
    extract,
    trim
  });
  // Class attributes
  Sharp.gravity = gravity;
  Sharp.strategy = strategy;
  Sharp.kernel = kernel;
  Sharp.fit = fit;
  Sharp.position = position;
};


/***/ }),

/***/ 382:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

function __ncc_wildcard$0 (arg) {
  if (arg === "linux-x64") return __nccwpck_require__(460);
}
'use strict';

const platformAndArch = __nccwpck_require__(998)();

/* istanbul ignore next */
try {
  module.exports = __ncc_wildcard$0(platformAndArch);
} catch (err) {
  // Bail early if bindings aren't available
  const help = ['', 'Something went wrong installing the "sharp" module', '', err.message, '', 'Possible solutions:'];
  if (/dylib/.test(err.message) && /Incompatible library version/.test(err.message)) {
    help.push('- Update Homebrew: "brew update && brew upgrade vips"');
  } else {
    const [platform, arch] = platformAndArch.split('-');
    help.push(
      '- Install with verbose logging and look for errors: "npm install --ignore-scripts=false --foreground-scripts --verbose sharp"',
      `- Install for the current ${platformAndArch} runtime: "npm install --platform=${platform} --arch=${arch} sharp"`
    );
  }
  help.push(
    '- Consult the installation documentation: https://sharp.pixelplumbing.com/install'
  );
  // Check loaded
  if (process.platform === 'win32' || /symbol/.test(err.message)) {
    const loadedModule = Object.keys(require.cache).find((i) => /[\\/]build[\\/]Release[\\/]sharp(.*)\.node$/.test(i));
    if (loadedModule) {
      const [, loadedPackage] = loadedModule.match(/node_modules[\\/]([^\\/]+)[\\/]/);
      help.push(`- Ensure the version of sharp aligns with the ${loadedPackage} package: "npm ls sharp"`);
    }
  }
  throw new Error(help.join('\n'));
}


/***/ }),

/***/ 927:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


const fs = __nccwpck_require__(147);
const path = __nccwpck_require__(17);
const events = __nccwpck_require__(361);
const detectLibc = __nccwpck_require__(889);

const is = __nccwpck_require__(768);
const platformAndArch = __nccwpck_require__(998)();
const sharp = __nccwpck_require__(382);

/**
 * An Object containing nested boolean values representing the available input and output formats/methods.
 * @member
 * @example
 * console.log(sharp.format);
 * @returns {Object}
 */
const format = sharp.format();

/**
 * An Object containing the available interpolators and their proper values
 * @readonly
 * @enum {string}
 */
const interpolators = {
  /** [Nearest neighbour interpolation](http://en.wikipedia.org/wiki/Nearest-neighbor_interpolation). Suitable for image enlargement only. */
  nearest: 'nearest',
  /** [Bilinear interpolation](http://en.wikipedia.org/wiki/Bilinear_interpolation). Faster than bicubic but with less smooth results. */
  bilinear: 'bilinear',
  /** [Bicubic interpolation](http://en.wikipedia.org/wiki/Bicubic_interpolation) (the default). */
  bicubic: 'bicubic',
  /** [LBB interpolation](https://github.com/libvips/libvips/blob/master/libvips/resample/lbb.cpp#L100). Prevents some "[acutance](http://en.wikipedia.org/wiki/Acutance)" but typically reduces performance by a factor of 2. */
  locallyBoundedBicubic: 'lbb',
  /** [Nohalo interpolation](http://eprints.soton.ac.uk/268086/). Prevents acutance but typically reduces performance by a factor of 3. */
  nohalo: 'nohalo',
  /** [VSQBS interpolation](https://github.com/libvips/libvips/blob/master/libvips/resample/vsqbs.cpp#L48). Prevents "staircasing" when enlarging. */
  vertexSplitQuadraticBasisSpline: 'vsqbs'
};

/**
 * An Object containing the version numbers of libvips and its dependencies.
 * @member
 * @example
 * console.log(sharp.versions);
 */
let versions = {
  vips: sharp.libvipsVersion()
};
try {
  versions = require(`../vendor/${versions.vips}/${platformAndArch}/versions.json`);
} catch (_err) { /* ignore */ }

/**
 * An Object containing the platform and architecture
 * of the current and installed vendored binaries.
 * @member
 * @example
 * console.log(sharp.vendor);
 */
const vendor = {
  current: platformAndArch,
  installed: []
};
try {
  vendor.installed = fs.readdirSync(__nccwpck_require__.ab + "vendor/" + versions.vips);
} catch (_err) { /* ignore */ }

/**
 * Gets or, when options are provided, sets the limits of _libvips'_ operation cache.
 * Existing entries in the cache will be trimmed after any change in limits.
 * This method always returns cache statistics,
 * useful for determining how much working memory is required for a particular task.
 *
 * @example
 * const stats = sharp.cache();
 * @example
 * sharp.cache( { items: 200 } );
 * sharp.cache( { files: 0 } );
 * sharp.cache(false);
 *
 * @param {Object|boolean} [options=true] - Object with the following attributes, or boolean where true uses default cache settings and false removes all caching
 * @param {number} [options.memory=50] - is the maximum memory in MB to use for this cache
 * @param {number} [options.files=20] - is the maximum number of files to hold open
 * @param {number} [options.items=100] - is the maximum number of operations to cache
 * @returns {Object}
 */
function cache (options) {
  if (is.bool(options)) {
    if (options) {
      // Default cache settings of 50MB, 20 files, 100 items
      return sharp.cache(50, 20, 100);
    } else {
      return sharp.cache(0, 0, 0);
    }
  } else if (is.object(options)) {
    return sharp.cache(options.memory, options.files, options.items);
  } else {
    return sharp.cache();
  }
}
cache(true);

/**
 * Gets or, when a concurrency is provided, sets
 * the maximum number of threads _libvips_ should use to process _each image_.
 * These are from a thread pool managed by glib,
 * which helps avoid the overhead of creating new threads.
 *
 * This method always returns the current concurrency.
 *
 * The default value is the number of CPU cores,
 * except when using glibc-based Linux without jemalloc,
 * where the default is `1` to help reduce memory fragmentation.
 *
 * A value of `0` will reset this to the number of CPU cores.
 *
 * Some image format libraries spawn additional threads,
 * e.g. libaom manages its own 4 threads when encoding AVIF images,
 * and these are independent of the value set here.
 *
 * The maximum number of images that sharp can process in parallel
 * is controlled by libuv's `UV_THREADPOOL_SIZE` environment variable,
 * which defaults to 4.
 *
 * https://nodejs.org/api/cli.html#uv_threadpool_sizesize
 *
 * For example, by default, a machine with 8 CPU cores will process
 * 4 images in parallel and use up to 8 threads per image,
 * so there will be up to 32 concurrent threads.
 *
 * @example
 * const threads = sharp.concurrency(); // 4
 * sharp.concurrency(2); // 2
 * sharp.concurrency(0); // 4
 *
 * @param {number} [concurrency]
 * @returns {number} concurrency
 */
function concurrency (concurrency) {
  return sharp.concurrency(is.integer(concurrency) ? concurrency : null);
}
/* istanbul ignore next */
if (detectLibc.familySync() === detectLibc.GLIBC && !sharp._isUsingJemalloc()) {
  // Reduce default concurrency to 1 when using glibc memory allocator
  sharp.concurrency(1);
}

/**
 * An EventEmitter that emits a `change` event when a task is either:
 * - queued, waiting for _libuv_ to provide a worker thread
 * - complete
 * @member
 * @example
 * sharp.queue.on('change', function(queueLength) {
 *   console.log('Queue contains ' + queueLength + ' task(s)');
 * });
 */
const queue = new events.EventEmitter();

/**
 * Provides access to internal task counters.
 * - queue is the number of tasks this module has queued waiting for _libuv_ to provide a worker thread from its pool.
 * - process is the number of resize tasks currently being processed.
 *
 * @example
 * const counters = sharp.counters(); // { queue: 2, process: 4 }
 *
 * @returns {Object}
 */
function counters () {
  return sharp.counters();
}

/**
 * Get and set use of SIMD vector unit instructions.
 * Requires libvips to have been compiled with liborc support.
 *
 * Improves the performance of `resize`, `blur` and `sharpen` operations
 * by taking advantage of the SIMD vector unit of the CPU, e.g. Intel SSE and ARM NEON.
 *
 * @example
 * const simd = sharp.simd();
 * // simd is `true` if the runtime use of liborc is currently enabled
 * @example
 * const simd = sharp.simd(false);
 * // prevent libvips from using liborc at runtime
 *
 * @param {boolean} [simd=true]
 * @returns {boolean}
 */
function simd (simd) {
  return sharp.simd(is.bool(simd) ? simd : null);
}
simd(true);

/**
 * Decorate the Sharp class with utility-related functions.
 * @private
 */
module.exports = function (Sharp) {
  Sharp.cache = cache;
  Sharp.concurrency = concurrency;
  Sharp.counters = counters;
  Sharp.simd = simd;
  Sharp.format = format;
  Sharp.interpolators = interpolators;
  Sharp.versions = versions;
  Sharp.vendor = vendor;
  Sharp.queue = queue;
};


/***/ }),

/***/ 867:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const debug = __nccwpck_require__(455)
const { MAX_LENGTH, MAX_SAFE_INTEGER } = __nccwpck_require__(665)
const { re, t } = __nccwpck_require__(521)

const parseOptions = __nccwpck_require__(197)
const { compareIdentifiers } = __nccwpck_require__(682)
class SemVer {
  constructor (version, options) {
    options = parseOptions(options)

    if (version instanceof SemVer) {
      if (version.loose === !!options.loose &&
          version.includePrerelease === !!options.includePrerelease) {
        return version
      } else {
        version = version.version
      }
    } else if (typeof version !== 'string') {
      throw new TypeError(`Invalid Version: ${version}`)
    }

    if (version.length > MAX_LENGTH) {
      throw new TypeError(
        `version is longer than ${MAX_LENGTH} characters`
      )
    }

    debug('SemVer', version, options)
    this.options = options
    this.loose = !!options.loose
    // this isn't actually relevant for versions, but keep it so that we
    // don't run into trouble passing this.options around.
    this.includePrerelease = !!options.includePrerelease

    const m = version.trim().match(options.loose ? re[t.LOOSE] : re[t.FULL])

    if (!m) {
      throw new TypeError(`Invalid Version: ${version}`)
    }

    this.raw = version

    // these are actually numbers
    this.major = +m[1]
    this.minor = +m[2]
    this.patch = +m[3]

    if (this.major > MAX_SAFE_INTEGER || this.major < 0) {
      throw new TypeError('Invalid major version')
    }

    if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) {
      throw new TypeError('Invalid minor version')
    }

    if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) {
      throw new TypeError('Invalid patch version')
    }

    // numberify any prerelease numeric ids
    if (!m[4]) {
      this.prerelease = []
    } else {
      this.prerelease = m[4].split('.').map((id) => {
        if (/^[0-9]+$/.test(id)) {
          const num = +id
          if (num >= 0 && num < MAX_SAFE_INTEGER) {
            return num
          }
        }
        return id
      })
    }

    this.build = m[5] ? m[5].split('.') : []
    this.format()
  }

  format () {
    this.version = `${this.major}.${this.minor}.${this.patch}`
    if (this.prerelease.length) {
      this.version += `-${this.prerelease.join('.')}`
    }
    return this.version
  }

  toString () {
    return this.version
  }

  compare (other) {
    debug('SemVer.compare', this.version, this.options, other)
    if (!(other instanceof SemVer)) {
      if (typeof other === 'string' && other === this.version) {
        return 0
      }
      other = new SemVer(other, this.options)
    }

    if (other.version === this.version) {
      return 0
    }

    return this.compareMain(other) || this.comparePre(other)
  }

  compareMain (other) {
    if (!(other instanceof SemVer)) {
      other = new SemVer(other, this.options)
    }

    return (
      compareIdentifiers(this.major, other.major) ||
      compareIdentifiers(this.minor, other.minor) ||
      compareIdentifiers(this.patch, other.patch)
    )
  }

  comparePre (other) {
    if (!(other instanceof SemVer)) {
      other = new SemVer(other, this.options)
    }

    // NOT having a prerelease is > having one
    if (this.prerelease.length && !other.prerelease.length) {
      return -1
    } else if (!this.prerelease.length && other.prerelease.length) {
      return 1
    } else if (!this.prerelease.length && !other.prerelease.length) {
      return 0
    }

    let i = 0
    do {
      const a = this.prerelease[i]
      const b = other.prerelease[i]
      debug('prerelease compare', i, a, b)
      if (a === undefined && b === undefined) {
        return 0
      } else if (b === undefined) {
        return 1
      } else if (a === undefined) {
        return -1
      } else if (a === b) {
        continue
      } else {
        return compareIdentifiers(a, b)
      }
    } while (++i)
  }

  compareBuild (other) {
    if (!(other instanceof SemVer)) {
      other = new SemVer(other, this.options)
    }

    let i = 0
    do {
      const a = this.build[i]
      const b = other.build[i]
      debug('prerelease compare', i, a, b)
      if (a === undefined && b === undefined) {
        return 0
      } else if (b === undefined) {
        return 1
      } else if (a === undefined) {
        return -1
      } else if (a === b) {
        continue
      } else {
        return compareIdentifiers(a, b)
      }
    } while (++i)
  }

  // preminor will bump the version up to the next minor release, and immediately
  // down to pre-release. premajor and prepatch work the same way.
  inc (release, identifier) {
    switch (release) {
      case 'premajor':
        this.prerelease.length = 0
        this.patch = 0
        this.minor = 0
        this.major++
        this.inc('pre', identifier)
        break
      case 'preminor':
        this.prerelease.length = 0
        this.patch = 0
        this.minor++
        this.inc('pre', identifier)
        break
      case 'prepatch':
        // If this is already a prerelease, it will bump to the next version
        // drop any prereleases that might already exist, since they are not
        // relevant at this point.
        this.prerelease.length = 0
        this.inc('patch', identifier)
        this.inc('pre', identifier)
        break
      // If the input is a non-prerelease version, this acts the same as
      // prepatch.
      case 'prerelease':
        if (this.prerelease.length === 0) {
          this.inc('patch', identifier)
        }
        this.inc('pre', identifier)
        break

      case 'major':
        // If this is a pre-major version, bump up to the same major version.
        // Otherwise increment major.
        // 1.0.0-5 bumps to 1.0.0
        // 1.1.0 bumps to 2.0.0
        if (
          this.minor !== 0 ||
          this.patch !== 0 ||
          this.prerelease.length === 0
        ) {
          this.major++
        }
        this.minor = 0
        this.patch = 0
        this.prerelease = []
        break
      case 'minor':
        // If this is a pre-minor version, bump up to the same minor version.
        // Otherwise increment minor.
        // 1.2.0-5 bumps to 1.2.0
        // 1.2.1 bumps to 1.3.0
        if (this.patch !== 0 || this.prerelease.length === 0) {
          this.minor++
        }
        this.patch = 0
        this.prerelease = []
        break
      case 'patch':
        // If this is not a pre-release version, it will increment the patch.
        // If it is a pre-release it will bump up to the same patch version.
        // 1.2.0-5 patches to 1.2.0
        // 1.2.0 patches to 1.2.1
        if (this.prerelease.length === 0) {
          this.patch++
        }
        this.prerelease = []
        break
      // This probably shouldn't be used publicly.
      // 1.0.0 'pre' would become 1.0.0-0 which is the wrong direction.
      case 'pre':
        if (this.prerelease.length === 0) {
          this.prerelease = [0]
        } else {
          let i = this.prerelease.length
          while (--i >= 0) {
            if (typeof this.prerelease[i] === 'number') {
              this.prerelease[i]++
              i = -2
            }
          }
          if (i === -1) {
            // didn't increment anything
            this.prerelease.push(0)
          }
        }
        if (identifier) {
          // 1.2.0-beta.1 bumps to 1.2.0-beta.2,
          // 1.2.0-beta.fooblz or 1.2.0-beta bumps to 1.2.0-beta.0
          if (compareIdentifiers(this.prerelease[0], identifier) === 0) {
            if (isNaN(this.prerelease[1])) {
              this.prerelease = [identifier, 0]
            }
          } else {
            this.prerelease = [identifier, 0]
          }
        }
        break

      default:
        throw new Error(`invalid increment argument: ${release}`)
    }
    this.format()
    this.raw = this.version
    return this
  }
}

module.exports = SemVer


/***/ }),

/***/ 73:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const SemVer = __nccwpck_require__(867)
const parse = __nccwpck_require__(200)
const { re, t } = __nccwpck_require__(521)

const coerce = (version, options) => {
  if (version instanceof SemVer) {
    return version
  }

  if (typeof version === 'number') {
    version = String(version)
  }

  if (typeof version !== 'string') {
    return null
  }

  options = options || {}

  let match = null
  if (!options.rtl) {
    match = version.match(re[t.COERCE])
  } else {
    // Find the right-most coercible string that does not share
    // a terminus with a more left-ward coercible string.
    // Eg, '1.2.3.4' wants to coerce '2.3.4', not '3.4' or '4'
    //
    // Walk through the string checking with a /g regexp
    // Manually set the index so as to pick up overlapping matches.
    // Stop when we get a match that ends at the string end, since no
    // coercible string can be more right-ward without the same terminus.
    let next
    while ((next = re[t.COERCERTL].exec(version)) &&
        (!match || match.index + match[0].length !== version.length)
    ) {
      if (!match ||
            next.index + next[0].length !== match.index + match[0].length) {
        match = next
      }
      re[t.COERCERTL].lastIndex = next.index + next[1].length + next[2].length
    }
    // leave it in a clean state
    re[t.COERCERTL].lastIndex = -1
  }

  if (match === null) {
    return null
  }

  return parse(`${match[2]}.${match[3] || '0'}.${match[4] || '0'}`, options)
}
module.exports = coerce


/***/ }),

/***/ 925:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const SemVer = __nccwpck_require__(867)
const compare = (a, b, loose) =>
  new SemVer(a, loose).compare(new SemVer(b, loose))

module.exports = compare


/***/ }),

/***/ 343:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const compare = __nccwpck_require__(925)
const gte = (a, b, loose) => compare(a, b, loose) >= 0
module.exports = gte


/***/ }),

/***/ 200:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { MAX_LENGTH } = __nccwpck_require__(665)
const { re, t } = __nccwpck_require__(521)
const SemVer = __nccwpck_require__(867)

const parseOptions = __nccwpck_require__(197)
const parse = (version, options) => {
  options = parseOptions(options)

  if (version instanceof SemVer) {
    return version
  }

  if (typeof version !== 'string') {
    return null
  }

  if (version.length > MAX_LENGTH) {
    return null
  }

  const r = options.loose ? re[t.LOOSE] : re[t.FULL]
  if (!r.test(version)) {
    return null
  }

  try {
    return new SemVer(version, options)
  } catch (er) {
    return null
  }
}

module.exports = parse


/***/ }),

/***/ 665:
/***/ ((module) => {

// Note: this is the semver.org version of the spec that it implements
// Not necessarily the package version of this code.
const SEMVER_SPEC_VERSION = '2.0.0'

const MAX_LENGTH = 256
const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER ||
/* istanbul ignore next */ 9007199254740991

// Max safe segment length for coercion.
const MAX_SAFE_COMPONENT_LENGTH = 16

module.exports = {
  SEMVER_SPEC_VERSION,
  MAX_LENGTH,
  MAX_SAFE_INTEGER,
  MAX_SAFE_COMPONENT_LENGTH,
}


/***/ }),

/***/ 455:
/***/ ((module) => {

const debug = (
  typeof process === 'object' &&
  process.env &&
  process.env.NODE_DEBUG &&
  /\bsemver\b/i.test(process.env.NODE_DEBUG)
) ? (...args) => console.error('SEMVER', ...args)
  : () => {}

module.exports = debug


/***/ }),

/***/ 682:
/***/ ((module) => {

const numeric = /^[0-9]+$/
const compareIdentifiers = (a, b) => {
  const anum = numeric.test(a)
  const bnum = numeric.test(b)

  if (anum && bnum) {
    a = +a
    b = +b
  }

  return a === b ? 0
    : (anum && !bnum) ? -1
    : (bnum && !anum) ? 1
    : a < b ? -1
    : 1
}

const rcompareIdentifiers = (a, b) => compareIdentifiers(b, a)

module.exports = {
  compareIdentifiers,
  rcompareIdentifiers,
}


/***/ }),

/***/ 197:
/***/ ((module) => {

// parse out just the options we care about so we always get a consistent
// obj with keys in a consistent order.
const opts = ['includePrerelease', 'loose', 'rtl']
const parseOptions = options =>
  !options ? {}
  : typeof options !== 'object' ? { loose: true }
  : opts.filter(k => options[k]).reduce((o, k) => {
    o[k] = true
    return o
  }, {})
module.exports = parseOptions


/***/ }),

/***/ 521:
/***/ ((module, exports, __nccwpck_require__) => {

const { MAX_SAFE_COMPONENT_LENGTH } = __nccwpck_require__(665)
const debug = __nccwpck_require__(455)
exports = module.exports = {}

// The actual regexps go on exports.re
const re = exports.re = []
const src = exports.src = []
const t = exports.t = {}
let R = 0

const createToken = (name, value, isGlobal) => {
  const index = R++
  debug(name, index, value)
  t[name] = index
  src[index] = value
  re[index] = new RegExp(value, isGlobal ? 'g' : undefined)
}

// The following Regular Expressions can be used for tokenizing,
// validating, and parsing SemVer version strings.

// ## Numeric Identifier
// A single `0`, or a non-zero digit followed by zero or more digits.

createToken('NUMERICIDENTIFIER', '0|[1-9]\\d*')
createToken('NUMERICIDENTIFIERLOOSE', '[0-9]+')

// ## Non-numeric Identifier
// Zero or more digits, followed by a letter or hyphen, and then zero or
// more letters, digits, or hyphens.

createToken('NONNUMERICIDENTIFIER', '\\d*[a-zA-Z-][a-zA-Z0-9-]*')

// ## Main Version
// Three dot-separated numeric identifiers.

createToken('MAINVERSION', `(${src[t.NUMERICIDENTIFIER]})\\.` +
                   `(${src[t.NUMERICIDENTIFIER]})\\.` +
                   `(${src[t.NUMERICIDENTIFIER]})`)

createToken('MAINVERSIONLOOSE', `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.` +
                        `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.` +
                        `(${src[t.NUMERICIDENTIFIERLOOSE]})`)

// ## Pre-release Version Identifier
// A numeric identifier, or a non-numeric identifier.

createToken('PRERELEASEIDENTIFIER', `(?:${src[t.NUMERICIDENTIFIER]
}|${src[t.NONNUMERICIDENTIFIER]})`)

createToken('PRERELEASEIDENTIFIERLOOSE', `(?:${src[t.NUMERICIDENTIFIERLOOSE]
}|${src[t.NONNUMERICIDENTIFIER]})`)

// ## Pre-release Version
// Hyphen, followed by one or more dot-separated pre-release version
// identifiers.

createToken('PRERELEASE', `(?:-(${src[t.PRERELEASEIDENTIFIER]
}(?:\\.${src[t.PRERELEASEIDENTIFIER]})*))`)

createToken('PRERELEASELOOSE', `(?:-?(${src[t.PRERELEASEIDENTIFIERLOOSE]
}(?:\\.${src[t.PRERELEASEIDENTIFIERLOOSE]})*))`)

// ## Build Metadata Identifier
// Any combination of digits, letters, or hyphens.

createToken('BUILDIDENTIFIER', '[0-9A-Za-z-]+')

// ## Build Metadata
// Plus sign, followed by one or more period-separated build metadata
// identifiers.

createToken('BUILD', `(?:\\+(${src[t.BUILDIDENTIFIER]
}(?:\\.${src[t.BUILDIDENTIFIER]})*))`)

// ## Full Version String
// A main version, followed optionally by a pre-release version and
// build metadata.

// Note that the only major, minor, patch, and pre-release sections of
// the version string are capturing groups.  The build metadata is not a
// capturing group, because it should not ever be used in version
// comparison.

createToken('FULLPLAIN', `v?${src[t.MAINVERSION]
}${src[t.PRERELEASE]}?${
  src[t.BUILD]}?`)

createToken('FULL', `^${src[t.FULLPLAIN]}$`)

// like full, but allows v1.2.3 and =1.2.3, which people do sometimes.
// also, 1.0.0alpha1 (prerelease without the hyphen) which is pretty
// common in the npm registry.
createToken('LOOSEPLAIN', `[v=\\s]*${src[t.MAINVERSIONLOOSE]
}${src[t.PRERELEASELOOSE]}?${
  src[t.BUILD]}?`)

createToken('LOOSE', `^${src[t.LOOSEPLAIN]}$`)

createToken('GTLT', '((?:<|>)?=?)')

// Something like "2.*" or "1.2.x".
// Note that "x.x" is a valid xRange identifer, meaning "any version"
// Only the first item is strictly required.
createToken('XRANGEIDENTIFIERLOOSE', `${src[t.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`)
createToken('XRANGEIDENTIFIER', `${src[t.NUMERICIDENTIFIER]}|x|X|\\*`)

createToken('XRANGEPLAIN', `[v=\\s]*(${src[t.XRANGEIDENTIFIER]})` +
                   `(?:\\.(${src[t.XRANGEIDENTIFIER]})` +
                   `(?:\\.(${src[t.XRANGEIDENTIFIER]})` +
                   `(?:${src[t.PRERELEASE]})?${
                     src[t.BUILD]}?` +
                   `)?)?`)

createToken('XRANGEPLAINLOOSE', `[v=\\s]*(${src[t.XRANGEIDENTIFIERLOOSE]})` +
                        `(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})` +
                        `(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})` +
                        `(?:${src[t.PRERELEASELOOSE]})?${
                          src[t.BUILD]}?` +
                        `)?)?`)

createToken('XRANGE', `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAIN]}$`)
createToken('XRANGELOOSE', `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAINLOOSE]}$`)

// Coercion.
// Extract anything that could conceivably be a part of a valid semver
createToken('COERCE', `${'(^|[^\\d])' +
              '(\\d{1,'}${MAX_SAFE_COMPONENT_LENGTH}})` +
              `(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?` +
              `(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?` +
              `(?:$|[^\\d])`)
createToken('COERCERTL', src[t.COERCE], true)

// Tilde ranges.
// Meaning is "reasonably at or greater than"
createToken('LONETILDE', '(?:~>?)')

createToken('TILDETRIM', `(\\s*)${src[t.LONETILDE]}\\s+`, true)
exports.tildeTrimReplace = '$1~'

createToken('TILDE', `^${src[t.LONETILDE]}${src[t.XRANGEPLAIN]}$`)
createToken('TILDELOOSE', `^${src[t.LONETILDE]}${src[t.XRANGEPLAINLOOSE]}$`)

// Caret ranges.
// Meaning is "at least and backwards compatible with"
createToken('LONECARET', '(?:\\^)')

createToken('CARETTRIM', `(\\s*)${src[t.LONECARET]}\\s+`, true)
exports.caretTrimReplace = '$1^'

createToken('CARET', `^${src[t.LONECARET]}${src[t.XRANGEPLAIN]}$`)
createToken('CARETLOOSE', `^${src[t.LONECARET]}${src[t.XRANGEPLAINLOOSE]}$`)

// A simple gt/lt/eq thing, or just "" to indicate "any version"
createToken('COMPARATORLOOSE', `^${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]})$|^$`)
createToken('COMPARATOR', `^${src[t.GTLT]}\\s*(${src[t.FULLPLAIN]})$|^$`)

// An expression to strip any whitespace between the gtlt and the thing
// it modifies, so that `> 1.2.3` ==> `>1.2.3`
createToken('COMPARATORTRIM', `(\\s*)${src[t.GTLT]
}\\s*(${src[t.LOOSEPLAIN]}|${src[t.XRANGEPLAIN]})`, true)
exports.comparatorTrimReplace = '$1$2$3'

// Something like `1.2.3 - 1.2.4`
// Note that these all use the loose form, because they'll be
// checked against either the strict or loose comparator form
// later.
createToken('HYPHENRANGE', `^\\s*(${src[t.XRANGEPLAIN]})` +
                   `\\s+-\\s+` +
                   `(${src[t.XRANGEPLAIN]})` +
                   `\\s*$`)

createToken('HYPHENRANGELOOSE', `^\\s*(${src[t.XRANGEPLAINLOOSE]})` +
                        `\\s+-\\s+` +
                        `(${src[t.XRANGEPLAINLOOSE]})` +
                        `\\s*$`)

// Star ranges basically just allow anything at all.
createToken('STAR', '(<|>)?=?\\s*\\*')
// >=0.0.0 is like a star
createToken('GTE0', '^\\s*>=\\s*0\\.0\\.0\\s*$')
createToken('GTE0PRE', '^\\s*>=\\s*0\\.0\\.0-0\\s*$')


/***/ }),

/***/ 679:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


var isArrayish = __nccwpck_require__(542);

var concat = Array.prototype.concat;
var slice = Array.prototype.slice;

var swizzle = module.exports = function swizzle(args) {
	var results = [];

	for (var i = 0, len = args.length; i < len; i++) {
		var arg = args[i];

		if (isArrayish(arg)) {
			// http://jsperf.com/javascript-array-concat-vs-push/98
			results = concat.call(results, slice.call(arg));
		} else {
			results.push(arg);
		}
	}

	return results;
};

swizzle.wrap = function (fn) {
	return function () {
		return fn(swizzle(arguments));
	};
};


/***/ }),

/***/ 542:
/***/ ((module) => {

module.exports = function isArrayish(obj) {
	if (!obj || typeof obj === 'string') {
		return false;
	}

	return obj instanceof Array || Array.isArray(obj) ||
		(obj.length >= 0 && (obj.splice instanceof Function ||
			(Object.getOwnPropertyDescriptor(obj, (obj.length - 1)) && obj.constructor.name !== 'String')));
};


/***/ }),

/***/ 460:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

module.exports = require(__nccwpck_require__.ab + "build/Release/sharp-linux-x64.node")

/***/ }),

/***/ 81:
/***/ ((module) => {

"use strict";
module.exports = require("child_process");

/***/ }),

/***/ 361:
/***/ ((module) => {

"use strict";
module.exports = require("events");

/***/ }),

/***/ 147:
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ 37:
/***/ ((module) => {

"use strict";
module.exports = require("os");

/***/ }),

/***/ 17:
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ }),

/***/ 781:
/***/ ((module) => {

"use strict";
module.exports = require("stream");

/***/ }),

/***/ 837:
/***/ ((module) => {

"use strict";
module.exports = require("util");

/***/ }),

/***/ 267:
/***/ ((module) => {

"use strict";
module.exports = require("worker_threads");

/***/ }),

/***/ 598:
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('{"name":"action-visual-snapshot","version":"0.0.1","private":true,"description":"GitHub Action to diff images","main":"lib/main.js","scripts":{"build":"yarn tsc --build tsconfig.build.json && yarn tsc --build tsconfig.build.worker.json","build-template":"yarn ts-node src/template/build","benchmark":"yarn run ts-node benchmark/visual-diffs.benchmark.ts","dev:gallery":"nodemon --watch src/template/index.ejs --watch src/template/dev.ts --exec \\"ts-node\\" ./src/template/dev.ts","format":"yarn prettier --write **/*.ts","format-check":"yarn prettier --check **/*.ts","lint":"eslint src/**/*.ts","dist":"yarn build-template && yarn build && yarn dist:worker && yarn ncc build -C -s --external [sharp]","dist:worker":"yarn ncc build ./lib/SnapshotDiffWorker.js -C -s --external [sharp] && mv ./dist/index.js ./dist/SnapshotDiffWorker.js","test":"yarn test:unit && yarn test:integration","test:unit":"yarn jest -c jest.config.js","test:integration":"yarn jest -c jest.config.integration.js","all":"yarn build && yarn format && yarn lint && yarn test && yarn dist"},"repository":{"type":"git","url":"git+https://github.com/getsentry/action-visual-snapshot.git"},"os":["darwin","linux"],"config":{"libvips":"8.11.3"},"keywords":["actions","node","visual-snapshot","snapshot","testing","visual-regression"],"author":"Sentry","license":"MIT","husky":{"hooks":{"pre-commit":"lint-staged"}},"lint-staged":{"*.{html,ejs}":["yarn prettier --parser html --write"],"*.{js,jsx,ts,tsx}":["yarn eslint --fix","yarn prettier --write"]},"resolutions":{"node-forge":"^0.10.0"},"dependencies":{"@actions/artifact":"^1.1.0","@actions/core":"^1.8.2","@actions/exec":"^1.1.1","@actions/github":"^5.0.3","@actions/glob":"^0.3.0","@actions/io":"^1.1.2","@google-cloud/storage":"^5.4.0","@sentry/integrations":"^5.27.4","@sentry/node":"^5.27.4","@sentry/tracing":"^5.27.4","@types/async-retry":"^1.4.2","@types/bent":"^7.3.0","@types/ejs":"^3.0.4","@types/pngjs":"^3.4.2","@types/uuid":"^8.3.0","async-retry":"^1.3.1","bent":"^7.3.11","ejs":"^3.1.5","odiff-bin":"^2.5.0","pngjs":"^5.0.0","sharp":"^0.30.6","uuid":"^8.3.0"},"devDependencies":{"@types/jest":"^26.0.14","@types/node":"^14.0.14","@types/sharp":"^0.30.4","@typescript-eslint/eslint-plugin":"^4.4.0","@typescript-eslint/parser":"^4.4.0","@vercel/ncc":"^0.33.3","eslint":"^7.10.0","eslint-config-sentry":"^1.44.0","eslint-plugin-jest":"^24.1.0","eslint-plugin-prettier":"^3.1.4","husky":"^4.3.0","jest":"^26.5.2","jest-circus":"^26.5.2","js-yaml":"^3.13.1","lint-staged":"^10.4.0","nodemon":"^2.0.4","prettier":"^2.1.2","ts-jest":"^26.4.1","ts-node":"^9.0.0","typescript":"^4.0.3"}}');

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId].call(module.exports, module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __nccwpck_require__(857);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;
//# sourceMappingURL=index.js.map