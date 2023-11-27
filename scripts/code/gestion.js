const CUENTAS_HTML = document.querySelector("#gestion-cuentas");
let bksticks = ``;

const cargarCuentas = () =>{
  CUENTAS_HTML.innerHTML ="";
  let cuentas = Storage_obtenerCuentas();
  if(cuentas === null || cuentas.length <= 0){ 
    cuentasNull();
    return;
  }

  let ul = document.createElement("ul");
  cuentas.forEach( cuenta => {
    let li = document.createElement("li");
    li.innerHTML = `
      <p>- ${cuenta.name} | ${cuenta.date}</p>
      <button class='button red m-5' onclick='eliminarCuenta("${cuenta.name}", "${cuenta.date}")'><i class="fa-solid fa-trash"></i></button>
      <button class='button blue m-5' onclick='Storage_modificarCuenta("${cuenta.name}", "${cuenta.date}")'><i class="fa-regular fa-folder-open"></i></button>
    `;
    ul.appendChild(li);
  });
  CUENTAS_HTML.innerHTML = "<h3 style='margin-top:30px;margin-bottom:30px;font-weight:700;font-size:2rem;'>Gestión de cuentas  <i class='fa-solid fa-list-check'></i></h3>";
 CUENTAS_HTML.appendChild(ul);
}

const cuentasNull = () => {
  CUENTAS_HTML.innerHTML = "<h3 style='margin-top:30px;'>No hay cuentas guardadas..  <i class='fa-solid fa-box-open'></i></h3>";
}

const eliminarCuenta = (nombre, fecha) =>{
  Storage_eliminarCuentaPorID(nombre, fecha)
  cargarCuentas();
}

cargarCuentas();