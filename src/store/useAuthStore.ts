import { create } from 'zustand';
import { User, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { db } from '../config/firebase';
import { doc, setDoc } from 'firebase/firestore';

interface AuthState {
    currUser: User | null;
    isLoading: boolean;
    error: string | null;

    cekAuthState: () => void;
    registerUser: (email: string, pass: string) => Promise<void>;
    loginUser: (email: string, pass: string) => Promise<void>;
    logoutUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState> ((set) => ({
    currUser: null,
    isLoading: true,
    error: null,

    cekAuthState: () => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                set({currUser: user, isLoading: false, error: null});
            } else {
                set({currUser: null, isLoading: false});
            }
        });
    },

    // Register akun (via Firebase Auth)
    registerUser: async(email, pass) => {
        set({isLoading: true, error: null});

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
            const user = userCredential.user;

            await setDoc(doc(db, "users", user.uid), {
                userID: user.uid,
                email: user.email,
                nama: email.split('@')[0],
                status: true
            });

            set({currUser: userCredential.user, isLoading: false});
        } catch (err: any) {
            set({error: err.message, currUser: null, isLoading: false});
        };
    },

    // Login (via Firebase Auth)
    loginUser: async(email, pass) => {
        set({isLoading: true, error: null});

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, pass);
            set({currUser: userCredential.user, isLoading: false});
        } catch (err: any) {
            set({error: err.message, currUser: null, isLoading: false});
        };
    },

    // Logout
    logoutUser: async() => {
        set({isLoading: true, error: null});

        try {
            await signOut(auth);
            set({currUser: null, isLoading: false});
        } catch (err: any) {
            set({error: err.message, currUser: null, isLoading: false});
        };
    }
}));