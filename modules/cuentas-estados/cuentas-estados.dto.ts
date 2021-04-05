import { IsEmail, IsNotEmpty } from 'class-validator';

export class CuentaEstado {
    _key: string

    @IsNotEmpty()
    pago: number

    @IsNotEmpty()
    saldo: number

    @IsNotEmpty()
    formaPago: string

}