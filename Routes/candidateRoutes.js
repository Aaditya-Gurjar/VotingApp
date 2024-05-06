const express = require("express");
const { findById } = require("../models/userModel");
const Candidate = require("../models/candidateModel");
const router = express.Router();
const { jwtAuthMiddleware } = require("../auth/jwtAuth");
const User = require("../models/userModel");

const checkAdminRole = async (userId) => {
  try {
    const user = await User.findById(userId);
    return user.role === "admin";
  } catch (error) {
    console.log("error in Checking Admin Role", error);
    return false;
  }
};

// Create Candidate
router.post("/", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!checkAdminRole(req.user.id))
      return res
        .status(403)
        .json({ success: false, message: "User Dont have Admin access" });

    const data = req.body;
    const newCandidate = new Candidate(data);
    if (!newCandidate)
      return res
        .status(400)
        .json({ message: "Unable to Create Candidate, Please try agian!" });

    const response = await newCandidate.save();
    res.status(200).json({
      success: true,
      message: "Candidate Created Successfully",
      response,
    });
  } catch (error) {
    console.log("Error in Candiate Creation : ", error);
    res.status(400).json({ success: false, messsage: "Internal Server Error" });
  }
});

//Update Candidate Details
router.put("/:candidateId", jwtAuthMiddleware, async (req, res) => {
  try {
    // check the user has admin role or not
    if (!checkAdminRole(req.user.id))
      return res
        .status(403)
        .json({ success: false, message: "User Dont have Admin access" });
    const candidateId = req.params.candidateId;
    const data = req.body;
    const response = await Candidate.findByIdAndUpdate(candidateId, data, {
      new: true,
      runValidators: true,
    });
    if (!response) {
      return res.status(404).json({
        success: "false",
        message: "Unable to Update, Please Try again !",
      });
    }
    res
      .status(200)
      .json({ success: true, message: "Updated Successfully", response });
  } catch (error) {
    console.log("Error Occured in Updating Details", error);
    res.status(400).json({ message: "Internal Server Error" });
  }
});

router.delete("/:candidateId", jwtAuthMiddleware, async (req, res) => {
  try {
    // Check if user have admin role or not
    if (!checkAdminRole(req.user.id))
      return res
        .status(403)
        .json({ success: false, message: "User Dont have Admin access" });

    const candidateId = req.params.candidateId;
    const response = await Candidate.findByIdAndDelete(candidateId);
    if (!response)
      return res.status(500).json({
        success: false,
        message: "Unable to delete, Please Try agian!",
      });

    return res
      .status(200)
      .json({ success: true, message: "Candidate Deleted Successfully!" });
  } catch (error) {
    console.log("Error in Deletion : ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/vote/:candidateId", jwtAuthMiddleware, async (req, res) => {
  try {
    const candidateId = req.params.candidateId;
    const userId = req.user.id;

    const candidate = await Candidate.findById(candidateId);

    const user = await User.findById(userId);
    if (user.role === "voter")
      return res.status(400).json({ message: "Admin Can't Vote" });
    if (user.isVoted === true)
      return res.status(400).json({ message: "User can vote only Once" });

    candidate.voters.push({ user: userId });
    candidate.voteCount++;

    await candidate.save();
    user.isVoted = true;
    await user.save();

    res.status(200).json({ success: true, message: "Voted Successfully! " });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/vote/count", async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ voteCount: "desc" });
    if (!candidates)
      return res.status(200).json({ message: "No Candidate Found!" });

    //  Map the candidate to only return their name and voteCount
    const response = candidates.map((data) => {
      return {
        party: data.party,
        voteCount: data.voteCount,
      };
    });

    res.status(200).json({
      success: true,
      message: "Here are the List Of candidates and their VoteCount",
      response,
    });
  } catch (error) {
    console.log("Error Found in Getting VoteCount :", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
module.exports = router;
