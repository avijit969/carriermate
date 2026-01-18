import { generateText, Output } from 'ai';
import { z } from 'zod';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

const google = createGoogleGenerativeAI({
  apiKey: process.env.EXPO_PUBLIC_GOOGLE_API_KEY,
});

const courseSchema = z.object({
  title: z.string('eg Web Development Bootcamp'),
  description: z.string('eg Web Development Bootcamp'),
  category: z.string('eg IT, Vocational, Soft Skills'),
  level: z.string('eg NSQF Level 4'),
  duration: z.string('eg 3 Months'),
});

const learningPathSchema = z.object({
  courses: z.array(courseSchema),
});

const moduleSchema = z.object({
  title: z.string(),
  description: z.string(),
  duration: z.string(),
  type: z.enum(['video', 'quiz', 'article', 'assignment']),
  content: z.string(),
});

const courseContentSchema = z.object({
  modules: z.array(moduleSchema),
});

export async function generateLearningPath(profile: any) {
  const prompt = `
    Generate a personalized learning path of 5-7 vocational and skill-based courses for a user with the following profile.
    The goal is to help them achieve their career aspirations and improve employability in the Indian job market.
    
    User Profile:
    - Name: ${profile?.fullName || 'User'}
    - Education: ${profile?.educationLevel || 'Unknown'} (Major: ${profile?.major || 'N/A'})
    - Career Goal: ${profile?.careerGoal || 'General Employment'}
    - Key Skills: ${JSON.stringify(profile?.skills || [])}
    - Preferred Job Roles: ${JSON.stringify(profile?.preferredJobRoles || [])}
    - Location: ${profile?.district || 'India'}, ${profile?.state || ''}

    Ensure the courses are aligned with NSQF (National Skills Qualifications Framework) levels where applicable.
    Include a mix of technical (hard) skills and soft skills.
    For 'category', use broad terms like "IT", "Healthcare", "Construction", "Automotive", "Retail", "Soft Skills", etc.
    For 'level', estimate the NSQF level (e.g., Level 3, 4, 5, 6).
    For 'duration', provide realistic estimates (e.g., "3 Months", "6 Weeks").
  `;

  try {
    const { output } = await generateText({
      model: google("gemini-2.5-flash"),
      output: Output.object({
        schema: learningPathSchema,
      }),
      prompt: prompt,
    });
    console.log("Output:", JSON.stringify(output, null, 2));
    return output.courses;
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw error;
  }
}

// Helper to search YouTube
async function searchYouTubeVideo(query: string): Promise<string | null> {
  try {
    const apiKey = process.env.EXPO_PUBLIC_YOUTUBE_API_KEY;
    if (!apiKey) return null;

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${encodeURIComponent(query)}&type=video&key=${apiKey}`
    );
    const data = await response.json();
    if (data.items && data.items.length > 0) {
      return `https://www.youtube.com/watch?v=${data.items[0].id.videoId}`;
    }
    return null;
  } catch (error) {
    console.warn("YouTube Search Error:", error);
    return null;
  }
}

export async function generateCourseContent(courseTitle: string, userProfile: any) {
  const prompt = `
        Generate a detailed curriculum (modules/lessons) for the vocational course titled "${courseTitle}".
        The user has a background in ${userProfile?.educationLevel || 'General Education'}.
        
        Create 5-8 modules. For each module, provide:
        - Title
        - Description (2-3 sentences)
        - Duration (est.)
        - Type (video, quiz, article, assignment) - Mix these up.
        - Content: 
            - If type is 'video', provide a brief summary of what the video covers.
            - If type is 'article', provide a substantial paragraph of educational text content teaching the topic (at least 150 words).
            - If type is 'quiz', provide a short description or placeholder.
            - If type is 'assignment', provide a brief assignment description.
    `;

  try {
    const { output } = await generateText({
      model: google("gemini-2.5-flash-lite"),
      output: Output.object({
        schema: courseContentSchema,
      }),
      prompt: prompt,
    });

    // Check for video modules and enhance with real YouTube links
    const enhancedModules = await Promise.all(output.modules.map(async (mod) => {
      if (mod.type === 'video') {
        const videoLink = await searchYouTubeVideo(`${mod.title}`);
        if (videoLink) {
          return { ...mod, content: videoLink };
        }
      }
      return mod;
    }));

    return enhancedModules;
  } catch (error) {
    console.error("Course Content Generation Error:", error);
    throw error;
  }
}

const quizQuestionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()).length(4),
  correctAnswer: z.string(),
  explanation: z.string(),
});

const quizSchema = z.object({
  title: z.string(),
  description: z.string(),
  questions: z.array(quizQuestionSchema),
});

export async function generateQuiz(moduleTitle: string, courseTitle: string) {
  const prompt = `
    Generate a short quiz (5 questions) for the module "${moduleTitle}" which is part of the course "${courseTitle}".
    
    The quiz should test the user's understanding of the key concepts in this module.
    For each question:
    - Provide a clear question text.
    - Provide 4 distinct options.
    - Indicate the correct answer (must be one of the options).
    - Provide a brief explanation of why the answer is correct.
  `;

  try {
    const { output } = await generateText({
      model: google("gemini-2.5-flash-lite"),
      output: Output.object({
        schema: quizSchema,
      }),
      prompt: prompt,
    });
    return output;
  } catch (error) {
    console.error("Quiz Generation Error:", error);
    throw error;
  }
}
