const TOKENS_SOLD = 'TOKENS_SOLD';

const initialState = { /* initital state provided in frontEndMiddleware.js */ };

export default (state = initialState, action) => {
  if ( ! action) return state;
  switch (action.type) {
    case TOKENS_SOLD: {
      return {...state, ...action};
    }
    default:
      return state;
  }
}

export const purchased = (myval) => {
  return {
    type: TOKENS_SOLD
  };
}