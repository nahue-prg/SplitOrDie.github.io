const URLBASE = "https://splitordie.ar/";

const codificarDatos = (participantes) => {
    // Convertir los datos a una cadena JSON
    let datosJSON = JSON.stringify(participantes);
  
    // Codificar los datos comprimidos en base64
    let datosCodificados = btoa(datosJSON);
  
    datosCodificados = encodeURIComponent(datosCodificados)
  
    console.log("Datos codificados");
    console.log(datosCodificados);
  
    return datosCodificados;
  };
  
  const decodificarDatos = (datosCodificados) => {
    // Decodificas la cadena para obtener el JSON original
    datosCodificados = decodeURIComponent(datosCodificados);
  
    // Decodificar los datos en base64
    datosCodificados = atob(datosCodificados);
  
    // Convertir los datos a un objeto JSON
    let datosJSON = JSON.parse(datosCodificados);
  
    // Puedes utilizar el objeto de datos según tus necesidades
    console.log("Datos decodificados");
    console.log(datosJSON);
  
    return datosJSON;
  };

  
const alertGrande = (titulo, contenido) => {
    alertify.alert().set({ 'startMaximized': true, 'message': contenido, 'title': titulo }).show();
  }
  
  const alertaEst = (titulo, mensaje) => {
    /*
     * @title {String or DOMElement} The dialog title.
     * @message {String or DOMElement} The dialog contents.
     *
     * alertify.alert(title, message);
     *
     */
    alertify.alert().set({ 'startMaximized': false, 'message': mensaje, 'title': titulo }).show();
  }
  
  const generarAlerta = (alerta) => {
    alertify.error(alerta);
  }
  
  const cartelExito = (mensaje) => {
    alertify.success(mensaje);
  }

  //Calcular por cada participante el monto adeudado o a cobrar
const calculatePayments = (participantsArray) => {
  const totalExpenses = participantsArray.reduce((sum, participant) => {
    // Calcular el total de gastos para cada participante
    const participantTotal = participant.gas.reduce(
      (total, expense) => total + expense.precio,
      0
    );
    return sum + participantTotal;
  }, 0);

  const numberOfParticipants = participantsArray.length;
  const averageExpense = totalExpenses / numberOfParticipants;

  // Calcular la deuda o el pago para cada participante
  const payments = participantsArray.map((participant) => {
    const participantTotal = participant.gas.reduce(
      (total, expense) => total + expense.precio,
      0
    );
    const debtPayment = averageExpense - participantTotal;
    return { customer: participant.name, amount: Math.round(debtPayment, 2) };
  });

  return payments;
};

const generarDetalle = (distribucion,participantes) => {
  const acordion = document.createElement("div");
  acordion.classList.add("container");
  acordion.classList.add("collapse");
  distribucion.forEach((result) => {
    //Encontrar al participante para cargar detalle de gastos
    let participante = participantes.find(participante => participante.name == result.customer);
    let tot = result.amount < 0 ? result.amount * -1 : result.amount;
    let detalle = document.createElement("details");
    detalle.innerHTML =
      `
    <summary>${result.customer} - ${(result.amount < 0 ? "Recibe " : "Paga ")} $${tot}</summary>
    <div class="details-wrapper">
      <div class="details-styling">        
        ${participante.gas.length > 0 ? participante.gas.map((gasto) => `<p> ${gasto.id} - $${gasto.precio}</p>`).join('') : "<p>Sin gastos.</p>"}
      </div>
    </div>
  `;
    acordion.appendChild(detalle);
  });

  return acordion;
}

const mostrarDetalle = () => {
  try {
    const detalles = document.querySelectorAll("details");

    // Obtener el último detalle
    const ultimoDetalle = detalles[detalles.length - 1];

    // Verificar si el último detalle tiene el atributo 'open'
    const ultimoTieneOpen = ultimoDetalle && ultimoDetalle.hasAttribute("open");

    detalles.forEach((detalle) => {
      if (ultimoTieneOpen) {
        // Si el último detalle tiene 'open', eliminamos el atributo en todos
        detalle.removeAttribute("open");
      } else {
        // Si el último detalle no tiene 'open', agregamos el atributo en todos
        detalle.setAttribute("open", "");
      }
    });
  } catch (err) {
    console.log("Ocurrió un error al mostrar detalle: " + err);
  }
};

const generarDescripciones = (distribucion) => {
  /*distibucion = [{customer: x ,amount: 1}]
  Si amount es negativo recibe, si es positivo paga
  */
  let deudores = [];
  let cobradores = [];
  let descripciones = [];

  distribucion.forEach((participante) => {
    //Si es 0 esta saldado
    if (participante.amount > 0) {
      deudores.push(participante)
    }
    else if (participante.amount < 0) {
      cobradores.push(participante)
    }
  });

  //por cada cobrador
  cobradores.forEach((cobrador) => {
    //por cada cobrador -- mientras sea negativo le deben
    if (cobrador.amount < 0) {
      deudores.forEach((deudor) => {
        if (deudor.amount > 0) {
          //Es mayor o igual el cobro que la deuda
          if (deudor.amount <= (cobrador.amount * -1)) {
            let valor = Math.round(deudor.amount, 2);
            if (valor > 0) {
              descripciones.push(`  <label class="guion descripcion"></label> ${deudor.customer} paga $${valor} a ${cobrador.customer}.`);
              cobrador.amount += deudor.amount;
              deudor.amount = 0;
            }
          }
          //Es mayor la deuda que el cobro
          else {
            let valor = Math.round(cobrador.amount * -1, 2);
            if (valor > 0) {
              descripciones.push(`  <label class="guion descripcion"></label> ${deudor.customer} paga $${valor} a ${cobrador.customer}.`);
              deudor.amount -= (cobrador.amount * -1);
              cobrador.amount = 0;
            }
          }
        }
      });
    }
  });

  const contenedor = document.createElement("div");
  contenedor.classList.add("descripciones-container");

  const lista = document.createElement("ul"); // Puedes usar también <ol> para una lista ordenada
  contenedor.appendChild(lista);
  const titulo = document.createElement("li");
  titulo.innerText = "Pasos para saldar deuda.";
  lista.appendChild(titulo);

  descripciones.forEach((descripcion) => {
    const elementoLista = document.createElement("li");
    const parrafo = document.createElement("p");
    parrafo.innerHTML = descripcion;

    elementoLista.appendChild(parrafo);
    lista.appendChild(elementoLista);
  });

  return contenedor;
}

// Función para consolidar la información y obtener un array único de participantes
function consolidarGastosCompartidos(gastosCompartidos) {
  const participantesConsolidadosMap = new Map();

  gastosCompartidos.forEach((gastosCompartido) => {
      gastosCompartido.participantes.forEach((participante) => {
          const nombre = participante.name;

          if (!participantesConsolidadosMap.has(nombre)) {
              participantesConsolidadosMap.set(nombre, { ...participante, gas: [] });
          }

          participantesConsolidadosMap.get(nombre).gas = participantesConsolidadosMap.get(nombre).gas.concat(participante.gas);
      });
  });

  return Array.from(participantesConsolidadosMap.values());
}
