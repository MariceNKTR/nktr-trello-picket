'use strict';
const Picket=Object.freeze({
  base:'https://nktr-picket.marice-angulo.workers.dev',
  async call(t,path,action,payload={}){
    const jwt=await t.jwt({state:JSON.stringify({action})});
    const result=await fetch(this.base+path,{method:'POST',headers:{Authorization:'Bearer '+jwt,'Content-Type':'application/json'},body:JSON.stringify(payload),signal:AbortSignal.timeout(28000)});
    let data;try{data=await result.json()}catch{throw Error('Ongeldig antwoord van PICKET')}
    if(!result.ok)throw Error(data.error||'PICKET verbinding mislukt');return data;
  },
  text(id,value){document.getElementById(id).textContent=String(value??'')},
  node(tag,value,cls){const el=document.createElement(tag);if(value!==undefined)el.textContent=String(value);if(cls)el.className=cls;return el},
  pad(n){return String(n).padStart(2,'0')},
  employeePicker(t,input,container,status){
    let onbEmployeeId='',relatedCardId='',timer=0,sequence=0;
    function update(text){status.textContent=text}
    function clear(){onbEmployeeId='';relatedCardId='';container.replaceChildren();update('Naamcontrole op Onboarding (inclusief archief). Kies een bestaande naam indien gevonden.')}
    input.addEventListener('input',()=>{
      clear();const q=input.value.trim();const seq=++sequence;clearTimeout(timer);
      if(q.length<2)return;
      timer=setTimeout(async()=>{
        try{
          const [onbResult,picketResult]=await Promise.all([
            Picket.call(t,'/api/onb-employees','picket-onb-employees',{query:q}),
            Picket.call(t,'/api/matches','picket-matches',{employee:q})
          ]);
          if(seq!==sequence)return;
          const matches=onbResult.employees||[],previous=picketResult.matches||[];
          if(!matches.length&&!previous.length){update('Geen medewerker gevonden in Onboarding. NIEUWE NAAM wordt toegepast.');return}
          update('Kies een bestaande Onboarding-medewerker (ook archief). Eerdere PICKET meldingen kunnen afzonderlijk worden gekoppeld.');
          for(const person of matches){
            const button=Picket.node('button','ONB · '+person.name+(person.archived?' · archief':' · actief'),'secondary match');
            button.type='button';button.addEventListener('click',()=>{
              onbEmployeeId=person.id;relatedCardId='';input.value=person.name;sequence++;container.replaceChildren();
              update('Gekoppeld aan Onboarding: '+person.name+(person.archived?' (archief)':''));
            });container.append(button);
          }
          for(const person of previous.slice(0,8)){
            const button=Picket.node('button','PICKET · '+person.name+(person.archived?' · archief':''),'secondary match');
            button.type='button';button.addEventListener('click',()=>{
              relatedCardId=person.id;onbEmployeeId='';input.value=person.name;sequence++;container.replaceChildren();
              update('Gekoppeld aan eerdere PICKET kaart: '+person.name+'. Onboarding wordt bij opslaan gecontroleerd.');
            });container.append(button);
          }
        }catch(e){if(seq===sequence)update('Naamcontrole niet beschikbaar: '+e.message)}
      },420);
    });
    return {selectedId:()=>onbEmployeeId,relatedId:()=>relatedCardId,clear};
  }
});
