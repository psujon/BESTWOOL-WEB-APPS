const { prisma } = require('./db');

async function seedSampleData() {
  console.log('🚀 Starting sample data generation for Best Wool Web Apps...');

  // 1. Get or Ensure Units
  let unit1 = await prisma.unit.findFirst({ where: { name: 'BEST WOOL SWEATERS LTD.' } });
  let unit2 = await prisma.unit.findFirst({ where: { name: 'BEST WOOL SWEATERS LTD. (B2)' } });

  if (!unit1) {
    unit1 = await prisma.unit.create({
      data: { name: 'BEST WOOL SWEATERS LTD.', code: 'BW-U1', status: 'Active', is_active: true }
    });
  }
  if (!unit2) {
    unit2 = await prisma.unit.create({
      data: { name: 'BEST WOOL SWEATERS LTD. (B2)', code: 'BW-U2', status: 'Active', is_active: true }
    });
  }

  console.log(`✅ Units verified: Unit 1 (ID: ${unit1.id}), Unit 2 (ID: ${unit2.id})`);

  // 2. Sections mapping
  const secLinking1 = await prisma.section.findFirst({ where: { name: 'Linking', unit_id: unit1.id } }) || await prisma.section.findFirst({ where: { name: 'Linking' } });
  const secTrimming1 = await prisma.section.findFirst({ where: { name: 'Trimming', unit_id: unit1.id } });
  const secMending1 = await prisma.section.findFirst({ where: { name: 'Mending', unit_id: unit1.id } });
  const secSewing1 = await prisma.section.findFirst({ where: { name: 'Sewing', unit_id: unit1.id } });

  const secLinking2 = await prisma.section.findFirst({ where: { name: 'Linking-2', unit_id: unit2.id } });
  const secSewing2 = await prisma.section.findFirst({ where: { name: 'Sewing-2', unit_id: unit2.id } });
  const secTrimming2 = await prisma.section.findFirst({ where: { name: 'Trimming', unit_id: unit2.id } });

  console.log('✅ Sections found for Unit 1 and Unit 2');

  // Blocks
  const blockA = await prisma.block.findFirst({ where: { name: 'A' } });
  const blockB = await prisma.block.findFirst({ where: { name: 'B' } });
  const blockC = await prisma.block.findFirst({ where: { name: 'C' } });
  const blockD = await prisma.block.findFirst({ where: { name: 'D' } });
  const blockE = await prisma.block.findFirst({ where: { name: 'E' } });
  const blockF = await prisma.block.findFirst({ where: { name: 'F' } });
  const blockG = await prisma.block.findFirst({ where: { name: 'G' } });
  const blockH = await prisma.block.findFirst({ where: { name: 'H' } });

  // 3. Seed Buyers
  const buyersData = [
    { name: 'H&M (Hennes & Mauritz)', country: 'Sweden', email: 'sourcing@hm.com', phone: '+46-8-7965500' },
    { name: 'ZARA (Inditex)', country: 'Spain', email: 'orders@inditex.com', phone: '+34-981-185400' },
    { name: 'MARKS & SPENCER (M&S)', country: 'United Kingdom', email: 'mns_knit@marksandspencer.com', phone: '+44-20-79354422' },
    { name: 'PULL & BEAR', country: 'Spain', email: 'buyer@pullandbear.com', phone: '+34-981-185401' },
    { name: 'C&A Mode', country: 'Germany', email: 'knitwear@c-and-a.com', phone: '+49-211-98720' }
  ];

  const buyerMap = {};
  // Existing buyer 2
  const existingBw = await prisma.buyer.findFirst({ where: { name: 'BEST WOOL SWEATERS LTD.' } });
  if (existingBw) buyerMap['BW'] = existingBw;

  for (const b of buyersData) {
    let buyer = await prisma.buyer.findFirst({ where: { name: b.name } });
    if (!buyer) {
      buyer = await prisma.buyer.create({
        data: {
          name: b.name,
          country: b.country,
          email: b.email,
          phone: b.phone,
          processed_by: 1
        }
      });
      console.log(`+ Added Buyer: ${buyer.name}`);
    }
    buyerMap[b.name] = buyer;
  }

  // 4. Seed Styles
  const stylesData = [
    { buyerName: 'H&M (Hennes & Mauritz)', style_no: 'HM-SW-2026/01', status: 'Running' },
    { buyerName: 'H&M (Hennes & Mauritz)', style_no: 'HM-CD-4050', status: 'Running' },
    { buyerName: 'ZARA (Inditex)', style_no: 'ZR-KNT-8812', status: 'Running' },
    { buyerName: 'ZARA (Inditex)', style_no: 'ZR-HOOD-109', status: 'Running' },
    { buyerName: 'MARKS & SPENCER (M&S)', style_no: 'MS-CAS-552', status: 'Running' },
    { buyerName: 'MARKS & SPENCER (M&S)', style_no: 'MS-ZIP-770', status: 'Running' },
    { buyerName: 'PULL & BEAR', style_no: 'PB-STRIPED-99', status: 'Running' },
    { buyerName: 'C&A Mode', style_no: 'CA-CARDIGAN-21', status: 'Running' }
  ];

  const styleMap = {};
  for (const s of stylesData) {
    const b = buyerMap[s.buyerName];
    if (!b) continue;
    let style = await prisma.style.findFirst({ where: { style_no: s.style_no, buyer_id: b.id } });
    if (!style) {
      style = await prisma.style.create({
        data: {
          style_no: s.style_no,
          buyer_id: b.id,
          status: s.status,
          processed_by: 1
        }
      });
      console.log(`+ Added Style: ${style.style_no} (${b.name})`);
    }
    styleMap[s.style_no] = style;
  }

  // Also include existing styles for BEST WOOL
  const existingStyles = await prisma.style.findMany({ where: { buyer_id: existingBw?.id || 2 } });
  existingStyles.forEach(st => { styleMap[st.style_no] = st; });

  // 5. Seed Processes
  // We attach processes to styles and sections
  const processesDefs = [
    // Unit 1 Linking
    { sec: secLinking1, styleKey: 'HM-SW-2026/01', name: 'BODY & SLEEVE LINKING', type: 'Piece Rate' },
    { sec: secLinking1, styleKey: 'HM-SW-2026/01', name: 'COLLAR ATTACH', type: 'Piece Rate' },
    { sec: secLinking1, styleKey: 'ZR-KNT-8812', name: 'BODY & SLEEVE LINKING', type: 'Piece Rate' },
    { sec: secLinking1, styleKey: 'MS-CAS-552', name: 'BODY & SLEEVE LINKING', type: 'Piece Rate' },
    { sec: secLinking1, styleKey: 'JPRBLURILEY CREW NECK LS', name: 'BODY & SLEEVE LINKING', type: 'Piece Rate' },
    
    // Unit 1 Trimming
    { sec: secTrimming1, styleKey: 'HM-SW-2026/01', name: 'INSIDE THREAD TRIMMING', type: 'Piece Rate' },
    { sec: secTrimming1, styleKey: 'ZR-KNT-8812', name: 'INSIDE THREAD TRIMMING', type: 'Piece Rate' },
    
    // Unit 1 Sewing
    { sec: secSewing1, styleKey: 'HM-SW-2026/01', name: 'MAIN LABEL & CARE LABEL', type: 'Piece Rate' },
    { sec: secSewing1, styleKey: 'ZR-KNT-8812', name: 'BUTTON ATTACH & HOLE', type: 'Piece Rate' },
    { sec: secSewing1, styleKey: 'MS-CAS-552', name: 'MAIN LABEL & CARE LABEL', type: 'Piece Rate' },

    // Unit 2 Linking-2
    { sec: secLinking2, styleKey: 'ZR-HOOD-109', name: 'BODY LINKING (B2)', type: 'Piece Rate' },
    { sec: secLinking2, styleKey: 'PB-STRIPED-99', name: 'BODY LINKING (B2)', type: 'Piece Rate' },
    { sec: secLinking2, styleKey: 'HM-CD-4050', name: 'BODY LINKING (B2)', type: 'Piece Rate' },
    { sec: secLinking2, styleKey: 'MS-ZIP-770', name: 'BODY LINKING (B2)', type: 'Piece Rate' },

    // Unit 2 Sewing-2
    { sec: secSewing2, styleKey: 'ZR-HOOD-109', name: 'ZIPPER ATTACH (B2)', type: 'Piece Rate' },
    { sec: secSewing2, styleKey: 'PB-STRIPED-99', name: 'LABEL SEWING (B2)', type: 'Piece Rate' },
    { sec: secSewing2, styleKey: 'HM-CD-4050', name: 'BUTTON ATTACH (B2)', type: 'Piece Rate' }
  ];

  const processMap = {};
  for (const p of processesDefs) {
    if (!p.sec) continue;
    const st = styleMap[p.styleKey];
    if (!st) continue;

    let proc = await prisma.process.findFirst({
      where: {
        section_id: p.sec.id,
        style_id: st.id,
        process_name: p.name
      }
    });

    if (!proc) {
      proc = await prisma.process.create({
        data: {
          section_id: p.sec.id,
          buyer_id: st.buyer_id,
          style_id: st.id,
          process_name: p.name,
          type: p.type,
          status: 'Active',
          processed_by: 1
        }
      });
      console.log(`+ Added Process: ${proc.process_name} for Style ${st.style_no}`);
    }
    const key = `${p.sec.id}-${st.id}-${p.name}`;
    processMap[key] = proc;
  }

  // 6. Seed Colors
  const colorNames = ['01-NAVY BLUE', '02-JET BLACK', '03-CHARCOAL GREY', '04-OFF WHITE', '05-BURGUNDY MAROON'];
  const createdColors = [];
  for (const [procKey, proc] of Object.entries(processMap)) {
    for (const cName of colorNames.slice(0, 3)) {
      let color = await prisma.color.findFirst({
        where: {
          section_id: proc.section_id,
          style_id: proc.style_id,
          process_id: proc.id,
          color_name: cName
        }
      });
      if (!color) {
        color = await prisma.color.create({
          data: {
            section_id: proc.section_id,
            style_id: proc.style_id,
            process_id: proc.id,
            color_name: cName,
            processed_by: 1
          }
        });
        createdColors.push(color);
      }
    }
  }
  console.log(`✅ Colors created/verified: ${createdColors.length}`);

  // 7. Seed Piece Rates
  let pieceRatesCount = 0;
  for (const [procKey, proc] of Object.entries(processMap)) {
    const existing = await prisma.pieceRate.findFirst({
      where: {
        section_id: proc.section_id,
        style_id: proc.style_id,
        process_id: proc.id
      }
    });
    if (!existing) {
      const rate = proc.process_name.includes('LINKING') ? 4.50 : (proc.process_name.includes('LABEL') ? 1.20 : 2.80);
      await prisma.pieceRate.create({
        data: {
          section_id: proc.section_id,
          style_id: proc.style_id,
          process_id: proc.id,
          rate,
          effective_date: new Date('2026-01-01'),
          processed_by: 1
        }
      });
      pieceRatesCount++;
    }
  }
  console.log(`✅ Piece Rates created: ${pieceRatesCount}`);

  // 8. Seed Buyer Orders (Now clean with buyer_id, style_id, order_quantity, unit_id)
  const ordersData = [
    // Unit 1 Orders
    { unit: unit1, styleKey: 'HM-SW-2026/01', qty: 15000, yarnRcv: 12500 },
    { unit: unit1, styleKey: 'ZR-KNT-8812', qty: 12000, yarnRcv: 9800 },
    { unit: unit1, styleKey: 'MS-CAS-552', qty: 20000, yarnRcv: 16500 },
    { unit: unit1, styleKey: 'JPRBLURILEY CREW NECK LS', qty: 8000, yarnRcv: 6400 },
    { unit: unit1, styleKey: '1145504', qty: 6500, yarnRcv: 5200 },

    // Unit 2 Orders
    { unit: unit2, styleKey: 'ZR-HOOD-109', qty: 10000, yarnRcv: 8200 },
    { unit: unit2, styleKey: 'PB-STRIPED-99', qty: 14000, yarnRcv: 11500 },
    { unit: unit2, styleKey: 'HM-CD-4050', qty: 9500, yarnRcv: 7800 },
    { unit: unit2, styleKey: 'MS-ZIP-770', qty: 18000, yarnRcv: 14200 },
    { unit: unit2, styleKey: 'CA-CARDIGAN-21', qty: 11000, yarnRcv: 9000 }
  ];

  let ordersCreated = 0;
  for (const o of ordersData) {
    const st = styleMap[o.styleKey];
    if (!st) continue;

    let existingOrder = await prisma.buyerOrder.findFirst({
      where: {
        unit_id: o.unit.id,
        buyer_id: st.buyer_id,
        style_id: st.id
      }
    });

    if (!existingOrder) {
      await prisma.buyerOrder.create({
        data: {
          unit_id: o.unit.id,
          buyer_id: st.buyer_id,
          style_id: st.id,
          order_quantity: o.qty,
          yarn_received: o.yarnRcv,
          processed_by: 1
        }
      });
      ordersCreated++;
      console.log(`+ Added Buyer Order: ${o.styleKey} (Qty: ${o.qty}) in ${o.unit.code}`);
    }
  }
  console.log(`✅ Buyer Orders created: ${ordersCreated}`);

  // 9. Seed Employees
  const employeesData = [
    // Unit 1 Employees
    { unit: unit1, card_no: 'BW-1001', name: 'মো: রফিকুল ইসলাম', designation: 'Senior Linking Operator', sec: secLinking1, block: blockA },
    { unit: unit1, card_no: 'BW-1002', name: 'মোছা: সুমি আক্তার', designation: 'Linking Operator', sec: secLinking1, block: blockA },
    { unit: unit1, card_no: 'BW-1003', name: 'আলমগীর হোসেন', designation: 'Linking Operator', sec: secLinking1, block: blockB },
    { unit: unit1, card_no: 'BW-1004', name: 'সাজ্জাদ হোসেন', designation: 'Linking Operator', sec: secLinking1, block: blockB },
    { unit: unit1, card_no: 'BW-1005', name: 'রিনা বেগম', designation: 'Senior Mender', sec: secMending1, block: blockC },
    { unit: unit1, card_no: 'BW-1006', name: 'আব্দুল জলিল', designation: 'Mending Inspector', sec: secMending1, block: blockC },
    { unit: unit1, card_no: 'BW-1007', name: 'মো: কামরুল হাসান', designation: 'Sewing Operator', sec: secSewing1, block: blockD },
    { unit: unit1, card_no: 'BW-1008', name: 'শাহনাজ পারভীন', designation: 'Overlock Operator', sec: secSewing1, block: blockD },
    { unit: unit1, card_no: 'BW-1009', name: 'বিলকিস বানু', designation: 'Trimming Operator', sec: secTrimming1, block: blockE },
    { unit: unit1, card_no: 'BW-1010', name: 'মো: জাহাঙ্গীর আলম', designation: 'Trimming Helper', sec: secTrimming1, block: blockE },

    // Unit 2 Employees
    { unit: unit2, card_no: 'BW2-2001', name: 'মো: তারেক রহমান', designation: 'Senior Linking Operator', sec: secLinking2, block: blockF },
    { unit: unit2, card_no: 'BW2-2002', name: 'ফাতেমা খাতুন', designation: 'Linking Operator', sec: secLinking2, block: blockF },
    { unit: unit2, card_no: 'BW2-2003', name: 'মো: মিজানুর রহমান', designation: 'Sewing Operator', sec: secSewing2, block: blockG },
    { unit: unit2, card_no: 'BW2-2004', name: 'নাসিমা আক্তার', designation: 'Sewing Operator', sec: secSewing2, block: blockG },
    { unit: unit2, card_no: 'BW2-2005', name: 'হাবিবুর রহমান', designation: 'Trimming Operator', sec: secTrimming2, block: blockH },
    { unit: unit2, card_no: 'BW2-2006', name: 'মোছা: মরিয়ম নেসা', designation: 'Trimming Operator', sec: secTrimming2, block: blockH }
  ];

  const empMap = {};
  let employeesCreated = 0;
  for (const emp of employeesData) {
    if (!emp.sec) continue;
    let existingEmp = await prisma.employee.findFirst({ where: { card_no: emp.card_no } });
    if (!existingEmp) {
      existingEmp = await prisma.employee.create({
        data: {
          card_no: emp.card_no,
          name: emp.name,
          designation: emp.designation,
          join_date: new Date('2024-03-15'),
          section_id: emp.sec.id,
          block_id: emp.block?.id || null,
          unit_id: emp.unit.id,
          status: 'Active',
          processed_by: 1
        }
      });
      employeesCreated++;
    }
    empMap[emp.card_no] = existingEmp;
  }
  console.log(`✅ Employees created: ${employeesCreated}`);

  // 10. Seed Yarn Challans
  let challansCreated = 0;
  const challanList = [
    { unit: unit1, sec: secLinking1, st: styleMap['HM-SW-2026/01'], chNo: 'CH-26-101', gpNo: 'GP-8801', qty: 4500, daysAgo: 5 },
    { unit: unit1, sec: secLinking1, st: styleMap['ZR-KNT-8812'], chNo: 'CH-26-102', gpNo: 'GP-8802', qty: 3800, daysAgo: 4 },
    { unit: unit1, sec: secLinking1, st: styleMap['MS-CAS-552'], chNo: 'CH-26-103', gpNo: 'GP-8803', qty: 5200, daysAgo: 2 },
    { unit: unit2, sec: secLinking2, st: styleMap['ZR-HOOD-109'], chNo: 'CH-B2-201', gpNo: 'GP-9901', qty: 4000, daysAgo: 4 },
    { unit: unit2, sec: secLinking2, st: styleMap['PB-STRIPED-99'], chNo: 'CH-B2-202', gpNo: 'GP-9902', qty: 5000, daysAgo: 3 },
    { unit: unit2, sec: secLinking2, st: styleMap['MS-ZIP-770'], chNo: 'CH-B2-203', gpNo: 'GP-9903', qty: 6000, daysAgo: 1 }
  ];

  for (const c of challanList) {
    if (!c.sec || !c.st) continue;
    const procKey = Object.keys(processMap).find(k => k.startsWith(`${c.sec.id}-${c.st.id}`));
    const proc = procKey ? processMap[procKey] : null;
    if (!proc) continue;

    const existingCh = await prisma.yarnChallan.findFirst({ where: { challan_no: c.chNo } });
    if (!existingCh) {
      const chDate = new Date();
      chDate.setDate(chDate.getDate() - c.daysAgo);

      await prisma.yarnChallan.create({
        data: {
          unit_id: c.unit.id,
          section_id: c.sec.id,
          style_id: c.st.id,
          process_id: proc.id,
          challan_no: c.chNo,
          gate_pass_no: c.gpNo,
          challan_date: chDate,
          quantity: c.qty,
          processed_by: 1
        }
      });
      challansCreated++;
    }
  }
  console.log(`✅ Yarn Challans created: ${challansCreated}`);

  // 11. Seed Production Data (Across recent 7 days AND TODAY)
  console.log('Generating realistic Production entries...');
  const today = new Date();
  let prodCreated = 0;

  // We generate production entries for past 5 days + today
  const dayOffsets = [5, 4, 3, 2, 1, 0]; // 0 is today

  for (const daysAgo of dayOffsets) {
    const prodDate = new Date();
    prodDate.setDate(today.getDate() - daysAgo);
    prodDate.setHours(12, 0, 0, 0);

    // Unit 1 Productions
    // Linking U1 (BW-1001, BW-1002, BW-1003, BW-1004)
    const stU1 = styleMap['HM-SW-2026/01'] || styleMap['ZR-KNT-8812'];
    const procU1Link = processMap[`${secLinking1?.id}-${stU1?.id}-BODY & SLEEVE LINKING`];

    if (secLinking1 && stU1 && procU1Link) {
      const u1LinkEmps = ['BW-1001', 'BW-1002', 'BW-1003', 'BW-1004'];
      for (const card of u1LinkEmps) {
        const emp = empMap[card];
        if (!emp) continue;
        const qty = 85 + Math.floor(Math.random() * 45); // 85 - 130 pcs
        await prisma.production.create({
          data: {
            unit_id: unit1.id,
            section_id: secLinking1.id,
            style_id: stU1.id,
            process_id: procU1Link.id,
            production_date: prodDate,
            card_no_id: emp.id,
            quantity: qty,
            processed_by: 1
          }
        });
        prodCreated++;
      }
    }

    // Sewing U1 (BW-1007, BW-1008)
    const procU1Sew = processMap[`${secSewing1?.id}-${stU1?.id}-MAIN LABEL & CARE LABEL`];
    if (secSewing1 && stU1 && procU1Sew) {
      for (const card of ['BW-1007', 'BW-1008']) {
        const emp = empMap[card];
        if (!emp) continue;
        const qty = 180 + Math.floor(Math.random() * 60); // 180 - 240 pcs
        await prisma.production.create({
          data: {
            unit_id: unit1.id,
            section_id: secSewing1.id,
            style_id: stU1.id,
            process_id: procU1Sew.id,
            production_date: prodDate,
            card_no_id: emp.id,
            quantity: qty,
            processed_by: 1
          }
        });
        prodCreated++;
      }
    }

    // Trimming U1 (BW-1009, BW-1010)
    const procU1Trim = processMap[`${secTrimming1?.id}-${stU1?.id}-INSIDE THREAD TRIMMING`];
    if (secTrimming1 && stU1 && procU1Trim) {
      for (const card of ['BW-1009', 'BW-1010']) {
        const emp = empMap[card];
        if (!emp) continue;
        const qty = 160 + Math.floor(Math.random() * 50); // 160 - 210 pcs
        await prisma.production.create({
          data: {
            unit_id: unit1.id,
            section_id: secTrimming1.id,
            style_id: stU1.id,
            process_id: procU1Trim.id,
            production_date: prodDate,
            card_no_id: emp.id,
            quantity: qty,
            processed_by: 1
          }
        });
        prodCreated++;
      }
    }

    // Unit 2 Productions
    const stU2 = styleMap['ZR-HOOD-109'] || styleMap['PB-STRIPED-99'];
    const procU2Link = processMap[`${secLinking2?.id}-${stU2?.id}-BODY LINKING (B2)`];

    if (secLinking2 && stU2 && procU2Link) {
      for (const card of ['BW2-2001', 'BW2-2002']) {
        const emp = empMap[card];
        if (!emp) continue;
        const qty = 75 + Math.floor(Math.random() * 40); // 75 - 115 pcs
        await prisma.production.create({
          data: {
            unit_id: unit2.id,
            section_id: secLinking2.id,
            style_id: stU2.id,
            process_id: procU2Link.id,
            production_date: prodDate,
            card_no_id: emp.id,
            quantity: qty,
            processed_by: 1
          }
        });
        prodCreated++;
      }
    }

    // Sewing U2 (BW2-2003, BW2-2004)
    const procU2Sew = processMap[`${secSewing2?.id}-${stU2?.id}-ZIPPER ATTACH (B2)`];
    if (secSewing2 && stU2 && procU2Sew) {
      for (const card of ['BW2-2003', 'BW2-2004']) {
        const emp = empMap[card];
        if (!emp) continue;
        const qty = 140 + Math.floor(Math.random() * 50); // 140 - 190 pcs
        await prisma.production.create({
          data: {
            unit_id: unit2.id,
            section_id: secSewing2.id,
            style_id: stU2.id,
            process_id: procU2Sew.id,
            production_date: prodDate,
            card_no_id: emp.id,
            quantity: qty,
            processed_by: 1
          }
        });
        prodCreated++;
      }
    }
  }

  console.log(`✅ Production records created: ${prodCreated} (including today's live production)`);

  console.log('🎉 Sample data seeding completed successfully!');
}

seedSampleData()
  .catch(err => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
