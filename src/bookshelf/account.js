class Account {
  data = {}
  update(address, amount) {
    if (!this.data[address]) {
      this.data[address] = 0
    }
    this.data[address] += amount
  }
  get(address) {
    return this.data[address]
  }
}

export default Account
