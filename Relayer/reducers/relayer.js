const INITIAL_STATE = {
  deposit_amount: 0,
  deposit_token: null,
  destination: 101,
  user: '',
  userBal: null,
  web3_provider: null,
  currentNetwork: {},
  destinations: [],
}

export default function relayer(state = INITIAL_STATE, action) {
  switch(action.type) {
    case 'CURRENT_NETWORK':
      return {
        ...state,
        currentNetwork: action.result
      };
      break;
    case 'DESTINATION_NETWORKS':
      return {
        ...state,
        destinations: action.result
      };
      break;
    case 'UPDATE_DEPOSIT_AMOUNT':
      return {
        ...state,
        deposit_amount: action.result
      };
      break;
    case 'UPDATE_DEPOSIT_TOKEN':
      return {
        ...state,
        deposit_token: action.result
      };
      break;
    case 'UPDATE_DESTINATION_ID':
      return {
        ...state,
        destination: action.result
      };
      break;
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.result
      };
      break;
    case 'UPDATE_USER_BAL':
      return {
        ...state,
        userBal: action.result,
      }
      break;
    case 'UPDATE_WEB3_PROVIDER':
      return {
        ...state,
        web3_provider: action.result
      };
      break;
    default:
      return state;
  }
}
