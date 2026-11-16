const { prisma } = require('../db');

exports.getAll = async (req, res) => {
  try {
    const units = await prisma.unit.findMany({
      include: {
        company: {
          select: { id: true, company_name: true }
        }
      },
      orderBy: { id: 'desc' }
    });
    res.json(units);
  } catch (err) {
    console.error('Error fetching units:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  const { name, code, company_id, address, phone, status } = req.body;
  const userId = req.user ? req.user.id : null;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'ইউনিটের নাম প্রদান করা বাধ্যতামূলক!' });
  }

  try {
    const unit = await prisma.unit.create({
      data: {
        name: name.trim(),
        code: code ? code.trim() : null,
        company_id: company_id ? parseInt(company_id) : null,
        address: address ? address.trim() : null,
        phone: phone ? phone.trim() : null,
        status: status || 'Active',
        processed_by: userId,
        processed_date: new Date()
      },
      include: {
        company: {
          select: { id: true, company_name: true }
        }
      }
    });
    res.status(201).json(unit);
  } catch (err) {
    console.error('Error creating unit:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const { name, code, company_id, address, phone, status } = req.body;
  const userId = req.user ? req.user.id : null;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'ইউনিটের নাম প্রদান করা বাধ্যতামূলক!' });
  }

  try {
    const unit = await prisma.unit.update({
      where: { id: parseInt(id) },
      data: {
        name: name.trim(),
        code: code ? code.trim() : null,
        company_id: company_id ? parseInt(company_id) : null,
        address: address ? address.trim() : null,
        phone: phone ? phone.trim() : null,
        status: status || 'Active',
        processed_by: userId,
        processed_date: new Date()
      },
      include: {
        company: {
          select: { id: true, company_name: true }
        }
      }
    });
    res.json(unit);
  } catch (err) {
    console.error('Error updating unit:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.delete = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.unit.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'ইউনিট সফলভাবে মুছে ফেলা হয়েছে!' });
  } catch (err) {
    console.error('Error deleting unit:', err);
    res.status(500).json({ message: err.message });
  }
};

