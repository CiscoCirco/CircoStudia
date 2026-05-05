import BaseEntity from './BaseEntity';

export default class Carrera extends BaseEntity {
  public codCarrera: string;
  public nombre: string;

  protected mapItem(item: any): void {
    this.codCarrera = item.codigoCarrera || '';
    this.nombre = item.nombre || '';
  }

  public toListItem(): any {
    return {
      ...super.toListItem(),
      codigoCarrera: this.codCarrera,
      nombre: this.nombre
    };
  }
}
