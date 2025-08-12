import express from "express";
import User from "../../auth/models/user.js";
import { authMiddleware } from "../../auth/utils/authMiddleware.js";
const router = express.Router();
router.use(authMiddleware);

router.get("/", async (req, res) => {
  const user = await User.findById(req.user.userId);
  if (!user) {
    return res.status(404).json([]);
  }
  res.json(user.assets || []);
});

router.post("/", async (req, res) => {
  const user = await User.findById(req.user.userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  user.assets.push(req.body);
  await user.save();
  res.status(201).json(user.assets[user.assets.length - 1]);
});

router.delete("/:id", async (req, res) => {
  const user = await User.findById(req.user.userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  user.assets = user.assets.filter((a) => a._id.toString() !== req.params.id);
  await user.save();
  res.sendStatus(204);
});

export default router;
