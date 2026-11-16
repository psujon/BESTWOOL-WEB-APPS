const { prisma } = require('../db');

exports.getAll = async (req, res) => {
  try {
    const where = {};
    if (req.unitId) {
      where.unit_id = req.unitId;
    }
    const departments = await prisma.department.findMany({
      where,
      include: {
        unit: {
          select: { id: true, name: true, code: true }
        },
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
  const { name, code, status, unit_id } = req.body;
  const userId = req.user ? req.user.id : null;
  const assignedUnitId = unit_id ? parseInt(unit_id) : (req.unitId || null);

  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'ডিপার্টমেন্টের নাম প্রদান করা বাধ্যতামূলক!' });
  }

  try {
    const department = await prisma.department.create({
      data: {
        name: name.trim(),
        code: code ? code.trim() : null,
        unit_id: assignedUnitId,
        status: status || 'Active',
        processed_by: userId,
        processed_date: new Date()
      },
      include: {
        unit: {
          select: { id: true, name: true, code: true }
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
  const { name, code, status, unit_id } = req.body;
  const userId = req.user ? req.user.id : null;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'ডিপার্টমেন্টের নাম প্রদান করা বাধ্যতামূলক!' });
  }

  try {
    const updateData = {
      name: name.trim(),
      code: code ? code.trim() : null,
      status: status || 'Active',
      processed_by: userId,
      processed_date: new Date()
    };
    if (unit_id !== undefined) {
      updateData.unit_id = unit_id ? parseInt(unit_id) : null;
    }

    const department = await prisma.department.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        unit: {
          select: { id: true, name: true, code: true }
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
