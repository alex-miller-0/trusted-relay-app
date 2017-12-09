const INITIAL_STATE = {
  balances: [],
  searchToken: null,
  searchTokenBal: null,
  searchTokenName: null,
  searchTokenSymbol: null,
  localStore: {},
}

export default function balances(state = INITIAL_STATE, action) {
  switch(action.type) {
    case 'BALANCES':
      return {
        ...state,
        balances: action.result,
      };
      break;
    case 'SEARCH_TOKEN':
      return {
        ...state,
        searchToken: action.result,
      };
      break;
    case 'BAL_SEARCH_TOKEN':
      return {
        ...state,
        searchTokenBal: action.result,
      };
      break;
    case 'NAME_SEARCH_TOKEN':
      return {
        ...state,
        searchTokenName: action.result,
      };
      break;
    case 'SYMBOL_SEARCH_TOKEN':
      return {
        ...state,
        searchTokenSymbol: action.result,
      };
      break;
    case 'LOCAL_STORE':
      return {
        ...state,
        localStore: action.result,
      };
      break;
    default:
      return state;
  }
}
