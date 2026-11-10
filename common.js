'use strict';
const Picket = Object.freeze({
  base:'https://nktr-picket.marice-angulo.workers.dev',
  async call(t,path,action,payload={}){
    const jwt=await t.jwt({state:JSON.stringify({action})});
    const result=await fetch(this.base+path,{method:'POST',headers:{Authorization:'Bearer '+jwt,'Content-Type':'application/json'},body:JSON.stringify(payload),signal:AbortSignal.timeout(28000)});
    let data;try{data=await result.json()}catch{throw Error('Ongeldig antwoord van PICKET')};
    if(!result.ok)throw Error(data.error||'PICKET verbinding mislukt');return data;
  },
  text(id,value){document.getElementById(id).textContent=String(value??'')},
  node(tag,value,cls){const el=document.createElement(tag);if(value!==undefined)el.textContent=String(value);if(cls)el.className=cls;return el},
  pad(n){return String(n).padStart(2,'0')}
});
