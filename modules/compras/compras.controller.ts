import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { Compra } from './compras.dto';
import { ComprasService } from './compras.service';

@Controller('compras')
export class ComprasController {
    constructor(private service: ComprasService) { }

    @Get()
    get() {
        return this.service.find()
    }

    @Get("/:id")
    getOne(@Param("id") id) {
        return this.service.findByKey(id)
    }

    @Post()
    post(@Body() data: Compra) {
        return this.service.saveOrUpdate(data)
    }

    @Delete("/:id")
    deleteOne(@Param("id") id) {
        return this.service.deleteOne(id)
    }
}
