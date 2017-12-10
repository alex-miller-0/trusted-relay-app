const INITIAL_STATE = {
  allowance: null,
  decimals: null,
  depositAmount: 0,
  depositToken: null,
  destination: 101,
  user: null,
  userBal: null,
  web3Provider: null,
  currentNetwork: {},
  destinationId: null,
  destinations: [],
  input: false,    // Input has been checked
  currentToken: null,
  exceedsBal: false,
}

export default function relayer(state = INITIAL_STATE, action) {
  switch(action.type) {
    case 'ALLOWANCE':
      return {
        ...state,
        allowance: action.result,
      }
      break;
    case 'CURRENT_NETWORK':
      return {
        ...state,
        currentNetwork: action.result
      };
      break;
    case 'DECIMALS':
      return {
        ...state,
        decimals: action.result,
      }
      break;
    case 'DESTINATION_NETWORKS':
      return {
        ...state,
        destinations: action.result
      };
      break;
    case 'EXCEEDS_BAL':
      return {
        ...state,
        exceedsBal: action.result,
      };
      break;
    case 'INPUT_CHECK':
      return {
        ...state,
        input: action.result,
      }
      break;
    case 'UPDATE_CURRENT_TOKEN':
      return {
        ...state,
        currentToken: action.result,
      }
    case 'UPDATE_DEPOSIT_AMOUNT':
      return {
        ...state,
        depositAmount: action.result
      };
      break;
    case 'UPDATE_DEPOSIT_TOKEN':
      return {
        ...state,
        depositToken: action.result
      };
      break;
    case 'UPDATE_DESTINATION_ID':
      return {
        ...state,
        destinationId: action.result
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
        web3Provider: action.result
      };
      break;
    default:
      return state;
  }
}
