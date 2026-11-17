const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

// Helper to convert any Date or current timestamp to local Bangladesh datetime (Asia/Dhaka, UTC+6)
function getLocalDateTime(d = new Date()) {
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date.getTime())) return date;
  
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Dhaka',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  const parts = formatter.formatToParts(date);
  let y, m, day, h, min, s;
  for (const p of parts) {
    if (p.type === 'year') y = p.value;
    if (p.type === 'month') m = p.value;
    if (p.type === 'day') day = p.value;
    if (p.type === 'hour') h = p.value === '24' ? '00' : p.value;
    if (p.type === 'minute') min = p.value;
    if (p.type === 'second') s = p.value;
  }
  
  // Storing this as UTC with local digits allows Prisma to persist the exact local wall-clock time into MySQL DATETIME
  return new Date(`${y}-${m}-${day}T${h}:${min}:${s}.${String(date.getMilliseconds()).padStart(3, '0')}Z`);
}

const TARGET_DATE_FIELDS = ['processed_date', 'approved_at', 'requested_at', 'created_at', 'backup_date'];

function adjustDateFields(data) {
  if (!data) return;
  if (Array.isArray(data)) {
    for (const item of data) {
      adjustDateFields(item);
    }
    return;
  }
  if (typeof data !== 'object') return;

  for (const field of TARGET_DATE_FIELDS) {
    if (data[field] !== undefined && data[field] !== null) {
      data[field] = getLocalDateTime(data[field]);
    }
  }
}

// Global Prisma middleware to automatically intercept and convert datetime fields to local timezone
prisma.$use(async (params, next) => {
  if (params.args) {
    if (params.args.data) {
      adjustDateFields(params.args.data);
    }
    if (params.args.create) {
      adjustDateFields(params.args.create);
    }
    if (params.args.update) {
      adjustDateFields(params.args.update);
    }
  }
  return next(params);
});

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
        'department', 'section', 'block', 'color', 'company_profile', 'employee_info', 'unit'
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
  prisma,
  getLocalDateTime
};
