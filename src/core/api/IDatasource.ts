import { BaseEntity } from "../entities";

export default interface IDatasource<TItem extends BaseEntity> {
  listTitle: string;
  getItems(): Promise<TItem[]>;
  add(item: TItem): Promise<TItem>;
  edit(item: TItem): Promise<TItem>;
  delete(itemId: number): Promise<void>;
  getById(itemId: number): Promise<TItem>;
}
