import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    mine: { type: String, required: true, index: true },
    date: { type: Date, required: true },
    plannedTons: Number,
    actualTons: Number,
    equipmentHours: Number,
    downtimeHours: Number,
    blastingDelayHours: Number,
    rainfallMm: Number,
    soilMoisture: Number,
    vegetationIndex: Number,
    landTemperature: Number,
  },
  { timestamps: true },
);
export default mongoose.model("Production", schema);
