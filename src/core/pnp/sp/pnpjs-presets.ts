import { WebPartContext } from "@microsoft/sp-webpart-base";
import { spfi, SPFI, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/lists/web";
import "@pnp/sp/files/web";
import "@pnp/sp/items";
import "@pnp/sp/items/types";
import "@pnp/sp/fields";
import "@pnp/sp/batching";
import "@pnp/sp/site-groups";
import "@pnp/sp/site-groups/web";
import "@pnp/sp/site-users";
import "@pnp/sp/site-users/web";
import "@pnp/sp/attachments";
import "@pnp/sp/sputilities";
import "@pnp/sp/security";

let _sp: SPFI;

export const getSP = (context?: WebPartContext): SPFI => {
  if (context !== null && context !== undefined) {
    _sp = spfi().using(SPFx(context));
  }
  return _sp;
};
