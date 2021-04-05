import { Inject, Injectable } from '@nestjs/common';
import { aql, Database } from 'arangojs';
import { DocumentCollection, EdgeCollection } from 'arangojs/collection';
import { Compra } from './compras.dto';

@Injectable()
export class ComprasService {
    compras: DocumentCollection
    debugger: DocumentCollection
    proveedor: DocumentCollection
    compra_proveedor: EdgeCollection

    //FALTA en este modulo
    //Articulo (Poder seleccionar articulo)

    constructor(
        @Inject("ARANGODB") private database: Database,
    ) {
        this.compras = database.collection("Compras")
        this.debugger = database.collection("Debugger")
        this.proveedor = database.collection("Proveedores")
        this.compra_proveedor = database.collection("Compras_Proveedores")
    }

    async find() {
        const cursor = await this.database.query(aql`
            FOR e IN ${this.compras}
            FILTER e.state == "ACTIVE"
            RETURN MERGE(e,{
                Proveedores: FIRST(FOR Proveedores IN OUTBOUND e ${this.compra_proveedor} RETURN Proveedores)
            })
        `)

        const result = await cursor.all()

        return result
    }

    async findByKey(key: string) {
        const cursor = await this.database.query(aql`
            FOR e IN ${this.compras}
            FILTER e.state == "ACTIVE"
            FILTER e._key == ${key}
            RETURN MERGE(e,{
                Proveedores: FIRST(FOR Proveedores IN OUTBOUND e ${this.compra_proveedor} RETURN Proveedores)
            })
        `)

        const result = await cursor.next()

        return result || {}
    }

    async saveOrUpdate(data: Compra) {
        //EDGE a Proveedores
        const cursorCompraProveedor = await this.database.query(aql`
            FOR e IN ${this.compra_proveedor}
            FILTER e.state == "ACTIVE"
            FILTER e.nombre == ${data.compra_proveedor}
            RETURN e
        `)
        const proveedoresDocument = await cursorCompraProveedor.next()
        if (!proveedoresDocument) return `No se encuentra la CuentaEstado ${data.compra_proveedor}`

        data['state'] = "ACTIVE"
        const date = new Date(Date.now() - 1620 * 60 * 1000);
        data['dateCreated'] = date
        const cursor = await this.database.query(aql`
            INSERT  ${data} IN ${this.compras}
            OPTIONS { overwrite: true }
            RETURN { new: NEW, old:OLD, type: OLD ? 'update' : 'insert' }
        `)
        const document = await cursor.next()
        document.old
            ? await this.debugger.save({ dateCreated: date, coll: "Compras", doc: document.new._key, log: "Compra updated", from: document.old, to: document.new })
            : await this.debugger.save({ dateCreated: date, coll: "Compras", doc: document.new._key, log: "Compra created" })
            //CREO RELACION EDGE
            const edge = await this.compra_proveedor.save({ _key: `${document.new._key}-${proveedoresDocument._key}`, _from: document.new._id, _to:proveedoresDocument._id })            

        return document.new
    }

    async deleteOne(key: string) {
        const cursor = await this.database.query(aql`
            FOR e IN ${this.compras}
            FILTER e.state == "ACTIVE"
            FILTER e._key == ${key}
            RETURN e
        `)

        const result = await cursor.next()
        result['state'] = "DELETED"
        await this.compras.save(result, { overwriteMode: "update" })
        await this.debugger.save({ coll: "Compras", doc: key, log: "Compra deleted" })
        return `${result._key} DOCUMENT WAS DELETED`
    }
}
