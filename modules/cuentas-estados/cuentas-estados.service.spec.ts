import { Test, TestingModule } from '@nestjs/testing';
import { CuentasEstadosService } from './cuentas-estados.service';

describe('CuentasEstadosService', () => {
  let service: CuentasEstadosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CuentasEstadosService],
    }).compile();

    service = module.get<CuentasEstadosService>(CuentasEstadosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
