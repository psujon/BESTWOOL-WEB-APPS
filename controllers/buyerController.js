const { prisma } = require('../db');

exports.getAll = async (req, res) => {
  try {
    const buyers = await prisma.buyer.findMany({
      orderBy: { id: 'desc' }
    });
    res.json(buyers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  const { name, country, email, phone } = req.body;
  const userId = req.user ? req.user.id : null;
  try {
    const buyer = await prisma.buyer.create({
      data: { 
        name, 
        country, 
        email, 
        phone,
        processed_by: userId,
        processed_date: new Date()
      }
    });
    res.status(201).json(buyer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const { name, country, email, phone } = req.body;
  const userId = req.user ? req.user.id : null;
  try {
    const buyer = await prisma.buyer.update({
      where: { id: parseInt(id) },
      data: { 
        name, 
        country, 
        email, 
        phone,
        processed_by: userId,
        processed_date: new Date()
      }
    });
    res.json(buyer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.delete = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.buyer.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Buyer deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
