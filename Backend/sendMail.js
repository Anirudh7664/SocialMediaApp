const nodemailer = require('nodemailer');

module.exports = async (email,subject,text)=>{
  try {
    const transporter = nodemailer.createTransport({
      host: "gmail",
      service:"smtp.gmail.com",
      port: 465,
      secure: true, 
      auth: {
        user: "anirudh0190.be21@chitkara.edu.in",
        pass: "RandevAnirudh@7664",
      },
    });

    await transporter.sendMail({
      from:"anirudh0190.be21@chitkara.edu.in",
      to:email,
      subject:subject,
      text:text
    });
    console.log("Email Sent Successfully!!!")
    

    
  } catch (error) {
    console.log("Email not sent");
    
  }
}

  