// noinspection ES6CheckImport
import {initializeApp} from "firebase/app";
// noinspection ES6CheckImport
import {getAuth, onAuthStateChanged, signInAnonymously} from "firebase/auth";
// noinspection ES6CheckImport
import {getDatabase} from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyDRerCMPl3Gvlz26gNfhR6OZhpIfViIJlU",
    authDomain: "halfabet-3dd2b.firebaseapp.com",
    databaseURL: "https://halfabet-3dd2b-default-rtdb.firebaseio.com",
    projectId: "halfabet-3dd2b",
    storageBucket: "halfabet-3dd2b.appspot.com",
    messagingSenderId: "779402201993",
    appId: "1:779402201993:web:8e638d876b3402d4ea2f58"
};


class DataSource {
    connect = () => {
        // Initialize Firebase
        this.app = initializeApp(firebaseConfig);
        this.database = getDatabase(this.app);
        const auth = getAuth();
        signInAnonymously(auth);
        let dataSource = this;
        onAuthStateChanged(auth, (user) => {
            if (user) {
                // User is signed in
                dataSource.userId = user.uid;
            } else {
                // User is signed out
                dataSource.userId = undefined;
            }
        });

    }

    check = () => {
        if (this.database !== undefined) {
            return true;
        }
        if ( ! this.hasWarned) {
            console.warn("Undefined database!");
            this.hasWarned = true;
        }
        return false;
    }
}

export default DataSource;