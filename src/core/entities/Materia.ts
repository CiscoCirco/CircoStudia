import BaseEntity from './BaseEntity';

export default class Materia extends BaseEntity {
  public codMateria: string;
  public nombre: string;
  public anio: number;

  protected mapItem(item: any): void {
    this.codMateria = item.codMateria || '';
    this.nombre = item.nombre || '';
    this.anio = item.anio || 0;
  }

  public toListItem(): any {
    return {
      ...super.toListItem(),
      codMateria: this.codMateria,
      nombre: this.nombre,
      anio: this.anio
    };
  }
}
