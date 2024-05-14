const User = require("../models/users");

const jwt = require("jsonwebtoken");

const bcrypt = require("bcrypt");

const { Op } = require("sequelize");

const moment = require('moment');

const {ROLE_FIELD,STATUS_FIELD, TYPES_FIELD, EMAILCONSTANT} = require("../helper/constant");

const path = require('path');

const { sendEmail } = require("../helper/email.helper");

exports.signUp = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      firstName,
      lastName,
      description,
      type,
      role,
    } = req.body;

    if (email === password || username === password) {
      return res.status(400).json({ message: res.__("ERR_INVALID_CREDENTIALS") });
    }

    if (!email || !username || !password) {
      return res.status(400).json({ message: res.__("ERR_INVALID_CREDENTIALS_REQUIRED") });
    }

    let invitedUser = await User.findOne({ where: { email } });

    if (invitedUser) {
      if (invitedUser.status === STATUS_FIELD.INVITED) {
           const otp = Math.floor(100000 + Math.random() * 900000);
            invitedUser.username = username;
            invitedUser.password = await bcrypt.hash(password, 10);
            invitedUser.firstName = firstName;
            invitedUser.lastName = lastName;
            invitedUser.description = description;
            invitedUser.type = type;
            invitedUser.role = role;
            invitedUser.status = STATUS_FIELD.PENDING; 
            invitedUser.otp = otp;
            invitedUser.otpExpiry = new Date();
            invitedUser.otpExpiry.setMinutes(invitedUser.otpExpiry.getMinutes() + 5);
            await invitedUser.save();

        return res.status(200).json({ status: true, message: res.__("USER_SUCCESSFULLY"), data: invitedUser });
      } else {
        return res.status(409).json({ message: res.__("ALREADY_EXISTS") });
      }
    }

    let status;
    switch (type) {
      case 'Organization':
        status = STATUS_FIELD.ACTIVE;
        break;
      case 'invite':
        status = STATUS_FIELD.INVITED;
        break;
      default:
        status = STATUS_FIELD.PENDING;
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const otp = Math.floor(100000 + Math.random() * 900000);

    const otpExpiry = new Date();

    otpExpiry.setMinutes(otpExpiry.getMinutes() + 5);

    const data = await User.create({
      username,
      email,
      password: hashPassword,
      firstName,
      lastName,
      description,
      type,
      role,
      status,
      otp,
      otpExpiry,
    });

    let templateData = {
      date: moment().format('DD-MM-YYYY HH:mm:ss'),
      email: email,
      OTP: otp
  }
  sendEmail(email, EMAILCONSTANT.REGISTERED, templateData)

    res.status(201).json({ status: true, message: res.__("USER_SUCCESSFULLY"), data: data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message:  error.message });
  }

};
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const findUser = await User.findOne({ where: { email } });

    if (!findUser) {
      return res.status(404).json({ message: res.__("USER_NOT_FOUND") });
    }

    if (findUser.status !== STATUS_FIELD.PENDING) {
      return res.status(400).json({ message: res.__("USER_ALREADY_VERIFIED") });
    }

    const newOTP = Math.floor(100000 + Math.random() * 900000);
    
    findUser.otp = newOTP;
    findUser.otpExpiry = new Date();
    findUser.otpExpiry.setMinutes(findUser.otpExpiry.getMinutes() + 1);
    await findUser.save();

    let templateData = {
      date: moment().format('DD-MM-YYYY HH:mm:ss'),
      email: email,
      OTP: newOTP
    };
    await sendEmail(email, EMAILCONSTANT.RESENDOTP, templateData);

    res.status(200).json({ status: true, message: res.__("OTP_RESENT_SUCCESSFULLY") });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const findUser = await User.findOne({ where: { email, otp, status: STATUS_FIELD.PENDING } });

    if (!findUser) {
      return res.status(400).json({ message: res.__("INVALID_EMAILOROTP")});
    }

    if (findUser.otpExpiry < new Date()) {
      return res.status(400).json({ message: res.__("EXPIRED_OTP")});
    }

    await User.update({ status: STATUS_FIELD.VERIFIED, otp: null, otpExpiry: null }, { where: { id: findUser.id } });

    res.status(200).json({ message: res.__("VERIFIED_SUCCESSFULLY")});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message:  error.message});
  }
};

exports.signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) {
        return res.status(400).json({ message: res.__("EMAIL_REQUIRED")});
    }

    const findUser = await User.findOne({ where: { email } });
    if (!findUser) {
        return res.status(401).json({ message: res.__("INVALID_EMAILORPASSWORD")});
    }

    const passwordMatch = await bcrypt.compare(password, findUser.password);
    if (!passwordMatch) {
        return res.status(401).json({ message: res.__("INVALID_PASSWORD")});
    }

    if (findUser.status === STATUS_FIELD.VERIFIED) {
      findUser.status = STATUS_FIELD.ACTIVE;
        await findUser.save();
    }

    if (findUser.status === STATUS_FIELD.PENDING) {
      const newOtp = Math.floor(100000 + Math.random() * 900000);
      const otpExpiry = new Date(Date.now() + 5 * 60000); 
      findUser.otp = newOtp;
      findUser.otpExpiry = otpExpiry;
      await findUser.save();

    let templateData = {
      date: moment().format('DD-MM-YYYY HH:mm:ss'),
      email: email,
      OTP: newOtp
  }
      sendEmail(email, EMAILCONSTANT.REGISTERED, templateData)

      return res.status(401).json({ message: res.__("ACCOUNT_VERIFICATION_REQUIRED")});
    }

    const token = jwt.sign({ userId: findUser.id, email: findUser.email }, "secret-key", { expiresIn: "1h" });

    res.status(201).json({ status: true, message: res.__("LOGIN_SUCCESSFUL"), token });
} catch (error) {
    console.error(error);
    res.status(500).json({ message:  error.message });
}
};

