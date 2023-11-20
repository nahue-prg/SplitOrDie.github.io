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
            console.error('Se esperaba un objeto del tipo gasto..');
        }
    }
}
