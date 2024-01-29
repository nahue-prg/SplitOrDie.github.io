class SeccionAcordion {
    constructor(cabecera = "", detalle = [] ){
        this.cabecera = cabecera;
        this.detalle = detalle;
    }
}

class Acordion {
    //recibe lista de SeccionAcordion
    constructor(listaSection = []) {
        this.seccionAcordionLista = listaSection
    }

    //retorna un div con el acordion listo.. 
    generarAcordion() {
        const divContenedor = document.createElement("div");
        //divContenedor.classList.add("container");
        divContenedor.classList.add("collapse");
        // divContenedor.classList.add("collapse-init");

        this.seccionAcordionLista.forEach((seccion) => {
            const details = document.createElement("details");
            const titulo = document.createElement("summary");
            titulo.innerHTML = `
                ${seccion.cabecera} 
                <button class="button-icono" onclick="editParticipante('${seccion.cabecera.split(" - $")[0]}')"><i class="fa-regular fa-pen-to-square"></i></button>
                <button class="button-icono" onclick="eliminarParticipanteCargado('${seccion.cabecera.split(" - $")[0]}')"><i class="fa-solid fa-trash"></i></button>
                ` ;
            details.appendChild(titulo);
            const containerDetalle = document.createElement("div");
            containerDetalle.classList.add("details-wrapper");
            containerDetalle.classList.add("detalle-gasto");

            seccion.detalle.forEach((detalle)=> {
                  const detalleC = document.createElement("div");
                  detalleC.classList.add("details-styling");
                  detalleC.innerHTML = `<p>${detalle}</p>`;
                  containerDetalle.appendChild(detalleC);
            });

            details.appendChild(containerDetalle);
            divContenedor.appendChild(details);
        });

        //establecer script acordion necesario para que funcione.. 
        const script = document.createElement("script");
        script.src = "scripts/code/accordion.js";
        divContenedor.appendChild(script);

        return divContenedor;
    }
}
