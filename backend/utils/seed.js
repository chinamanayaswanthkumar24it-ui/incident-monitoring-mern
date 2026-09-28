// Populates the database with demo data so the dashboard looks alive
// on a fresh install. Run with: npm run seed
import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Incident from "../models/Incident.js";
import Hospital from "../models/Hospital.js";
import PoliceUnit from "../models/PoliceUnit.js";

async function seed() {
  await connectDB();

  console.log("Clearing existing demo collections...");
  await Promise.all([
    Incident.deleteMany({}),
    Hospital.deleteMany({}),
    PoliceUnit.deleteMany({}),
  ]);

  const adminEmail = "admin@incidentwatch.dev";
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      name: "Admin",
      email: adminEmail,
      password: "admin1234",
      role: "admin",
      verified: true,
    });
    console.log(`Created admin user -> ${adminEmail} / admin1234`);
  }

  const units = await PoliceUnit.insertMany([
    { unitCode: "P-14", zone: "Central Unit · Zone 1", officerCount: 4, status: "Responding" },
    { unitCode: "P-09", zone: "Patamata · Zone 2", officerCount: 3, status: "Available" },
    { unitCode: "P-22", zone: "Governorpet · Zone 3", officerCount: 3, status: "Available" },
    { unitCode: "P-31", zone: "Benz Circle · Zone 4", officerCount: 2, status: "Available" },
  ]);

  const hospitals = await Hospital.insertMany([
    {
      name: "City General Hospital",
      address: "Vijayawada · Emergency department",
      location: { lat: 16.5062, lng: 80.648 },
      bedsTotal: 40,
      bedsAvailable: 18,
      ambulancesTotal: 6,
      ambulancesAvailable: 2,
      status: "Online",
    },
    {
      name: "Andhra Emergency Care",
      address: "Vijayawada · Emergency department",
      location: { lat: 16.515, lng: 80.632 },
      bedsTotal: 30,
      bedsAvailable: 7,
      ambulancesTotal: 4,
      ambulancesAvailable: 1,
      status: "Online",
    },
    {
      name: "Vijaya Medical Center",
      address: "Vijayawada · Emergency department",
      location: { lat: 16.492, lng: 80.667 },
      bedsTotal: 25,
      bedsAvailable: 5,
      ambulancesTotal: 3,
      ambulancesAvailable: 1,
      status: "Online",
    },
    {
      name: "LifeLine Hospital",
      address: "Vijayawada · Emergency department",
      location: { lat: 16.525, lng: 80.61 },
      bedsTotal: 25,
      bedsAvailable: 8,
      ambulancesTotal: 4,
      ambulancesAvailable: 0,
      status: "Online",
    },
  ]);

  await Incident.insertMany([
    {
      title: "Road accident",
      description: "Multi-vehicle collision reported near the flyover.",
      category: "Accident",
      severity: "Critical",
      status: "Responding",
      location: { lat: 16.5062, lng: 80.648, address: "Benz Circle" },
      reportedBy: admin._id,
      assignedUnit: units[0]._id,
    },
    {
      title: "Medical emergency",
      description: "Cardiac emergency, ambulance dispatched.",
      category: "Medical",
      severity: "High",
      status: "Responding",
      location: { lat: 16.515, lng: 80.632, address: "Governorpet" },
      reportedBy: admin._id,
    },
    {
      title: "Fire alert",
      description: "Small structure fire, fire unit en route.",
      category: "Fire",
      severity: "High",
      status: "Reported",
      location: { lat: 16.492, lng: 80.667, address: "Ramavarappadu" },
      reportedBy: admin._id,
    },
    {
      title: "Traffic collision",
      description: "Minor two-vehicle collision, no injuries reported.",
      category: "Accident",
      severity: "Medium",
      status: "Reported",
      location: { lat: 16.525, lng: 80.61, address: "Patamata" },
      reportedBy: admin._id,
    },
  ]);

  console.log(`Seeded ${units.length} police units, ${hospitals.length} hospitals, 4 incidents.`);
  await mongoose.disconnect();
  console.log("Done.");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
