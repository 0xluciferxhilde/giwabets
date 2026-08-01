import { createPublicClient, http, keccak256, toHex } from 'viem';
const c = createPublicClient({ transport: http('https://sepolia-rpc.giwa.io') });
const sel = s => keccak256(toHex(s)).slice(0,10);
const closest='0x04764Cca2A234046Dbe68761aa268DD4c2F189dC';
const code = await c.getBytecode({address:closest});
for (const t of ['uint8','uint16','uint32','uint64','uint128','uint256','int256']) {
  const s=`placeBet(uint256,${t})`; if (code.includes(sel(s).slice(2))) console.log('FOUND',s);
}
// settle sigs across all
const A={CoinFlip:'0x17b1B887da0985335AA3112a9a93CB34844BA562',TxOU:'0x9131DFc812321E7C93BA985Dad49FbBBd9cfc564',GasOU:'0x429Fa7120f24e4dDBd29a187a96cC27eC207281e',Closest:closest};
const settles=['settleRound(uint256,uint256,bytes32)','settleRound(uint256,uint256,bytes32,uint256)','settleRound(uint256,uint256,bytes32,uint256,uint256)','settleRound(uint256)'];
for (const [k,a] of Object.entries(A)){const cd=await c.getBytecode({address:a});console.log(k,settles.filter(s=>cd.includes(sel(s).slice(2))));}
// logs
const head = await c.getBlockNumber();
const logs = await c.getLogs({address:'0x9131DFc812321E7C93BA985Dad49FbBBd9cfc564', fromBlock: head-9000n, toBlock: head});
const seen=new Set();
for(const l of logs){ if(!seen.has(l.topics[0])){seen.add(l.topics[0]); console.log('TOPIC',l.topics[0], 'ntopics',l.topics.length,'data',l.data);} }
