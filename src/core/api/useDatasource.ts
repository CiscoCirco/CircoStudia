import { useReducer } from 'react';
import { BaseEntity } from '../entities';
import { createReducer } from '../utils';
import IDatasource from './IDatasource';

const ADD = 'ADD';
const EDIT = 'EDIT';
const DELETE = 'DELETE';
const GET_ALL = 'GET_ALL';
const LOAD = 'LOAD';
const ERROR = 'ERROR';
const GET_BY_ID = 'GET_BY_ID';

export interface IDatasourceState<TItem extends BaseEntity> {
  items: TItem[];
  item?: TItem;
  isLoading: boolean;
  error: boolean;
}

export type DatasourceHook<TItem extends BaseEntity> = [
  IDatasourceState<TItem>,
  () => Promise<void>,
  (item: TItem) => Promise<void>,
  (item: TItem) => Promise<void>,
  (itemId: number) => Promise<void>,
  (itemId: number) => Promise<void>
];

function useDatasource<TItem extends BaseEntity>(
  entityDatasource: IDatasource<TItem>
): DatasourceHook<TItem> {
  const datasourceReducer = createReducer<IDatasourceState<TItem>>({
    [LOAD]: (state) => ({ ...state, isLoading: true, error: false }),
    [ERROR]: (state) => ({ ...state, error: true, isLoading: false }),
    [ADD]: (state, action) => ({ items: [...state.items, action.payload], item: action.payload, isLoading: false, error: false }),
    [EDIT]: (state, action) => ({
      items: state.items.map(entity => entity.Id === action.payload.Id ? action.payload : entity),
      item: action.payload,
      isLoading: false,
      error: false
    }),
    [DELETE]: (state, action) => ({
      items: state.items.filter(entity => entity.Id !== action.payload),
      isLoading: false,
      error: false
    }),
    [GET_ALL]: (state, action) => ({ ...state, items: action.payload, isLoading: false, error: false }),
    [GET_BY_ID]: (state, action) => ({ ...state, item: action.payload, isLoading: false, error: false })
  });

  const [datasourceState, dispatch] = useReducer(datasourceReducer, { items: [], isLoading: false, error: false });

  const handleAsync = (asyncFn: (...args: any[]) => Promise<void>) => (
    async (...args: any[]) => {
      try {
        await asyncFn(...args);
      } catch (error) {
        console.error(error);
        dispatch({ type: ERROR });
      }
    }
  );

  const getItems = handleAsync(async () => {
    dispatch({ type: LOAD });
    const itemsResult = await entityDatasource.getItems();
    dispatch({ type: GET_ALL, payload: itemsResult });
  });

  const addItem = handleAsync(async (item: TItem) => {
    dispatch({ type: LOAD });
    const itemResult = await entityDatasource.add(item);
    dispatch({ type: ADD, payload: itemResult });
  });

  const editItem = handleAsync(async (item: TItem) => {
    dispatch({ type: LOAD });
    const itemResult = await entityDatasource.edit(item);
    dispatch({ type: EDIT, payload: itemResult });
  });

  const deleteItem = handleAsync(async (itemId: number) => {
    dispatch({ type: LOAD });
    await entityDatasource.delete(itemId);
    dispatch({ type: DELETE, payload: itemId });
  });

  const getById = handleAsync(async (itemId: number) => {
    dispatch({ type: LOAD });
    const item = await entityDatasource.getById(itemId);
    dispatch({ type: GET_BY_ID, payload: item });
  });

  return [datasourceState, getItems, addItem, editItem, deleteItem, getById];
}

export default useDatasource;
