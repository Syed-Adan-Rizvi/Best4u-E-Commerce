import { v2 as cloudinary } from 'cloudinary';

// =================================================================
// 📖 STEP 1: "Cloudinary Ki Chabiyaan (Configuration)"
// =================================================================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// =================================================================
// 📖 STEP 2: "MEDIA UPLOAD FUNCTION" (Ab Image aur Video dono handle karega)
// =================================================================
export const uploadMediaToCloudinary = async (fileBuffer, folder = 'best4u') => {
  return new Promise((resolve, reject) => {
    console.log("🚀 [Cloudinary Upload] File Cloudinary par bheji ja rahi hai...");
    
    const uploadStream = cloudinary.uploader.upload_stream(
      { 
        folder: folder, 
        resource_type: 'auto' // 🌟 MAGIC: 'auto' lagane se Cloudinary khud samajh jayega ke image hai ya video!
      },
      (error, result) => {
        if (error) {
          console.error("❌ [Cloudinary Upload] Error aagaya:", error);
          reject(error);
        } else {
          console.log(`✅ [Cloudinary Upload] Success! URL: ${result.secure_url}`);
          resolve(result); // Yeh humein secure_url aur public_id dega
        }
      }
    );
    uploadStream.end(fileBuffer);
  });
};

// =================================================================
// 📖 STEP 3: "SMART EXTRACTOR HELPER" (ID aur Type dono nikalega)
// =================================================================
const getCloudinaryDetails = (url) => {
  try {
    // 🔍 1. Pehchano ke media type kya hai URL se
    let resourceType = 'image'; // Default image rakhte hain
    if (url.includes('/video/upload/')) {
      resourceType = 'video';
    }

    // ✂️ 2. URL ko '/upload/' se tod do
    const urlParts = url.split('/upload/');
    if (urlParts.length !== 2) return null;

    // ✂️ 3. Version number (jaise v16123456) ko ignore karna hai
    const pathParts = urlParts[1].split('/');
    pathParts.shift(); // Pehla hissa (version) nikal diya

    // ✂️ 4. Extension (.png, .mp4) ko remove karna hai
    const publicIdWithExt = pathParts.join('/');
    const publicId = publicIdWithExt.substring(0, publicIdWithExt.lastIndexOf('.'));
    
    return { publicId, resourceType };
  } catch (error) {
    console.error("❌ [Cloudinary Extractor] Error extracting details:", error);
    return null;
  }
};

// =================================================================
// 📖 STEP 4: "THE SMART GARBAGE COLLECTOR" (Image & Video Delete)
// =================================================================
export const deleteMediaFromCloudinary = async (mediaUrl) => {
  if (!mediaUrl) return;

  console.log(`🧹 [Garbage Collector] Checking URL: ${mediaUrl}`);

  // Sirf tab delete karo agar URL sach mein Cloudinary ka hai
  if (!mediaUrl.includes('cloudinary.com')) {
    console.log("⏭️ [Garbage Collector] Yeh Cloudinary ka URL nahi hai, skip kar diya.");
    return;
  }

  const details = getCloudinaryDetails(mediaUrl);
  
  if (details && details.publicId) {
    try {
      console.log(`💣 [Garbage Collector] Deleting ${details.resourceType} with ID: ${details.publicId}`);
      
      // 🌟 MAGIC: resource_type dena lazmi hota hai warna videos delete nahi hotin
      await cloudinary.uploader.destroy(details.publicId, { resource_type: details.resourceType });
      
      console.log(`✅ [Garbage Collector] Successfully deleted garbage ${details.resourceType}!`);
    } catch (error) {
      console.error(`❌ [Garbage Collector] Failed to delete ${details.resourceType}:`, error);
    }
  } else {
    console.log("⚠️ [Garbage Collector] Invalid Cloudinary URL, Public ID nahi nikal saki.");
  }
};



















// import { v2 as cloudinary } from 'cloudinary';

// // 1. Cloudinary ko hamari .env keys ke sath configure karna
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// /**
//  * 2. IMAGE UPLOAD FUNCTION
//  * Yeh function file buffer lega aur Cloudinary par upload karega.
//  * Hum images ko 'best4u' folder mein rakhnge taake wahan bhi cheezein organized rahein.
//  */
// export const uploadImageToCloudinary = async (fileBuffer, folder = 'best4u') => {
//   return new Promise((resolve, reject) => {
//     const uploadStream = cloudinary.uploader.upload_stream(
//       { folder: folder },
//       (error, result) => {
//         if (error) reject(error);
//         else resolve(result); // Yeh humein image ka secure_url aur public_id dega
//       }
//     );
//     uploadStream.end(fileBuffer);
//   });
// };

// /**
//  * 3. EXTRACT PUBLIC ID HELPER
//  * Yeh function URL (e.g., https://res.cloudinary.com/demo/image/upload/v1234/best4u/logo.png)
//  * se 'best4u/logo' nikalega taake hum usko delete kar sakein.
//  */
// const getPublicIdFromUrl = (url) => {
//   try {
//     // URL ko '/upload/' se tod do
//     const urlParts = url.split('/upload/');
//     if (urlParts.length !== 2) return null;

//     // Version number (jaise v16123456) ko ignore karna hai
//     const pathParts = urlParts[1].split('/');
//     pathParts.shift(); // Pehla hissa (version) nikal diya

//     // Extension (.png, .jpg) ko remove karna hai
//     const publicIdWithExt = pathParts.join('/');
//     const publicId = publicIdWithExt.substring(0, publicIdWithExt.lastIndexOf('.'));
    
//     return publicId;
//   } catch (error) {
//     console.error("Error extracting public ID:", error);
//     return null;
//   }
// };

// /**
//  * 4. IMAGE DELETE FUNCTION (GARBAGE COLLECTOR)
//  * Yeh function purana URL lega, usme se ID nikalega aur Cloudinary se hamesha ke liye delete kar dega.
//  */
// export const deleteImageFromCloudinary = async (imageUrl) => {
//   if (!imageUrl) return;

//   const publicId = getPublicIdFromUrl(imageUrl);
  
//   if (publicId) {
//     try {
//       await cloudinary.uploader.destroy(publicId);
//       console.log(`Successfully deleted garbage image: ${publicId}`);
//     } catch (error) {
//       console.error(`Failed to delete image: ${publicId}`, error);
//     }
//   }
// };