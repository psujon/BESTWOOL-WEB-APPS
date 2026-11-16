const { prisma } = require('../db');

exports.getProfile = async (req, res) => {
  try {
    let company = await prisma.companyProfile.findFirst();
    if (!company) {
      // Create initial default profile if not exists
      company = await prisma.companyProfile.create({
        data: {
          company_name: 'BEST WOOL SWEATERS LTD.',
          tagline: 'Quality Knitwear & Garments Manufacturer',
          email: 'info@bestwool.com',
          phone: '+880 2 9881234',
          address: 'Plot #12, Road #04, Sector #07, Uttara, Dhaka-1230, Bangladesh',
          website: 'https://bestwool.com',
          tax_id: 'BIN-100293848123',
          logo_url: '',
          processed_by: req.user ? req.user.id : null,
          processed_date: new Date()
        }
      });
    }
    res.json(company);
  } catch (err) {
    console.error('Company profile fetch error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getAllCompanies = async (req, res) => {
  try {
    let companies = await prisma.companyProfile.findMany({
      orderBy: { id: 'asc' }
    });
    if (companies.length === 0) {
      const defaultCompany = await prisma.companyProfile.create({
        data: {
          company_name: 'BEST WOOL SWEATERS LTD.',
          tagline: 'Quality Knitwear & Garments Manufacturer',
          email: 'info@bestwool.com',
          phone: '+880 2 9881234',
          address: 'Plot #12, Road #04, Sector #07, Uttara, Dhaka-1230, Bangladesh',
          website: 'https://bestwool.com',
          tax_id: 'BIN-100293848123',
          logo_url: '',
          processed_by: req.user ? req.user.id : null,
          processed_date: new Date()
        }
      });
      companies = [defaultCompany];
    }
    res.json(companies);
  } catch (err) {
    console.error('Company profiles fetch error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.saveProfile = async (req, res) => {
  const { company_name, tagline, email, phone, address, website, tax_id, logo_url } = req.body;
  const userId = req.user ? req.user.id : null;

  try {
    let company = await prisma.companyProfile.findFirst();

    if (company) {
      company = await prisma.companyProfile.update({
        where: { id: company.id },
        data: {
          company_name,
          tagline,
          email,
          phone,
          address,
          website,
          tax_id,
          logo_url,
          processed_by: userId,
          processed_date: new Date()
        }
      });
    } else {
      company = await prisma.companyProfile.create({
        data: {
          company_name,
          tagline,
          email,
          phone,
          address,
          website,
          tax_id,
          logo_url,
          processed_by: userId,
          processed_date: new Date()
        }
      });
    }

    res.json(company);
  } catch (err) {
    console.error('Company profile save error:', err);
    res.status(500).json({ message: err.message });
  }
};
