const { prisma } = require('../db');

exports.getAll = async (req, res) => {
  try {
    const where = {};
    if (req.unitId) {
      where.OR = [
        { unit_id: req.unitId },
        { department: { unit_id: req.unitId } }
      ];
    }
    const sections = await prisma.section.findMany({
      where,
      include: {
        department: {
          select: { id: true, name: true, code: true, unit_id: true }
        },
        unit: {
          select: { id: true, name: true, code: true }
        }
      },
      orderBy: { id: 'desc' }
    });
    res.json(sections);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  const { name, code, status, department_id, unit_id } = req.body;
  const userId = req.user ? req.user.id : null;
  let assignedUnitId = unit_id ? parseInt(unit_id) : (req.unitId || null);

  // If unit_id not explicitly given, inherit from department if department has a unit
  if (!assignedUnitId && department_id) {
    const dept = await prisma.department.findUnique({ where: { id: parseInt(department_id) } });
    if (dept && dept.unit_id) {
      assignedUnitId = dept.unit_id;
    }
  }

  try {
    const section = await prisma.section.create({
      data: { 
        name, 
        code, 
        status: status || 'Active',
        department_id: department_id ? parseInt(department_id) : null,
        unit_id: assignedUnitId,
        processed_by: userId,
        processed_date: new Date()
      },
      include: {
        department: {
          select: { id: true, name: true, code: true, unit_id: true }
        },
        unit: {
          select: { id: true, name: true, code: true }
        }
      }
    });
    res.status(201).json(section);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const { name, code, status, department_id, unit_id } = req.body;
  const userId = req.user ? req.user.id : null;
  try {
    const updateData = { 
      name, 
      code, 
      status,
      department_id: department_id ? parseInt(department_id) : null,
      processed_by: userId,
      processed_date: new Date()
    };
    if (unit_id !== undefined) {
      updateData.unit_id = unit_id ? parseInt(unit_id) : null;
    }

    const section = await prisma.section.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        department: {
          select: { id: true, name: true, code: true, unit_id: true }
        },
        unit: {
          select: { id: true, name: true, code: true }
        }
      }
    });
    res.json(section);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.delete = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.section.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Section deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
