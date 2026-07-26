const { prisma } = require('../db');

exports.getStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    const [
      totalBuyers,
      totalStyles,
      todayProdAggregate,
      activeEmployeesCount,
      recentProd,
      recentStyles,
      yearProductions,
      dbBuyersList
    ] = await Promise.all([
      prisma.buyer.count(),
      prisma.style.count(),
      prisma.production.aggregate({
        _sum: { quantity: true },
        where: {
          production_date: {
            gte: startOfToday,
            lte: endOfToday
          }
        }
      }),
      prisma.employee.count({ where: { status: 'Active' } }),
      prisma.production.findMany({
        take: 5,
        orderBy: { id: 'desc' },
        include: {
          section: { select: { name: true } },
          style: { select: { style_no: true } }
        }
      }),
      prisma.style.findMany({
        take: 5,
        orderBy: { id: 'desc' },
        include: {
          buyer: { select: { name: true } }
        }
      }),
      prisma.production.findMany({
        where: {
          production_date: {
            gte: new Date(today.getFullYear(), 0, 1)
          }
        },
        include: {
          style: {
            include: {
              buyer: { select: { name: true } }
            }
          }
        }
      }),
      prisma.buyer.findMany({
        select: { name: true }
      })
    ]);

    const todayQty = todayProdAggregate._sum.quantity || 0;

    // Strictly map top buyers from database buyers
    const buyerTotals = {};
    dbBuyersList.forEach(b => { buyerTotals[b.name] = 0; });

    yearProductions.forEach(p => {
      const bName = p.style?.buyer?.name;
      if (bName && buyerTotals[bName] !== undefined) {
        buyerTotals[bName] += p.quantity;
      }
    });

    const sortedBuyers = Object.keys(buyerTotals).sort((a, b) => buyerTotals[b] - buyerTotals[a]);
    const topBuyers = sortedBuyers.slice(0, 4);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIdx = today.getMonth();
    const displayMonths = monthNames.slice(0, Math.max(6, currentMonthIdx + 1));

    const productionOverview = displayMonths.map((mName, mIdx) => {
      const row = { month: mName };
      topBuyers.forEach(b => { row[b] = 0; });

      yearProductions.forEach(p => {
        const pDate = new Date(p.production_date);
        if (pDate.getMonth() === mIdx) {
          const bName = p.style?.buyer?.name;
          if (bName && topBuyers.includes(bName)) {
            row[bName] = (row[bName] || 0) + p.quantity;
          }
        }
      });

      return row;
    });

    // Recent Activities list
    const activities = [
      ...recentProd.map(p => ({
        id: `prod-${p.id}`,
        user: `কার্ড ${p.card_no}`,
        action: `উৎপাদন এন্ট্রি: ${p.quantity} pcs (${p.section?.name || '—'} - ${p.style?.style_no || '—'})`,
        time: p.processed_date ? new Date(p.processed_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'আজ'
      })),
      ...recentStyles.map(s => ({
        id: `style-${s.id}`,
        user: 'নতুন স্টাইল',
        action: `স্টাইল এন্ট্রি: #${s.style_no} (${s.buyer?.name || '—'})`,
        time: s.created_at ? new Date(s.created_at).toLocaleDateString() : 'সম্প্রতি'
      }))
    ].slice(0, 6);

    res.json({
      cards: [
        { title: 'TOTAL BUYERS', value: String(totalBuyers), change: 'নিবন্ধিত বায়িং হাউস', trend: 'up' },
        { title: 'ACTIVE STYLES', value: String(totalStyles), change: 'রানিং স্টাইল', trend: 'up' },
        { title: 'TODAY PRODUCTION', value: `${todayQty.toLocaleString()} pcs`, change: 'আজকের মোট উৎপাদন', trend: 'stable' },
        { title: 'ACTIVE EMPLOYEES', value: `${activeEmployeesCount} জন`, change: 'কারখানার স্টাফ', trend: 'up' }
      ],
      productionOverview,
      topBuyers,
      recentActivities: activities
    });
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    res.status(500).json({ message: err.message });
  }
};
