import { create } from 'zustand';
import { User, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendEmailVerification } from 'firebase/auth';
import { auth } from '../config/firebase';
import { db } from '../config/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
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
    forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
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

            const username = email.split('@')[0].replace(/[^a-zA-Z0-9_.]/g, '') || 'user';
            await setDoc(doc(db, "users", user.uid), {
                userID: user.uid,
                email: user.email,
                username,
                status: true,
                emailVerified: false
            });

            await syncDiscoverabilityProfile({
                uid: user.uid,
                email: user.email,
                username,
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
            const updatedUser = auth.currentUser;
            if (updatedUser?.emailVerified) {
                try {
                    await setDoc(
                        doc(db, "users", updatedUser.uid),
                        {emailVerified: true},
                        {merge: true}
                    );
                } catch (e) {
                    console.error("Gagal memperbarui status verifikasi di Firestore:", e);
                }
                set({currUser: updatedUser});
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

    // Lupa Password
    forgotPassword: async (email) => {
        set({ isLoading: true, error: null });
        
        try {
            // Kirim reset password langsung via Firebase Auth
            await sendPasswordResetEmail(auth, email);
            set({isLoading: false});
            return {success: true};
        } catch (err: any) {
            let errorMsg = err.code || err.message;
            if (errorMsg.includes('auth/user-not-found') || errorMsg.includes('user-not-found')) {
                errorMsg = 'Email tidak terdaftar.';
            } else if (errorMsg.includes('auth/invalid-email') || errorMsg.includes('invalid-email')) {
                errorMsg = 'Format email tidak valid.';
            }
            set({error: errorMsg, isLoading: false});
            return {success: false, error: errorMsg};
        }
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
