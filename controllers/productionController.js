const { prisma } = require('../db');

exports.getAll = async (req, res) => {
  const { section_name, block_name, style_no, process_name, color_name, card_no, from_date, to_date } = req.query;

  try {
    const where = {};

    if (card_no && card_no.trim() !== '') {
      const q = card_no.trim();
      const qInt = parseInt(q);
      where.employee = {
        OR: [
          { card_no: { contains: q } },
          { name: { contains: q } },
          ...(!isNaN(qInt) ? [{ id: qInt }] : [])
        ]
      };
    }

    if (block_name && block_name.trim() !== '') {
      const qBlock = block_name.trim();
      if (!where.employee) where.employee = {};
      where.employee.block = {
        name: { contains: qBlock }
      };
    }

    if (from_date || to_date) {
      where.production_date = {};
      if (from_date) {
        where.production_date.gte = new Date(`${from_date}T00:00:00.000Z`);
      }
      if (to_date) {
        where.production_date.lte = new Date(`${to_date}T23:59:59.999Z`);
      }
    }

    if (section_name && section_name.trim() !== '') {
      where.section = { name: { equals: section_name.trim() } };
    }
    if (style_no && style_no.trim() !== '') {
      where.style = { style_no: { equals: style_no.trim() } };
    }
    if (process_name && process_name.trim() !== '') {
      where.process = { process_name: { equals: process_name.trim() } };
    }
    if (color_name && color_name.trim() !== '') {
      where.color = { color_name: { equals: color_name.trim() } };
    }

    if (req.unitId) {
      where.OR = [
        { unit_id: req.unitId },
        { section: { unit_id: req.unitId } }
      ];
    }

    const list = await prisma.production.findMany({
      where,
      include: {
        section: { select: { name: true } },
        style: { select: { style_no: true } },
        process: { select: { process_name: true } },
        color: { select: { color_name: true } },
        employee: {
          select: {
            id: true,
            card_no: true,
            name: true,
            designation: true,
            block: { select: { id: true, name: true, code: true } }
          }
        }
      },
      orderBy: { id: 'desc' }
    });

    const userIds = [...new Set(list.map(p => p.processed_by).filter(Boolean))];
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, username: true }
    });
    const userMap = new Map(users.map(u => [u.id, u.name || u.username]));

    const result = list.map(p => ({
      ...p,
      card_no_id: p.card_no_id,
      card_no: p.employee?.card_no || String(p.card_no_id),
      display_card_no: p.employee?.card_no || String(p.card_no_id),
      emp_name: p.employee?.name || null,
      block_name: p.employee?.block?.name || null,
      section_name: p.section?.name || null,
      style_no: p.style?.style_no || null,
      process_name: p.process?.process_name || null,
      color_name: p.color?.color_name || null,
      processed_by_name: p.processed_by ? (userMap.get(p.processed_by) || `User #${p.processed_by}`) : '—',
      section: undefined,
      style: undefined,
      process: undefined,
      color: undefined,
      employee: undefined
    }));

    res.json(result);
  } catch (err) {
    console.error('Error fetching production records:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  const { section_id, style_id, process_id, color_id, production_date, items, card_no_id, card_no, emp_id, quantity } = req.body;
  const userId = req.user ? req.user.id : null;

  if (!section_id || !style_id || !process_id || !production_date) {
    return res.status(400).json({ message: 'সেকশন, স্টাইল, প্রসেস ও প্রোডাকশন ডেট পূরণ করা বাধ্যতামূলক!' });
  }

  const pDate = new Date(production_date);
  const colId = color_id ? parseInt(color_id) : null;

  try {
    const employees = await prisma.employee.findMany({
      select: { id: true, card_no: true }
    });

    const empCardToIdMap = new Map();
    employees.forEach(emp => {
      if (emp.card_no) {
        empCardToIdMap.set(emp.card_no.trim().toLowerCase(), emp.id);
      }
      empCardToIdMap.set(String(emp.id), emp.id);
    });

    if (Array.isArray(items) && items.length > 0) {
      // Batch creation for multiple card entries
      const validItems = items.filter(item => (item.card_no_id || item.emp_id || item.card_no) && parseInt(item.quantity) > 0);

      if (validItems.length === 0) {
        return res.status(400).json({ message: 'কমপক্ষে ১ টি বৈধ কার্ড নম্বর ও কোয়ান্টিটি প্রয়োজন!' });
      }

      const recordsData = [];
      for (const item of validItems) {
        let empId = item.card_no_id || item.emp_id;
        if (!empId && item.card_no) {
          const rawCard = String(item.card_no).trim();
          empId = empCardToIdMap.get(rawCard.toLowerCase()) || parseInt(rawCard);
        }

        if (!empId || isNaN(parseInt(empId))) {
          return res.status(400).json({ message: `কার্ড নম্বর (${item.card_no || item.card_no_id}) এর সঠিক ইমপ্লয়ী আইডি পাওয়া যায়নি!` });
        }

        recordsData.push({
          unit_id: req.unitId || null,
          section_id: parseInt(section_id),
          style_id: parseInt(style_id),
          process_id: parseInt(process_id),
          color_id: colId,
          production_date: pDate,
          card_no_id: parseInt(empId),
          quantity: parseInt(item.quantity),
          processed_by: userId,
          processed_date: new Date()
        });
      }

      await prisma.production.createMany({
        data: recordsData
      });

      res.status(201).json({ 
        message: `${validItems.length} টি কার্ড প্রোডাকশন এন্ট্রি সফলভাবে সংরক্ষণ করা হয়েছে!`,
        count: validItems.length
      });
    } else if ((card_no_id || emp_id || card_no) && quantity) {
      let resolvedEmpId = card_no_id || emp_id;
      if (!resolvedEmpId && card_no) {
        const rawCard = String(card_no).trim();
        resolvedEmpId = empCardToIdMap.get(rawCard.toLowerCase()) || parseInt(rawCard);
      }

      if (!resolvedEmpId || isNaN(parseInt(resolvedEmpId))) {
        return res.status(400).json({ message: 'সঠিক ইমপ্লয়ী কার্ড আইডি প্রদান করুন!' });
      }

      const created = await prisma.production.create({
        data: {
          unit_id: req.unitId || null,
          section_id: parseInt(section_id),
          style_id: parseInt(style_id),
          process_id: parseInt(process_id),
          color_id: colId,
          production_date: pDate,
          card_no_id: parseInt(resolvedEmpId),
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

exports.updateQuantity = async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  const userId = req.user ? req.user.id : null;

  if (quantity === undefined || isNaN(parseInt(quantity)) || parseInt(quantity) < 0) {
    return res.status(400).json({ message: 'সঠিক প্রোডাকশন কোয়ান্টিটি প্রদান করুন!' });
  }

  try {
    const updated = await prisma.production.update({
      where: { id: parseInt(id) },
      data: {
        quantity: parseInt(quantity),
        processed_by: userId,
        processed_date: new Date()
      }
    });

    res.json(updated);
  } catch (err) {
    console.error('Error updating production quantity:', err);
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
