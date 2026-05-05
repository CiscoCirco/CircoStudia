import BaseEntity from './BaseEntity';
import { Condicion } from '../utils/Constants';

export default class Estado extends BaseEntity {
  public estudianteId: number;
  public materiaId: number;
  public condicion: Condicion;

  protected mapItem(item: any): void {
    this.estudianteId = item.idEstudianteId || 0;
    this.materiaId = item.codMateriaId || (item.codMateria ? item.codMateria.ID || item.codMateria.Id : 0);
    this.condicion = item.condicion as Condicion;
  }

  public toListItem(): any {
    return {
      ...super.toListItem(),
      idEstudianteId: this.estudianteId,
      codMateriaId: this.materiaId,
      condicion: this.condicion
    };
  }
}
