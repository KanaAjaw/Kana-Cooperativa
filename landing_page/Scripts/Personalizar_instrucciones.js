import { recuperar_identificador_unico,redirigir_con_idu } from "./Herramientas.js"

const siguiente = document.getElementById('siguiente')
siguiente.addEventListener('click',()=>{ 
    redirigir_con_idu('personalizar.html',recuperar_identificador_unico())
 })