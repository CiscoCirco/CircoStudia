export default class User {
    public ID: number;
    public Email: string;
    public Title: string;

    constructor(item?: any) {
        if (item !== null && item !== undefined) {
            this.ID = item.ID || item.Id;
            this.Email = item.Email || item.EMail || '';
            this.Title = item.Title || '';
        }
    }
}
