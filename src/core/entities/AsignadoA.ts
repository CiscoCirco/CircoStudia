import BaseEntity from './BaseEntity';

export default class AsignadoA extends BaseEntity {
  public estudianteId: number;
  public rolId: number;
  public nombreRol: string;

  protected mapItem(item: any): void {
    this.estudianteId = item.idEstudianteId || (item.idEstudiante ? item.idEstudiante.Id : 0);
    this.rolId = item.idRolId || (item.idRol ? item.idRol.Id : 0);
    this.nombreRol = item.idRol ? (item.idRol.nombreRol || '') : '';
  }

  public toListItem(): any {
    return {
      ...super.toListItem(),
      idEstudianteId: this.estudianteId,
      idRolId: this.rolId
    };
  }
}
