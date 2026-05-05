import { create } from 'zustand';
import { User, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendEmailVerification } from 'firebase/auth';
import { auth } from '../config/firebase';
import { db } from '../config/firebase';
import { doc, setDoc } from 'firebase/firestore';

interface AuthState {
    currUser: User | null;
    isLoading: boolean;
    error: string | null;

    cekAuthState: () => void;
    registerUser: (email: string, pass: string) => Promise<void>;
    resendVerifikasi: () => Promise<void>;
    loginUser: (email: string, pass: string) => Promise<void>;
    logoutUser: () => Promise<void>;
    reloadUser: () => Promise<void>;
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

            const actionCodeSettings = {
                url: window.location.origin, 
                handleCodeInApp: false,
            };
            await sendEmailVerification(user, actionCodeSettings);

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

    // Resend email verifikasi
    resendVerifikasi: async () => {
        const user = auth.currentUser;
        if (user) {
            try {
                    const actionCodeSettings = {
                        url: window.location.origin, 
                        handleCodeInApp: false,
                    };

                await sendEmailVerification(user, actionCodeSettings);
                alert("Email verifikasi baru telah dikirim! cek inbox/spam kamu.");
            } catch (err: any) {
                // Rate limiter
                alert("Tunggu sebentar sebelum mengirim ulang email."); 
            }
        }
    },

    reloadUser: async () => {
        const user = auth.currentUser;
        if (user) {
            await user.reload(); // Paksa Firebase buat refresh data user
            if (user.emailVerified) {
                set({ currUser: { ...user } as any });
            }
        }
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