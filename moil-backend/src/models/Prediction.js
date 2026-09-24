import mongoose from 'mongoose';
const schema=new mongoose.Schema({
  mine:{type:String,required:true,index:true}, predictionDate:Date,
  predictedReserveTons:Number, predictedProductionTons:Number,
  shortfallRisk:{type:String,enum:['LOW','MEDIUM','HIGH']}, shortfallTons:Number,
  riskFactors:[String], recommendations:[String], modelVersion:String,
  inputSummary:Object
},{timestamps:true});
export default mongoose.model('Prediction',schema);
