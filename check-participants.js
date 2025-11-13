#!/usr/bin/env node

/**
 * Quick Participant Database Check
 *
 * Run this script anytime to see the current state of your participant database.
 * Usage: node check-participants.js
 */

const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get } = require('firebase/database');

const config = {
  apiKey: "AIzaSyAiYOUSiYKcgn-uAGi_rMLwMmNyENMSq20",
  authDomain: "sevenmore-app-5a969.firebaseapp.com",
  databaseURL: "https://sevenmore-app-5a969-default-rtdb.firebaseio.com",
  projectId: "sevenmore-app-5a969",
  storageBucket: "sevenmore-app-5a969.firebasestorage.app",
  messagingSenderId: "110371002953",
  appId: "1:110371002953:web:79c44b39188e2649a0fd98",
};

async function checkParticipants() {
  console.log("\n📊 PARTICIPANT DATABASE STATUS\n");
  console.log("=" .repeat(50));

  try {
    const app = initializeApp(config);
    const db = getDatabase(app);
    const snapshot = await get(ref(db, "participants"));
    const data = snapshot.val();

    if (!data) {
      console.log("\n❌ NO PARTICIPANTS IN DATABASE\n");
      process.exit(0);
    }

    const participants = Object.values(data);
    console.log(`\n✅ Total Participants: ${participants.length}\n`);

    // Sort by most recent first
    participants.sort((a, b) =>
      new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime()
    );

    // Show all participants
    participants.forEach((p, i) => {
      const date = new Date(p.submittedAt);
      const dateStr = date.toLocaleDateString() + " " + date.toLocaleTimeString();
      console.log(`${i + 1}. ${p.firstName} ${p.lastName} (#${p.participantNumber})`);
      console.log(`   Status: ${p.status}`);
      console.log(`   Added: ${dateStr}`);
      console.log("");
    });

    // Check for Bryant Lawrence
    const bryant = participants.find(p =>
      (p.firstName && p.firstName.toLowerCase().includes("bryant")) ||
      (p.lastName && p.lastName.toLowerCase().includes("lawrence"))
    );

    if (bryant) {
      console.log("✅ BRYANT LAWRENCE IS IN DATABASE");
      console.log(`   ID: ${bryant.id}`);
      console.log(`   Full Name: ${bryant.firstName} ${bryant.lastName}`);
      console.log(`   Number: ${bryant.participantNumber}`);
      console.log(`   Status: ${bryant.status}`);
    } else {
      console.log("❌ BRYANT LAWRENCE NOT FOUND IN DATABASE");
    }

    console.log("\n" + "=".repeat(50) + "\n");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ ERROR:", error.message);
    process.exit(1);
  }
}

checkParticipants();
