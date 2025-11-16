import jwt from "jsonwebtoken"
import { config } from "./config"
import { createTransport } from "nodemailer";
import { logger } from "./logger";
import { cloudinary } from "..";
import { Resend } from 'resend';

const generateJWT = (id: number, type: "ACCESS" | "REFRESH") => {
    if (type === "ACCESS") {
        return jwt.sign({ id }, config.ACCESS_TOKEN_SECRET!, { expiresIn: config.ACCESS_TOKEN_EXPIRY } as jwt.SignOptions)
    }
    else if (type === "REFRESH") {
        return jwt.sign({ id }, config.REFRESH_TOKEN_SECRET!, { expiresIn: config.REFRESH_TOKEN_EXPIRY } as jwt.SignOptions)
    }
}

const getCloudinaryFolderName = (type: 'SIGN_UP' | 'PROFILE_UPDATE')=>{
    let folder = "tabib-online";
    if (type === 'SIGN_UP') {
        folder = "tabib-online/user-verifications-document";
    }
    if (type === 'PROFILE_UPDATE') {
        folder = "tabib-online/profile-images";
    }
    return folder;
}

const getCloudinaryFoldersNames = (type: 'DOCTOR_SIGNUP') => {
    let folders = ["tabib-online", "tabib-online"];
    if (type === 'DOCTOR_SIGNUP') {
        folders = ["tabib-online/doctor-licenses-document", "tabib-online/doctor-verifications-document"];
    }
    return folders;
}

const deleteCloudinaryImage = async (imageURL: string) => {
    try {
        const parts = imageURL.split("/upload/");
        if (parts.length < 2) {
            throw new Error("Invalid Cloudinary URL");
        }

        const pathAfterUpload = parts[1]
            .split("/")
            .filter((p) => !p.startsWith("v"))
            .join("/")
            .split(".")[0];

        const publicId = pathAfterUpload;
        await cloudinary.uploader.destroy(publicId);
        logger.info("Cloudinary image deleted: " + publicId);
    } catch (error) {
        logger.error("Error deleting Cloudinary image: " + error);
        throw error;
    }
}

// const sendEmail = async (to: string, subject: string, content: string) => {
//     try {
//         const transporter = createTransport({
//             host: 'smtp.gmail.com',
//             port: 587,
//             secure: false,
//             auth: {
//                 user: config.MAIL_USER,
//                 pass: config.MAIL_PASS
//             },
//             connectionTimeout: 10000,
//             greetingTimeout: 10000,
//             socketTimeout: 10000,
//         });

//         const mailOptions = {
//             from: {
//                 name: "Tabib Online",
//                 address: config.MAIL_USER
//             },
//             to: to,
//             subject: subject,
//             html: content
//         };
//         await transporter.sendMail(mailOptions);
//         logger.info("Email sent to " + to);
//     }
//     catch (err) {
//         logger.error("Error sending email: " + err);
//         throw err;
//     }
// }

const sendEmail = async (to: string, subject: string, content: string) => {
    try {
        const resend = new Resend(config.RESEND_API_KEY);
        
        const { data, error } = await resend.emails.send({
            from: 'Tabib Online <onboarding@resend.dev>',
            to: to,
            subject: subject,
            html: content,
        });

        if (error) {
            throw error;
        }
        
        logger.info("Email sent to " + to);
    } catch (err) {
        logger.error("Error sending email: " + err);
        throw err;
    }
}

const removeThinking = (text: string) => {
  if (!text) return "";
  // Removes <think>...</think> blocks (including newlines)
  return text.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
};

const getMedicalDegreeText = (degree: number) => {
  switch (degree) {
    case 1:
      return "MBBS";
    case 2:
      return "BDS";
    case 3:
      return "DVM";
    case 4:
      return "Pharm-D";
    case 5:
      return "DPT";
    case 6:
      return "BEMS";
    case 7:
      return "BUMS";
    case 8:
      return "DHMS";
  }
}

