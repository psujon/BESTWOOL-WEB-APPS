const { prisma } = require('../db');

exports.getAll = async (req, res) => {
  try {
    const { search, limit } = req.query;
    const where = {};

    if (search && search.trim() !== '') {
      const q = search.trim();
      where.OR = [
        { buyer: { name: { contains: q } } },
        { style: { style_no: { contains: q } } }
      ];
    }

    if (req.unitId) {
      const unitCondition = {
        OR: [
          { unit_id: req.unitId },
          { section: { unit_id: req.unitId } }
        ]
      };
      if (where.OR) {
        where.AND = [unitCondition];
      } else {
        where.OR = unitCondition.OR;
      }
    }

    const takeLimit = limit ? parseInt(limit) : (search ? undefined : 50);

    const list = await prisma.buyerOrder.findMany({
      where,
      take: takeLimit,
      include: {
        buyer: { select: { name: true } },
        style: { select: { style_no: true } },
        section: { select: { name: true } },
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
  const { buyer_id, style_id, order_quantity, section_id, process_id, color_id } = req.body;
  const userId = req.user ? req.user.id : null;
  try {
    if (!buyer_id || !style_id || !order_quantity) {
      return res.status(400).json({ message: 'বায়ার, স্টাইল এবং অর্ডার কোয়ান্টিটি প্রদান করা বাধ্যতামূলক!' });
    }

    const bId = parseInt(buyer_id);
    const stId = parseInt(style_id);
    const sId = section_id ? parseInt(section_id) : null;
    const pId = process_id ? parseInt(process_id) : null;
    const cId = color_id ? parseInt(color_id) : null;

    // Check duplicate order entry for buyer & style (and unit)
    const whereClause = {
      buyer_id: bId,
      style_id: stId
    };
    if (req.unitId) {
      whereClause.unit_id = req.unitId;
    }

    const existing = await prisma.buyerOrder.findFirst({
      where: whereClause
    });

    if (existing) {
      return res.status(400).json({ 
        message: 'ডুপ্লিকেট এন্ট্রি সম্ভব নয়! এই বায়ার এবং স্টাইলের জন্য ইতোমধ্যে একটি বায়ার অর্ডার এন্ট্রি বিদ্যমান রয়েছে।' 
      });
    }

    const order = await prisma.buyerOrder.create({
      data: {
        unit_id: req.unitId || null,
        buyer_id: bId,
        style_id: stId,
        section_id: sId,
        process_id: pId,
        color_id: cId,
        order_quantity: parseInt(order_quantity),
        processed_by: userId,
        processed_date: new Date()
      }
    });
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const { buyer_id, style_id, order_quantity, section_id, process_id, color_id } = req.body;
  const userId = req.user ? req.user.id : null;
  try {
    const orderId = parseInt(id);
    if (!buyer_id || !style_id || !order_quantity) {
      return res.status(400).json({ message: 'বায়ার, স্টাইল এবং অর্ডার কোয়ান্টিটি প্রদান করা বাধ্যতামূলক!' });
    }

    const bId = parseInt(buyer_id);
    const stId = parseInt(style_id);
    const sId = section_id ? parseInt(section_id) : null;
    const pId = process_id ? parseInt(process_id) : null;
    const cId = color_id ? parseInt(color_id) : null;

    // Check duplicate order entry excluding current record
    const whereClause = {
      buyer_id: bId,
      style_id: stId,
      NOT: { id: orderId }
    };
    if (req.unitId) {
      whereClause.unit_id = req.unitId;
    }

    const existing = await prisma.buyerOrder.findFirst({
      where: whereClause
    });

    if (existing) {
      return res.status(400).json({ 
        message: 'ডুপ্লিকেট এন্ট্রি সম্ভব নয়! এই বায়ার এবং স্টাইলের জন্য ইতোমধ্যে একটি বায়ার অর্ডার এন্ট্রি বিদ্যমান রয়েছে।' 
      });
    }

    const order = await prisma.buyerOrder.update({
      where: { id: orderId },
      data: {
        buyer_id: bId,
        style_id: stId,
        section_id: sId,
        process_id: pId,
        color_id: cId,
        order_quantity: parseInt(order_quantity),
        processed_by: userId,
        processed_date: new Date()
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
