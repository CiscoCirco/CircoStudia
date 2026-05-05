import BaseEntity from './BaseEntity';

export default class Estudiante extends BaseEntity {
  public emailPersonal: string;
  public preset: boolean;
  public usuarioId: number;
  public usuarioEmail: string;
  public usuarioNombre: string;

  protected mapItem(item: any): void {
    this.emailPersonal = item.emailPersonal || '';
    this.preset = item.preset || false;
    this.usuarioId = item.usuario ? item.usuario.Id : 0;
    this.usuarioEmail = item.usuario ? (item.usuario.EMail || '') : '';
    this.usuarioNombre = item.usuario ? (item.usuario.Title || '') : '';
  }

  public toListItem(): any {
    return {
      ...super.toListItem(),
      emailPersonal: this.emailPersonal,
      preset: this.preset
    };
  }
}
