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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateProof = void 0;
var ethers_1 = require("ethers");
var contractABI = require("../contract/Bridge.json");
var fs = require("fs");
var path = require("path");
var snarkjs = require("snarkjs");
var cls = require("circomlibjs");
function parseProof(proof) {
    return {
        a: [proof.pi_a[0], proof.pi_a[1]],
        b: [
            [proof.pi_b[0][1], proof.pi_b[0][0]],
            [proof.pi_b[1][1], proof.pi_b[1][0]],
        ],
        c: [proof.pi_c[0], proof.pi_c[1]],
    };
}
function getMerkleProof(bridgeInstance, leaf_index) {
    return __awaiter(this, void 0, void 0, function () {
        var res, addressBits, _a, proof, proof2, i, t, i, t;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    res = [];
                    addressBits = [];
                    return [4 /*yield*/, bridgeInstance.getMerkleProof(leaf_index)];
                case 1:
                    _a = _b.sent(), proof = _a[0], proof2 = _a[1];
                    for (i = 0; i < proof.length; i++) {
                        t = proof[i];
                        res.push(t.toString());
                    }
                    for (i = 0; i < proof2.length; i++) {
                        t = proof2[i];
                        addressBits.push(t.toString());
                    }
                    return [2 /*return*/, [res, addressBits]];
            }
        });
    });
}
function generateProof(addr, url, cmtIdx, txhash) {
    return __awaiter(this, void 0, void 0, function () {
        var provider, contract, poseidonHash, _a, merklePath, path2RootPos2, root, i, input, wasm, zkey, wc, buffer, witnessCalculator, witnessBuffer, _b, proof, publicSignals, _c, a, b, c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    console.log("generateProof:", addr, url, cmtIdx, txhash);
                    provider = new ethers_1.ethers.providers.JsonRpcProvider(url);
                    console.log("provider:", provider);
                    contract = new ethers_1.ethers.Contract(addr, contractABI, provider);
                    return [4 /*yield*/, cls.buildPoseidonReference()];
                case 1:
                    poseidonHash = _d.sent();
                    return [4 /*yield*/, getMerkleProof(contract, cmtIdx)];
                case 2:
                    _a = _d.sent(), merklePath = _a[0], path2RootPos2 = _a[1];
                    console.log("merklePath", merklePath);
                    console.log("path2RootPos2", path2RootPos2);
                    root = txhash;
                    for (i = 0; i < 8; i++) {
                        if (path2RootPos2[i] == 1) {
                            root = poseidonHash([root, merklePath[i]]);
                        }
                        else {
                            root = poseidonHash([merklePath[i], root]);
                        }
                    }
                    input = {
                        "root": poseidonHash.F.toString(root),
                        "nullifierHash": txhash,
                        "paths2_root": merklePath,
                        "paths2_root_pos": path2RootPos2
                    };
                    wasm = path.join(__dirname, "../circuit/main_js", "main.wasm");
                    zkey = path.join(__dirname, "../circuit", "circuit_final.zkey");
                    wc = require("../circuit/main_js/witness_calculator");
                    buffer = fs.readFileSync(wasm);
                    return [4 /*yield*/, wc(buffer)];
                case 3:
                    witnessCalculator = _d.sent();
                    return [4 /*yield*/, witnessCalculator.calculateWTNSBin(input, 0)];
                case 4:
                    witnessBuffer = _d.sent();
                    return [4 /*yield*/, snarkjs.groth16.prove(zkey, witnessBuffer)];
                case 5:
                    _b = _d.sent(), proof = _b.proof, publicSignals = _b.publicSignals;
                    _c = parseProof(proof), a = _c.a, b = _c.b, c = _c.c;
                    return [2 /*return*/, [a, b, c, publicSignals]];
            }
        });
    });
}
exports.generateProof = generateProof;
