const { prisma } = require('../db');

exports.getAll = async (req, res) => {
  try {
    const list = await prisma.yarnChallan.findMany({
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
  const colId = parseInt(color_id);
  const qty = parseInt(quantity);

  try {
    // 1. Check if buyer order exists for this section, style, process, and color
    const buyerOrder = await prisma.buyerOrder.findFirst({
      where: {
        section_id: secId,
        style_id: stId,
        process_id: prId,
        color_id: colId
      }
    });

    if (!buyerOrder) {
      return res.status(400).json({ 
        message: 'এই সেকশন, স্টাইল, প্রসেস এবং কালারের জন্য কোনো বায়ার অর্ডার পাওয়া যায়নি! অনুগ্রহ করে প্রথমে বায়ার অর্ডার তৈরি করুন।' 
      });
    }

    // 2. Check if new quantity exceeds remaining allowed order quantity
    const currentReceived = buyerOrder.yarn_received || 0;
    const availableQty = buyerOrder.order_quantity - currentReceived;

    if (qty > availableQty) {
      return res.status(400).json({ 
        message: `চালানের পরিমাণ বায়ার অর্ডার কোয়ানটিটি অতিক্রম করেছে! বায়ার অর্ডার: ${buyerOrder.order_quantity} pcs, ইতিমধ্যে প্রাপ্ত: ${currentReceived} pcs, সর্বোচ্চ নতুন জমা দেওয়া যাবে: ${availableQty < 0 ? 0 : availableQty} pcs।` 
      });
    }

    // 3. Create yarn challan and update buyer order yarn_received in a transaction
    const challan = await prisma.$transaction(async (tx) => {
      const created = await tx.yarnChallan.create({
        data: {
          section_id: secId,
          style_id: stId,
          process_id: prId,
          color_id: colId,
          challan_no,
          gate_pass_no,
          challan_date: new Date(challan_date),
          quantity: qty
        }
      });

      await tx.buyerOrder.update({
        where: { id: buyerOrder.id },
        data: {
          yarn_received: { increment: qty }
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
  const colId = parseInt(color_id);
  const newQty = parseInt(quantity);

  try {
    const existingChallan = await prisma.yarnChallan.findUnique({
      where: { id: challanId }
    });

    if (!existingChallan) {
      return res.status(404).json({ message: 'চালান পাওয়া যায়নি' });
    }

    // Find target matching buyer order
    const targetBuyerOrder = await prisma.buyerOrder.findFirst({
      where: {
        section_id: secId,
        style_id: stId,
        process_id: prId,
        color_id: colId
      }
    });

    if (!targetBuyerOrder) {
      return res.status(400).json({ 
        message: 'এই সেকশন, স্টাইল, প্রসেস এবং কালারের জন্য কোনো বায়ার অর্ডার পাওয়া যায়নি! অনুগ্রহ করে প্রথমে বায়ার অর্ডার তৈরি করুন।' 
      });
    }

    // Check if target is same order as existing challan
    const isSameOrder = (
      existingChallan.section_id === secId &&
      existingChallan.style_id === stId &&
      existingChallan.process_id === prId &&
      existingChallan.color_id === colId
    );

    let effectiveReceived = targetBuyerOrder.yarn_received || 0;
    if (isSameOrder) {
      effectiveReceived -= existingChallan.quantity; // temporarily revert previous qty
    }

    const availableQty = targetBuyerOrder.order_quantity - effectiveReceived;
    if (newQty > availableQty) {
      return res.status(400).json({ 
        message: `চালানের পরিমাণ বায়ার অর্ডার কোয়ানটিটি অতিক্রম করেছে! বায়ার অর্ডার: ${targetBuyerOrder.order_quantity} pcs, সর্বোচ্চ নতুন জমা দেওয়া যাবে: ${availableQty < 0 ? 0 : availableQty} pcs।` 
      });
    }

    const updatedChallan = await prisma.$transaction(async (tx) => {
      // Revert old buyer order yarn_received
      const oldBuyerOrder = await tx.buyerOrder.findFirst({
        where: {
          section_id: existingChallan.section_id,
          style_id: existingChallan.style_id,
          process_id: existingChallan.process_id,
          color_id: existingChallan.color_id
        }
      });

      if (oldBuyerOrder) {
        const newReceived = Math.max(0, oldBuyerOrder.yarn_received - existingChallan.quantity);
        await tx.buyerOrder.update({
          where: { id: oldBuyerOrder.id },
          data: { yarn_received: newReceived }
        });
      }

      // Update yarn challan
      const updated = await tx.yarnChallan.update({
        where: { id: challanId },
        data: {
          section_id: secId,
          style_id: stId,
          process_id: prId,
          color_id: colId,
          challan_no,
          gate_pass_no,
          challan_date: new Date(challan_date),
          quantity: newQty
        }
      });

      // Add to target buyer order yarn_received
      await tx.buyerOrder.update({
        where: { id: targetBuyerOrder.id },
        data: {
          yarn_received: { increment: newQty }
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

  try {
    const existingChallan = await prisma.yarnChallan.findUnique({
      where: { id: challanId }
    });

    if (existingChallan) {
      await prisma.$transaction(async (tx) => {
        const buyerOrder = await tx.buyerOrder.findFirst({
          where: {
            section_id: existingChallan.section_id,
            style_id: existingChallan.style_id,
            process_id: existingChallan.process_id,
            color_id: existingChallan.color_id
          }
        });

        if (buyerOrder) {
          const newReceived = Math.max(0, buyerOrder.yarn_received - existingChallan.quantity);
          await tx.buyerOrder.update({
            where: { id: buyerOrder.id },
            data: { yarn_received: newReceived }
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
