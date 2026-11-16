const { prisma } = require('../db');

exports.getAll = async (req, res) => {
  try {
    const blocks = await prisma.block.findMany({
      orderBy: { id: 'desc' }
    });
    res.json(blocks);
  } catch (err) {
    console.error('Error fetching blocks:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  const { name, code, status } = req.body;
  const userId = req.user ? req.user.id : null;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'ব্লক/লাইনের নাম প্রদান করা বাধ্যতামূলক!' });
  }

  try {
    const block = await prisma.block.create({
      data: {
        name: name.trim(),
        code: code ? code.trim() : null,
        status: status || 'Active',
        processed_by: userId,
        processed_date: new Date()
      }
    });

    res.status(201).json(block);
  } catch (err) {
    console.error('Error creating block:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const { name, code, status } = req.body;
  const userId = req.user ? req.user.id : null;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'ব্লক/লাইনের নাম প্রদান করা বাধ্যতামূলক!' });
  }

  try {
    const block = await prisma.block.update({
      where: { id: parseInt(id) },
      data: {
        name: name.trim(),
        code: code ? code.trim() : null,
        status: status || 'Active',
        processed_by: userId,
        processed_date: new Date()
      }
    });

    res.json(block);
  } catch (err) {
    console.error('Error updating block:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.delete = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.block.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Block deleted successfully' });
  } catch (err) {
    console.error('Error deleting block:', err);
    res.status(500).json({ message: err.message });
  }
};
