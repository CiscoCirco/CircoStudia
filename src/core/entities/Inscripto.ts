import BaseEntity from './BaseEntity';

export default class Inscripto extends BaseEntity {
  public estudianteId: number;
  public carreraId: number;

  protected mapItem(item: any): void {
    this.estudianteId = item.idEstudianteId || (item.idEstudiante ? item.idEstudiante.Id : 0);
    this.carreraId = item.idCarreraId || (item.idCarrera ? item.idCarrera.Id : 0);
  }

  public toListItem(): any {
    return {
      ...super.toListItem(),
      idEstudianteId: this.estudianteId,
      idCarreraId: this.carreraId
    };
  }
}
