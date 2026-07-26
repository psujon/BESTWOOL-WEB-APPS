const { prisma } = require('../db');

exports.getAll = async (req, res) => {
  try {
    const list = await prisma.pieceRate.findMany({
      include: {
        section: { select: { name: true } },
        style: { select: { style_no: true } },
        process: { select: { process_name: true } },
        color: { select: { color_name: true } }
      },
      orderBy: { id: 'desc' }
    });
    const result = list.map(pr => ({
      ...pr,
      section_name: pr.section?.name || null,
      style_no: pr.style?.style_no || null,
      process_name: pr.process?.process_name || null,
      color_name: pr.color?.color_name || null,
      section: undefined,
      style: undefined,
      process: undefined,
      color: undefined
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  const { section_id, style_id, process_id, color_id, rate, effective_date } = req.body;
  const userId = req.user ? req.user.id : null;
  try {
    const pieceRate = await prisma.pieceRate.create({
      data: {
        section_id: parseInt(section_id),
        style_id: parseInt(style_id),
        process_id: parseInt(process_id),
        color_id: parseInt(color_id),
        rate: parseFloat(rate),
        effective_date: new Date(effective_date),
        processed_by: userId,
        processed_date: new Date()
      }
    });
    res.status(201).json(pieceRate);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const { section_id, style_id, process_id, color_id, rate, effective_date } = req.body;
  const userId = req.user ? req.user.id : null;
  try {
    const pieceRate = await prisma.pieceRate.update({
      where: { id: parseInt(id) },
      data: {
        section_id: parseInt(section_id),
        style_id: parseInt(style_id),
        process_id: parseInt(process_id),
        color_id: parseInt(color_id),
        rate: parseFloat(rate),
        effective_date: new Date(effective_date),
        processed_by: userId,
        processed_date: new Date()
      }
    });
    res.json(pieceRate);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.delete = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.pieceRate.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Piece rate deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
