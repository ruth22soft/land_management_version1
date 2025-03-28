import dotenv from 'dotenv';

dotenv.config();

console.log('\nChecking Environment Variables...\n');

const variables = {
    'MongoDB URI': process.env.MONGODB_URI,
    'Port': process.env.PORT,
    'JWT Secret': process.env.JWT_SECRET
};

let allValid = true;

for (const [name, value] of Object.entries(variables)) {
    if (value) {
        console.log(`✅ ${name}: Found`);
    } else {
        console.log(`❌ ${name}: Missing`);
        allValid = false;
    }
}

console.log('\nResult:', allValid ? '✅ All environment variables are set correctly!' : '❌ Some variables are missing'); 