// src/utils/uploadMockData.tsx
import { db } from "../firebase";
import {
  mockUsers,
  mockFoodListings,
  foodCategories,
  communityStories,
  impactStats,
} from "../data/mockData";
import { setDoc, doc } from "firebase/firestore";

// Converts Date objects to Firestore Timestamps or ISO strings, if needed
function serialize(obj: any): any {
  if (obj instanceof Date) return obj.toISOString();
  if (Array.isArray(obj)) return obj.map(serialize);
  if (obj && typeof obj === "object") {
    const out: any = {};
    Object.keys(obj).forEach((key) => {
      out[key] = serialize(obj[key]);
    });
    return out;
  }
  return obj;
}

// Generic uploader for array data
async function uploadArrayToCollection(array: any[], collectionName: string) {
  for (const item of array) {
    const data = serialize(item);
    await setDoc(doc(db, collectionName, data.id.toString()), data);
  }
  console.log(`Uploaded ${array.length} items to "${collectionName}"`);
}

// For single object data (e.g., stats)
async function uploadDocToCollection(
  data: any,
  collectionName: string,
  docId: string
) {
  await setDoc(doc(db, collectionName, docId), serialize(data));
  console.log(`Uploaded stats to "${collectionName}/${docId}"`);
}

export async function uploadAllMockData() {
  await uploadArrayToCollection(mockUsers, "users");
  await uploadArrayToCollection(mockFoodListings, "foodListings");
  await uploadArrayToCollection(foodCategories, "foodCategories");
  await uploadArrayToCollection(communityStories, "communityStories");
  await uploadDocToCollection(impactStats, "stats", "impact"); // e.g., /stats/impact
  console.log("All mock data uploaded!");
}
