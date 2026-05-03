const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'নাম আবশ্যক'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'ইমেইল আবশ্যক'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'পাসওয়ার্ড আবশ্যক'],
      minlength: 6,
      select: false,
    },
    avatar: {
      type: String,
      default: '',
    },
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

// পাসওয়ার্ড হ্যাশ (সেভ করার আগে) - mongoose 7+ কম্প্যাটিবল
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// পাসওয়ার্ড চেক মেথড
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);