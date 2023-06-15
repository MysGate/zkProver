import { ethers, BigNumberish } from "ethers";
const fs = require("fs");
const path = require("path");
const snarkjs = require("snarkjs");
const cls = require("circomlibjs");

export interface Proof {
  a: [BigNumberish, BigNumberish];
  b: [[BigNumberish, BigNumberish], [BigNumberish, BigNumberish]];
  c: [BigNumberish, BigNumberish];
}

function parseProof(proof: any): Proof {
  return {
      a: [proof.pi_a[0], proof.pi_a[1]],
      b: [
          [proof.pi_b[0][1], proof.pi_b[0][0]],
          [proof.pi_b[1][1], proof.pi_b[1][0]],
      ],
      c: [proof.pi_c[0], proof.pi_c[1]],
  };
}

async function getMerkleProof(bridgeInstance, leaf_index) {
  let res = []
  let addressBits = []
  let tx = await bridgeInstance.getMerkleProof(leaf_index);
  let receipt = await tx.wait()

  let abi = ["event MerkleProof(uint256[8] , uint256[8] )"]
  var iface = new ethers.utils.Interface(abi);
  let logs = iface.parseLog(receipt.events[0]);
  let proof = logs.args[0]
  let proof2 = logs.args[1]

  for (let i = 0; i < proof.length; i++) {
      let t = proof[i];
      res.push(t.toString())
  }

  for (let i = 0; i < proof2.length; i++) {
      let t = proof2[i];
      addressBits.push(t.toString())
  }
  return [res, addressBits];
}

export async function generateProof(contract, cmtIdx, txhash) {
    const poseidonHash = await cls.buildPoseidonReference();
    let [merklePath, path2RootPos2] = await getMerkleProof(contract, cmtIdx)
    console.log("merklePath", merklePath);
    console.log("path2RootPos2", path2RootPos2);
    let root = txhash;
    for (var i = 0; i < 8; i++) {
        if (path2RootPos2[i] == 1) {
            root = poseidonHash([root, merklePath[i]])
        } else {
            root = poseidonHash([merklePath[i], root])
        }
    }
    let input = {
        "root": poseidonHash.F.toString(root),
        "nullifierHash": txhash,
        "paths2_root": merklePath,
        "paths2_root_pos": path2RootPos2
    }
  
    let wasm = path.join(__dirname, "../circuit/main_js", "main.wasm");
    let zkey = path.join(__dirname, "../circuit", "circuit_final.zkey");
    const wc = require("../circuit/main_js/witness_calculator");
    const buffer = fs.readFileSync(wasm);
    const witnessCalculator = await wc(buffer);
  
    const witnessBuffer = await witnessCalculator.calculateWTNSBin(
        input,
        0
    );
    const { proof, publicSignals } = await snarkjs.groth16.prove(zkey, witnessBuffer);
    const { a, b, c } = parseProof(proof);
    return [a, b, c, publicSignals]
}

