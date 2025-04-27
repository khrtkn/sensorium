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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var node_fetch_1 = __importDefault(require("node-fetch"));
var child_process_1 = require("child_process");
var config_1 = require("./config");
var TRANSCODER_URL = process.env.TRANSCODER_URL || 'http://localhost:8001';
function sendMetadata(cameraId, metadata) {
    return __awaiter(this, void 0, void 0, function () {
        var res, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, node_fetch_1.default)("".concat(TRANSCODER_URL, "/metadata"), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ cameraId: cameraId, metadata: metadata, timestamp: new Date().toISOString() }),
                        })];
                case 1:
                    res = _a.sent();
                    if (!res.ok) {
                        console.error("Metadata send failed for ".concat(cameraId, ":"), res.statusText);
                    }
                    return [3 /*break*/, 3];
                case 2:
                    err_1 = _a.sent();
                    console.error("Metadata send error for ".concat(cameraId, ":"), err_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function startStream(camera) {
    console.log("Starting stream for ".concat(camera.id, " from ").concat(camera.url));
    var ffmpeg = (0, child_process_1.spawn)('ffmpeg', [
        '-i', camera.url,
        '-c:v', 'copy',
        '-c:a', 'copy',
        '-f', 'flv',
        "".concat(TRANSCODER_URL, "/stream/").concat(camera.id),
    ]);
    ffmpeg.stdout.on('data', function (data) { return console.log("[ffmpeg ".concat(camera.id, " stdout] ").concat(data)); });
    ffmpeg.stderr.on('data', function (data) { return console.error("[ffmpeg ".concat(camera.id, " stderr] ").concat(data)); });
    ffmpeg.on('exit', function (code, signal) {
        console.warn("ffmpeg process for ".concat(camera.id, " exited with code ").concat(code, " (").concat(signal, "). Restarting..."));
        setTimeout(function () { return startStream(camera); }, 5000);
    });
}
function main() {
    config_1.cameras.forEach(function (camera) {
        startStream(camera);
        setInterval(function () { return sendMetadata(camera.id, camera.metadata); }, 1000);
    });
}
main();
