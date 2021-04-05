import { Test, TestingModule } from '@nestjs/testing';
import { CuentasEstadosController } from './cuentas-estados.controller';

describe('CuentasEstadosController', () => {
  let controller: CuentasEstadosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CuentasEstadosController],
    }).compile();

    controller = module.get<CuentasEstadosController>(CuentasEstadosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
