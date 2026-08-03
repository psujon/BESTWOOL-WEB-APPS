const { prisma } = require('../db');

exports.getAllActive = async (req, res) => {
  try {
    const list = await prisma.employee.findMany({
      where: { status: 'Active' },
      include: {
        section: { select: { name: true, code: true } }
      },
      orderBy: { id: 'desc' }
    });

    const result = list.map(emp => ({
      ...emp,
      section_name: emp.section?.name || null,
      section_code: emp.section?.code || null,
      section: undefined
    }));

    res.json(result);
  } catch (err) {
    console.error('Error fetching active employees:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  const { card_no, name, designation, join_date, section_id } = req.body;
  const userId = req.user ? req.user.id : null;

  if (!card_no || !name || !designation || !join_date || !section_id) {
    return res.status(400).json({ message: 'কার্ড নং, নাম, পদবী, জয়েন ডেট ও সেকশন পূরণ করা বাধ্যতামূলক!' });
  }

  try {
    const employee = await prisma.employee.create({
      data: {
        card_no: card_no.trim(),
        name: name.trim(),
        designation: designation.trim(),
        join_date: new Date(join_date),
        section_id: parseInt(section_id),
        status: 'Active',
        processed_by: userId,
        processed_date: new Date()
      }
    });

    res.status(201).json(employee);
  } catch (err) {
    console.error('Error creating employee:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const { card_no, name, designation, join_date, section_id, status } = req.body;
  const userId = req.user ? req.user.id : null;

  try {
    const employee = await prisma.employee.update({
      where: { id: parseInt(id) },
      data: {
        card_no: card_no ? card_no.trim() : undefined,
        name: name ? name.trim() : undefined,
        designation: designation ? designation.trim() : undefined,
        join_date: join_date ? new Date(join_date) : undefined,
        section_id: section_id ? parseInt(section_id) : undefined,
        status: status || 'Active',
        processed_by: userId,
        processed_date: new Date()
      }
    });

    res.json(employee);
  } catch (err) {
    console.error('Error updating employee:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.delete = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.employee.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Employee deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Search Employee from external MSSQL database (On-Demand Connection Only)
exports.searchExternalEmployee = async (req, res) => {
  const sql = require('mssql');
  const { card_no } = req.query;

  if (!card_no || !card_no.trim()) {
    return res.status(400).json({ message: 'কার্ড নম্বর প্রদান করুন!' });
  }

  const cardNo = card_no.trim();
  const serverHost = process.env.MSSQL_SERVER || '10.10.2.2';
  const serverPort = parseInt(process.env.MSSQL_PORT || '4368');
  const dbUser = process.env.MSSQL_USER || 'sa';
  const dbPassword = process.env.MSSQL_PASSWORD !== undefined ? process.env.MSSQL_PASSWORD : '';
  const dbName = process.env.MSSQL_DATABASE || 'garments_db';

  // Strategy 1: Direct TCP/IP connection to port 4368 (Fastest, avoids UDP 1434 SQL Browser timeout)
  const configDirectPort = {
    user: dbUser,
    password: dbPassword,
    server: serverHost,
    port: serverPort,
    database: dbName,
    options: {
      encrypt: false,
      trustServerCertificate: true,
      enableArithAbort: true
    },
    connectionTimeout: 12000,
    requestTimeout: 20000
  };

  // Strategy 2: Instance-based connection via SQL Browser (fallback)
  const configInstanceFallback = {
    user: dbUser,
    password: dbPassword,
    server: serverHost,
    database: dbName,
    options: {
      encrypt: false,
      trustServerCertificate: true,
      instanceName: process.env.MSSQL_INSTANCE || 'sql2012',
      enableArithAbort: true
    },
    connectionTimeout: 12000,
    requestTimeout: 20000
  };

  let pool = null;

  try {
    let result = null;

    // Connect ONLY when search button is clicked
    try {
      pool = await sql.connect(configDirectPort);
      result = await pool.request()
        .input('cardNo', sql.VarChar, cardNo)
        .query(`
          select eb.emp_id, eb.emp_name, b_designation.designation_name, B_section.section_name, ebi.join_date 
          from emp_basic as eb
          INNER join emp_basic_info as ebi on eb.emp_no=ebi.emp_no
          inner join b_designation on ebi.designation_code=b_designation.Designation_code
          inner join B_section on ebi.section_code=B_section.section_code
          where eb.emp_id = @cardNo
        `);
    } catch (directErr) {
      console.warn(`Direct port ${serverPort} connection failed: ${directErr.message}. Trying instance fallback...`);
      if (pool) {
        try { await pool.close(); } catch (_) {}
        pool = null;
      }
      pool = await sql.connect(configInstanceFallback);
      result = await pool.request()
        .input('cardNo', sql.VarChar, cardNo)
        .query(`
          select eb.emp_id, eb.emp_name, b_designation.designation_name, B_section.section_name, ebi.join_date 
          from emp_basic as eb
          INNER join emp_basic_info as ebi on eb.emp_no=ebi.emp_no
          inner join b_designation on ebi.designation_code=b_designation.Designation_code
          inner join B_section on ebi.section_code=B_section.section_code
          where eb.emp_id = @cardNo
        `);
    }

    if (!result || !result.recordset || result.recordset.length === 0) {
      return res.status(404).json({ message: `কার্ড নং '${cardNo}' দিয়ে কোনো এমপ্লয়ী পাওয়া যায়নি!` });
    }

    const row = result.recordset[0];
    return res.json({
      success: true,
      data: {
        emp_id: row.emp_id,
        emp_name: row.emp_name,
        designation_name: row.designation_name,
        section_name: row.section_name,
        join_date: row.join_date ? new Date(row.join_date).toISOString().split('T')[0] : ''
      }
    });
  } catch (err) {
    console.error('Error querying MSSQL database:', err);
    return res.status(500).json({ message: `এমএসএসকিউএল ডাটাবেজে সংযোগ ব্যর্থ হয়েছে: ${err.message}` });
  } finally {
    // ALWAYS close connection pool immediately when search is finished
    if (pool) {
      try {
        await pool.close();
      } catch (closeErr) {
        console.error('Error closing MSSQL pool:', closeErr);
      }
    }
  }
};
