const { DataTypes } = require('sequelize');
const slugify = require('slugify');
const sequelize = require('../config/database');
const User = require('./User');

const Post = sequelize.define('Post', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING,
    unique: true,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  tags: {
    type: DataTypes.JSON, // For MySQL, JSON works well to store arrays
    defaultValue: []
  },
  category: {
    type: DataTypes.STRING,
  },
  image: {
    type: DataTypes.STRING,
  },
  likes: {
    type: DataTypes.JSON, // Array of User IDs who liked the post
    defaultValue: []
  }
}, {
  hooks: {
    beforeValidate: (post) => {
      if (post.title) {
        post.slug = slugify(post.title, { lower: true, strict: true });
      }
    }
  }
});

// Associations
Post.belongsTo(User, { as: 'author', foreignKey: 'authorId' });
User.hasMany(Post, { foreignKey: 'authorId' });

module.exports = Post;
