
function checkSubmitInput(req, state) {
  return new Promise((resolve, reject) => {
    if (typeof req.amount != 'number') { return reject('Bad input: You did not enter a number for your amount.') }
    if (typeof req.token != 'string') { return reject('Bad input: Please check your token address.') }
    if (req.token.length != 42) { return reject('Bad input: Please confirm the token address.') }
    if (state.userBal < req.amount) { return reject('Balance is insufficient.')}

    resolve(true);
  })
}

export {
  checkSubmitInput,
}
