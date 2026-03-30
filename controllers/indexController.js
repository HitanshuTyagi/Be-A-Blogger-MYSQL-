const { Op } = require('sequelize');
const Post = require('../models/Post');
const User = require('../models/User');
const nodemailer = require('nodemailer');

exports.getHome = async (req, res) => {
  try {
    const searchQuery = req.query.q || '';

    // Search in title (case-insensitive)
    const posts = await Post.findAll({
      where: {
        title: { [Op.like]: `%${searchQuery}%` }
      },
      include: [{ model: User, as: 'author' }],
      order: [['createdAt', 'DESC']]
    });

    res.render('index', {
      posts,
      q: searchQuery
    });
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).send("Internal Server Error");
  }
};

exports.getAbout = (req, res) => {
  res.render("utils/about");
};

exports.getContact = (req, res) => {
  res.render("utils/contact");
};

exports.submitContact = async (req, res) => {
  const { name, email, message } = req.body;

  try {
    // 1. Create transporter
    let transporter = nodemailer.createTransport({
      service: "gmail", // or "hotmail", "yahoo", etc.
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // 2. Email options
    let mailOptions = {
      from: `"MyBlog Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO,
      subject: "📩 New Contact Message from MyBlog",
      text: `
You have a new message:

Name: ${name}
Email: ${email}
Message: ${message}
      `,
      html: `
        <h2>📩 New Contact Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong><br/>${message}</p>
      `
    };

    // 3. Send email
    await transporter.sendMail(mailOptions);

    req.flash("success", "✅ Your message has been sent successfully!");
    res.redirect("/contact");
  } catch (err) {
    console.error("❌ Error sending email:", err);
    req.flash("error", "❌ Failed to send message. Please try again later.");
    res.redirect("/contact");
  }
};
