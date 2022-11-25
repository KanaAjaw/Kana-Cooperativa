//
// Comunicación con la base de datos
//

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-firestore.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://cdnjs.cloudflare.com/ajax/libs/firebase/9.14.0/firebase-storage.js"
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

// Initialize Storage
const storage = getStorage(app)

// Recovering of the Firestores DB
const db = getFirestore()

//
// Funciones de solicitud
//
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

export const obtener_documento = async (idu) => {
    const documento = doc(db, 'solicitudes', idu)
    return await getDoc(documento)
}


//
//  Funciones de personalizacion
//
export const agregar_configuracion = async(idu, datos_configuracion, en_error, en_exito) => {
    const referencia_personalizacion = doc(db, 'configuraciones', idu)
    try{
        setDoc(referencia_personalizacion, datos_configuracion, {merge : true})
        en_exito()
    }catch(error){
        console.log('Error en datos guardado >>',error)
        en_error()
    }
}
export const recuperar_configuracion = async(idu) => {
    const referencia_personalizacion = doc(db, 'configuraciones', idu)
    return await getDoc(referencia_personalizacion)
}

export const subir_imagen = async (idu, nombre_imagen, archivo, elemento_imagen, en_carga, en_error, en_exito)=>{
    const referencia_imagen = ref(storage, `${idu}/${nombre_imagen}`)
    const tarea_subida = uploadBytesResumable(referencia_imagen, archivo)
    let id_notificacion = parseInt(Math.random()*1000).toString()

    
    tarea_subida.on('state_changed', 
      (snapshot) => {
        const progreso = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('La carga está en ' + progreso + '%');
        switch (snapshot.state) {
          case 'paused':
            console.log('La carga fue pausada');
            break;
        }
        en_carga(progreso,id_notificacion)

      }, 
      (error) => { en_error(error) }, 
      () => { getDownloadURL(tarea_subida.snapshot.ref).then((url) => { en_exito(url, nombre_imagen.toString(), elemento_imagen) }); }
    );
}