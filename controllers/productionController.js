const { prisma } = require('../db');

exports.getAll = async (req, res) => {
  try {
    const list = await prisma.production.findMany({
      orderBy: { id: 'desc' }
    });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.create = async (req, res) => {
  const { style, buyer, qty } = req.body;
  if (!style || !buyer || !qty) {
    return res.status(400).json({ message: 'Missing style, buyer, or quantity' });
  }

  try {
    await prisma.production.create({
      data: {
        style,
        buyer,
        qty: parseInt(qty),
        date: new Date(new Date().toISOString().split('T')[0])
      }
    });
    res.json({ message: 'Production entry recorded successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
