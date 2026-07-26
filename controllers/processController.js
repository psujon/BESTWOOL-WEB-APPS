const { prisma } = require('../db');

exports.getAll = async (req, res) => {
  try {
    const list = await prisma.process.findMany({
      include: {
        section: { select: { name: true } },
        buyer: { select: { name: true } },
        style: { select: { style_no: true } }
      },
      orderBy: { id: 'desc' }
    });
    const result = list.map(p => ({
      ...p,
      section_name: p.section?.name || null,
      buyer_name: p.buyer?.name || null,
      style_no: p.style?.style_no || null,
      section: undefined,
      buyer: undefined,
      style: undefined
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  const { section_id, buyer_id, style_id, process_name, type, status } = req.body;
  const userId = req.user ? req.user.id : null;
  try {
    const process = await prisma.process.create({
      data: {
        section_id: parseInt(section_id),
        buyer_id: parseInt(buyer_id),
        style_id: parseInt(style_id),
        process_name,
        type,
        status: status || 'Active',
        processed_by: userId,
        processed_date: new Date()
      }
    });
    res.status(201).json(process);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const { section_id, buyer_id, style_id, process_name, type, status } = req.body;
  const userId = req.user ? req.user.id : null;
  try {
    const process = await prisma.process.update({
      where: { id: parseInt(id) },
      data: {
        section_id: parseInt(section_id),
        buyer_id: parseInt(buyer_id),
        style_id: parseInt(style_id),
        process_name,
        type,
        status,
        processed_by: userId,
        processed_date: new Date()
      }
    });
    res.json(process);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.delete = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.process.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Process deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
