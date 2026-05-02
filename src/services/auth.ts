import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  User,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";
import { UserProfile, UserRole } from "@/types";

/**
 * User Service
 * Handles Firestore operations for user profiles.
 */
export const userService = {
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  },

  async createUserProfile(user: User, additionalData?: Partial<UserProfile>): Promise<UserProfile> {
    const ownerEmail = process.env.NEXT_PUBLIC_OWNER_EMAIL;
    const isBootstrapOwner = user.email === ownerEmail;
    
    const profile: UserProfile = {
      id: user.uid,
      email: user.email || "",
      displayName: user.displayName || additionalData?.displayName || "User",
      role: isBootstrapOwner ? "owner" : (additionalData?.role || "business_owner"),
      businessId: additionalData?.businessId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(doc(db, "users", user.uid), {
      ...profile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return profile;
  },

  async ensureUserProfileExists(user: User): Promise<UserProfile> {
    const existing = await this.getUserProfile(user.uid);
    if (existing) return existing;
    return this.createUserProfile(user);
  },

  async updateUserBusinessId(uid: string, businessId: string): Promise<void> {
    const docRef = doc(db, "users", uid);
    await updateDoc(docRef, {
      businessId,
      updatedAt: serverTimestamp(),
    });
  }
};

/**
 * Auth Service
 * Handles Firebase Auth operations and profile linking.
 */
export const authService = {
  async login(email: string, pass: string): Promise<User> {
    const { user } = await signInWithEmailAndPassword(auth, email, pass);
    return user;
  },

  async register(email: string, pass: string, displayName: string): Promise<User> {
    const { user } = await createUserWithEmailAndPassword(auth, email, pass);
    await userService.createUserProfile(user, { displayName });
    return user;
  },

  async loginWithGoogle(): Promise<User> {
    const provider = new GoogleAuthProvider();
    const { user } = await signInWithPopup(auth, provider);
    await userService.ensureUserProfileExists(user);
    return user;
  },

  async logout(): Promise<void> {
    await signOut(auth);
  },

  getRedirectPathForRole(role: UserRole | null): string {
    if (!role) return "/login";
    switch (role) {
      case "owner":
      case "admin":
        return "/admin";
      case "business_owner":
      case "team_member":
        return "/dashboard";
      default:
        return "/login";
    }
  }
};
