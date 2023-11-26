class Gasto {
    constructor(id, precio) {
        this.id = id;
        this.precio = precio;
    }
}

class Participante {
    constructor(name) {
        this.name = name;
        this.gas = []; 
    }

    agregarGasto(gasto) {
        if (gasto instanceof Gasto) {
            this.gas.push(gasto);
        } else {
            console.error('Se esperaba un objeto del tipo gasto');
        }
    }
}

class GastosCompartidos{
    constructor(name, date){
        this.name = name;
        this.date = date;
        this.participantes = [];
    }

    agregarParticipante(participante){
        if(participante instanceof Participante){
            this.participantes.push(participante);
        }
        else{
            console.error('Se esperaba un objeto del tipo participante en GastosCompartidos');
        }
    }

    calculartTotal(){

    }

    generarSugerencias(){
        
    }
}

