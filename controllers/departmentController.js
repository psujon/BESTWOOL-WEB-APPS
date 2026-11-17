const { prisma } = require('../db');

exports.getAll = async (req, res) => {
  try {
    // Departments are global across all units in the company
    const departments = await prisma.department.findMany({
      include: {
        _count: {
          select: { sections: true }
        }
      },
      orderBy: { id: 'desc' }
    });
    res.json(departments);
  } catch (err) {
    console.error('Error fetching departments:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  const { name, code, status } = req.body;
  const userId = req.user ? req.user.id : null;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'ডিপার্টমেন্টের নাম প্রদান করা বাধ্যতামূলক!' });
  }

  try {
    const department = await prisma.department.create({
      data: {
        name: name.trim(),
        code: code ? code.trim() : null,
        unit_id: null, // Global
        status: status || 'Active',
        processed_by: userId,
        processed_date: new Date()
      },
      include: {
        _count: {
          select: { sections: true }
        }
      }
    });
    res.status(201).json(department);
  } catch (err) {
    console.error('Error creating department:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const { name, code, status } = req.body;
  const userId = req.user ? req.user.id : null;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'ডিপার্টমেন্টের নাম প্রদান করা বাধ্যতামূলক!' });
  }

  try {
    const department = await prisma.department.update({
      where: { id: parseInt(id) },
      data: {
        name: name.trim(),
        code: code ? code.trim() : null,
        unit_id: null, // Global
        status: status || 'Active',
        processed_by: userId,
        processed_date: new Date()
      },
      include: {
        _count: {
          select: { sections: true }
        }
      }
    });
    res.json(department);
  } catch (err) {
    console.error('Error updating department:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.delete = async (req, res) => {
  const { id } = req.params;
  try {
    const deptId = parseInt(id);

    // Check if sections are associated
    const sectionCount = await prisma.section.count({
      where: { department_id: deptId }
    });

    if (sectionCount > 0) {
      return res.status(400).json({
        message: `এই ডিপার্টমেন্টের অধীনে ${sectionCount}টি সেকশন বিদ্যমান। প্রথমে সেকশনগুলো পরিবর্তন করুন বা মুছে ফেলুন।`
      });
    }

    await prisma.department.delete({
      where: { id: deptId }
    });
    res.json({ message: 'Department deleted successfully' });
  } catch (err) {
    console.error('Error deleting department:', err);
    res.status(500).json({ message: err.message });
  }
};
