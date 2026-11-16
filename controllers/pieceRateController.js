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
    const sId = parseInt(section_id);
    const stId = parseInt(style_id);
    const pId = parseInt(process_id);
    const cId = color_id ? parseInt(color_id) : null;

    // Check duplicate piece rate
    const whereClause = {
      section_id: sId,
      style_id: stId,
      process_id: pId
    };
    if (cId) {
      whereClause.color_id = cId;
    }

    const existing = await prisma.pieceRate.findFirst({
      where: whereClause
    });

    if (existing) {
      return res.status(400).json({ 
        message: 'ডুপ্লিকেট এন্ট্রি সম্ভব নয়! এই সেকশন, স্টাইল এবং প্রসেসের জন্য ইতোমধ্যে একটি পিস রেট এন্ট্রি বিদ্যমান রয়েছে।' 
      });
    }

    const pieceRate = await prisma.pieceRate.create({
      data: {
        section_id: sId,
        style_id: stId,
        process_id: pId,
        color_id: cId,
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
    const prId = parseInt(id);
    const sId = parseInt(section_id);
    const stId = parseInt(style_id);
    const pId = parseInt(process_id);
    const cId = color_id ? parseInt(color_id) : null;

    // Check duplicate piece rate excluding current record
    const whereClause = {
      section_id: sId,
      style_id: stId,
      process_id: pId,
      NOT: { id: prId }
    };
    if (cId) {
      whereClause.color_id = cId;
    }

    const existing = await prisma.pieceRate.findFirst({
      where: whereClause
    });

    if (existing) {
      return res.status(400).json({ 
        message: 'ডুপ্লিকেট এন্ট্রি সম্ভব নয়! এই সেকশন, স্টাইল এবং প্রসেসের জন্য ইতোমধ্যে একটি পিস রেট এন্ট্রি বিদ্যমান রয়েছে।' 
      });
    }

    const pieceRate = await prisma.pieceRate.update({
      where: { id: prId },
      data: {
        section_id: sId,
        style_id: stId,
        process_id: pId,
        color_id: cId,
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