const getPostGraduateDegreeText = (degree: number) => {
  switch (degree) {
    case 0:
      return "None";
    case 1:
      return "FCPS";  
    case 2:
      return "MCPS";
    case 3:
      return "MD";
    case 4:
      return "MS";
    case 5:
      return "MDS";
    case 6:
      return "MPhil";
    case 7:
      return "MPH";
    case 8:
      return "PhD";
  }
}

const getSpecializationText = (value: number) => {
  switch (value) {
    // --- General & Family Practice ---
    case 1:
      return "General Physician";
    case 2:
      return "Family Medicine";
    case 3:
      return "Internal Medicine";
    case 4:
      return "General Surgeon";

    // --- Internal Medicine Subspecialties ---
    case 5:
      return "Cardiologist";
    case 6:
      return "Dermatologist";
    case 7:
      return "Endocrinologist";
    case 8:
      return "Gastroenterologist";
    case 9:
      return "Hematologist";
    case 10:
      return "Nephrologist";
    case 11:
      return "Neurologist";
    case 12:
      return "Oncologist";
    case 13:
      return "Pulmonologist";
    case 14:
      return "Rheumatologist";
    case 15:
      return "Infectious Disease Specialist";

    // --- Surgical Specialties ---
    case 16:
      return "Orthopedic Surgeon";
    case 17:
      return "Neurosurgeon";
    case 18:
      return "Cardiothoracic Surgeon";
    case 19:
      return "Plastic Surgeon";
    case 20:
      return "Pediatric Surgeon";
    case 21:
      return "Urologist";
    case 22:
      return "Vascular Surgeon";
    case 23:
      return "Laparoscopic Surgeon";

    // --- Women & Child Health ---
    case 24:
      return "Gynecologist";
    case 25:
      return "Obstetrician";
    case 26:
      return "Pediatrician";
    case 27:
      return "Neonatologist";

    // --- Eye, ENT, Dental ---
    case 28:
      return "Ophthalmologist";
    case 29:
      return "ENT Specialist";
    case 30:
      return "Dentist";
    case 31:
      return "Orthodontist";
    case 32:
      return "Oral Surgeon";
    case 33:
      return "Periodontist";
    case 34:
      return "Prosthodontist";
    case 35:
      return "Endodontist";

    // --- Mental Health ---
    case 36:
      return "Psychiatrist";
    case 37:
      return "Psychologist";
    case 38:
      return "Clinical Psychologist";

    // --- Diagnostic & Lab ---
    case 39:
      return "Radiologist";
    case 40:
      return "Pathologist";
    case 41:
      return "Nuclear Medicine Specialist";

    // --- Emergency & Intensive Care ---
    case 42:
      return "Anesthesiologist";
    case 43:
      return "Emergency Medicine";
    case 44:
      return "Critical Care Specialist";
    case 45:
      return "Pain Management Specialist";

    // --- Public & Preventive Health ---
    case 46:
      return "Public Health Specialist";
    case 47:
      return "Epidemiologist";
    case 48:
      return "Community Medicine";
    case 49:
      return "Occupational Health";

    // --- Rehab & Allied Medicine ---
    case 50:
      return "Physiotherapist";
    case 51:
      return "Nutritionist";
    case 52:
      return "Dietitian";
    case 53:
      return "Speech Therapist";
    case 54:
      return "Chiropractor";

    // --- Cosmetic & Misc ---
    case 55:
      return "Cosmetic Surgeon";
    case 56:
      return "Sports Medicine";
    case 57:
      return "Sleep Medicine Specialist";
    case 58:
      return "Sexual Health Specialist";
  }
};

export {
    generateJWT,
    getCloudinaryFolderName,
    getCloudinaryFoldersNames,
    deleteCloudinaryImage,
    sendEmail,
    removeThinking,
    getMedicalDegreeText,
    getPostGraduateDegreeText,
    getSpecializationText
}