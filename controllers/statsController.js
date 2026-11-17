const { prisma } = require('../db');

function get6MonthRange(rangeKey, refDate = new Date()) {
  const monthNamesEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthNamesBn = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
  
  let endYear, endMonth, startYear, startMonth;
  let label = '';
  
  if (rangeKey === 'prev_6') {
    const end = new Date(refDate.getFullYear(), refDate.getMonth() - 6, 1);
    endYear = end.getFullYear();
    endMonth = end.getMonth();
    const start = new Date(endYear, endMonth - 5, 1);
    startYear = start.getFullYear();
    startMonth = start.getMonth();
    label = 'বিগত ৬ মাস';
  } else if (rangeKey === 'prev_12') {
    const end = new Date(refDate.getFullYear(), refDate.getMonth() - 12, 1);
    endYear = end.getFullYear();
    endMonth = end.getMonth();
    const start = new Date(endYear, endMonth - 5, 1);
    startYear = start.getFullYear();
    startMonth = start.getMonth();
    label = 'পূর্ববর্তী ৬ মাস';
  } else if (rangeKey === '2026_h2') {
    startYear = 2026; startMonth = 6; endYear = 2026; endMonth = 11;
    label = '২০২৬ দ্বিতীয়ার্ধ';
  } else if (rangeKey === '2026_h1') {
    startYear = 2026; startMonth = 0; endYear = 2026; endMonth = 5;
    label = '২০২৬ প্রথমার্ধ';
  } else if (rangeKey === '2025_h2') {
    startYear = 2025; startMonth = 6; endYear = 2025; endMonth = 11;
    label = '২০২৫ দ্বিতীয়ার্ধ';
  } else if (rangeKey === '2025_h1') {
    startYear = 2025; startMonth = 0; endYear = 2025; endMonth = 5;
    label = '২০২৫ প্রথমার্ধ';
  } else if (rangeKey && rangeKey.startsWith('offset_')) {
    const offset = parseInt(rangeKey.split('_')[1], 10) || 0;
    const end = new Date(refDate.getFullYear(), refDate.getMonth() - (offset * 6), 1);
    endYear = end.getFullYear();
    endMonth = end.getMonth();
    const start = new Date(endYear, endMonth - 5, 1);
    startYear = start.getFullYear();
    startMonth = start.getMonth();
    label = offset === 0 ? 'চলতি ৬ মাস' : offset === 1 ? 'বিগত ৬ মাস' : `${offset * 6} মাস পূর্বে`;
  } else {
    // Default: 'last_6' (ends at refDate month)
    endYear = refDate.getFullYear();
    endMonth = refDate.getMonth();
    const start = new Date(endYear, endMonth - 5, 1);
    startYear = start.getFullYear();
    startMonth = start.getMonth();
    label = 'চলতি ৬ মাস';
  }
  
  const months = [];
  let curY = startYear;
  let curM = startMonth;
  for (let i = 0; i < 6; i++) {
    const mStr = String(curM + 1).padStart(2, '0');
    months.push({
      year: curY,
      monthIndex: curM,
      key: `${curY}-${mStr}`,
      shortName: monthNamesEn[curM],
      shortNameWithYear: `${monthNamesEn[curM]} '${String(curY).slice(2)}`,
      nameBn: monthNamesBn[curM],
      label: `${monthNamesEn[curM]} ${curY}`
    });
    curM++;
    if (curM > 11) {
      curM = 0;
      curY++;
    }
  }
  
  const startDate = new Date(startYear, startMonth, 1, 0, 0, 0, 0);
  const endDate = new Date(endYear, endMonth + 1, 0, 23, 59, 59, 999);
  
  return {
    rangeKey: rangeKey || 'last_6',
    label,
    fullLabel: `${label} (${months[0].nameBn} ${startYear} - ${months[5].nameBn} ${endYear})`,
    startDate,
    endDate,
    months
  };
}

exports.getStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    const unitFilter = req.unitId ? {
      OR: [
        { unit_id: req.unitId },
        { section: { unit_id: req.unitId } }
      ]
    } : null;

    const prodTodayWhere = {
      production_date: {
        gte: startOfToday,
        lte: endOfToday
      }
    };
    if (unitFilter) {
      prodTodayWhere.AND = [unitFilter];
    }

    const empWhere = { status: 'Active' };
    if (unitFilter) {
      empWhere.AND = [unitFilter];
    }

    // Determine 6-Month Range for the Overview Chart
    const chartRange = req.query.chartRange || req.query.range || 'last_6';
    const rangeInfo = get6MonthRange(chartRange, today);

    const prodRangeWhere = {
      production_date: {
        gte: rangeInfo.startDate,
        lte: rangeInfo.endDate
      }
    };
    if (unitFilter) {
      prodRangeWhere.AND = [unitFilter];
    }

    const prodRecentWhere = unitFilter || {};

    const [
      totalBuyers,
      totalStyles,
      todayProdAggregate,
      activeEmployeesCount,
      recentProd,
      recentStyles,
      rangeProductions,
      dbBuyersList
    ] = await Promise.all([
      prisma.buyer.count(),
      prisma.style.count(),
      prisma.production.aggregate({
        _sum: { quantity: true },
        where: prodTodayWhere
      }),
      prisma.employee.count({ where: empWhere }),
      prisma.production.findMany({
        where: prodRecentWhere,
        take: 5,
        orderBy: { id: 'desc' },
        include: {
          section: { select: { name: true } },
          style: { select: { style_no: true } },
          employee: { select: { card_no: true, name: true } }
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
        where: prodRangeWhere,
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

    // Map buyer totals in this specific 6-month period
    const buyerTotals = {};
    dbBuyersList.forEach(b => { buyerTotals[b.name] = 0; });

    let periodTotalQty = 0;
    rangeProductions.forEach(p => {
      const bName = p.style?.buyer?.name;
      if (bName && buyerTotals[bName] !== undefined) {
        buyerTotals[bName] += p.quantity;
      }
      periodTotalQty += (p.quantity || 0);
    });

    const sortedBuyers = Object.keys(buyerTotals).sort((a, b) => buyerTotals[b] - buyerTotals[a]);
    const topBuyers = sortedBuyers.slice(0, 4);

    // Build the 6-Month Chart Dataset
    const productionOverview = rangeInfo.months.map(m => {
      const row = {
        month: m.shortNameWithYear,
        monthKey: m.key,
        nameBn: m.nameBn,
        year: m.year,
        fullLabel: `${m.nameBn} ${m.year}`,
        total: 0
      };
      topBuyers.forEach(b => { row[b] = 0; });

      rangeProductions.forEach(p => {
        const pDate = new Date(p.production_date);
        if (pDate.getFullYear() === m.year && pDate.getMonth() === m.monthIndex) {
          const bName = p.style?.buyer?.name;
          if (bName && topBuyers.includes(bName)) {
            row[bName] = (row[bName] || 0) + p.quantity;
          }
          row.total += p.quantity;
        }
      });

      return row;
    });

    // Recent Activities list
    const activities = [
      ...recentProd.map(p => ({
        id: `prod-${p.id}`,
        user: p.employee?.card_no ? `কার্ড ${p.employee.card_no}` : (p.card_no_id ? `কার্ড ID #${p.card_no_id}` : 'কার্ড N/A'),
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
      periodInfo: {
        rangeKey: rangeInfo.rangeKey,
        label: rangeInfo.label,
        fullLabel: rangeInfo.fullLabel,
        totalQty: periodTotalQty
      },
      recentActivities: activities
    });
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    res.status(500).json({ message: err.message });
  }
};
