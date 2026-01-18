// Docs: https://www.instantdb.com/docs/modeling-data

import { i } from "@instantdb/react-native";

const _schema = i.schema({
  entities: {
    $files: i.entity({
      path: i.string().unique().indexed(),
      url: i.string(),
    }),
    $users: i.entity({
      email: i.string().unique().indexed().optional(),
      type: i.string().optional(),
    }),
    profiles: i.entity({
      // Progress tracking
      onboardingStep: i.number(),

      // Step 1: Personal
      fullName: i.string(),
      dob: i.string().optional(),
      gender: i.string().optional(),

      // Step 2: Education
      educationLevel: i.string(), // e.g., "10th", "12th", "Graduate"
      institutionName: i.string().optional(),
      passingYear: i.string().optional(),
      major: i.string().optional(), // Stream or Branch

      // Step 3: Socio-Economic
      annualFamilyIncome: i.string().optional(),
      category: i.string().optional(), // General, SC/ST, OBC
      state: i.string().optional(),
      district: i.string().optional(),

      // Step 4: Aspirations
      careerGoal: i.string(), // "Job", "Higher Studies", "Business"
      preferredJobRoles: i.json().optional(), // Array of strings
      skills: i.json().optional(), // Array of strings
    }),
    recommendedCourses: i.entity({
      title: i.string(),
      description: i.string(),
      category: i.string(), // e.g. "IT", "Healthcare", "Construction"
      level: i.string(), // e.g. "NSQF Level 4"
      duration: i.string(), // e.g. "3 Months"
      image: i.string().optional(),
      rating: i.number().optional(),
      enrolledCount: i.number().optional(),
    }),
    modules: i.entity({
      title: i.string(),
      description: i.string(),
      type: i.string(), // "video", "article", "quiz"
      content: i.string(), // youtube url or article text
      duration: i.string(),
      order: i.number(),
    }),
    enrollments: i.entity({
      progress: i.number(), // 0-100
      status: i.string(), // "active", "completed"
      lastAccessed: i.string(),
    }),
  },
  rooms: {},
  links: {
    courseModules: {
      forward: {
        on: "modules",
        has: "one",
        label: "course",
        onDelete: "cascade",
      },
      reverse: {
        on: "recommendedCourses",
        has: "many",
        label: "modules",
      },
    },
    $usersLinkedPrimaryUser: {
      forward: {
        on: "$users",
        has: "one",
        label: "linkedPrimaryUser",
        onDelete: "cascade",
      },
      reverse: {
        on: "$users",
        has: "many",
        label: "linkedGuestUsers",
      },
    },
    userProfile: {
      forward: {
        on: "profiles",
        has: "one",
        label: "user",
      },
      reverse: {
        on: "$users",
        has: "one",
        label: "profile",
        onDelete: "cascade",
      },
    },
    userImage: {
      forward: {
        on: "$files",
        has: "one",
        label: "userImage",
      },
      reverse: {
        on: "$users",
        has: "one",
        label: "userImage"
      },
    },
    courseEnrollment: {
      forward: {
        on: "enrollments",
        has: "one",
        label: "course",
        onDelete: "cascade",
      },
      reverse: {
        on: "recommendedCourses",
        has: "many",
        label: "enrollments",
      },
    },
    userEnrollment: {
      forward: {
        on: "enrollments",
        has: "one",
        label: "user",
        onDelete: "cascade",
      },
      reverse: {
        on: "$users",
        has: "many",
        label: "enrollments",
      },
    },
    userRecommendedCourses: {
      forward: {
        on: "recommendedCourses",
        has: "one",
        label: "user",
      },
      reverse: {
        on: "$users",
        has: "many",
        label: "recommendedCourses",
      },
    },
  },
});

// This helps TypeScript display nicer intellisense
type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema { }
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
