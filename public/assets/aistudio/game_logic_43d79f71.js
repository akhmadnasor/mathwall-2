/** Bridge Builder Pecahan — validator referensi, tanpa library luar. */
(function(root){
'use strict';
const frac = f => {if(!f || !Number.isInteger(f.pembilang) || !Number.isInteger(f.penyebut) || f.penyebut<=0) throw Error('Format pecahan tidak sah');return [f.pembilang,f.penyebut];};
const eq = (a,b) => {const x=frac(a),y=frac(b);return x[0]*y[1]===y[0]*x[1];};
const plus=(a,b)=>{const x=frac(a),y=frac(b);return {pembilang:x[0]*y[1]+y[0]*x[1],penyebut:x[1]*y[1]};};
const minus=(a,b)=>{const x=frac(a),y=frac(b);return {pembilang:x[0]*y[1]-y[0]*x[1],penyebut:x[1]*y[1]};};
const zero=()=>({pembilang:0,penyebut:1});
const sum=arr => arr.reduce((a,b)=>plus(a,b),zero());
function check(level,play){
 if(level.mode==='susun_rasio'){
   const arr=play.papan||[]; if(!arr.every(v=>v&&['merah','biru'].includes(v.warna)&&v.pecahan&&v.aset)) return {benar:false,alasan:'papan_tidak_sah'};
   const used={};for(const v of arr){const stock=level.inventaris.find(x=>x.aset===v.aset && x.warna===v.warna);if(!stock||!eq(stock.pecahan,v.pecahan))return {benar:false,alasan:'aset_atau_nilai_tidak_sah'};used[v.aset]=(used[v.aset]||0)+1;if(used[v.aset]>stock.jumlah)return {benar:false,alasan:'stok_habis'};}
   const nRed=arr.filter(v=>v.warna==='merah').length,nBlue=arr.length-nRed;
   if(!eq(sum(arr.map(v=>v.pecahan)),level.target_panjang)) return {benar:false,alasan:'panjang_belum_tepat'};
   if(nRed!==level.jumlah_wajib.merah || nBlue!==level.jumlah_wajib.biru) return {benar:false,alasan:'jumlah_warna_salah'};
   return {benar:nRed*level.rasio_target.biru===nBlue*level.rasio_target.merah,alasan:'rasio'};
 }
 if(level.mode==='susun_per_kelompok'){
   const groups=play.kelompok||[];if(groups.length!==level.kelompok_penyusun.length)return {benar:false,alasan:'kelompok_belum_lengkap'};
   const total=[];const usage={};
   for(let i=0;i<groups.length;i++){
     const g=groups[i];if(!Array.isArray(g)||!g.every(v=>v&&v.pecahan&&v.aset))return {benar:false,alasan:'papan_tidak_sah'};
     const s=sum(g.map(v=>v.pecahan));if(!eq(s,level.kelompok_penyusun[i].nilai))return {benar:false,alasan:'isi_kelompok_salah'};
     total.push(s);for(const v of g){const stock=level.inventaris.find(x=>x.aset===v.aset);if(!stock||!eq(stock.pecahan,v.pecahan))return {benar:false,alasan:'aset_atau_nilai_tidak_sah'};usage[v.aset]=(usage[v.aset]||0)+1;}
   }
   for(const [a,n] of Object.entries(usage)) {const stock=level.inventaris.find(v=>v.aset===a);if(!stock||n>stock.jumlah)return {benar:false,alasan:'papan_melebihi_inventaris'};}
   return {benar:eq(sum(total),level.target_panjang),alasan:'total_kelompok'};
 }
 if(level.mode==='hapus_papan'){
   const arr=play.indeks_dihapus||[];const init=level.jembatan_awal;
   if(!Array.isArray(arr)||arr.length!==new Set(arr).size||arr.some(i=>!Number.isInteger(i)||i<0||i>=init.jumlah))return {benar:false,alasan:'indeks_tidak_sah'};
   const each=init.nilai_setiap_papan;
   const removed=sum(arr.map(()=>each));const initial=sum(Array(init.jumlah).fill(each));
   if(!eq(removed,level.operasi.dikurangi))return {benar:false,alasan:'bagian_dihapus_tidak_tepat'};
   return {benar:eq(minus(initial,removed),level.operasi.hasil),alasan:'hasil_pengurangan'};
 }
 return {benar:false,alasan:'mode_tidak_dikenal'};
}
function stars(wrong,hint){if(wrong===0&&hint===0)return 3;if(wrong<=1&&hint<=1)return 2;return 1;}
root.BridgeBuilderLogic={check,eq,plus,minus,sum,stars};
})(typeof window!=='undefined'?window:globalThis);
