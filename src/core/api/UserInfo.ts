import { ISiteGroupInfo, ISiteUserProps } from "@pnp/sp/presets/all";
import { SPFI } from "@pnp/sp";
import { getSP } from '../pnp/sp/pnpjs-presets';

export default class UserInfo {
  private _sp: SPFI;

  constructor() {
    this._sp = getSP();
  }

  public getLoggedUser(): Promise<any> {
    return new Promise((resolve) => {
      this._sp.web.currentUser().then((response) => {
        resolve(response);
      }).catch((err) => resolve(err));
    });
  }

  public getUserGroupsByUserId(id: number): Promise<ISiteGroupInfo[]> {
    return new Promise((resolve) => {
      this._sp.web.siteUsers.getById(id).groups().then((response) => {
        resolve(response);
      }).catch((err) => resolve(err));
    });
  }

  public async checkCurrentUserInGroup(groupName: string): Promise<boolean> {
    const groups = await this._sp.web.currentUser.groups();
    return groups.some(g => g.Title === groupName);
  }

  public getUsersFromGroup(groupName: string): Promise<ISiteUserProps[]> {
    return new Promise((resolve, reject) => {
      this._sp.web.siteGroups.getByName(groupName).users()
        .then((response) => resolve(response))
        .catch((err) => reject(err));
    });
  }

  public async getUserById(id: number): Promise<ISiteUserProps> {
    return new Promise((resolve) => {
      this._sp.web.siteUsers.getById(id)()
        .then((response) => resolve(response))
        .catch((err) => resolve(err));
    });
  }
}
