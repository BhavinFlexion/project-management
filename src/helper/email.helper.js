const nodemailer = require("nodemailer");

const cron = require("node-cron");

const { Op } = require("sequelize");

const path = require('path')


const handlebars = require('handlebars')

const User = require("../models/users");

const Task = require("../models/tasks");

const Comment = require("../models/comments");

const { verify } = require("jsonwebtoken");

const { readHTMLFile } = require("./common");


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "bhavinradadiya444@gmail.com",
    pass: "vkeffhnbawbpcdef",
  },
});

//  All otp in Email
const sendEmail = async (recipient, template, data ,) => {
  try {
    readHTMLFile(path.join(__dirname, `../email_templates/${template.template}.html`), async function (error, html) {
      try {
          const compiledTemplate = handlebars.compile(html);
          const htmlToSend = compiledTemplate(data);
          const subject = template.subject;
          const to = recipient;
          const mailOptions = {
            from: "bhavinradadiya444@gmail.com",
            to: to,
            subject: subject,
            html: htmlToSend,
          };
          await transporter.sendMail(mailOptions)
       } catch (error) {
        console.error("Error sending email:", error);
       }
  })
    console.log(`Email sent successfully to ${recipient}`);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
transporter.verify(function (error, success) {
  if (error) {
    console.error("SMTP connection error:", error);
  } else {
    console.log("SMTP Connection has been established successfully.");
  }
});

const sendTaskReminderEmails = async (email) => {
  try {
    const findUser = await User.findOne({
      where: { status: "Invited", email: email },
    });

    if (!findUser) {
      console.log("No invited user found.");
      return;
    }
    await sendEmail(
      email, "Invitation Reminder","Reminder: You have been invited to join our workspace. Please check your invitations."
    );

    const tasksWithComments = await Task.findAll({
      include: [{ model: Comment, }],
    });

    for (const task of tasksWithComments) {
      if (task.assignee?.email && task.comments.length > 0) {
        await sendEmail(
          task.assignee.email,"Comment Reminder",`Reminder: A comment has been added on the task "${task.title}". Please review the comment.`
        );
      }
    }

    for (const task of tasksWithComments) {
      for (const comment of task.comments) {
        if (comment.createdAt > findUser.createdAt) {
          await sendEmail(
            findUser.email,"Comment Reminder",`Reminder: A comment has been added on the task "${task.title}". Please review the comment.`);
          break;
        }
      }
    }
  } catch (error) {
    console.error("Error sending task reminder emails:", error);
  }
};

cron.schedule("0 0 * * *", async () => {
  console.log("Running task reminder cron job...");
  try {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const pastDueTasks = await Task.findAll({
      where: {
        dueDate: {
          [Op.lt]: yesterday,
        },
        status: {
          [Op.ne]: "Completed",
        },
      },
      include: [{ model: User, as: "assignee" }],
    });

    for (const task of pastDueTasks) {
      await sendEmail(
        task.assignee.email, "Past Due Date Reminder", `Reminder: The task "${task.title}" is past due. Please take necessary actions.`
      );
    }
  } catch (error) {
    console.error("Error sending past due date reminders:", error);
  }
});

Task.hasMany(Comment, { foreignKey: "taskId", as: "comments" });
Comment.belongsTo(Task, { foreignKey: "taskId", as: "task" });

module.exports = { sendTaskReminderEmails , sendEmail };