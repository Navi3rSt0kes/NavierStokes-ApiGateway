const { seedDatabase } = require('../lib/seed');
seedDatabase().then(() => { console.log('Seed de MarkECIA completado.'); process.exit(0); }).catch((error) => { console.error(error.message); process.exit(1); });
