const { prisma } = require('../db');

exports.getAll = async (req, res) => {
  try {
    const list = await prisma.color.findMany({
      include: {
        section: { select: { name: true } },
        style: { select: { style_no: true } },
        process: { select: { process_name: true } }
      },
      orderBy: { id: 'desc' }
    });
    const result = list.map(c => ({
      ...c,
      section_name: c.section?.name || null,
      style_no: c.style?.style_no || null,
      process_name: c.process?.process_name || null,
      section: undefined,
      style: undefined,
      process: undefined
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  const { section_id, style_id, process_id, color_name } = req.body;
  try {
    const color = await prisma.color.create({
      data: {
        section_id: parseInt(section_id),
        style_id: parseInt(style_id),
        process_id: parseInt(process_id),
        color_name
      }
    });
    res.status(201).json(color);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const { section_id, style_id, process_id, color_name } = req.body;
  try {
    const color = await prisma.color.update({
      where: { id: parseInt(id) },
      data: {
        section_id: parseInt(section_id),
        style_id: parseInt(style_id),
        process_id: parseInt(process_id),
        color_name
      }
    });
    res.json(color);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.delete = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.color.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Color deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
