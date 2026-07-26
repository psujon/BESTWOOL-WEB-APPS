const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

// Seed default admin user if no users exist
async function seedDatabase() {
  try {
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      console.log('Seeding default admin accounts...');
      const admin = await prisma.user.create({
        data: {
          name: 'System Admin',
          username: 'admin',
          password: 'admin123',
          email: 'admin@bestwool.com',
          role: 'admin'
        }
      });

      const menus = [
        'dashboard', 'buyer', 'style', 'process', 'piece_rate',
        'buyer_order_info', 'yarn_challan', 'production_entry',
        'production_show', 'user', 'user_permission', 'database_backup',
        'section', 'color'
      ];

      await prisma.permission.createMany({
        data: menus.map(menu => ({
          user_id: admin.id,
          menu_key: menu,
          can_view: true
        }))
      });

      console.log('✅ Default credentials seeded.');
    }
    console.log('✅ Connected to MySQL Database via Prisma successfully.');
  } catch (error) {
    console.error('❌ FATAL DATABASE ERROR: Could not connect to MySQL Server.');
    console.error(`Error details: ${error.message}`);
    process.exit(1);
  }
}

seedDatabase();

module.exports = {
  prisma
};
