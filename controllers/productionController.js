const { prisma } = require('../db');

exports.getAll = async (req, res) => {
  try {
    const list = await prisma.production.findMany({
      include: {
        section: { select: { name: true } },
        style: { select: { style_no: true } },
        process: { select: { process_name: true } },
        color: { select: { color_name: true } }
      },
      orderBy: { id: 'desc' }
    });

    const result = list.map(p => ({
      ...p,
      section_name: p.section?.name || null,
      style_no: p.style?.style_no || null,
      process_name: p.process?.process_name || null,
      color_name: p.color?.color_name || null,
      section: undefined,
      style: undefined,
      process: undefined,
      color: undefined
    }));

    res.json(result);
  } catch (err) {
    console.error('Error fetching production records:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  const { section_id, style_id, process_id, color_id, production_date, items, card_no, quantity } = req.body;
  const userId = req.user ? req.user.id : null;

  if (!section_id || !style_id || !process_id || !color_id || !production_date) {
    return res.status(400).json({ message: 'সেকশন, স্টাইল, প্রসেস, কালার ও প্রোডাকশন ডেট পূরণ করা বাধ্যতামূলক!' });
  }

  const pDate = new Date(production_date);

  try {
    if (Array.isArray(items) && items.length > 0) {
      // Batch creation for multiple card entries
      const validItems = items.filter(item => item.card_no && parseInt(item.quantity) > 0);

      if (validItems.length === 0) {
        return res.status(400).json({ message: 'কমপক্ষে ১ টি বৈধ কার্ড নম্বর ও কোয়ান্টিটি প্রয়োজন!' });
      }

      const recordsData = validItems.map(item => ({
        section_id: parseInt(section_id),
        style_id: parseInt(style_id),
        process_id: parseInt(process_id),
        color_id: parseInt(color_id),
        production_date: pDate,
        card_no: item.card_no.trim(),
        quantity: parseInt(item.quantity),
        processed_by: userId,
        processed_date: new Date()
      }));

      await prisma.production.createMany({
        data: recordsData
      });

      res.status(201).json({ 
        message: `${validItems.length} টি কার্ড প্রোডাকশন এন্ট্রি সফলভাবে সংরক্ষণ করা হয়েছে!`,
        count: validItems.length
      });
    } else if (card_no && quantity) {
      // Single card entry
      const created = await prisma.production.create({
        data: {
          section_id: parseInt(section_id),
          style_id: parseInt(style_id),
          process_id: parseInt(process_id),
          color_id: parseInt(color_id),
          production_date: pDate,
          card_no: card_no.trim(),
          quantity: parseInt(quantity),
          processed_by: userId,
          processed_date: new Date()
        }
      });
      res.status(201).json(created);
    } else {
      res.status(400).json({ message: 'কার্ড নম্বর ও কোয়ান্টিটি প্রদান করুন!' });
    }
  } catch (err) {
    console.error('Error creating production entry:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.delete = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.production.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Production record deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
