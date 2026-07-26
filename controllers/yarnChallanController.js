const { prisma } = require('../db');

exports.getAll = async (req, res) => {
  try {
    const list = await prisma.yarnChallan.findMany({
      include: {
        section: { select: { name: true } },
        style: { select: { style_no: true } },
        process: { select: { process_name: true } },
        color: { select: { color_name: true } }
      },
      orderBy: { id: 'desc' }
    });
    const result = list.map(yc => ({
      ...yc,
      section_name: yc.section?.name || null,
      style_no: yc.style?.style_no || null,
      process_name: yc.process?.process_name || null,
      color_name: yc.color?.color_name || null,
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
  const { section_id, style_id, process_id, color_id, challan_no, gate_pass_no, challan_date, quantity } = req.body;
  try {
    const challan = await prisma.yarnChallan.create({
      data: {
        section_id: parseInt(section_id),
        style_id: parseInt(style_id),
        process_id: parseInt(process_id),
        color_id: parseInt(color_id),
        challan_no,
        gate_pass_no,
        challan_date: new Date(challan_date),
        quantity: parseInt(quantity)
      }
    });
    res.status(201).json(challan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const { section_id, style_id, process_id, color_id, challan_no, gate_pass_no, challan_date, quantity } = req.body;
  try {
    const challan = await prisma.yarnChallan.update({
      where: { id: parseInt(id) },
      data: {
        section_id: parseInt(section_id),
        style_id: parseInt(style_id),
        process_id: parseInt(process_id),
        color_id: parseInt(color_id),
        challan_no,
        gate_pass_no,
        challan_date: new Date(challan_date),
        quantity: parseInt(quantity)
      }
    });
    res.json(challan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.delete = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.yarnChallan.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Yarn challan deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
