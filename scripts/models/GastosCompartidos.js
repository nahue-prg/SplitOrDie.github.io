class GastosCompartidos{
    constructor(name, date, participantes){
        this.name = name;
        this.date = date;
        this.participantes = [];
        this.participantes = participantes || [];
    }

    agregarParticipante(participante){
            this.participantes.push(participante);
    }
}
