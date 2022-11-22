import {nueva_solicitud} from './firebase.js'

// 
//  Comportamiento animado del campo ID Único
//
// Intercambia el atributo 'ocultar' en la etiqueta con el ícono de ojo de forma
// que se ejecute o no, la animación que ayuda a resaltar el campo para que sea
// visualizado el identificador
const id_visualizar = document.getElementById('id_visualizar')
const id_unico = document.getElementById('id_unico')

id_visualizar.addEventListener('click', ()=> {
    if(id_unico.getAttribute('generado') != null){
        console.log('Se dio click')
        id_visualizar.toggleAttribute('ocultar')
    }
})

//
//  Manejo de notificaciones pop-up
//
const retardo_notificacion = 8000
const lista_notificaciones = document.getElementById('lista_notificaciones')
const codigo_exito =
    `<i class="fa-solid fa-check" exito></i>
    <span>La solicitud se recibió exitosamente</span>
    <p>Visualiza tu identificador único pulsando en el icono con el ojo</p>`
const codigo_advertencia = 
    `<i class="fa-solid fa-triangle-exclamation" advertencia></i>
    <span>Ocurrión un error tratando de registrar la solicitud</span>
    <p>Porfavor intenta de nuevo el envío o comunícate con nosotros</p>`
function mostrar_notificacion(exito) {
    // Creación de la notificación
    let nueva_notificacion = document.createElement('div')
    nueva_notificacion.classList.add('notificacion')
    nueva_notificacion.innerHTML = exito ? codigo_exito : codigo_advertencia
    // Se añade y muestra la notificación
    lista_notificaciones.appendChild(nueva_notificacion)
    setTimeout(()=>{lista_notificaciones.removeChild(nueva_notificacion)},retardo_notificacion)
}


//
//  Eventos del formulario
//
const formulario = document.getElementById('formulario')
let nivel_recursion = 0
formulario.addEventListener('submit', (e)=>{
    e.preventDefault()
    registrar_nueva_solicitud()
    nivel_recursion = 0
})
async function registrar_nueva_solicitud() {
    nivel_recursion += 1

    // Datos generales
    const representante = formulario['nombre-representante']
    const empresa = formulario['nombre-empresa']
    const giro = formulario['giro-empresa']
    const actividades = formulario['actividades-empresa']
    // Datos contacto
    const correo = formulario['correo']
    const celular = formulario['celular']
    const telefono = formulario['telefono']

    const nuevo_id = generar_id(empresa.value)

    try{
        let promesa_documento = await nueva_solicitud(
            nuevo_id,
            representante.value,
            empresa.value,
            giro.value,
            actividades.value,
            correo.value,
            celular.value,
            telefono.value
        )
        
        id_unico.setAttribute('value', nuevo_id)
        id_unico.setAttribute('generado','')
        id_visualizar.setAttribute('ocultar', '')
        mostrar_notificacion(true)
        formulario.reset()
    }catch(error){
        console.log('Error en envío de solicitud >> ' + error)

        if(nivel_recursion == 2){
            // Se intenta realizar el envío una vez más
            if(registrar_nueva_solicitud()) return true
        }

        mostrar_notificacion(false)
        return false
    }

    return true
}
/* Se pasa a minúsculas el correo */
const correo = document.getElementById('correo')
correo.addEventListener('input', ()=>{
    if(correo.value) correo.value = correo.value.toLowerCase()
})


/* Solo se permiten números */
const celular = document.getElementById('celular')
const telefono = document.getElementById('telefono')
celular.addEventListener('input',()=>{ permitir_numeros(celular) })
telefono.addEventListener('input',()=>{ permitir_numeros(telefono) })

function permitir_numeros(elemento, lista_ignorados = ['-',' ']) {
    if(elemento.value){
        const valor_original = elemento.value.toString()
        let valor = elemento.value
        lista_ignorados.forEach((simbolo)=>{ valor = valor.replace(RegExp(simbolo,'g'),'') })

        elemento.value = isNaN(valor) ? valor_original.substring(0,valor_original.length - 1) : elemento.value
    }
}


const siguiente = document.getElementById('siguiente')
siguiente.addEventListener('click',()=>{
    if(id_unico.value != '' || id_unico != null)
        window.location.replace('https://kanacooperativa.com.mx/landing_page/personalizar.html?idu=' + id_unico.value.toString()) 
})

//
//  Funciones auxiliares
//
const stop_words = [" A "," CON "," DA"," DE "," DEL "," E "," EL "," EN "," HA "," HE "," I "," LA "," LAS "," LE "," LO "," LOS "," ME "," NI "," O "," QEU "," SE "," SI "," SIN "," SINO "," SON "," SU "," SUS "," SÉ "," SÍ "," T "," TAL "," TAN "," TE "," TI "," TUS "," U "," UN "," UNA "," UNAS "," UNO "," UNOS "," ÉL "]
const EXTENSION_ID = 6
function obtener_iniciales(cadena) {
    return cadena
        .split(' ')
        .map(word => word[0])
        .join()
        .replace(/,/g,'')
}
function generar_id(nombre_empresa) {
    let nuevo_id = ' ' + nombre_empresa.toUpperCase() + ' '
    // Se eliminan clases gramaticales
    stop_words.forEach((palabra)=>{ nuevo_id = nuevo_id.replace(RegExp(palabra,'g')," ") })
    // Remueven los espacios de inicio y final
    nuevo_id = nuevo_id.trim()
    // Se recuperan las iniciales
    nuevo_id = obtener_iniciales(nuevo_id)
    // Se acorta si son demasiadas iniciales
    if(nuevo_id.length > 3)
        nuevo_id = nuevo_id.substring(0,3)
    // Se crea la cadena numérica
    let cadena_numerica = ''
    for(let i=0; i<(EXTENSION_ID - nuevo_id.length); i++) cadena_numerica += Math.floor(Math.random()*10).toString()

    return `${nuevo_id}-${cadena_numerica}`
}