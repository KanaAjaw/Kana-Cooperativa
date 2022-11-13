//
// Comunicación con la base de datos
//

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-app.js";
import { getFirestore, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
apiKey: "AIzaSyCYSWJHky1CTSvJq4QgSXwgw4e0bCBRzSo",
authDomain: "prueba-landing-pages.firebaseapp.com",
projectId: "prueba-landing-pages",
storageBucket: "prueba-landing-pages.appspot.com",
messagingSenderId: "304064295064",
appId: "1:304064295064:web:f882988bf3d946041be0ed"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Recovering of the Firestores DB
const db = getFirestore()

export const nueva_solicitud = async (id, representante, empresa, giro, actividades, correo, celular, telefono) => {
    const referencia_solicitud = doc(db, 'solicitudes', id)
    const datos = {
        nombre_representante : representante,
        nombre_empresa: empresa,
        giro_empresa: giro,
        actividades_principales: actividades,
        correo_electronico: correo,
        telefono_celular: celular,
        telefono_fijo: telefono,
        tiempo_solicitud: serverTimestamp()
    }

    return await setDoc( referencia_solicitud, datos )
}