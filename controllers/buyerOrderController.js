const { prisma } = require('../db');

exports.getAll = async (req, res) => {
  try {
    const list = await prisma.buyerOrder.findMany({
      include: {
        section: { select: { name: true } },
        buyer: { select: { name: true } },
        style: { select: { style_no: true } },
        process: { select: { process_name: true } },
        color: { select: { color_name: true } }
      },
      orderBy: { id: 'desc' }
    });
    const result = list.map(bo => ({
      ...bo,
      section_name: bo.section?.name || null,
      buyer_name: bo.buyer?.name || null,
      style_no: bo.style?.style_no || null,
      process_name: bo.process?.process_name || null,
      color_name: bo.color?.color_name || null,
      section: undefined,
      buyer: undefined,
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
  const { section_id, buyer_id, style_id, process_id, color_id, order_quantity } = req.body;
  try {
    const order = await prisma.buyerOrder.create({
      data: {
        section_id: parseInt(section_id),
        buyer_id: parseInt(buyer_id),
        style_id: parseInt(style_id),
        process_id: parseInt(process_id),
        color_id: parseInt(color_id),
        order_quantity: parseInt(order_quantity)
      }
    });
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const { section_id, buyer_id, style_id, process_id, color_id, order_quantity } = req.body;
  try {
    const order = await prisma.buyerOrder.update({
      where: { id: parseInt(id) },
      data: {
        section_id: parseInt(section_id),
        buyer_id: parseInt(buyer_id),
        style_id: parseInt(style_id),
        process_id: parseInt(process_id),
        color_id: parseInt(color_id),
        order_quantity: parseInt(order_quantity)
      }
    });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.delete = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.buyerOrder.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
