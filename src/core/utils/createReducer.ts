type ActionHandler<TState> = (state: TState, action: { type: string; payload?: any }) => TState;

export function createReducer<TState>(actionMap: Record<string, ActionHandler<TState>>) {
  return (state: TState, action: { type: string; payload?: any }): TState => {
    const handler = actionMap[action.type];
    return handler ? handler(state, action) : state;
  };
}
