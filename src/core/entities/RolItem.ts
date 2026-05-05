import BaseEntity from './BaseEntity';

export default class RolItem extends BaseEntity {
  public nombreRol: string;

  protected mapItem(item: any): void {
    this.nombreRol = item.nombreRol || '';
  }

  public toListItem(): any {
    return {
      ...super.toListItem(),
      nombreRol: this.nombreRol
    };
  }
}
