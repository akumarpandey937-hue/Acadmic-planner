const config = require('../config/env');

const callOpenAI = async (prompt, systemPrompt = 'You are an academic advisor AI.') => {
  if (!config.openaiKey) return null;
  try {
    const OpenAI = require('openai');
    const openai = new OpenAI({ apiKey: config.openaiKey });
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });
    return response.choices[0].message.content;
  } catch (err) {
    console.error('OpenAI Error:', err.message);
    return null;
  }
};

const callGemini = async (prompt) => {
  if (!config.geminiKey) return null;
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (err) {
    console.error('Gemini Error:', err.message);
    return null;
  }
};

const parseJSON = (text) => {
  try {
    const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    return match ? JSON.parse(match[0]) : null;
  } catch {
    return null;
  }
};

exports.generateStudyPlan = async (subjects, examDate, availableHours) => {
  const prompt = `Create a study plan as JSON with keys: dailySchedule (array of {day, tasks:[{subject, topic, duration}]}), weeklySchedule (array of {week, focus, subjects, hours}), revisionPlan (array of {phase, subjects, topics}). Subjects: ${subjects.join(', ')}. Exam: ${examDate}. Hours/day: ${availableHours}. Return only valid JSON.`;

  let result = await callOpenAI(prompt);
  if (!result) result = await callGemini(prompt);
  const parsed = result ? parseJSON(result) : null;

  if (parsed) return parsed;

  const daysUntilExam = Math.ceil((new Date(examDate) - new Date()) / (1000 * 60 * 60 * 24));
  const dailySchedule = [];
  for (let d = 1; d <= Math.min(daysUntilExam, 30); d++) {
    dailySchedule.push({
      day: d,
      tasks: subjects.map((s, i) => ({
        subject: s,
        topic: `Chapter ${((d + i) % 5) + 1}`,
        duration: Math.floor(availableHours / subjects.length)
      }))
    });
  }

  return {
    dailySchedule,
    weeklySchedule: subjects.map((s, i) => ({
      week: i + 1,
      focus: s,
      subjects: [s],
      hours: availableHours * 7
    })),
    revisionPlan: [
      { phase: 'First Pass', subjects, topics: ['Fundamentals', 'Key Concepts'] },
      { phase: 'Revision', subjects, topics: ['Important Questions', 'Previous Papers'] }
    ]
  };
};

exports.generateNotes = async (text, title) => {
  const prompt = `From this academic content titled "${title}", generate JSON with: summary (string), importantQuestions (array of 5 strings), flashcards (array of 5 {question, answer}), quiz (array of 5 {question, options array of 4, correctAnswer index 0-3}). Content: ${text.substring(0, 4000)}`;

  let result = await callOpenAI(prompt);
  if (!result) result = await callGemini(prompt);
  const parsed = result ? parseJSON(result) : null;

  if (parsed) return parsed;

  return {
    summary: `Summary of ${title}: Key concepts and important topics covered in the material.`,
    importantQuestions: [
      'What are the fundamental concepts?',
      'Explain the main theorem/principle.',
      'What are practical applications?',
      'Compare and contrast key topics.',
      'Solve a typical exam question.'
    ],
    flashcards: [
      { question: 'Define key term 1', answer: 'Definition of key term 1' },
      { question: 'Define key term 2', answer: 'Definition of key term 2' }
    ],
    quiz: [
      { question: 'What is the main topic?', options: ['A', 'B', 'C', 'D'], correctAnswer: 0 }
    ]
  };
};

exports.analyzeWeakness = async (marks) => {
  const prompt = `Analyze these subject marks and return JSON: weakSubjects (array of {name, score, recommendation}), strongSubjects (array of {name, score}), recommendedStudyTime (array of {subject, hours}). Marks: ${JSON.stringify(marks)}`;

  let result = await callOpenAI(prompt);
  if (!result) result = await callGemini(prompt);
  const parsed = result ? parseJSON(result) : null;

  if (parsed) return parsed;

  const sorted = [...marks].sort((a, b) => (a.marks / a.maxMarks) - (b.marks / b.maxMarks));
  const weak = sorted.slice(0, Math.ceil(sorted.length / 3));
  const strong = sorted.slice(-Math.ceil(sorted.length / 3));

  return {
    weakSubjects: weak.map(s => ({
      name: s.subject,
      score: Math.round((s.marks / s.maxMarks) * 100),
      recommendation: `Focus ${Math.ceil((1 - s.marks / s.maxMarks) * 10)} extra hours/week`
    })),
    strongSubjects: strong.map(s => ({
      name: s.subject,
      score: Math.round((s.marks / s.maxMarks) * 100)
    })),
    recommendedStudyTime: weak.map(s => ({
      subject: s.subject,
      hours: Math.ceil((1 - s.marks / s.maxMarks) * 10)
    }))
  };
};

exports.extractTextFromPDF = async (filePath) => {
  try {
    const fs = require('fs');
    const pdfParse = require('pdf-parse');
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text;
  } catch {
    return 'Sample academic content for note generation.';
  }
};
