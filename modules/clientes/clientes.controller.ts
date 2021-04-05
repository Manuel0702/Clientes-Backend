import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { Cliente } from './clientes.dto';
import { ClientesService } from './clientes.service';

@Controller('clientes')
export class ClientesController {
    constructor(private service: ClientesService) { }

    @Get()
    get() {
        return this.service.find()
    }

    @Get("/:id")
    getOne(@Param("id") id) {
        return this.service.findByKey(id)
    }

    @Post()
    post(@Body() data: Cliente) {
        return this.service.saveOrUpdate(data)
    }

    @Delete("/:id")
    deleteOne(@Param("id") id) {
        return this.service.deleteOne(id)
    }
}
