import { defaultAssignment } from "common/tooling/versions";

import { VERSION } from "./config";

export function beltVersionManager(query, queryParams) {
  if (query.version === undefined || Number(query.version) === VERSION) {
    return defaultAssignment(query, queryParams);
  }
}