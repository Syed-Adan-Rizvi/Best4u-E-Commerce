// File Path: src/app/api/send-email/route.js
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/db";
import { Subscriber } from "@/models/Subscriber";
import { resend } from "@/lib/resend";

// 🔒 Security Check (Sirf Admin)
async function checkAuth(req) {
  const isTestingMode = process.env.NEXT_PUBLIC_TESTING_MODE === 'true';
  if (isTestingMode) return true;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  return !!token;
}

export async function POST(req) {
  try {
    console.log("🚀 [POST /api/send-email] Email campaign bhejne ki request aayi!");

    if (!(await checkAuth(req))) {
      return NextResponse.json({ success: false, error: "Unauthorized Access! Sirf admin email bhej sakta hai." }, { status: 401 });
    }

    const body = await req.json();
    const { subject, message, productLink = "#", selectedEmails = [] } = body;

    if (!subject || !message) {
      return NextResponse.json({ success: false, error: "Subject aur Message dono zaroori hain!" }, { status: 400 });
    }

    await connectDB();
    let emailsList = [];

    // 🧠 LOGIC: Manual Selection vs All Active
    if (selectedEmails && selectedEmails.length > 0) {
      emailsList = selectedEmails;
      console.log(`📌 Manual Selection: ${emailsList.length} emails ko bheji ja rahi hai.`);
    } else {
      const activeSubscribers = await Subscriber.find({ isActive: true }).select('email');
      if (activeSubscribers.length === 0) {
        return NextResponse.json({ success: false, error: "Koi active subscriber nahi mila!" }, { status: 404 });
      }
      emailsList = activeSubscribers.map(sub => sub.email);
      console.log(`🌍 Send to All: ${emailsList.length} active subscribers ko bheji ja rahi hai.`);
    }

    // 🎨 EMAIL DESIGN (Updated to Sage & Cream Theme)
    const emailHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #EAE5D9; border-radius: 12px; overflow: hidden; background-color: #FAF8F5;">
        <div style="background-color: #7A9D8C; padding: 25px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 0.5px;">Best4u Exclusive Deal! 🎁</h1>
        </div>
        <div style="padding: 35px; background-color: #ffffff;">
          <h2 style="color: #2C3E35; font-size: 20px; margin-top: 0;">${subject}</h2>
          <div style="color: #4A6056; font-size: 16px; line-height: 1.6;">${message}</div>
          <div style="text-align: center; margin-top: 35px;">
            <a href="${productLink}" style="background-color: #7A9D8C; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; letter-spacing: 0.5px;">View Deal</a>
          </div>
        </div>
        <div style="background-color: #FAF8F5; padding: 20px; text-align: center; border-top: 1px solid #EAE5D9;">
          <p style="color: #8AA69A; font-size: 12px; margin: 0;">Yeh email aapko isliye aayi kyunke aap Best4u ki newsletter ka hissa hain.</p>
        </div>
      </div>
    `;

    // 🚀 SEND EMAILS
    // const { data, error } = await resend.emails.send({
    //   from: 'Best4u <onboarding@resend.dev>', 
    //   to: ['delivered@resend.dev'], 
    //   bcc: emailsList, 
    //   subject: subject,
    //   html: emailHtml,
    // });


    // Only for testing


    const { data, error } = await resend.emails.send({
      from: 'Best4u <onboarding@resend.dev>', 
      to: emailsList, // <-- Direct apna email array yahan de diya
      subject: subject,
      html: emailHtml,
    });



    // Future jub depoly or domain register ho jay gi tub 

    // 🚀 FUTURE LIVE CODE (Batch Sending)

// 1. Pehle hum saare emails ka ek array of objects banayenge
const emailPayloads = emailsList.map(email => ({
    from: 'Best4u <hello@best4u.com>', // 🌟 Yahan aapki asli domain aayegi
    to: [email], // Har bande ko individual email jayegi
    subject: subject,
    html: emailHtml,
}));

// 2. Phir hum Resend ki 'batch.send' API use karenge (emails.send ki jagah)
const { data, error } = await resend.batch.send(emailPayloads);

    if (error) {
      console.error("❌ Resend API Error:", error);
      return NextResponse.json({ success: false, error: "Email bhejne mein masla aaya.", details: error }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `${emailsList.length} subscribers ko successfully email bhej di gayi hai!`,
    }, { status: 200 });

  } catch (error) {
    console.error("❌ [POST /api/send-email] Server Error:", error.message);
    return NextResponse.json({ success: false, error: "Server mein koi masla aagaya hai." }, { status: 500 });
  }
}










// // src/app/api/send-email/route.js
// import { NextResponse } from "next/server";
// import { getToken } from "next-auth/jwt";
// import connectDB from "@/lib/db";
// import { Subscriber } from "@/models/Subscriber";
// import { resend } from "@/lib/resend"; // Hamara banaya hua engine

// // 🔒 Security Check (Sirf Admin)
// async function checkAuth(req) {
//   const isTestingMode = process.env.NEXT_PUBLIC_TESTING_MODE === 'true';
//   if (isTestingMode) return true;
//   const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
//   return !!token;
// }

// export async function POST(req) {
//   try {
//     console.log("🚀 [POST /api/send-email] Email campaign bhejne ki request aayi!");

//     // 1. 🛡️ SECURITY GATE
//     if (!(await checkAuth(req))) {
//       return NextResponse.json({ success: false, error: "Unauthorized Access! Sirf admin email bhej sakta hai." }, { status: 401 });
//     }

//     // 2. 📦 BODY PARSE
//     const body = await req.json();
//     const { subject, message, productLink = "#" } = body;

//     if (!subject || !message) {
//       return NextResponse.json({ success: false, error: "Subject aur Message dono zaroori hain!" }, { status: 400 });
//     }

//     // 3. 🔍 FETCH SUBSCRIBERS
//     await connectDB();
//     const activeSubscribers = await Subscriber.find({ isActive: true }).select('email');
    
//     if (activeSubscribers.length === 0) {
//       return NextResponse.json({ success: false, error: "Koi active subscriber nahi mila!" }, { status: 404 });
//     }

//     // Saare emails ka ek array banate hain: ['user1@gmail.com', 'user2@yahoo.com']
//     const emailsList = activeSubscribers.map(sub => sub.email);

//     // 4. 🎨 EMAIL DESIGN (Template)
//     // Abhi hum ek khoobsurat standard HTML use kar rahe hain, isay aagay chal kar React Email mein bhi convert kar sakte hain
//     const emailHtml = `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
//         <div style="background-color: #059669; padding: 20px; text-align: center;">
//           <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Best4u Exclusive Deal! 🎁</h1>
//         </div>
//         <div style="padding: 30px; background-color: #ffffff;">
//           <h2 style="color: #1f2937; font-size: 20px; margin-top: 0;">${subject}</h2>
//           <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">${message}</p>
//           <div style="text-align: center; margin-top: 30px;">
//             <a href="${productLink}" style="background-color: #059669; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View Deal on Amazon</a>
//           </div>
//         </div>
//         <div style="background-color: #f3f4f6; padding: 15px; text-align: center;">
//           <p style="color: #9ca3af; font-size: 12px; margin: 0;">Yeh email aapko isliye aayi kyunke aap Best4u ki newsletter ka hissa hain.</p>
//         </div>
//       </div>
//     `;

//     // 5. 🚀 SEND EMAILS (The Magic Step)
//     const { data, error } = await resend.emails.send({
//       from: 'Best4u <onboarding@resend.dev>', // Live hone ke baad isko apni custom domain se badal lenge
//       to: ['delivered@resend.dev'], // Resend ki requirement hoti hai ke 'to' mein kuch ho
//       bcc: emailsList, // 🌟 SENIOR TRICK: BCC use karne se sabko email jayegi, par ek doosre ka email address nahi dekh sakenge (Privacy protected!)
//       subject: subject,
//       html: emailHtml,
//     });

//     if (error) {
//       console.error("❌ Resend API Error:", error);
//       return NextResponse.json({ success: false, error: "Email bhejne mein masla aaya.", details: error }, { status: 500 });
//     }

//     console.log(`✅ Success! ${emailsList.length} subscribers ko email bhej di gayi.`);

//     return NextResponse.json({ 
//       success: true, 
//       message: `${emailsList.length} subscribers ko successfully email bhej di gayi hai!`,
//       data: data 
//     }, { status: 200 });

//   } catch (error) {
//     console.error("❌ [POST /api/send-email] Server Error:", error.message);
//     return NextResponse.json({ success: false, error: "Server mein koi masla aagaya hai." }, { status: 500 });
//   }
// }