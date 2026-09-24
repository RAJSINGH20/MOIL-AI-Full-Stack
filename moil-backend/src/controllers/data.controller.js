import GeologicalData from "../models/GeologicalData.js";
import Production from "../models/Production.js";
export async function addGeology(req, res) {
  try {
    res.status(201).json(await GeologicalData.create(req.body));
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
}
export async function addProduction(req, res) {
  try {
    res.status(201).json(await Production.create(req.body));
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
}
export async function listGeology(req, res) {
  res.json(
    await GeologicalData.find({ mine: req.params.mine }).sort({
      createdAt: -1,
    }),
  );
}
export async function listProduction(req, res) {
  res.json(await Production.find({ mine: req.params.mine }).sort({ date: -1 }));
}
