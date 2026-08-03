const { prisma } = require('../db');

exports.getAll = async (req, res) => {
  try {
    const buyers = await prisma.buyer.findMany({
      orderBy: { id: 'desc' }
    });
    res.json(buyers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  const { name, country, email, phone } = req.body;
  const userId = req.user ? req.user.id : null;
  try {
    const trimmedName = (name || '').trim();

    // Check duplicate buyer name
    const existingList = await prisma.buyer.findMany();
    const isDuplicate = existingList.some(
      b => b.name && b.name.trim().toLowerCase() === trimmedName.toLowerCase()
    );

    if (isDuplicate) {
      return res.status(400).json({ 
        message: 'ডুপ্লিকেট এন্ট্রি সম্ভব নয়! এই বায়ারের নামটি ইতোমধ্যে বিদ্যমান রয়েছে।' 
      });
    }

    const buyer = await prisma.buyer.create({
      data: { 
        name: trimmedName, 
        country, 
        email, 
        phone,
        processed_by: userId,
        processed_date: new Date()
      }
    });
    res.status(201).json(buyer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const { name, country, email, phone } = req.body;
  const userId = req.user ? req.user.id : null;
  try {
    const buyerId = parseInt(id);
    const trimmedName = (name || '').trim();

    // Check duplicate buyer name excluding current record
    const existingList = await prisma.buyer.findMany({
      where: { NOT: { id: buyerId } }
    });
    const isDuplicate = existingList.some(
      b => b.name && b.name.trim().toLowerCase() === trimmedName.toLowerCase()
    );

    if (isDuplicate) {
      return res.status(400).json({ 
        message: 'ডুপ্লিকেট এন্ট্রি সম্ভব নয়! এই বায়ারের নামটি ইতোমধ্যে বিদ্যমান রয়েছে।' 
      });
    }

    const buyer = await prisma.buyer.update({
      where: { id: buyerId },
      data: { 
        name: trimmedName, 
        country, 
        email, 
        phone,
        processed_by: userId,
        processed_date: new Date()
      }
    });
    res.json(buyer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.delete = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.buyer.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Buyer deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
