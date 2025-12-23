const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const Sponsee = require("./models/Sponsee");
const Sponsor = require("./models/Sponsor");

const dummySponsees = [
  {
    eventName: "BUET Programming Contest 2025",
    contactPerson: "Md. Rifat Ahmed",
    phone: "+880172345678",
    organization: "Bangladesh University of Engineering & Technology",
    location: "Dhaka",
    email: "rifat.buet@gmail.com",
    password: "password123",
    description:
      "Annual programming contest for students across Bangladesh showcasing coding skills and innovation",
    expectedAttendees: 300,
    eventType: ["Contest", "Workshop", "Networking"],
    categories: ["Technology", "Education"],
    budget: 150000,
    website: "https://buet.edu.bd",
    coverPhoto:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=400&q=80",
  },
  {
    eventName: "DIU DevFest 2025",
    contactPerson: "Fatima Akter",
    phone: "+880173456789",
    organization: "Daffodil International University",
    location: "Dhaka",
    email: "fatima.devfest@diu.edu.bd",
    password: "password123",
    description:
      "Developer festival featuring workshops, hackathons, and tech talks from industry leaders",
    expectedAttendees: 250,
    eventType: ["Festival", "Hackathon", "Workshop"],
    categories: ["Technology", "Innovation"],
    budget: 200000,
    website: "https://diu.edu.bd",
    coverPhoto:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=400&q=80",
  },
  {
    eventName: "DU CSE Fest 2025",
    contactPerson: "Karim Hossain",
    phone: "+880174567890",
    organization: "University of Dhaka - CSE Department",
    location: "Dhaka",
    email: "karim.csefest@du.ac.bd",
    password: "password123",
    description:
      "Tech fest celebrating computer science achievements and promoting software development",
    expectedAttendees: 400,
    eventType: ["Festival", "Conference"],
    categories: ["Technology", "Education", "Software"],
    budget: 180000,
    website: "https://du.ac.bd",
    coverPhoto:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=400&q=80",
  },
  {
    eventName: "BRAC University Startup Summit",
    contactPerson: "Salma Rahman",
    phone: "+880175678901",
    organization: "BRAC University Entrepreneurship Center",
    location: "Dhaka",
    email: "salma.startup@bracu.ac.bd",
    password: "password123",
    description:
      "Summit bringing together young entrepreneurs and investors to showcase startup ideas",
    expectedAttendees: 350,
    eventType: ["Summit", "Networking", "Pitching"],
    categories: ["Entrepreneurship", "Business"],
    budget: 220000,
    website: "https://bracu.ac.bd",
    coverPhoto:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=400&q=80",
  },
  {
    eventName: "NSU Tech Summit 2025",
    contactPerson: "Ashraf Ali",
    phone: "+880176789012",
    organization: "North South University",
    location: "Dhaka",
    email: "ashraf.techsummit@northsouth.edu",
    password: "password123",
    description:
      "International technology summit featuring AI, Data Science, and Cloud Computing sessions",
    expectedAttendees: 500,
    eventType: ["Summit", "Workshop", "Conference"],
    categories: ["Technology", "AI", "Data Science"],
    budget: 250000,
    website: "https://northsouth.edu",
    coverPhoto:
      "https://images.unsplash.com/photo-1485827404703-89b67b411b22?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=400&q=80",
  },
  {
    eventName: "RU Innovation Challenge",
    contactPerson: "Hina Begum",
    phone: "+880177890123",
    organization: "Rajshahi University",
    location: "Rajshahi",
    email: "hina.innovation@ru.ac.bd",
    password: "password123",
    description:
      "Annual innovation challenge encouraging students to develop solutions for local problems",
    expectedAttendees: 200,
    eventType: ["Challenge", "Workshop"],
    categories: ["Innovation", "Education"],
    budget: 100000,
    website: "https://ru.ac.bd",
    coverPhoto:
      "https://images.unsplash.com/photo-1557821552-17105176677c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=400&q=80",
  },
  {
    eventName: "BSMRAU Tech Expo",
    contactPerson: "Tariq Mahmud",
    phone: "+880178901234",
    organization: "Bangabandhu Sheikh Mujibur Rahman Agricultural University",
    location: "Gazipur",
    email: "tariq.techexpo@bsmrau.edu.bd",
    password: "password123",
    description:
      "Agricultural tech expo showcasing innovations in farm management and agri-business",
    expectedAttendees: 300,
    eventType: ["Expo", "Workshop"],
    categories: ["Agriculture", "Technology"],
    budget: 120000,
    website: "https://bsmrau.edu.bd",
    coverPhoto:
      "https://images.unsplash.com/photo-1553531088-a348e8e8cfca?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=400&q=80",
  },
  {
    eventName: "IUT Design Thinking Workshop",
    contactPerson: "Priya Das",
    phone: "+880179012345",
    organization: "Islamic University of Technology",
    location: "Gazipur",
    email: "priya.designthink@iut.ac.bd",
    password: "password123",
    description:
      "Workshop on design thinking and user-centered product development for students",
    expectedAttendees: 150,
    eventType: ["Workshop"],
    categories: ["Design", "Technology"],
    budget: 80000,
    website: "https://iut.ac.bd",
    coverPhoto:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=400&q=80",
  },
];

