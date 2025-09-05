// src/utils/seedIssues.js
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import healthcareIssues from "../seed/healthcareIssues";

export async function seedHealthcareIssues(departmentId, createdBy = "seeder") {
  const colRef = collection(db, "issues");
  for (const issue of healthcareIssues) {
    await addDoc(colRef, {
      ...issue,
      departmentId,
      upvotes: 0,
      createdAt: serverTimestamp(),
      createdBy,
    });
  }
}