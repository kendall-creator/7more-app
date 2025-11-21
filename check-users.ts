import { database } from './src/config/firebase';
import { ref, get } from 'firebase/database';

async function checkMadi() {
  try {
    const usersRef = ref(database, 'users');
    const snapshot = await get(usersRef);

    if (snapshot.exists()) {
      const users = snapshot.val();
      const userArray = Object.values(users);

      console.log("\n=== ALL USERS IN DATABASE ===\n");
      userArray.forEach((user: any, index: number) => {
        console.log(`${index + 1}. ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Password: "${user.password}"`);
        console.log(`   Role: ${user.role}`);
        console.log('');

        if (user.email.toLowerCase().includes('mlowry') || user.name.toLowerCase().includes('madi')) {
          console.log("   ⭐⭐⭐ THIS IS MADI'S ACCOUNT ⭐⭐⭐");
          console.log(`   Login with: ${user.email}`);
          console.log(`   Password is: "${user.password}"`);
          console.log('');
        }
      });

    } else {
      console.log("No users found in database");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

checkMadi();
