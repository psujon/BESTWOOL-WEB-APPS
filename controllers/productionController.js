const { prisma } = require('../db');

exports.getAll = async (req, res) => {
  const { section_name, block_name, style_no, process_name, color_name, card_no, from_date, to_date } = req.query;

  try {
    const [employees, users] = await Promise.all([
      prisma.employee.findMany({
        select: {
          id: true,
          card_no: true,
          name: true,
          block_id: true,
          block: { select: { id: true, name: true, code: true } }
        }
      }),
      prisma.user.findMany({ select: { id: true, name: true, username: true } })
    ]);

    const empByIdMap = new Map(employees.map(e => [String(e.id), e]));
    const empByCardMap = new Map(employees.map(e => [e.card_no.trim().toLowerCase(), e]));

    const where = {};

    if (card_no && card_no.trim() !== '') {
      const q = card_no.trim().toLowerCase();
      const matchedEmpIds = employees
        .filter(e => e.card_no.toLowerCase().includes(q) || e.name.toLowerCase().includes(q) || String(e.id) === q)
        .map(e => String(e.id));

      if (matchedEmpIds.length > 0) {
        where.card_no = { in: [...matchedEmpIds, q] };
      } else {
        where.card_no = { contains: q };
      }
    }

    if (block_name && block_name.trim() !== '') {
      const qBlock = block_name.trim().toLowerCase();
      const matchedEmpIdsForBlock = employees
        .filter(e => e.block && (e.block.name.toLowerCase() === qBlock || e.block.name.toLowerCase().includes(qBlock)))
        .map(e => String(e.id));

      if (matchedEmpIdsForBlock.length > 0) {
        if (where.card_no) {
          if (where.card_no.in) {
            where.card_no.in = where.card_no.in.filter(id => matchedEmpIdsForBlock.includes(id));
          } else {
            where.card_no = { in: matchedEmpIdsForBlock };
          }
        } else {
          where.card_no = { in: matchedEmpIdsForBlock };
        }
      } else {
        where.card_no = { in: ['__none__'] };
      }
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
        color: { select: { color_name: true } }
      },
      orderBy: { id: 'desc' }
    });

    const userMap = new Map(users.map(u => [u.id, u.name || u.username]));

    const result = list.map(p => {
      const emp = empByIdMap.get(String(p.card_no)) || empByCardMap.get(String(p.card_no).toLowerCase());
      return {
        ...p,
        card_no: p.card_no,
        display_card_no: emp ? emp.card_no : p.card_no,
        emp_name: emp ? emp.name : null,
        block_name: emp?.block?.name || null,
        section_name: p.section?.name || null,
        style_no: p.style?.style_no || null,
        process_name: p.process?.process_name || null,
        color_name: p.color?.color_name || null,
        processed_by_name: p.processed_by ? (userMap.get(p.processed_by) || `User #${p.processed_by}`) : '—',
        section: undefined,
        style: undefined,
        process: undefined,
        color: undefined
      };
    });

    res.json(result);
  } catch (err) {
    console.error('Error fetching production records:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  const { section_id, style_id, process_id, color_id, production_date, items, card_no, quantity } = req.body;
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
      const validItems = items.filter(item => item.card_no && parseInt(item.quantity) > 0);

      if (validItems.length === 0) {
        return res.status(400).json({ message: 'কমপক্ষে ১ টি বৈধ কার্ড নম্বর ও কোয়ান্টিটি প্রয়োজন!' });
      }

      const recordsData = validItems.map(item => {
        const rawCard = String(item.card_no).trim();
        const empId = empCardToIdMap.get(rawCard.toLowerCase()) || (parseInt(rawCard) || rawCard);
        return {
          unit_id: req.unitId || null,
          section_id: parseInt(section_id),
          style_id: parseInt(style_id),
          process_id: parseInt(process_id),
          color_id: colId,
          production_date: pDate,
          card_no: String(empId),
          quantity: parseInt(item.quantity),
          processed_by: userId,
          processed_date: new Date()
        };
      });

      await prisma.production.createMany({
        data: recordsData
      });

      res.status(201).json({ 
        message: `${validItems.length} টি কার্ড প্রোডাকশন এন্ট্রি সফলভাবে সংরক্ষণ করা হয়েছে!`,
        count: validItems.length
      });
    } else if (card_no && quantity) {
      const rawCard = String(card_no).trim();
      const empId = empCardToIdMap.get(rawCard.toLowerCase()) || (parseInt(rawCard) || rawCard);
      // Single card entry
      const created = await prisma.production.create({
        data: {
          section_id: parseInt(section_id),
          style_id: parseInt(style_id),
          process_id: parseInt(process_id),
          color_id: colId,
          production_date: pDate,
          card_no: String(empId),
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
