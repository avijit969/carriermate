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
      imageURL: i.string().optional(),
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
    colors: i.entity({
      value: i.string(),
    }),
  },
  rooms: {},
  links: {
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
      },
    }
  },
});

// This helps TypeScript display nicer intellisense
type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