const dummySponsors = [
  {
    companyName: "Robi Axiata Limited",
    contactPerson: "Mr. Zahir Hassan",
    phone: "+8801711111111",
    email: "sponsor1@robi.com.bd",
    password: "password123",
    industry: "Telecommunications",
    location: "Dhaka",
    description:
      "Leading telecom operator in Bangladesh supporting tech innovation and education",
    budget: 5000000,
    focusAreas: ["Technology", "Education", "Youth Development"],
    website: "https://robi.com.bd",
  },
  {
    companyName: "Banglalink Digital Communications",
    contactPerson: "Ms. Nadia Khan",
    phone: "+8801712222222",
    email: "sponsor2@banglalink.com.bd",
    password: "password123",
    industry: "Telecommunications",
    location: "Dhaka",
    description:
      "Digital communications company committed to digital transformation in Bangladesh",
    budget: 4500000,
    focusAreas: ["Digital Innovation", "Education"],
    website: "https://banglalink.com.bd",
  },
  {
    companyName: "Softeon Solutions Ltd",
    contactPerson: "Mr. Karim Ahmed",
    phone: "+8801713333333",
    email: "sponsor3@softeon.com.bd",
    password: "password123",
    industry: "Software Development",
    location: "Dhaka",
    description:
      "Software development company fostering tech talent and innovation in Bangladesh",
    budget: 2000000,
    focusAreas: ["Technology", "Software Development"],
    website: "https://softeon.com.bd",
  },
  {
    companyName: "Brain Station 23",
    contactPerson: "Md. Saiful Islam",
    phone: "+8801714444444",
    email: "sponsor4@brainstation23.com",
    password: "password123",
    industry: "IT Services",
    location: "Dhaka",
    description:
      "IT services company investing in tech education and student development programs",
    budget: 1800000,
    focusAreas: ["Technology", "Education"],
    website: "https://brainstation23.com",
  },
];

async function seedDatabase() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/sponsorshipbd"
    );
    console.log("Connected to MongoDB");

    // Clear existing data
    await Sponsee.deleteMany({});
    await Sponsor.deleteMany({});
    console.log("Cleared existing data");

    // Insert dummy sponsees
    const createdSponsees = await Sponsee.insertMany(dummySponsees);
    console.log(`\n✅ Created ${createdSponsees.length} dummy sponsees\n`);

    // Insert dummy sponsors
    const createdSponsors = await Sponsor.insertMany(dummySponsors);
    console.log(`✅ Created ${createdSponsors.length} dummy sponsors\n`);

    // Display login details
    console.log("=".repeat(80));
    console.log("DUMMY SPONSEE LOGIN CREDENTIALS");
    console.log("=".repeat(80));
    dummySponsees.forEach((sponsee, index) => {
      console.log(`\n${index + 1}. ${sponsee.eventName}`);
      console.log(`   Email: ${sponsee.email}`);
      console.log(`   Password: ${sponsee.password}`);
      console.log(`   Organization: ${sponsee.organization}`);
      console.log(`   Location: ${sponsee.location}`);
      console.log(`   Budget: ৳${sponsee.budget.toLocaleString()}`);
    });

    console.log("\n" + "=".repeat(80));
    console.log("DUMMY SPONSOR LOGIN CREDENTIALS");
    console.log("=".repeat(80));
    dummySponsors.forEach((sponsor, index) => {
      console.log(`\n${index + 1}. ${sponsor.companyName}`);
      console.log(`   Email: ${sponsor.email}`);
      console.log(`   Password: ${sponsor.password}`);
      console.log(`   Industry: ${sponsor.industry}`);
      console.log(`   Location: ${sponsor.location}`);
      console.log(`   Budget: ৳${sponsor.budget.toLocaleString()}`);
    });

    console.log("\n" + "=".repeat(80));
    console.log("Database seeded successfully! 🚀");
    console.log("=".repeat(80) + "\n");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
