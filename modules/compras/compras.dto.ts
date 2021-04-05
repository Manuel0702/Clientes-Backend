import { IsEmail, IsNotEmpty } from 'class-validator';

export class Compra {
    _key: string

    @IsNotEmpty()
    compra_proveedor: string

    //FALTA en este modulo
    //Articulo (Poder seleccionar articulo)

}