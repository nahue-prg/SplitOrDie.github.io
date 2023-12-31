const CUENTAS_HTML = document.querySelector("#gestion-cuentas");
let bksticks = ``;

const cargarCuentas = () => {
  CUENTAS_HTML.innerHTML = "";
  let cuentas = Storage_obtenerCuentas();
  if (cuentas === null || cuentas.length <= 0) {
    cuentasNull();
    return;
  }

  let ul = document.createElement("ul");
  cuentas.forEach(cuenta => {
    let li = document.createElement("li");
    li.innerHTML = `
    <div>
      <label>Cuenta</label><p>${cuenta.name}</p>
    </div>
    <div>
      <label>Fecha</label><p>${cuenta.date}</p>
    </div>
    <div class="gestion-cuentas-actions">
      <button class='button red m-5' onclick='eliminarCuenta("${cuenta.name}", "${cuenta.date}")'><i class="fa-solid fa-trash"></i></button>
      <button class='button blue m-5' onclick='Storage_modificarCuenta("${cuenta.name}", "${cuenta.date}")'><i class="fa-solid fa-file-pen"></i></button>
    </div>
    `;
    ul.appendChild(li);
  });

  let li = document.createElement("li");
  li.innerHTML = `
  <div>
    <button class='button blue' onclick='calcularTodo()'>Generar calculo total <i class="fa-solid fa-calculator"></i></button>
  </div>
  `;
  ul.appendChild(li);

  CUENTAS_HTML.appendChild(ul);
}

const cuentasNull = () => {
  CUENTAS_HTML.innerHTML = "<h3 style='margin-top:30px;'>No hay cuentas guardadas <i class='fa-solid fa-box-open'></i></h3>";
}

const eliminarCuenta = (nombre, fecha) => {
  alertify.confirm("Eliminar Cuenta", '¿Estas seguro de que deseas eliminar esta cuenta? Presiona "Ok" para continuar',
    () => {
      Storage_eliminarCuentaPorID(nombre, fecha);
      cargarCuentas();
    }
    , () => { return; });
}

const calcularTodo = () => {
  let cuentas = Storage_obtenerCuentas();
  const contenedor = document.createElement("div");
  contenedor.classList.add("container-detail");

  //Boton para abrir o cerrar detalle de la cuenta
  const button = document.createElement("button");
  button.classList.add("button");
  button.classList.add("blue-2");
  button.innerHTML = "Desplegar detalle <i class='fa-solid fa-list'></i>";
  button.addEventListener("click", () => mostrarDetalle());

  const contenedorCuentas = document.createElement("div");
  contenedorCuentas.classList.add("container-counts");
  let distribuciones = [];
  //calcular individualmente cada cuenta
  cuentas.forEach((cuenta) => {
    //cuenta.participantes  = [ customer: nombreIdentificador, amount: total ]  -- negativo cobra, positivo paga
    const containerCuenta = document.createElement("div");
    containerCuenta.setAttribute("style","margin-bottom:30px;")
    containerCuenta.innerHTML = `<div><h3 style="font-weight:700;color:#7841e6">Cuenta: ${cuenta.name}</h3><h3 style="font-weight:700;color:#7841e6">Fecha: ${cuenta.date}</h3></div>`
    let distribucion = calculatePayments(cuenta.participantes);
    // Realizar una copia profunda de distribucion
    let copiaDistribucion = JSON.parse(JSON.stringify(distribucion));

    distribuciones.push(copiaDistribucion);
    let acordionDetalle = generarDetalle(distribucion,cuenta.participantes);
    let descripciones = generarDescripciones(distribucion);

    containerCuenta.appendChild(descripciones);
    containerCuenta.appendChild(acordionDetalle);
    ///se agrega total gastado y monto gastado promedio 2022-12-31
    let contenedorTotal = document.createElement("ul");
    let totalGastado = cuenta.participantes.reduce((totalParticipante, participante) => parseFloat(totalParticipante + participante.gas.reduce((totalGastos, gasto) => parseFloat(totalGastos + gasto.precio),0 )),0);
    let totalPorParticipante = parseFloat( totalGastado / parseFloat(cuenta.participantes.length));
    contenedorTotal.id = "contenedor-totales";
    contenedorTotal.innerHTML = `
      <li>
        <label class="guion descripcion"></label> Total gastado: $${ Math.round(totalGastado,2)}.
      </li>
      <li>
        <label class="guion descripcion"></label> Total por participante: $${Math.round(totalPorParticipante,2)}.
      </li>
    `;
    containerCuenta.appendChild(contenedorTotal);
    ///termina agregado 2022-12-31

    contenedorCuentas.appendChild(containerCuenta);
  });

  //calcular la cuenta total 
  const containerCuenta = document.createElement("div");
  //total de todas las cuentas..
  let participantesAmount = [];

  distribuciones.forEach((dist) => {
    dist.forEach((participante) => {
      const { customer, amount } = participante;

      // Buscar si el participante ya está en participantesAmount
      const participanteExistente = participantesAmount.find((p) => p.customer === customer);

      if (participanteExistente) {
        // Si el participante ya existe, sumar el amount
        participanteExistente.amount += amount;
      } else {
        // Si el participante no existe, agregarlo a participantesAmount
        participantesAmount.push({ customer, amount });
      }
    });
  });

  let participantesConsolidados = consolidarGastosCompartidos(cuentas);

  //let distribucion = calculatePayments(participantesAmount);
  let acordionDetalle = generarDetalle(participantesAmount, participantesConsolidados);
  let descripciones = generarDescripciones(participantesAmount);

  containerCuenta.appendChild(descripciones);
  containerCuenta.appendChild(button);
  containerCuenta.appendChild(acordionDetalle);
  contenedor.appendChild(containerCuenta);
  contenedor.appendChild(contenedorCuentas);
  const script = document.createElement("script");
  script.src = "../scripts/code/accordion.js"
  contenedor.appendChild(script);
  alertGrande("Resultado", contenedor);
  setTimeout(() => mostrarDetalle(), 300);
}

cargarCuentas();