import GeologicalData from '../models/GeologicalData.js';
import Production from '../models/Production.js';
import Prediction from '../models/Prediction.js';
import {estimateReserve,predictProduction,recommendations} from '../services/ai.service.js';
import {predictEnvironment} from '../services/environment.service.js';
import {askMineAssistant} from '../services/chat.service.js';
import {analyzeLocation} from '../services/location.service.js';

export async function generatePrediction(req,res){
 try{
  const {mine}=req.body; if(!mine) return res.status(400).json({message:'mine is required'});
  const [geo,prod]=await Promise.all([GeologicalData.find({mine}),Production.find({mine}).sort({date:-1}).limit(90)]);
  const p=predictProduction(prod); const reserve=estimateReserve(geo);
  const doc=await Prediction.create({mine,predictionDate:new Date(),predictedReserveTons:reserve,predictedProductionTons:p.predicted,shortfallRisk:p.risk,shortfallTons:p.shortfall,riskFactors:p.factors,recommendations:recommendations(p.factors),modelVersion:'baseline-v1',inputSummary:{geologyRows:geo.length,productionRows:prod.length}});
  res.status(201).json(doc);
 }catch(e){res.status(500).json({message:e.message});}
}
export async function dashboard(req,res){
 try{
  const {mine}=req.params; const latest=await Prediction.findOne({mine}).sort({createdAt:-1});
    const [trend, geology] = await Promise.all([
     Production.find({mine}).sort({date:1}).limit(365),
     GeologicalData.find({mine}).sort({createdAt:-1}).limit(365),
    ]);
    const environmentPrediction = await predictEnvironment(mine, trend);
    res.json({mine,latestPrediction:latest,productionTrend:trend,geologicalData:geology,environmentPrediction});
 }catch(e){res.status(500).json({message:e.message});}
}

export async function chat(req,res){
 try{
  const {mine,question,dashboard}=req.body;
  if(!mine || !question?.trim()) return res.status(400).json({message:'mine and question are required'});
  const answer=await askMineAssistant({mine,question:question.trim(),dashboard});
  res.json({answer});
 }catch(e){res.status(503).json({message:e.message});}
}

export async function analyzeLiveLocation(req,res){
 try{
  const {mine,latitude,longitude}=req.body;
  if(!mine || !Number.isFinite(Number(latitude)) || !Number.isFinite(Number(longitude))) return res.status(400).json({message:'mine, latitude, and longitude are required'});
  const [production,geology]=await Promise.all([Production.find({mine}).sort({date:1}).limit(365),GeologicalData.find({mine}).sort({createdAt:-1}).limit(365)]);
  const result=await analyzeLocation({mine,latitude:Number(latitude),longitude:Number(longitude),production,geology});
  res.json(result);
 }catch(e){res.status(503).json({message:e.message});}
}
