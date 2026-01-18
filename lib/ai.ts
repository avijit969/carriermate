
import { createOpenAI } from '@ai-sdk/openai';
import { generateText, Output } from 'ai';
import { z } from 'zod';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

const google = createGoogleGenerativeAI({
  apiKey: "AIzaSyCWTS1fBWaf_lMkDdVLDWY4Fi-Er3t_EXU",
});

// Schema definition matching the InstantDB 'courses' entity
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
  duration: z.string(), // e.g., "1 Hour"
  type: z.enum(['video', 'quiz', 'article', 'assignment']),
  content: z.string(), // The actual content text or summary
});

const courseContentSchema = z.object({
  modules: z.array(moduleSchema),
});

export async function generateLearningPath(profile: any) {
  const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing EXPO_PUBLIC_OPENAI_API_KEY. Please set it in your .env file.");
  }

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

export async function generateCourseContent(courseTitle: string, userProfile: any) {
    const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing EXPO_PUBLIC_OPENAI_API_KEY.");
    }

    const prompt = `
        Generate a detailed curriculum (modules/lessons) for the vocational course titled "${courseTitle}".
        The user has a background in ${userProfile?.educationLevel || 'General Education'}.
        
        Create 5-8 modules. For each module, provide:
        - Title
        - Description (2-3 sentences)
        - Duration (est.)
        - Type (video, quiz, article, assignment) - Mix these up.
        - Content: A brief summary or bullet points of what specifically will be taught.
    `;

    try {
        const { output } = await generateText({
             model: google("gemini-2.5-flash"),
            output: Output.object({
                schema: courseContentSchema,
            }),
            prompt: prompt,
        });
        return output.modules;
    } catch (error) {
        console.error("Course Content Generation Error:", error);
        throw error;
    }
}
