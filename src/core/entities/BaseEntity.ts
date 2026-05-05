export default abstract class BaseEntity {
	constructor(item?: any) {
		if (item !== null && item !== undefined) {
			this.Id = item.Id;
			this.Titulo = item.Title || '';
			this.mapItem(item);
		}
	}

	protected abstract mapItem(item: any): void;

	public toListItem(): any {
		return {
			Id: this.Id,
			Title: this.Titulo
		};
	}

	public Id: number;
	public Titulo: string;
}
