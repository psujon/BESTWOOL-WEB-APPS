const { prisma } = require('../db');

exports.getAll = async (req, res) => {
  try {
    const { month, year, date, start_date, end_date, search, section_id, style_id, process_id } = req.query;
    const where = {};

    // Specific filters
    if (section_id && section_id.trim() !== '') {
      where.section_id = parseInt(section_id);
    }

    if (style_id && style_id.trim() !== '') {
      where.style_id = parseInt(style_id);
    }

    if (process_id && process_id.trim() !== '') {
      where.process_id = parseInt(process_id);
    }

    // 1. Single Date filter (exact day: 00:00:00 to 23:59:59.999)
    if (date && date.trim() !== '') {
      const d = new Date(date.trim());
      if (!isNaN(d.getTime())) {
        const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
        const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
        where.effective_date = {
          gte: startOfDay,
          lte: endOfDay
        };
      }
    }
    // 2. Date Range filter (start_date and/or end_date)
    else if ((start_date && start_date.trim() !== '') || (end_date && end_date.trim() !== '')) {
      where.effective_date = {};
      if (start_date && start_date.trim() !== '') {
        const sd = new Date(start_date.trim());
        if (!isNaN(sd.getTime())) {
          where.effective_date.gte = new Date(sd.getFullYear(), sd.getMonth(), sd.getDate(), 0, 0, 0, 0);
        }
      }
      if (end_date && end_date.trim() !== '') {
        const ed = new Date(end_date.trim());
        if (!isNaN(ed.getTime())) {
          where.effective_date.lte = new Date(ed.getFullYear(), ed.getMonth(), ed.getDate(), 23, 59, 59, 999);
        }
      }
    }
    // 3. Month filter: e.g. '2026-11' or year & month
    else if (month && month.trim() !== '') {
      const parts = month.trim().split('-');
      if (parts.length === 2) {
        const y = parseInt(parts[0]);
        const m = parseInt(parts[1]);
        if (!isNaN(y) && !isNaN(m)) {
          const startOfMonth = new Date(y, m - 1, 1);
          const endOfMonth = new Date(y, m, 0, 23, 59, 59, 999);
          where.effective_date = {
            gte: startOfMonth,
            lte: endOfMonth
          };
        }
      }
    } else if (year) {
      const y = parseInt(year);
      if (!isNaN(y)) {
        where.effective_date = {
          gte: new Date(y, 0, 1),
          lte: new Date(y, 11, 31, 23, 59, 59, 999)
        };
      }
    }

    if (search && search.trim() !== '') {
      const q = search.trim();
      const orConditions = [
        { section: { name: { contains: q } } },
        { style: { style_no: { contains: q } } },
        { process: { process_name: { contains: q } } }
      ];
      const parsedNum = parseFloat(q);
      if (!isNaN(parsedNum)) {
        orConditions.push({ rate: parsedNum });
      }
      where.OR = orConditions;
    }

    const list = await prisma.pieceRate.findMany({
      where,
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
    const existingPr = await prisma.pieceRate.findUnique({ where: { id: prId } });
    if (!existingPr) {
      return res.status(404).json({ message: 'পিস রেট রেকর্ড পাওয়া যায়নি!' });
    }

    const sId = section_id !== undefined ? parseInt(section_id) : existingPr.section_id;
    const stId = style_id !== undefined ? parseInt(style_id) : existingPr.style_id;
    const pId = process_id !== undefined ? parseInt(process_id) : existingPr.process_id;
    const cId = color_id !== undefined ? (color_id ? parseInt(color_id) : null) : existingPr.color_id;
    const newRate = rate !== undefined ? parseFloat(rate) : existingPr.rate;
    const newEffDate = effective_date ? new Date(effective_date) : existingPr.effective_date;

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
        rate: newRate,
        effective_date: newEffDate,
        processed_by: userId || existingPr.processed_by,
        processed_date: new Date()
      },
      include: {
        section: { select: { name: true } },
        style: { select: { style_no: true } },
        process: { select: { process_name: true } },
        color: { select: { color_name: true } }
      }
    });

    res.json({
      ...pieceRate,
      section_name: pieceRate.section?.name || null,
      style_no: pieceRate.style?.style_no || null,
      process_name: pieceRate.process?.process_name || null,
      color_name: pieceRate.color?.color_name || null,
      section: undefined,
      style: undefined,
      process: undefined,
      color: undefined
    });
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

exports.bulkProcessProductionRates = async (req, res) => {
  try {
    const { department_id, section_id, start_date, end_date } = req.body;
    const userId = req.user ? req.user.id : null;

    if (!start_date || !end_date) {
      return res.status(400).json({ message: 'শুরুর তারিখ এবং শেষ তারিখ প্রদান করা বাধ্যতামূলক!' });
    }

    const startDate = new Date(start_date + 'T00:00:00.000Z');
    const endDate = new Date(end_date + 'T23:59:59.999Z');

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ message: 'সঠিক তারিখ প্রদান করুন (YYYY-MM-DD)!' });
    }

    if (startDate > endDate) {
      return res.status(400).json({ message: 'শুরুর তারিখ শেষ তারিখের চেয়ে বড় হতে পারে না!' });
    }

    // Effective date will be start date as requested
    const targetEffectiveDate = new Date(start_date + 'T00:00:00.000Z');

    // 1. Filter production entries within date range (and section or department if specified)
    const prodWhere = {
      production_date: {
        gte: startDate,
        lte: endDate
      }
    };
    if (section_id && String(section_id).trim() !== '') {
      prodWhere.section_id = parseInt(section_id);
    } else if (department_id && String(department_id).trim() !== '') {
      prodWhere.section = { department_id: parseInt(department_id) };
    }

    const productions = await prisma.production.findMany({
      where: prodWhere,
      select: {
        section_id: true,
        style_id: true,
        process_id: true
      }
    });

    if (!productions || productions.length === 0) {
      return res.status(404).json({
        message: 'নির্বাচিত তারিখ, ডিপার্টমেন্ট বা সেকশনের মধ্যে প্রোডাকশন টেবিলে কোনো ডাটা পাওয়া যায়নি!'
      });
    }

    // 2. Group into unique combos: section_id, style_id, process_id
    const comboMap = new Map();
    productions.forEach(p => {
      if (p.section_id && p.style_id && p.process_id) {
        const key = `${p.section_id}_${p.style_id}_${p.process_id}`;
        if (!comboMap.has(key)) {
          comboMap.set(key, {
            section_id: p.section_id,
            style_id: p.style_id,
            process_id: p.process_id
          });
        }
      }
    });

    const combos = Array.from(comboMap.values());
    if (combos.length === 0) {
      return res.status(400).json({
        message: 'প্রোডাকশন টেবিল থেকে কোনো সেকশন, স্টাইল ও প্রসেস কম্বিনেশন পাওয়া যায়নি!'
      });
    }

    let createdCount = 0;
    let updatedCount = 0;
    let existingCount = 0;
    let copiedFromPrevCount = 0;
    let zeroRateCount = 0;

    for (const combo of combos) {
      // Find previous month/period rate (effective_date < startDate)
      const priorRate = await prisma.pieceRate.findFirst({
        where: {
          section_id: combo.section_id,
          style_id: combo.style_id,
          process_id: combo.process_id,
          effective_date: {
            lt: startDate
          }
        },
        orderBy: [
          { effective_date: 'desc' },
          { id: 'desc' }
        ]
      });

      let rateValue = 0;
      if (priorRate && priorRate.rate !== null && priorRate.rate !== undefined) {
        rateValue = parseFloat(priorRate.rate);
      }

      if (rateValue > 0) {
        copiedFromPrevCount++;
      } else {
        zeroRateCount++;
      }

      // Check if a piece rate already exists on the exact target effective date
      const existingRecord = await prisma.pieceRate.findFirst({
        where: {
          section_id: combo.section_id,
          style_id: combo.style_id,
          process_id: combo.process_id,
          effective_date: targetEffectiveDate
        }
      });

      if (!existingRecord) {
        await prisma.pieceRate.create({
          data: {
            section_id: combo.section_id,
            style_id: combo.style_id,
            process_id: combo.process_id,
            rate: rateValue,
            effective_date: targetEffectiveDate,
            processed_by: userId,
            processed_date: new Date()
          }
        });
        createdCount++;
      } else {
        // If existing record has rate 0 and we found a previous positive rate, update it
        if (parseFloat(existingRecord.rate) === 0 && rateValue > 0) {
          await prisma.pieceRate.update({
            where: { id: existingRecord.id },
            data: {
              rate: rateValue,
              processed_by: userId,
              processed_date: new Date()
            }
          });
          updatedCount++;
        } else {
          existingCount++;
        }
      }
    }

    res.json({
      message: `বাল্ক প্রোডাকশন রেট সফলভাবে প্রসেস হয়েছে! মোট ${combos.length}টি আইটেমের মধ্যে ${createdCount}টি নতুন রেট তৈরি হয়েছে।`,
      summary: {
        totalCombos: combos.length,
        created: createdCount,
        updated: updatedCount,
        alreadyExisting: existingCount,
        copiedFromPrev: copiedFromPrevCount,
        zeroRate: zeroRateCount,
        effectiveDate: start_date
      }
    });
  } catch (err) {
    console.error('Error in bulkProcessProductionRates:', err);
    res.status(500).json({ message: err.message });
  }
};
