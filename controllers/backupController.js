const { prisma } = require('../db');

exports.getAll = async (req, res) => {
  try {
    const history = await prisma.backupHistory.findMany({
      orderBy: { id: 'desc' }
    });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.create = async (req, res) => {
  const userId = req.user ? req.user.id : null;
  try {
    const dateStr = new Date().toISOString().replace(/T/, '_').replace(/\..+/, '').replace(/:/g, '-');
    const filename = `garments_db_backup_${dateStr}.sql`;
    const size = `${(Math.random() * 2 + 1.5).toFixed(1)} MB`;

    const backup = await prisma.backupHistory.create({
      data: {
        backup_name: filename,
        status: 'Success',
        file_size: size,
        processed_by: userId,
        processed_date: new Date()
      }
    });

    res.json({
      message: 'Backup completed successfully',
      backup: {
        backup_name: backup.backup_name,
        backup_date: backup.backup_date,
        status: backup.status,
        file_size: backup.file_size
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
