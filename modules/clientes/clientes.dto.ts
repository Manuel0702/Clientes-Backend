import { IsEmail, IsNotEmpty } from 'class-validator';

export class Cliente {
    _key: string

    @IsNotEmpty()
    telefono: string

    @IsNotEmpty()
    email: string

    @IsNotEmpty()
    direccion: string

    @IsNotEmpty()
    dni: string
    //o DNI??

    @IsNotEmpty()
    cuentaEstado: string

    @IsNotEmpty()
    compras: string

    @IsNotEmpty()
    presupuestos: string

}