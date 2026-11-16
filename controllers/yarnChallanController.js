const { prisma } = require('../db');

// Helper to find matching buyer order (supports both section/process specific and general style orders)
async function findMatchingBuyerOrder(client, stId, secId, prId, colId) {
  let order = null;
  if (secId && prId) {
    order = await client.buyerOrder.findFirst({
      where: {
        style_id: stId,
        section_id: secId,
        process_id: prId,
        ...(colId ? { color_id: colId } : {})
      }
    });
  }
  if (!order) {
    order = await client.buyerOrder.findFirst({
      where: {
        style_id: stId,
        ...(colId ? { color_id: colId } : {})
      }
    });
  }
  if (!order) {
    order = await client.buyerOrder.findFirst({
      where: {
        style_id: stId
      }
    });
  }
  return order;
}

exports.getAll = async (req, res) => {
  try {
    const { search, limit } = req.query;
    const where = {};

    if (search && search.trim() !== '') {
      const q = search.trim();
      where.OR = [
        { challan_no: { contains: q } },
        { gate_pass_no: { contains: q } },
        { section: { name: { contains: q } } },
        { style: { style_no: { contains: q } } },
        { process: { process_name: { contains: q } } },
        { color: { color_name: { contains: q } } }
      ];
    }

    if (req.unitId) {
      const unitCondition = {
        OR: [
          { unit_id: req.unitId },
          { section: { unit_id: req.unitId } }
        ]
      };
      if (where.OR) {
        where.AND = [unitCondition];
      } else {
        where.OR = unitCondition.OR;
      }
    }

    const takeLimit = limit ? parseInt(limit) : (search ? undefined : 50);

    const list = await prisma.yarnChallan.findMany({
      where,
      take: takeLimit,
      include: {
        section: { select: { name: true } },
        style: { select: { style_no: true } },
        process: { select: { process_name: true } },
        color: { select: { color_name: true } }
      },
      orderBy: { id: 'desc' }
    });
    const result = list.map(yc => ({
      ...yc,
      section_name: yc.section?.name || null,
      style_no: yc.style?.style_no || null,
      process_name: yc.process?.process_name || null,
      color_name: yc.color?.color_name || null,
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
  const { section_id, style_id, process_id, color_id, challan_no, gate_pass_no, challan_date, quantity } = req.body;
  const secId = parseInt(section_id);
  const stId = parseInt(style_id);
  const prId = parseInt(process_id);
  const colId = color_id ? parseInt(color_id) : null;
  const qty = parseInt(quantity);
  const userId = req.user ? req.user.id : null;

  try {
    const buyerOrder = await findMatchingBuyerOrder(prisma, stId, secId, prId, colId);

    if (!buyerOrder) {
      return res.status(400).json({ 
        message: 'এই স্টাইলের জন্য কোনো বায়ার অর্ডার পাওয়া যায়নি! অনুগ্রহ করে প্রথমে বায়ার অর্ডার তৈরি করুন।' 
      });
    }

    const currentReceived = buyerOrder.yarn_received || 0;
    const availableQty = buyerOrder.order_quantity - currentReceived;

    if (qty > availableQty) {
      return res.status(400).json({ 
        message: `চালানের পরিমাণ বায়ার অর্ডার কোয়ানটিটি অতিক্রম করেছে! বায়ার অর্ডার: ${buyerOrder.order_quantity} pcs, ইতিমধ্যে প্রাপ্ত: ${currentReceived} pcs, সর্বোচ্চ নতুন জমা দেওয়া যাবে: ${availableQty < 0 ? 0 : availableQty} pcs।` 
      });
    }

    const challanDateParsed = challan_date ? new Date(challan_date) : null;
    const challanNoParsed = challan_no && challan_no.trim() !== '' ? challan_no.trim() : null;
    const gatePassNoParsed = gate_pass_no && gate_pass_no.trim() !== '' ? gate_pass_no.trim() : null;

    const challan = await prisma.$transaction(async (tx) => {
      const created = await tx.yarnChallan.create({
        data: {
          unit_id: req.unitId || null,
          section_id: secId,
          style_id: stId,
          process_id: prId,
          color_id: colId,
          challan_no: challanNoParsed,
          gate_pass_no: gatePassNoParsed,
          challan_date: challanDateParsed,
          quantity: qty,
          processed_by: userId,
          processed_date: new Date()
        }
      });

      await tx.buyerOrder.update({
        where: { id: buyerOrder.id },
        data: {
          yarn_received: { increment: qty },
          processed_by: userId,
          processed_date: new Date()
        }
      });

      return created;
    });

    res.status(201).json(challan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const { section_id, style_id, process_id, color_id, challan_no, gate_pass_no, challan_date, quantity } = req.body;
  const challanId = parseInt(id);
  const secId = parseInt(section_id);
  const stId = parseInt(style_id);
  const prId = parseInt(process_id);
  const colId = color_id ? parseInt(color_id) : null;
  const newQty = parseInt(quantity);
  const userId = req.user ? req.user.id : null;

  try {
    const existingChallan = await prisma.yarnChallan.findUnique({
      where: { id: challanId }
    });

    if (!existingChallan) {
      return res.status(404).json({ message: 'চালান রেকর্ড খুঁজে পাওয়া যায়নি!' });
    }

    const targetBuyerOrder = await findMatchingBuyerOrder(prisma, stId, secId, prId, colId);

    if (!targetBuyerOrder) {
      return res.status(400).json({ 
        message: 'এই স্টাইলের জন্য কোনো বায়ার অর্ডার পাওয়া যায়নি! অনুগ্রহ করে প্রথমে বায়ার অর্ডার তৈরি করুন।' 
      });
    }

    const isSameOrder = (
      existingChallan.style_id === stId &&
      (colId ? existingChallan.color_id === colId : true)
    );

    let effectiveReceived = targetBuyerOrder.yarn_received || 0;
    if (isSameOrder) {
      effectiveReceived -= existingChallan.quantity;
    }

    const availableQty = targetBuyerOrder.order_quantity - effectiveReceived;
    if (newQty > availableQty) {
      return res.status(400).json({ 
        message: `চালানের পরিমাণ বায়ার অর্ডার কোয়ানটিটি অতিক্রম করেছে! বায়ার অর্ডার: ${targetBuyerOrder.order_quantity} pcs, সর্বোচ্চ নতুন জমা দেওয়া যাবে: ${availableQty < 0 ? 0 : availableQty} pcs।` 
      });
    }

    const challanDateParsed = challan_date ? new Date(challan_date) : null;
    const challanNoParsed = challan_no && challan_no.trim() !== '' ? challan_no.trim() : null;
    const gatePassNoParsed = gate_pass_no && gate_pass_no.trim() !== '' ? gate_pass_no.trim() : null;

    const updatedChallan = await prisma.$transaction(async (tx) => {
      const oldBuyerOrder = await findMatchingBuyerOrder(
        tx,
        existingChallan.style_id,
        existingChallan.section_id,
        existingChallan.process_id,
        existingChallan.color_id
      );

      if (oldBuyerOrder) {
        const newReceived = Math.max(0, oldBuyerOrder.yarn_received - existingChallan.quantity);
        await tx.buyerOrder.update({
          where: { id: oldBuyerOrder.id },
          data: { 
            yarn_received: newReceived,
            processed_by: userId,
            processed_date: new Date()
          }
        });
      }

      const updated = await tx.yarnChallan.update({
        where: { id: challanId },
        data: {
          section_id: secId,
          style_id: stId,
          process_id: prId,
          color_id: colId,
          challan_no: challanNoParsed,
          gate_pass_no: gatePassNoParsed,
          challan_date: challanDateParsed,
          quantity: newQty,
          processed_by: userId,
          processed_date: new Date()
        }
      });

      await tx.buyerOrder.update({
        where: { id: targetBuyerOrder.id },
        data: {
          yarn_received: { increment: newQty },
          processed_by: userId,
          processed_date: new Date()
        }
      });

      return updated;
    });

    res.json(updatedChallan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.delete = async (req, res) => {
  const { id } = req.params;
  const challanId = parseInt(id);
  const userId = req.user ? req.user.id : null;

  try {
    const existingChallan = await prisma.yarnChallan.findUnique({
      where: { id: challanId }
    });

    if (existingChallan) {
      await prisma.$transaction(async (tx) => {
        const buyerOrder = await findMatchingBuyerOrder(
          tx,
          existingChallan.style_id,
          existingChallan.section_id,
          existingChallan.process_id,
          existingChallan.color_id
        );

        if (buyerOrder) {
          const newReceived = Math.max(0, buyerOrder.yarn_received - existingChallan.quantity);
          await tx.buyerOrder.update({
            where: { id: buyerOrder.id },
            data: { 
              yarn_received: newReceived,
              processed_by: userId,
              processed_date: new Date()
            }
          });
        }

        await tx.yarnChallan.delete({
          where: { id: challanId }
        });
      });
    }

    res.json({ message: 'Yarn challan deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
