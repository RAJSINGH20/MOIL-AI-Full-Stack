import mongoose from 'mongoose';
const schema=new mongoose.Schema({
  mine:{type:String,required:true,index:true},
  latitude:Number, longitude:Number, depth:Number,
  manganeseGrade:Number, oreThickness:Number, density:Number,
  lithology:String, drillingDate:Date, indicators:{type:Object,default:{}},
  source:{type:String,enum:['drilling','survey','satellite','manual'],default:'manual'}
},{timestamps:true});
export default mongoose.model('GeologicalData',schema);
