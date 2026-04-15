import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { isPermissionDeniedError } from "./firebaseErrors";
import type { RegistrationPayload } from "./registrationSchema";

export class DuplicateEmailError extends Error {
  constructor() {
    super("DUPLICATE_EMAIL");
    this.name = "DuplicateEmailError";
  }
}

const COLLECTION = "p0_registrations";

function registrationDocId(email: string): string {
  return email;
}

/**
 * Email is the document ID: first write is a create; same email again is an update (denied).
 * Do not run a preemptive `getDoc` — a denied read was misreported as “duplicate” while `create`
 * would still succeed. After a denied `setDoc`, we probe with `getDoc` to tell duplicate vs config.
 */
export async function saveRegistration(
  data: RegistrationPayload,
): Promise<void> {
  if (!db) {
    throw new Error("FIREBASE_NOT_CONFIGURED");
  }

  const email = data.email;
  const docRef = doc(db, COLLECTION, registrationDocId(email));

  try {
    await setDoc(
      docRef,
      {
        firstName: data.firstName,
        familyName: data.familyName,
        phone: data.phone,
        wilaya: data.wilaya,
        email,
        teamName: data.teamName,
        nenSkill: data.nenSkill,
        hackathonBefore: data.hackathonBefore,
        shirtSize: data.shirtSize,
        matricule: data.matricule,
        contacted: false,
        createdAt: serverTimestamp(),
        eventEdition: "p0-third-edition",
      },
      { merge: false },
    );
  } catch (err) {
    if (isPermissionDeniedError(err)) {
      try {
        await getDoc(docRef);
      } catch (probeErr) {
        if (isPermissionDeniedError(probeErr)) {
          throw new DuplicateEmailError();
        }
        throw probeErr;
      }
    }
    throw err;
  }
}
