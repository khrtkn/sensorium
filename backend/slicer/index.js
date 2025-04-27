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
var express_1 = __importDefault(require("express"));
var child_process_1 = require("child_process");
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var ipfs_http_client_1 = require("ipfs-http-client");
var arweave_1 = __importDefault(require("arweave"));
var aws_sdk_1 = __importDefault(require("aws-sdk"));
var app = (0, express_1.default)();
var PORT = process.env.PORT || 8002;
var IPFS_URL = process.env.IPFS_URL || 'http://localhost:5001';
var R2_ENDPOINT = process.env.R2_ENDPOINT || '';
var R2_ACCESS_KEY = process.env.R2_ACCESS_KEY || '';
var R2_SECRET_KEY = process.env.R2_SECRET_KEY || '';
var ARWEAVE_HOST = process.env.ARWEAVE_HOST || 'arweave.net';
var ARWEAVE_KEY = process.env.ARWEAVE_KEY || '';
var ipfs = (0, ipfs_http_client_1.create)({ url: IPFS_URL });
var arweave = arweave_1.default.init({
    host: ARWEAVE_HOST,
    port: 443,
    protocol: 'https'
});
var s3 = new aws_sdk_1.default.S3({
    endpoint: R2_ENDPOINT,
    accessKeyId: R2_ACCESS_KEY,
    secretAccessKey: R2_SECRET_KEY,
    signatureVersion: 'v4'
});
app.post('/slice/:cameraId', function (req, res) {
    var cameraId = req.params.cameraId;
    var outDir = path_1.default.resolve(__dirname, '../../hls', cameraId);
    fs_1.default.mkdirSync(outDir, { recursive: true });
    var ffmpeg = (0, child_process_1.spawn)('ffmpeg', [
        '-i', 'pipe:0',
        '-c', 'copy',
        '-f', 'hls',
        '-hls_time', '2',
        '-hls_list_size', '5',
        '-hls_flags', 'delete_segments',
        path_1.default.join(outDir, 'index.m3u8')
    ]);
    req.pipe(ffmpeg.stdin);
    ffmpeg.stderr.on('data', function (data) { return console.error("[hls ".concat(cameraId, "] ").concat(data)); });
    ffmpeg.on('exit', function (code) { return __awaiter(void 0, void 0, void 0, function () {
        var files, _loop_1, _i, files_1, file;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.warn("HLS slicing exited for ".concat(cameraId, " (code ").concat(code, ")"));
                    files = fs_1.default.readdirSync(outDir);
                    _loop_1 = function (file) {
                        var filePath, data, tx;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    filePath = path_1.default.join(outDir, file);
                                    data = fs_1.default.readFileSync(filePath);
                                    // IPFS
                                    return [4 /*yield*/, ipfs.add(data).then(function (res) { return console.log("IPFS: ".concat(file, " -> ").concat(res.path)); })];
                                case 1:
                                    // IPFS
                                    _b.sent();
                                    return [4 /*yield*/, arweave.createTransaction({ data: data })];
                                case 2:
                                    tx = _b.sent();
                                    tx.addTag('Content-Type', 'application/octet-stream');
                                    return [4 /*yield*/, arweave.transactions.sign(tx, JSON.parse(ARWEAVE_KEY))];
                                case 3:
                                    _b.sent();
                                    return [4 /*yield*/, arweave.transactions.post(tx)];
                                case 4:
                                    _b.sent();
                                    console.log("Arweave: ".concat(file, " -> ").concat(tx.id));
                                    // Cloudflare R2
                                    return [4 /*yield*/, s3.putObject({ Bucket: 'sensorium-hls', Key: "".concat(cameraId, "/").concat(file), Body: data, ACL: 'public-read' }).promise()];
                                case 5:
                                    // Cloudflare R2
                                    _b.sent();
                                    console.log("R2: uploaded ".concat(file));
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, files_1 = files;
                    _a.label = 1;
                case 1:
                    if (!(_i < files_1.length)) return [3 /*break*/, 4];
                    file = files_1[_i];
                    return [5 /*yield**/, _loop_1(file)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    }); });
    res.status(200).send('slicing started');
});
app.listen(PORT, function () { return console.log("Slicer service listening on port ".concat(PORT)); });
