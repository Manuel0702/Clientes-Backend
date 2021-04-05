import { Inject, Injectable } from '@nestjs/common';
import { aql, Database } from 'arangojs';
import { DocumentCollection, EdgeCollection } from 'arangojs/collection';
import { CuentaEstado } from './cuentas-estados.dto';

@Injectable()
export class CuentasEstadosService {
    cuentaEstado: DocumentCollection
    debugger: DocumentCollection

    constructor(
        @Inject("ARANGODB") private database: Database,
    ) {
        this.cuentaEstado = database.collection("CuentasEstados")
        this.debugger = database.collection("Debugger")
    }

    async find() {
        const cursor = await this.database.query(aql`
            FOR e IN ${this.cuentaEstado}
            FILTER e.state == "ACTIVE"
            RETURN e
        `)

        const result = await cursor.all()

        return result
    }

    async findByKey(key: string) {
        const cursor = await this.database.query(aql`
            FOR e IN ${this.cuentaEstado}
            FILTER e.state == "ACTIVE"
            FILTER e._key == ${key}
            RETURN e
        `)

        const result = await cursor.next()

        return result || {}
    }

    async saveOrUpdate(data: CuentaEstado) {
        data['state'] = "ACTIVE"
        const date = new Date(Date.now() - 1620 * 60 * 1000);
        data['dateCreated'] = date
        const cursor = await this.database.query(aql`
            INSERT  ${data} IN ${this.cuentaEstado}
            OPTIONS { overwrite: true }
            RETURN { new: NEW, old:OLD, type: OLD ? 'update' : 'insert' }
        `)
        const document = await cursor.next()
        document.old
            ? await this.debugger.save({ dateCreated: date, coll: "CuentasEstados", doc: document.new._key, log: "CuentaEstado updated", from: document.old, to: document.new })
            : await this.debugger.save({ dateCreated: date, coll: "CuentasEstados", doc: document.new._key, log: "CuentaEstado created" })
        return document.new
    }

    async deleteOne(key: string) {
        const cursor = await this.database.query(aql`
            FOR e IN ${this.cuentaEstado}
            FILTER e.state == "ACTIVE"
            FILTER e._key == ${key}
            RETURN e
        `)

        const result = await cursor.next()
        result['state'] = "DELETED"
        await this.cuentaEstado.save(result, { overwriteMode: "update" })
        await this.debugger.save({ coll: "CuentasEstados", doc: key, log: "CuentaEstado deleted" })
        return `${result._key} DOCUMENT WAS DELETED`
    }
}
