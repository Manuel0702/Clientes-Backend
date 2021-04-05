import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CuentaEstado } from './cuentas-estados.dto';
import { CuentasEstadosService } from './cuentas-estados.service';

@Controller('cuentasEstados')
export class CuentasEstadosController {
    constructor(private service: CuentasEstadosService) { }

    @Get()
    get() {
        return this.service.find()
    }

    @Get("/:id")
    getOne(@Param("id") id) {
        return this.service.findByKey(id)
    }

    @Post()
    post(@Body() data: CuentaEstado) {
        return this.service.saveOrUpdate(data)
    }

    @Delete("/:id")
    deleteOne(@Param("id") id) {
        return this.service.deleteOne(id)
    }
}
