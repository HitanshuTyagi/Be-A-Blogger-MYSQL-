const { Op } = require('sequelize');
const Post = require('../models/Post');
const User = require('../models/User');
const nodemailer = require('nodemailer');

exports.getHome = async (req, res) => {
  try {
    const searchQuery = req.query.q || '';

    const posts = await Post.findAll({
      where: {
        title: { [Op.like]: `%${searchQuery}%` }
      },
      include: [{ model: User, as: 'author', attributes: ['id', 'username'] }],
      order: [['createdAt', 'DESC']]
    });

    res.json({ posts, q: searchQuery });
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.submitContact = async (req, res) => {
  const { name, email, message } = req.body;

  try {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    let mailOptions = {
      from: `"MyBlog Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO,
      subject: "New Contact Message from MyBlog",
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
      html: `
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong><br/>${message}</p>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "Your message has been sent successfully!" });
  } catch (err) {
    console.error("Error sending email:", err);
    res.status(500).json({ error: "Failed to send message. Please try again later." });
  }
};
