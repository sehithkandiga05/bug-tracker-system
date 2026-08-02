const { GoogleGenAI } = require('@google/genai');

// Helper for text similarity (Levenshtein distance & Jaccard index)
const calculateSimilarity = (text1, text2) => {
  if (!text1 || !text2) return 0;
  const words1 = new Set(text1.toLowerCase().match(/\w+/g) || []);
  const words2 = new Set(text2.toLowerCase().match(/\w+/g) || []);
  const intersection = new Set([...words1].filter((x) => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  return union.size === 0 ? 0 : intersection.size / union.size;
};

/**
 * AI Summary Generator
 */
const generateAISummary = async (title, description) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== 'your_gemini_api_key_here') {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Summarize the following bug report in 2-3 concise sentences focusing on core issue, impact, and expected resolution:\nTitle: ${title}\nDescription: ${description}`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      if (response && response.text) {
        return response.text.trim();
      }
    } catch (e) {
      console.warn(`[AI Service Warning] Gemini API call failed: ${e.message}`);
    }
  }

  // Fallback intelligent heuristic summarizer
  const firstLines = description.split('\n').filter(Boolean)[0] || description;
  return `Issue Summary: "${title}" - ${firstLines.substring(0, 150)}...`;
};

/**
 * AI Priority & Severity Predictor
 */
const predictAIPriority = async (title, description) => {
  const combinedText = `${title} ${description}`.toLowerCase();
  
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== 'your_gemini_api_key_here') {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Analyze this bug report and output EXACTLY a JSON object with keys "priority" and "severity" (values: "Low", "Medium", "High", "Critical") and "reason":\nTitle: ${title}\nDescription: ${description}`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      const text = response.text || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          priority: parsed.priority || 'Medium',
          severity: parsed.severity || 'Medium',
          reason: parsed.reason || 'AI Automated evaluation based on keywords and impact scope.',
        };
      }
    } catch (e) {
      console.warn(`[AI Service Warning] Gemini API call failed: ${e.message}`);
    }
  }

  // Intelligent Fallback Analysis
  let priority = 'Medium';
  let severity = 'Medium';
  let reason = 'Evaluated using system heuristic analysis.';

  if (combinedText.includes('crash') || combinedText.includes('down') || combinedText.includes('fatal') || combinedText.includes('data loss') || combinedText.includes('security')) {
    priority = 'Critical';
    severity = 'Critical';
    reason = 'Critical keywords detected (system crash, data loss, or security impact).';
  } else if (combinedText.includes('error') || combinedText.includes('fail') || combinedText.includes('unauthorized') || combinedText.includes('broken')) {
    priority = 'High';
    severity = 'High';
    reason = 'High impact issue affecting system functionality.';
  } else if (combinedText.includes('ui') || combinedText.includes('color') || combinedText.includes('typo') || combinedText.includes('alignment')) {
    priority = 'Low';
    severity = 'Low';
    reason = 'Minor cosmetic or UI alignment issue detected.';
  }

  return { priority, severity, reason };
};

/**
 * Duplicate Bug Scanner
 */
const detectDuplicateBugs = (newTitle, newDescription, existingBugs = []) => {
  const matches = [];
  const fullText = `${newTitle} ${newDescription}`;

  existingBugs.forEach((bug) => {
    const existingText = `${bug.title} ${bug.description}`;
    const score = calculateSimilarity(fullText, existingText);
    if (score >= 0.35) {
      matches.push({
        bugId: bug._id,
        title: bug.title,
        status: bug.status,
        similarityScore: Math.round(score * 100),
      });
    }
  });

  return matches.sort((a, b) => b.similarityScore - a.similarityScore);
};

/**
 * AI Suggested Troubleshooting & Fix Generator
 */
const generateAISuggestedFix = async (title, description, category, errorLog = '') => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== 'your_gemini_api_key_here') {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Act as a Principal Software Engineer. Provide actionable developer root-cause diagnosis and code troubleshooting steps for this bug:\nCategory: ${category}\nTitle: ${title}\nDescription: ${description}\nLog Snippet: ${errorLog}`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      if (response && response.text) {
        return response.text.trim();
      }
    } catch (e) {
      console.warn(`[AI Service Warning] Gemini API call failed: ${e.message}`);
    }
  }

  // Smart Heuristic Suggested Fix Fallback
  return `### AI Recommended Troubleshooting Guide:
1. **Root Cause Analysis**: Inspect ${category} handles for unexpected state or missing null-checks during runtime execution.
2. **Logs Verification**: Check application telemetry for stack trace associated with "${title}".
3. **Recommended Remediation**:
   - Verify input sanitization and payload parameters.
   - Run localized integration test suite under high load / edge conditions.
   - Inspect environmental secrets and permission policies.`;
};

module.exports = {
  generateAISummary,
  predictAIPriority,
  detectDuplicateBugs,
  generateAISuggestedFix,
};
