import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Increase max duration for Vercel serverless functions (if on Vercel Pro plan)
export const maxDuration = 60; // 60 seconds

export async function POST(request: NextRequest) {
  try {
    console.log("Upload API called");
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const fileType = formData.get("fileType") as string; // 'image' or 'audio'

    if (!file) {
      console.error("No file provided in request");
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log(`Processing ${fileType} file: ${file.name}, size: ${file.size} bytes`);
    const buffer = await file.arrayBuffer();
    const bytes = Buffer.from(buffer);
    console.log("File buffer created successfully");

    // Determine folder based on file type
    const folder =
      fileType === "image" ? "arkoflight/images" : "arkoflight/music";

    // Sanitize filename for public_id (remove special characters)
    const sanitizedFileName = file.name
      .split(".")[0] // Get filename without extension
      .toLowerCase() // Convert to lowercase
      .replace(/[^a-z0-9]/g, "_") // Replace non-alphanumeric with underscore
      .replace(/_+/g, "_") // Replace multiple underscores with single underscore
      .substring(0, 50); // Limit length

    // Upload to Cloudinary with timeout handling
    console.log(`Uploading to Cloudinary folder: ${folder}`);
    const result = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Cloudinary upload timeout after 50 seconds'));
      }, 50000); // 50 second timeout
      
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: "auto",
          public_id: `${Date.now()}_${sanitizedFileName}`,
          timeout: 50000, // 50 seconds for Cloudinary
        },
        (error, result) => {
          clearTimeout(timeout);
          if (error) {
            console.error("Cloudinary upload error:", error);
            reject(error);
          } else {
            console.log("Cloudinary upload successful");
            resolve(result);
          }
        },
      );

      uploadStream.end(bytes);
    });

    // Return the secure URL in the format: https://res.cloudinary.com/{cloud}/upload/v{version}/{public_id}.{extension}
    console.log("Upload completed, returning URL:", (result as any).secure_url);
    return NextResponse.json({
      secure_url: (result as any).secure_url,
      public_id: (result as any).public_id,
      url: (result as any).secure_url, // alternative field name
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed", details: String(error) },
      { status: 500 },
    );
  }
}
