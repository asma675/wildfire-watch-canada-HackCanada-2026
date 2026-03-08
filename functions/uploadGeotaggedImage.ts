import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import { crypto } from 'https://deno.land/std@0.208.0/crypto/mod.ts';

const CLOUDINARY_CLOUD_NAME = Deno.env.get("CLOUDINARY_CLOUD_NAME");
const CLOUDINARY_API_KEY = Deno.env.get("CLOUDINARY_API_KEY");
const CLOUDINARY_API_SECRET = Deno.env.get("CLOUDINARY_API_SECRET");
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Try to get user, but allow unauthenticated for demo/public use
    let user = null;
    try {
      user = await base44.auth.me();
    } catch (e) {
      // Allow unauthenticated uploads (public app)
    }

    const { image, imageType, latitude, longitude, zone_name, province } = await req.json();

    if (!image || !latitude || !longitude) {
      return Response.json({ error: 'Missing image or location data' }, { status: 400 });
    }

    const base64Image = image;

    // Create signed Cloudinary upload
    const timestamp = Math.floor(Date.now() / 1000);
    
    // Build signature string
    const signatureParams = {
      folder: 'wildfire_watch',
      tags: `zone:${zone_name},lat:${latitude},lon:${longitude}`,
      timestamp: timestamp.toString()
    };

    const paramsString = Object.entries(signatureParams)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('&');
    
    const signature = await generateSignature(paramsString + CLOUDINARY_API_SECRET);

    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append('file', `data:${imageType};base64,${base64Image}`);
    cloudinaryFormData.append('api_key', CLOUDINARY_API_KEY);
    cloudinaryFormData.append('timestamp', timestamp.toString());
    cloudinaryFormData.append('signature', signature);
    cloudinaryFormData.append('tags', `zone:${zone_name},lat:${latitude},lon:${longitude}`);
    cloudinaryFormData.append('folder', 'wildfire_watch');

    const cloudinaryRes = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: cloudinaryFormData,
      }
    );

    if (!cloudinaryRes.ok) {
      const text = await cloudinaryRes.text();
      console.error("Cloudinary raw response:", text);
    }

    const cloudinaryData = await cloudinaryRes.json();
    if (!cloudinaryData.secure_url) {
      console.error('Cloudinary error:', cloudinaryData);
      return Response.json({ error: 'Cloudinary upload failed', details: cloudinaryData }, { status: 500 });
    }

    // --- Cloudinary AI Vision Tagging for fire detection ---
    let cloudinaryFireDetected = false;
    let cloudinaryFireConfidence = 0;
    let cloudinaryTagsInfo = '';
    try {
      const authString = btoa(`${CLOUDINARY_API_KEY}:${CLOUDINARY_API_SECRET}`);
      const visionRes = await fetch(
        `https://api.cloudinary.com/v2/${CLOUDINARY_CLOUD_NAME}/analysis/ai_vision_tagging`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${authString}`
          },
          body: JSON.stringify({
            source: { asset_id: cloudinaryData.asset_id },
            tag_definitions: [
              { name: 'fire', description: 'Does the image contain fire, flames, or active burning?' },
              { name: 'smoke', description: 'Does the image contain smoke or haze from a fire?' },
              { name: 'wildfire', description: 'Does the image show a wildfire or forest fire?' },
              { name: 'burned_vegetation', description: 'Does the image show burned or charred vegetation or trees?' }
            ]
          })
        }
      );

      if (visionRes.ok) {
        const visionData = await visionRes.json();
        const tags = visionData.data?.tags || [];
        cloudinaryTagsInfo = tags.map(t => `${t.tag}(${Math.round((t.confidence || 0) * 100)}%)`).join(', ');
        const fireTag = tags.find(t => ['fire', 'wildfire', 'smoke', 'burned_vegetation'].includes(t.tag));
        if (fireTag) {
          cloudinaryFireDetected = true;
          cloudinaryFireConfidence = Math.round((fireTag.confidence || 0) * 100);
        }
      } else {
        console.warn('Cloudinary vision tagging failed:', await visionRes.text());
      }
    } catch (e) {
      console.warn('Cloudinary AI vision error:', e.message);
    }

    // --- Gemini analysis for wildfire detection ---
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
                mime_type: imageType || 'image/jpeg',
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
        const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        wildfireAnalysis = JSON.parse(cleaned);
      } catch {
        wildfireAnalysis.analysis = text;
      }
    }

    // Combine: fire detected if EITHER Cloudinary OR Gemini flags it
    const finalFireDetected = wildfireAnalysis.wildfire_detected || cloudinaryFireDetected;
    const finalConfidence = Math.max(wildfireAnalysis.confidence || 0, cloudinaryFireConfidence);
    const analysisNote = cloudinaryTagsInfo ? ` [Cloudinary tags: ${cloudinaryTagsInfo}]` : '';
    wildfireAnalysis = {
      wildfire_detected: finalFireDetected,
      confidence: finalConfidence,
      analysis: (wildfireAnalysis.analysis || '') + analysisNote
    };

    // Store image record in database (use service role to work for all users)
    const imageRecord = await base44.asServiceRole.entities.CapturedImage.create({
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
    console.error('Upload error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function generateSignature(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}