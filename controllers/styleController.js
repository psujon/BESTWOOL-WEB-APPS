const { prisma } = require('../db');

exports.getAll = async (req, res) => {
  try {
    const styles = await prisma.style.findMany({
      include: { buyer: { select: { name: true } } },
      orderBy: { id: 'desc' }
    });
    // Flatten buyer_name for frontend compatibility
    const result = styles.map(s => ({
      ...s,
      buyer_name: s.buyer?.name || null,
      buyer: undefined
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  const { style_no, buyer_id, status } = req.body;
  try {
    const style = await prisma.style.create({
      data: { style_no, buyer_id: parseInt(buyer_id), status }
    });
    res.status(201).json(style);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const { style_no, buyer_id, status } = req.body;
  try {
    const style = await prisma.style.update({
      where: { id: parseInt(id) },
      data: { style_no, buyer_id: parseInt(buyer_id), status }
    });
    res.json(style);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.delete = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.style.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Style deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
