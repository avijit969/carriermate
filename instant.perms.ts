// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from "@instantdb/react-native";

const rules = {
  "$files": {
    "allow": {
      "view": "true",
      "create": "true",
      "update": "true",
      "delete": "true"
    }
  },
  "$users": {
    "allow": {
      "view": "auth.id == data.id",
      "update": "auth.id == data.id"
    }
  },
  "profiles": {
    "bind": ["isOwner", "auth.id == data.user.id"],
    "allow": {
      "view": "true",
      "create": "auth.id != null",
      "update": "isOwner",
      "delete": "isOwner"
    }
  }

} satisfies InstantRules;

export default rules;
