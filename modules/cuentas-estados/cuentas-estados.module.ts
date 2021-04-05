import { Module } from '@nestjs/common';
import { CuentasEstadosService } from './cuentas-estados.service';
import { CuentasEstadosController } from './cuentas-estados.controller';

@Module({
  providers: [CuentasEstadosService],
  controllers: [CuentasEstadosController]
})
export class CuentasEstadosModule {}
