require("dotenv").config();
const mongoose = require("mongoose");
const Admin = require("./models/Admin");

const createSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Check if super admin already exists
    const existingAdmin = await Admin.findOne({ role: "super_admin" });

    if (existingAdmin) {
      console.log("Super admin already exists:");
      console.log(`  Username: ${existingAdmin.username}`);
      console.log(`  Email: ${existingAdmin.email}`);
      process.exit(0);
    }

    // Create super admin
    const superAdmin = await Admin.create({
      username: "superadmin",
      email: "admin@sponzobd.com",
      password: "Admin@123456",
      fullName: "Super Administrator",
      role: "super_admin",
      permissions: {
        manageUsers: true,
        manageContent: true,
        manageSettings: true,
        viewAnalytics: true,
        manageAdmins: true,
      },
      isActive: true,
    });

    console.log("\n✅ Super Admin created successfully!");
    console.log("================================");
    console.log(`  Username: ${superAdmin.username}`);
    console.log(`  Email: ${superAdmin.email}`);
    console.log(`  Password: Admin@123456`);
    console.log(`  Role: ${superAdmin.role}`);
    console.log("================================");
    console.log("\n⚠️  IMPORTANT: Change the password after first login!\n");

    process.exit(0);
  } catch (error) {
    console.error("Error creating super admin:", error.message);
    process.exit(1);
  }
};

createSuperAdmin();
