import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const fileType = formData.get("fileType") as string; // 'image' or 'audio'

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const bytes = Buffer.from(buffer);

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

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: "auto",
          public_id: `${Date.now()}_${sanitizedFileName}`,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );

      uploadStream.end(bytes);
    });

    // Return the secure URL in the format: https://res.cloudinary.com/{cloud}/upload/v{version}/{public_id}.{extension}
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
