const INITIAL_STATE = {
  user: '',
  web3_provider: null,
}

export default function metaPay(state = INITIAL_STATE, action) {
  switch(action.type) {
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.result
      };
      break;
    case 'UPDATE_WEB3_PROVIDER':
      return {
        ...state,
        web3_provider: action.result
      }
      break;
    default:
      return state;
  }
}
