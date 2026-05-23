import { create } from 'zustand';
import { User, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendEmailVerification } from 'firebase/auth';
import { auth } from '../config/firebase';
import { db } from '../config/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { syncDiscoverabilityProfile } from '../lib/syncPublicProfile';

interface AuthState {
    currUser: User | null;
    isLoading: boolean;
    error: string | null;

    cekAuthState: () => () => void;
    cekEmailTerdaftar: (email: string) => Promise<any>;
    registerUser: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
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
        set({ isLoading: true });
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                set({currUser: user, isLoading: false, error: null});
            } else {
                set({currUser: null, isLoading: false, error: null});
            }
        });
        return unsubscribe;
    },

    cekEmailTerdaftar: async(email) => {
        const q = query(
            collection(db, "users"), where("email", "==", email)
        );
        
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
            const data = snapshot.docs[0].data();
            
            return {
                exists: true, verified: data.emailVerified
            };
        }
        
        return {
            exists: false, verified: false
        };
    },

    // Register akun (via Firebase Auth)
    registerUser: async(email, pass) => {
        set({isLoading: true, error: null});

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
            const user = userCredential.user;

            // const actionCodeSettings = {
            //     url: window.location.origin, 
            //     handleCodeInApp: false,
            // };
            await sendEmailVerification(user);

            const nama = email.split('@')[0];
            await setDoc(doc(db, "users", user.uid), {
                userID: user.uid,
                email: user.email,
                nama,
                status: true,
                emailVerified: false
            });

            await syncDiscoverabilityProfile({
                uid: user.uid,
                email: user.email,
                nama,
                photoURL: null,
                bio: '',
            });

            set({currUser: userCredential.user, isLoading: false, error: null});
            return { success: true };
        } catch (err: any) {
            console.error("GAGAL REGISTER:", err);
            set({error: err.code || err.message, currUser: null, isLoading: false});
            return { success: false, error: err.code || err.message};
        };
    },

    // Resend email verifikasi
    resendVerifikasi: async () => {
        const user = auth.currentUser;
        if (user) {
            try {
                    // const actionCodeSettings = {
                    //     url: window.location.origin, 
                    //     handleCodeInApp: false,
                    // };

                await sendEmailVerification(user);
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
                await setDoc(
                    doc(db, "users", user.uid),{emailVerified: true},{ merge: true });
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
            set({error: err.code, currUser: null, isLoading: false});
        };
    },

    // Logout
    logoutUser: async() => {
        set({isLoading: true, error: null});

        try {
            await signOut(auth);
            set({currUser: null, isLoading: false});
        } catch (err: any) {
            set({error: err.code, currUser: null, isLoading: false});
        };
    }
}));
