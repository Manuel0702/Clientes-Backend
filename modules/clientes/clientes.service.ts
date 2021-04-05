import { Inject, Injectable } from '@nestjs/common';
import { aql, Database } from 'arangojs';
import { DocumentCollection, EdgeCollection } from 'arangojs/collection';
import { Cliente } from './clientes.dto';

@Injectable()
export class ClientesService {
    clientes: DocumentCollection
    debugger: DocumentCollection
    cuentaEstado: DocumentCollection
    compras: DocumentCollection
    presupuestos: DocumentCollection
    clientes_cuentaEstado: EdgeCollection
    clientes_compras: EdgeCollection
    clientes_presupuestos: EdgeCollection

    constructor(
        @Inject("ARANGODB") private database: Database,
    ) {
        this.clientes = database.collection("Clientes")
        this.debugger = database.collection("Debugger")
        this.cuentaEstado = database.collection("CuentasEstados")
        this.compras = database.collection("Compras")
        this.presupuestos = database.collection("Presupuestos")
        this.clientes_cuentaEstado = database.collection("Clientes_CuentasEstados")
        this.clientes_compras = database.collection ("Clientes_Compras")
        this.clientes_presupuestos = database.collection("Clientes_Presupuestos")
    }

    async find() {
        const cursor = await this.database.query(aql`
            FOR e IN ${this.clientes}
            FILTER e.state == "ACTIVE"
            RETURN MERGE(e,{
                CuentasEstados: FIRST(FOR CuentasEstados IN OUTBOUND e ${this.clientes_cuentaEstado} RETURN CuentasEstados)
                Compras: FIRST(FOR Compras IN OUTBOUND e ${this.clientes_compras} RETURN Compras)
                Presupuestos: FIRST(FOR Presupuestos IN OUTBOUND e ${this.clientes_presupuestos} RETURN Presupuestos)
            })
        `)

        const result = await cursor.all()

        return result
    }

    async findByKey(key: string) {
        const cursor = await this.database.query(aql`
            FOR e IN ${this.clientes}
            FILTER e.state == "ACTIVE"
            FILTER e._key == ${key}
            RETURN MERGE(e,{
                CuentasEstados: FIRST(FOR CuentasEstados IN OUTBOUND e ${this.clientes_cuentaEstado} RETURN CuentasEstados)
                Compras: FIRST(FOR Compras IN OUTBOUND e ${this.clientes_compras} RETURN Compras)
                Presupuestos: FIRST(FOR Presupuestos IN OUTBOUND e ${this.clientes_presupuestos} RETURN Presupuestos)
            })
        `)

        const result = await cursor.next()

        return result || {}
    }

    async saveOrUpdate(data: Cliente) {
        //EDGE a CuentasEstados
        const cursorCuentaEstado = await this.database.query(aql`
            FOR e IN ${this.cuentaEstado}
            FILTER e.state == "ACTIVE"
            FILTER e.nombre == ${data.cuentaEstado}
            RETURN e
        `)
        const cuentaEstadoDocument = await cursorCuentaEstado.next()
        if (!cuentaEstadoDocument) return `No se encuentra la CuentaEstado ${data.cuentaEstado}`

        //EDGE a Compras
        const cursorCompras = await this.database.query(aql`
            FOR e IN ${this.compras}
            FILTER e.state == "ACTIVE"
            FILTER e.nombre == ${data.compras}
            RETURN e
        `)
        const comprasDocument = await cursorCompras.next()
        if (!comprasDocument) return `No se encuentra la Compras ${data.compras}`

        //EDGE a Presupuestos
        const cursorPresupuestos = await this.database.query(aql`
            FOR e IN ${this.presupuestos}
            FILTER e.state == "ACTIVE"
            FILTER e.nombre == ${data.presupuestos}
            RETURN e
        `)
        const presupuestosDocument = await cursorPresupuestos.next()
        if (!presupuestosDocument) return `No se encuentra la Presupuestos ${data.presupuestos}`

        data['state'] = "ACTIVE"
        const date = new Date(Date.now() - 1620 * 60 * 1000);
        data['dateCreated'] = date
        const cursor = await this.database.query(aql`
            INSERT  ${data} IN ${this.clientes}
            OPTIONS { overwrite: true }
            RETURN { new: NEW, old:OLD, type: OLD ? 'update' : 'insert' }
        `)
        const document = await cursor.next()
        document.old
            ? await this.debugger.save({ dateCreated: date, coll: "Clientes", doc: document.new._key, log: "Cliente updated", from: document.old, to: document.new })
            : await this.debugger.save({ dateCreated: date, coll: "Clientes", doc: document.new._key, log: "Cliente created" })
            //CREO RELACION EDGE
            //const edge = await this.clientes_cuentaEstado.save({ _key: `${document.new._key}-${cuentaEstadoDocument._key}`, _from: document.new._id, _to:cuentaEstadoDocument._id })            
            
            //POR QUE DA ERROR? NECESITO DECLARAR TRES CONEXIONES EDGE
            //const edge = await this.clientes_compras.save({ _key: `${document.new._key}-${comprasDocument._key}`, _from: document.new._id, _to:comprasDocument._id })
            //const edge = await this.clientes_presupuestos.save({ _key: `${document.new._key}-${presupuestosDocument._key}`, _from: document.new._id, _to:presupuestosDocument._id })

        return document.new
    }

    async deleteOne(key: string) {
        const cursor = await this.database.query(aql`
            FOR e IN ${this.clientes}
            FILTER e.state == "ACTIVE"
            FILTER e._key == ${key}
            RETURN e
        `)

        const result = await cursor.next()
        result['state'] = "DELETED"
        await this.clientes.save(result, { overwriteMode: "update" })
        await this.debugger.save({ coll: "Clientes", doc: key, log: "Cliente deleted" })
        return `${result._key} DOCUMENT WAS DELETED`
    }
}