exports.forgotPassword = async (req, res) => {
    try {
      const { email } = req.body; 
  
      const findUser = await User.findOne({ where: { email } });
  
      if (!findUser) {
        return res.status(404).json({status: false, message:res.__("USER_EMAIL_NOT_EXIST") });
      }
  
      const otp = Math.floor(100000 + Math.random() * 900000);
      const otpExpiry = new Date(Date.now() + 5 * 60000); 
  
      findUser.otp = otp;
      findUser.otpExpiry = otpExpiry;
      await findUser.save();

      let templateData = {
        date: moment().format('DD-MM-YYYY HH:mm:ss'),
        email: email,
        OTP: otp
    }
    sendEmail(email, EMAILCONSTANT.FORGOT, templateData)
      
      return res.status(200).json({status: true, message: res.__("OTP_SENT_PASSWORDRESET") });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message});
    }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const findUser = await User.findOne({ where: { email, otp } });

    if (!findUser) {
      return res.status(400).json({status: false, message: res.__("INVALID_OTP") });
    }

    if (findUser.otpExpiry < new Date()) {
      return res.status(400).json({status: false, message: res.__("EXPIRED_OTP")});
    }

    const compareNewPass = await bcrypt.compare(newPassword, findUser.password);
    if (compareNewPass) {
      return res.status(400).json({status: false, message: res.__("NEWPASSWORD_DIFFERENT_THEOLDONE")});
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    findUser.password = hashedPassword;
    findUser.otp = null;
    findUser.otpExpiry = null;  
    await findUser.save();

    return res.status(200).json({status: true, message: res.__("PASSWORD_RESET_SUCCESSFULLY")});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message});
  }
};

exports.getUser = async (req, res) => {
    try {
      const { page = 1, limit = 10, type, role, search } = req.query;
  
      const filterOptions = {
        status: STATUS_FIELD.ACTIVE 
      };
  
      if (type) {
        filterOptions.type = type;
      }
      if (role) {
        filterOptions.role = role;
      }
  
      if (search) {
        filterOptions[Op.or] = [{ username: { [Op.like]: `%${search}%` } }];
      }
  
      const offset = (page - 1) * limit;
  
      const data = await User.findAll({
        where: filterOptions,
        limit: parseInt(limit),
        offset: parseInt(offset),
      });
  
      const totalCount = await User.count({ where: filterOptions });
      res.status(200).json({status: true, message: res.__("USER_RETRIEVED_SUCCESSFULLY"),
        page: parseInt(page),
        limit: parseInt(limit),
        totalCount: totalCount,
        data: data,
      });
      
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
};
 
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const findUser = await User.findByPk(userId);
    if (!findUser) {
      return res.status(403).json({ status: true, message: res.__("USER_NOT_FOUND") });
    }
    if (findUser.Organisation) {
      return res.status(403).json({status: true, message: res.__("ORGANIZATION_DELETEUSER"),});
    }

    if (!findUser) {
      return res.status(404).json({ status: true, message: res.__("USER_NOT_FOUND") });
    }
    await User.update(
      { status: STATUS_FIELD.DEACTIVE },
      { where: { id: userId } }
    );
    res.status(200).json({ status: true, message: res.__("USER_DELETED_SUCCESSFULLY") });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ status: false, message: error.message });
  }
};
  
exports.updateUser = async (req, res) => {
    try {
      const updateData = req.body;
      const userId = req.params.id;
    
      const user = await User.findByPk(userId);
    
      if (!user) {
        return res.status(404).json({ status: true, message: res.__("USER_NOT_FOUND") });
      }
  
      const sensitiveFields = [TYPES_FIELD, ROLE_FIELD, STATUS_FIELD]; 
      const sensitiveUpdates = sensitiveFields.some(field => Object.keys(updateData).includes(field));
      if (sensitiveUpdates) {
        return res.status(403).json({ status: true, message: res.__("UNAUTHORIZED") });
      }
      
      let updateFields = {};
      for (const key in updateData) {
        if (
          updateData[key] !== null &&
          updateData[key] !== undefined &&
          updateData[key] !== ""
        ) {
          updateFields[key] = updateData[key];
        }
      }
    
      if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({ status: true, message: res.__("NOFIELDS_UPDATE") });
      }
    
      const data = await User.update(updateFields, {
        where: { id: userId },
      });
    
      if (data === 0) {
        return res.status(404).json({ status: false, message: res.__("USER_NOT_FOUND") });
      }
    
      res.status(200).json({ status: true, message: res.__("USER_DELETED_SUCCESSFULLY") });
    } catch (error) {
      console.error("Error:", error.message);
      res.status(500).json({ status: false, message: error.message });
    }
};  