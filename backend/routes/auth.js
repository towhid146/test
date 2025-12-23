const express = require("express");
const router = express.Router();
const {
  sponsorRegister,
  sponsorLogin,
  sponseeRegister,
  sponseeLogin,
  getSponsor,
  getSponsee,
  updateSponsee,
  updateSponsor,
  getAllSponsees,
  getAllSponsors,
} = require("../controllers/authController");

// Sponsor routes
router.post("/sponsor/register", sponsorRegister);
router.post("/sponsor/login", sponsorLogin);
router.get("/sponsor/:id", getSponsor);
router.put("/sponsor/:id", updateSponsor);
router.get("/sponsors", getAllSponsors);

// Sponsee routes
router.post("/sponsee/register", sponseeRegister);
router.post("/sponsee/login", sponseeLogin);
router.get("/sponsee/:id", getSponsee);
router.put("/sponsee/:id", updateSponsee);
router.get("/sponsees", getAllSponsees);

module.exports = router;
