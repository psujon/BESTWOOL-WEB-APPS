const { prisma } = require('../db');

exports.getAll = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, username: true, email: true, role: true, created_at: true }
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.create = async (req, res) => {
  const { name, username, password, email, role } = req.body;
  if (!name || !username || !password) {
    return res.status(400).json({ message: 'Name, username, and password are required' });
  }
  try {
    const user = await prisma.user.create({
      data: { name, username, password, email, role: role || 'user' }
    });

    const menuKeys = ['dashboard', 'buyer', 'style', 'production_show'];
    await prisma.permission.createMany({
      data: menuKeys.map(menu => ({
        user_id: user.id,
        menu_key: menu,
        can_view: true
      }))
    });

    res.json({ message: 'User created successfully', id: user.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
