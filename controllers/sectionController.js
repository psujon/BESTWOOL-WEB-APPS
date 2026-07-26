const { prisma } = require('../db');

exports.getAll = async (req, res) => {
  try {
    const sections = await prisma.section.findMany({
      orderBy: { id: 'desc' }
    });
    res.json(sections);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  const { name, code, status } = req.body;
  const userId = req.user ? req.user.id : null;
  try {
    const section = await prisma.section.create({
      data: { 
        name, 
        code, 
        status: status || 'Active',
        processed_by: userId,
        processed_date: new Date()
      }
    });
    res.status(201).json(section);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const { name, code, status } = req.body;
  const userId = req.user ? req.user.id : null;
  try {
    const section = await prisma.section.update({
      where: { id: parseInt(id) },
      data: { 
        name, 
        code, 
        status,
        processed_by: userId,
        processed_date: new Date()
      }
    });
    res.json(section);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.delete = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.section.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Section deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
