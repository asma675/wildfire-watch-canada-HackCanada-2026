import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import { crypto } from 'https://deno.land/std@0.208.0/crypto/mod.ts';

const CLOUDINARY_CLOUD_NAME = Deno.env.get("CLOUDINARY_CLOUD_NAME");
const CLOUDINARY_API_KEY = Deno.env.get("CLOUDINARY_API_KEY");
const CLOUDINARY_API_SECRET = Deno.env.get("CLOUDINARY_API_SECRET");
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { image, imageType, latitude, longitude, zone_name, province } = await req.json();

    if (!image || !latitude || !longitude) {
      return Response.json({ error: 'Missing image or location data' }, { status: 400 });
    }

    const base64Image = image;

    // Upload to Cloudinary using unsigned upload
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append('file', `data:${imageType};base64,${base64Image}`);
    cloudinaryFormData.append('api_key', CLOUDINARY_API_KEY);
    cloudinaryFormData.append('tags', `zone:${zone_name},lat:${latitude},lon:${longitude}`);
    cloudinaryFormData.append('folder', 'wildfire_watch');

    const cloudinaryRes = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: cloudinaryFormData
      }
    );

    const cloudinaryData = await cloudinaryRes.json();
    if (!cloudinaryData.secure_url) {
      console.error('Cloudinary error:', cloudinaryData);
      return Response.json({ error: 'Cloudinary upload failed', details: cloudinaryData }, { status: 500 });
    }

    // Analyze with Gemini for wildfire detection
    const geminiRes = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: `Analyze this image taken at location ${latitude}, ${longitude} in ${province}, Canada (zone: ${zone_name || 'unknown'}). 
              
              Answer ONLY with a JSON object in this exact format (no markdown, no extra text):
              {
                "wildfire_detected": boolean,
                "confidence": number between 0-100,
                "analysis": "detailed description of what you see, whether fire is visible, smoke characteristics, terrain conditions, etc."
              }
              
              If you see fire, smoke, char marks, burned vegetation, or active flames - mark wildfire_detected as true.`
            },
            {
              inline_data: {
                mime_type: imageType,
                data: base64Image
              }
            }
          ]
        }]
      })
    });

    const geminiData = await geminiRes.json();
    let wildfireAnalysis = {
      wildfire_detected: false,
      confidence: 0,
      analysis: 'Unable to analyze image'
    };

    if (geminiData.candidates?.[0]?.content?.parts?.[0]?.text) {
      const text = geminiData.candidates[0].content.parts[0].text;
      try {
        wildfireAnalysis = JSON.parse(text);
      } catch {
        wildfireAnalysis.analysis = text;
      }
    }

    // Store image record in database
    const imageRecord = await base44.entities.CapturedImage.create({
      latitude,
      longitude,
      cloudinary_url: cloudinaryData.secure_url,
      cloudinary_public_id: cloudinaryData.public_id,
      wildfire_detected: wildfireAnalysis.wildfire_detected,
      wildfire_confidence: wildfireAnalysis.confidence,
      gemini_analysis: wildfireAnalysis.analysis,
      zone_name: zone_name,
      province,
      timestamp: new Date().toISOString()
    });

    return Response.json({
      success: true,
      image: imageRecord,
      analysis: wildfireAnalysis,
      cloudinary_url: cloudinaryData.secure_url
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});