const sequelize = require('./config/database');
const User = require('./models/User');

async function seedAdmin() {
  try {
    await sequelize.sync(); // ensure tables exist
    const adminEmail = 'admin@blog.com';
    const existingAdmin = await User.findOne({ where: { email: adminEmail } });

    if (!existingAdmin) {
      const admin = User.build({
        username: 'Admin',
        email: adminEmail,
        password: 'adminpassword',
        role: 'admin'
      });
      await admin.save();
      console.log('✅ Default Admin created successfully!');
      console.log('Email:', adminEmail);
      console.log('Password: adminpassword');
    } else {
      // If it exists, make sure role is admin
      existingAdmin.role = 'admin';
      await existingAdmin.save();
      console.log('✅ Default Admin already exists and role is guaranteed to be admin!');
      console.log('Email:', adminEmail);
      console.log('Password: (your existing password for this account, or "adminpassword" if you never changed it)');
    }
  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    process.exit();
  }
}

seedAdmin();
