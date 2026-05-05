import BaseEntity from './BaseEntity';

export default class Comision extends BaseEntity {
  public codComision: string;
  public descripcion: string;
  public diaSemana: string;
  public turno: string;

  protected mapItem(item: any): void {
    this.codComision = item.codComision || '';
    this.descripcion = item.descripcion || '';
    this.diaSemana = item.diaSemana || '';
    this.turno = item.turno || '';
  }

  public toListItem(): any {
    return {
      ...super.toListItem(),
      codComision: this.codComision,
      descripcion: this.descripcion,
      diaSemana: this.diaSemana,
      turno: this.turno
    };
  }
}
