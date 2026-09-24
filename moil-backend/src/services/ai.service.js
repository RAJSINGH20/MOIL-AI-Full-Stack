// Replace these deterministic baselines with a trained Python model later.
export function estimateReserve(rows){
  return rows.reduce((sum,r)=>sum+((r.oreThickness||0)*(r.density||0)*1000*Math.max((r.manganeseGrade||0)/100,0)),0);
}
export function predictProduction(rows){
  if(!rows.length) return {predicted:0,risk:'HIGH',shortfall:0,factors:['Insufficient historical data']};
  const avg=rows.reduce((s,r)=>s+(r.actualTons||0),0)/rows.length;
  const downtime=rows.reduce((s,r)=>s+(r.downtimeHours||0),0)/rows.length;
  const blast=rows.reduce((s,r)=>s+(r.blastingDelayHours||0),0)/rows.length;
  const rain=rows.reduce((s,r)=>s+(r.rainfallMm||0),0)/rows.length;
  const penalty=Math.min(.7,downtime*.025+blast*.03+rain*.002);
  const predicted=Math.max(0,avg*(1-penalty));
  const planned=rows.reduce((s,r)=>s+(r.plannedTons||0),0)/rows.length;
  const shortfall=Math.max(0,planned-predicted);
  const risk=shortfall>planned*.25?'HIGH':shortfall>planned*.1?'MEDIUM':'LOW';
  const factors=[];
  if(downtime>4) factors.push('High equipment downtime');
  if(blast>2) factors.push('Blasting delays');
  if(rain>40) factors.push('Heavy rainfall');
  return {predicted,risk,shortfall,factors};
}
export function recommendations(factors){
 const out=[];
 if(factors.includes('High equipment downtime')) out.push('Prioritize preventive maintenance and redeploy standby equipment.');
 if(factors.includes('Blasting delays')) out.push('Re-sequence blast windows and prepare permits/materials earlier.');
 if(factors.includes('Heavy rainfall')) out.push('Shift production to weather-resilient benches and revise haul-road schedules.');
 if(!out.length) out.push('Continue monitoring production and update the model with new observations.');
 return out;
}
