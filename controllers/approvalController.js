const { prisma } = require('../db');

// Create Order Increase Request (Status: Pending)
exports.createOrderIncreaseRequest = async (req, res) => {
  const { buyer_order_id, increase_quantity } = req.body;
  if (!buyer_order_id || !increase_quantity || parseInt(increase_quantity) <= 0) {
    return res.status(400).json({ message: 'Buyer order ID and valid increase quantity are required' });
  }

  try {
    const request = await prisma.orderIncreaseRequest.create({
      data: {
        buyer_order_id: parseInt(buyer_order_id),
        increase_quantity: parseInt(increase_quantity),
        status: 'Pending',
        requested_by: req.user?.id || null
      }
    });

    res.json({ message: 'অর্ডার বৃদ্ধিকরণের আবেদন সফলভাবে জমা দেওয়া হয়েছে (পেন্ডিং)', request });
  } catch (err) {
    console.error('Error creating order increase request:', err);
    res.status(500).json({ message: err.message });
  }
};

// Create Re-Winding Request (Status: Pending)
exports.createRewindingRequest = async (req, res) => {
  const { buyer_order_id, rewinding_quantity, is_confirmed } = req.body;
  if (!buyer_order_id || !rewinding_quantity || parseInt(rewinding_quantity) <= 0) {
    return res.status(400).json({ message: 'Buyer order ID and valid re-winding quantity are required' });
  }

  try {
    const request = await prisma.rewindingRequest.create({
      data: {
        buyer_order_id: parseInt(buyer_order_id),
        rewinding_quantity: parseInt(rewinding_quantity),
        is_confirmed: is_confirmed !== undefined ? !!is_confirmed : true,
        status: 'Pending',
        requested_by: req.user?.id || null
      }
    });

    res.json({ message: 'রি-ওয়াইন্ডিং আবেদন সফলভাবে জমা দেওয়া হয়েছে (পেন্ডিং)', request });
  } catch (err) {
    console.error('Error creating rewinding request:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get Pending Order Increase Requests for Admin
exports.getPendingOrderIncreases = async (req, res) => {
  try {
    const requests = await prisma.orderIncreaseRequest.findMany({
      where: { status: 'Pending' },
      orderBy: { id: 'desc' },
      include: {
        buyerOrder: {
          include: {
            section: { select: { name: true } },
            buyer: { select: { name: true } },
            style: { select: { style_no: true } },
            process: { select: { process_name: true } },
            color: { select: { color_name: true } }
          }
        }
      }
    });

    res.json(requests);
  } catch (err) {
    console.error('Error fetching pending order increases:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get Pending Re-Winding Requests for Admin
exports.getPendingRewindings = async (req, res) => {
  try {
    const requests = await prisma.rewindingRequest.findMany({
      where: { status: 'Pending' },
      orderBy: { id: 'desc' },
      include: {
        buyerOrder: {
          include: {
            section: { select: { name: true } },
            buyer: { select: { name: true } },
            style: { select: { style_no: true } },
            process: { select: { process_name: true } },
            color: { select: { color_name: true } }
          }
        }
      }
    });

    res.json(requests);
  } catch (err) {
    console.error('Error fetching pending rewindings:', err);
    res.status(500).json({ message: err.message });
  }
};

// Admin Approve Order Increase Request
exports.approveOrderIncrease = async (req, res) => {
  const { id } = req.params;
  try {
    const reqItem = await prisma.orderIncreaseRequest.findUnique({
      where: { id: parseInt(id) }
    });

    if (!reqItem) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (reqItem.status !== 'Pending') {
      return res.status(400).json({ message: `Request is already ${reqItem.status}` });
    }

    // Transactionally update status & add quantity to buyer_orders
    await prisma.$transaction([
      prisma.orderIncreaseRequest.update({
        where: { id: parseInt(id) },
        data: {
          status: 'Approved',
          approved_by: req.user?.id || null,
          approved_at: new Date()
        }
      }),
      prisma.buyerOrder.update({
        where: { id: reqItem.buyer_order_id },
        data: {
          order_quantity: {
            increment: reqItem.increase_quantity
          }
        }
      })
    ]);

    res.json({ message: 'অর্ডার বৃদ্ধি অনুমোদন করা হয়েছে এবং অর্ডারের কোয়ান্টিটি যোগ করা হয়েছে!' });
  } catch (err) {
    console.error('Error approving order increase:', err);
    res.status(500).json({ message: err.message });
  }
};

// Admin Reject Order Increase Request
exports.rejectOrderIncrease = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.orderIncreaseRequest.update({
      where: { id: parseInt(id) },
      data: {
        status: 'Rejected',
        approved_by: req.user?.id || null,
        approved_at: new Date()
      }
    });

    res.json({ message: 'অর্ডার বৃদ্ধি আবেদন বাতিল করা হয়েছে' });
  } catch (err) {
    console.error('Error rejecting order increase:', err);
    res.status(500).json({ message: err.message });
  }
};

// Admin Approve Re-Winding Request
exports.approveRewinding = async (req, res) => {
  const { id } = req.params;
  try {
    const reqItem = await prisma.rewindingRequest.findUnique({
      where: { id: parseInt(id) }
    });

    if (!reqItem) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (reqItem.status !== 'Pending') {
      return res.status(400).json({ message: `Request is already ${reqItem.status}` });
    }

    // Transactionally update status & add quantity to buyer_orders
    await prisma.$transaction([
      prisma.rewindingRequest.update({
        where: { id: parseInt(id) },
        data: {
          status: 'Approved',
          approved_by: req.user?.id || null,
          approved_at: new Date()
        }
      }),
      prisma.buyerOrder.update({
        where: { id: reqItem.buyer_order_id },
        data: {
          order_quantity: {
            increment: reqItem.rewinding_quantity
          }
        }
      })
    ]);

    res.json({ message: 'রি-ওয়াইন্ডিং অনুমোদন করা হয়েছে এবং কোয়ান্টিটি যোগ করা হয়েছে!' });
  } catch (err) {
    console.error('Error approving rewinding request:', err);
    res.status(500).json({ message: err.message });
  }
};

// Admin Reject Re-Winding Request
exports.rejectRewinding = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.rewindingRequest.update({
      where: { id: parseInt(id) },
      data: {
        status: 'Rejected',
        approved_by: req.user?.id || null,
        approved_at: new Date()
      }
    });

    res.json({ message: 'রি-ওয়াইন্ডিং আবেদন বাতিল করা হয়েছে' });
  } catch (err) {
    console.error('Error rejecting rewinding request:', err);
    res.status(500).json({ message: err.message });
  }
};
