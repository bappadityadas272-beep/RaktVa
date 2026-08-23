// Vercel serverless function for parsing CBC lab reports using Gemini Vision API
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({
        error: 'No image provided',
        fallbackToManual: true
      });
    }

    // Initialize Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Constrained prompt for structured extraction
    const prompt = `Extract the following blood test values from this CBC lab report image. Return ONLY valid JSON with these exact keys:

{
  "hb": <hemoglobin value in g/dL, number or null>,
  "ferritin": <ferritin value in ng/mL, number or null>,
  "mcv": <MCV value in fL, number or null>,
  "mchc": <MCHC value in g/dL, number or null>
}

Rules:
- If a value is not visible or unclear, use null
- Return ONLY the JSON object, no other text
- Convert all values to numbers (remove units)
- If the image is not a lab report, return all null values`;

    // Parse base64 image
    const imageParts = [
      {
        inlineData: {
          data: imageBase64.split(',')[1] || imageBase64,
          mimeType: 'image/jpeg'
        }
      }
    ];

    // Call Gemini API
    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from response
    let parsedData;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) ||
                       text.match(/(\{[\s\S]*?\})/);

      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[1]);
      } else {
        parsedData = JSON.parse(text);
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return res.status(200).json({
        error: 'Failed to parse lab report',
        fallbackToManual: true,
        rawResponse: text.substring(0, 200)
      });
    }

    // Validate schema
    const requiredKeys = ['hb', 'ferritin', 'mcv', 'mchc'];
    const hasValidStructure = requiredKeys.every(key => key in parsedData);

    if (!hasValidStructure) {
      return res.status(200).json({
        error: 'Invalid data structure',
        fallbackToManual: true
      });
    }

    // If hb is null, trigger manual entry
    if (parsedData.hb === null) {
      return res.status(200).json({
        error: 'Hemoglobin value not found',
        fallbackToManual: true,
        partialData: parsedData
      });
    }

    // Success response
    return res.status(200).json({
      success: true,
      data: parsedData
    });

  } catch (error) {
    console.error('Gemini API error:', error);

    // Check for rate limiting
    if (error.message && error.message.includes('quota')) {
      return res.status(200).json({
        error: 'API rate limit reached',
        fallbackToManual: true,
        hint: 'Consider swapping to Claude vision API'
      });
    }

    return res.status(500).json({
      error: 'Vision processing failed',
      fallbackToManual: true
    });
  }
}
