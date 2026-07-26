const { prisma } = require('../db');

exports.getAllActive = async (req, res) => {
  try {
    const list = await prisma.employee.findMany({
      where: { status: 'Active' },
      include: {
        section: { select: { name: true, code: true } }
      },
      orderBy: { id: 'desc' }
    });

    const result = list.map(emp => ({
      ...emp,
      section_name: emp.section?.name || null,
      section_code: emp.section?.code || null,
      section: undefined
    }));

    res.json(result);
  } catch (err) {
    console.error('Error fetching active employees:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  const { card_no, name, designation, join_date, section_id } = req.body;
  const userId = req.user ? req.user.id : null;

  if (!card_no || !name || !designation || !join_date || !section_id) {
    return res.status(400).json({ message: 'কার্ড নং, নাম, পদবী, জয়েন ডেট ও সেকশন পূরণ করা বাধ্যতামূলক!' });
  }

  try {
    const employee = await prisma.employee.create({
      data: {
        card_no: card_no.trim(),
        name: name.trim(),
        designation: designation.trim(),
        join_date: new Date(join_date),
        section_id: parseInt(section_id),
        status: 'Active',
        processed_by: userId,
        processed_date: new Date()
      }
    });

    res.status(201).json(employee);
  } catch (err) {
    console.error('Error creating employee:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const { card_no, name, designation, join_date, section_id, status } = req.body;
  const userId = req.user ? req.user.id : null;

  try {
    const employee = await prisma.employee.update({
      where: { id: parseInt(id) },
      data: {
        card_no: card_no ? card_no.trim() : undefined,
        name: name ? name.trim() : undefined,
        designation: designation ? designation.trim() : undefined,
        join_date: join_date ? new Date(join_date) : undefined,
        section_id: section_id ? parseInt(section_id) : undefined,
        status: status || 'Active',
        processed_by: userId,
        processed_date: new Date()
      }
    });

    res.json(employee);
  } catch (err) {
    console.error('Error updating employee:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.delete = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.employee.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Employee deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
